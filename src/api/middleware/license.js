/*
 * SOLIDARITY PLATFORM - LICENSE KEY SYSTEM
 * =========================================
 *
 * Generates, validates, and manages license keys for controlled distribution.
 * Keys encode: tier, expiration, and a cryptographic signature.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');

// The signing secret — in production, load from env variable
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'solidarity-platform-signing-key-change-in-production';

// ═══════════════════════════════════════════════════════════════════════════
// TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const TIERS = {
    observer: {
        level: 0,
        name: 'Observer',
        description: 'Documentation access only',
        features: ['health', 'docs'],
        rateLimit: 10,        // requests per minute
        financial: false,
        testModeOnly: true,
        aiAccess: false,
        maxStamps: 0
    },
    student: {
        level: 1,
        name: 'Student',
        description: 'Test mode API access',
        features: ['health', 'docs', 'auth', 'session', 'ai_chat'],
        rateLimit: 100,
        financial: false,
        testModeOnly: true,
        aiAccess: true,
        maxStamps: 5
    },
    practitioner: {
        level: 2,
        name: 'Practitioner',
        description: 'Full API access in test mode',
        features: ['health', 'docs', 'auth', 'session', 'ai_chat', 'ai_query', 'hanko', 'mathematical', 'calculator'],
        rateLimit: 1000,
        financial: true,
        testModeOnly: true,
        aiAccess: true,
        maxStamps: 100
    },
    operator: {
        level: 3,
        name: 'Operator',
        description: 'Full production access',
        features: ['*'],     // All features
        rateLimit: 10000,
        financial: true,
        testModeOnly: false,  // Can use live mode
        aiAccess: true,
        maxStamps: -1         // Unlimited
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// KEY GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a license key for a user.
 *
 * Key format: SOL-{tier}-{userId}-{expiry}-{signature}
 *
 * @param {string} tier - 'observer' | 'student' | 'practitioner' | 'operator'
 * @param {string} userId - Username or identifier
 * @param {number} daysValid - How many days the key is valid (default 365)
 * @returns {object} { key, tier, userId, expiresAt }
 */
