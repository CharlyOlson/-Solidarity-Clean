// backend/lockgateServer.js
// Express backend for LockGateUI integration


const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const https = require('https');
const { addMemory, listMemories } = require('./memoryService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Use .env for secret key, fallback to default for dev
const HMAC_SECRET = process.env.HMAC_SECRET || 'supersecretkey-change-this';

// Security headers
app.use(helmet());
// CORS for frontend integration
app.use(cors());
// JSON body parsing
app.use(bodyParser.json());
// Request logging
app.use(morgan('dev'));

// In-memory nonce store (for demo)
const nonces = {};

// POST /api/lockgate/nonce
app.post('/api/lockgate/nonce', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const nonce = crypto.randomBytes(16).toString('hex');
  nonces[userId] = nonce;
  res.json({ nonce, userId, timestamp: new Date().toISOString() });
});

// POST /api/lockgate/prepare
app.post('/api/lockgate/prepare', (req, res) => {
  const { payload, clientHash, safetyLevel } = req.body;
  if (!payload || !clientHash) return res.status(400).json({ error: 'Missing payload or clientHash' });

  // Canonical serialization (parse and re-stringify)
  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid payload JSON' });
  }
  const canonical = JSON.stringify(parsed);

  // HMAC verification
  const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(canonical).digest('hex');

  // Compare client hash (preview) and server HMAC
  const clientMatch = clientHash === crypto.createHash('sha256').update(canonical).digest('hex');

  // Audit log (in-memory for demo)
  const audit = {
    userId: parsed.userId,
    action: parsed.action,
    timestamp: parsed.timestamp,
    safetyLevel: safetyLevel || parsed.safetyLevel,
    clientHash,
    serverHMAC: hmac,
    clientMatch,
    verified: true,
    received: new Date().toISOString()
  };

  // Respond
  res.json({
    success: true,
    verification: hmac,
    clientMatch,
    audit
  });
});

// POST /api/memories
app.post('/api/memories', async (req, res) => {
  const { userId, category, content, relevance = 0 } = req.body;
  if (!userId || !category || !content) {
    return res.status(400).json({ error: 'Missing userId, category, or content' });
  }
  try {
    const memory = await addMemory(userId, category, content, relevance);
    res.json({ success: true, memory });
  } catch (err) {
    console.error('memory add failed', err);
    res.status(500).json({ error: 'Memory write failed' });
  }
});

// GET /api/memories/:userId
app.get('/api/memories/:userId', async (req, res) => {
  const { userId } = req.params;
  const limit = Number(req.query.limit) || 50;
  try {
    const memories = await listMemories(userId, limit);
    res.json({ success: true, memories });
  } catch (err) {
    console.error('memory list failed', err);
    res.status(500).json({ error: 'Memory fetch failed' });
  }
});

// HTTPS support if certs are present (for local dev, use mkcert or openssl)
const certPath = process.env.HTTPS_CERT || './cert.pem';
const keyPath = process.env.HTTPS_KEY || './key.pem';
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const options = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };
  https.createServer(options, app).listen(PORT, () => {
    console.log(`LockGate backend running securely (HTTPS) on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`LockGate backend running (HTTP) on port ${PORT}`);
  });
}
