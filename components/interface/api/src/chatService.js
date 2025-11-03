import { AIService } from "./aiService.js";

export class ChatService {
  constructor() {
    this.aiService = new AIService();
  }

  async initialize() {
    await this.aiService.initialize();
  }

  async processChatRequest(message, history, options = {}) {
    const messages = this.buildChatHistory(history, message);

    try {
      const response = await this.aiService.generateResponse(messages, null, {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2000,
      });

      return {
        message: response.content,
        toolCalls: [],
        usage: response.usage,
        provider: response.provider,
        model: response.model,
      };
    } catch (error) {
      console.error("Chat service error:", error);
      return {
        message:
          "I'm having trouble connecting to the AI service. Please check your configuration and try again.",
        toolCalls: [],
        error: error.message,
        provider: "error",
        model: "error",
      };
    }
  }

  buildChatHistory(history, currentMessage) {
    const systemPrompt = {
      role: "system",
      content: `You are a helpful AI development assistant in CHAT mode. Key characteristics:

🎯 **Your Role:**
- Friendly and knowledgeable development mentor
- Expert in JavaScript, Python, React, Node.js, and modern web technologies
- Can explain complex concepts clearly
- Provide code examples and best practices

🚫 **Limitations in Chat Mode:**
- You CANNOT execute tools or modify files
- You CANNOT run commands or interact with the file system
- You can only provide information, explanations, and code examples

✅ **What You Can Do:**
- Answer programming questions
- Explain concepts and algorithms
- Provide code examples (but cannot execute them)
- Give architectural advice
- Review code snippets (when provided)
- Suggest debugging approaches
- Recommend tools and libraries

Always be helpful, provide detailed explanations, and include relevant code examples when appropriate. Format code blocks with proper syntax highlighting.`,
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

  async switchProvider(providerName) {
    return await this.aiService.switchProvider(providerName);
  }

  getProviderInfo() {
    return this.aiService.getProviderInfo();
  }
}
