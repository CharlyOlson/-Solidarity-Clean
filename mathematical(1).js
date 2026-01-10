/*
 * SOLIDARITY PLATFORM - MATHEMATICAL API ROUTES
 * ==============================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();

// Import core mathematical systems
const CoreMathematicsEngine = require('../../utils/CoreMathematicsEngine');
const { GoldenRatioMath, MirrorNumberSystem } = require('../../../core/goldenRatioMath');
const { FocusedPassCorrector } = require('../../../core/focusedPassCorrector');
const { HarmonicPhraseParser } = require('../../../core/harmonicPhraseParser');

// Initialize systems
const coreEngine = new CoreMathematicsEngine();
const goldenMath = new GoldenRatioMath();
const mirrorSystem = new MirrorNumberSystem();
const focusedCorrector = new FocusedPassCorrector();
const harmonicParser = new HarmonicPhraseParser();

// ========================================
// GOLDEN RATIO MATHEMATICS
// ========================================

// GET /api/mathematical/golden-ratio - Get all golden ratio constants
router.get('/golden-ratio', (req, res) => {
    res.json({
        success: true,
        constants: {
            PHI: goldenMath.PHI,
            PHI_RECIPROCAL: goldenMath.PHI_RECIPROCAL,
            PHI_SQUARED: goldenMath.PHI_SQUARED,
            GOLDEN_ANGLE_DEGREES: goldenMath.GOLDEN_ANGLE_DEGREES,
            GOLDEN_ANGLE_RADIANS: goldenMath.GOLDEN_ANGLE_RADIANS,
            CONTROL_RATIO: goldenMath.CONTROL_RATIO,
            SACRED_NODES: goldenMath.SACRED_NODES
        },
        timestamp: new Date().toISOString()
    });
});

// GET /api/mathematical/fibonacci/:n - Calculate Fibonacci sequence
router.get('/fibonacci/:n', (req, res) => {
    try {
        const n = parseInt(req.params.n);
        
        if (isNaN(n) || n < 1 || n > 50) {
            return res.status(400).json({
                success: false,
                error: 'n must be between 1 and 50'
            });
        }
        
        const sequence = goldenMath.fibonacciSequence(n);
        const convergence = [];
        
        for (let i = 2; i < sequence.length; i++) {
            convergence.push({
                index: i,
                ratio: sequence[i] / sequence[i-1],
                phiDeviation: Math.abs((sequence[i] / sequence[i-1]) - goldenMath.PHI)
            });
        }
        
        res.json({
            success: true,
            n,
            sequence,
            convergence,
            finalRatio: sequence.length >= 2 ? sequence[sequence.length-1] / sequence[sequence.length-2] : null,
            phiTarget: goldenMath.PHI
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/mathematical/lucas/:n - Calculate Lucas sequence
router.get('/lucas/:n', (req, res) => {
    try {
        const n = parseInt(req.params.n);
        
        if (isNaN(n) || n < 1 || n > 50) {
            return res.status(400).json({
                success: false,
                error: 'n must be between 1 and 50'
            });
        }
        
        const sequence = goldenMath.lucasSequence(n);
        
        res.json({
            success: true,
            n,
            sequence,
            phi: goldenMath.PHI
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/mathematical/golden-spiral - Generate golden spiral coordinates
router.get('/golden-spiral', (req, res) => {
    try {
        const turns = parseInt(req.query.turns) || 5;
        const pointsPerTurn = parseInt(req.query.pointsPerTurn) || 20;
        
        if (turns < 1 || turns > 10) {
            return res.status(400).json({
                success: false,
                error: 'turns must be between 1 and 10'
            });
        }
        
        const coordinates = goldenMath.generateGoldenSpiral(turns, pointsPerTurn);
        
        res.json({
            success: true,
            turns,
            pointsPerTurn,
            totalPoints: coordinates.length,
            coordinates,
            goldenAngle: goldenMath.GOLDEN_ANGLE_DEGREES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/mathematical/golden-timing - Calculate optimal timing for data size
router.post('/golden-timing', (req, res) => {
    try {
        const { dataSize } = req.body;
        
        if (!dataSize || dataSize < 1) {
            return res.status(400).json({
                success: false,
                error: 'dataSize must be positive integer'
            });
        }
        
        const timing = goldenMath.calculateGoldenTiming(dataSize);
        
        res.json({
            success: true,
            dataSize,
            optimalTime: timing,
            baseRatio: goldenMath.PHI,
            formula: 'dataSize / φ'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// MIRROR NUMBER SYSTEM
// ========================================

// GET /api/mathematical/mirror-repunits/:n - Generate mirror repunits
router.get('/mirror-repunits/:n', (req, res) => {
    try {
        const n = parseInt(req.params.n);
        
        if (isNaN(n) || n < 1 || n > 10) {
            return res.status(400).json({
                success: false,
                error: 'n must be between 1 and 10'
            });
        }
        
        const repunits = [];
        for (let i = 1; i <= n; i++) {
            repunits.push(mirrorSystem.generateRepunits(i));
        }
        
        res.json({
            success: true,
            count: n,
            repunits,
            pattern: 'R_n = (10^n - 1) / 9'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/mathematical/palindromic-squares/:limit - Find palindromic perfect squares
router.get('/palindromic-squares/:limit', (req, res) => {
    try {
        const limit = parseInt(req.params.limit);
        
        if (isNaN(limit) || limit < 1 || limit > 1000000) {
            return res.status(400).json({
                success: false,
                error: 'limit must be between 1 and 1,000,000'
            });
        }
        
        const squares = mirrorSystem.findPalindromicSquares(limit);
        
        res.json({
            success: true,
            limit,
            count: squares.length,
            squares
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// HARMONIC PHRASE PARSER
// ========================================

// GET /api/mathematical/harmonic-phrases - List all harmonic phrases
router.get('/harmonic-phrases', (req, res) => {
    try {
        const phrases = [];
        
        harmonicParser.harmonicPhrases.forEach((config, phrase) => {
            phrases.push({
                phrase,
                trigger: config.trigger,
                node: config.node,
                mirrorNumber: config.mirrorNumber,
                goldenRatio: config.goldenRatio,
                description: config.description
            });
        });
        
        res.json({
            success: true,
            count: phrases.length,
            phrases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/mathematical/harmonic-phrase - Parse and process harmonic phrase
router.post('/harmonic-phrase', async (req, res) => {
    try {
        const { phrase, context } = req.body;
        
        if (!phrase) {
            return res.status(400).json({
                success: false,
                error: 'phrase is required'
            });
        }
        
        const result = await harmonicParser.parsePhrase(phrase, context || {});
        
        res.json({
            success: result.success,
            phrase: result.phrase,
            recognized: result.recognized,
            solution: result.solution,
            timestamp: result.timestamp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/mathematical/harmonic-statistics - Get harmonic parser statistics
router.get('/harmonic-statistics', (req, res) => {
    try {
        const stats = harmonicParser.getStatistics();
        
        res.json({
            success: true,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// FOCUSED PASS CORRECTION
// ========================================

// POST /api/mathematical/correct-text - Apply focused correction to text
router.post('/correct-text', (req, res) => {
    try {
        const { text, passes } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'text is required'
            });
        }
        
        const result = focusedCorrector.multiPassCorrection(text, passes || 3);
        
        res.json({
            success: true,
            original: result.original,
            final: result.final,
            passes: result.passes,
            corrections: result.corrections,
            statistics: result.statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/mathematical/force-balance - Calculate force balance for node
router.post('/force-balance', (req, res) => {
    try {
        const { node, safetyLevel } = req.body;
        
        if (!node) {
            return res.status(400).json({
                success: false,
                error: 'node is required'
            });
        }
        
        const config = {
            node: parseInt(node),
            safetyLevel: parseFloat(safetyLevel) || 0.618
        };
        
        const balance = harmonicParser.calculateForceEquilibrium(config, config.safetyLevel);
        
        res.json({
            success: true,
            node: balance.node,
            angelForce: balance.angelForce,
            daemonForce: balance.daemonForce,
            balance: balance.balance,
            phiTarget: balance.phiTarget,
            deviation: balance.deviation,
            isStable: balance.isStable,
            recommendation: balance.recommendation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// SYSTEM STATUS
// ========================================

// GET /api/mathematical/status - Get overall mathematical system status
router.get('/status', (req, res) => {
    try {
        const stats = harmonicParser.getStatistics();
        
        res.json({
            success: true,
            status: 'operational',
            version: '1.0.0',
            systems: {
                coreEngine: 'ready',
                goldenRatioMath: 'ready',
                mirrorNumberSystem: 'ready',
                focusedPassCorrector: 'ready',
                harmonicPhraseParser: 'ready'
            },
            constants: {
                phi: goldenMath.PHI,
                phiReciprocal: goldenMath.PHI_RECIPROCAL,
                goldenAngle: goldenMath.GOLDEN_ANGLE_DEGREES,
                sacredNodes: goldenMath.SACRED_NODES
            },
            statistics: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// CORE MATHEMATICS ENGINE ENDPOINTS
// ========================================

// POST /api/mathematical/process - Process value through complete 6-step framework
router.post('/process', (req, res) => {
    try {
        const { value, precision, marketScale, includeAlignment, includeChargeBalance, includeFractalProof } = req.body;
        
        if (typeof value !== 'number' || !isFinite(value)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid value: must be finite number'
            });
        }

        const result = coreEngine.processValue(value, {
            precision: precision || 49,
            marketScale: marketScale || 1e9,
            includeAlignment: includeAlignment !== false,
            includeChargeBalance: includeChargeBalance !== false,
            includeFractalProof: includeFractalProof || false
        });

        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/mathematical/harmonize - Harmonize exchange rate between two values
router.post('/harmonize', (req, res) => {
    try {
        const { value1, value2, marketScale } = req.body;
        
        if (typeof value1 !== 'number' || !isFinite(value1)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid value1: must be finite number'
            });
        }
        
        if (typeof value2 !== 'number' || !isFinite(value2) || value2 === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid value2: must be finite non-zero number'
            });
        }

        const result = coreEngine.harmonizeExchangeRate(value1, value2, marketScale || 1e9);

        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/mathematical/coil-optimize - Optimize value to exact coil units
router.post('/coil-optimize', (req, res) => {
    try {
        const { value, precision } = req.body;
        
        if (typeof value !== 'number' || !isFinite(value)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid value: must be finite number'
            });
        }

        const result = coreEngine.optimizeCoilUnits(value, precision || 49);

        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/mathematical/charge-balance - Calculate charge balance
router.post('/charge-balance', (req, res) => {
    try {
        const { value, distance } = req.body;
        
        if (typeof value !== 'number' || !isFinite(value)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid value: must be finite number'
            });
        }

        const result = coreEngine.calculateChargeBalance(value, distance || 1);

        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/mathematical/harmony-score/:value - Calculate harmony score for a value
router.get('/harmony-score/:value', (req, res) => {
    try {
        const value = parseFloat(req.params.value);
        
        if (!isFinite(value)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid value: must be finite number'
            });
        }

        const score = coreEngine.calculateHarmonyScore(value);
        const alignment = coreEngine.alignToHenryProgression(value);

        res.json({
            success: true,
            value: value,
            harmonyScore: score,
            alignment: alignment,
            interpretation: score > 0.7 ? 'highly harmonic' : score > 0.4 ? 'moderately harmonic' : 'low harmony',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/mathematical/core-constants - Get all core engine constants
router.get('/core-constants', (req, res) => {
    try {
        const constants = coreEngine.getSystemConstants();

        res.json({
            success: true,
            constants: constants,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
