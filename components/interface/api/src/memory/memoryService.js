import { SQLiteStore } from "./sqliteStore.js";
import { FirestoreStore } from "./firestoreStore.js";

export class MemoryService {
  constructor(opts = {}) {
    // Default to Firestore if not explicitly disabled or if configured
    // For this task, we prioritize Firestore.
    if (process.env.USE_FIRESTORE !== 'false') {
      console.log("Using Firestore for MemoryService");
      this.store = new FirestoreStore();
    } else {
      console.log("Using SQLite for MemoryService");
      this.store = new SQLiteStore(opts.dbPath);
    }
  }

  async getChatContext({ userId, sessionId, projectId, query, limit = 30 }) {
    if (userId) this.store.ensureUser(userId);
    if (sessionId) this.store.ensureSession({ sessionId, userId, projectId });

    const summary = sessionId ? this.store.getSessionSummary(sessionId) : null;
    const recentMessages = sessionId ? this.store.getRecentMessages(sessionId, limit) : [];
    const recentMemories = projectId ? this.store.searchMemories({ scope: "project", query, topK: 10 }) : [];

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
    const recent = this.store.getRecentMessages(sessionId, 50);
    const text = recent.map((m) => `${m.role}: ${m.content}`).join("\n");
    const lines = text.split("\n").slice(-30);
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

  // Check if semantic search is enabled
  isSemanticSearchEnabled() {
    return this.store.embeddings && typeof this.store.embeddings.generateEmbedding === 'function';
  }

  // Semantic search using embeddings
  async semanticSearch({ scope, query, topK = 10 }) {
    if (!this.isSemanticSearchEnabled()) {
      // Fallback to keyword search
      return this.store.searchMemories({ scope, query, topK });
    }
    return await this.store.semanticSearch({ scope, query, topK });
  }

  // Proxy methods for API endpoints
  async getStats() {
    if (this.store.getStats) return this.store.getStats();
    // Fallback for SQLiteStore which might not have this method directly exposed yet, 
    // or if we want to keep the logic in index.js for SQLite.
    // But for Firestore, we MUST use the method.
    return null;
  }

  async getSessionDetails(sessionId) {
    if (this.store.getSessionDetails) return this.store.getSessionDetails(sessionId);
    return null;
  }

  async getSessionMessages(sessionId, limit) {
    if (this.store.getSessionMessages) return this.store.getSessionMessages(sessionId, limit);
    return [];
  }

  async getSessionToolRuns(sessionId) {
    if (this.store.getSessionToolRuns) return this.store.getSessionToolRuns(sessionId);
    return [];
  }

  async listSessions(opts) {
    if (this.store.listSessions) return this.store.listSessions(opts);
    return [];
  }

  async getEmbeddingStatus() {
    if (this.store.getEmbeddingStatus) return this.store.getEmbeddingStatus();
    return { totalMemories: 0, withEmbeddings: 0, coverage: "0%" };
  }

  async createCollaborationSession(data) {
    if (this.store.createCollaborationSession) return this.store.createCollaborationSession(data);
    return null;
  }

  async logCollaborationEvent(data) {
    if (this.store.logCollaborationEvent) return this.store.logCollaborationEvent(data);
  }

  async getCollaborationEvents(sessionId) {
    if (this.store.getCollaborationEvents) return this.store.getCollaborationEvents(sessionId);
    return [];
  }

  async getMemoriesWithoutEmbeddings(scope, limit) {
    if (this.store.getMemoriesWithoutEmbeddings) return this.store.getMemoriesWithoutEmbeddings(scope, limit);
    return [];
  }
}
