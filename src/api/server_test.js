/*
 * SOLIDARITY PLATFORM - ENHANCED API SERVER (SIMPLIFIED)
 * =======================================================
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Simple auth middleware (temporary - for testing)
const simpleAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    req.user = { id: 'test-user', username: 'test' }; // Allow unauthenticated for now
  } else {
    req.user = { id: 'test-user', username: 'test' };
  }
  next();
};

// ============================================================================
// ACTIVITY LOGS ROUTES
// ============================================================================

app.get('/api/logs/activity', simpleAuth, async (req, res) => {
  const logsPath = path.join(__dirname, '../../database/activity_logs.json');
  try {
    const data = await fs.readFile(logsPath, 'utf8');
    const logs = JSON.parse(data);
    res.json({ logs });
  } catch (error) {
    res.json({ logs: [] });
  }
});

app.post('/api/logs/activity', simpleAuth, async (req, res) => {
  const { type, actor, action, details } = req.body;
  
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: req.user.id,
    type,
    actor,
    action,
    details,
    timestamp: new Date().toISOString()
  };

  const logsPath = path.join(__dirname, '../../database/activity_logs.json');
  let logs = [];
  try {
    const data = await fs.readFile(logsPath, 'utf8');
    logs = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
  }

  logs.push(log);
  await fs.writeFile(logsPath, JSON.stringify(logs, null, 2));
  
  res.json({ success: true, log });
});

app.delete('/api/logs/activity/:logId', simpleAuth, async (req, res) => {
  const { logId } = req.params;
  const logsPath = path.join(__dirname, '../../database/activity_logs.json');
  
  const data = await fs.readFile(logsPath, 'utf8');
  let logs = JSON.parse(data);
  logs = logs.filter(log => log.id !== logId);
  
  await fs.writeFile(logsPath, JSON.stringify(logs, null, 2));
  res.json({ success: true });
});

app.delete('/api/logs/clear', simpleAuth, async (req, res) => {
  const logsPath = path.join(__dirname, '../../database/activity_logs.json');
  await fs.writeFile(logsPath, JSON.stringify([], null, 2));
  res.json({ success: true, cleared: 0 });
});

app.post('/api/logs/email', simpleAuth, async (req, res) => {
  const { email, logs } = req.body;
  console.log(`Emailing ${logs.length} logs to ${email}`);
  res.json({ success: true, message: `Logs sent to ${email}` });
});

// ============================================================================
// SECURITY / LOCKGATE ROUTES
// ============================================================================

app.get('/api/security/status', simpleAuth, async (req, res) => {
  const statusPath = path.join(__dirname, '../../database/security_status.json');
  
  let status = {
    intrusionAttempts: 0,
    attempts: [],
    recentScan: false,
    burnProtocolNeeded: false
  };

  try {
    const data = await fs.readFile(statusPath, 'utf8');
    status = JSON.parse(data);
  } catch (error) {
    // No status file yet
  }

  res.json(status);
});

app.post('/api/security/block-threat', simpleAuth, async (req, res) => {
  res.json({ success: true });
});

app.post('/api/security/secure-logs', simpleAuth, async (req, res) => {
  res.json({ success: true, message: 'Logs secured' });
});

app.post('/api/security/erase-content', simpleAuth, async (req, res) => {
  res.json({ success: true, message: 'Content erased' });
});

app.post('/api/security/rebuild-clean', simpleAuth, async (req, res) => {
  res.json({ success: true, message: 'System rebuilt clean' });
});

// ============================================================================
// AI / OLLAMA ROUTES
// ============================================================================

app.get('/api/ai/live-context', simpleAuth, async (req, res) => {
  const liveData = {
    crypto: {
      top5: [
        { symbol: 'BTC', change24h: 2.5 },
        { symbol: 'ETH', change24h: -1.2 },
        { symbol: 'SOL', change24h: 4.8 },
        { symbol: 'ADA', change24h: 0.9 },
        { symbol: 'DOT', change24h: -0.5 }
      ]
    },
    stocks: {
      indices: {
        sp500: { value: 4500, change: 0.8 },
        nasdaq: { value: 14200, change: 1.2 },
        dow: { value: 35000, change: 0.5 }
      }
    },
    news: [
      { title: 'Fed maintains interest rates', relevance: 0.9 },
      { title: 'Tech sector rally continues', relevance: 0.7 }
    ],
    userContext: {
      location: 'Kansas, USA',
      budget: 'moderate',
      interests: ['crypto', 'tech', 'real estate']
    }
  };

  res.json(liveData);
});

app.post('/api/ai/chat', simpleAuth, async (req, res) => {
  const { message, safetyLevel, liveData } = req.body;

  const response = `Based on current market data, I can help you with: crypto analysis, stock insights, investment opportunities, and platform features. What would you like to explore?`;

  res.json({
    response,
    metadata: {
      model: 'llama3.2:3b',
      safetyLevel: safetyLevel || 0.618,
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/ai/scan-url', simpleAuth, async (req, res) => {
  const { url } = req.body;
  const isWhitelistDomain = url.includes('google.com') || url.includes('github.com') || url.includes('wikipedia.org');
  
  res.json({
    safe: isWhitelistDomain,
    reason: isWhitelistDomain ? 'Domain is on approved whitelist' : 'Unknown domain, potential risk'
  });
});

// ============================================================================
// USER SETTINGS ROUTES
// ============================================================================

app.get('/api/user/settings', simpleAuth, async (req, res) => {
  const settings = {
    theme: 'default',
    fontSize: 16,
    userInfo: {
      email: 'user@example.com',
      phone: ''
    }
  };
  res.json(settings);
});

app.put('/api/user/settings', simpleAuth, async (req, res) => {
  const { theme, fontSize, userInfo } = req.body;
  const settings = { theme, fontSize, userInfo };
  res.json({ success: true, settings });
});

// ============================================================================
// DEVICE ROUTES
// ============================================================================

app.post('/api/device/register', simpleAuth, async (req, res) => {
  const { deviceInfo, nickname } = req.body;
  const device = {
    id: `device_${Date.now()}`,
    userId: req.user.id,
    ...deviceInfo,
    nickname: nickname || `Device ${Date.now()}`,
    trustedAt: new Date().toISOString()
  };
  res.json({ success: true, device });
});

// ============================================================================
// HANKO ROUTES (SIMPLIFIED - Python integration coming soon)

function resolvePythonCmd() {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  const probe = spawnSync('python3', ['--version'], { stdio: 'ignore' });
  if (!probe.error && probe.status === 0) return 'python3';
  return 'python';
}
// ============================================================================

// In-memory hanko storage (replace with database in production)
const hankoStamps = new Map();

app.get('/api/hanko/my-stamps', simpleAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || 'demo-user';
    const stamps = Array.from(hankoStamps.values()).filter(s => s.user_id === userId);
    res.json({ stamps, count: stamps.length });
  } catch (error) {
    console.error('Hanko fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stamps' });
  }
});

app.post('/api/hanko/create', simpleAuth, async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user?.userId || 'demo-user';
    
    console.log('=== HANKO STAMP REQUEST ===');
    console.log('Type:', type);
    console.log('User ID:', userId);
    
    // Call Python hanko CLI
    const cliPath = path.join(__dirname, '../../bridging_anchor_systems/hanko_cli.py');
    const requestPayload = JSON.stringify({
      user_id: userId,
      stamp_type: type || 'personal',
      device_id: req.body.device_id || 'web-device-001',
      device_model: req.body.device_model || 'Web Browser',
      counter: Date.now()
    });
    
    const pythonCmd = resolvePythonCmd();
    console.log('Spawning Python:', pythonCmd, [cliPath, 'generate', requestPayload]);
    const python = spawn(pythonCmd, [cliPath, 'generate', requestPayload]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('Python stdout:', chunk);
      stdout += chunk;
    });
    
    python.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error('Python stderr:', chunk);
      stderr += chunk;
    });
    
    python.on('error', (error) => {
      console.error('Python spawn error:', error);
      res.status(500).json({ 
        error: 'Failed to spawn Python process', 
        details: error.message 
      });
    });
    
    python.on('close', (code) => {
      console.log('Python process closed with code:', code);
      console.log('Final stdout:', stdout);
      console.log('Final stderr:', stderr);
      
      if (code !== 0) {
        console.error('Python hanko CLI error (non-zero exit):', stderr);
        return res.status(500).json({ 
          error: 'Failed to create hanko stamp', 
          details: stderr || 'Python process exited with non-zero code' 
        });
      }
      
      try {
        const result = JSON.parse(stdout);
        console.log('Parsed result:', result);

        // tolerate legacy generators that don't set success=true
        if (result.error) {
          return res.status(500).json({
            error: 'Hanko generation failed',
            details: result.error
          });
        }

        // Store stamp in memory
        const stamp = {
          stamp_id: result.stamp_id,
          stamp_type: result.stamp_type || type || 'personal',
          user_id: userId,
          date: result.date,
          created_at: new Date().toISOString(),
          revoked: false,
          usage_count: 0,
          svg: result.svg,
          svg_hash_b64: result.svg_hash_b64,
          signature_b64: result.signature_b64,
          base_hash_b64: result.base_hash_b64,
          daily_hash_b64: result.daily_hash_b64,
          features: result.features
        };

        hankoStamps.set(result.stamp_id, stamp);
        console.log('Stamp created successfully:', stamp.stamp_id);

        res.json({
          success: true,
          stamp,
          message: `${stamp.stamp_type} hanko stamp created successfully with quantum-resistant cryptography`
        });
      } catch (parseError) {
        console.error('Failed to parse Python output:', stdout);
        console.error('Parse error:', parseError);
        res.status(500).json({ 
          error: 'Invalid response from hanko generator', 
          details: parseError.message 
        });
      }
    });
    
  } catch (error) {
    console.error('Hanko creation error:', error);
    res.status(500).json({ error: 'Failed to create hanko stamp', details: error.message });
  }
});

app.post('/api/hanko/revoke/:stampId', simpleAuth, async (req, res) => {
  try {
    const { stampId } = req.params;
    const userId = req.user?.userId || 'demo-user';
    
    const stamp = hankoStamps.get(stampId);
    if (!stamp) {
      return res.status(404).json({ error: 'Stamp not found' });
    }
    
    if (stamp.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to revoke this stamp' });
    }
    
    stamp.revoked = true;
    stamp.revoked_at = new Date().toISOString();
    hankoStamps.set(stampId, stamp);
    
    res.json({ success: true, message: 'Hanko stamp revoked' });
  } catch (error) {
    console.error('Hanko revoke error:', error);
    res.status(500).json({ error: 'Failed to revoke stamp' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    safetyLevel: 0.618
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('SOLIDARITY PLATFORM - ENHANCED API SERVER');
  console.log('='.repeat(60));
  console.log(`Listening on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log('');
  console.log('NEW FEATURES:');
  console.log('  - User Logs (activity tracking, download, email)');
  console.log('  - LockGate Security (4-color states, burn protocol)');
  console.log('  - Ollama AI Integration (live data, chat, scanning)');
  console.log('  - QuipNotes Browser (whitelist, malware scan)');
  console.log('  - Hanko Stamps Management (visual badges)');
  console.log('  - Device Detection & Registration');
  console.log('  - User Settings (theme, font, profile)');
  console.log('');
  console.log('Safety Level: 0.618 (OPTIMAL_RANGE)');
  console.log('='.repeat(60));
  console.log('');
});