function generateLicenseKey(tier, userId, daysValid = 365) {
    if (!TIERS[tier]) {
        throw new Error(`Invalid tier: ${tier}. Valid tiers: ${Object.keys(TIERS).join(', ')}`);
    }

    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
    const expiry = expiresAt.toISOString().slice(0, 10).replace(/-/g, '');

    const payload = `${tier}:${userId}:${expiry}`;
    const signature = crypto
        .createHmac('sha256', LICENSE_SECRET)
        .update(payload)
        .digest('hex')
        .slice(0, 12);

    const key = `SOL-${tier.toUpperCase()}-${userId}-${expiry}-${signature}`;

    return {
        key,
        tier,
        tierInfo: TIERS[tier],
        userId,
        expiresAt: expiresAt.toISOString(),
        daysValid
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// KEY VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate a license key.
 *
 * @param {string} key - The license key string
 * @returns {object} { valid, tier, tierInfo, userId, expiresAt, error? }
 */
function validateLicenseKey(key) {
    if (!key || typeof key !== 'string') {
        return { valid: false, error: 'Missing or invalid license key' };
    }

    // Parse key: SOL-{TIER}-{userId}-{expiry}-{signature}
    // Note: userId may contain hyphens, so we locate expiry (8-digit date) to split correctly
    const parts = key.split('-');
    if (parts.length < 5 || parts[0] !== 'SOL') {
        return { valid: false, error: 'Invalid key format' };
    }

    const tierStr = parts[1].toLowerCase();

    // Find the expiry field — 8-digit date (YYYYMMDD), searching from position 2 onward
    let expiryIdx = -1;
    for (let i = 2; i < parts.length - 1; i++) {
        if (/^\d{8}$/.test(parts[i])) { expiryIdx = i; break; }
    }
    if (expiryIdx === -1) {
        return { valid: false, error: 'Invalid key format — no expiry found' };
    }

    const userId = parts.slice(2, expiryIdx).join('-');
    const expiry = parts[expiryIdx];
    const providedSig = parts.slice(expiryIdx + 1).join('-');

    // Check tier
    if (!TIERS[tierStr]) {
        return { valid: false, error: `Unknown tier: ${tierStr}` };
    }

    // Verify signature
    const payload = `${tierStr}:${userId}:${expiry}`;
    const expectedSig = crypto
        .createHmac('sha256', LICENSE_SECRET)
        .update(payload)
        .digest('hex')
        .slice(0, 12);

    if (providedSig !== expectedSig) {
        return { valid: false, error: 'Invalid signature — key may be tampered' };
    }

    // Check expiration
    const year = expiry.slice(0, 4);
    const month = expiry.slice(4, 6);
    const day = expiry.slice(6, 8);
    const expiresAt = new Date(`${year}-${month}-${day}T23:59:59Z`);

    if (isNaN(expiresAt.getTime())) {
        return { valid: false, error: 'Invalid expiration date in key' };
    }

    if (expiresAt < new Date()) {
        return { valid: false, error: 'License key has expired', expiredAt: expiresAt.toISOString() };
    }

    return {
        valid: true,
        tier: tierStr,
        tierInfo: TIERS[tierStr],
        userId,
        expiresAt: expiresAt.toISOString()
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Middleware that validates the license key from the X-License-Key header
 * or SOLIDARITY_LICENSE_KEY environment variable.
 *
 * Attaches req.license = { tier, tierInfo, userId, expiresAt } on success.
 */
function requireLicense(req, res, next) {
    const key = req.headers['x-license-key']
        || req.query.license_key
        || process.env.SOLIDARITY_LICENSE_KEY;

    const result = validateLicenseKey(key);

    if (!result.valid) {
        logger.warn('License rejected', { error: result.error, ip: req.ip });
        return res.status(403).json({
            success: false,
            error: 'License required',
            message: result.error,
            help: 'Obtain a license key from Scott Charles Olson — contact@solidarity.com'
        });
    }

    req.license = {
        tier: result.tier,
        tierInfo: result.tierInfo,
        userId: result.userId,
        expiresAt: result.expiresAt
    };

    next();
}

/**
 * Middleware factory: require a minimum tier level to access a route.
 *
 * Usage: app.use('/api/financial', requireTier('practitioner'), financialRoutes);
 *
 * @param {string} minTier - Minimum tier required
 */
function requireTier(minTier) {
    const minLevel = TIERS[minTier]?.level;
    if (minLevel === undefined) {
        throw new Error(`Invalid tier: ${minTier}`);
    }

    return (req, res, next) => {
        if (!req.license) {
            return res.status(403).json({
                success: false,
                error: 'License validation required before tier check'
            });
        }

        if (req.license.tierInfo.level < minLevel) {
            return res.status(403).json({
                success: false,
                error: `Insufficient access level`,
                required: minTier,
                current: req.license.tier,
                upgrade: `Contact Scott Charles Olson for ${minTier} access — contact@solidarity.com`
            });
        }

        next();
    };
}

/**
 * Middleware: check if a specific feature is allowed for the current tier.
 *
 * Usage: app.post('/api/ai/chat', requireFeature('ai_chat'), handler);
 *
 * @param {string} feature - Feature name to check
 */
function requireFeature(feature) {
    return (req, res, next) => {
        if (!req.license) {
            return res.status(403).json({
                success: false,
                error: 'License validation required'
            });
        }

        const allowed = req.license.tierInfo.features;
        if (allowed.includes('*') || allowed.includes(feature)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: `Feature '${feature}' not available in ${req.license.tier} tier`,
            available: allowed,
            upgrade: `Contact Scott Charles Olson for access — contact@solidarity.com`
        });
    };
}

/**
 * Middleware: enforce test mode for tiers that require it.
 * Prevents non-operator tiers from accessing live financial data.
 */
function enforceTestMode(req, res, next) {
    if (!req.license) return next();

    if (req.license.tierInfo.testModeOnly) {
        req.body = req.body || {};

        // Block any attempt to set testMode: false or liveMode: true
        // Check BEFORE overwriting so the guard is not bypassed
        if (req.body.testMode === false || req.body.liveMode === true) {
            return res.status(403).json({
                success: false,
                error: `${req.license.tier} tier is restricted to test mode`,
                upgrade: 'Operator tier required for live mode — contact@solidarity.com'
            });
        }

        // Force test mode for this tier
        req.body.testMode = true;
    }

    next();
}

module.exports = {
    TIERS,
    generateLicenseKey,
    validateLicenseKey,
    requireLicense,
    requireTier,
    requireFeature,
    enforceTestMode
};
