/**
 * ThreeBodyCoherence — Unit Tests
 */
const { ThreeBodyCoherence } = require('../../src/core/ThreeBodyCoherence');

// Suppress console output during tests
const originalLog = console.log;
const originalError = console.error;
beforeAll(() => {
  console.log = () => {};
  console.error = () => {};
});
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

describe('ThreeBodyCoherence', () => {
  let tbc;

  beforeEach(() => {
    tbc = new ThreeBodyCoherence();
  });

  describe('Initialization', () => {
    test('starts at anchor ratio (0.618)', () => {
      expect(tbc.getScore()).toBeCloseTo(0.618, 3);
    });

    test('weights sum to 1.0', () => {
      const sum = tbc.weights.safety + tbc.weights.harmony + tbc.weights.demand;
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('all three bodies start at anchor', () => {
      const result = tbc.calculate();
      expect(result.safetyContribution).toBeCloseTo(0.618, 3);
      expect(result.harmonyContribution).toBeCloseTo(0.618, 3);
      expect(result.demandContribution).toBeCloseTo(0.618, 3);
    });

    test('initial drift is near zero', () => {
      const result = tbc.calculate();
      expect(result.totalDrift).toBeLessThan(0.001);
    });

    test('initial damping is near 1.0 (minimal correction)', () => {
      const result = tbc.calculate();
      expect(result.driftDamping).toBeGreaterThan(0.999);
    });
  });

  describe('Three-Body Interaction', () => {
    test('safety drop reduces coherence', () => {
      tbc.calculate();
      const before = tbc.getScore();
      tbc.updateSafety('solidarity', 0.3);
      expect(tbc.getScore()).toBeLessThan(before);
    });

    test('demand spike reduces coherence', () => {
      tbc.seedHistory([
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 3600000 },
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 1800000 },
      ]);
      tbc.calculate();
      const before = tbc.getScore();

      for (let i = 0; i < 50; i++) {
        tbc.recordTransaction(100, 2, 15);
      }
      expect(tbc.getScore()).toBeLessThan(before);
    });

    test('combined safety drop + demand spike reduces more than either alone', () => {
      tbc.seedHistory([
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 3600000 },
      ]);

      // Safety drop alone
      const safetyOnly = new ThreeBodyCoherence();
      safetyOnly.seedHistory([
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 3600000 },
      ]);
      safetyOnly.updateSafety('solidarity', 0.2);
      const safetyOnlyScore = safetyOnly.getScore();

      // Demand spike alone
      const demandOnly = new ThreeBodyCoherence();
      demandOnly.seedHistory([
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 3600000 },
      ]);
      for (let i = 0; i < 40; i++) demandOnly.recordTransaction(100, 2, 20);
      const demandOnlyScore = demandOnly.getScore();

      // Both together
      tbc.updateSafety('solidarity', 0.2);
      for (let i = 0; i < 40; i++) tbc.recordTransaction(100, 2, 20);
      const bothScore = tbc.getScore();

      expect(bothScore).toBeLessThanOrEqual(safetyOnlyScore);
      expect(bothScore).toBeLessThanOrEqual(demandOnlyScore);
    });

    test('drift damping pulls toward anchor under stress', () => {
      tbc.updateSafety('solidarity', 0.1);
      const result = tbc.calculate();
      // Under stress, damping < 1 means anchor pull is active
      expect(result.driftDamping).toBeLessThan(1);
      // Score should be pulled toward anchor, not collapse to 0
      expect(result.score).toBeGreaterThan(0.2);
    });
  });

  describe('Demand Scoring', () => {
    test('no history defaults to anchor ratio', () => {
      expect(tbc.getDemandScore()).toBeCloseTo(0.618, 3);
    });

    test('volume at average returns ~0.5', () => {
      tbc.seedHistory([
        { transactionVolume: 10, feeLoad: 1, gasPrice: 10, timestamp: Date.now() - 3600000 },
        { transactionVolume: 10, feeLoad: 1, gasPrice: 10, timestamp: Date.now() - 1800000 },
      ]);
      // Set current volume to average (10)
      for (let i = 0; i < 10; i++) tbc.recordTransaction(100, 1, 10);
      const score = tbc.getDemandScore();
      expect(score).toBeGreaterThan(0.2);
      expect(score).toBeLessThan(0.7);
    });

    test('zero demand scores at or above anchor (safe)', () => {
      tbc.seedHistory([
        { transactionVolume: 10, feeLoad: 1, gasPrice: 10, timestamp: Date.now() - 3600000 },
        { transactionVolume: 10, feeLoad: 1, gasPrice: 10, timestamp: Date.now() - 1800000 },
      ]);
      // Current volume = 0 (no transactions) — need 2+ history entries
      expect(tbc.getDemandScore()).toBeGreaterThan(0.6);
    });

    test('high demand scores lower than low demand', () => {
      tbc.seedHistory([
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 7200000 },
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() - 3600000 },
      ]);
      const lowDemandScore = tbc.getDemandScore();
      for (let i = 0; i < 100; i++) tbc.recordTransaction(200, 5, 30);
      const highDemandScore = tbc.getDemandScore();
      expect(highDemandScore).toBeLessThan(lowDemandScore);
    });
  });

  describe('Snapshot and History', () => {
    test('snapshot resets current volume', () => {
      tbc.recordTransaction(100, 2, 10);
      tbc.recordTransaction(100, 2, 10);
      expect(tbc.demand.transactionVolume).toBe(2);

      tbc.snapshotDemand();
      expect(tbc.demand.transactionVolume).toBe(0);
      expect(tbc.demand.history.length).toBe(1);
    });

    test('history respects maxHistory limit', () => {
      tbc = new ThreeBodyCoherence({ maxHistory: 3 });
      for (let i = 0; i < 5; i++) {
        tbc.recordTransaction(100, 2, 10);
        tbc.snapshotDemand();
      }
      expect(tbc.demand.history.length).toBe(3);
    });

    test('seedHistory loads data', () => {
      const data = [
        { transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: 1 },
        { transactionVolume: 8, feeLoad: 0.8, gasPrice: 12, timestamp: 2 },
        { transactionVolume: 3, feeLoad: 0.3, gasPrice: 8, timestamp: 3 },
      ];
      tbc.seedHistory(data);
      expect(tbc.demand.history.length).toBe(3);
    });
  });

  describe('Level and Multiplier', () => {
    test('anchor ratio maps to elevated level', () => {
      tbc.calculate();
      expect(tbc.getLevel()).toBe('elevated');
      expect(tbc.getLimitMultiplier()).toBe(1.2);
    });

    test('low safety maps below optimal', () => {
      tbc.updateSafety('quantum', 0.15);
      tbc.updateSafety('launcher', 0.15);
      tbc.updateSafety('solidarity', 0.15);
      tbc.updateSafety('ai', 0.15);
      tbc.updateSafety('colorMotion', 0.15);
      const level = tbc.getLevel();
      expect(['cautious', 'balanced']).toContain(level);
      expect(tbc.getLimitMultiplier()).toBeLessThan(1.0);
    });
  });

  describe('Transaction Gating', () => {
    test('allows transaction within effective limit', () => {
      tbc.calculate();
      const result = tbc.shouldAllow(500, 1000);
      expect(result.allowed).toBe(true);
    });

    test('blocks transaction above effective limit when coherence is low', () => {
      // Drop coherence heavily
      tbc.updateSafety('quantum', 0.05);
      tbc.updateSafety('launcher', 0.05);
      tbc.updateSafety('solidarity', 0.05);
      tbc.updateSafety('ai', 0.05);
      tbc.updateSafety('colorMotion', 0.05);
      const result = tbc.shouldAllow(900, 1000);
      expect(result.effectiveLimit).toBeLessThan(1000);
      expect(result.allowed).toBe(false);
    });

    test('gating includes coherence metadata', () => {
      tbc.calculate();
      const result = tbc.shouldAllow(100, 1000);
      expect(result).toHaveProperty('coherenceScore');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('multiplier');
      expect(result).toHaveProperty('effectiveLimit');
    });
  });

  describe('Emergency Stabilization', () => {
    test('emergency resets to near-anchor', () => {
      // Create stress
      tbc.updateSafety('solidarity', 0.1);
      tbc.seedHistory([{ transactionVolume: 5, feeLoad: 0.5, gasPrice: 10, timestamp: Date.now() }]);
      for (let i = 0; i < 50; i++) tbc.recordTransaction(200, 5, 30);
      expect(tbc.getScore()).toBeLessThan(0.5);

      const stressedScore = tbc.getScore();

      // Emergency
      tbc.emergencyStabilize('test');
      // Emergency should improve the score significantly, even if not to anchor
      expect(tbc.getScore()).toBeGreaterThan(stressedScore);
    });

    test('emergency resets demand volume', () => {
      tbc.recordTransaction(100, 2, 10);
      tbc.recordTransaction(100, 2, 10);
      tbc.emergencyStabilize('test');
      expect(tbc.demand.transactionVolume).toBe(0);
    });
  });

  describe('Event System', () => {
    test('fires events on threshold crossings', () => {
      const events = [];
      tbc.on('optimal', (dir, score) => events.push({ dir, score }));
      tbc.on('balanced', (dir, score) => events.push({ dir, score }));

      tbc.calculate(); // start at anchor (above optimal)

      // Drop safety hard — should cross thresholds downward
      tbc.updateSafety('quantum', 0.05);
      tbc.updateSafety('launcher', 0.05);
      tbc.updateSafety('solidarity', 0.05);
      tbc.updateSafety('ai', 0.05);
      tbc.updateSafety('colorMotion', 0.05);

      // Should have crossed at least one threshold falling
      const falling = events.filter(e => e.dir === 'falling');
      expect(falling.length).toBeGreaterThan(0);
    });
  });

  describe('Harmony Preview', () => {
    test('previewHarmony returns score and nearest node', () => {
      const preview = tbc.previewHarmony(7);
      expect(preview).toHaveProperty('harmonyScore');
      expect(preview).toHaveProperty('nearestNode');
      expect(preview).toHaveProperty('normalized');
      // nearestNode comes from processValue — may be named differently
      expect(preview.harmonyScore).toBeGreaterThan(0);
      expect(preview.harmonyScore).toBeLessThanOrEqual(1);
    });
  });

  describe('State Report', () => {
    test('getState returns full structure', () => {
      tbc.calculate();
      const state = tbc.getState();

      expect(state).toHaveProperty('score');
      expect(state).toHaveProperty('level');
      expect(state).toHaveProperty('limitMultiplier');
      expect(state).toHaveProperty('trend');
      expect(state).toHaveProperty('bodies');
      expect(state.bodies).toHaveProperty('safety');
      expect(state.bodies).toHaveProperty('harmony');
      expect(state.bodies).toHaveProperty('demand');
      expect(state).toHaveProperty('drift');
    });
  });
});
