import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const PROJECT_DIR = "/home/coder/project/";


export class AgentService {
  constructor() {
    this.initialized = false;
    this.projectRoot = process.cwd(); // portable path for Docker & local
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      console.log("🤖 Agent service ready (ADK mode)");
    }
  }

  // ============================================
  // 🧩 Real Google ADK (Python Bridge Only)
  // ============================================
  async runADKPipeline(task) {
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
      console.error("❌ ADK execution failed:", err.message);
      throw new Error("ADK execution failed: " + err.message);
    }
  }
}
