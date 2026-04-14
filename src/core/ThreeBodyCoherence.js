/*
 * SOLIDARITY PLATFORM - THREE-BODY COHERENCE ENGINE
 * ===================================================
 *
 * Three forces in mutual orbit. Each one pulls on the other two.
 * The system is stable not because it's static, but because
 * the forces continuously adjust relative to each other.
 *
 * Body 1: SAFETY  — how cautious should we be right now
 *         (BridgingSafetyCoordinator)
 *
 * Body 2: HARMONY — how aligned are the numbers
 *         (CoreMathematicsEngine)
 *
 * Body 3: DEMAND  — what's the financial pressure right now
 *         (transaction volume, fee load, gas prices)
 *
 * The coherence score is the system's answer to:
 * "Given current safety, mathematical alignment, and financial pressure,
 *  what's the right operating point?"
 *
 * It's not an average. It's a gravitational equilibrium —
 * each body's position depends on where the other two are.
 *
 * Owner: Scott Charles Olson
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const CoreMathematicsEngine = require('../utils/CoreMathematicsEngine');
const { BridgingSafetyCoordinator } = require('../safety/BridgingSafetyCoordinator');

class ThreeBodyCoherence {
  constructor(config = {}) {
    this.version = '1.0.0';

    // The constant that governs orbital decay and attraction
    this.PHI = 1.618033988749895;
    this.PHI_INVERSE = 0.6180339887498949; // 1/PHI — the anchor ratio

    // The three bodies
    this.math = config.math || new CoreMathematicsEngine();
    this.safety = config.safety || new BridgingSafetyCoordinator();

    // Demand state (updated from external financial data)
    this.demand = {
      transactionVolume: 0,     // transactions in current window
      feeLoad: 0,               // total fees collected in window
      gasPrice: 0,              // current gas price in Gwei
      windowSize: config.windowSize || 3600000,  // 1 hour default
      history: [],              // rolling window of demand snapshots
      maxHistory: config.maxHistory || 168        // 7 days of hourly snapshots
    };

    // Coherence state
    this.coherence = {
      score: this.PHI_INVERSE,  // start at anchor ratio
      safetyContribution: this.PHI_INVERSE,
      harmonyContribution: this.PHI_INVERSE,
      demandContribution: this.PHI_INVERSE,
      trend: 'stable',          // rising, falling, stable
      lastUpdate: null
    };

    // Orbital parameters — how strongly each body pulls on the others
    this.weights = {
      safety: config.safetyWeight || 0.382,    // 1 - PHI_INVERSE
      harmony: config.harmonyWeight || 0.382,
      demand: config.demandWeight || 0.236     // 1 - 2*(1-PHI_INVERSE)
    };
    // Weights sum to 1.0 by design: 0.382 + 0.382 + 0.236 = 1.0

    // Thresholds for system-wide decisions
    this.thresholds = {
      critical: 0.15,    // system should halt non-essential operations
      cautious: 0.35,    // reduce limits, tighten validation
      balanced: 0.50,    // normal operation
      optimal: 0.618,    // anchor — best operating point
      elevated: 0.80,    // high confidence, can loosen limits
      ceiling: 0.95      // cap — prevent overconfidence
    };

    // Event callbacks
    this.listeners = new Map();

    console.log('Three-Body Coherence Engine v1.0.0 initialized');
    console.log(`  Weights: safety=${this.weights.safety} harmony=${this.weights.harmony} demand=${this.weights.demand}`);
    console.log(`  Anchor ratio: ${this.PHI_INVERSE}`);
  }

  // ============================================================
  // CORE: Calculate coherence from three bodies
  // ============================================================

  /**
   * Recalculate the coherence score from current state of all three bodies.
   * This is the gravitational equilibrium calculation.
   *
   * Each body contributes a 0-1 value. The coherence score is NOT
   * a simple weighted average — each body's contribution is adjusted
   * by how far the other two are from the anchor ratio.
   *
   * When all three are at 0.618, coherence = 0.618 (perfect anchor).
   * When one drifts, the others compensate.
   */
  calculate() {
    const safetyScore = this.getSafetyScore();
    const harmonyScore = this.getHarmonyScore();
    const demandScore = this.getDemandScore();

    // Phase 1: Raw weighted contribution
    const rawWeighted =
      safetyScore * this.weights.safety +
      harmonyScore * this.weights.harmony +
      demandScore * this.weights.demand;

    // Phase 2: Orbital correction — how far is each body from the anchor?
    const safetyDrift = Math.abs(safetyScore - this.PHI_INVERSE);
    const harmonyDrift = Math.abs(harmonyScore - this.PHI_INVERSE);
    const demandDrift = Math.abs(demandScore - this.PHI_INVERSE);

    // Total drift — 0 means perfect coherence, higher means more stress
    const totalDrift = (safetyDrift + harmonyDrift + demandDrift) / 3;

    // Phase 3: Coherence score — weighted value damped by drift
    // When drift is 0, coherence = rawWeighted (no correction needed)
    // When drift is high, coherence pulls toward anchor ratio
    const driftDamping = 1 / (1 + totalDrift / this.PHI_INVERSE);
    const anchorPull = this.PHI_INVERSE * (1 - driftDamping);
    const score = (rawWeighted * driftDamping) + anchorPull;

    // Clamp to [0, ceiling]
    const clamped = Math.max(0, Math.min(this.thresholds.ceiling, score));

    // Determine trend
    const previousScore = this.coherence.score;
    const delta = clamped - previousScore;
    let trend = 'stable';
    if (Math.abs(delta) > 0.01) {
      trend = delta > 0 ? 'rising' : 'falling';
    }

    // Update state
    this.coherence = {
      score: clamped,
      safetyContribution: safetyScore,
      harmonyContribution: harmonyScore,
      demandContribution: demandScore,
      rawWeighted,
      totalDrift,
      driftDamping,
      trend,
      delta,
      lastUpdate: Date.now()
    };

    // Fire events if thresholds crossed
    this.checkThresholdCrossings(previousScore, clamped);

    return this.coherence;
  }

  // ============================================================
  // BODY 1: SAFETY — reads from BridgingSafetyCoordinator
  // ============================================================

  /**
   * Get the current safety score (0-1).
   * Reads the system-level safety from BridgingSafetyCoordinator.
   * Guards against null/NaN/Infinity from edge cases in the coordinator.
   */
  getSafetyScore() {
    const raw = this.safety.componentLevels.system;
    if (raw === null || raw === undefined || !isFinite(raw)) {
      // Coordinator is in a transitional state — recalculate from components
      const components = Object.entries(this.safety.componentLevels)
        .filter(([k, v]) => k !== 'system' && isFinite(v))
        .map(([, v]) => v);
      if (components.length === 0) return this.PHI_INVERSE;
      return Math.min(...components);
    }
    return raw;
  }

  /**
   * Update a safety component (passes through to coordinator).
   * This triggers a coherence recalculation.
   */
  updateSafety(component, level) {
    this.safety.setComponentSafety(component, level);
    return this.calculate();
  }

  /**
   * Set safety flow mode (conservative/balanced/performance).
   */
  setSafetyMode(mode) {
    this.safety.setFlowMode(mode);
    return this.calculate();
  }

  // ============================================================
  // BODY 2: HARMONY — reads from CoreMathematicsEngine
  // ============================================================

  /**
   * Get the current harmony score (0-1).
   * Processes recent financial values through the math engine
   * and returns how "aligned" they are to the sacred node system.
   */
  getHarmonyScore() {
    if (this.demand.history.length === 0) {
      return this.PHI_INVERSE; // no data = anchor default
    }

    // Use the most recent demand snapshot's volume as the input value
    const recent = this.demand.history[this.demand.history.length - 1];
    const value = recent.transactionVolume || 1;

    // Process through math engine's harmony scorer
    const harmony = this.math.calculateHarmonyScore(value);

    // The harmony score tells us how well the current volume
    // aligns with sacred nodes (0-1 scale)
    return (typeof harmony === 'number' && isFinite(harmony)) ? harmony : this.PHI_INVERSE;
  }

  /**
   * Calculate harmony for an arbitrary value (useful for previewing
   * how a transaction would affect system harmony).
   */
  previewHarmony(value) {
    const processed = this.math.processValue(value);
    const harmonyScore = this.math.calculateHarmonyScore(value);
    return {
      input: value,
      harmonyScore: harmonyScore,
      nearestNode: processed.alignment.nearestNode,
      normalized: processed.normalized
    };
  }

  // ============================================================
  // BODY 3: DEMAND — fed from financial activity
  // ============================================================

  /**
   * Get the current demand score (0-1).
   *
   * Demand is normalized against historical averages.
   * - Low demand relative to average = score near 0.618 (calm)
   * - Demand at average = score at 0.5
   * - High demand = score drops toward 0 (pressure)
   *
   * This is inverted because high demand = more stress = lower score.
   */
  getDemandScore() {
    if (this.demand.history.length < 2) {
      return this.PHI_INVERSE; // not enough data = anchor default
    }

    const current = this.demand.transactionVolume;
    const avgVolume = this.demand.history.reduce((sum, h) => sum + h.transactionVolume, 0)
      / this.demand.history.length;

    if (avgVolume === 0) return this.PHI_INVERSE;

    // Ratio of current to average
    const ratio = current / avgVolume;

    // Inverse sigmoid — maps ratio to 0-1 where:
    //   ratio=0 → score≈1 (no demand, very safe)
    //   ratio=1 → score≈0.5 (average demand)
    //   ratio=2+ → score→0 (high demand, pressure)
    const score = 1 / (1 + Math.pow(ratio, this.PHI));

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Record a financial event (transaction, fee payment, etc.).
   * This updates demand state and recalculates coherence.
   */
  recordTransaction(amount, fee = 0, gasUsed = 0) {
    this.demand.transactionVolume++;
    this.demand.feeLoad += fee;
    if (gasUsed > 0) this.demand.gasPrice = gasUsed;

    return this.calculate();
  }

  /**
   * Take a demand snapshot and push to history.
   * Call this on a regular interval (e.g., every hour).
   */
  snapshotDemand() {
    const snapshot = {
      transactionVolume: this.demand.transactionVolume,
      feeLoad: this.demand.feeLoad,
      gasPrice: this.demand.gasPrice,
      timestamp: Date.now()
    };

    this.demand.history.push(snapshot);

    // Trim to max history
    while (this.demand.history.length > this.demand.maxHistory) {
      this.demand.history.shift();
    }

    // Reset current window
    this.demand.transactionVolume = 0;
    this.demand.feeLoad = 0;

    return snapshot;
  }

  /**
   * Seed demand history with an array of past snapshots.
   * Useful when bootstrapping from stored data.
   */
  seedHistory(snapshots) {
    this.demand.history = snapshots.slice(-this.demand.maxHistory);
    console.log(`Seeded demand history with ${this.demand.history.length} snapshots`);
  }

  // ============================================================
  // SYSTEM-WIDE: Coherence-driven decisions
  // ============================================================

  /**
   * Get the current coherence score (0-1).
   */
  getScore() {
    return this.coherence.score;
  }

  /**
   * Get the current operating level based on coherence score.
   */
  getLevel() {
    const s = this.coherence.score;
    if (s <= this.thresholds.critical) return 'critical';
    if (s <= this.thresholds.cautious) return 'cautious';
    if (s <= this.thresholds.balanced) return 'balanced';
    if (s <= this.thresholds.optimal) return 'optimal';
    if (s <= this.thresholds.elevated) return 'elevated';
    return 'ceiling';
  }

  /**
   * Get a transaction limit multiplier based on coherence.
   * Used by PaymentConnector and FinancialConfig to scale limits.
   *
   * Returns a multiplier between 0.1 (critical) and 1.2 (elevated).
   */
  getLimitMultiplier() {
    const level = this.getLevel();
    const multipliers = {
      critical: 0.1,
      cautious: 0.4,
      balanced: 0.7,
      optimal: 1.0,
      elevated: 1.2,
      ceiling: 1.0  // don't go above optimal at ceiling
    };
    return multipliers[level] || 1.0;
  }

  /**
   * Should the system allow a transaction of this size?
   * Coherence-aware gating.
   */
  shouldAllow(amountUSD, baseLimitUSD) {
    const multiplier = this.getLimitMultiplier();
    const effectiveLimit = baseLimitUSD * multiplier;
    const allowed = amountUSD <= effectiveLimit;

    return {
      allowed,
      amountUSD,
      effectiveLimit,
      baseLimit: baseLimitUSD,
      multiplier,
      coherenceScore: this.coherence.score,
      level: this.getLevel()
    };
  }

  // ============================================================
  // EVENTS: Threshold crossing notifications
  // ============================================================

  /**
   * Register a callback for threshold crossings.
   * @param {string} event — 'critical', 'cautious', 'balanced', 'optimal', 'elevated'
   * @param {function} callback — (direction, score, previousScore) => void
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  checkThresholdCrossings(previousScore, newScore) {
    for (const [name, threshold] of Object.entries(this.thresholds)) {
      const wasBelowOrAt = previousScore <= threshold;
      const isAbove = newScore > threshold;
      const wasAbove = previousScore > threshold;
      const isBelowOrAt = newScore <= threshold;

      if (wasBelowOrAt && isAbove) {
        this.emit(name, 'rising', newScore, previousScore);
      } else if (wasAbove && isBelowOrAt) {
        this.emit(name, 'falling', newScore, previousScore);
      }
    }
  }

  emit(event, direction, score, previousScore) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => {
      try { cb(direction, score, previousScore); }
      catch (err) { console.error('Coherence event error:', err.message); }
    });
  }

  // ============================================================
  // EMERGENCY: Force-stabilize when things go wrong
  // ============================================================

  /**
   * Emergency stabilization — resets all three bodies to anchor ratio.
   */
  emergencyStabilize(reason = 'Manual trigger') {
    console.log('COHERENCE EMERGENCY:', reason);

    // Reset safety
    this.safety.emergencyStabilization(reason);

    // Reset demand (clear the spike)
    this.demand.transactionVolume = 0;
    this.demand.feeLoad = 0;

    // Recalculate — should land near anchor
    const result = this.calculate();
    console.log('  Stabilized to:', result.score.toFixed(4));

    this.emit('critical', 'emergency', result.score, this.coherence.score);
    return result;
  }

  // ============================================================
  // STATUS: Full system report
  // ============================================================

  /**
   * Get full coherence state.
   */
  getState() {
    return {
      score: this.coherence.score,
      level: this.getLevel(),
      limitMultiplier: this.getLimitMultiplier(),
      trend: this.coherence.trend,
      bodies: {
        safety: {
          score: this.coherence.safetyContribution,
          weight: this.weights.safety,
          mode: this.safety.currentFlowMode,
          components: { ...this.safety.componentLevels }
        },
        harmony: {
          score: this.coherence.harmonyContribution,
          weight: this.weights.harmony,
          anchorRatio: this.PHI_INVERSE
        },
        demand: {
          score: this.coherence.demandContribution,
          weight: this.weights.demand,
          currentVolume: this.demand.transactionVolume,
          historyLength: this.demand.history.length,
          gasPrice: this.demand.gasPrice
        }
      },
      drift: {
        total: this.coherence.totalDrift,
        damping: this.coherence.driftDamping
      },
      lastUpdate: this.coherence.lastUpdate
    };
  }

  /**
   * Print status report to console.
   */
  printReport() {
    const state = this.getState();
    console.log('\n' + '='.repeat(60));
    console.log('THREE-BODY COHERENCE ENGINE v1.0.0');
    console.log('='.repeat(60));
    console.log(`  Score:      ${state.score.toFixed(4)} (${state.level})`);
    console.log(`  Trend:      ${state.trend}`);
    console.log(`  Multiplier: ${state.limitMultiplier}x`);
    console.log();
    console.log('  BODY 1 — SAFETY:  ' + state.bodies.safety.score.toFixed(4) +
      ' (weight: ' + state.bodies.safety.weight + ', mode: ' + state.bodies.safety.mode + ')');
    console.log('  BODY 2 — HARMONY: ' + state.bodies.harmony.score.toFixed(4) +
      ' (weight: ' + state.bodies.harmony.weight + ')');
    console.log('  BODY 3 — DEMAND:  ' + state.bodies.demand.score.toFixed(4) +
      ' (weight: ' + state.bodies.demand.weight +
      ', vol: ' + state.bodies.demand.currentVolume +
      ', history: ' + state.bodies.demand.historyLength + ')');
    console.log();
    console.log('  Drift: ' + (state.drift.total || 0).toFixed(4) +
      ' | Damping: ' + (state.drift.damping || 0).toFixed(4));
    console.log('='.repeat(60));
    return state;
  }
}

