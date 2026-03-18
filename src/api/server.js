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
/* global require, process, __dirname, console, setTimeout, module */

const express = require('express');
const cors = require('cors');
const path = require('path');

const logger = require('../utils/logger');
const apiRouter = require('./api_router');

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../../frontend/src')));

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE MOUNTS
// ═══════════════════════════════════════════════════════════════════════════

// Auth
app.use('/api/auth', require('./routes/auth'));

// Domain routes
app.use('/api/mathematical', require('./routes/mathematical'));
app.use('/api/lockgate', require('./routes/lockgate'));
app.use('/devices', require('./routes/devices'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/calculator', require('./routes/calculator'));

// Session & AI
app.use('/api/session', require('./routes/session'));
app.use('/api/ai', require('./routes/ai'));

// Hanko Stamps (SQLite-backed)
app.use('/api/hanko', require('./routes/hanko'));

// User settings & activity logs (SQLite-backed)
app.use('/api/user', require('./routes/settings'));
app.use('/api/logs', require('./routes/settings'));

// Centralized API Router
app.use('/api/router', apiRouter);

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
            ai: 'operational',
            hanko: 'operational',
            auth: 'operational'
        }
    });
});

// Catch-all route for frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('API Error', { error: err.message });
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

function startServerWithFallback(maxRetries = 10) {
    let attempts = 0;
    function tryListen() {
        const server = app.listen(PORT, () => {
            logger.info('🚀 Solidarity Platform API Server');
            logger.info('═'.repeat(60));
            logger.info(`📡 Listening on port ${PORT}`);
            logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
            logger.info(`🎨 Frontend: http://localhost:${PORT}`);
            logger.info(`🔢 Mathematical API: http://localhost:${PORT}/api/mathematical`);
            logger.info(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
            logger.info(`💚 Health Check: http://localhost:${PORT}/api/health`);
            logger.info('═'.repeat(60));
            logger.info('🌟 Base Ratio (φ): 1.618033988749895');
            logger.info('🎵 Harmonic Phrases: 6 available');
            logger.info('📊 Sacred Nodes: [1, 3, 4, 7, 14, 21, 49]');
            logger.info('═'.repeat(60));
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE' && attempts < maxRetries) {
                logger.warn(`Port ${PORT} in use. Trying ${PORT + 1}...`);
                PORT += 1;
                attempts += 1;
                setTimeout(tryListen, 250);
            } else {
                logger.error('API Server failed to start', { error: err.message });
                process.exit(1);
            }
        });
    }
    tryListen();
}

// Start server when run directly (not when imported for testing)
if (require.main === module) {
    startServerWithFallback();
}

module.exports = app;
