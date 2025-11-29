// Vertex AI Configuration Constants
const VERTEX_PROJECT = process.env.VERTEX_PROJECT || "gemini-ai-460902";
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const VERTEX_BASE = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT}/locations/${VERTEX_LOCATION}`;

export class Config {
  static getLLMConfig() {
    return {
      primary: this.detectPrimaryProvider(),
      fallbacks: (process.env.LLM_FALLBACK_PROVIDERS || "")
        .split(",")
        .filter((p) => p.trim()),

      providers: {
        // Hardcoded Vertex AI Models (Fine-Tuned)
        "qwen-coder": {
          enabled: true,
          name: "Qwen2.5-Coder.FT",
          model: "qwen2.5-coder-32b-instruct.FT",
          baseURL: `${VERTEX_BASE}/endpoints/qwen-coder`,
          maxTokens: 4096,
          supportsTools: true,
          provider: "vertexai",
        },

        "codellama": {
          enabled: true,
          name: "CodeLLaMA.FT",
          model: "codellama-34b-instruct.FT",
          baseURL: `${VERTEX_BASE}/endpoints/codellama`,
          maxTokens: 4096,
          supportsTools: false,
          provider: "vertexai",
        },

        "mistral": {
          enabled: true,
          name: "Mistral.FT",
          model: "mistral-large-instruct.FT",
          baseURL: `${VERTEX_BASE}/endpoints/mistral`,
          maxTokens: 4096,
          supportsTools: true,
          provider: "vertexai",
        },

        "deepseek-coder": {
          enabled: true,
          name: "DeepSeek-Coder.FT",
          model: "deepseek-coder-33b-instruct.FT",
          baseURL: `${VERTEX_BASE}/endpoints/deepseek-coder`,
          maxTokens: 4096,
          supportsTools: true,
          provider: "vertexai",
        },

        // Original providers (kept for flexibility)
        vertexai: {
          enabled: !!(process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY),
          apiKey: process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || "",
          model: process.env.LLM_MODEL || "gemini-2.0-flash-exp",
          baseURL:
            process.env.LLM_BASE_URL ||
            "https://generativelanguage.googleapis.com",
          maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 3000,
          supportsTools: true,
        },

        openai: {
          enabled: !!process.env.OPENAI_API_KEY,
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4",
          baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 3000,
          supportsTools: true,
        },

        anthropic: {
          enabled: !!process.env.ANTHROPIC_API_KEY,
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229",
          baseURL:
            process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 3000,
          supportsTools: true,
        },

        ollama: {
          enabled: process.env.OLLAMA_ENABLED === "true",
          model: process.env.OLLAMA_MODEL || "llama2",
          baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS) || 3000,
          supportsTools: process.env.OLLAMA_SUPPORTS_TOOLS === "true",
        },
      },
    };
  }

  static detectPrimaryProvider() {
    // Priority order for auto-detection
    const priority = [
      "openai",
      "anthropic",
      "vertexai", 
      "ollama",
      "custom1",
      "custom2",
    ];

    // Check env vars directly to avoid recursion
    for (const provider of priority) {
      switch (provider) {
        case "openai":
          if (process.env.OPENAI_API_KEY) return "openai";
          break;
        case "anthropic":
          if (process.env.ANTHROPIC_API_KEY) return "anthropic";
          break;
        case "vertexai":
          if (process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY) return "vertexai";
          break;
        case "ollama":
          if (process.env.OLLAMA_ENABLED === "true") return "ollama";
          break;
        case "custom1":
          if (process.env.CUSTOM1_BASE_URL) return "custom1";
          break;
        case "custom2":
          if (process.env.CUSTOM2_BASE_URL) return "custom2";
          break;
      }
    }
    return "vertexai";
  }

  static getServerConfig() {
    return {
      port: parseInt(process.env.PORT) || 3030,
      nodeEnv: process.env.NODE_ENV || "development",
      projectRoot: process.env.PROJECT_ROOT || "/home/coder/project",
      commandTimeout: parseInt(process.env.COMMAND_TIMEOUT) || 30000,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024,
      enableMockAI: process.env.ENABLE_MOCK_AI === "true",
    };
  }

  static validate() {
    const llmConfig = this.getLLMConfig();
    const serverConfig = this.getServerConfig();

    console.log("\n🔧 Configuration Validation:");
    console.log(`📡 Server Port: ${serverConfig.port}`);
    console.log(`🌍 Node Environment: ${serverConfig.nodeEnv}`);

    // Validate LLM configuration
    console.log("\n🤖 LLM Configuration:");
    console.log(`Primary Provider: ${llmConfig.primary || "None"}`);

    // Check each provider's configuration
    Object.entries(llmConfig.providers).forEach(([name, config]) => {
      console.log(`\n📌 ${name.toUpperCase()} Provider:`);
      console.log(`- Enabled: ${config.enabled}`);
      console.log(`- Model: ${config.model || "Not specified"}`);
      console.log(`- API Key: ${config.apiKey ? "Present" : "Missing"}`);
      console.log(`- Base URL: ${config.baseURL || "Default"}`);
    });

    // List enabled providers
    const enabledProviders = Object.entries(llmConfig.providers)
      .filter(([_, config]) => config.enabled)
      .map(([name, _]) => name);

    console.log(
      "\n✅ Enabled Providers:",
      enabledProviders.length ? enabledProviders.join(", ") : "None",
    );

    if (enabledProviders.length === 0) {
      console.warn(
        "\n⚠️  WARNING: No LLM providers are enabled! Using mock responses.",
      );
      console.warn(
        "Please check your environment variables and provider configurations.",
      );
    }

    return true;
  }

  static getProviderExamples() {
    return {
      openai: {
        description: "OpenAI GPT models",
        envVars: ["OPENAI_API_KEY", "OPENAI_MODEL"],
      },
      anthropic: {
        description: "Anthropic Claude models",
        envVars: ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL"],
      },
      vertexai: {
        description: "Google vertexai models",
        envVars: ["LLM_API_KEY", "LLM_MODEL"],
      },
      ollama: {
        description: "Local Ollama models",
        envVars: ["OLLAMA_ENABLED=true", "OLLAMA_MODEL", "OLLAMA_BASE_URL"],
      },
      huggingface: {
        description: "Hugging Face Inference API",
        envVars: [
          "CUSTOM1_NAME=huggingface",
          "CUSTOM1_API_KEY=hf_xxx",
          "CUSTOM1_BASE_URL=https://api-inference.huggingface.co/models",
          "CUSTOM1_MODEL=microsoft/DialoGPT-large",
        ],
      },
      together: {
        description: "Together AI models",
        envVars: [
          "CUSTOM1_NAME=together",
          "CUSTOM1_API_KEY=xxx",
          "CUSTOM1_BASE_URL=https://api.together.xyz/v1",
          "CUSTOM1_MODEL=meta-llama/Llama-2-70b-chat-hf",
        ],
      },
      replicate: {
        description: "Replicate API",
        envVars: [
          "CUSTOM1_NAME=replicate",
          "CUSTOM1_API_KEY=r8_xxx",
          "CUSTOM1_BASE_URL=https://api.replicate.com/v1",
          "CUSTOM1_MODEL=meta/llama-2-70b-chat",
        ],
      },
    };
  }
}
