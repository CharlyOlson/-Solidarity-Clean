/*
 * SOLIDARITY PLATFORM - MARKET STRESS TEST RUNNER
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
 * Generic stress test runner.  Pass any registered entity ID.
 *
 * Phases
 * ──────
 * 1  BASELINE          Normal market signals
 * 2  DISTRIBUTOR SHOCK Zero out all distributor signals
 * 3  COMPETITOR SURGE  Amplify competitor signals ×3.5 (Henry control ratio)
 * 4  INVESTOR EXODUS   Zero out all investor signals
 * 5  SUPPLY BREAK      Zero out all supplier signals
 * 6  BIG ASK           All 49 recursion levels + all entities at max signal (1.0)
 *
 * Each phase reports:
 *   { phase, name, coherenceScore, safetyTier, isOptimal,
 *     networkNodeCount, networkEdgeCount, networkTriangleCount,
 *     recursionDepth, halted }
 */

'use strict';

const registry = require('./entity_registry');
const { project, printProjection, HENRY_FULL } = require('./projection_engine');
const { SAFETY_LEVEL } = registry;

/**
 * Run all stress-test phases for a given center entity.
 *
 * @param {string} entityId
 * @param {object} [opts]
 * @param {number} [opts.maxDepth=7]
 * @param {number} [opts.safetyLevel=0.618]
 * @param {boolean} [opts.verbose=false]  print each phase report
 * @returns {object[]}  array of phase result objects
 */
function runStressTest(entityId, opts = {}) {
  const maxDepth    = opts.maxDepth    !== undefined ? opts.maxDepth    : 7;
  const safetyLevel = opts.safetyLevel !== undefined ? opts.safetyLevel : SAFETY_LEVEL;
  const verbose     = opts.verbose     !== undefined ? opts.verbose     : false;

  if (!registry.has(entityId)) {
    throw new Error(`StressTest: entity "${entityId}" not found in registry`);
  }

  const results = [];

  // ── Phase helpers ──────────────────────────────────────────────

  function runPhase(phaseNum, phaseName, overrides, maxRecursion) {
    const result = project(entityId, {
      maxDepth,
      safetyLevel,
      overrides,
      maxRecursion: maxRecursion || 49,
    });

    const phaseResult = {
      phase:                phaseNum,
      name:                 phaseName,
      coherenceScore:       result.coherenceScore,
      safetyTier:           result.safetyTier,
      isOptimal:            result.isOptimal,
      networkNodeCount:     result.networkSummary.nodeCount,
      networkEdgeCount:     result.networkSummary.edgeCount,
      networkTriangleCount: result.networkSummary.triangleCount,
      recursionDepth:       result.recursionDepth,
      halted:               result.halted,
      shortTerm:            result.shortTerm,
      midTerm:              result.midTerm,
      longTerm:             result.longTerm,
    };

    results.push(phaseResult);
    if (verbose) _printPhase(phaseResult, result);
    return phaseResult;
  }

  // ── Phase 1: Baseline ──────────────────────────────────────────
  runPhase(1, 'BASELINE', new Map(), 49);

  // ── Phase 2: Distributor shock ─────────────────────────────────
  {
    const ov = new Map();
    registry.getByRole('distributor').forEach(e => ov.set(e.id, 0));
    runPhase(2, 'DISTRIBUTOR_SHOCK', ov, 49);
  }

  // ── Phase 3: Competitor surge ──────────────────────────────────
  // Henry control ratio 3.5 — cap at 1.0
  {
    const ov = new Map();
    registry.getByRole('competitor').forEach(e => {
      ov.set(e.id, Math.min(1, e.baseSignal * 3.5));
    });
    runPhase(3, 'COMPETITOR_SURGE', ov, 49);
  }

  // ── Phase 4: Investor exodus ───────────────────────────────────
  {
    const ov = new Map();
    registry.getByRole('investor').forEach(e => ov.set(e.id, 0));
    runPhase(4, 'INVESTOR_EXODUS', ov, 49);
  }

  // ── Phase 5: Supply chain break ────────────────────────────────
  {
    const ov = new Map();
    registry.getByRole('supplier').forEach(e => ov.set(e.id, 0));
    runPhase(5, 'SUPPLY_BREAK', ov, 49);
  }

  // ── Phase 6: Big Ask ───────────────────────────────────────────
  {
    const ov = new Map();
    registry.getAll().forEach(e => ov.set(e.id, 1.0));
    runPhase(6, 'BIG_ASK', ov, HENRY_FULL);
  }

  if (verbose) _printSummary(entityId, results);

  return results;
}

// ── Private print helpers ─────────────────────────────────────────────────────

function _printPhase(phaseResult, projResult) {
  console.log('\n' + '─'.repeat(64));
  console.log(`Phase ${phaseResult.phase}: ${phaseResult.name}`);
  printProjection(projResult);
}

function _printSummary(entityId, results) {
  console.log('\n' + '═'.repeat(64));
  console.log(`STRESS TEST SUMMARY — ${entityId}`);
  console.log('═'.repeat(64));
  console.log(
    'Phase'.padEnd(4) + ' ' +
    'Name'.padEnd(22) + ' ' +
    'Coh.Score'.padEnd(10) + ' ' +
    'Tier'.padEnd(16) + ' ' +
    'Optimal'.padEnd(8) + ' ' +
    'Halted'
  );
  console.log('─'.repeat(64));
  results.forEach(r => {
    console.log(
      String(r.phase).padEnd(4) + ' ' +
      r.name.padEnd(22) + ' ' +
      String(r.coherenceScore).padEnd(10) + ' ' +
      r.safetyTier.padEnd(16) + ' ' +
      (r.isOptimal ? 'YES' : 'NO').padEnd(8) + ' ' +
      (r.halted ? 'YES' : 'NO')
    );
  });
  console.log('═'.repeat(64));
}

module.exports = { runStressTest };
