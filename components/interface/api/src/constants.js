/**
 * Application Constants
 * Centralized configuration values and magic numbers
 */

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  ADK_PIPELINE: 180_000,          // 3 minutes - for ADK pipeline execution
  OUTPUT_EXECUTION: 300_000,      // 5 minutes - for output.py execution
  SSE_HEARTBEAT: 15_000,          // 15 seconds - Server-Sent Events heartbeat
  COMMAND_EXECUTION: 30_000,      // 30 seconds - general command execution
  LLM_REQUEST: 60_000,            // 1 minute - LLM API request timeout
  RETRY_DELAY_BASE: 1_000,        // 1 second - base delay for exponential backoff
};

// Limits
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 10_000,     // Maximum chat message length in characters
  MAX_HISTORY_LENGTH: 100,        // Maximum chat history messages
  MAX_FILE_SIZE: 1024 * 1024,     // 1MB - maximum file size for operations
  MAX_SEARCH_RESULTS: 50,         // Maximum search results to return
  MAX_RETRIES: 3,                 // Maximum retry attempts for failed operations
  MAX_CONTEXT_MESSAGES: 30,       // Maximum context messages for memory retrieval
  MAX_EMBEDDINGS_BATCH: 100,      // Maximum embeddings to process in one batch
};

// Rate Limiting
export const RATE_LIMITS = {
  API: {
    WINDOW_MS: 15 * 60 * 1000,    // 15 minutes
    MAX_REQUESTS: 100,             // requests per window
  },
  ADK: {
    WINDOW_MS: 60 * 60 * 1000,    // 1 hour
    MAX_REQUESTS: 10,              // ADK is expensive, limit heavily
  },
  CHAT: {
    WINDOW_MS: 1 * 60 * 1000,     // 1 minute
    MAX_REQUESTS: 20,              // reasonable chat rate
  },
};

// Database
export const DATABASE = {
  DEFAULT_PATH: 'data/memory.db',
  WAL_MODE: true,                 // Write-Ahead Logging for better concurrency
  CACHE_SIZE: -2000,              // 2MB cache (negative means KB)
  BUSY_TIMEOUT: 5000,             // 5 seconds before throwing SQLITE_BUSY
  JOURNAL_MODE: 'WAL',
};

// Cache
export const CACHE = {
  STATS_TTL: 60_000,              // 1 minute - cache TTL for memory stats
  SESSION_TTL: 300_000,           // 5 minutes - cache TTL for session data
};

// Paths
export const PATHS = {
  ARTIFACTS_DIR: 'generated',     // Directory for generated artifacts
  LOGS_DIR: 'logs',               // Directory for log files
  DATA_DIR: 'data',               // Directory for database files
};

// HTTP Status Codes (for clarity)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// LLM Provider Configuration
export const LLM = {
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2048,
  RETRY_STATUS_CODES: [429, 500, 502, 503, 504],
  RETRY_ERROR_PATTERNS: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'timeout'],
};

// Memory/Embeddings
export const MEMORY = {
  DEFAULT_TOP_K: 5,               // Default number of memories to retrieve
  DEFAULT_SCOPE: 'global',
  SEMANTIC_SEARCH_THRESHOLD: 0.7, // Minimum similarity score for semantic search
};

// Logging
export const LOG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
};
