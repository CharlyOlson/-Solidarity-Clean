/*
 * SOLIDARITY PLATFORM - SESSION ROUTES
 * =====================================
 *
 * Session management and interaction logging
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const { startSession, loadHistory, logInteraction, pushToBin } = require('../../../launcher');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../../utils/logger');

// POST /api/session/start — Start new session and get AI answer
router.post('/start', optionalAuth, async (req, res) => {
  try {
    const { prompt, context, settings } = req.body;
    const sessionResult = await startSession(prompt || 'Hello!', context, settings);
    res.json({ success: true, ...sessionResult });
  } catch (err) {
    logger.error('Session start error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/session/log — Log interaction
router.post('/log', optionalAuth, (req, res) => {
  try {
    const { session, prompt, response, meta } = req.body;
    logInteraction(session, prompt, response, meta);
    res.json({ success: true });
  } catch (err) {
    logger.error('Session log error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/session/bin — Push irrelevant data to bin
router.post('/bin', optionalAuth, (req, res) => {
  try {
    const { session, data } = req.body;
    pushToBin(session, data);
    res.json({ success: true });
  } catch (err) {
    logger.error('Session bin error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/session/history — Load previous history
router.get('/history', optionalAuth, (req, res) => {
  try {
    const { limit } = req.query;
    const history = loadHistory(limit ? parseInt(limit) : 3);
    res.json({ success: true, history });
  } catch (err) {
    logger.error('Session history error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
