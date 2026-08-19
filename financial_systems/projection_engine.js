/*
 * SOLIDARITY PLATFORM - MARKET PROJECTION ENGINE
 * ================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * ================================================
 *
 * Applies the Henry 7→14→49 recursion to a built triangle network
 * and produces a forward projection vector.
 *
 * Henry progression:
 *   seed  =  7   (base cycle)
 *   mid   = 14   (2 × seed)
 *   full  = 49   (7 × seed — "the big ask")
 *   ratio =  3.5 (control ratio: 49/14)
 *
 * Three Pythagorean lenses — each mean drives one projection bucket:
 *
 *   shortTerm  ← arithmetic mean   (levels 1–7)
 *     "current state" — direct average of three signals
 *
 *   midTerm    ← geometric mean    (levels 8–14)
 *     "growth momentum" — proportional balance across signals
 *
 *   longTerm   ← harmonic mean     (levels 15–49)
 *     "structural stability" — sensitive to weak/zero signals
 *
 * For each recursion level the engine:
 *   1. Scales the network's Pythagorean mean by φ^(1/level) gain
 *   2. Applies safety-tier damping (halts if safetyLevel < 0.15)
 *   3. Accumulates into the appropriate bucket
 *
 * Output:
 * {
 *   entityId, shortTerm, midTerm, longTerm,
 *   coherenceScore, safetyTier, isOptimal,
 *   recursionDepth, halted, safetyLevel,
 *   pythagorean: { arithmetic, geometric, harmonic, avgBalance, dominantLabel },
 *   henryProgression, networkSummary
 * }
 */

'use strict';

const { buildNetwork, toRenderableGraph } = require('./triangle_network');
const { resolveTier }                     = require('./three_point_connector');
const registry = require('./entity_registry');
const { PHI, SAFETY_LEVEL, clamp01 }     = registry;

const HENRY_SEED  = 7;
const HENRY_MID   = 14;
const HENRY_FULL  = 49;
const HENRY_RATIO = 3.5;

const HALT_THRESHOLD = 0.15;

/**
 * Run the projection engine on any registered entity.
 *
 * @param {string} entityId
 * @param {object} [opts]
 * @param {number}             [opts.maxRecursion=49]
 * @param {number}             [opts.maxDepth=7]
 * @param {Map<string,number>} [opts.overrides]
 * @param {number}             [opts.safetyLevel=0.618]
 * @returns {object}
 */
