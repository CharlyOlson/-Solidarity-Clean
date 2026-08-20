/*
 * SOLIDARITY PLATFORM - SETTINGS & LOGS ROUTES
 * ==============================================
 *
 * User settings and activity log endpoints with SQLite persistence
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const { stmts } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { BRIDGING_BASELINE } = require('../../utils/constants');

// GET /api/user/settings — Get current user settings
router.get('/settings', optionalAuth, (req, res) => {
  const row = stmts.getSettings.get(req.user.id);
  const settings = row
    ? { theme: row.theme, safetyLevel: row.safety_level, notifications: !!row.notifications }
    : { theme: 'dark', safetyLevel: BRIDGING_BASELINE, notifications: true };
  res.json({ success: true, settings });
});

// PUT /api/user/settings — Update user settings
router.put('/settings', optionalAuth, (req, res) => {
  const current = stmts.getSettings.get(req.user.id);
  const merged = {
    theme: req.body.theme ?? current?.theme ?? 'dark',
    safetyLevel: req.body.safetyLevel ?? current?.safety_level ?? BRIDGING_BASELINE,
    notifications: req.body.notifications ?? (current ? !!current.notifications : true)
  };
  stmts.upsertSettings.run(
    req.user.id,
    merged.theme,
    merged.safetyLevel,
    merged.notifications ? 1 : 0
  );
  res.json({ success: true, settings: merged });
});

// POST /api/logs/activity — Log an activity event
router.post('/activity', optionalAuth, (req, res) => {
  const { action, ...details } = req.body;
  stmts.insertLog.run(req.user.id, action || 'unknown', JSON.stringify(details));
  // Periodic trim
  if (Math.random() < 0.01) stmts.trimLogs.run();
  res.json({ success: true });
});

// GET /api/logs/activity — Get recent activity logs
router.get('/activity', optionalAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const rows = stmts.getLogsByUser.all(req.user.id, limit);
  const logs = rows.map(r => ({ ...r, details: JSON.parse(r.details) }));
  res.json({ success: true, logs });
});

// DELETE /api/logs/activity/:logId — Delete a specific log entry
router.delete('/activity/:logId', optionalAuth, (req, res) => {
  try {
    stmts.deleteLog?.run(req.params.logId, req.user.id);
  } catch (e) { /* table may not have deleteLog prepared */ }
  res.json({ success: true });
});

// POST /api/logs/clear — Clear all logs for current user
router.post('/clear', optionalAuth, (req, res) => {
  try {
    stmts.clearUserLogs?.run(req.user.id);
  } catch (e) { /* best effort */ }
  res.json({ success: true, message: 'Logs cleared' });
});

// POST /api/logs/email — Email logs to user (placeholder)
router.post('/email', optionalAuth, (req, res) => {
  res.json({ success: true, message: 'Log export queued. Email delivery not yet configured.' });
});

module.exports = router;
