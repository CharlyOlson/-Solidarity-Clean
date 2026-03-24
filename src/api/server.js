/*
 * SOLIDARITY PLATFORM - API SERVER
 * =================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
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
const { PHI, BRIDGING_BASELINE, SACRED_NODES } = require('../utils/constants');

const logger = require('../utils/logger');
const apiRouter = require('./api_router');
const { requireLicense, requireTier, requireFeature, enforceTestMode } = require('./middleware/license');

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
// LICENSE GATE — All /api/* routes require a valid license key
// (except health check and auth registration)
// ═══════════════════════════════════════════════════════════════════════════

// Health check (public — no license required)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        version: '2.41.0',
        platform: 'Solidarity Platform',
        architect: 'Scott Charles Olson',
        trademark: 'TRADEMARKED BY SCOTT CHARLES OLSON',
        timestamp: new Date().toISOString(),
        phi: PHI,
        safetyLevel: BRIDGING_BASELINE,
        licensed: !!process.env.SOLIDARITY_LICENSE_KEY,
        systems: {
            mathematical: 'operational',
            lockgate: 'operational',
            devices: 'operational',
            ai: 'operational',
            hanko: 'operational',
            auth: 'operational',
            license: 'operational'
        }
    });
});

// Auth (public — registration doesn't need license, but login does set tier context)
app.use('/api/auth', require('./routes/auth'));

// ═══════════════════════════════════════════════════════════════════════════
// LICENSED ROUTES — Require valid license key + tier access
// ═══════════════════════════════════════════════════════════════════════════

// Apply license validation to all remaining API routes
app.use('/api', requireLicense);

// Enforce test mode for non-operator tiers (financial safety)
app.use('/api', enforceTestMode);

// Domain routes — Student tier and above
app.use('/api/session', requireTier('student'), require('./routes/session'));
app.use('/api/ai', requireTier('student'), requireFeature('ai_chat'), require('./routes/ai'));

// Practitioner tier and above
app.use('/api/mathematical', requireTier('practitioner'), require('./routes/mathematical'));
app.use('/api/lockgate', requireTier('practitioner'), require('./routes/lockgate'));
app.use('/api/calculator', requireTier('practitioner'), require('./routes/calculator'));
app.use('/api/hanko', requireTier('practitioner'), requireFeature('hanko'), require('./routes/hanko'));

// Financial routes — Practitioner tier minimum, test mode enforced
app.use('/api/financial', requireTier('practitioner'), require('./routes/financial'));
app.use('/devices', requireTier('practitioner'), require('./routes/devices'));

// User settings & activity logs — Student tier and above
app.use('/api/user', requireTier('student'), require('./routes/settings'));
app.use('/api/logs', requireTier('student'), require('./routes/settings'));

// Centralized API Router — Practitioner tier
app.use('/api/router', requireTier('practitioner'), apiRouter);

// 404 handler for unknown API routes (must come before frontend catch-all)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.originalUrl}`
    });
});

// Catch-all route for frontend (non-API routes)
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
            logger.info(`🌟 Base Ratio (φ): ${PHI}`);
            logger.info('🎵 Harmonic Phrases: 6 available');
            logger.info(`📊 Sacred Nodes: ${JSON.stringify(SACRED_NODES)}`);
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
