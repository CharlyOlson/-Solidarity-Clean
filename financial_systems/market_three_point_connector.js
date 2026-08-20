/*
 * SOLIDARITY PLATFORM - MARKET THREE-POINT CONNECTOR
 * =================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * =================================================
 *
 * Three-point connector model for IBM market coherence.
 *
 * Point 1 – IBM Core Financials
 *   The primary anchor.  Signal derived from IBM's own price/earnings
 *   movement normalised to [0,1] via φ-ratio weighting.
 *
 * Point 2 – Ecosystem Entities
 *   Weighted aggregate of distributors, competitors, and suppliers.
 *   Competitor signals are inverted (strong competitor = pressure on core entity).
 *
 * Point 3 – Consistently-Profiting Investors
 *   Institutional money flow signal.  High signal = sustained buying.
 *
 * The three point signals are bridged into a single `coherenceScore`
 * using φ-weighted average:
 *   coherenceScore = (p1 * w1 + p2 * w2 + p3 * w3) / (w1 + w2 + w3)
 * where w1=PHI^2, w2=PHI, w3=1  (descending φ-power weights).
 */

'use strict';

const { seed: seedMarket, MARKET_SEED } = require('./market_entities');
const registry = require('./entity_registry');

// Ensure IBM ecosystem is seeded before we access entities
seedMarket();

const PHI          = 1.618;
const SAFETY_LEVEL = 0.618;

// Pull entity groups from the registry by role
function _byRole(role) {
  return MARKET_SEED.filter(e => e.role === role).map(e => registry.get(e.id) || e);
}

const MARKET_CORE    = registry.get('ibm') || MARKET_SEED.find(e => e.id === 'ibm');
const DISTRIBUTORS = _byRole('distributor');
const COMPETITORS  = _byRole('competitor');
const INVESTORS    = _byRole('investor');
const SUPPLIERS    = _byRole('supplier');

// φ-power weights for the three points
const W1 = PHI * PHI;  // ~2.618  — core financials (highest)
const W2 = PHI;        // ~1.618  — ecosystem
const W3 = 1.0;        //  1.000  — investors
const W_TOTAL = W1 + W2 + W3;

// Safety tier thresholds (platform convention)
const TIERS = Object.freeze([
  { name: 'EMERGENCY',      min: 0.00, max: 0.05 },
  { name: 'WARNING',        min: 0.05, max: 0.15 },
  { name: 'CAUTION',        min: 0.15, max: 0.25 },
  { name: 'OPTIMAL',        min: 0.25, max: 0.75 },
  { name: 'UPPER_CAUTION',  min: 0.75, max: 0.85 },
  { name: 'UPPER_WARNING',  min: 0.85, max: 0.95 },
  { name: 'CRITICAL_UPPER', min: 0.95, max: 1 },
]);

/**
 * Resolve the safety tier name for a given score.
 * @param {number} score – value in [0,1]
 * @returns {string}
 */
function resolveTier(score) {
  const s = Math.max(0, Math.min(1, score));
  const tier = TIERS.find(t => s >= t.min && s < t.max);
  return tier ? tier.name : 'CRITICAL_UPPER';
}

/**
 * Clamp a value to [0, 1].
 * @param {number} v
 * @returns {number}
 */
function clamp(v) {
  return Math.max(0, Math.min(1, v));
}

