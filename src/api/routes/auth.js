/*
 * SOLIDARITY PLATFORM - AUTH ROUTES
 * ==================================
 *
 * Registration and login endpoints
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { generateToken, hashPassword, comparePassword, requireAuth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ success: false, error: 'Username must be 3-30 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = stmts.findUserByUsername.get(username);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Username already taken' });
    }

    const id = uuidv4();
    const hash = await hashPassword(password);
    stmts.createUser.run(id, username, hash);

    // Create default settings for new user
    stmts.upsertSettings.run(id, 'dark', 0.618, 1);

    const token = generateToken({ id, username });
    res.status(201).json({ success: true, token, user: { id, username } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const user = stmts.findUserByUsername.get(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, username: user.username });
    res.json({ success: true, token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me — return current user info
router.get('/me', requireAuth, (req, res) => {
  const user = stmts.findUserById.get(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, user });
});

module.exports = router;
