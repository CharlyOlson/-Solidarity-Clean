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

// Coherence-gated AI behavior thresholds
// Maps ThreeBodyCoherence levels to AI operating constraints
const COHERENCE_GATES = {
  critical: {
    mode: 'essential_only',
    maxTokens: 150,
    temperature: 0.1,
    systemNote: 'System coherence is critical. Respond briefly with essential information only.',
  },
  degraded: {
    mode: 'conservative',
    maxTokens: 500,
    temperature: 0.3,
    systemNote: 'System coherence is degraded. Provide helpful but concise responses.',
  },
  stable: {
    mode: 'standard',
    maxTokens: 1024,
    temperature: 0.7,
    systemNote: null, // No restriction
  },
  elevated: {
    mode: 'full',
    maxTokens: 2048,
    temperature: 0.7,
    systemNote: null,
  },
};

class AIRouter {
  constructor(opts = {}) {
    this.ollama = new OllamaProvider(opts.ollama || {});
    this.perplexity = new PerplexityProvider(opts.perplexity || {});
    this.tier = opts.tier || process.env.TIER || 'personal';
    // Optional: ThreeBodyCoherence instance for gating
    this.coherence = opts.coherence || null;
  }

  /**
   * Get the current coherence gate constraints.
   * Falls back to 'stable' if no coherence engine is attached.
   */
  getCoherenceGate() {
    if (!this.coherence) return COHERENCE_GATES.stable;
    const level = this.coherence.getLevel();
    return COHERENCE_GATES[level] || COHERENCE_GATES.stable;
  }

  /**
   * Chat using the appropriate provider for the configured tier.
   * Coherence-gated: system stress restricts AI behavior automatically.
   * @param {Array<{role: string, content: string}>} messages
   * @param {object} opts
   * @returns {Promise<{role: string, content: string, provider: string, coherenceMode: string}>}
   */
  async chat(messages, opts = {}) {
    const gate = this.getCoherenceGate();

    // Apply coherence gating to the request
    const gatedOpts = {
      ...opts,
      temperature: opts.temperature ?? gate.temperature,
      max_tokens: opts.max_tokens || gate.maxTokens,
    };

    // If coherence is restricted, prepend a system constraint
    let gatedMessages = [...messages];
    if (gate.systemNote) {
      gatedMessages = [
        { role: 'system', content: gate.systemNote },
        ...messages,
      ];
    }

    if (this.tier === 'business' && this.perplexity.isConfigured()) {
      try {
        const result = await this.perplexity.chat(gatedMessages, gatedOpts);
        return { ...result, provider: 'perplexity', coherenceMode: gate.mode };
      } catch {
        // Fall back to Ollama
      }
    }

    // Personal tier or business fallback: use Ollama
    try {
      const available = await this.ollama.checkAvailability();
      if (available) {
        const result = await this.ollama.chat(gatedMessages, gatedOpts);
        return { ...result, provider: 'ollama', coherenceMode: gate.mode };
      }
    } catch {
      // Ollama not available
    }

    // Neither provider available
    return {
      role: 'assistant',
      content: 'AI is currently offline. For local AI, start Ollama with: ollama serve',
      provider: 'none',
      coherenceMode: gate.mode,
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

    const gate = this.getCoherenceGate();

    return {
      tier: this.tier,
      coherence: {
        mode: gate.mode,
        score: this.coherence ? this.coherence.getScore() : null,
        level: this.coherence ? this.coherence.getLevel() : 'unknown',
      },
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
module.exports.COHERENCE_GATES = COHERENCE_GATES;
