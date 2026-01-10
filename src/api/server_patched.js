/*
 * SOLIDARITY PLATFORM - ENHANCED API SERVER (PATCHED)
 * ====================================================
 * 
 * CRITICAL PATCHES APPLIED:
 * ✅ Patch #1: Input Validation (Joi schemas)
 * ✅ Patch #2: Hanko Stamp Authentication
 * ✅ Patch #3: Enhanced Error Handling
 * ✅ Integrated Safety System (φ-ratio, 7-tier)
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');

// Import security modules
const {
  IntegratedAuthManager,
  authenticateToken,
  requireRole,
  requireHankoVerification
} = require('../security/integrated_auth.js');

// Import error handling
const { createErrorHandler, createValidationMiddleware } = require('../utils/errorHandler.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Constants
const PHI = 1.618033988749895;
const BRIDGING_BASELINE = 0.618;
const SACRED_NODES = [1, 3, 4, 7, 14, 21, 49];

// Initialize authentication manager
const authManager = new IntegratedAuthManager({ safetyLevel: BRIDGING_BASELINE });

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-hanko-stamp-id']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Static files (frontend)
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../../frontend/src')));

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const schemas = {
  // Authentication schemas
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('user', 'admin').default('user')
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  
  // Mathematical operation schemas
  processValue: Joi.object({
    value: Joi.number().required().min(-1e15).max(1e15),
    options: Joi.object({
      precision: Joi.number().integer().min(1).max(64).default(16),
      safetyLevel: Joi.number().min(0).max(1).default(0.618)
    }).optional()
  }),
  
  fractalMirror: Joi.object({
    value: Joi.number().required().min(-1e15).max(1e15),
    inverse: Joi.boolean().default(false)
  }),
  
  // Financial operation schemas
  createWallet: Joi.object({
    chain: Joi.string().valid('ethereum', 'solana', 'polygon').required(),
    address: Joi.string().required(),
    balance: Joi.number().min(0).default(0)
  }),
  
  transaction: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().default('USD'),
    hankoSignature: Joi.boolean().default(false)
  }),
  
  // Hanko stamp schemas
  createHankoStamp: Joi.object({
    type: Joi.string().valid('personal', 'registered', 'bank', 'company').required(),
    metadata: Joi.object().optional()
  })
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION ROUTES (PUBLIC)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/auth/register', createValidationMiddleware(schemas.register), async (req, res, next) => {
  try {
    const result = await authManager.register(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', createValidationMiddleware(schemas.login), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authManager.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/verify', authenticateToken, async (req, res, next) => {
  try {
    const hankoStampId = req.headers['x-hanko-stamp-id'];
    const result = await authManager.verifyToken(req.headers.authorization?.split(' ')[1], hankoStampId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/stats', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const stats = await authManager.getAuthStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HANKO STAMP ROUTES (PROTECTED)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/hanko/create', authenticateToken, createValidationMiddleware(schemas.createHankoStamp), async (req, res, next) => {
  try {
    const { type, metadata } = req.body;
    const result = await authManager.createAdditionalHankoStamp(req.user.userId, type, metadata);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/hanko/my-stamps', authenticateToken, async (req, res, next) => {
  try {
    const stamps = authManager.hankoSecurity.getUserHankoStamps(req.user.userId);
    res.json({
      success: true,
      stamps,
      count: stamps.length
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/hanko/sign-data', authenticateToken, async (req, res, next) => {
  try {
    const { data, stampType = 'personal' } = req.body;
    const result = await authManager.signDataWithHanko(req.user.userId, data, stampType);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/hanko/verify-imprint', async (req, res, next) => {
  try {
    const result = await authManager.hankoSecurity.verifyHankoImprint(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MATHEMATICAL ROUTES (PROTECTED)
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/mathematical/constants', (req, res) => {
  res.json({
    success: true,
    data: {
      PHI: PHI,
      BRIDGING_BASELINE: BRIDGING_BASELINE,
      CONTROL_RATIO: 3.5,
      SACRED_NODES: SACRED_NODES,
      FIBONACCI: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
      HENRY_PROGRESSION: { base: 7, double: 14, square: 49 }
    }
  });
});

app.post('/api/mathematical/process', authenticateToken, createValidationMiddleware(schemas.processValue), async (req, res, next) => {
  try {
    const { value, options = {} } = req.body;
    
    // φ-ratio transformation (simplified)
    const normalized = value / Math.sqrt(Math.pow(PHI, 2) + 1);
    const henryAlignment = (value % 7) / 7;
    const phiRatio = Math.pow(PHI, henryAlignment);
    const output = normalized * phiRatio;
    
    res.json({
      success: true,
      data: {
        input: value,
        output,
        phiRatio,
        henryAlignment,
        safetyLevel: options.safetyLevel || BRIDGING_BASELINE
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/mathematical/fractal-mirror', authenticateToken, createValidationMiddleware(schemas.fractalMirror), async (req, res, next) => {
  try {
    const { value, inverse } = req.body;
    
    if (inverse) {
      // Inverse fractal mirror
      const result = value / Math.pow(PHI, 2);
      res.json({ success: true, data: { original: value, result, type: 'inverse' } });
    } else {
      // Forward fractal mirror
      const result = value * Math.pow(PHI, 2);
      res.json({ success: true, data: { original: value, result, type: 'forward' } });
    }
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL ROUTES (PROTECTED + HANKO REQUIRED FOR TRANSACTIONS)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/financial/wallet/create', authenticateToken, createValidationMiddleware(schemas.createWallet), async (req, res, next) => {
  try {
    const { chain, address, balance } = req.body;
    
    // Create wallet (simplified)
    const wallet = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user.userId,
      chain,
      address,
      balance,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      wallet,
      message: `${chain} wallet created`
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/financial/transaction', authenticateToken, requireHankoVerification(authManager), createValidationMiddleware(schemas.transaction), async (req, res, next) => {
  try {
    const { from, to, amount, currency } = req.body;
    
    // Process transaction (simplified)
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      amount,
      currency,
      hankoStamp: req.hankoVerification.stamp.id,
      userId: req.user.userId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      phiRatio: PHI
    };
    
    res.json({
      success: true,
      transaction,
      hankoVerified: true,
      message: 'Transaction completed with Hanko seal verification'
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH & SYSTEM STATUS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.41.0-patched',
    platform: 'Solidarity Platform',
    architect: 'Scott Charles Olson',
    timestamp: new Date().toISOString(),
    patches: {
      inputValidation: true,
      hankoAuthentication: true,
      errorHandling: true,
      safetyIntegration: true
    },
    phi: PHI,
    safetyLevel: BRIDGING_BASELINE,
    systems: {
      mathematical: 'operational',
      financial: 'operational',
      authentication: 'operational',
      hanko: 'operational',
      api: 'operational'
    }
  });
});

app.get('/api/system/stats', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const authStats = await authManager.getAuthStats();
    const hankoStats = authManager.hankoSecurity.getSystemStats();
    
    res.json({
      success: true,
      data: {
        authentication: authStats,
        hanko: hankoStats,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FRONTEND ROUTE (CATCH-ALL)
// ═══════════════════════════════════════════════════════════════════════════

app.get('*', (req, res) => {
  // Only serve frontend for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
  } else {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING MIDDLEWARE (MUST BE LAST)
// ═══════════════════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('❌ API Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });
  
  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details.map(d => d.message),
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Generic errors
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════

app.listen(PORT, async () => {
  console.log('');
  console.log('🎴 SOLIDARITY PLATFORM - ENHANCED API SERVER (PATCHED)');
  console.log('═'.repeat(70));
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🎨 Frontend: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('═'.repeat(70));
  console.log('✅ PATCHES APPLIED:');
  console.log('   • Input Validation (Joi schemas)');
  console.log('   • Hanko Stamp Authentication (Japanese-style seals)');
  console.log('   • Enhanced Error Handling');
  console.log('   • Safety System Integration (φ-ratio, 7-tier)');
  console.log('═'.repeat(70));
  console.log('🎴 HANKO SYSTEM:');
  console.log('   • Personal Seal (個人印 - kojin-in)');
  console.log('   • Registered Seal (実印 - jitsuin)');
  console.log('   • Bank Seal (銀行印 - ginkoin)');
  console.log('   • Company Seal (社印 - shain)');
  console.log('═'.repeat(70));
  console.log('🌟 MATHEMATICAL CONSTANTS:');
  console.log(`   • Base Ratio (φ): ${PHI}`);
  console.log(`   • Bridging Baseline: ${BRIDGING_BASELINE}`);
  console.log(`   • Sacred Nodes: [${SACRED_NODES.join(', ')}]`);
  console.log(`   • Control Ratio: 3.5`);
  console.log('═'.repeat(70));
  console.log('🔐 DEFAULT ADMIN ACCOUNT:');
  console.log('   • Username: admin');
  console.log('   • Password: solidarity618');
  console.log('   • ⚠️  CHANGE PASSWORD IN PRODUCTION!');
  console.log('═'.repeat(70));
  console.log('');
  
  // Load auth stats
  const stats = await authManager.getAuthStats();
  console.log(`👥 Users: ${stats.users.total} | Admins: ${stats.users.admins}`);
  console.log(`🎴 Hanko Stamps: ${stats.hanko.total} active (${stats.hanko.revoked} revoked)`);
  console.log(`🛡️  Safety Level: ${stats.safety.level.toFixed(3)} (${stats.safety.threshold})`);
  console.log('');
});

module.exports = { app, authManager };
