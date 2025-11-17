import fs from "fs";
import path from "path";
import { getDatabase } from "../db.js";
import { EmbeddingProvider } from "./embeddingProvider.js";

export class SQLiteStore {
  constructor(dbPath) {
    this.dbPath = dbPath || path.resolve(process.cwd(), "data", "memory.db");
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    // Use singleton database connection
    this.db = getDatabase(this.dbPath);
    this.embeddings = new EmbeddingProvider();
    this.#migrate();
  }

  #migrate() {
    // Database is already configured by db.js, but we still need to create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        password_hash TEXT,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT (datetime('now')),
        last_login TEXT,
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

      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id INTEGER,
        vector_json TEXT,  -- JSON array of embedding vector
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_embeddings_memory ON embeddings(memory_id);

      -- Templates Library
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        task_template TEXT NOT NULL,
        tags_json TEXT,
        user_id TEXT,
        is_public INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
      CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);

      -- Workflows
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        user_id TEXT,
        mode TEXT,
        task TEXT,
        status TEXT DEFAULT 'draft',
        result_json TEXT,
        execution_time INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        executed_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflows(user_id);
      CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

      -- Workflow Steps (for agent outputs)
      CREATE TABLE IF NOT EXISTS workflow_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT NOT NULL,
        step_number INTEGER,
        agent_name TEXT,
        task TEXT,
        output TEXT,
        execution_time INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);

      -- Analytics Events
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data_json TEXT,
        user_id TEXT,
        session_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_type_created ON analytics_events(event_type, created_at);

      -- Performance Metrics
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_type TEXT NOT NULL,
        metric_name TEXT,
        value REAL,
        unit TEXT,
        context_json TEXT,
        session_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_performance_type_created ON performance_metrics(metric_type, created_at);

      -- Human-in-the-loop Approvals
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        workflow_id TEXT,
        step_number INTEGER,
        question TEXT NOT NULL,
        options_json TEXT,
        response TEXT,
        status TEXT DEFAULT 'pending',
        user_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        responded_at TEXT,
        FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

      -- Test Results (Auto-testing)
      CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT,
        test_suite TEXT,
        test_name TEXT,
        status TEXT,
        duration INTEGER,
        error_message TEXT,
        output_json TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(workflow_id) REFERENCES workflows(id)
      );
      CREATE INDEX IF NOT EXISTS idx_test_results_workflow ON test_results(workflow_id);

      -- Collaboration Sessions (Multi-user)
      CREATE TABLE IF NOT EXISTS collaboration_sessions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT,
        participants_json TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT,
        FOREIGN KEY(workflow_id) REFERENCES workflows(id)
      );

      -- Collaboration Events
      CREATE TABLE IF NOT EXISTS collaboration_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collab_session_id TEXT NOT NULL,
        user_id TEXT,
        event_type TEXT,
        event_data_json TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(collab_session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_collab_events_session ON collaboration_events(collab_session_id);
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
    const result = stmt.run(scope, key || null, text, meta ? JSON.stringify(meta) : null);
    const memoryId = result.lastInsertRowid;
    
    // Generate embedding asynchronously (don't block)
    if (this.embeddings.isEnabled()) {
      this.#generateEmbeddingAsync(memoryId, text);
    }
    
    return memoryId;
  }

  async #generateEmbeddingAsync(memoryId, text) {
    try {
      const vector = await this.embeddings.generateEmbedding(text);
      if (vector) {
        const stmt = this.db.prepare(
          "INSERT INTO embeddings(memory_id, vector_json) VALUES (?, ?)"
        );
        stmt.run(memoryId, JSON.stringify(vector));
      }
    } catch (error) {
      console.error("Failed to generate embedding for memory", memoryId, error);
    }
  }

  // Helper function to escape special characters in LIKE patterns
  #escapeLikePattern(str) {
    // Escape special SQLite LIKE characters: % _ [ ] \
    return str.replace(/[%_\[\]\\]/g, '\\$&');
  }

  searchMemories({ scope, query, topK = 5 }) {
    if (!scope) return [];
    if (query && query.trim()) {
      // Escape special characters to prevent "pattern too complex" errors
      const escaped = this.#escapeLikePattern(query.trim());
      const like = `%${escaped}%`;
      const stmt = this.db.prepare(
        "SELECT text, meta_json FROM memories WHERE scope = ? AND (text LIKE ? ESCAPE '\\' OR IFNULL(meta_json,'') LIKE ? ESCAPE '\\') ORDER BY created_at DESC LIMIT ?"
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

  /**
   * Semantic search using embeddings (when available)
   * Falls back to keyword search if embeddings not available
   */
  async searchMemoriesSemantic({ scope, query, topK = 5 }) {
    if (!scope || !query?.trim()) {
      return this.searchMemories({ scope, query, topK });
    }

    // Check if embeddings are enabled
    if (!this.embeddings.isEnabled()) {
      console.log("Semantic search not available, falling back to keyword search");
      return this.searchMemories({ scope, query, topK });
    }

    try {
      // Generate embedding for query
      const queryVector = await this.embeddings.generateEmbedding(query);
      if (!queryVector) {
        return this.searchMemories({ scope, query, topK });
      }

      // Get all memories with embeddings for this scope
      const stmt = this.db.prepare(`
        SELECT m.text, m.meta_json, e.vector_json
        FROM memories m
        INNER JOIN embeddings e ON m.id = e.memory_id
        WHERE m.scope = ?
      `);
      const rows = stmt.all(scope);

      if (rows.length === 0) {
        return this.searchMemories({ scope, query, topK });
      }

      // Calculate similarity scores
      const scored = rows.map((row) => {
        const vector = JSON.parse(row.vector_json);
        const similarity = this.embeddings.cosineSimilarity(queryVector, vector);
        return {
          text: row.text,
          meta: row.meta_json ? JSON.parse(row.meta_json) : {},
          score: similarity,
        };
      });

      // Sort by similarity and return top K
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, topK);
    } catch (error) {
      console.error("Semantic search failed, falling back to keyword search:", error);
      return this.searchMemories({ scope, query, topK });
    }
  }

  /**
   * Alias for searchMemoriesSemantic for consistency with API
   */
  async semanticSearch({ scope, query, topK = 5 }) {
    return await this.searchMemoriesSemantic({ scope, query, topK });
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

  // ============================================
  // TEMPLATE METHODS
  // ============================================
  
  createTemplate({ id, name, description, category, taskTemplate, tags, userId, isPublic = false }) {
    const stmt = this.db.prepare(
      "INSERT INTO templates(id, name, description, category, task_template, tags_json, user_id, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, name, description, category, taskTemplate, tags ? JSON.stringify(tags) : null, userId, isPublic ? 1 : 0);
    return id;
  }

  getTemplate(id) {
    const stmt = this.db.prepare("SELECT * FROM templates WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      taskTemplate: row.task_template,
      tags: row.tags_json ? JSON.parse(row.tags_json) : [],
      userId: row.user_id,
      isPublic: !!row.is_public,
      usageCount: row.usage_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  listTemplates({ userId, category, isPublic, limit = 50 }) {
    let query = "SELECT * FROM templates WHERE 1=1";
    const params = [];
    
    if (userId) {
      query += " AND (user_id = ? OR is_public = 1)";
      params.push(userId);
    } else if (isPublic !== undefined) {
      query += " AND is_public = ?";
      params.push(isPublic ? 1 : 0);
    }
    
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    
    query += " ORDER BY usage_count DESC, created_at DESC LIMIT ?";
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      taskTemplate: row.task_template,
      tags: row.tags_json ? JSON.parse(row.tags_json) : [],
      userId: row.user_id,
      isPublic: !!row.is_public,
      usageCount: row.usage_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  incrementTemplateUsage(id) {
    const stmt = this.db.prepare("UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?");
    stmt.run(id);
  }

  deleteTemplate(id) {
    const stmt = this.db.prepare("DELETE FROM templates WHERE id = ?");
    stmt.run(id);
  }

  // ============================================
  // WORKFLOW METHODS
  // ============================================

  createWorkflow({ id, name, description, userId, mode, task }) {
    const stmt = this.db.prepare(
      "INSERT INTO workflows(id, name, description, user_id, mode, task) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, name, description, userId, mode, task);
    return id;
  }

  updateWorkflow(id, { status, resultJson, executionTime }) {
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (resultJson !== undefined) {
      updates.push("result_json = ?");
      params.push(JSON.stringify(resultJson));
    }
    if (executionTime !== undefined) {
      updates.push("execution_time = ?");
      params.push(executionTime);
    }
    if (status === 'completed' || status === 'failed') {
      updates.push("executed_at = datetime('now')");
    }
    
    if (updates.length === 0) return;
    
    params.push(id);
    const stmt = this.db.prepare(`UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
  }

  getWorkflow(id) {
    const stmt = this.db.prepare("SELECT * FROM workflows WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      mode: row.mode,
      task: row.task,
      status: row.status,
      result: row.result_json ? JSON.parse(row.result_json) : null,
      executionTime: row.execution_time,
      createdAt: row.created_at,
      executedAt: row.executed_at
    };
  }

  listWorkflows({ userId, status, limit = 50 }) {
    let query = "SELECT * FROM workflows WHERE 1=1";
    const params = [];
    
    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      mode: row.mode,
      task: row.task,
      status: row.status,
      result: row.result_json ? JSON.parse(row.result_json) : null,
      executionTime: row.execution_time,
      createdAt: row.created_at,
      executedAt: row.executed_at
    }));
  }

  deleteWorkflow(id) {
    const stmt = this.db.prepare("DELETE FROM workflows WHERE id = ?");
    stmt.run(id);
  }

  addWorkflowStep({ workflowId, stepNumber, agentName, task, output, executionTime, status }) {
    const stmt = this.db.prepare(
      "INSERT INTO workflow_steps(workflow_id, step_number, agent_name, task, output, execution_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(workflowId, stepNumber, agentName, task, output, executionTime, status || 'completed');
  }

  getWorkflowSteps(workflowId) {
    const stmt = this.db.prepare("SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_number");
    return stmt.all(workflowId);
  }

  // ============================================
  // ANALYTICS METHODS
  // ============================================

  logEvent({ eventType, eventData, userId, sessionId }) {
    const stmt = this.db.prepare(
      "INSERT INTO analytics_events(event_type, event_data_json, user_id, session_id) VALUES (?, ?, ?, ?)"
    );
    stmt.run(eventType, eventData ? JSON.stringify(eventData) : null, userId, sessionId);
  }

  getAnalytics({ eventType, userId, startDate, endDate, limit = 100 }) {
    let query = "SELECT * FROM analytics_events WHERE 1=1";
    const params = [];
    
    if (eventType) {
      query += " AND event_type = ?";
      params.push(eventType);
    }
    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }
    if (startDate) {
      query += " AND created_at >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND created_at <= ?";
      params.push(endDate);
    }
    
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params).map(row => ({
      id: row.id,
      eventType: row.event_type,
      eventData: row.event_data_json ? JSON.parse(row.event_data_json) : null,
      userId: row.user_id,
      sessionId: row.session_id,
      createdAt: row.created_at
    }));
  }

  recordPerformanceMetric({ metricType, metricName, value, unit, context, sessionId }) {
    const stmt = this.db.prepare(
      "INSERT INTO performance_metrics(metric_type, metric_name, value, unit, context_json, session_id) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(metricType, metricName, value, unit, context ? JSON.stringify(context) : null, sessionId);
  }

  getPerformanceMetrics({ metricType, startDate, endDate, limit = 100 }) {
    let query = "SELECT * FROM performance_metrics WHERE 1=1";
    const params = [];
    
    if (metricType) {
      query += " AND metric_type = ?";
      params.push(metricType);
    }
    if (startDate) {
      query += " AND created_at >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND created_at <= ?";
      params.push(endDate);
    }
    
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  // ============================================
  // APPROVAL METHODS (Human-in-the-loop)
  // ============================================

  createApproval({ id, workflowId, stepNumber, question, options, userId }) {
    const stmt = this.db.prepare(
      "INSERT INTO approvals(id, workflow_id, step_number, question, options_json, user_id) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, workflowId, stepNumber, question, options ? JSON.stringify(options) : null, userId);
    return id;
  }

  updateApproval(id, { response, status }) {
    const stmt = this.db.prepare(
      "UPDATE approvals SET response = ?, status = ?, responded_at = datetime('now') WHERE id = ?"
    );
    stmt.run(response, status, id);
  }

  getApproval(id) {
    const stmt = this.db.prepare("SELECT * FROM approvals WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      workflowId: row.workflow_id,
      stepNumber: row.step_number,
      question: row.question,
      options: row.options_json ? JSON.parse(row.options_json) : null,
      response: row.response,
      status: row.status,
      userId: row.user_id,
      createdAt: row.created_at,
      respondedAt: row.responded_at
    };
  }

  getPendingApprovals(userId) {
    const stmt = this.db.prepare(
      "SELECT * FROM approvals WHERE user_id = ? AND status = 'pending' ORDER BY created_at"
    );
    return stmt.all(userId).map(row => ({
      id: row.id,
      workflowId: row.workflow_id,
      stepNumber: row.step_number,
      question: row.question,
      options: row.options_json ? JSON.parse(row.options_json) : null,
      createdAt: row.created_at
    }));
  }

  // ============================================
  // TEST RESULTS METHODS
  // ============================================

  recordTestResult({ workflowId, testSuite, testName, status, duration, errorMessage, output }) {
    const stmt = this.db.prepare(
      "INSERT INTO test_results(workflow_id, test_suite, test_name, status, duration, error_message, output_json) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(workflowId, testSuite, testName, status, duration, errorMessage, output ? JSON.stringify(output) : null);
  }

  getTestResults(workflowId) {
    const stmt = this.db.prepare("SELECT * FROM test_results WHERE workflow_id = ? ORDER BY created_at");
    return stmt.all(workflowId).map(row => ({
      id: row.id,
      workflowId: row.workflow_id,
      testSuite: row.test_suite,
      testName: row.test_name,
      status: row.status,
      duration: row.duration,
      errorMessage: row.error_message,
      output: row.output_json ? JSON.parse(row.output_json) : null,
      createdAt: row.created_at
    }));
  }
}
