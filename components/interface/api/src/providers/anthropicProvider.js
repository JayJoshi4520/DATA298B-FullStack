import { BaseLLMProvider } from "./baseLLMProvider.js";

export class AnthropicProvider extends BaseLLMProvider {
  constructor(config) {
    super({
      name: "anthropic",
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://api.anthropic.com",
      model: config.model || "claude-3-sonnet-20240229",
      maxTokens: config.maxTokens || 3000,
      ...config,
    });
    this.supportsTools = true;
    this.validateConfig();
  }

  async generateResponse(messages, tools = null, options = {}) {
    const { systemMessage, userMessages } =
      this.separateSystemMessage(messages);

    const payload = {
      model: this.model,
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature,
      messages: userMessages,
    };

    if (systemMessage) {
      payload.system = systemMessage.content;
    }

    if (tools && tools.length > 0) {
      payload.tools = this.formatTools(tools);
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Anthropic API error: ${response.status} ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      throw new Error(`Anthropic Provider Error: ${error.message}`);
    }
  }

  separateSystemMessage(messages) {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");
    return { systemMessage, userMessages };
  }

  parseResponse(data) {
    const content = data.content.find((c) => c.type === "text")?.text || "";
    const toolCalls = data.content.filter((c) => c.type === "tool_use") || [];

    return {
      content: content,
      toolCalls: toolCalls,
      usage: data.usage,
    };
  }

  formatTools(tools) {
    // Convert OpenAI tool format to Anthropic format
    return tools.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters,
    }));
  }

  validateConfig() {
    super.validateConfig();
    if (!this.apiKey) {
      throw new Error("Anthropic API key is required");
    }
  }
}
