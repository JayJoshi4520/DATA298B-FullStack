/**
 * Retry Utility with Exponential Backoff
 * For handling transient failures in LLM providers and other services
 */

import { LIMITS, TIMEOUTS, LLM } from '../constants.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = LIMITS.MAX_RETRIES,
    baseDelay = TIMEOUTS.RETRY_DELAY_BASE,
    maxDelay = 30_000, // 30 seconds max
    timeout = TIMEOUTS.LLM_REQUEST,
    onRetry = null, // Callback on retry
    shouldRetry = defaultShouldRetry, // Custom retry logic
  } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Wrap with timeout
      const result = await withTimeout(fn(), timeout);
      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(attempt, baseDelay, maxDelay);

      console.log(
        `⚠️ Retry attempt ${attempt}/${maxRetries} after ${delay}ms. Error: ${error.message}`
      );

      // Call retry callback if provided
      if (onRetry) {
        try {
          await onRetry(error, attempt, delay);
        } catch (callbackError) {
          console.error('Retry callback error:', callbackError);
        }
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but just in case
  throw lastError;
}

/**
 * Calculate delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number
 * @param {number} baseDelay - Base delay in ms
 * @param {number} maxDelay - Maximum delay in ms
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt, baseDelay, maxDelay) {
  // Exponential backoff: baseDelay * 2^(attempt-1)
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (random 0-25% of delay) to prevent thundering herd
  const jitter = Math.random() * 0.25 * cappedDelay;
  
  return Math.floor(cappedDelay + jitter);
}

/**
 * Default retry logic - checks for retryable errors
 * @param {Error} error - Error that occurred
 * @param {number} attempt - Current attempt number
 * @returns {boolean} Whether to retry
 */
function defaultShouldRetry(error, attempt) {
  // Check HTTP status codes
  if (error.status && LLM.RETRY_STATUS_CODES.includes(error.status)) {
    return true;
  }

  // Check error messages for network issues
  const errorMessage = error.message?.toLowerCase() || '';
  for (const pattern of LLM.RETRY_ERROR_PATTERNS) {
    if (errorMessage.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // Check for specific error codes
  if (error.code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'].includes(error.code)) {
    return true;
  }

  // Don't retry client errors (4xx except 429)
  if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false;
  }

  // Default: don't retry
  return false;
}

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} Promise that rejects on timeout
 */
export function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Sleep for specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create retry logic specifically for LLM providers
 * @param {Function} fn - Async function to retry
 * @param {string} providerName - Name of the provider (for logging)
 * @returns {Promise} Result of function
 */
export async function retryLLMRequest(fn, providerName = 'LLM') {
  return retryWithBackoff(fn, {
    maxRetries: LIMITS.MAX_RETRIES,
    baseDelay: TIMEOUTS.RETRY_DELAY_BASE,
    timeout: TIMEOUTS.LLM_REQUEST,
    onRetry: async (error, attempt, delay) => {
      console.log(
        `🔄 [${providerName}] Retrying request (${attempt}/${LIMITS.MAX_RETRIES}) in ${delay}ms`
      );
      console.log(`   Error: ${error.message}`);
    },
    shouldRetry: (error, attempt) => {
      // Custom LLM-specific retry logic
      const shouldRetry = defaultShouldRetry(error, attempt);
      
      if (!shouldRetry) {
        console.log(`❌ [${providerName}] Not retrying: ${error.message}`);
      }
      
      return shouldRetry;
    },
  });
}

/**
 * Batch retry - retry multiple operations and collect results
 * @param {Array<Function>} operations - Array of async functions
 * @param {Object} options - Retry options
 * @returns {Promise<Array>} Array of results (null for failed operations)
 */
export async function retryBatch(operations, options = {}) {
  const results = await Promise.allSettled(
    operations.map(op => retryWithBackoff(op, options))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Batch operation ${index} failed:`, result.reason);
      return null;
    }
  });
}

export default {
  retryWithBackoff,
  retryLLMRequest,
  retryBatch,
  withTimeout,
};
