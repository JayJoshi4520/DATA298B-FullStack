import { BaseLLMProvider } from "./baseLLMProvider.js";

export class OpenAIProvider extends BaseLLMProvider {
  constructor(config) {
    super({
      name: "openai",
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://api.openai.com/v1",
      model: config.model || "gpt-4",
      maxTokens: config.maxTokens || 3000,
      ...config,
    });
    this.supportsTools = true;
    this.validateConfig();
  }

  async generateResponse(messages, tools = null, options = {}) {
    const payload = {
      model: this.model,
      messages: this.formatMessages(messages),
      temperature: options.temperature || this.temperature,
      max_tokens: options.maxTokens || this.maxTokens,
    };

    if (tools && tools.length > 0) {
      payload.tools = this.formatTools(tools);
      payload.tool_choice = options.toolChoice || "auto";
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return this.parseResponse(data.choices[0].message, data.usage);
    } catch (error) {
      throw new Error(`OpenAI Provider Error: ${error.message}`);
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
    if (!this.apiKey) {
      throw new Error("OpenAI API key is required");
    }
  }
}
