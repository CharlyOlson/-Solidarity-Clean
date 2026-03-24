/*
 * SOLIDARITY PLATFORM - AI ROUTES
 * ================================
 *
 * Ollama AI integration endpoints
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
const { queryOllama, getAISystemStatus } = require('../../../ai_integration/ollama_integration');
const { BridgingSafetyCoordinator } = require('../../safety/BridgingSafetyCoordinator');
const CoreMathematicsEngine = require('../../utils/CoreMathematicsEngine');
const { BRIDGING_BASELINE } = require('../../utils/constants');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../../utils/logger');

// Live instances — used to feed real computed values into responses
const safetyCoordinator = new BridgingSafetyCoordinator();
const coreEngine = new CoreMathematicsEngine();

// POST /api/ai/query — Direct Ollama query
router.post('/query', optionalAuth, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    // Propagate safetyLevel from coordinator if not specified in options
    if (!options.safetyLevel) {
      options.safetyLevel = safetyCoordinator.componentLevels.ai;
    }
    const result = await queryOllama(prompt, options);
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
    res.json({
      success: true,
      status,
      safetyLevel: safetyCoordinator.componentLevels.ai
    });
  } catch (err) {
    logger.error('AI status error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/chat — Chat endpoint (frontend OllamaHome & HankoStamps)
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, safetyLevel = BRIDGING_BASELINE } = req.body;
    const result = await queryOllama(message, { safetyLevel });

    if (!result.success) {
      // Ollama not running or query failed — return honest status
      return res.json({
        success: false,
        error: result.error || 'AI query failed',
        offline: true,
        fallbackSuggestion: result.fallbackSuggestion || 'Start Ollama with: ollama serve',
        safetyLevel,
      });
    }

    const text = typeof result === 'string' ? result
      : result.response || result.text || result.content || JSON.stringify(result);
    res.json({ success: true, response: text, safetyMode: result.safetyMode });
  } catch (err) {
    logger.warn('AI chat error', { error: err.message });
    res.json({
      success: false,
      error: err.message,
      offline: true,
      fallbackSuggestion: 'Ensure Ollama is running: ollama serve',
    });
  }
});

// GET /api/ai/live-context — Live context for frontend OllamaHome
router.get('/live-context', (req, res) => {
  try {
    const status = getAISystemStatus();
    const systemStatus = safetyCoordinator.getSystemStatus();
    const constants = coreEngine.getSystemConstants();

    res.json({
      success: true,
      safetyLevel: safetyCoordinator.componentLevels.ai,
      systemSafetyLevel: safetyCoordinator.componentLevels.system,
      flowMode: systemStatus.flowMode,
      phi: constants.phi,
      sacredNodes: constants.sacredNodes,
      henryProgression: {
        base: constants.henryBase,
        double: constants.henryDouble,
        square: constants.henrySquare,
        controlRatio: constants.controlRatio,
      },
      aiStatus: status,
      warnings: systemStatus.warnings,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error('Live context error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
