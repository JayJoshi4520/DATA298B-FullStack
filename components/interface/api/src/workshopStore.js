import { parse } from "yaml";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { fetch, Agent } from "undici";

export class WorkshopStore {
  constructor() {
    this.sections = [];
    this.signingKey = null;

    // Try to read signing key, but don't fail if it doesn't exist
    try {
      this.signingKey = fs.readFileSync(
        "/etc/cmd-executor/private-key/cmd-executor.key",
      );
    } catch (error) {
      console.log("=================== Signing key not found, some workshop features disabled ===================");
      this.signingKey = "dummy-key-for-development";
    }
  }

  async bootstrap() {
    try {
      // Try to read labspace.yaml first
      const yamlPath = path.join("/project", "labspace.yaml");
      const labspaceYaml = fs.readFileSync(yamlPath, "utf8");
      this.config = parse(labspaceYaml);

      this.config.sections = this.config.sections.map((section) => ({
        ...section,
        id: section.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-"),
      }));
    } catch (error) {
      // Fallback for chat mode - create default config
      console.log("=================== No yaml found, using default config for chat mode ===================");
      this.config = {
        title: "AI Development Assistant",
        description: "Interactive development environment with AI chat",
        sections: [
          {
            id: "welcome",
            title: "Welcome",
            contentPath: "README.md",
          },
        ],
      };
    }
  }

  getWorkshopDetails() {
    if (process.env.CONTENT_DEV_MODE) this.bootstrap();

    const details = {
      title: this.config.title,
      subtitle: this.config.description,
      sections: this.config.sections.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    };

    if (process.env.CONTENT_DEV_MODE) {
      details.devMode = true;
    }

    return details;
  }

  getSectionDetails(sectionId) {
    if (process.env.CONTENT_DEV_MODE) this.bootstrap();

    const section = this.config.sections.find(
      (section) => section.id === sectionId,
    );

    if (!section) {
      console.warn(`=================== Section with id ${sectionId} not found ===================`);
      return null;
    }

    try {
      const filePath = path.join("/project", section.contentPath);
      const content = fs.readFileSync(filePath, "utf8");

      return {
        id: section.id,
        title: section.title,
        content,
      };
    } catch (error) {
      return {
        id: section.id,
        title: section.title,
        content: "# Welcome\n\nThis is a default section content.",
      };
    }
  }

  executeCommand(sectionId, codeBlockIndex) {
    try {
      const { content } = this.getSectionDetails(sectionId);
      const { code, meta } = this.#getCodeBlock(content, codeBlockIndex);

      if (this.signingKey === "dummy-key-for-development") {
        console.log("Mock command execution (no signing key): ", code);
        return Promise.resolve();
      }

      const payload = {
        cmd: code,
        aud: "cmd-executor",
        exp: Math.floor(Date.now() / 1000) + 15, // 15 seconds
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(),
      };

      if (meta["terminal-id"]) {
        payload.terminalId = meta["terminal-id"];
      }

      const token = jwt.sign(payload, this.signingKey, { algorithm: "ES256" });

      return fetch("http://localhost/command", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: {
          "Content-Type": "application/json",
        },
        dispatcher: new Agent({
          connect: {
            socketPath: "/etc/cmd-executor/socket/cmd-executor.sock",
          },
        }),
      }).then((res) => {
        if (!res.ok)
          throw new Error(`Failed to execute command: ${res.statusText}`);
      });
    } catch (error) {
      console.error("Command execution error: ", error);
      return Promise.reject(error);
    }
  }

  async saveFile(sectionId, codeBlockIndex) {
    try {
      const { content } = this.getSectionDetails(sectionId);
      const codeBlock = this.#getCodeBlock(content, codeBlockIndex);
      const fileName = codeBlock.meta["save-as"];

      if (!fileName) {
        throw new Error("Code block is missing 'save-as' metadata");
      }

      const filePath = path.join("/project", fileName);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, codeBlock.code, "utf8");
    } catch (error) {
      console.error("Save file error:", error);
      throw error;
    }
  }

  async openFileInIDE(filePath, line) {
    try {
      if (this.signingKey === "dummy-key-for-development") {
        console.log("Mock file opening (no signing key):", filePath, line);
        return Promise.resolve();
      }

      return fetch("http://localhost/open", {
        method: "POST",
        body: JSON.stringify({ filePath, line }),
        headers: {
          "Content-Type": "application/json",
        },
        dispatcher: new Agent({
          connect: {
            socketPath: "/etc/cmd-executor/socket/cmd-executor.sock",
          },
        }),
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to open file: ${res.statusText}`);
      });
    } catch (error) {
      console.error("Open file error:", error);
      return Promise.reject(error);
    }
  }

  #getCodeBlock(content, index) {
    try {
      const codeBlocks = content.match(/```(.*?)```/gs);
      if (!codeBlocks || codeBlocks[index] === undefined) {
        throw new Error(`Code block at index ${index} not found`);
      }

      const codeRows = codeBlocks[index].split("\n");
      const headerRow = codeRows.shift().substring(3);
      codeRows.pop();

      const [language, ...metaInfo] = headerRow.split(" ");

      const meta = metaInfo.reduce((acc, cur) => {
        const [key, value] = cur.split("=");
        acc[key.trim()] = value ? value : "true";
        return acc;
      }, {});

      const indentation = codeRows[0] ? codeRows[0].match(/^\s*/)[0].length : 0;

      return {
        language,
        code: codeRows.map((row) => row.substring(indentation)).join("\n"),
        meta,
      };
    } catch (error) {
      console.error("Get code block error:", error);
      throw error;
    }
  }
}
