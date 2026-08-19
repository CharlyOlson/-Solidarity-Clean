/*
 * SOLIDARITY PLATFORM - PYTHAGOREAN BALANCER
 * ============================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * ============================================
 *
 * Applies Pythagorean geometry to every triangle in the network.
 *
 * CORE IDEA
 * ─────────
 * Each triangle has three point-signals  a, b, c  in [0,1].
 * They are treated as the sides of a geometric triangle.
 * A perfect right triangle satisfies:  a² + b² = c²
 *
 * "Balance score"  measures how close the triangle is to
 * right-triangle equilibrium:
 *
 *   balance = 1 - |a² + b² - c²| / (a² + b² + c²)
 *   → 1.0  means perfectly balanced (right triangle)
 *   → 0.0  means maximally skewed
 *
 * The hypotenuse (longest side) carries the dominant signal.
 * The balance score modulates the coherence output:
 *
 *   adjustedCoherence = rawCoherence * (φ_weight + balance) / (φ_weight + 1)
 *   where φ_weight = 0.618  (bridging baseline)
 *
 * PYTHAGOREAN MEANS
 * ─────────────────
 * All three classical means are computed for (a, b, c):
 *
 *   arithmetic  = (a + b + c) / 3
 *   geometric   = ∛(a · b · c)          (cube root — three signals)
 *   harmonic    = 3 / (1/a + 1/b + 1/c)
 *
 * These feed the projection engine's shortTerm / midTerm / longTerm
 * buckets respectively, providing three independent lenses.
 *
 * NODE-SET TRIPLE
 * ───────────────
 * The valid node set {1, 3, 4, 7, 14, 21} contains the
 * Pythagorean-adjacent triple (3, 4) → 3²+4²=25=5² (5 snaps to 4 or 7).
 * movementWeights 3 and 4 receive a ×φ bonus in balance scoring.
 *
 * CORRECTION FACTOR
 * ─────────────────
 * If the triangle is out of balance (balance < 0.618), a correction
 * vector  δ = (1 - balance) * 0.618  is applied to nudge each signal
 * toward the arithmetic mean before the coherence is re-emitted.
 */

'use strict';

const PHI          = 1.618;
const BASELINE     = 0.618;
const EPSILON      = 1e-9;   // guard against division by zero

// Pythagorean-adjacent node weights that receive a bonus
const PYTH_BONUS_WEIGHTS = new Set([3, 4]);

/**
 * Clamp to [0, 1].
 * @param {number} v
 * @returns {number}
 */
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// ─── Pythagorean means ────────────────────────────────────────────────────────

/**
 * Arithmetic mean of three values.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
function arithmeticMean(a, b, c) {
  return (a + b + c) / 3;
}

/**
 * Geometric mean of three values.
 * Returns 0 if any value is 0.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
function geometricMean(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  return Math.cbrt(a * b * c);
}

/**
 * Harmonic mean of three values.
 * Returns 0 if any value is 0.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
function harmonicMean(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  return 3 / (1 / a + 1 / b + 1 / c);
}

// ─── Triangle balance ─────────────────────────────────────────────────────────

/**
 * Sort three values so that sides[2] is the longest (hypotenuse candidate).
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {[number, number, number]}  [short, mid, long]
 */
function sortedSides(a, b, c) {
  return [a, b, c].sort((x, y) => x - y);
}

/**
 * Compute how close [a, b, c] is to a right triangle.
 * Uses the two shorter sides as legs and the longest as hypotenuse.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}  balance score in [0, 1] — 1 = perfect right triangle
 */
function pythagoreanBalance(a, b, c) {
  const [s1, s2, hyp] = sortedSides(a, b, c);
  const legSumSq  = s1 * s1 + s2 * s2;
  const hypSq     = hyp * hyp;
  const denom     = legSumSq + hypSq + EPSILON;
  const imbalance = Math.abs(legSumSq - hypSq) / denom;
  return clamp01(1 - imbalance);
}

/**
 * Compute the correction vector: nudge each signal toward the arithmetic
 * mean by δ = (1 - balance) * BASELINE, but only when balance < BASELINE.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} balance
 * @returns {{ a: number, b: number, c: number, corrected: boolean }}
 */
