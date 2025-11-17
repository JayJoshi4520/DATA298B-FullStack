/**
 * Database Connection Pooling
 * Singleton pattern to ensure single database connection across all services
 */

import Database from 'better-sqlite3';
import path from 'path';
import { DATABASE } from './constants.js';

let dbInstance = null;
let dbPath = null;

/**
 * Get or create database instance (singleton)
 * @param {string} customPath - Optional custom path for database
 * @returns {Database} Database instance
 */
export function getDatabase(customPath = null) {
  const targetPath = customPath || path.resolve(process.cwd(), DATABASE.DEFAULT_PATH);
  
  // Return existing instance if path matches
  if (dbInstance && dbPath === targetPath) {
    return dbInstance;
  }
  
  // Close existing connection if path changed
  if (dbInstance) {
    console.log('Database path changed, closing old connection');
    try {
      dbInstance.close();
    } catch (error) {
      console.error('Error closing old database connection:', error);
    }
    dbInstance = null;
  }
  
  // Create new connection
  console.log(`Initializing database connection: ${targetPath}`);
  
  try {
    dbInstance = new Database(targetPath);
    dbPath = targetPath;
    
    // Configure database for optimal performance
    configureDatabase(dbInstance);
    
    // Test connection
    dbInstance.prepare('SELECT 1').get();
    
    console.log('✅ Database connection established');
    
    // Register cleanup on process exit
    registerCleanup();
    
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Configure database for optimal performance and concurrency
 * @param {Database} db - Database instance to configure
 */
function configureDatabase(db) {
  // Enable Write-Ahead Logging for better concurrency
  if (DATABASE.WAL_MODE) {
    db.pragma(`journal_mode = ${DATABASE.JOURNAL_MODE}`);
  }
  
  // Set cache size for better performance
  db.pragma(`cache_size = ${DATABASE.CACHE_SIZE}`);
  
  // Set busy timeout to prevent immediate failures on lock
  db.pragma(`busy_timeout = ${DATABASE.BUSY_TIMEOUT}`);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Synchronous mode for better durability (NORMAL is a good balance)
  db.pragma('synchronous = NORMAL');
  
  // Memory-mapped I/O for faster reads
  db.pragma('mmap_size = 30000000000'); // 30GB
  
  console.log('📊 Database configuration applied:', {
    journal_mode: db.pragma('journal_mode', { simple: true }),
    cache_size: db.pragma('cache_size', { simple: true }),
    busy_timeout: db.pragma('busy_timeout', { simple: true }),
    foreign_keys: db.pragma('foreign_keys', { simple: true }),
  });
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (dbInstance) {
    console.log('Closing database connection...');
    try {
      dbInstance.close();
      dbInstance = null;
      dbPath = null;
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

/**
 * Check if database is connected
 * @returns {boolean}
 */
export function isConnected() {
  if (!dbInstance) return false;
  
  try {
    dbInstance.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get database health information
 * @returns {object} Health information
 */
export function getDatabaseHealth() {
  if (!isConnected()) {
    return {
      connected: false,
      path: dbPath,
      error: 'Not connected',
    };
  }
  
  try {
    const info = dbInstance.prepare(`
      SELECT 
        page_count * page_size as size,
        page_count,
        page_size
      FROM pragma_page_count(), pragma_page_size()
    `).get();
    
    return {
      connected: true,
      path: dbPath,
      size: info.size,
      pageCount: info.page_count,
      pageSize: info.page_size,
      inTransaction: dbInstance.inTransaction,
      walMode: dbInstance.pragma('journal_mode', { simple: true }) === 'wal',
    };
  } catch (error) {
    return {
      connected: true,
      path: dbPath,
      error: error.message,
    };
  }
}

/**
 * Register cleanup handlers for graceful shutdown
 */
let cleanupRegistered = false;
function registerCleanup() {
  if (cleanupRegistered) return;
  
  cleanupRegistered = true;
  
  const cleanup = () => {
    closeDatabase();
  };
  
  // Register cleanup on various exit signals
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    cleanup();
    process.exit(1);
  });
}

/**
 * Export singleton instance getter
 */
export default {
  getDatabase,
  closeDatabase,
  isConnected,
  getDatabaseHealth,
};