class IBMThreePointConnector {
  /**
   * @param {object} [opts]
   * @param {number} [opts.safetyLevel=0.618]
   */
  constructor(opts = {}) {
    this.safetyLevel = opts.safetyLevel !== undefined ? opts.safetyLevel : SAFETY_LEVEL;
    this.phi = PHI;

    // Runtime signal overrides: entityId → overrideSignal (0–1)
    this._signalOverrides = {};

    // Last computed state
    this._lastResult = null;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Override the signal for a specific entity (used by stress tests).
   * @param {string} entityId
   * @param {number|null} signal  null = remove override
   */
  setSignal(entityId, signal) {
    if (signal === null || signal === undefined) {
      delete this._signalOverrides[entityId];
    } else {
      this._signalOverrides[entityId] = clamp(signal);
    }
  }

  /**
   * Reset all signal overrides back to entity base signals.
   */
  resetSignals() {
    this._signalOverrides = {};
  }

  /**
   * Compute Point 1: IBM Core Financial signal.
   * @param {number} [ibmSignalOverride]  optional direct override
   * @returns {{ signal: number, weight: number, tier: string }}
   */
  computePoint1(ibmSignalOverride) {
    const override = this._signalOverrides[MARKET_CORE.id];
    const raw = ibmSignalOverride !== undefined
      ? ibmSignalOverride
      : (override !== undefined ? override : MARKET_CORE.baseSignal);
    const signal = clamp(raw);
    return { signal, weight: W1, tier: resolveTier(signal) };
  }

  /**
   * Compute Point 2: Ecosystem aggregate signal.
   * Distributors and suppliers contribute positively (good supply chain = positive).
   * Competitors contribute inversely (strong competitor = downward pressure on core entity).
   * @returns {{ signal: number, weight: number, tier: string, breakdown: object }}
   */
  computePoint2() {
    const distSignal  = this._weightedSignal(DISTRIBUTORS, false);
    const suppSignal  = this._weightedSignal(SUPPLIERS,    false);
    const compSignal  = this._weightedSignal(COMPETITORS,  true);  // inverted

    // Sub-weights within Point 2: distributors=PHI, suppliers=1, competitors=PHI^2
    // (competitors weighted highest because they exert the most pressure)
    const wDist = PHI;
    const wSupp = 1.0;
    const wComp = PHI * PHI;
    const wTotal = wDist + wSupp + wComp;

    const signal = clamp(
      (distSignal * wDist + suppSignal * wSupp + compSignal * wComp) / wTotal
    );

    return {
      signal,
      weight: W2,
      tier: resolveTier(signal),
      breakdown: { distributors: distSignal, suppliers: suppSignal, competitors: compSignal },
    };
  }

  /**
   * Compute Point 3: Consistent investor signal.
   * @returns {{ signal: number, weight: number, tier: string }}
   */
  computePoint3() {
    const signal = this._weightedSignal(INVESTORS, false);
    return { signal, weight: W3, tier: resolveTier(signal) };
  }

  /**
   * Bridge all three points into a single coherence score.
   * @returns {object} Full connector result
   */
  connect() {
    const p1 = this.computePoint1();
    const p2 = this.computePoint2();
    const p3 = this.computePoint3();

    const coherenceScore = clamp(
      (p1.signal * W1 + p2.signal * W2 + p3.signal * W3) / W_TOTAL
    );

    const safetyTier = resolveTier(coherenceScore);
    const isOptimal  = coherenceScore >= 0.25 && coherenceScore < 0.75;

    const result = {
      coherenceScore,
      safetyTier,
      isOptimal,
      safetyLevel: this.safetyLevel,
      points: { p1, p2, p3 },
      weights: { w1: W1, w2: W2, w3: W3, total: W_TOTAL },
      phi: this.phi,
    };

    this._lastResult = result;
    return result;
  }

  /**
   * Return the last computed result without re-running.
   * @returns {object|null}
   */
  getLastResult() {
    return this._lastResult;
  }

  /**
   * Print a human-readable report to stdout.
   */
  printReport() {
    const r = this.connect();
    console.log(`\n${'═'.repeat(60)}`);
    console.log('MARKET THREE-POINT CONNECTOR REPORT');
    console.log('═'.repeat(60));
    console.log(`φ (phi)        : ${this.phi}`);
    console.log(`Safety Level   : ${this.safetyLevel}`);
    console.log('─'.repeat(60));
    console.log(`Point 1 – Core : ${r.points.p1.signal.toFixed(4)}  [${r.points.p1.tier}]`);
    console.log(`Point 2 – Eco  : ${r.points.p2.signal.toFixed(4)}  [${r.points.p2.tier}]`);
    console.log(`  Distributors : ${r.points.p2.breakdown.distributors.toFixed(4)}`);
    console.log(`  Suppliers    : ${r.points.p2.breakdown.suppliers.toFixed(4)}`);
    console.log(`  Competitors  : ${r.points.p2.breakdown.competitors.toFixed(4)} (inverted)`);
    console.log(`Point 3 – Inv  : ${r.points.p3.signal.toFixed(4)}  [${r.points.p3.tier}]`);
    console.log('─'.repeat(60));
    console.log(`Coherence Score: ${r.coherenceScore.toFixed(4)}`);
    console.log(`Safety Tier    : ${r.safetyTier}`);
    console.log(`Optimal Band   : ${r.isOptimal ? '✅ YES (0.25–0.75)' : '⚠️  NO'}`);
    console.log('═'.repeat(60));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Compute a movement-weight-normalised signal for an entity list.
   * @param {readonly object[]} entities
   * @param {boolean} invert  – if true, signal = 1 - baseSignal (pressure)
   * @returns {number}
   */
  _weightedSignal(entities, invert) {
    const tw = entities.reduce((s, e) => s + e.movementWeight, 0);
    if (tw === 0) return invert ? 0.5 : 0.5;

    const sum = entities.reduce((s, e) => {
      const override = this._signalOverrides[e.id];
      const raw = override !== undefined ? override : e.baseSignal;
      const sig = invert ? clamp(1 - raw) : clamp(raw);
      return s + sig * e.movementWeight;
    }, 0);

    return clamp(sum / tw);
  }
}

module.exports = {
  IBMThreePointConnector,
  resolveTier,
  TIERS,
  W1, W2, W3, W_TOTAL,
};
