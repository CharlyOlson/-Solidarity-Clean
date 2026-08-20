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
 * 1. HISTORICAL LAYER SCAN (past 52 weeks)
 *    Each week's price change (week-over-week %) is converted to a
 *    momentum signal in [0,1].  Positive weeks push the IBM core
 *    signal up; negative weeks push it down.  This creates a
 *    time-ordered stack of "market state" snapshots.
 *
 * 2. TRIANGLE SCAFFOLD
 *    The 52 weekly snapshots are grouped into Henry-progression layers:
 *      Layer 1  : weeks  1– 7  (seed cycle)
 *      Layer 2  : weeks  8–14  (mid cycle)
 *      Layer 3  : weeks 15–21  (upper-mid)
 *      Remaining: weeks 22–52  (long arc)
 *    Each layer's average IBM signal is fed as an override into the
 *    projection engine, which runs the full φ-weighted triangle network
 *    for that layer's context.  Each layer produces its own
 *    { shortTerm, midTerm, longTerm } vector — the scaffold "stacks"
 *    these vertically, each layer inheriting from the one below via φ.
 *
 * 3. FORWARD PROJECTION (4 weekly intervals)
 *    Starting from the top of the scaffold (most recent layer), the
 *    engine steps forward 4 weeks.  For each forward week:
 *      a) Arithmetic mean of recent momentum is φ-scaled by 1/step
 *      b) The scaffold's longTerm signal provides structural gravity
 *      c) The projected IBM signal maps back to a price via 52-week range
 *      d) A confidence band is computed from Pythagorean balance score
 *
 * OUTPUT
 * ──────
 * {
 *   currentPrice,
 *   scaffoldLayers: [ { layer, weeks, avgSignal, projection } … ],
 *   forecast: [
 *     { week: 1, date, signalLow, signal, signalHigh,
 *       priceLow, price, priceHigh, tier, momentum }
 *   ],
 *   live, dataTimestamp
 * }
 */

'use strict';

const { fetchIBMMarketData, computeWeeklyChanges, priceToSignal } = require('./ibm_market_data');
const { project }  = require('./projection_engine');
const { seed: seedIBM } = require('./ibm_entities');

const PHI          = 1.618;
const SAFETY_LEVEL = 0.618;

// Henry layer boundaries (week indices, 1-based)
const LAYER_BOUNDARIES = [
  { layer: 1, label: 'Seed (weeks 1–7)',      from: 1,  to: 7  },
  { layer: 2, label: 'Mid (weeks 8–14)',       from: 8,  to: 14 },
  { layer: 3, label: 'Upper-mid (weeks 15–21)',from: 15, to: 21 },
  { layer: 4, label: 'Long arc (weeks 22–52)', from: 22, to: 52 },
];

/**
 * Map a week-over-week % change to a momentum signal in [0,1].
 * ±10 % change maps to [0,1]; 0 % = 0.5 (neutral).
 * @param {number} changePct
 * @returns {number}
 */
function changePctToMomentum(changePct) {
  const clamped = Math.max(-10, Math.min(10, changePct));
  return (clamped + 10) / 20;
}

/**
 * Blend two signals using φ-weighting.
 * weight1 = PHI, weight2 = 1  →  tilts toward signal1.
 * @param {number} s1
 * @param {number} s2
 * @returns {number}
 */
function phiBlend(s1, s2) {
  return Math.max(0, Math.min(1, (s1 * PHI + s2) / (PHI + 1)));
}

/**
 * Resolve the safety tier for a signal in [0,1].
 * @param {number} s
 * @returns {string}
 */
function resolveTier(s) {
  if (s < 0.05) return 'EMERGENCY';
  if (s < 0.15) return 'WARNING';
  if (s < 0.25) return 'CAUTION';
  if (s < 0.75) return 'OPTIMAL';
  if (s < 0.85) return 'UPPER_CAUTION';
  if (s < 0.95) return 'UPPER_WARNING';
  return 'CRITICAL_UPPER';
}

