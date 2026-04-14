/*
 * SOLIDARITY PLATFORM - PERPLEXITY PROVIDER
 * ==========================================
 *
 * Perplexity Sonar API client for subscription-tier AI access.
 * Requires a PERPLEXITY_API_KEY for authentication.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const axios = require('axios');

class PerplexityProvider {
  constructor(opts = {}) {
    this.apiKey = opts.apiKey || process.env.PERPLEXITY_API_KEY;
    this.model = opts.model || 'sonar';
    this.baseUrl = 'https://api.perplexity.ai';
  }

  /**
   * Check if the provider is configured (has an API key).
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Chat with Perplexity Sonar API.
   * @param {Array<{role: string, content: string}>} messages
   * @param {object} opts - Optional: model, temperature, max_tokens
   * @returns {Promise<{role: string, content: string}>}
   */
  async chat(messages, opts = {}) {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const res = await axios.post(`${this.baseUrl}/chat/completions`, {
      model: opts.model || this.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens || 1024,
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    const choice = res.data.choices && res.data.choices[0];
    return choice ? choice.message : { role: 'assistant', content: '' };
  }
}

module.exports = PerplexityProvider;
