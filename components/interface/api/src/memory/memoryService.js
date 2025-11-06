import { SQLiteStore } from "./sqliteStore.js";

export class MemoryService {
  constructor(opts = {}) {
    this.store = new SQLiteStore(opts.dbPath);
  }

  async getChatContext({ userId, sessionId, projectId, query, limit = 10 }) {
    if (userId) this.store.ensureUser(userId);
    if (sessionId) this.store.ensureSession({ sessionId, userId, projectId });

    const summary = sessionId ? this.store.getSessionSummary(sessionId) : null;
    const recentMessages = sessionId ? this.store.getRecentMessages(sessionId, limit) : [];
    const recentMemories = projectId ? this.store.searchMemories({ scope: "project", query, topK: 5 }) : [];

    return { summary, recentMessages, recentMemories };
  }

  getTurnCount(sessionId) {
    return this.store.countMessages(sessionId);
  }

  async saveTurn({ userId, sessionId, projectId, userMsg, assistantMsg, usage }) {
    this.store.ensureUser(userId);
    this.store.ensureSession({ sessionId, userId, projectId });
    if (userMsg) this.store.addMessage({ sessionId, role: "user", content: userMsg });
    if (assistantMsg) this.store.addMessage({ sessionId, role: "assistant", content: assistantMsg, tokenUsage: usage });

    // Update summary every 8 messages (approx 4 user-assistant pairs)
    const count = this.getTurnCount(sessionId);
    if (count % 8 === 0) {
      await this.updateSessionSummary(sessionId);
    }
  }

  async updateSessionSummary(sessionId) {
    if (!sessionId) return;
    const recent = this.store.getRecentMessages(sessionId, 20);
    const text = recent.map((m) => `${m.role}: ${m.content}`).join("\n");
    const lines = text.split("\n").slice(-12);
    const summary = lines.join("\n");
    this.store.setSessionSummary(sessionId, summary);
  }

  // Tool run logging for agents (ADK, etc.)
  async saveToolRun({ userId, sessionId, projectId, name, input, output, success }) {
    if (userId) this.store.ensureUser(userId);
    if (sessionId) this.store.ensureSession({ sessionId, userId, projectId });
    this.store.addToolRun({ sessionId, name, input, output, success });
  }

  // Generic memory indexing for project/session/user scoped notes
  async indexMemory({ scope, key, text, meta }) {
    this.store.addMemory({ scope, key, text, meta });
  }
}
