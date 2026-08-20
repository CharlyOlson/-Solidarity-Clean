/*
 * SOLIDARITY PLATFORM - OLLAMA PROVIDER
 * ======================================
 *
 * Clean Ollama REST API client for local AI inference.
 * Talks to a local Ollama instance — no API keys needed.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const axios = require('axios');

class OllamaProvider {
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = opts.model || process.env.OLLAMA_MODEL || 'llama3.2:3b';
    this.available = false;
  }

  /**
   * Check if Ollama is running and reachable.
   * @returns {Promise<boolean>}
   */
  async checkAvailability() {
    try {
      const res = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3000 });
      this.available = res.status === 200;
      return this.available;
    } catch {
      this.available = false;
      return false;
    }
  }

  /**
   * List available models from the local Ollama instance.
   * @returns {Promise<Array>} Array of model objects
   */
  async listModels() {
    const res = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
    return res.data.models || [];
  }

  /**
   * Chat with Ollama using the /api/chat endpoint.
   * @param {Array<{role: string, content: string}>} messages
   * @param {object} opts - Optional: model, temperature, stream
   * @returns {Promise<{role: string, content: string}>}
   */
  async chat(messages, opts = {}) {
    const res = await axios.post(`${this.baseUrl}/api/chat`, {
      model: opts.model || this.model,
      messages,
      stream: false,
      options: {
        temperature: opts.temperature ?? 0.7,
      },
    }, { timeout: 60000 });

    return res.data.message || { role: 'assistant', content: '' };
  }

  /**
   * Generate a completion using the /api/generate endpoint.
   * @param {string} prompt
   * @param {object} opts - Optional: model, temperature, stream
   * @returns {Promise<string>} Generated text
   */
  async generate(prompt, opts = {}) {
    const res = await axios.post(`${this.baseUrl}/api/generate`, {
      model: opts.model || this.model,
      prompt,
      stream: false,
      options: {
        temperature: opts.temperature ?? 0.7,
      },
    }, { timeout: 60000 });

    return res.data.response || '';
  }
}

module.exports = OllamaProvider;