module.exports = { ThreeBodyCoherence };

// ============================================================
// Demo — shows the three bodies interacting
// ============================================================
if (require.main === module) {
  console.log('THREE-BODY COHERENCE — Live Demo');
  console.log('='.repeat(60));

  const tbc = new ThreeBodyCoherence();

  // Register event listeners
  tbc.on('cautious', (dir, score) => {
    console.log(`  [EVENT] Cautious threshold ${dir}: ${score.toFixed(4)}`);
  });
  tbc.on('critical', (dir, score) => {
    console.log(`  [EVENT] CRITICAL threshold ${dir}: ${score.toFixed(4)}`);
  });

  // Phase 1: Initial state — everything at anchor
  console.log('\n--- Phase 1: Initial state (all at anchor) ---');
  tbc.calculate();
  tbc.printReport();

  // Phase 2: Simulate some transactions
  console.log('\n--- Phase 2: 10 transactions come in ---');
  // Seed some history first so demand scoring has context
  tbc.seedHistory([
    { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 7200000 },
    { transactionVolume: 8, feeLoad: 0.8, gasPrice: 12, timestamp: Date.now() - 3600000 },
  ]);

  for (let i = 0; i < 10; i++) {
    tbc.recordTransaction(100, 2.5, 15);
  }
  tbc.printReport();

  // Phase 3: Safety drops (something went wrong)
  console.log('\n--- Phase 3: Safety component drops to 0.3 ---');
  tbc.updateSafety('solidarity', 0.3);
  tbc.printReport();

  // Phase 4: Demand spike
  console.log('\n--- Phase 4: 50 more transactions (demand spike) ---');
  for (let i = 0; i < 50; i++) {
    tbc.recordTransaction(200, 5, 25);
  }
  tbc.printReport();

  // Phase 5: Emergency stabilize
  console.log('\n--- Phase 5: Emergency stabilization ---');
  tbc.emergencyStabilize('Demo: demand spike + safety drop');
  tbc.printReport();

  // Phase 6: Recovery
  console.log('\n--- Phase 6: Safety recovers to 0.618 ---');
  tbc.updateSafety('solidarity', 0.618);
  tbc.snapshotDemand(); // close the window
  tbc.calculate();
  tbc.printReport();

  // Transaction gating demo
  console.log('\n--- Transaction gating ---');
  const check1 = tbc.shouldAllow(500, 1000);
  console.log('$500 against $1000 limit:', check1.allowed ? 'ALLOWED' : 'BLOCKED',
    '(effective limit: $' + check1.effectiveLimit + ')');

  const check2 = tbc.shouldAllow(1100, 1000);
  console.log('$1100 against $1000 limit:', check2.allowed ? 'ALLOWED' : 'BLOCKED',
    '(effective limit: $' + check2.effectiveLimit + ')');
}
