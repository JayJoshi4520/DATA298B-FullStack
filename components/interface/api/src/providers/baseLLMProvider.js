export class BaseLLMProvider {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.model = config.model;
    this.maxTokens = config.maxTokens || 3000;
    this.temperature = config.temperature || 0.7;
  }

  async generateResponse(messages, tools = null, options = {}) {
    throw new Error("generateResponse must be implemented by provider");
  }

  formatMessages(messages) {
    // Default formatting - override in specific providers if needed
    return messages;
  }

  formatTools(tools) {
    // Default tool formatting - override in specific providers if needed
    return tools;
  }

  parseResponse(response) {
    // Default response parsing - override in specific providers if needed
    return {
      content: response.content || "",
      toolCalls: response.toolCalls || [],
      usage: response.usage || {},
    };
  }

  validateConfig() {
    if (!this.model) {
      throw new Error(`Model is required for ${this.name} provider`);
    }
  }

  async testConnection() {
    try {
      const testMessages = [{ role: "user", content: "Hello" }];
      await this.generateResponse(testMessages);
      return { success: true, provider: this.name };
    } catch (error) {
      return { success: false, provider: this.name, error: error.message };
    }
  }

  getProviderInfo() {
    return {
      name: this.name,
      model: this.model,
      baseURL: this.baseURL,
      maxTokens: this.maxTokens,
      supportsTools: this.supportsTools || false,
    };
  }
}
