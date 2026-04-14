/*
 * SOLIDARITY PLATFORM - TIER CONFIGURATION
 * ==========================================
 *
 * Defines the two product tiers and their capabilities.
 *
 * Personal (free): Individual or family use. Local AI via Ollama.
 *   No federal oversight. Self-hosted or lightweight.
 *
 * Business (subscription): Organization-scale. Perplexity API for AI.
 *   Compliance-ready for GENIUS Act / OCC licensing.
 *   Monitored coherence scoring. Hosted infrastructure.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const TIERS = {
  personal: {
    name: 'Personal',
    description: 'Individual and family financial management',
    ai: {
      provider: 'ollama',          // Local, free
      fallback: null,              // No fallback — offline message if Ollama unavailable
      maxTokens: 1024,
    },
    features: {
      treasurySlots: 5,            // Limited slot allocation
      coherenceMonitoring: true,   // Can see coherence score
      coherencePush: false,        // Cannot push to chain (read-only)
      transactionLimit: '0.1',     // Max ETH per transaction
      complianceReporting: false,  // No compliance tier
      distributionScheduling: false,
    },
    limits: {
      aiQueriesPerDay: null,       // Unlimited (local)
      wallets: 3,                  // Max connected wallets
      historyDays: 90,            // Transaction history retention
    },
  },

  business: {
    name: 'Business',
    description: 'Organization-scale financial operations with compliance support',
    ai: {
      provider: 'perplexity',      // Cloud API
      fallback: 'ollama',          // Falls back to local if API unavailable
      maxTokens: 2048,
    },
    features: {
      treasurySlots: 17,           // Full slot allocation (all treasury positions)
      coherenceMonitoring: true,   // Full monitoring dashboard
      coherencePush: true,         // Can push coherence updates on-chain
      transactionLimit: null,      // No hard limit (compliance-governed)
      complianceReporting: true,   // GENIUS Act / OCC reporting
      distributionScheduling: true,// Scheduled treasury distributions
    },
    limits: {
      aiQueriesPerDay: 500,        // API rate limit
      wallets: null,               // Unlimited
      historyDays: null,           // Full history
    },
  },
};

/**
 * Get the current tier config based on TIER env var.
 * Defaults to 'personal' if not set.
 */
function getCurrentTier() {
  const tierName = process.env.TIER || 'personal';
  return TIERS[tierName] || TIERS.personal;
}

/**
 * Check if a feature is available in the current tier.
 * @param {string} feature — key from tier.features
 */
function hasFeature(feature) {
  const tier = getCurrentTier();
  return tier.features[feature] !== false && tier.features[feature] !== undefined;
}

/**
 * Get the limit value for the current tier.
 * @param {string} limitName — key from tier.limits
 */
function getLimit(limitName) {
  const tier = getCurrentTier();
  return tier.limits[limitName];
}

module.exports = {
  TIERS,
  getCurrentTier,
  hasFeature,
  getLimit,
};
