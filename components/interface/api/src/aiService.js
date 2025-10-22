import { LLMManager } from "./llmManager.js";
import { Config } from "./config.js";

export class AIService {
  constructor() {
    this.llmManager = new LLMManager();
    this.config = Config.getLLMConfig();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.llmManager.initialize(this.config);
      this.initialized = true;
      console.log("🔧 AIService initialized with config:", {
        primary: this.config.primary,
        providers: Object.keys(this.config.providers),
      });
    }
  }

  async generateResponse(messages, tools = null, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await this.llmManager.generateResponse(messages, tools, options);
    } catch (error) {
      console.error("AI Service error:", error);
      throw error;
    }
  }

  async switchProvider(providerName) {
    return (this.llmManager.currentProvider = providerName);
  }

  getProviderInfo() {
    return {
      providers: Array.from(this.llmManager.providers.keys()),
      current: this.llmManager.currentProvider,
    };
  }
}
