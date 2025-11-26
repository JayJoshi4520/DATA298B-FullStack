import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, execFileSync } from "child_process";
import { TIMEOUTS, LIMITS, PATHS } from "./constants.js";
import { MemoryService } from "./memory/memoryService.js";
import { uploadDirectory } from "./storageService.js";

const PROJECT_DIR = "/home/coder/project/";

export class AgentService {
  constructor() {
    this.initialized = false;
    this.projectRoot = process.cwd();
    this.memory = new MemoryService();
    this.__dirname = path.dirname(fileURLToPath(import.meta.url));
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      console.log("🤖 Agent service ready (ADK mode)");
    }
  }

  /**
   * Stream ADK pipeline execution via SSE
   * @param {Response} res - Express response object
   * @param {string} task - The task to execute
   * @param {Object} options - Options including userId, sessionId, projectId
   * @returns {Function} Cleanup function
   */
  async runADKPipelineStream(res, task, options = {}) {
    let { userId, sessionId, projectId } = options || {};
    userId = userId || "adk-user";
    sessionId = sessionId || "adk-session";
    projectId = projectId || "adk-project";

    const scriptPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "adk_service.py"
    );

    const TARGET_DIR = PROJECT_DIR;

    // Save initial turn
    await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: task, assistantMsg: null, usage: null });
    const ctx = await this.memory.getChatContext({ userId, sessionId, projectId, query: task, limit: LIMITS.MAX_CONTEXT_MESSAGES });

    // Spawn Python process
    const proc = spawn("python3", [scriptPath, task], {
      env: {
        ...process.env,
        TARGET_FOLDER_PATH: TARGET_DIR,
        ADK_CONTEXT: JSON.stringify({ userId, sessionId, projectId, context: ctx })
      },
    });

    let buffer = "";
    let finalResult = null;

    proc.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      // Send progress events
      res.write(`event: progress\n`);
      res.write(`data: ${JSON.stringify({ message: chunk.toString() })}\n\n`);
    });

    let stderrBuffer = "";

    proc.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      console.error("ADK stderr:", text);

      // Add to buffer and process line by line
      stderrBuffer += text;
      const lines = stderrBuffer.split("\n");

      // Keep the last incomplete line in the buffer
      stderrBuffer = lines.pop() || "";

      // Process each complete line
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          // Try to parse as JSON
          const eventData = JSON.parse(trimmed);

          // If it has an 'event' field, forward it with that event type
          if (eventData.event) {
            const eventType = eventData.event;

            // Remove the 'event' field from data to avoid duplication
            const { event, ...data } = eventData;

            res.write(`event: ${eventType}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            console.log(`📤 Forwarded event: ${eventType}`, data);
          } else {
            // JSON but no event field, send as generic log
            res.write(`event: log\n`);
            res.write(`data: ${JSON.stringify({ level: "info", message: trimmed })}\n\n`);
          }
        } catch (parseError) {
          // Not JSON, send as plain log event
          res.write(`event: log\n`);
          res.write(`data: ${JSON.stringify({ level: "info", message: trimmed })}\n\n`);
        }
      }
    });

    proc.on("close", async (code) => {
      try {
        // MCP cleanup errors can cause non-zero exit codes, but pipeline may have succeeded
        // Log warning but don't fail immediately - check if we have valid results
        if (code !== 0 && code !== null) {
          console.warn(`⚠️ Python process exited with code ${code} (may be MCP cleanup error)`);
        }

        // Parse result - if buffer is empty or invalid, pipeline failed for real
        try {
          finalResult = JSON.parse(buffer);
          console.log('✅ Successfully parsed pipeline results');
        } catch (parseError) {
          console.error('❌ Failed to parse pipeline results:', parseError.message);
          // If we can't parse results, the pipeline definitely failed
          if (!buffer || buffer.trim() === '') {
            throw new Error(`Pipeline failed: no output received (exit code: ${code})`);
          }
          // Try to salvage partial results
          finalResult = [];
        }

        // NOTE: output.py execution moved to AFTER pipeline completes (see below)

        // Save artifacts
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const ARTIFACTS_ROOT = path.resolve(process.cwd(), PATHS.ARTIFACTS_DIR);
        fs.mkdirSync(ARTIFACTS_ROOT, { recursive: true });
        const projectDir = path.join(ARTIFACTS_ROOT, `adk-project-${timestamp}`);
        fs.mkdirSync(projectDir, { recursive: true });

        if (Array.isArray(finalResult)) {
          const fileNames = ["requirements.md", "solution.md", "validation.md"];
          finalResult.forEach((content, idx) => {
            const file = fileNames[idx] || `output-${idx}.txt`;
            fs.writeFileSync(path.join(projectDir, file), content, "utf8");
          });
        }

        // ============================================
        // EXECUTE PROJECT CREATION (Now at end of pipeline)
        // ============================================
        console.log('📦 Executing project creation...');
        try {
          const generatedScript = path.join(TARGET_DIR, "output.py");
          if (fs.existsSync(generatedScript)) {
            const execOut = execFileSync("python3", [generatedScript], {
              encoding: "utf8",
              timeout: TIMEOUTS.OUTPUT_EXECUTION,
            });
            console.log("output.py execution output:\n", execOut);
          } else {
            console.log('No output.py found, skipping project creation');
          }
        } catch (e) {
          console.error("Failed to execute output.py:", e.message);
          // Don't fail the whole pipeline if project creation fails
        }

        // ============================================
        // UPLOAD TO GOOGLE CLOUD STORAGE
        // ============================================
        let gcsUrl = null;
        try {
          console.log(`📤 Uploading project from ${TARGET_DIR} to GCS...`);
          const destinationPrefix = `projects/${projectId}/${timestamp}`;
          await uploadDirectory(TARGET_DIR, destinationPrefix);
          gcsUrl = `gs://${process.env.GCS_BUCKET_NAME || 'data298b-project-store'}/${destinationPrefix}`;
          console.log(`✅ Project uploaded to GCS: ${gcsUrl}`);
        } catch (uploadError) {
          console.error("❌ Failed to upload project to GCS:", uploadError);
          // Log the error but don't fail the pipeline
        }

        // ============================================
        // CLEANUP INTERMEDIATE FILES
        // ============================================
        try {
          const filesToCleanup = [
            path.join(TARGET_DIR, "output.py"),
          ];

          for (const file of filesToCleanup) {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
              console.log(`🧹 Cleaned up: ${path.basename(file)}`);
            }
          }
        } catch (cleanupError) {
          console.error("Cleanup warning:", cleanupError.message);
          // Don't fail pipeline for cleanup errors
        }

        // Log success
        await this.memory.saveToolRun({
          userId,
          sessionId,
          projectId,
          name: "adk_stream",
          input: { task },
          output: { projectPath: projectDir, outputs: finalResult, gcsUrl },
          success: true,
        });

        const assistantSummary = `ADK stream succeeded. Artifacts at ${projectDir}. Uploaded to ${gcsUrl || 'local only'}.`;
        await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: null, assistantMsg: assistantSummary, usage: null });

        if (projectId) {
          await this.memory.indexMemory({
            scope: "project",
            key: `adk-stream:${timestamp}`,
            text: `ADK stream completed. Artifacts at ${projectDir}. GCS: ${gcsUrl}. Task: ${task}`,
            meta: { files: Array.isArray(finalResult) ? finalResult.length : 0, gcsUrl },
          });
        }

        // Python script already emitted 'complete' event through stderr
        // Just close the response stream
        console.log('✅ ADK pipeline completed successfully');
        res.end();
      } catch (error) {
        console.error("ADK stream completion error:", error);

        // Log failure
        await this.memory.saveToolRun({
          userId,
          sessionId,
          projectId,
          name: "adk_stream",
          input: { task },
          output: { error: error.message },
          success: false,
        });

        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
      }
    });

    // Return cleanup function
    return () => {
      if (!proc.killed) {
        proc.kill();
      }
    };
  }

  // ============================================
  // Real Google ADK (Python Bridge Only)
  // ============================================
  async runADKPipeline(task, options = {}) {
    let { userId, sessionId, projectId } = options || {};
    userId = userId || "adk-user";
    sessionId = sessionId || "adk-session";
    projectId = projectId || "adk-project";
    const startTime = Date.now();
    const scriptPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "adk_service.py"
    );

    const TARGET_DIR = PROJECT_DIR;

    await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: task, assistantMsg: null, usage: null });
    const ctx = await this.memory.getChatContext({ userId, sessionId, projectId, query: task, limit: LIMITS.MAX_CONTEXT_MESSAGES });

    try {
      const output = execFileSync("python3", [scriptPath, task], {
        encoding: "utf8",
        timeout: TIMEOUTS.ADK_PIPELINE,
        env: {
          ...process.env,
          TARGET_FOLDER_PATH: TARGET_DIR,
          ADK_CONTEXT: JSON.stringify({ userId, sessionId, projectId, context: ctx })
        },
      });

      const endTime = Date.now();
      console.log(`ADK pipeline started at ${startTime}`);
      console.log(`ADK pipeline ended at ${endTime}`);
      console.log(`ADK pipeline took ${endTime - startTime} ms`);

      const result = JSON.parse(output);

      try {
        const generatedScript = path.join(TARGET_DIR, "output.py");
        if (fs.existsSync(generatedScript)) {
          const execOut = execFileSync("python3", [generatedScript], {
            encoding: "utf8",
            timeout: TIMEOUTS.OUTPUT_EXECUTION,
          });
          console.log("output.py execution output:\n", execOut);
        } else {
          console.warn("output.py not found at:", generatedScript);
        }
      } catch (e) {
        console.error("Failed to execute output.py:", e.message);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const ARTIFACTS_ROOT = path.resolve(process.cwd(), PATHS.ARTIFACTS_DIR);
      fs.mkdirSync(ARTIFACTS_ROOT, { recursive: true });
      const projectDir = path.join(
        ARTIFACTS_ROOT,
        `adk-project-${timestamp}`
      );
      fs.mkdirSync(projectDir, { recursive: true });

      if (Array.isArray(result)) {
        const fileNames = ["requirements.md", "solution.md", "validation.md"];
        result.forEach((content, idx) => {
          const file = fileNames[idx] || `output-${idx}.txt`;
          fs.writeFileSync(path.join(projectDir, file), content, "utf8");
        });
      }

      // Upload generated project to GCS
      let gcsUrl = null;
      try {
        console.log(`Uploading project from ${TARGET_DIR} to GCS...`);
        const destinationPrefix = `projects/${projectId}/${timestamp}`;
        await uploadDirectory(TARGET_DIR, destinationPrefix);
        gcsUrl = `gs://${process.env.GCS_BUCKET_NAME || 'avirit-projects'}/${destinationPrefix}`;
        console.log(`✅ Project uploaded to GCS: ${gcsUrl}`);
      } catch (uploadError) {
        console.error("Failed to upload project to GCS:", uploadError);
      }

      // Log the completed run
      await this.memory.saveToolRun({
        userId,
        sessionId,
        projectId,
        name: "adk_run",
        input: { task },
        output: { projectPath: projectDir, outputs: result, gcsUrl },
        success: true,
      });
      const assistantSummary = `ADK run succeeded. Artifacts at ${projectDir}. Uploaded to ${gcsUrl || 'local only'}. Outputs: ${Array.isArray(result) ? result.length : 0}`;
      await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: null, assistantMsg: assistantSummary, usage: null });
      if (projectId) {
        await this.memory.indexMemory({
          scope: "project",
          key: `adk:${timestamp}`,
          text: `ADK run completed. Artifacts at ${projectDir}. GCS: ${gcsUrl}. Task: ${task}`,
          meta: { files: Array.isArray(result) ? result.length : 0, gcsUrl },
        });
      }

      return { mode: "ADK", projectPath: projectDir, outputs: result, gcsUrl };
    } catch (err) {
      console.error("ADK execution failed:", err.message);
      // Log failure
      await this.memory.saveToolRun({
        userId,
        sessionId,
        projectId,
        name: "adk_run",
        input: { task },
        output: { error: err.message },
        success: false,
      });
      await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: null, assistantMsg: `ADK run failed: ${err.message}`, usage: null });
      // Index failed run for debugging
      if (projectId) {
        await this.memory.indexMemory({
          scope: "project",
          key: `adk-error:${new Date().toISOString()}`,
          text: `ADK non-stream run failed. Task: ${task}. Error: ${err.message}`,
          meta: { error: err.message, stack: err.stack },
        });
      }
      throw new Error("ADK execution failed: " + err.message);
    }
  }
}