function applyCorrection(a, b, c, balance) {
  if (balance >= BASELINE) {
    return { a, b, c, corrected: false };
  }
  const mean  = arithmeticMean(a, b, c);
  const delta = (1 - balance) * BASELINE;
  return {
    a:         clamp01(a + (mean - a) * delta),
    b:         clamp01(b + (mean - b) * delta),
    c:         clamp01(c + (mean - c) * delta),
    corrected: true,
  };
}

// ─── Main balancer ────────────────────────────────────────────────────────────

/**
 * Full Pythagorean analysis of a three-point triangle.
 *
 * @param {number}  p1Signal   – center entity signal
 * @param {number}  p2Signal   – first connector signal
 * @param {number}  p3Signal   – second connector signal
 * @param {number}  [w1=21]    – movementWeight of center entity
 * @param {number}  [w2=14]    – movementWeight of connector A
 * @param {number}  [w3=14]    – movementWeight of connector B
 * @param {number}  [rawCoherence=BASELINE]  – φ-weighted coherence before balancing
 * @returns {PythagoreanResult}
 *
 * @typedef {object} PythagoreanResult
 * @property {number}  balance           – right-triangle balance score [0,1]
 * @property {number}  adjustedCoherence – coherence after balance modulation
 * @property {number}  hypotenuse        – longest side value (dominant signal)
 * @property {object}  means             – { arithmetic, geometric, harmonic }
 * @property {object}  corrected         – { a, b, c, corrected: boolean }
 * @property {boolean} isBalanced        – balance >= BASELINE (0.618)
 * @property {string}  balanceLabel      – human-readable quality label
 * @property {number}  pythagoreanBonus  – extra weight if weights include 3 or 4
 */
function analyze(p1Signal, p2Signal, p3Signal, w1, w2, w3, rawCoherence) {
  const a = clamp01(p1Signal);
  const b = clamp01(p2Signal);
  const c = clamp01(p3Signal);

  const rc = rawCoherence !== undefined ? clamp01(rawCoherence) : BASELINE;

  // Balance score
  const balance = pythagoreanBalance(a, b, c);

  // Pythagorean-node bonus
  const weights = [w1, w2, w3].filter(w => w !== undefined);
  const hasPythWeight = weights.some(w => PYTH_BONUS_WEIGHTS.has(w));
  const pythagoreanBonus = hasPythWeight ? PHI - 1 : 0;  // ≈ 0.618 bonus

  // Adjusted coherence:  modulate raw by balance, boosted by φ-anchor
  const phiWeight = BASELINE + pythagoreanBonus;
  const adjustedCoherence = clamp01(
    rc * (phiWeight + balance) / (phiWeight + 1)
  );

  // Hypotenuse (dominant signal)
  const [, , hyp] = sortedSides(a, b, c);

  // All three Pythagorean means
  const means = {
    arithmetic: parseFloat(arithmeticMean(a, b, c).toFixed(6)),
    geometric:  parseFloat(geometricMean(a, b, c).toFixed(6)),
    harmonic:   parseFloat(harmonicMean(a, b, c).toFixed(6)),
  };

  // Correction
  const corrected = applyCorrection(a, b, c, balance);

  const isBalanced = balance >= BASELINE;

  return {
    balance:           parseFloat(balance.toFixed(6)),
    adjustedCoherence: parseFloat(adjustedCoherence.toFixed(6)),
    hypotenuse:        parseFloat(hyp.toFixed(6)),
    means,
    corrected,
    isBalanced,
    balanceLabel:      _balanceLabel(balance),
    pythagoreanBonus:  parseFloat(pythagoreanBonus.toFixed(6)),
  };
}

/**
 * Human-readable balance quality label.
 * @param {number} balance
 * @returns {string}
 */
function _balanceLabel(balance) {
  if (balance >= 0.95) return 'PERFECT';
  if (balance >= 0.80) return 'STRONG';
  if (balance >= 0.618) return 'BALANCED';
  if (balance >= 0.40) return 'SKEWED';
  if (balance >= 0.20) return 'WEAK';
  return 'BROKEN';
}

module.exports = {
  analyze,
  pythagoreanBalance,
  applyCorrection,
  arithmeticMean,
  geometricMean,
  harmonicMean,
  sortedSides,
  PHI,
  BASELINE,
  PYTH_BONUS_WEIGHTS,
};