function project(entityId, opts = {}) {
  const maxRecursion = opts.maxRecursion !== undefined ? opts.maxRecursion : HENRY_FULL;
  const maxDepth     = opts.maxDepth     !== undefined ? opts.maxDepth     : 7;
  const overrides    = opts.overrides    instanceof Map ? opts.overrides   : new Map();
  const safetyLevel  = opts.safetyLevel  !== undefined ? opts.safetyLevel  : SAFETY_LEVEL;

  const network = buildNetwork(entityId, { maxDepth, overrides, safetyLevel });
  const graph   = toRenderableGraph(network);

  // Network-wide Pythagorean means (from summary)
  const ps          = network.pythagoreanSummary;
  const baseArith   = ps.meanArithmetic  || network.networkCoherence;
  const baseGeo     = ps.meanGeometric   || network.networkCoherence;
  const baseHarm    = ps.meanHarmonic    || network.networkCoherence;

  // ── Henry recursion — three separate mean accumulators ────────
  let shortSum = 0; let shortCount = 0;  // arithmetic lens, levels 1–7
  let midSum   = 0; let midCount   = 0;  // geometric  lens, levels 8–14
  let longSum  = 0; let longCount  = 0;  // harmonic   lens, levels 15–49

  let currentArith = baseArith;
  let currentGeo   = baseGeo;
  let currentHarm  = baseHarm;

  let halted   = false;
  let levelsRun = 0;

  for (let level = 1; level <= maxRecursion; level++) {
    // Safety halt: any mean below threshold stops projection
    const minSignal = Math.min(currentArith, currentGeo, currentHarm);
    if (minSignal < HALT_THRESHOLD) {
      halted = true;
      break;
    }

    levelsRun = level;

    const gain = Math.pow(PHI, 1 / level);

    // Scale each mean, normalise back via /PHI, apply safety damping
    const scaledArith = clamp01(currentArith * gain / PHI * (safetyLevel / SAFETY_LEVEL));
    const scaledGeo   = clamp01(currentGeo   * gain / PHI * (safetyLevel / SAFETY_LEVEL));
    const scaledHarm  = clamp01(currentHarm  * gain / PHI * (safetyLevel / SAFETY_LEVEL));

    // Smooth progression
    currentArith = clamp01((currentArith + scaledArith) / 2);
    currentGeo   = clamp01((currentGeo   + scaledGeo)   / 2);
    currentHarm  = clamp01((currentHarm  + scaledHarm)  / 2);

    if (level <= HENRY_SEED) {
      shortSum += currentArith; shortCount++;
    } else if (level <= HENRY_MID) {
      midSum += currentGeo; midCount++;
    } else {
      longSum += currentHarm; longCount++;
    }
  }

  const shortTerm = shortCount > 0 ? clamp01(shortSum / shortCount) : baseArith;
  const midTerm   = midCount   > 0 ? clamp01(midSum   / midCount)   : baseGeo;
  const longTerm  = longCount  > 0 ? clamp01(longSum  / longCount)  : baseHarm;

  const finalCoherence = clamp01((shortTerm + midTerm + longTerm) / 3);

  return {
    entityId,
    shortTerm:      parseFloat(shortTerm.toFixed(6)),
    midTerm:        parseFloat(midTerm.toFixed(6)),
    longTerm:       parseFloat(longTerm.toFixed(6)),
    coherenceScore: parseFloat(finalCoherence.toFixed(6)),
    safetyTier:     resolveTier(finalCoherence),
    isOptimal:      finalCoherence >= 0.25 && finalCoherence < 0.75,
    recursionDepth: levelsRun,
    halted,
    safetyLevel,
    pythagorean: {
      arithmetic:    parseFloat(baseArith.toFixed(6)),
      geometric:     parseFloat(baseGeo.toFixed(6)),
      harmonic:      parseFloat(baseHarm.toFixed(6)),
      avgBalance:    ps.avgBalance,
      dominantLabel: ps.dominantLabel,
    },
    henryProgression: { seed: HENRY_SEED, mid: HENRY_MID, full: HENRY_FULL, ratio: HENRY_RATIO },
    networkSummary:   graph.summary,
  };
}

/**
 * Print a projection report to stdout.
 * @param {object} result
 */
function printProjection(result) {
  console.log('\n' + '═'.repeat(68));
  console.log(`MARKET PROJECTION — ${result.entityId}`);
  console.log('═'.repeat(68));
  console.log(`Network  : ${result.networkSummary.nodeCount} nodes, ` +
              `${result.networkSummary.edgeCount} edges, ` +
              `${result.networkSummary.triangleCount} triangles`);
  console.log(`Recursion: ${result.recursionDepth} levels` +
              (result.halted ? ' (HALTED — safety threshold)' : ''));
  console.log('─'.repeat(68));
  console.log('PYTHAGOREAN LENSES');
  console.log(`  Arithmetic mean  (current state)       : ${result.pythagorean.arithmetic}`);
  console.log(`  Geometric  mean  (growth momentum)     : ${result.pythagorean.geometric}`);
  console.log(`  Harmonic   mean  (structural stability): ${result.pythagorean.harmonic}`);
  console.log(`  Avg balance      : ${result.pythagorean.avgBalance}  (${result.pythagorean.dominantLabel})`);
  console.log('─'.repeat(68));
  console.log(`Short-Term  (arith lens, levels  1– 7) : ${result.shortTerm}`);
  console.log(`Mid-Term    (geom  lens, levels  8–14) : ${result.midTerm}`);
  console.log(`Long-Term   (harm  lens, levels 15–49) : ${result.longTerm}`);
  console.log('─'.repeat(68));
  console.log(`Coherence Score : ${result.coherenceScore}`);
  console.log(`Safety Tier     : ${result.safetyTier}`);
  console.log(`Optimal Band?   : ${result.isOptimal ? '✅ YES (0.25–0.75)' : '⚠️  NO'}`);
  console.log('═'.repeat(68));
}

module.exports = {
  project,
  printProjection,
  HENRY_SEED,
  HENRY_MID,
  HENRY_FULL,
  HENRY_RATIO,
  HALT_THRESHOLD,
};
