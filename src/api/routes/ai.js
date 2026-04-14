/*
 * SOLIDARITY PLATFORM - AI ROUTES
 * ================================
 *
 * AI chat and status endpoints using AIRouter.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const AIRouter = require('../../ai/AIRouter');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../../utils/logger');

const aiRouter = new AIRouter();

// POST /api/ai/chat — Chat with AI (routes to Ollama or Perplexity based on tier)
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { messages, message } = req.body;

    // Support both { messages: [...] } and legacy { message: "string" } format
    const chatMessages = messages || [{ role: 'user', content: message || '' }];

    const result = await aiRouter.chat(chatMessages);

    if (result.provider === 'none') {
      return res.json({
        success: false,
        error: result.content,
        offline: true,
        provider: 'none',
      });
    }

    res.json({
      success: true,
      response: result.content,
      provider: result.provider,
    });
  } catch (err) {
    logger.warn('AI chat error', { error: err.message });
    res.json({
      success: false,
      error: err.message,
      offline: true,
    });
  }
});

// GET /api/ai/status — Which providers are available
router.get('/status', async (req, res) => {
  try {
    const status = await aiRouter.getStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    logger.error('AI status error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
