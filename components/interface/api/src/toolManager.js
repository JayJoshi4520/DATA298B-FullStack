import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export class ToolManager {
  constructor() {
    this.projectRoot = "/home/coder/project";
  }

  getAvailableTools() {
    return [
      "create_file",
      "edit_file",
      "read_file",
      "delete_file",
      "list_files",
      "get_file_tree",
      "search_files",
      "execute_command",
    ];
  }

  getToolDefinitions() {
    return [
      {
        type: "function",
        function: {
          name: "create_file",
          description: "Create a new file with specified content",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File path relative to project root",
              },
              content: {
                type: "string",
                description: "File content",
              },
            },
            required: ["path", "content"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "edit_file",
          description: "Edit an existing file",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File path relative to project root",
              },
              content: {
                type: "string",
                description: "New file content",
              },
            },
            required: ["path", "content"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "read_file",
          description: "Read the contents of a file",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File path relative to project root",
              },
            },
            required: ["path"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "delete_file",
          description: "Delete a file",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File path relative to project root",
              },
            },
            required: ["path"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "list_files",
          description: "List files in a directory",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Directory path relative to project root",
                default: ".",
              },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_file_tree",
          description: "Get the complete file tree structure",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Starting directory path",
                default: ".",
              },
              maxDepth: {
                type: "number",
                description: "Maximum depth to traverse",
                default: 3,
              },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_files",
          description: "Search for files containing specific text",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query",
              },
              filePattern: {
                type: "string",
                description: "File pattern to search in (e.g., '*.js')",
                default: "*",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "execute_command",
          description: "Execute a shell command in the project directory",
          parameters: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "Shell command to execute",
              },
              workingDir: {
                type: "string",
                description: "Working directory for command execution",
                default: ".",
              },
            },
            required: ["command"],
          },
        },
      },
    ];
  }

  async executeTool(toolName, parameters, readOnly = false) {
    const fullPath = parameters.path
      ? path.join(this.projectRoot, parameters.path)
      : this.projectRoot;

    console.log(`This is the working PATH : ${fullPath}`);

    // Security check - ensure we're working within project directory
    if (!fullPath.startsWith(this.projectRoot)) {
      throw new Error("Access denied: Path outside project directory");
    }

    switch (toolName) {
      case "create_file":
        if (readOnly)
          throw new Error("Create file not allowed in read-only mode");
        return await this.createFile(fullPath, parameters.content);

      case "edit_file":
        if (readOnly)
          throw new Error("Edit file not allowed in read-only mode");
        return await this.editFile(fullPath, parameters.content);

      case "read_file":
        return await this.readFile(fullPath);

      case "delete_file":
        if (readOnly)
          throw new Error("Delete file not allowed in read-only mode");
        return await this.deleteFile(fullPath);

      case "list_files":
        return await this.listFiles(fullPath);

      case "get_file_tree":
        return await this.getFileTree(fullPath, parameters.maxDepth || 3);

      case "search_files":
        return await this.searchFiles(
          parameters.query,
          parameters.filePattern || "*",
        );

      case "execute_command":
        if (readOnly)
          throw new Error("Execute command not allowed in read-only mode");
        return await this.executeCommand(
          parameters.command,
          parameters.workingDir,
        );

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async createFile(filePath, content) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, "utf8");
      return `File created successfully: ${path.relative(this.projectRoot, filePath)}`;
    } catch (error) {
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }

  async editFile(filePath, content) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      fs.writeFileSync(filePath, content, "utf8");
      return `File updated successfully: ${path.relative(this.projectRoot, filePath)}`;
    } catch (error) {
      throw new Error(`Failed to edit file: ${error.message}`);
    }
  }

  async readFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      const content = fs.readFileSync(filePath, "utf8");
      return {
        path: path.relative(this.projectRoot, filePath),
        content: content,
        size: content.length,
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async deleteFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      fs.unlinkSync(filePath);
      return `File deleted successfully: ${path.relative(this.projectRoot, filePath)}`;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async listFiles(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        throw new Error("Directory does not exist");
      }

      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      const result = items.map((item) => ({
        name: item.name,
        type: item.isDirectory() ? "directory" : "file",
        path: path.relative(this.projectRoot, path.join(dirPath, item.name)),
      }));

      return {
        directory: path.relative(this.projectRoot, dirPath),
        items: result,
      };
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async getFileTree(startPath, maxDepth = 3) {
    const buildTree = (currentPath, depth) => {
      if (depth > maxDepth) return null;

      const items = [];
      try {
        const dirItems = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const item of dirItems) {
          const itemPath = path.join(currentPath, item.name);
          const relPath = path.relative(this.projectRoot, itemPath);

          if (item.isDirectory()) {
            const children = buildTree(itemPath, depth + 1);
            items.push({
              name: item.name,
              type: "directory",
              path: relPath,
              children: children,
            });
          } else {
            items.push({
              name: item.name,
              type: "file",
              path: relPath,
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }

      return items;
    };

    return {
      root: path.relative(this.projectRoot, startPath),
      tree: buildTree(startPath, 0),
    };
  }

  async searchFiles(query, filePattern = "*") {
    try {
      // Use grep command for searching
      const command = `find "${this.projectRoot}" -name "${filePattern}" -type f -exec grep -l "${query}" {} \\;`;
      const output = execSync(command, { encoding: "utf8", timeout: 5000 });

      const files = output
        .trim()
        .split("\n")
        .filter((file) => file.length > 0)
        .map((file) => path.relative(this.projectRoot, file));

      return {
        query: query,
        pattern: filePattern,
        matches: files,
      };
    } catch (error) {
      return {
        query: query,
        pattern: filePattern,
        matches: [],
      };
    }
  }

  async executeCommand(command, workingDir = ".") {
    try {
      const fullWorkingDir = path.join(this.projectRoot, workingDir);

      // Security check
      if (!fullWorkingDir.startsWith(this.projectRoot)) {
        throw new Error("Access denied: Working directory outside project");
      }

      // Blacklist dangerous commands
      const dangerousCommands = [
        "rm -rf",
        "sudo",
        "chmod 777",
        "dd if=",
        "mkfs",
        ":(){",
        "fork",
      ];
      if (dangerousCommands.some((dangerous) => command.includes(dangerous))) {
        throw new Error("Command blocked for security reasons");
      }

      const output = execSync(command, {
        cwd: fullWorkingDir,
        encoding: "utf8",
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      return {
        command: command,
        workingDir: path.relative(this.projectRoot, fullWorkingDir),
        output: output,
        success: true,
      };
    } catch (error) {
      return {
        command: command,
        workingDir: workingDir,
        output: error.message,
        success: false,
        error: error.message,
      };
    }
  }
}
