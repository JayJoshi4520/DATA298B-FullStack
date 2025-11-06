import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export class SQLiteStore {
  constructor(dbPath) {
    this.dbPath = dbPath || path.resolve(process.cwd(), "data", "memory.db");
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new Database(this.dbPath);
    this.#migrate();
  }

  #migrate() {
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at TEXT DEFAULT (datetime('now')),
        profile_json TEXT
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        project_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        summary_text TEXT,
        summary_updated_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        role TEXT,
        content TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        token_usage_json TEXT,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_messages_session_created ON messages(session_id, created_at);

      CREATE TABLE IF NOT EXISTS tool_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        name TEXT,
        input_json TEXT,
        output_json TEXT,
        success INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_tool_runs_session_created ON tool_runs(session_id, created_at);

      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope TEXT,   -- 'user' | 'project' | 'session'
        key TEXT,
        text TEXT,
        meta_json TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_memories_scope_created ON memories(scope, created_at);
    `);
  }

  ensureUser(userId) {
    if (!userId) return;
    const get = this.db.prepare("SELECT id FROM users WHERE id = ?");
    const row = get.get(userId);
    if (!row) {
      const ins = this.db.prepare("INSERT INTO users(id) VALUES (?)");
      ins.run(userId);
    }
  }

  ensureSession({ sessionId, userId, projectId }) {
    if (!sessionId) return;
    const get = this.db.prepare("SELECT id FROM sessions WHERE id = ?");
    const row = get.get(sessionId);
    if (!row) {
      const ins = this.db.prepare(
        "INSERT INTO sessions(id, user_id, project_id) VALUES (?, ?, ?)"
      );
      ins.run(sessionId, userId || null, projectId || null);
    }
  }

  addMessage({ sessionId, role, content, tokenUsage }) {
    if (!sessionId || !role || !content) return;
    const stmt = this.db.prepare(
      "INSERT INTO messages(session_id, role, content, token_usage_json) VALUES (?, ?, ?, ?)"
    );
    stmt.run(sessionId, role, content, tokenUsage ? JSON.stringify(tokenUsage) : null);
  }

  getRecentMessages(sessionId, limit = 10) {
    if (!sessionId) return [];
    const stmt = this.db.prepare(
      "SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?"
    );
    const rows = stmt.all(sessionId, limit);
    return rows.reverse();
  }

  countMessages(sessionId) {
    if (!sessionId) return 0;
    const stmt = this.db.prepare(
      "SELECT COUNT(1) as c FROM messages WHERE session_id = ?"
    );
    const row = stmt.get(sessionId);
    return row?.c || 0;
  }

  getSessionSummary(sessionId) {
    if (!sessionId) return null;
    const stmt = this.db.prepare(
      "SELECT summary_text FROM sessions WHERE id = ?"
    );
    const row = stmt.get(sessionId);
    return row?.summary_text || null;
  }

  setSessionSummary(sessionId, summary) {
    if (!sessionId) return;
    const stmt = this.db.prepare(
      "UPDATE sessions SET summary_text = ?, summary_updated_at = datetime('now') WHERE id = ?"
    );
    stmt.run(summary, sessionId);
  }

  addToolRun({ sessionId, name, input, output, success }) {
    if (!sessionId || !name) return;
    const stmt = this.db.prepare(
      "INSERT INTO tool_runs(session_id, name, input_json, output_json, success) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(
      sessionId,
      name,
      input ? JSON.stringify(input) : null,
      output ? JSON.stringify(output) : null,
      success ? 1 : 0
    );
  }

  addMemory({ scope, key, text, meta }) {
    if (!scope || !text) return;
    const stmt = this.db.prepare(
      "INSERT INTO memories(scope, key, text, meta_json) VALUES (?, ?, ?, ?)"
    );
    stmt.run(scope, key || null, text, meta ? JSON.stringify(meta) : null);
  }

  searchMemories({ scope, query, topK = 5 }) {
    if (!scope) return [];
    if (query && query.trim()) {
      const like = `%${query.trim()}%`;
      const stmt = this.db.prepare(
        "SELECT text, meta_json FROM memories WHERE scope = ? AND (text LIKE ? OR IFNULL(meta_json,'') LIKE ?) ORDER BY created_at DESC LIMIT ?"
      );
      const rows = stmt.all(scope, like, like, topK);
      return rows.map((r) => ({ text: r.text, meta: r.meta_json ? JSON.parse(r.meta_json) : {} }));
    } else {
      const stmt = this.db.prepare(
        "SELECT text, meta_json FROM memories WHERE scope = ? ORDER BY created_at DESC LIMIT ?"
      );
      const rows = stmt.all(scope, topK);
      return rows.map((r) => ({ text: r.text, meta: r.meta_json ? JSON.parse(r.meta_json) : {} }));
    }
  }

  getRecentToolRuns(sessionId, limit = 10) {
    if (!sessionId) return [];
    const stmt = this.db.prepare(
      "SELECT name, input_json, output_json, success, created_at FROM tool_runs WHERE session_id = ? ORDER BY created_at DESC LIMIT ?"
    );
    const rows = stmt.all(sessionId, limit);
    return rows.map((r) => ({
      name: r.name,
      input: r.input_json ? JSON.parse(r.input_json) : null,
      output: r.output_json ? JSON.parse(r.output_json) : null,
      success: !!r.success,
      createdAt: r.created_at,
    }));
  }
}
