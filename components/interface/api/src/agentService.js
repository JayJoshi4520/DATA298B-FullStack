import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, execFileSync } from "child_process";
import { TIMEOUTS, LIMITS, PATHS } from "./constants.js";
import { MemoryService } from "./memory/memoryService.js";

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

  async runADKPipelineStream(res, task, options = {}) {
    let { userId, sessionId, projectId } = options || {};
    userId = userId || "adk-user";
    sessionId = sessionId || "adk-session";
    projectId = projectId || "adk-project";
    const startTime = Date.now();
    const scriptPath = path.join(this.__dirname, "adk_service.py");

    const TARGET_DIR = PROJECT_DIR;

    await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: task, assistantMsg: null, usage: null });
    const ctx = await this.memory.getChatContext({ userId, sessionId, projectId, query: task, limit: LIMITS.MAX_CONTEXT_MESSAGES });

    const child = spawn("python3", [scriptPath, task], {
      env: {
        ...process.env,
        TARGET_FOLDER_PATH: TARGET_DIR,
        ADK_CONTEXT: JSON.stringify({ userId, sessionId, projectId, context: ctx })
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const writeEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let stderrBuf = "";
    child.stderr.on("data", (chunk) => {
      stderrBuf += chunk.toString();
      let idx;
      while ((idx = stderrBuf.indexOf("\n")) !== -1) {
        const line = stderrBuf.slice(0, idx);
        stderrBuf = stderrBuf.slice(idx + 1);
        try {
          const evt = JSON.parse(line);
          if (evt && evt.event) {
            // Forward all event types from Python ADK
            writeEvent(evt.event, evt);
            console.log(`=================== ADK Event: ${evt.event} ===================`, evt);
          }
        } catch {
          // Non-JSON diagnostic lines. Forward as log.
          if (line.trim()) {
            writeEvent("log", { message: line.trim() });
            console.log(`=================== ADK Log: ${line.trim()} ===================`);
          }
        }
      }
    });

    let out = "";
    child.stdout.on("data", (d) => (out += d.toString()));

    child.on("close", async (code) => {
      try {
        const parsed = JSON.parse(out || "[]");
        writeEvent("complete", { code, outputs: parsed });
        // Log the completed run
        await this.memory.saveToolRun({
          userId,
          sessionId,
          projectId,
          name: "adk_run_stream",
          input: { task },
          output: { code, outputs: parsed },
          success: code === 0,
        });
        if (projectId) {
          await this.memory.indexMemory({
            scope: "project",
            key: `adk:${new Date().toISOString()}`,
            text: `ADK stream run completed (code=${code}). Task: ${task}`,
            meta: { outputsCount: Array.isArray(parsed) ? parsed.length : 0 },
          });
        }
      } catch (e) {
        writeEvent("error", { code, message: e.message, raw: out });
        // Index failed run for debugging
        if (projectId) {
          await this.memory.indexMemory({
            scope: "project",
            key: `adk-error:${new Date().toISOString()}`,
            text: `ADK stream run failed. Task: ${task}. Error: ${e.message}`,
            meta: { error: e.message, code },
          });
        }
      } finally {
        res.end();
      }
    });

    return () => {
      try { child.kill(); } catch {}
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

      // Log the completed run
      await this.memory.saveToolRun({
        userId,
        sessionId,
        projectId,
        name: "adk_run",
        input: { task },
        output: { projectPath: projectDir, outputs: result },
        success: true,
      });
      const assistantSummary = `ADK run succeeded. Artifacts at ${projectDir}. Outputs: ${Array.isArray(result) ? result.length : 0}`;
      await this.memory.saveTurn({ userId, sessionId, projectId, userMsg: null, assistantMsg: assistantSummary, usage: null });
      if (projectId) {
        await this.memory.indexMemory({
          scope: "project",
          key: `adk:${timestamp}`,
          text: `ADK run completed. Artifacts at ${projectDir}. Task: ${task}`,
          meta: { files: Array.isArray(result) ? result.length : 0 },
        });
      }

      return { mode: "ADK", projectPath: projectDir, outputs: result };
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
