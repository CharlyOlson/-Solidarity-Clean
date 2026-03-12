/*
 * SOLIDARITY PLATFORM - HANKO STAMPS ROUTES
 * ==========================================
 *
 * CRUD endpoints for Hanko Stamps with SQLite persistence
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
const logger = require('../../utils/logger');

// GET /api/hanko/my-stamps — List stamps for current user
router.get('/my-stamps', optionalAuth, (req, res) => {
  try {
    const rows = stmts.getStampsByUser.all(req.user.id);
    const stamps = rows.map(row => ({
      ...row,
      inputs: JSON.parse(row.inputs),
      preview: JSON.parse(row.preview)
    }));
    res.json({ success: true, stamps });
  } catch (err) {
    logger.error('Hanko list error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hanko/create — Create a new stamp
router.post('/create', optionalAuth, (req, res) => {
  try {
    const { inputs, preview, type = 'personal' } = req.body;
    const id = `hanko-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const convergenceScore = 0.618;

    stmts.createStamp.run(
      id,
      req.user.id,
      type,
      JSON.stringify(inputs || {}),
      JSON.stringify(preview || {}),
      convergenceScore
    );

    const stamp = stmts.getStampById.get(id);
    res.json({
      success: true,
      stamp: {
        ...stamp,
        inputs: JSON.parse(stamp.inputs),
        preview: JSON.parse(stamp.preview)
      }
    });
  } catch (err) {
    logger.error('Hanko create error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hanko/revoke/:id — Revoke a stamp
router.post('/revoke/:id', optionalAuth, (req, res) => {
  try {
    const result = stmts.revokeStamp.run('revoked', req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Stamp not found or not yours' });
    }
    const stamp = stmts.getStampById.get(req.params.id);
    res.json({
      success: true,
      stamp: {
        ...stamp,
        inputs: JSON.parse(stamp.inputs),
        preview: JSON.parse(stamp.preview)
      }
    });
  } catch (err) {
    logger.error('Hanko revoke error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
