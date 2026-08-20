/*
 * SOLIDARITY PLATFORM - IBM 4-WEEK WEEKLY FORECAST ENGINE
 * =========================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * =========================================================
 *
 * HOW THE SCAFFOLD WORKS
 * ──────────────────────
 * 1. LIVING NETWORK — WEEKLY STATE EVOLUTION
 *    Every entity in the triangle (IBM + all 15 ecosystem entities)
 *    starts at its baseSignal.  Each week, IBM's price delta is the
 *    market pulse.  That pulse propagates to every connected entity:
 *
 *      entityDelta[week] = ibmDelta × roleFactor × φ⁻¹ × (weight/21)
 *
 *    where:
 *      roleFactor  = -1  for competitors (strong rival = pressure on IBM)
 *                  = +1  for all others
 *      φ⁻¹ = 0.618  (single-hop φ-damping; all entities are at distance 1)
 *      weight/21   = normalized movementWeight (21 is max node)
 *
 *    So each week is a slightly changed version of the one before —
 *    the full triangle breathes together, not just IBM alone.
 *
 * 2. TRIANGLE SCAFFOLD — HENRY LAYERS
 *    The 52 weekly network snapshots are grouped into Henry-progression
 *    layers:
 *      Layer 1 : weeks  1– 7  (seed cycle)
 *      Layer 2 : weeks  8–14  (mid cycle)
 *      Layer 3 : weeks 15–21  (upper-mid)
 *      Layer 4 : weeks 22–52  (long arc)
 *
 *    Each layer's END-OF-LAYER network state (full Map<entityId,signal>)
 *    is fed as the override set into the projection engine.  Each layer
 *    inherits from the one below it — the scaffold genuinely stacks.
 *
 * 3. FORWARD PROJECTION — 4 WEEKLY INTERVALS
 *    Starting from the last historical network state, the engine steps
 *    forward 4 weeks.  At each step:
 *      a) IBM's signal is advanced via φ-scaled momentum decay
 *      b) All entity signals are re-propagated from IBM's new delta
 *      c) The full updated override map is passed to project()
 *      d) Price and confidence band are derived from IBM's signal + range
 *
 * OUTPUT
 * ──────
 * {
 *   currentPrice, high52, low52, anchorDate,
 *   weeklyNetworkStates: [ Map<entityId,signal> × 52 ],
 *   scaffoldLayers: [ { layer, label, weeks, endState, projection } … ],
 *   forecast: [
 *     { week, date, networkState, ibmSignal, price, priceLow, priceHigh,
 *       tier, entitySnapshots: { id, signal, delta, tier }[] }
 *   ],
 *   live, dataTimestamp
 * }
 */

'use strict';

const { fetchIBMMarketData, computeWeeklyChanges } = require('./ibm_market_data');
const { project }         = require('./projection_engine');
const { seed: seedIBM } = require('./ibm_entities');
const registry            = require('./entity_registry');

const PHI          = 1.618;
const SAFETY_LEVEL = 0.618;
const MAX_WEIGHT   = 21;

// Henry layer boundaries (week indices, 1-based)
const LAYER_BOUNDARIES = [
  { layer: 1, label: 'Seed (weeks 1–7)',       from: 1,  to: 7  },
  { layer: 2, label: 'Mid (weeks 8–14)',        from: 8,  to: 14 },
  { layer: 3, label: 'Upper-mid (weeks 15–21)', from: 15, to: 21 },
  { layer: 4, label: 'Long arc (weeks 22–52)',  from: 22, to: 52 },
];

// Role propagation factors: competitors invert the pulse, others follow
const ROLE_FACTOR = {
  core:        1.0,
  distributor: 1.0,
  supplier:    1.0,
  investor:    1.0,
  competitor: -1.0,
  partner:     1.0,
};

function clamp(v) { return Math.max(0, Math.min(1, v)); }

function resolveTier(s) {
  if (s < 0.05) return 'EMERGENCY';
  if (s < 0.15) return 'WARNING';
  if (s < 0.25) return 'CAUTION';
  if (s < 0.75) return 'OPTIMAL';
  if (s < 0.85) return 'UPPER_CAUTION';
  if (s < 0.95) return 'UPPER_WARNING';
  return 'CRITICAL_UPPER';
}

