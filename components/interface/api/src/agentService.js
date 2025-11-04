import fs from "fs";
import path from "path";
import { execFileSync, spawn } from "child_process";
import { time } from "console";

const PROJECT_DIR = "/home/coder/project/";


export class AgentService {
  constructor() {
    this.initialized = false;
    this.projectRoot = process.cwd(); 
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      console.log("🤖 Agent service ready (ADK mode)");
    }
  }

  async runADKPipelineStream(res, task) {
    const startTime = Date.now();
    const scriptPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "adk_service.py"
    );

    const TARGET_DIR = PROJECT_DIR;

    const child = spawn("python3", [scriptPath, task], {
      env: { ...process.env, TARGET_FOLDER_PATH: TARGET_DIR },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const endTime = Date.now();
    console.log(`ADK pipeline started at ${startTime}`);
    console.log(`ADK pipeline ended at ${endTime}`);
    console.log(`ADK pipeline took ${endTime - startTime} ms`);

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

    child.on("close", (code) => {
      try {
        const parsed = JSON.parse(out || "[]");
        writeEvent("complete", { code, outputs: parsed });
      } catch (e) {
        writeEvent("error", { code, message: e.message, raw: out });
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
  async runADKPipeline(task) {
    const startTime = Date.now();
    const scriptPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "adk_service.py"
    );

    const TARGET_DIR = PROJECT_DIR

    try {
      const output = execFileSync("python3", [scriptPath, task], {
        encoding: "utf8",
        timeout: 180000,
        env: { ...process.env, TARGET_FOLDER_PATH: TARGET_DIR },
      });

    const endTime = Date.now();
    console.log(`ADK pipeline started at ${startTime}`);
    console.log(`ADK pipeline ended at ${endTime}`);
    console.log(`ADK pipeline took ${endTime - startTime} ms`);

      const result = JSON.parse(output);

      try {
        const generatedScript = path.join(TARGET_DIR, "output.py");
        if (fs.existsSync(generatedScript)) {
          const execOut = execFileSync("python", [generatedScript], {
            encoding: "utf8",
            timeout: 300000,
          });
          console.log("output.py execution output:\n", execOut);
        } else {
          console.warn("output.py not found at:", generatedScript);
        }
      } catch (e) {
        console.error("Failed to execute output.py:", e.message);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const projectDir = path.join(
        this.projectRoot,
        "generated",
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

      return { mode: "ADK", projectPath: projectDir, outputs: result };
    } catch (err) {
      console.error("ADK execution failed:", err.message);
      throw new Error("ADK execution failed: " + err.message);
    }
  }
}
