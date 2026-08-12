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
const {
  PHI,
  BRIDGING_BASELINE,
  HENRY_BASE,
  HENRY_DOUBLE,
  HENRY_SQUARE,
  CONTROL_RATIO,
  SACRED_NODES
} = require('../../utils/constants');
const logger = require('../../utils/logger');

// AIRouter instance — coherence engine can be attached after system boot
const aiRouter = new AIRouter();

// Attach coherence engine (called from server.js after financial system boots)
function attachCoherence(coherenceEngine) {
  aiRouter.coherence = coherenceEngine;
}

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
        fallbackSuggestion: 'Start Ollama locally with `ollama serve`, then retry your request.',
      });
    }

    res.json({
      success: true,
      response: result.content,
      provider: result.provider,
      coherenceMode: result.coherenceMode || 'standard',
    });
  } catch (err) {
    logger.warn('AI chat error', { error: err.message });
    res.json({
      success: false,
      error: err.message,
      offline: true,
      fallbackSuggestion: 'Verify the local AI service is available, or retry once system health returns to optimal range.',
    });
  }
});

// GET /api/ai/live-context — Live data context for AI (market status, system health)
router.get('/live-context', optionalAuth, async (req, res) => {
  try {
    const status = await aiRouter.getStatus();
    res.json({
      success: true,
      safetyLevel: BRIDGING_BASELINE,
      phi: PHI,
      sacredNodes: SACRED_NODES,
      henryProgression: {
        base: HENRY_BASE,
        double: HENRY_DOUBLE,
        square: HENRY_SQUARE,
        controlRatio: CONTROL_RATIO,
      },
      flowMode: status.coherence?.mode || 'standard',
      context: {
        aiAvailable: status.available || false,
        provider: status.provider || 'none',
        systemHealth: 'operational',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.json({
      success: true,
      safetyLevel: BRIDGING_BASELINE,
      phi: PHI,
      sacredNodes: SACRED_NODES,
      henryProgression: {
        base: HENRY_BASE,
        double: HENRY_DOUBLE,
        square: HENRY_SQUARE,
        controlRatio: CONTROL_RATIO,
      },
      flowMode: 'standard',
      context: {
        aiAvailable: false,
        provider: 'none',
        systemHealth: 'operational',
        timestamp: new Date().toISOString()
      }
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
module.exports.attachCoherence = attachCoherence;