function signalToPrice(signal, high52, low52) {
  return parseFloat((low52 + signal * (high52 - low52)).toFixed(2));
}

/**
 * Build the initial network state from baseSignals.
 * @returns {Map<string, number>}
 */
function buildBaseState() {
  seedIBM();
  const state = new Map();
  for (const e of registry.getAll()) {
    state.set(e.id, e.baseSignal);
  }
  return state;
}

/**
 * Propagate IBM's price delta to every entity for one week.
 * Returns a new state Map (previous state is NOT mutated).
 *
 * @param {Map<string,number>} prevState
 * @param {number} ibmDelta   — change in IBM's signal this week (signed)
 * @returns {Map<string,number>}
 */
function propagateDelta(prevState, ibmDelta) {
  const next = new Map(prevState);
  for (const e of registry.getAll()) {
    if (e.id === 'ibm') continue;
    const roleFactor   = ROLE_FACTOR[e.role] !== undefined ? ROLE_FACTOR[e.role] : 1.0;
    const weightFactor = e.movementWeight / MAX_WEIGHT;
    // φ⁻¹ damping (all entities are 1 hop from IBM)
    const entityDelta  = ibmDelta * roleFactor * (1 / PHI) * weightFactor;
    next.set(e.id, clamp(prevState.get(e.id) + entityDelta));
  }
  return next;
}

/**
 * Evolve the full triangle network through 52 historical weeks.
 * Returns an array of weekly state Maps (index 0 = week 1).
 *
 * @param {Array<{ signal: number, changePct: number }>} enrichedWeeks
 * @param {number} high52
 * @param {number} low52
 * @returns {Array<Map<string,number>>}
 */
function buildWeeklyNetworkStates(enrichedWeeks, high52, low52) {
  let state = buildBaseState();
  const states = [];

  for (let i = 0; i < enrichedWeeks.length; i++) {
    const w = enrichedWeeks[i];

    // IBM's signal this week (derived from price position in 52w range)
    const ibmSignal = w.signal;
    const prevIBM   = state.get('ibm');
    const ibmDelta  = ibmSignal - prevIBM;

    // Update IBM directly from price
    const next = propagateDelta(state, ibmDelta);
    next.set('ibm', ibmSignal);

    states.push(next);
    state = next;
  }

  return states;
}

/**
 * Group weekly states into Henry-progression scaffold layers.
 * Each layer uses its END-OF-LAYER network state to run a full projection.
 *
 * @param {Array<Map<string,number>>} weeklyStates
 * @param {Array<{ date, signal, changePct }>} enrichedWeeks
 * @returns {Array<object>}
 */
function buildScaffold(weeklyStates, enrichedWeeks) {
  return LAYER_BOUNDARIES.map(({ layer, label, from, to }) => {
    const endIdx = Math.min(to, weeklyStates.length) - 1;
    const startIdx = from - 1;
    if (endIdx < startIdx) return null;

    const endState = weeklyStates[endIdx];

    // Average IBM signal across the layer
    const slice = enrichedWeeks.slice(startIdx, endIdx + 1);
    const avgIBMSignal = slice.reduce((s, w) => s + w.signal, 0) / slice.length;

    // Run full network projection with end-of-layer overrides
    const proj = project('ibm', {
      overrides:    endState,
      safetyLevel:  SAFETY_LEVEL,
      maxDepth:     7,
    });

    // Snapshot all entity signals at end of layer
    const entitySnapshot = Array.from(endState.entries()).map(([id, sig]) => {
      const e = registry.get(id);
      return { id, name: e ? e.name : id, role: e ? e.role : '?', signal: parseFloat(sig.toFixed(4)), tier: resolveTier(sig) };
    });

    return {
      layer,
      label,
      weeks:          slice.length,
      weekRange:      { from: slice[0].date, to: slice[slice.length - 1].date },
      avgIBMSignal:   parseFloat(avgIBMSignal.toFixed(4)),
      endIBMSignal:   parseFloat((endState.get('ibm') || 0).toFixed(4)),
      entitySnapshot,
      projection: {
        shortTerm:      proj.shortTerm,
        midTerm:        proj.midTerm,
        longTerm:       proj.longTerm,
        coherenceScore: proj.coherenceScore,
        safetyTier:     proj.safetyTier,
      },
    };
  }).filter(Boolean);
}

