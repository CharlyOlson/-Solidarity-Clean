/*
 * SOLIDARITY PLATFORM - GENERIC THREE-POINT CONNECTOR
 * =====================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * =====================================================
 *
 * Computes a φ-weighted, Pythagorean-balanced coherence score
 * for any triangle: a center entity + exactly two connector
 * entities.
 *
 * Three points:
 *   Point 1 – center entity signal         (weight φ²  ≈ 2.618)
 *   Point 2 – first connector signal       (weight φ   ≈ 1.618)
 *   Point 3 – second connector signal      (weight 1.0)
 *
 * Raw coherence:
 *   raw = (p1·w1 + p2·w2 + p3·w3) / (w1+w2+w3)
 *
 * Then the Pythagorean balancer:
 *   1. Treats (p1, p2, p3) as triangle sides
 *   2. Scores how close they are to a right-triangle
 *   3. Corrects out-of-balance signals toward arithmetic mean
 *   4. Modulates raw coherence by balance score + φ-anchor
 *   5. Emits arithmetic/geometric/harmonic means as separate lenses
 *
 * Competitor role signals are inverted before contributing
 * (strong competitor = downward pressure on the center entity).
 *
 * Safety tiers (platform convention):
 *   EMERGENCY       0.00–0.05
 *   WARNING         0.05–0.15
 *   CAUTION         0.15–0.25
 *   OPTIMAL         0.25–0.75  ← target band
 *   UPPER_CAUTION   0.75–0.85
 *   UPPER_WARNING   0.85–0.95
 *   CRITICAL_UPPER  0.95–1.00
 */

'use strict';

const registry   = require('./entity_registry');
const pyth       = require('./pythagorean_balancer');
const { PHI, SAFETY_LEVEL, clamp01 } = registry;

// φ-power weights for the three points
const W1      = PHI * PHI;      // ≈ 2.618
const W2      = PHI;             // ≈ 1.618
const W3      = 1.0;
const W_TOTAL = W1 + W2 + W3;  // ≈ 5.236

const TIERS = Object.freeze([
  { name: 'EMERGENCY',      min: 0.00, max: 0.05 },
  { name: 'WARNING',        min: 0.05, max: 0.15 },
  { name: 'CAUTION',        min: 0.15, max: 0.25 },
  { name: 'OPTIMAL',        min: 0.25, max: 0.75 },
  { name: 'UPPER_CAUTION',  min: 0.75, max: 0.85 },
  { name: 'UPPER_WARNING',  min: 0.85, max: 0.95 },
  { name: 'CRITICAL_UPPER', min: 0.95, max: 1.01 },
]);

/**
 * Resolve the safety tier name for a score in [0,1].
 * @param {number} score
 * @returns {string}
 */
function resolveTier(score) {
  const s = clamp01(score);
  const tier = TIERS.find(t => s >= t.min && s < t.max);
  return tier ? tier.name : 'CRITICAL_UPPER';
}

/**
 * Get the effective signal for an entity, applying an optional override map.
 * Competitor signals are inverted (pressure = 1 - signal).
 *
 * @param {string}            entityId
 * @param {Map<string,number>} overrides
 * @param {boolean}           isCenter  – center entity is never inverted
 * @returns {number}  signal in [0,1]
 */
function effectiveSignal(entityId, overrides, isCenter) {
  const entity = registry.get(entityId);
  if (!entity) return SAFETY_LEVEL;

  const raw = overrides.has(entityId)
    ? overrides.get(entityId)
    : entity.baseSignal;

  const signal      = clamp01(raw);
  const isCompetitor = !isCenter && entity.role === 'competitor';
  return isCompetitor ? clamp01(1 - signal) : signal;
}

/**
 * Compute a three-point coherence score for a triangle,
 * incorporating full Pythagorean balance analysis.
 *
 * @param {string}             centerId
 * @param {string}             connA
 * @param {string}             connB
 * @param {Map<string,number>} [overrides]
 * @param {number}             [safetyLevel=0.618]
 * @returns {TriangleResult}
 *
 * @typedef {object} TriangleResult
 * @property {number}  coherenceScore      – Pythagorean-adjusted coherence
 * @property {number}  rawCoherence        – φ-weighted coherence before balancing
 * @property {string}  safetyTier
 * @property {boolean} isOptimal
 * @property {number}  safetyLevel
 * @property {object}  points              – { p1, p2, p3 } with signal + weight + tier
 * @property {object}  pythagorean         – full PythagoreanResult
 * @property {object}  means               – { arithmetic, geometric, harmonic }
 */
function computeTriangle(centerId, connA, connB, overrides = new Map(), safetyLevel = SAFETY_LEVEL) {
  const centerEntity = registry.get(centerId);
  const connAEntity  = registry.get(connA);
  const connBEntity  = registry.get(connB);

  const s1 = effectiveSignal(centerId, overrides, true);
  const s2 = effectiveSignal(connA,    overrides, false);
  const s3 = effectiveSignal(connB,    overrides, false);

  // Raw φ-weighted coherence
  const rawCoherence = clamp01((s1 * W1 + s2 * W2 + s3 * W3) / W_TOTAL);

  // Pythagorean analysis — pass movementWeights so bonus applies to nodes 3 & 4
  const w1 = centerEntity ? centerEntity.movementWeight : 21;
  const w2 = connAEntity  ? connAEntity.movementWeight  : 14;
  const w3 = connBEntity  ? connBEntity.movementWeight  : 14;

  const pythResult = pyth.analyze(s1, s2, s3, w1, w2, w3, rawCoherence);

  // Final coherence = Pythagorean-adjusted value
  const coherenceScore = pythResult.adjustedCoherence;
  const safetyTier     = resolveTier(coherenceScore);

  return {
    coherenceScore,
    rawCoherence,
    safetyTier,
    isOptimal: coherenceScore >= 0.25 && coherenceScore < 0.75,
    safetyLevel,
    points: {
      p1: { entityId: centerId, signal: s1, weight: W1, tier: resolveTier(s1) },
      p2: { entityId: connA,    signal: s2, weight: W2, tier: resolveTier(s2) },
      p3: { entityId: connB,    signal: s3, weight: W3, tier: resolveTier(s3) },
    },
    pythagorean: pythResult,
    means: pythResult.means,
  };
}

module.exports = {
  computeTriangle,
  effectiveSignal,
  resolveTier,
  TIERS,
  W1, W2, W3, W_TOTAL,
};
