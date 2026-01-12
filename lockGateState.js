/*
 * SOLIDARITY PLATFORM - LOCK GATE SHARED STATE
 * ============================================
 * 
 * Shared state and constants for LockGate API modules
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

// Nonce storage (in production, use Redis or database)
const nonceStore = new Map();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Server secret for HMAC (in production, use environment variable)
const SERVER_SECRET = process.env.LOCK_GATE_SECRET || 'solidarity-phi-1.618033988749895-baseline-0.618';

// Audit log storage (in production, use database)
const auditLog = [];

module.exports = {
  nonceStore,
  NONCE_EXPIRY,
  SERVER_SECRET,
  auditLog
};
