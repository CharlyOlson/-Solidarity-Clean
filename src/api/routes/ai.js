/*
 * SOLIDARITY PLATFORM - AI ROUTES
 * ================================
 *
 * Ollama AI integration endpoints
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const { queryOllama, getAISystemStatus } = require('../../../ai_integration/ollama_integration');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../../utils/logger');

// POST /api/ai/query — Direct Ollama query
router.post('/query', optionalAuth, async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const result = await queryOllama(prompt, options || {});
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error('Ollama query error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/status — AI system status
router.get('/status', (req, res) => {
  try {
    const status = getAISystemStatus();
    res.json({ success: true, status });
  } catch (err) {
    logger.error('AI status error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/chat — Chat endpoint (frontend OllamaHome & HankoStamps)
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, safetyLevel = 0.618 } = req.body;
    const result = await queryOllama(message, { safetyLevel });
    const text = typeof result === 'string' ? result
      : result.response || result.text || result.error || JSON.stringify(result);
    res.json({ success: true, response: text });
  } catch (err) {
    logger.warn('AI chat fallback (Ollama offline)', { error: err.message });
    res.json({
      success: true,
      response: `I'm currently in offline mode (Ollama is not running). `
        + `To enable AI responses, start Ollama with: ollama serve\n\n`
        + `Your question: "${req.body.message}"\n\n`
        + `Platform Status: Safety Level ${req.body.safetyLevel || 0.618} | φ = 1.618`,
      offline: true
    });
  }
});

// GET /api/ai/live-context — Live context for frontend OllamaHome
router.get('/live-context', (req, res) => {
  try {
    const status = getAISystemStatus();
    res.json({
      success: true,
      safetyLevel: 0.618,
      phi: 1.618033988749895,
      sacredNodes: [1, 3, 4, 7, 14, 21, 49],
      aiStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ success: true, safetyLevel: 0.618, phi: 1.618033988749895, offline: true });
  }
});

module.exports = router;
