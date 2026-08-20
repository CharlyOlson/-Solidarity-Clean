/*
 * SOLIDARITY PLATFORM - SESSION ROUTES
 * =====================================
 *
 * Session management and interaction logging
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson


 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { startSession, loadHistory, logInteraction, pushToBin } = require('../../../launcher');
const { stmts } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../../utils/logger');

const sessionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(sessionRateLimit);

// POST /api/session/start — Start new session and get AI answer
router.post('/start', optionalAuth, async (req, res) => {
  try {
    const { prompt, context, settings } = req.body;
    const timeoutMs = 10000;
    const sessionResult = await Promise.race([
      startSession(prompt || 'Hello!', context, settings),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Session start timed out')), timeoutMs))
    ]);
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

// POST /api/session/complete — Record completion marker and metrics
router.post('/complete', optionalAuth, (req, res) => {
  try {
    const {
      sessionId,
      filesModified = 0,
      testsPassing = 0,
      vulnerabilitiesFixed = 0,
      metrics = {}
    } = req.body;

    const completionSessionId = sessionId || `session-${Date.now()}`;
    const finalMetrics = {
      sessionEndMarker: true,
      completedAt: new Date().toISOString(),
      ...metrics
    };

    stmts.insertSessionCompletionReport.run(
      req.user.id,
      completionSessionId,
      'completed',
      Number(filesModified) || 0,
      Number(testsPassing) || 0,
      Number(vulnerabilitiesFixed) || 0,
      JSON.stringify(finalMetrics)
    );

    res.json({
      success: true,
      sessionId: completionSessionId,
      status: 'completed',
      metrics: finalMetrics
    });
  } catch (err) {
    logger.error('Session completion error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/session/completion-reports — Retrieve completion markers
router.get('/completion-reports', optionalAuth, (req, res) => {
  try {
    const reports = stmts.listSessionCompletionReportsByUser.all(req.user.id).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      status: row.status,
      filesModified: row.files_modified,
      testsPassing: row.tests_passing,
      vulnerabilitiesFixed: row.vulnerabilities_fixed,
      metrics: JSON.parse(row.metrics || '{}'),
      completedAt: row.completed_at
    }));
    res.json({ success: true, reports });
  } catch (err) {
    logger.error('Session completion history error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
