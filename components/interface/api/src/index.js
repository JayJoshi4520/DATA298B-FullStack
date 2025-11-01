import path from "path";
import express from "express";
import { WorkshopStore } from "./workshopStore.js";
import { AgentService } from "./agentService.js";

const app = express();

// Initialize core services
const workshopStore = new WorkshopStore();
const agentService = new AgentService();

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

// -----------------------------
// 🚀 ADK pipeline endpoint
// -----------------------------
app.post("/api/adk/run", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ error: "Message field is required" });

    const result = await agentService.runADKPipeline(message);
    res.json(result);
  } catch (error) {
    console.error("❌ ADK run failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// 🧠 Optional: Labspace info (still supported)
// -----------------------------
app.get("/api/labspace", (req, res) => {
  try {
    res.json(workshopStore.getWorkshopDetails());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// 🏁 Startup
// -----------------------------
const PORT = process.env.PORT || 3030;

(async function startServer() {
  try {
    console.log("🔧 Initializing ADK-only server...");

    await Promise.allSettled([
      agentService.initialize(),
      workshopStore.bootstrap(),
    ]);

    console.log("🤖 ADK Mode Enabled → /api/adk/run");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API running on port ${PORT}:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