/**
 * Step the full network forward N weeks from the last known state.
 * Each forward week evolves every entity just like the historical weeks do.
 *
 * @param {Map<string,number>} lastState  — network state at anchor date
 * @param {object}  topLayer             — scaffold's most recent layer
 * @param {object}  structLayer          — scaffold's structural gravity layer (layer 3)
 * @param {number}  currentPrice
 * @param {number}  high52
 * @param {number}  low52
 * @param {string}  anchorDate
 * @param {number}  [nWeeks=4]
 * @returns {Array<object>}
 */
function projectForwardWeeks(lastState, topLayer, structLayer, currentPrice, high52, low52, anchorDate, nWeeks = 4) {
  let state = new Map(lastState);

  // Momentum: how fast IBM was trending at the scaffold top
  const ibmMomentum = topLayer.projection.midTerm;
  // Structural gravity from upper-mid layer's harmonic lens
  const gravity     = structLayer.projection.longTerm;
  const balance     = topLayer.projection.coherenceScore;

  const weeks = [];
  let date = new Date(anchorDate);
  let prevIBMSignal = state.get('ibm');

  for (let step = 1; step <= nWeeks; step++) {
    date = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isoDate = date.toISOString().slice(0, 10);

    // φ-decayed momentum advance for IBM
    const gain         = Math.pow(PHI, 1 / (step * 3.5));
    const scaledMom    = clamp(ibmMomentum * gain / PHI);

    // IBM's new signal = φ-weighted blend of current position + momentum + gravity
    const wCur  = PHI * PHI;
    const wMom  = PHI;
    const wGrav = 1.0;
    const newIBM = clamp(
      (prevIBMSignal * wCur + scaledMom * wMom + gravity * wGrav) /
      (wCur + wMom + wGrav)
    );

    const ibmDelta = newIBM - prevIBMSignal;

    // Propagate IBM's delta to every entity
    const next = propagateDelta(state, ibmDelta);
    next.set('ibm', newIBM);

    // Full projection with this forward state
    const proj = project('ibm', { overrides: next, safetyLevel: SAFETY_LEVEL, maxDepth: 7 });

    // Confidence band
    const bandWidth = (1 - balance) * 0.618 * (high52 - low52);
    const price     = signalToPrice(newIBM, high52, low52);
    const priceLow  = parseFloat(Math.max(low52,  price - bandWidth).toFixed(2));
    const priceHigh = parseFloat(Math.min(high52, price + bandWidth).toFixed(2));

    // Per-entity snapshot
    const entitySnapshots = Array.from(next.entries()).map(([id, sig]) => {
      const e     = registry.get(id);
      const prev  = state.get(id) || sig;
      return {
        id,
        name:   e ? e.name : id,
        role:   e ? e.role : '?',
        signal: parseFloat(sig.toFixed(4)),
        delta:  parseFloat((sig - prev).toFixed(4)),
        tier:   resolveTier(sig),
      };
    });

    weeks.push({
      week:            step,
      date:            isoDate,
      ibmSignal:       parseFloat(newIBM.toFixed(4)),
      ibmDelta:        parseFloat(ibmDelta.toFixed(4)),
      price,
      priceLow,
      priceHigh,
      tier:            resolveTier(newIBM),
      coherenceScore:  proj.coherenceScore,
      safetyTier:      proj.safetyTier,
      shortTerm:       proj.shortTerm,
      midTerm:         proj.midTerm,
      longTerm:        proj.longTerm,
      entitySnapshots,
    });

    state         = next;
    prevIBMSignal = newIBM;
  }

  return weeks;
}

/**
 * Main entry point.
 * @returns {Promise<object>}
 */
