import { BaseLLMProvider } from "./baseLLMProvider.js";

export class OllamaProvider extends BaseLLMProvider {
  constructor(config) {
    super({
      name: "ollama",
      baseURL: config.baseURL || "http://localhost:11434",
      model: config.model || "llama2",
      maxTokens: config.maxTokens || 3000,
      ...config,
    });
    this.supportsTools = config.supportsTools || false; // Most local models don't support tools yet
    this.validateConfig();
  }

  async generateResponse(messages, tools = null, options = {}) {
    const payload = {
      model: this.model,
      messages: this.formatMessages(messages),
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
        top_p: options.topP || 0.9,
        top_k: options.topK || 40,
      },
      stream: false,
    };

    // Note: Most Ollama models don't support tools yet
    if (tools && tools.length > 0 && this.supportsTools) {
      payload.tools = this.formatTools(tools);
    }

    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      throw new Error(`Ollama Provider Error: ${error.message}`);
    }
  }

  parseResponse(data) {
    return {
      content: data.message?.content || "",
      toolCalls: [], // Most local models don't support tools
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }

  async testConnection() {
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        throw new Error("Ollama server not accessible");
      }

      const models = await response.json();
      const modelExists = models.models?.some((m) =>
        m.name.includes(this.model),
      );

      if (!modelExists) {
        throw new Error(
          `Model ${this.model} not found. Available models: ${models.models?.map((m) => m.name).join(", ")}`,
        );
      }

      return await super.testConnection();
    } catch (error) {
      return { success: false, provider: this.name, error: error.message };
    }
  }

  validateConfig() {
    super.validateConfig();
  }
}
