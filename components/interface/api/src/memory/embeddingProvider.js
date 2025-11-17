import { fetch } from "undici";

/**
 * EmbeddingProvider - Generates embeddings for semantic search
 * Uses Google's Gemini API for text embeddings
 */
export class EmbeddingProvider {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.LLM_API_KEY;
    this.baseURL = process.env.LLM_BASE_URL || "https://generativelanguage.googleapis.com";
    this.model = "text-embedding-004"; // Google's latest embedding model
    this.enabled = !!this.apiKey;
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]|null>} - Embedding vector or null if disabled/failed
   */
  async generateEmbedding(text) {
    if (!this.enabled) {
      console.warn("Embeddings disabled - no API key configured");
      return null;
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return null;
    }

    try {
      const url = `${this.baseURL}/v1/models/${this.model}:embedContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: `models/${this.model}`,
          content: {
            parts: [{ text: text.substring(0, 10000) }], // Limit to 10k chars
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Embedding API error:", error);
        return null;
      }

      const data = await response.json();
      return data.embedding?.values || null;
    } catch (error) {
      console.error("Error generating embedding:", error.message);
      return null;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} - Similarity score (0-1)
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Check if embeddings are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}
