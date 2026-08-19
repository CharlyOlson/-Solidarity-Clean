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
 * Applies the Henry 7→14→49 recursion pattern to a built
 * triangle network and produces a forward projection vector.
 *
 * Henry progression:
 *   seed  = 7   (base cycle)
 *   mid   = 14  (2× seed)
 *   full  = 49  (7× seed — "the big ask")
 *   ratio = 3.5 (control ratio: 49/14 = 3.5)
 *
 * For each recursion level 1…depth the engine:
 *   1. Scales the network coherence by φ^(1/level) (diminishing gain)
 *   2. Applies safety-tier damping (halts at safetyLevel < 0.15)
 *   3. Accumulates into shortTerm (levels 1–7), midTerm (8–14),
 *      longTerm (15–49)
 *
 * Output:
 * {
 *   shortTerm:        number [0-1]
 *   midTerm:          number [0-1]
 *   longTerm:         number [0-1]
 *   coherenceScore:   number [0-1]
 *   safetyTier:       string
 *   recursionDepth:   number  (levels actually run before halt)
 *   halted:           boolean (true if safety tier forced early stop)
 *   networkSummary:   object  (from toRenderableGraph summary)
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
const HENRY_RATIO = 3.5;   // control ratio

const HALT_THRESHOLD = 0.15;   // CAUTION lower bound — halt below this

/**
 * Run the projection engine on any registered entity.
 *
 * @param {string} entityId         – center entity
 * @param {object} [opts]
 * @param {number} [opts.maxRecursion=49]     – Henry full by default
 * @param {number} [opts.maxDepth=7]          – triangle network depth
 * @param {Map<string,number>} [opts.overrides]
 * @param {number} [opts.safetyLevel=0.618]
 * @returns {object}
 */
function project(entityId, opts = {}) {
  const maxRecursion = opts.maxRecursion !== undefined ? opts.maxRecursion : HENRY_FULL;
  const maxDepth     = opts.maxDepth     !== undefined ? opts.maxDepth     : 7;
  const overrides    = opts.overrides    instanceof Map ? opts.overrides   : new Map();
  const safetyLevel  = opts.safetyLevel  !== undefined ? opts.safetyLevel  : SAFETY_LEVEL;

  // Build the triangle network once
  const network = buildNetwork(entityId, { maxDepth, overrides, safetyLevel });
  const graph   = toRenderableGraph(network);
  const baseCoherence = network.networkCoherence;

  // ── Henry recursion ──────────────────────────────────────────
  let shortSum = 0; let shortCount = 0;
  let midSum   = 0; let midCount   = 0;
  let longSum  = 0; let longCount  = 0;

  let currentCoherence = baseCoherence;
  let halted           = false;
  let levelsRun        = 0;

  for (let level = 1; level <= maxRecursion; level++) {
    // Safety halt
    if (currentCoherence < HALT_THRESHOLD) {
      halted = true;
      break;
    }

    levelsRun = level;

    // φ-scaled gain: each level adds a diminishing contribution
    const gain   = Math.pow(PHI, 1 / level);
    const scaled = clamp01(currentCoherence * gain / PHI);  // normalised back via /PHI

    // Apply safety-tier damping
    const damped = clamp01(scaled * safetyLevel / SAFETY_LEVEL);

    currentCoherence = clamp01((currentCoherence + damped) / 2);

    // Accumulate into buckets
    if (level <= HENRY_SEED) {
      shortSum += currentCoherence; shortCount++;
    } else if (level <= HENRY_MID) {
      midSum += currentCoherence; midCount++;
    } else {
      longSum += currentCoherence; longCount++;
    }
  }

  const shortTerm = shortCount > 0 ? clamp01(shortSum / shortCount) : baseCoherence;
  const midTerm   = midCount   > 0 ? clamp01(midSum   / midCount)   : shortTerm;
  const longTerm  = longCount  > 0 ? clamp01(longSum  / longCount)  : midTerm;

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
    henryProgression: { seed: HENRY_SEED, mid: HENRY_MID, full: HENRY_FULL, ratio: HENRY_RATIO },
    networkSummary:  graph.summary,
  };
}

/**
 * Print a projection report to stdout.
 * @param {object} result  return value of project()
 */
function printProjection(result) {
  console.log('\n' + '═'.repeat(64));
  console.log(`MARKET PROJECTION — ${result.entityId}`);
  console.log('═'.repeat(64));
  console.log(`Network  : ${result.networkSummary.nodeCount} nodes, ` +
              `${result.networkSummary.edgeCount} edges, ` +
              `${result.networkSummary.triangleCount} triangles`);
  console.log(`Recursion: ${result.recursionDepth} levels` +
              (result.halted ? ' (HALTED — safety threshold)' : ''));
  console.log('─'.repeat(64));
  console.log(`Short-Term (1–7)   : ${result.shortTerm}`);
  console.log(`Mid-Term  (8–14)   : ${result.midTerm}`);
  console.log(`Long-Term (15–49)  : ${result.longTerm}`);
  console.log('─'.repeat(64));
  console.log(`Coherence Score    : ${result.coherenceScore}`);
  console.log(`Safety Tier        : ${result.safetyTier}`);
  console.log(`Optimal Band?      : ${result.isOptimal ? '✅ YES (0.25–0.75)' : '⚠️  NO'}`);
  console.log('═'.repeat(64));
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
