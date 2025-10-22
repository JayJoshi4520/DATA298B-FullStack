import path from "path";
import express from "express";
import { WorkshopStore } from "./workshopStore.js";
import { ChatService } from "./chatService.js";
import { AgentService } from "./agentService.js";
import { ToolManager } from "./toolManager.js";
import { Config } from "./config.js";

const app = express();

// Initialize services
const workshopStore = new WorkshopStore();
const toolManager = new ToolManager();
const chatService = new ChatService();
const agentService = new AgentService(toolManager);

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Provider management endpoints
app.get("/api/providers", (req, res) => {
  try {
    const providerInfo = chatService.getProviderInfo();
    res.json({
      providers: providerInfo.providers || {},
      current: providerInfo.current || "mock",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/providers/switch", async (req, res) => {
  const { provider } = req.body;
  try {
    await chatService.switchProvider(provider);
    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const providerInfo = chatService.getProviderInfo();

    res.json({
      status: "healthy",
      providers: providerInfo.providers || {},
      currentProvider: providerInfo.current || "mock",
      tools: toolManager.getAvailableTools().length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, mode, availableTools, options } = req.body;
    console.log(message, history, mode, availableTools, options);
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required and must be a string",
      });
    }

    let response;
    const startTime = Date.now();

    switch (mode) {
      case "agent":
        console.log(`🤖 Agent request: ${message.substring(0, 50)}...`);
        response = await agentService.processAgentRequest(
          message,
          history || [],
          availableTools || [],
          options || {},
        );
        break;

      case "ask":
        console.log(`❓ Ask request: ${message.substring(0, 50)}...`);
        response = await agentService.processAskRequest(
          message,
          history || [],
          availableTools || [],
          options || {},
        );
        break;

      case "chat":
      default:
        console.log(`💬 Chat request: ${message.substring(0, 50)}...`);
        response = await chatService.processChatRequest(
          message,
          history || [],
          options || {},
        );
        break;
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Response generated in ${processingTime}ms using ${response.provider || "unknown"}`,
    );

    res.json({
      ...response,
      mode: mode,
      processingTime: processingTime,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      message:
        "I apologize, but I encountered an error processing your request. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Legacy workshop endpoints
app.get("/api/labspace", (req, res) => {
  try {
    res.json(workshopStore.getWorkshopDetails());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Static file serving
app.use(express.static("/project", { dotfiles: "allow" }));

// Frontend routing
app.get("*splat", (req, res) =>
  res.sendFile(path.resolve("public", "index.html")),
);

// Server startup
const PORT = process.env.PORT || 3030;

(async function () {
  try {
    console.log("🔧 Initializing services...");

    // Initialize services with error handling
    try {
      await chatService.initialize();
      console.log("✅ Chat service initialized");
    } catch (error) {
      console.warn("⚠️ Chat service initialization failed:", error.message);
    }

    try {
      await agentService.initialize();
      console.log("✅ Agent service initialized");
    } catch (error) {
      console.warn("⚠️ Agent service initialization failed:", error.message);
    }

    // Initialize workshop store
    try {
      await workshopStore.bootstrap();
      console.log("✅ WorkshopStore bootstrapped");
    } catch (error) {
      console.warn("⚠️ WorkshopStore bootstrap failed:", error.message);
    }

    console.log(
      `🛠️ Available tools: ${toolManager.getAvailableTools().length}`,
    );

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend: http://localhost:5173`);
    });

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => {
        console.log(`Received ${signal}, shutting down gracefully...`);
        server.close(() => {
          console.log("Server closed");
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
