/*
 * SOLIDARITY PLATFORM - SETTINGS & LOGS ROUTES
 * ==============================================
 *
 * User settings and activity log endpoints with SQLite persistence
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const { stmts } = require('../db');
const { optionalAuth } = require('../middleware/auth');

// GET /api/user/settings — Get current user settings
router.get('/settings', optionalAuth, (req, res) => {
  const row = stmts.getSettings.get(req.user.id);
  const settings = row
    ? { theme: row.theme, safetyLevel: row.safety_level, notifications: !!row.notifications }
    : { theme: 'dark', safetyLevel: 0.618, notifications: true };
  res.json({ success: true, settings });
});

// PUT /api/user/settings — Update user settings
router.put('/settings', optionalAuth, (req, res) => {
  const current = stmts.getSettings.get(req.user.id);
  const merged = {
    theme: req.body.theme ?? current?.theme ?? 'dark',
    safetyLevel: req.body.safetyLevel ?? current?.safety_level ?? 0.618,
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

module.exports = router;
