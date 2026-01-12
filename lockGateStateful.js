/*
 * SOLIDARITY PLATFORM - LOCK GATE STATEFUL ROUTES
 * ===============================================
 * 
 * Routes requiring shared state (nonce, audit, HMAC)
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const crypto = require('crypto');
const {
  nonceStore,
  NONCE_EXPIRY,
  SERVER_SECRET,
  auditLog
} = require('./lockGateState');

const router = express.Router();

// POST /api/lockgate/nonce
router.post('/nonce', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    nonceStore.set(nonce, {
      userId,
      timestamp,
      expiresAt: Date.now() + NONCE_EXPIRY
    });
    console.log(`🔐 Nonce issued for user ${userId}: ${nonce.slice(0, 8)}...`);
    res.json({
      success: true,
      nonce,
      timestamp,
      expiresIn: NONCE_EXPIRY / 1000,
      safetyLevel: 0.618
    });
  } catch (error) {
    console.error('Nonce error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/lockgate/prepare
router.post('/prepare', (req, res) => {
  try {
    const { payload, clientHash, nonce, hmac } = req.body;
    if (!payload) {
      return res.status(400).json({ success: false, error: 'payload required' });
    }
    const payloadData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const canonicalPayload = JSON.stringify(payloadData, Object.keys(payloadData).sort());
    const serverHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
    console.log(`🔒 Lock Gate processing for user: ${payloadData.userId}`);
    console.log(`   Client hash: ${clientHash?.slice(0, 16)}...`);
    console.log(`   Server hash: ${serverHash.slice(0, 16)}...`);
    let nonceValid = false;
    if (nonce) {
      const nonceData = nonceStore.get(nonce);
      if (nonceData && Date.now() < nonceData.expiresAt) {
        nonceValid = true;
        nonceStore.delete(nonce);
      }
    }
    let hmacValid = false;
    if (hmac) {
      const expectedHmac = crypto.createHmac('sha256', SERVER_SECRET).update(serverHash).digest('hex');
      hmacValid = crypto.timingSafeEqual(
        Buffer.from(hmac, 'hex'),
        Buffer.from(expectedHmac, 'hex')
      );
    }
    const auditEntry = {
      userId: payloadData.userId,
      action: payloadData.action,
      payloadHashHex: serverHash,
      timestamp: new Date().toISOString(),
      nonceValid,
      hmacValid,
      safetyLevel: payloadData.safetyLevel || 0.618,
      result: hmacValid ? 'VERIFIED' : 'PENDING'
    };
    auditLog.push(auditEntry);
    if (auditLog.length > 100) {
      auditLog.shift();
    }
    console.log(`   HMAC valid: ${hmacValid}, Nonce valid: ${nonceValid}`);
    console.log(`   Result: ${auditEntry.result}`);
    res.json({
      success: true,
      serverHash,
      clientHash,
      hashMatch: serverHash === clientHash,
      nonceValid,
      hmacValid,
      verification: hmacValid ? 'VERIFIED' : 'PENDING',
      audit: auditEntry,
      phi: 1.618033988749895,
      safetyLevel: 0.618
    });
  } catch (error) {
    console.error('Lock Gate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/lockgate/audit
router.get('/audit', (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    let entries = auditLog;
    if (userId) {
      entries = entries.filter(e => e.userId === userId);
    }
    entries = entries.slice(-parseInt(limit));
    res.json({
      success: true,
      count: entries.length,
      entries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clean expired nonces every minute
setInterval(() => {
  const now = Date.now();
  for (const [nonce, data] of nonceStore.entries()) {
    if (now >= data.expiresAt) {
      nonceStore.delete(nonce);
    }
  }
}, 60000);

module.exports = router;
