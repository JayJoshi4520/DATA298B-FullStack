import path from "path";
import fs from "fs";
import express from "express";
import { WorkshopStore } from "./workshopStore.js";
import { AgentService } from "./agentService.js";
import { ChatService } from "./chatService.js";
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const ARTIFACTS_DIR = path.resolve(process.cwd(), "generate");
const workshopStore = new WorkshopStore();
const agentService = new AgentService();
const chatService = new ChatService();

app.use(express.json({ limit: "10mb" }));

// -----------------------------
// 🩺 Health check
// -----------------------------
app.get("/api/health", async (req, res) => {
  try {
    res.json({
      status: "healthy",
      mode: "ADK",
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



app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));
app.use("/generate", express.static(ARTIFACTS_DIR));
// Serve generated artifacts directory
app.use("/generated", express.static("/home/coder/project/generated"));

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
        console.log(`=================== Agent request: ${message.substring(0, 50)}... ===================`);
        response = await agentService.processAgentRequest(
          message,
          history || [],
          availableTools || [],
          options || {},
        );
        break;

      case "ask":
        console.log(`=================== Ask request: ${message.substring(0, 50)}... ===================`);
        response = await agentService.runADKPipeline(message);
        break;

      case "chat":
      default:
        console.log(`=================== Chat request: ${message.substring(0, 50)}... ===================`);
        response = await chatService.processChatRequest(
          message,
          history || [],
          options || {},
        );
        break;
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `=================== Response generated in ${processingTime}ms using ${response.provider || "unknown"} ===================`,
    );

    res.json({
      ...response,
      mode: mode,
      processingTime: processingTime,
    });
  } catch (error) {
    console.error("=================== Chat API error: ===================", error);
    res.status(500).json({
      error: "Failed to process chat request",
      message:
        "I apologize, but I encountered an error processing your request. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});





// -----------------------------
//  ADK pipeline endpoint (non-streaming)
// -----------------------------
app.post("/api/adk/run", async (req, res) => {
  try {
    const { message, task, options } = req.body;
    const msg = message || task;
    if (!msg)
      return res.status(400).json({ error: "Message (or task) field is required" });

    const result = await agentService.runADKPipeline(msg, options || {});
    res.json(result);
  } catch (error) {
    console.error("=================== ADK run failed: ===================", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
//  Generated artifacts listing
// -----------------------------
app.get("/api/generate", async (req, res) => {
  try {
    const root = ARTIFACTS_DIR;
    fs.mkdirSync(root, { recursive: true });
    const entries = [];
    const walk = (dir, base = "") => {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        const rel = path.join(base, name);
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p, rel);
        else entries.push({ path: rel, size: st.size, mtime: st.mtimeMs });
      }
    };
    walk(root);
    res.json({ root: "/generate", files: entries.sort((a, b) => b.mtime - a.mtime) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------
// ADK streaming endpoint (SSE)
// -----------------------------
app.get("/api/adk/stream", async (req, res) => {
  try {
    const task = req.query.task;
    if (!task) return res.status(400).end("Missing ?task=");

    // optional identity for logging
    const options = {
      userId: req.query.userId,
      sessionId: req.query.sessionId,
      projectId: req.query.projectId,
    };

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // Heartbeat
    const hb = setInterval(() => {
      res.write(`event: ping\n`);
      res.write(`data: {}\n\n`);
    }, 15000);

    const cleanup = await agentService.runADKPipelineStream(res, task, options);

    req.on("close", () => {
      clearInterval(hb);
      try { cleanup?.(); } catch {}
    });
  } catch (error) {
    console.error("=================== ADK stream failed: ===================", error);
    try {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
    } finally {
      res.end();
    }
  }
});

// -----------------------------
// Optional: Labspace info (still supported)
// -----------------------------
app.get("/api/labspace", (req, res) => {
  try {
    res.json(workshopStore.getWorkshopDetails());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
//  Startup
// -----------------------------
const PORT = process.env.PORT || 3030;

(async function startServer() {
  try {
    console.log("=================== Initializing ADK-only server... ===================");

    await Promise.allSettled([
      agentService.initialize(),
      workshopStore.bootstrap(),
      chatService.initialize?.(),
    ]);

    console.log("ADK Mode Enabled → /api/adk/run");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on port ${PORT}:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server: ", error);
    process.exit(1);
  }
})();
