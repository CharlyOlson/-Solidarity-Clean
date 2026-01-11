/*
 * SOLIDARITY PLATFORM - LOCKGATE SECURITY OVERLAY
 * ================================================
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
const router = express.Router();

// Nonce storage (in production, use Redis or database)
const nonceStore = new Map();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Server secret for HMAC (in production, use environment variable)
const SERVER_SECRET = process.env.LOCK_GATE_SECRET || 'solidarity-phi-1.618033988749895-baseline-0.618';

// Audit log storage (in production, use database)
const auditLog = [];

/**
 * POST /api/lockgate/nonce
 * Issue challenge nonce for HMAC verification
 */
router.post('/nonce', (req, res) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/security/status`);
        const data = await response.json();

        // Update security state based on threats
        if (data.burnProtocolNeeded) {
          setSecurityState('critical');
          setBurnProtocolActive(true);
        } else if (data.intrusionAttempts > 0) {
          setSecurityState('warning');
          setIntrusionAttempts(data.attempts || []);
          setShowPopup(true);
        } else if (data.recentScan) {
          setSecurityState('secured');
          setLastScanTime(new Date());
          // Flash green for 3 seconds then return to locked
          setTimeout(() => setSecurityState('locked'), 3000);
        } else {
          setSecurityState('locked');
        }
      } catch (error) {
        console.error('Security check failed:', error);
      }
});

    // Check security every 2 seconds
    checkSecurity();
    const interval = setInterval(checkSecurity, 2000);
    return () => clearInterval(interval);
  }, []);

  // Burn Protocol - ERASE AND RESTART
  const executeBurnProtocol = async () => {
    if (!window.confirm('⚠️ CRITICAL SECURITY ALERT\n\nThis will:\n• Secure all logs\n• Erase system content and downloads\n• Restart system\n• Rebuild user settings (clean, no corruption)\n\nContinue?')) {
      return;
    }

    try {
      // Step 1: Secure logs
      await fetch(`${API_BASE_URL}/api/security/secure-logs`, { method: 'POST' });

      // Step 2: Erase content
      await fetch(`${API_BASE_URL}/api/security/erase-content`, { method: 'POST' });

      // Step 3: Clean rebuild
      await fetch(`${API_BASE_URL}/api/security/rebuild-clean`, { method: 'POST' });

      // Step 4: Restart
      alert('🔥 Burn protocol complete. System will restart...');
      window.location.href = '/login';
    } catch (error) {
      console.error('Burn protocol error:', error);
      alert('❌ Burn protocol failed. Contact admin.');
    }
    }
    
    // Verify HMAC if provided
    let hmacValid = false;
    if (hmac) {
      const expectedHmac = crypto
        .createHmac('sha256', SERVER_SECRET)
        .update(serverHash)
        .digest('hex');
      
      // Constant-time comparison
      hmacValid = crypto.timingSafeEqual(
        Buffer.from(hmac, 'hex'),
        Buffer.from(expectedHmac, 'hex')
      );
    }
    
    // Record audit entry
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
    
    // Limit audit log size (keep last 100 entries)
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
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/lockgate/audit
 * Retrieve audit log entries
 */
router.get('/audit', (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    
    let entries = auditLog;
    
    // Filter by userId if provided
    if (userId) {
      entries = entries.filter(e => e.userId === userId);
    }
    
    // Apply limit
    entries = entries.slice(-parseInt(limit));
    
    res.json({
      success: true,
      count: entries.length,
      entries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/lockgate/coils
 * Convert currency to coils (1 penny = 100,000 coils)
 */
router.post('/coils', (req, res) => {
  try {
    const { pennies, dollars } = req.body;
    
    const COILS_PER_PENNY = 100000;
    const PENNIES_PER_DOLLAR = 100;
    
    let totalCoils = 0;
    
    if (pennies) {
      totalCoils += pennies * COILS_PER_PENNY;
    }
    
    if (dollars) {
      totalCoils += dollars * PENNIES_PER_DOLLAR * COILS_PER_PENNY;
    }
    
    res.json({
      success: true,
      input: { pennies, dollars },
      coils: totalCoils,
      units: Math.floor(totalCoils / 10),
      components: Math.floor(totalCoils / 100),
      phi: 1.618033988749895
    });
  } catch (error) {
    console.error('Coils conversion error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
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
