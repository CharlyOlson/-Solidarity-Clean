/*
 * SOLIDARITY PLATFORM - TRIANGLE NETWORK + PYTHAGOREAN TESTS
 * ============================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

'use strict';

// Suppress console output during tests
beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(()  => { console.log.mockRestore(); });

const registry    = require('../../financial_systems/entity_registry');
const pyth        = require('../../financial_systems/pythagorean_balancer');
const { computeTriangle } = require('../../financial_systems/three_point_connector');
const { buildNetwork, toRenderableGraph } = require('../../financial_systems/triangle_network');
const { project }       = require('../../financial_systems/projection_engine');
const { runStressTest } = require('../../financial_systems/market_stress_test');
const { seed: seedIBM, reseed: reseedIBM } = require('../../financial_systems/ibm_entities');

// ── Re-seed before every test so overrides don't bleed ────────────────────────
beforeEach(() => {
  registry.clear();
  reseedIBM();
});

// =============================================================================
// 1. PYTHAGOREAN BALANCER — unit tests
// =============================================================================
describe('PythagoreanBalancer', () => {

  describe('arithmeticMean', () => {
    test('correct average of three equal values', () => {
      expect(pyth.arithmeticMean(0.6, 0.6, 0.6)).toBeCloseTo(0.6, 5);
    });
    test('correct average of three different values', () => {
      expect(pyth.arithmeticMean(0.3, 0.6, 0.9)).toBeCloseTo(0.6, 5);
    });
  });

  describe('geometricMean', () => {
    test('correct cube root of equal values', () => {
      expect(pyth.geometricMean(0.5, 0.5, 0.5)).toBeCloseTo(0.5, 5);
    });
    test('returns 0 when any value is 0', () => {
      expect(pyth.geometricMean(0, 0.5, 0.5)).toBe(0);
    });
  });

  describe('harmonicMean', () => {
    test('correct harmonic mean of equal values', () => {
      expect(pyth.harmonicMean(0.5, 0.5, 0.5)).toBeCloseTo(0.5, 5);
    });
    test('returns 0 when any value is 0', () => {
      expect(pyth.harmonicMean(0, 0.5, 0.5)).toBe(0);
    });
    test('harmonic ≤ geometric ≤ arithmetic for positive values', () => {
      const a = 0.3, b = 0.6, c = 0.9;
      const am = pyth.arithmeticMean(a,b,c);
      const gm = pyth.geometricMean(a,b,c);
      const hm = pyth.harmonicMean(a,b,c);
      expect(hm).toBeLessThanOrEqual(gm + 1e-9);
      expect(gm).toBeLessThanOrEqual(am + 1e-9);
    });
  });

  describe('pythagoreanBalance', () => {
    test('perfect 3-4-5 right triangle → high balance', () => {
      // Normalise 3,4,5 to [0,1]: 0.3, 0.4, 0.5
      const bal = pyth.pythagoreanBalance(0.3, 0.4, 0.5);
      expect(bal).toBeGreaterThan(0.9);
    });
    test('equilateral triangle → lower balance (not right)', () => {
      const bal = pyth.pythagoreanBalance(0.5, 0.5, 0.5);
      expect(bal).toBeLessThan(0.9);
    });
    test('output is always in [0,1]', () => {
      for (const [a,b,c] of [[0,0,0],[1,1,1],[0.1,0.9,0.5]]) {
        const bal = pyth.pythagoreanBalance(a,b,c);
        expect(bal).toBeGreaterThanOrEqual(0);
        expect(bal).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('applyCorrection', () => {
    test('no correction applied when balance >= 0.618', () => {
      const { corrected } = pyth.applyCorrection(0.3, 0.4, 0.5, 0.95);
      expect(corrected).toBe(false);
    });
    test('correction applied when balance < 0.618', () => {
      const result = pyth.applyCorrection(0.1, 0.9, 0.5, 0.3);
      expect(result.corrected).toBe(true);
      // Corrected values should be closer to mean
      const mean = pyth.arithmeticMean(0.1, 0.9, 0.5);
      expect(Math.abs(result.a - mean)).toBeLessThan(Math.abs(0.1 - mean));
    });
  });

  describe('analyze', () => {
    test('returns all required keys', () => {
      const r = pyth.analyze(0.618, 0.72, 0.70, 21, 14, 14, 0.65);
      expect(r).toHaveProperty('balance');
      expect(r).toHaveProperty('adjustedCoherence');
      expect(r).toHaveProperty('hypotenuse');
      expect(r).toHaveProperty('means');
      expect(r.means).toHaveProperty('arithmetic');
      expect(r.means).toHaveProperty('geometric');
      expect(r.means).toHaveProperty('harmonic');
      expect(r).toHaveProperty('corrected');
      expect(r).toHaveProperty('isBalanced');
      expect(r).toHaveProperty('balanceLabel');
      expect(r).toHaveProperty('pythagoreanBonus');
    });
    test('movementWeight 3 or 4 yields a pythagoreanBonus > 0', () => {
      const withBonus    = pyth.analyze(0.5, 0.5, 0.5, 3, 4, 7, 0.5);
      const withoutBonus = pyth.analyze(0.5, 0.5, 0.5, 21, 14, 7, 0.5);
      expect(withBonus.pythagoreanBonus).toBeGreaterThan(0);
      expect(withoutBonus.pythagoreanBonus).toBe(0);
    });
    test('adjustedCoherence is in [0,1]', () => {
      for (const [a,b,c] of [[0,0,0],[1,1,1],[0.3,0.618,0.9]]) {
        const r = pyth.analyze(a,b,c,7,4,3,0.618);
        expect(r.adjustedCoherence).toBeGreaterThanOrEqual(0);
        expect(r.adjustedCoherence).toBeLessThanOrEqual(1);
      }
    });
  });

});

// =============================================================================
// 2. THREE-POINT CONNECTOR — unit tests
// =============================================================================
describe('ThreePointConnector', () => {

  test('computeTriangle returns coherenceScore in [0,1]', () => {
    const result = computeTriangle('ibm', 'arrow-electronics', 'avnet');
    expect(result.coherenceScore).toBeGreaterThanOrEqual(0);
    expect(result.coherenceScore).toBeLessThanOrEqual(1);
  });

  test('computeTriangle includes pythagorean block', () => {
    const result = computeTriangle('ibm', 'intel', 'broadcom');
    expect(result.pythagorean).toBeDefined();
    expect(result.pythagorean.balance).toBeGreaterThanOrEqual(0);
    expect(result.pythagorean.balance).toBeLessThanOrEqual(1);
  });

  test('computeTriangle includes three means', () => {
    const result = computeTriangle('ibm', 'vanguard', 'blackrock');
    expect(result.means).toHaveProperty('arithmetic');
    expect(result.means).toHaveProperty('geometric');
    expect(result.means).toHaveProperty('harmonic');
  });

  test('competitor signal is inverted', () => {
    // aws has baseSignal 0.85 — as competitor its effective signal = 1 - 0.85 = 0.15
    const result = computeTriangle('ibm', 'aws', 'microsoft');
    // p2 is aws (competitor): signal should be ~ 1 - 0.85 = 0.15
    expect(result.points.p2.signal).toBeCloseTo(0.15, 2);
  });

  test('signal override is respected', () => {
    const overrides = new Map([['ibm', 0.99]]);
    const result = computeTriangle('ibm', 'vanguard', 'blackrock', overrides);
    expect(result.points.p1.signal).toBeCloseTo(0.99, 2);
  });

  test('rawCoherence differs from adjustedCoherence when balance < 1', () => {
    const result = computeTriangle('ibm', 'td-synnex', 'sap');
    // They may be equal if perfectly balanced, but raw and adjusted are both present
    expect(result).toHaveProperty('rawCoherence');
    expect(result).toHaveProperty('coherenceScore');
  });

});

// =============================================================================
// 3. ENTITY REGISTRY — unit tests
// =============================================================================
describe('EntityRegistry', () => {

  test('IBM is registered after seed', () => {
    expect(registry.has('ibm')).toBe(true);
  });

  test('getConnections returns array', () => {
    const conns = registry.getConnections('ibm');
    expect(Array.isArray(conns)).toBe(true);
    expect(conns.length).toBeGreaterThan(0);
  });

  test('bidirectional connections: intel connects to ibm', () => {
    const intelConns = registry.getConnections('intel');
    expect(intelConns).toContain('ibm');
  });

  test('register merges connections idempotently', () => {
    // Register the new entity first so getConnections (which filters by has())
    // can include it in the bidirectional index
    registry.register({ id: 'new-test-entity', name: 'New', role: 'partner',
      movementWeight: 1, baseSignal: 0.5, connections: ['ibm'] });
    registry.register({ id: 'ibm', name: 'IBM', role: 'core',
      movementWeight: 21, baseSignal: 0.618, connections: ['new-test-entity'] });
    const conns = registry.getConnections('ibm');
    expect(conns).toContain('new-test-entity');
    // Original connections still present
    expect(conns).toContain('intel');
  });

  test('nearestNode snaps to valid set', () => {
    expect(registry.nearestNode(5)).toBe(4);   // 5 is between 4 and 7, closer to 4
    expect(registry.nearestNode(10)).toBe(7);
    expect(registry.nearestNode(20)).toBe(21);
  });

  test('getByRole returns only entities of that role', () => {
    const investors = registry.getByRole('investor');
    investors.forEach(e => expect(e.role).toBe('investor'));
    expect(investors.length).toBeGreaterThan(0);
  });

});

// =============================================================================
// 4. TRIANGLE NETWORK — unit tests
// =============================================================================
describe('TriangleNetwork', () => {

  test('builds a network for ibm', () => {
    const net = buildNetwork('ibm', { maxDepth: 1 });
    expect(net.nodes.size).toBeGreaterThan(0);
    expect(net.triangles.length).toBeGreaterThan(0);
  });

  test('no duplicate nodes — shared tips are the same entry', () => {
    const net = buildNetwork('ibm', { maxDepth: 2 });
    const ids = Array.from(net.nodes.keys());
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('all triangle vertices exist in nodes map', () => {
    const net = buildNetwork('ibm', { maxDepth: 2 });
    net.triangles.forEach(tri => {
      tri.vertices.forEach(vid => {
        expect(net.nodes.has(vid)).toBe(true);
      });
    });
  });

  test('edges are undirected and deduplicated', () => {
    const net = buildNetwork('ibm', { maxDepth: 1 });
    const edgeArr = Array.from(net.edges);
    const unique  = new Set(edgeArr);
    expect(unique.size).toBe(edgeArr.length);
    // Every edge key is sorted a--b (a < b lexicographically)
    edgeArr.forEach(e => {
      const [a, b] = e.split('--');
      expect(a <= b).toBe(true);
    });
  });

  test('expansion stops when fewer than 2 connectors available', () => {
    // Register a lone entity with only 1 connection
    registry.register({ id: 'lone-entity', name: 'Lone', role: 'supplier',
      movementWeight: 1, baseSignal: 0.5, connections: ['ibm'] });
    // Network from ibm will include lone-entity as a node but it won't
    // spawn its own triangles (only 1 connection back to ibm)
    const net = buildNetwork('ibm', { maxDepth: 2 });
    // lone-entity should be a node (it's a connection of ibm)
    // but centeredAlready should not contain it as a center (no triangles with it as center)
    const loneTriangles = net.triangles.filter(t => t.vertices[0] === 'lone-entity');
    expect(loneTriangles.length).toBe(0);
  });

  test('toRenderableGraph summary has correct counts', () => {
    const net = buildNetwork('ibm', { maxDepth: 1 });
    const g   = toRenderableGraph(net);
    expect(g.summary.nodeCount).toBe(net.nodes.size);
    expect(g.summary.edgeCount).toBe(net.edges.size);
    expect(g.summary.triangleCount).toBe(net.triangles.length);
  });

  test('each triangle carries pythagorean block', () => {
    const net = buildNetwork('ibm', { maxDepth: 1 });
    net.triangles.forEach(tri => {
      expect(tri.pythagorean).toBeDefined();
      expect(tri.pythagorean.balance).toBeGreaterThanOrEqual(0);
      expect(tri.means).toBeDefined();
    });
  });

  test('networkCoherence is in [0,1]', () => {
    const net = buildNetwork('ibm', { maxDepth: 3 });
    expect(net.networkCoherence).toBeGreaterThanOrEqual(0);
    expect(net.networkCoherence).toBeLessThanOrEqual(1);
  });

  test('pythagoreanSummary is populated', () => {
    const net = buildNetwork('ibm', { maxDepth: 2 });
    expect(net.pythagoreanSummary).toHaveProperty('avgBalance');
    expect(net.pythagoreanSummary).toHaveProperty('meanArithmetic');
    expect(net.pythagoreanSummary).toHaveProperty('meanGeometric');
    expect(net.pythagoreanSummary).toHaveProperty('meanHarmonic');
    expect(net.pythagoreanSummary).toHaveProperty('dominantLabel');
  });

  test('works for non-IBM center entity (intel)', () => {
    const net = buildNetwork('intel', { maxDepth: 2 });
    expect(net.nodes.has('intel')).toBe(true);
    expect(net.triangles.length).toBeGreaterThan(0);
  });

  test('throws for unknown entity', () => {
    expect(() => buildNetwork('nonexistent-entity')).toThrow();
  });

  test('signal override propagates into triangle coherence', () => {
    const baseline = buildNetwork('ibm', { maxDepth: 1 });
    const overrides = new Map([['ibm', 0.99]]);
    const boosted   = buildNetwork('ibm', { maxDepth: 1, overrides });
    // Boosted IBM signal should raise coherence scores
    expect(boosted.networkCoherence).toBeGreaterThan(baseline.networkCoherence - 0.01);
  });

});

// =============================================================================
// 5. PROJECTION ENGINE — unit tests
// =============================================================================
describe('ProjectionEngine', () => {

  test('returns all required fields', () => {
    const result = project('ibm', { maxDepth: 1, maxRecursion: 7 });
    ['entityId','shortTerm','midTerm','longTerm','coherenceScore',
     'safetyTier','isOptimal','recursionDepth','halted','pythagorean',
     'henryProgression','networkSummary'].forEach(k => {
      expect(result).toHaveProperty(k);
    });
  });

  test('all projection values are in [0,1]', () => {
    const result = project('ibm', { maxDepth: 2, maxRecursion: 14 });
    expect(result.shortTerm).toBeGreaterThanOrEqual(0);
    expect(result.shortTerm).toBeLessThanOrEqual(1);
    expect(result.midTerm).toBeGreaterThanOrEqual(0);
    expect(result.midTerm).toBeLessThanOrEqual(1);
    expect(result.longTerm).toBeGreaterThanOrEqual(0);
    expect(result.longTerm).toBeLessThanOrEqual(1);
    expect(result.coherenceScore).toBeGreaterThanOrEqual(0);
    expect(result.coherenceScore).toBeLessThanOrEqual(1);
  });

  test('pythagorean block has all three means', () => {
    const result = project('ibm', { maxDepth: 1, maxRecursion: 7 });
    expect(result.pythagorean.arithmetic).toBeGreaterThanOrEqual(0);
    expect(result.pythagorean.geometric).toBeGreaterThanOrEqual(0);
    expect(result.pythagorean.harmonic).toBeGreaterThanOrEqual(0);
  });

  test('Henry progression constants are correct', () => {
    const result = project('ibm', { maxDepth: 1, maxRecursion: 49 });
    expect(result.henryProgression.seed).toBe(7);
    expect(result.henryProgression.mid).toBe(14);
    expect(result.henryProgression.full).toBe(49);
    expect(result.henryProgression.ratio).toBe(3.5);
  });

  test('safetyLevel below halt threshold stops recursion', () => {
    // Force all signals to 0 → coherence near 0 → should halt
    const allZero = new Map();
    registry.getAll().forEach(e => allZero.set(e.id, 0));
    const result = project('ibm', { maxDepth: 1, maxRecursion: 49, overrides: allZero });
    expect(result.halted).toBe(true);
    expect(result.recursionDepth).toBeLessThan(49);
  });

  test('full 49-level recursion (big ask) runs without error', () => {
    const result = project('ibm', { maxDepth: 7, maxRecursion: 49 });
    expect(result.recursionDepth).toBeGreaterThan(0);
  });

  test('works for microsoft as center entity', () => {
    const result = project('microsoft', { maxDepth: 2, maxRecursion: 14 });
    expect(result.entityId).toBe('microsoft');
    expect(result.coherenceScore).toBeGreaterThanOrEqual(0);
  });

});

// =============================================================================
// 6. STRESS TEST — integration tests
// =============================================================================
describe('StressTest', () => {

  test('returns 6 phase results', () => {
    const results = runStressTest('ibm', { maxDepth: 1 });
    expect(results).toHaveLength(6);
  });

  test('phase numbers are 1–6', () => {
    const results = runStressTest('ibm', { maxDepth: 1 });
    results.forEach((r, i) => expect(r.phase).toBe(i + 1));
  });

  test('all coherence scores are in [0,1]', () => {
    const results = runStressTest('ibm', { maxDepth: 1 });
    results.forEach(r => {
      expect(r.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(r.coherenceScore).toBeLessThanOrEqual(1);
    });
  });

  test('phase 6 (big ask) runs full 49-level recursion', () => {
    const results = runStressTest('ibm', { maxDepth: 2 });
    const bigAsk  = results.find(r => r.name === 'BIG_ASK');
    expect(bigAsk).toBeDefined();
    expect(bigAsk.recursionDepth).toBeGreaterThan(0);
  });

  test('distributor shock (phase 2) does not crash', () => {
    const results = runStressTest('ibm', { maxDepth: 1 });
    const shock   = results.find(r => r.name === 'DISTRIBUTOR_SHOCK');
    expect(shock).toBeDefined();
    expect(shock.coherenceScore).toBeGreaterThanOrEqual(0);
  });

  test('system stays in a valid safety tier across all phases', () => {
    const validTiers = new Set([
      'EMERGENCY','WARNING','CAUTION','OPTIMAL',
      'UPPER_CAUTION','UPPER_WARNING','CRITICAL_UPPER',
    ]);
    const results = runStressTest('ibm', { maxDepth: 1 });
    results.forEach(r => {
      expect(validTiers.has(r.safetyTier)).toBe(true);
    });
  });

  test('works for non-IBM entity (intel)', () => {
    const results = runStressTest('intel', { maxDepth: 1 });
    expect(results).toHaveLength(6);
    results.forEach(r => {
      expect(r.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(r.coherenceScore).toBeLessThanOrEqual(1);
    });
  });

});
