/*
 * SOLIDARITY PLATFORM - AI ROUTER
 * ================================
 *
 * Routes AI requests based on tier and provider availability.
 * Personal tier: Ollama (free, local)
 * Business tier: Perplexity Sonar with Ollama fallback
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const OllamaProvider = require('./OllamaProvider');
const PerplexityProvider = require('./PerplexityProvider');

class AIRouter {
  constructor(opts = {}) {
    this.ollama = new OllamaProvider(opts.ollama || {});
    this.perplexity = new PerplexityProvider(opts.perplexity || {});
    this.tier = opts.tier || process.env.TIER || 'personal';
  }

  /**
   * Chat using the appropriate provider for the configured tier.
   * @param {Array<{role: string, content: string}>} messages
   * @param {object} opts
   * @returns {Promise<{role: string, content: string, provider: string}>}
   */
  async chat(messages, opts = {}) {
    if (this.tier === 'business' && this.perplexity.isConfigured()) {
      try {
        const result = await this.perplexity.chat(messages, opts);
        return { ...result, provider: 'perplexity' };
      } catch {
        // Fall back to Ollama
      }
    }

    // Personal tier or business fallback: use Ollama
    try {
      const available = await this.ollama.checkAvailability();
      if (available) {
        const result = await this.ollama.chat(messages, opts);
        return { ...result, provider: 'ollama' };
      }
    } catch {
      // Ollama not available
    }

    // Neither provider available
    return {
      role: 'assistant',
      content: 'AI is currently offline. For local AI, start Ollama with: ollama serve',
      provider: 'none',
    };
  }

  /**
   * Get status of all configured providers.
   * @returns {Promise<object>}
   */
  async getStatus() {
    const ollamaAvailable = await this.ollama.checkAvailability();
    let ollamaModels = [];
    if (ollamaAvailable) {
      try {
        ollamaModels = await this.ollama.listModels();
      } catch {
        // ignore
      }
    }

    return {
      tier: this.tier,
      ollama: {
        available: ollamaAvailable,
        url: this.ollama.baseUrl,
        model: this.ollama.model,
        models: ollamaModels.map(m => m.name || m),
      },
      perplexity: {
        configured: this.perplexity.isConfigured(),
        model: this.perplexity.model,
      },
    };
  }
}

module.exports = AIRouter;
