/*
 * SOLIDARITY PLATFORM - HARMONIOUS SAFETY COORDINATOR
 * =====================================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

// src/core/HarmoniousSafetyCoordinator.js

// Safety tiers: lower = stricter / safer.
const SAFETY_TIERS = {
    OFF: 0,          // Fully disabled / offline
    CRITICAL: 1,     // Only essential, strongly sandboxed actions
    HIGH: 2,         // Very strict; heavy filtering, no automation
    MEDIUM: 3,       // Normal safe operation
    LOW: 4,          // Relaxed but still guarded
    EXPERIMENTAL: 5, // Labs / testing, not for prod users
    LAB: 6,          // Internal experiments only
    OPEN: 7,         // Max freedom, not for money / safety critical
};

// Inverse phi, your 0.618 baseline.
const PHI_INV = 0.61803398875;

class HarmoniousSafetyCoordinator {
    constructor(initialTier = SAFETY_TIERS.MEDIUM, logger = console) {
        this.logger = logger;
        this.baselinePhi = PHI_INV;

        // Per-subsystem safety tiers.
        this.subsystemLevels = {
            ai: initialTier,
            quantum: initialTier,
            launcher: initialTier,
            financial: initialTier,
        };

        // Global effective tier (most conservative).
        this.currentTier = this._mostConservativeTier();
    }

    // --- Core getters/setters ---

    setSubsystemLevel(name, tier, meta = {}) {
        if (!Object.prototype.hasOwnProperty.call(this.subsystemLevels, name)) {
            this.logger.warn(`[SafetyCoordinator] Unknown subsystem: ${name}`);
            return this.currentTier;
        }

        if (!this._isValidTier(tier)) {
            this.logger.warn(`[SafetyCoordinator] Invalid tier ${tier} for ${name}`);
            return this.currentTier;
        }

        const prev = this.subsystemLevels[name];
        this.subsystemLevels[name] = tier;
        this.currentTier = this._mostConservativeTier();

        this._logEvent('subsystem-level-change', {
            subsystem: name,
            previousTier: prev,
            newTier: tier,
            globalTier: this.currentTier,
            meta,
        });

        return this.currentTier;
    }

    getSubsystemLevel(name) {
        if (!Object.prototype.hasOwnProperty.call(this.subsystemLevels, name)) {
            this.logger.warn(`[SafetyCoordinator] Unknown subsystem requested: ${name}`);
            return null;
        }
        return this.subsystemLevels[name];
    }

    getGlobalTier() {
        return this.currentTier;
    }

    // --- Emergency & Safety Logic ---

    emergencyStabilization(reason = "Manual override to baseline 0.618") {
        this.logger.warn(`[SafetyCoordinator] EMERGENCY STABILIZATION TRIGGERED. Reason: ${reason}`);

        // Lock everything down to CRITICAL (or you could use OFF depending on severity)
        this.currentTier = SAFETY_TIERS.CRITICAL;

        Object.keys(this.subsystemLevels).forEach((k) => {
            this.subsystemLevels[k] = SAFETY_TIERS.CRITICAL;
        });

        const eventPayload = {
            tier: this.currentTier,
            baselinePhi: this.baselinePhi,
            reason,
            timestamp: new Date().toISOString(),
        };

        this._logEvent('emergency-stabilization', eventPayload);

        return eventPayload;
    }

    // --- Internal Helpers ---

    _mostConservativeTier() {
        // Since lower numeric tier is stricter, we use Math.min to find the safest constraint.
        return Math.min(...Object.values(this.subsystemLevels));
    }

    _isValidTier(tier) {
        return Object.values(SAFETY_TIERS).includes(tier);
    }

    _logEvent(eventType, payload) {
        // Centralized logging for safety changes so nothing happens in a black box.
        this.logger.info(`[SafetyCoordinator Event: ${eventType}]`, payload);
    }
}

module.exports = { HarmoniousSafetyCoordinator, SAFETY_TIERS, PHI_INV };
