export class Config {
  static getLLMConfig() {
    return {
      primary: this.detectPrimaryProvider(),
      fallbacks: (process.env.LLM_FALLBACK_PROVIDERS || "")
        .split(",")
        .filter((p) => p.trim()),

      providers: {
        openai: {
          enabled: !!process.env.OPENAI_API_KEY,
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4",
          baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 3000,
        },

        anthropic: {
          enabled: !!process.env.ANTHROPIC_API_KEY,
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229",
          baseURL:
            process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 3000,
        },

        gemini: {
          enabled: !!(process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY),
          apiKey: process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || "",
          model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
          baseURL:
            process.env.GEMINI_BASE_URL ||
            "https://generativelanguage.googleapis.com",
          maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 3000,
        },

        ollama: {
          enabled: process.env.OLLAMA_ENABLED === "true",
          model: process.env.OLLAMA_MODEL || "llama2",
          baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS) || 3000,
          supportsTools: process.env.OLLAMA_SUPPORTS_TOOLS === "true",
        },

        // Custom providers
        custom1: {
          enabled: !!process.env.CUSTOM1_BASE_URL,
          name: process.env.CUSTOM1_NAME || "custom1",
          apiKey: process.env.CUSTOM1_API_KEY,
          model: process.env.CUSTOM1_MODEL,
          baseURL: process.env.CUSTOM1_BASE_URL,
          maxTokens: parseInt(process.env.CUSTOM1_MAX_TOKENS) || 3000,
          supportsTools: process.env.CUSTOM1_SUPPORTS_TOOLS !== "false",
          authHeader: process.env.CUSTOM1_AUTH_HEADER || "Authorization",
          authPrefix: process.env.CUSTOM1_AUTH_PREFIX || "Bearer",
        },

        custom2: {
          enabled: !!process.env.CUSTOM2_BASE_URL,
          name: process.env.CUSTOM2_NAME || "custom2",
          apiKey: process.env.CUSTOM2_API_KEY,
          model: process.env.CUSTOM2_MODEL,
          baseURL: process.env.CUSTOM2_BASE_URL,
          maxTokens: parseInt(process.env.CUSTOM2_MAX_TOKENS) || 3000,
          supportsTools: process.env.CUSTOM2_SUPPORTS_TOOLS !== "false",
          authHeader: process.env.CUSTOM2_AUTH_HEADER || "Authorization",
          authPrefix: process.env.CUSTOM2_AUTH_PREFIX || "Bearer",
        },
      },
    };
  }

  static detectPrimaryProvider() {
    // Priority order for auto-detection
    const priority = [
      "openai",
      "anthropic",
      "gemini", // Gemini will be enabled by default
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
        case "gemini":
          if (process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY) return "gemini";
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
    return "gemini";
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
      gemini: {
        description: "Google Gemini models",
        envVars: ["LLM_API_KEY", "GEMINI_MODEL"],
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
