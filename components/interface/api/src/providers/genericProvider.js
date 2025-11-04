import { BaseLLMProvider } from "./baseLLMProvider.js";

export class GenericProvider extends BaseLLMProvider {
  constructor(config) {
    super({
      name: config.name || "generic",
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
      maxTokens: config.maxTokens || 3000,
      ...config,
    });
    this.supportsTools = config.supportsTools !== false; 
    this.authHeader = config.authHeader || "Authorization";
    this.authPrefix = config.authPrefix || "Bearer";
    this.validateConfig();
  }

  async generateResponse(messages, tools = null, options = {}) {
    const payload = {
      model: this.model,
      messages: this.formatMessages(messages),
      temperature: options.temperature || this.temperature,
      max_tokens: options.maxTokens || this.maxTokens,
    };

    if (tools && tools.length > 0 && this.supportsTools) {
      payload.tools = this.formatTools(tools);
      payload.tool_choice = options.toolChoice || "auto";
    }

    const headers = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers[this.authHeader] = `${this.authPrefix} ${this.apiKey}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `${this.name} API error: ${response.status} ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return this.parseResponse(data.choices[0].message, data.usage);
    } catch (error) {
      throw new Error(`${this.name} Provider Error: ${error.message}`);
    }
  }

  parseResponse(message, usage) {
    return {
      content: message.content,
      toolCalls: message.tool_calls || [],
      usage: usage,
    };
  }

  validateConfig() {
    super.validateConfig();
    if (!this.baseURL) {
      throw new Error(`Base URL is required for ${this.name} provider`);
    }
  }
}
