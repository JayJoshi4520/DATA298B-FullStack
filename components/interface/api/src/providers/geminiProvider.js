import { BaseLLMProvider } from "./baseLLMProvider.js";

export class GeminiProvider extends BaseLLMProvider {
  constructor(config) {
    super({
      name: "gemini",
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://generativelanguage.googleapis.com",
      model: config.model || "gemini-2.5-pro", // Updated to latest model
      maxTokens: config.maxTokens || 3000,
      ...config,
    });
    this.supportsTools = true;
    this.validateConfig();
  }

  async generateResponse(messages, tools = null, options = {}) {
    console.log("🤖 Generating response with Gemini...");
    console.log(`\n\nTHIS ARE THE TOOLS: ${tools[0].function.name}\n\n`);
    try {
      // Fix: Use correct Gemini API endpoint format
      const endpoint = `${this.baseURL}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      // Convert chat messages to Gemini format
      const contents = this.formatMessages(messages);

      const payload = {
        contents: contents,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2048,
        },
      };

      // Add tools configuration if provided
      if (tools && tools.length > 0) {
        console.log(`🔧 Including ${tools.length} tools in request`);

        payload.tools = [
          {
            functionDeclarations: tools.map((tool) => ({
              name: tool.function.name,
              description: tool.function.description,
              parameters: tool.function.parameters,
            })),
          },
        ];

        // Add tool calling configuration
        payload.toolConfig = {
          functionCallingConfig: {
            mode: "AUTO", // Can be "AUTO", "ANY", or "NONE"
          },
        };
      }

      console.log("📡 Calling Gemini API...");
      console.log("🔗 Endpoint:", endpoint);
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ Gemini API error:", error);
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      // Add better error handling for response parsing
      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        console.error("❌ Invalid Gemini response:", data);
        throw new Error("Invalid response from Gemini API");
      }

      // Parse the response to extract content and tool calls
      const parsedResponse = this.parseResponse(data);

      return {
        content: parsedResponse.content,
        toolCalls: parsedResponse.toolCalls,
        provider: "gemini",
        model: this.model,
        usage: parsedResponse.usage,
      };
    } catch (error) {
      console.error("❌ Gemini provider error:", error);
      throw error;
    }
  }

  formatMessages(messages) {
    const contents = [];
    let systemMessage = "";

    // Handle system message by prepending it to the first user message
    messages.forEach((message) => {
      if (message.role === "system") {
        systemMessage = message.content;
      } else if (message.role === "user") {
        const content = systemMessage
          ? `${systemMessage}\n\n${message.content}`
          : message.content;
        contents.push({
          role: "user",
          parts: [{ text: content }],
        });
        systemMessage = ""; // Clear after using
      } else if (message.role === "assistant") {
        contents.push({
          role: "model",
          parts: [{ text: message.content }],
        });
      } else if (message.role === "function") {
        // Add support for function responses
        contents.push({
          role: "model",
          parts: [
            {
              functionResponse: {
                name: message.name,
                response: { result: message.content },
              },
            },
          ],
        });
      }
    });

    return contents;
  }

  parseResponse(data) {
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error("No response from Gemini");
    }

    const content = candidate.content?.parts?.[0]?.text || "";
    const functionCalls = [];

    // Extract function calls from all parts
    candidate.content?.parts?.forEach((part) => {
      if (part.functionCall) {
        functionCalls.push({
          id: `call-${functionCalls.length + 1}`,
          type: "function",
          function: {
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args),
          },
        });
      }
    });

    return {
      content: content,
      toolCalls: functionCalls,
      usage: data.usageMetadata || {},
    };
  }

  validateConfig() {
    super.validateConfig();
    if (!this.apiKey) {
      throw new Error("Google Gemini API key is required");
    }
    console.log("🔧 Initializing Gemini provider with model:", this.model);
  }
}