/**
 * Convert a signal back to a price estimate using 52-week range.
 * @param {number} signal   [0,1]
 * @param {number} high52
 * @param {number} low52
 * @returns {number}
 */
function signalToPrice(signal, high52, low52) {
  return parseFloat((low52 + signal * (high52 - low52)).toFixed(2));
}

/**
 * Build the historical scaffold from weekly price data and return
 * a per-layer projection record.
 *
 * @param {Array<{ date, close, changePct, signal }>} enrichedWeeks
 * @param {number} high52
 * @param {number} low52
 * @returns {Array<object>} scaffoldLayers
 */
function buildScaffold(enrichedWeeks, high52, low52) {
  seedIBM();

  return LAYER_BOUNDARIES.map(({ layer, label, from, to }) => {
    const slice = enrichedWeeks.slice(from - 1, to);
    if (slice.length === 0) return null;

    // Average IBM price signal for this layer
    const avgPriceSignal = slice.reduce((s, w) => s + w.signal, 0) / slice.length;

    // Average momentum (price-change direction)
    const avgMomentum = slice.reduce((s, w) => s + changePctToMomentum(w.changePct), 0) / slice.length;

    // Blend price position and momentum via φ — this is the layer's IBM core override
    const layerSignal = phiBlend(avgPriceSignal, avgMomentum);

    // Run the triangle projection with this layer's IBM signal
    const overrides = new Map([['ibm', layerSignal]]);
    const proj = project('ibm', { overrides, safetyLevel: SAFETY_LEVEL, maxDepth: 7 });

    return {
      layer,
      label,
      weeks: slice.length,
      weekRange: { from: slice[0].date, to: slice[slice.length - 1].date },
      avgPriceSignal: parseFloat(avgPriceSignal.toFixed(4)),
      avgMomentum:    parseFloat(avgMomentum.toFixed(4)),
      layerSignal:    parseFloat(layerSignal.toFixed(4)),
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
 * Project 4 weekly intervals forward from the scaffold top.
 *
 * @param {object[]} scaffoldLayers  — from buildScaffold()
 * @param {number}   currentPrice
 * @param {number}   high52
 * @param {number}   low52
 * @param {string}   anchorDate      — ISO date of most recent week
 * @returns {Array<object>}
 */
function projectFourWeeks(scaffoldLayers, currentPrice, high52, low52, anchorDate) {
  // Use the top layer (most recent) as starting state
  const top      = scaffoldLayers[scaffoldLayers.length - 1];
  const layer3   = scaffoldLayers[2] || top;  // upper-mid for structural gravity

  // Starting signal = current price position
  let signal = priceToSignal(currentPrice, high52, low52);

  // Momentum seed = top layer's midTerm (growth lens)
  let momentum = top.projection.midTerm;

  // Structural gravity = layer3 longTerm (harmonic / stability lens)
  const gravity = layer3.projection.longTerm;

  // Pythagorean balance from top layer coherence (confidence band width)
  const balance = top.projection.coherenceScore;

  const weeks = [];
  let date = new Date(anchorDate);

  for (let step = 1; step <= 4; step++) {
    // Advance date by 7 days
    date = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isoDate = date.toISOString().slice(0, 10);

    // φ-scaled momentum decay per step
    const gain    = Math.pow(PHI, 1 / (step * 3.5));
    const scaled  = Math.max(0, Math.min(1, momentum * gain / PHI));

    // Blend: current signal + momentum pull + structural gravity
    const wMomentum = PHI;
    const wGravity  = 1.0;
    const wCurrent  = PHI * PHI;
    const blended   = Math.max(0, Math.min(1,
      (signal * wCurrent + scaled * wMomentum + gravity * wGravity) /
      (wCurrent + wMomentum + wGravity)
    ));

    // Confidence band: ±(1 - balance) × φ-fraction of range
    const bandWidth = (1 - balance) * 0.618 * (high52 - low52);

    const price     = signalToPrice(blended, high52, low52);
    const priceLow  = parseFloat(Math.max(low52,  price - bandWidth).toFixed(2));
    const priceHigh = parseFloat(Math.min(high52, price + bandWidth).toFixed(2));

    const signalLow  = parseFloat(Math.max(0, blended - (1 - balance) * 0.1).toFixed(4));
    const signalHigh = parseFloat(Math.min(1, blended + (1 - balance) * 0.1).toFixed(4));

    weeks.push({
      week:       step,
      date:       isoDate,
      signal:     parseFloat(blended.toFixed(4)),
      signalLow,
      signalHigh,
      price,
      priceLow,
      priceHigh,
      tier:       resolveTier(blended),
      momentum:   parseFloat(scaled.toFixed(4)),
    });

    // Roll state forward
    signal   = blended;
    momentum = scaled;
  }

  return weeks;
}

/**
 * Main entry point.  Loads market data, builds scaffold, projects 4 weeks.
 *
 * @returns {Promise<object>}
 */
async function runIBMWeeklyForecast() {
  const marketData = await fetchIBMMarketData();
  const { currentPrice, high52, low52, weeklyCloses, live, timestamp } = marketData;

  const enriched      = computeWeeklyChanges(weeklyCloses);
  const scaffoldLayers = buildScaffold(enriched, high52, low52);
  const anchorDate    = weeklyCloses[weeklyCloses.length - 1].date;
  const forecast      = projectFourWeeks(scaffoldLayers, currentPrice, high52, low52, anchorDate);

  return {
    currentPrice,
    high52,
    low52,
    anchorDate,
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

  console.log('\n' + '═'.repeat(70));
  console.log('IBM 4-WEEK WEEKLY FORECAST  —  φ-TRIANGLE SCAFFOLD MODEL');
  console.log('═'.repeat(70));
  console.log(`Data source   : ${src}`);
  console.log(`Timestamp     : ${dataTimestamp}`);
  console.log(`Anchor date   : ${anchorDate}  (last known close)`);
  console.log(`Current price : $${currentPrice.toFixed(2)}`);
  console.log(`52-week range : $${low52.toFixed(2)}  –  $${high52.toFixed(2)}`);
  console.log('─'.repeat(70));

  console.log('\n📐 HISTORICAL SCAFFOLD  (past year layered by Henry progression)');
  console.log('─'.repeat(70));
  for (const L of scaffoldLayers) {
    console.log(`Layer ${L.layer}  ${L.label}`);
    console.log(`  Range       : ${L.weekRange.from} → ${L.weekRange.to}  (${L.weeks} weeks)`);
    console.log(`  Avg signal  : ${L.avgPriceSignal}  |  Avg momentum: ${L.avgMomentum}`);
    console.log(`  Layer sig   : ${L.layerSignal}  [${L.projection.safetyTier}]`);
    console.log(`  Projection  : short=${L.projection.shortTerm}  mid=${L.projection.midTerm}  long=${L.projection.longTerm}`);
  }

  console.log('\n🔮 4-WEEK FORWARD FORECAST');
  console.log('─'.repeat(70));
  console.log('Week  Date        Price      Low–High Range         Signal  Tier');
  console.log('─'.repeat(70));
  for (const w of forecast) {
    const priceStr  = `$${w.price.toFixed(2)}`.padEnd(10);
    const rangeStr  = `$${w.priceLow}–$${w.priceHigh}`.padEnd(22);
    const signalStr = w.signal.toFixed(4);
    const tierStr   = w.tier;
    console.log(`  ${w.week}   ${w.date}  ${priceStr} ${rangeStr} ${signalStr}  ${tierStr}`);
  }
  console.log('─'.repeat(70));
  console.log('⚠️  This is a φ-coherence model projection, NOT financial advice.');
  console.log('    Signals are derived from entity-network balance, not earnings.');
  console.log('═'.repeat(70) + '\n');
}

module.exports = {
  runIBMWeeklyForecast,
  printForecastReport,
  buildScaffold,
  projectFourWeeks,
};
