import { AIService } from "./aiService.js";

export class AgentService {
  constructor(toolManager) {
    this.toolManager = toolManager;
    this.aiService = new AIService();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.aiService.initialize();
      this.initialized = true;
      console.log("🤖 Agent service initialized with AI capabilities");
    }
  }

  async processAgentRequest(message, history, availableTools, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const messages = this.buildAgentMessages(history, message, availableTools);

    try {
      const response = await this.aiService.generateResponse(
        messages,
        this.toolManager.getToolDefinitions(),
        {
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 4000,
        },
      );

      // Process tool calls if any
      let toolResults = [];
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log(`🔧 Executing ${response.toolCalls.length} tool calls...`);

        for (const toolCall of response.toolCalls) {
          try {
            const result = await this.toolManager.executeTool(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments),
              false, // Allow modifications in agent mode
            );
            toolResults.push({
              toolCallId: toolCall.id,
              name: toolCall.function.name,
              result: result,
            });
          } catch (error) {
            console.error(`❌ Tool execution failed:`, error);
            toolResults.push({
              toolCallId: toolCall.id,
              name: toolCall.function.name,
              result: `Error: ${error.message}`,
            });
          }
        }
      }

      return {
        message: response.content,
        toolCalls: response.toolCalls || [],
        toolResults: toolResults,
        usage: response.usage,
        provider: response.provider,
        model: response.model,
      };
    } catch (error) {
      console.error("Agent service error:", error);
      return {
        message: `I encountered an error while processing your request: ${error.message}`,
        toolCalls: [],
        toolResults: [],
        error: error.message,
        provider: "error",
        model: "error",
      };
    }
  }

  async processAskRequest(message, history, availableTools, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    const messages = this.buildAskMessages(history, message, availableTools);
    try {
      const response = await this.aiService.generateResponse(
        messages,
        this.toolManager.getToolDefinitions(),
        {
          temperature: options.temperature || 0.3, // Lower temperature for analysis
          maxTokens: options.maxTokens || 4000,
        },
      );

      // Process tool calls for analysis (read-only)
      let toolResults = [];
      console.log(`THIS IS GEMINI REPOSNE ${response}`);
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log(
          `🔍 Executing ${response.toolCalls.length} analysis tools...`,
        );

        for (const toolCall of response.toolCalls) {
          try {
            const result = await this.toolManager.executeTool(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments),
              true, // Read-only mode for ask requests
            );
            toolResults.push({
              toolCallId: toolCall.id,
              name: toolCall.function.name,
              result: result,
            });
          } catch (error) {
            console.error(`❌ Analysis tool failed:`, error);
            toolResults.push({
              toolCallId: toolCall.id,
              name: toolCall.function.name,
              result: `Error: ${error.message}`,
            });
          }
        }
      }

      return {
        message: response.content,
        toolCalls: response.toolCalls || [],
        toolResults: toolResults,
        usage: response.usage,
        provider: response.provider,
        model: response.model,
      };
    } catch (error) {
      console.error("Ask service error:", error);
      return {
        message: `I encountered an error while analyzing your request: ${error.message}`,
        toolCalls: [],
        toolResults: [],
        error: error.message,
        provider: "error",
        model: "error",
      };
    }
  }

  buildAgentMessages(history, currentMessage, availableTools) {
    const systemPrompt = {
      role: "system",
      content: `You are an AI development assistant in AGENT mode. You have access to powerful tools to help users with their development tasks.

🎯 **Your Role:**
- Execute development tasks using available tools
- Create, edit, and manage files
- Run commands and analyze code
- Provide comprehensive solutions

🛠️ **Available Tools:** ${availableTools.join(", ")}

✅ **What You Can Do:**
- Create and edit files
- Execute shell commands
- Analyze code and file structures
- Search through codebases
- Manage project files
- Provide step-by-step solutions

🚫 **Important Guidelines:**
- Always explain what you're doing before executing tools
- Be careful with file operations and commands
- Provide clear feedback on tool execution results
- Ask for confirmation before making destructive changes

Always be helpful, thorough, and provide detailed explanations of your actions.`,
    };

    const chatMessages = [systemPrompt];

    // Add recent history (keep last 10 messages for context)
    history.slice(-10).forEach((msg) => {
      if (msg.role === "user" || msg.role === "assistant") {
        chatMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });

    // Add current message
    chatMessages.push({
      role: "user",
      content: currentMessage,
    });

    return chatMessages;
  }

  buildAskMessages(history, currentMessage, availableTools) {
    const systemPrompt = {
      role: "system",
      content: `You are an AI development assistant in ASK mode. You analyze code and provide insights without making changes.

🎯 **Your Role:**
- Analyze code and file structures
- Provide insights and recommendations
- Search through codebases
- Explain code functionality
- Identify issues and suggest improvements

🛠️ **Available Analysis Tools:** ${availableTools.join(", ")}

✅ **What You Can Do:**
- Read and analyze files
- Search through code
- List directory structures
- Execute read-only commands
- Provide code explanations

🚫 **Limitations:**
- You CANNOT create, edit, or delete files
- You CANNOT execute destructive commands
- Focus on analysis and insights only

Always provide detailed analysis and helpful insights about the codebase.`,
    };

    const chatMessages = [systemPrompt];

    // Add recent history
    history.slice(-10).forEach((msg) => {
      if (msg.role === "user" || msg.role === "assistant") {
        chatMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });

    // Add current message
    chatMessages.push({
      role: "user",
      content: currentMessage,
    });
    return chatMessages;
  }

  getProviderInfo() {
    return this.aiService.getProviderInfo();
  }
}
