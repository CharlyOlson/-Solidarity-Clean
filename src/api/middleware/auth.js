/*
 * SOLIDARITY PLATFORM - JWT AUTHENTICATION
 * =========================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'solidarity-dev-secret-change-in-production';
const TOKEN_EXPIRY = '24h';

/**
 * Generate a JWT for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Hash a password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password against hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Express middleware — verifies JWT from Authorization header.
 * Sets req.user = { id, username } on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth — sets req.user if token present, but doesn't block.
 * Falls back to a demo user for unauthenticated requests.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), JWT_SECRET);
      req.user = { id: decoded.id, username: decoded.username };
    } catch (_) {
      req.user = { id: 'demo-user', username: 'demo' };
    }
  } else {
    req.user = { id: 'demo-user', username: 'demo' };
  }
  next();
}

module.exports = { generateToken, hashPassword, comparePassword, requireAuth, optionalAuth, JWT_SECRET };
