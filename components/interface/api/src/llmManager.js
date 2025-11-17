import { OpenAIProvider } from "./providers/openaiProvider.js";
import { AnthropicProvider } from "./providers/anthropicProvider.js";
import { VertexAIProvider } from "./providers/vertexAIProvider.js";
import { OllamaProvider } from "./providers/ollamaProvider.js";
import { GenericProvider } from "./providers/genericProvider.js";

export class LLMManager {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.fallbackProviders = [];
  }

  async initialize(config) {
    console.log("=================== Initializing LLM providers... ===================");

    // Initialize configured providers
    for (const [name, providerConfig] of Object.entries(
      config.providers || {},
    )) {
      if (!providerConfig.enabled) continue;

      try {
        const provider = this.createProvider(name, providerConfig);
        this.providers.set(name, provider);
        console.log(`=================== ${name} provider initialized ===================`);
      } catch (error) {
        console.warn(
          `Failed to initialize ${name} provider: ${error.message}`,
        );
      }
    }

    // Set primary and fallback providers
    this.currentProvider = config.primary || this.getFirstAvailableProvider();
    this.fallbackProviders = config.fallbacks || [];

    // Test connections
    await this.testProviders();

    console.log(`=================== Primary provider: ${this.currentProvider} ===================`);
    console.log(`=================== Fallback providers: ${this.fallbackProviders.join(", ")} ===================`);
  }

  createProvider(name, config) {
    switch (name) {
      case "openai":
        return new OpenAIProvider(config);
      case "anthropic":
        return new AnthropicProvider(config);
      case "vertexai":
        return new VertexAIProvider(config);
      case "ollama":
        return new OllamaProvider(config);
      default:
        // Generic provider for custom endpoints
        return new GenericProvider({ ...config, name });
    }
  }

  async testProviders() {
    console.log("=================== Testing provider connections... ===================");

    for (const [name, provider] of this.providers) {
      const result = await provider.testConnection();
      if (result.success) {
        console.log(`=================== ${name}: Connected ===================`);
      } else {
        console.warn(`Failed to connect to ${name}: ${result.error}`);
      }
    }
  }

  getFirstAvailableProvider() {
    return this.providers.keys().next().value || null;
  }

  async generateResponse(messages, tools = null, options = {}) {
    const providersToTry = [this.currentProvider, ...this.fallbackProviders];
    let lastError = null;

    console.log("=================== Trying providers:", providersToTry);

    for (const providerName of providersToTry) {
      if (!this.providers.has(providerName)) {
        console.log(`Provider ${providerName} not available`);
        continue;
      }

      const provider = this.providers.get(providerName);

      try {
        console.log(`=================== Using ${providerName} provider ===================`);
        // Use generateResponseWithRetry for automatic retry logic
        const response = await provider.generateResponseWithRetry(
          messages,
          tools,
          options,
        );

        return {
          ...response,
          provider: providerName,
          model: provider.model,
        };
      } catch (error) {
        console.error(`=================== ${providerName} provider failed: ===================`, error);
        lastError = error;
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
  }

  generateMockResponse(userMessage, error) {
    return {
      content: `=================== **Mock Response** (All providers unavailable)\n\nYour message: "${userMessage}"\n\n ================== **Error**: ${error?.message || "No providers available"} ====================\n\nTo fix this:\n1. Check your API keys\n2. Verify network connectivity\n3. Ensure services are running\n\n\`\`\`bash\n# Example: Check Ollama status\ncurl http://localhost:11434/api/tags\n\`\`\``,
      toolCalls: [],
      usage: { total_tokens: 0 },
      provider: "mock",
      model: "mock",
    };
  }

  getProviderInfo() {
    const info = {};
    for (const [name, provider] of this.providers) {
      info[name] = provider.getProviderInfo();
    }
    return {
      providers: info,
      current: this.currentProvider,
      fallbacks: this.fallbackProviders,
    };
  }

  switchProvider(providerName) {
    if (this.providers.has(providerName)) {
      this.currentProvider = providerName;
      console.log(`=================== Switched to ${providerName} provider ===================`);
      return true;
    }
    return false;
  }

  addProvider(name, config) {
    try {
      const provider = this.createProvider(name, config);
      this.providers.set(name, provider);
      console.log(`=================== Added ${name} provider ===================`);
      return true;
    } catch (error) {
      console.error(`Failed to add ${name} provider: ${error.message}`);
      return false;
    }
  }

  removeProvider(name) {
    if (this.providers.delete(name)) {
      console.log(`=================== Removed ${name} provider ===================`);

      // Switch to another provider if current was removed
      if (this.currentProvider === name) {
        this.currentProvider = this.getFirstAvailableProvider();
        console.log(`=================== Switched to ${this.currentProvider} provider ===================`);
      }
      return true;
    }
    return false;
  }
}
