/*
 * SOLIDARITY PLATFORM - API SERVER
 * =================================
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */
/* eslint-env node */
/* global require, process, __dirname, console, setTimeout, module, next */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../../frontend/src')));

// Import routes
const mathematicalRoutes = require('./routes/mathematical');
const lockgateRoutes = require('./routes/lockgate');
const devicesRoutes = require('./routes/devices');
const financialRoutes = require('./routes/financial');
const calculatorRoutes = require('./routes/calculator');

// API Routes
app.use('/api/mathematical', mathematicalRoutes);
app.use('/api/lockgate', lockgateRoutes);
app.use('/devices', devicesRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/calculator', calculatorRoutes);

// === Session & AI API Routing ===
const { startSession, loadHistory, logInteraction, pushToBin } = require('../../launcher');
const { queryOllama, getAISystemStatus } = require('../../ai_integration/ollama_integration');

// Session: Start new session and get AI answer
app.post('/api/session/start', async (req, res) => {
    try {
        const { prompt, context, settings } = req.body;
        const sessionResult = await startSession(prompt || 'Hello!', context, settings);
        res.json({ success: true, ...sessionResult });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Session: Log interaction
app.post('/api/session/log', (req, res) => {
    try {
        const { session, prompt, response, meta } = req.body;
        logInteraction(session, prompt, response, meta);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Session: Push irrelevant data to bin
app.post('/api/session/bin', (req, res) => {
    try {
        const { session, data } = req.body;
        pushToBin(session, data);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Session: Load previous history
app.get('/api/session/history', (req, res) => {
    try {
        const { limit } = req.query;
        const history = loadHistory(limit ? parseInt(limit) : 3);
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// AI: Direct Ollama query (with session context)
app.post('/api/ai/query', async (req, res) => {
    try {
        const { prompt, options } = req.body;
        const result = await queryOllama(prompt, options || {});
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// AI: Get AI system status
app.get('/api/ai/status', (req, res) => {
    try {
        const status = getAISystemStatus();
        res.json({ success: true, status });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '2.41.0',
        platform: 'Solidarity Platform',
        architect: 'Scott Charles Olson',
        timestamp: new Date().toISOString(),
        phi: 1.618033988749895,
        safetyLevel: 0.618,
        systems: {
            mathematical: 'operational',
            lockgate: 'operational',
            devices: 'operational',
            api: 'operational'
        }
    });
});

// Catch-all route for frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// Error handling middleware
app.use((err, req, res) => {
    console.error('API Error:', err);
        res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

function startServerWithFallback(maxRetries = 10) {
    let attempts = 0;
    function tryListen() {
        const server = app.listen(PORT, () => {
            console.log('🚀 Solidarity Platform API Server');
            console.log('═'.repeat(60));
            console.log(`📡 Listening on port ${PORT}`);
            console.log(`🌐 API URL: http://localhost:${PORT}/api`);
            console.log(`🎨 Frontend: http://localhost:${PORT}`);
            console.log(`🔢 Mathematical API: http://localhost:${PORT}/api/mathematical`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
            console.log('═'.repeat(60));
            console.log('🌟 Base Ratio (φ): 1.618033988749895');
            console.log('🎵 Harmonic Phrases: 6 available');
            console.log('📊 Sacred Nodes: [1, 3, 4, 7, 14, 21, 49]');
            console.log('═'.repeat(60));
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE' && attempts < maxRetries) {
                console.warn(`Port ${PORT} in use. Trying ${PORT + 1}...`);
                PORT += 1;
                attempts += 1;
                setTimeout(tryListen, 250);
            } else {
                console.error('API Server failed to start:', err);
                process.exit(1);
            }
        });
    }
    tryListen();
}

// Start server with port fallback
startServerWithFallback();

module.exports = app;