async function runIBMWeeklyForecast() {
  const marketData = await fetchIBMMarketData();
  const { currentPrice, high52, low52, weeklyCloses, live, timestamp } = marketData;

  const enriched          = computeWeeklyChanges(weeklyCloses);
  const weeklyStates      = buildWeeklyNetworkStates(enriched, high52, low52);
  const scaffoldLayers    = buildScaffold(weeklyStates, enriched);
  const lastState         = weeklyStates[weeklyStates.length - 1];
  const anchorDate        = weeklyCloses[weeklyCloses.length - 1].date;
  const topLayer          = scaffoldLayers[scaffoldLayers.length - 1];
  const structLayer       = scaffoldLayers[2] || topLayer;
  const forecast          = projectForwardWeeks(lastState, topLayer, structLayer, currentPrice, high52, low52, anchorDate);

  return {
    currentPrice,
    high52,
    low52,
    anchorDate,
    weeklyNetworkStates: weeklyStates,
    scaffoldLayers,
    forecast,
    live,
    dataTimestamp: timestamp,
  };
}

/**
 * Print a formatted report to stdout.
 * @param {object} result  — from runIBMWeeklyForecast()
 */
function printForecastReport(result) {
  const { currentPrice, high52, low52, anchorDate, scaffoldLayers, forecast, live, dataTimestamp } = result;
  const src = live ? '🌐 LIVE' : '📦 STATIC FALLBACK';

  console.log('\n' + '═'.repeat(72));
  console.log('IBM 4-WEEK WEEKLY FORECAST  —  φ-TRIANGLE SCAFFOLD  (FULL NETWORK)');
  console.log('═'.repeat(72));
  console.log(`Data source   : ${src}`);
  console.log(`Timestamp     : ${dataTimestamp}`);
  console.log(`Anchor date   : ${anchorDate}  (last known close)`);
  console.log(`Current price : $${currentPrice.toFixed(2)}`);
  console.log(`52-week range : $${low52.toFixed(2)}  –  $${high52.toFixed(2)}`);

  console.log('\n📐 HISTORICAL SCAFFOLD  (Henry layers — full network evolved each week)');
  console.log('─'.repeat(72));
  for (const L of scaffoldLayers) {
    console.log(`\nLayer ${L.layer}  ${L.label}  [${L.weekRange.from} → ${L.weekRange.to}]`);
    console.log(`  IBM signal at end : ${L.endIBMSignal}  (avg across layer: ${L.avgIBMSignal})  [${L.projection.safetyTier}]`);
    console.log(`  Network projection: short=${L.projection.shortTerm}  mid=${L.projection.midTerm}  long=${L.projection.longTerm}  coherence=${L.projection.coherenceScore}`);
    console.log('  Entity signals at end of layer:');
    for (const e of L.entitySnapshot) {
      const bar = '█'.repeat(Math.round(e.signal * 20)).padEnd(20);
      console.log(`    ${e.id.padEnd(22)} [${e.role.padEnd(11)}] ${e.signal.toFixed(4)}  ${bar}  ${e.tier}`);
    }
  }

  console.log('\n\n🔮 4-WEEK FORWARD FORECAST  (every entity evolves each week)');
  console.log('─'.repeat(72));
  for (const w of forecast) {
    const priceStr = `$${w.price.toFixed(2)}`;
    const rangeStr = `$${w.priceLow}–$${w.priceHigh}`;
    console.log(`\nWeek ${w.week}  ${w.date}  IBM: ${priceStr}  (${rangeStr})  signal=${w.ibmSignal}  [${w.tier}]`);
    console.log(`  Network coherence: ${w.coherenceScore}  short=${w.shortTerm}  mid=${w.midTerm}  long=${w.longTerm}`);
    console.log('  Entity evolution:');
    for (const e of w.entitySnapshots) {
      const arrow = e.delta > 0 ? '▲' : e.delta < 0 ? '▼' : '─';
      const dStr  = (e.delta >= 0 ? '+' : '') + e.delta.toFixed(4);
      console.log(`    ${e.id.padEnd(22)} [${e.role.padEnd(11)}] ${e.signal.toFixed(4)}  ${arrow} ${dStr.padEnd(8)}  ${e.tier}`);
    }
  }

  console.log('\n' + '─'.repeat(72));
  console.log('⚠️  φ-coherence model projection — NOT financial advice.');
  console.log('    Signals derive from entity-network balance, not earnings data.');
  console.log('═'.repeat(72) + '\n');
}

module.exports = {
  runIBMWeeklyForecast,
  printForecastReport,
  buildWeeklyNetworkStates,
  buildScaffold,
  projectForwardWeeks,
};
