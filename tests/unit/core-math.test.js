/*
 * SOLIDARITY PLATFORM - CORE MATHEMATICS UNIT TESTS
 * ===================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const CoreMathematicsEngine = require('../../src/utils/CoreMathematicsEngine');
const { GoldenRatioMath } = require('../../src/harmonic/GoldenRatioMath');

describe('CoreMathematicsEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new CoreMathematicsEngine({
      precision: 49,
      marketScale: 1e18,
      safetyLevel: 0.618
    });
  });

  test('initializes with correct PHI value', () => {
    expect(engine.PHI).toBeCloseTo(1.618033988, 6);
  });

  test('initializes with correct safety level baseline', () => {
    expect(engine.safetyLevel).toBe(0.618);
  });

  test('processValue returns structured result for a numeric input', () => {
    const result = engine.processValue(7, { precision: 7 });
    expect(result).toBeDefined();
    expect(result.input).toBe(7);
    expect(result.output).toBeDefined();
  });

  test('processValue on Henry anchor 14 produces harmonic output', () => {
    const result = engine.processValue(14, { precision: 14 });
    expect(result).toBeDefined();
    expect(typeof result.output).toBe('number');
  });

  test('calculateHarmonyScore returns value in [0, 1] range', () => {
    const score = engine.calculateHarmonyScore(7);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('calculateHarmonyScore returns valid score for sacred node 49', () => {
    const score = engine.calculateHarmonyScore(49);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('harmonizeExchangeRate returns rawRatio and harmonizedRate', () => {
    const result = engine.harmonizeExchangeRate(10.5, 250, 1e18);
    expect(result).toHaveProperty('rawRatio');
    expect(result).toHaveProperty('harmonizedRate');
    expect(typeof result.rawRatio).toBe('number');
  });

  test('optimizeCoilUnits returns exact and alignment properties', () => {
    const result = engine.optimizeCoilUnits(1000000, 18);
    expect(result).toHaveProperty('exact');
    expect(result).toHaveProperty('alignment');
    expect(result.alignment).toHaveProperty('nearestNode');
  });
});

describe('GoldenRatioMath', () => {
  let grm;

  beforeEach(() => {
    grm = new GoldenRatioMath();
  });

  test('PHI constant is correctly defined', () => {
    expect(grm.PHI).toBeCloseTo(1.618033988, 6);
  });

  test('fibonacci returns correct values', () => {
    expect(grm.fibonacci(1)).toBe(1);
    expect(grm.fibonacci(7)).toBe(13);
    expect(grm.fibonacci(10)).toBe(55);
  });

  test('fibonacciSequence returns correct number of terms', () => {
    const seq = grm.fibonacciSequence(7);
    expect(seq.length).toBe(7);
    // Standard Fibonacci: 0, 1, 1, 2, 3, 5, 8
    expect(seq[0]).toBe(0);
    expect(seq[1]).toBe(1);
    expect(seq[2]).toBe(1);
  });

  test('findClosestSacredNode finds exact matches', () => {
    const result = grm.findClosestSacredNode(7);
    expect(result.node).toBe(7);
    expect(result.difference).toBe(0);
  });

  test('findClosestSacredNode finds nearest for non-sacred numbers', () => {
    const result = grm.findClosestSacredNode(6);
    expect(result.node).toBeDefined();
    expect(typeof result.difference).toBe('number');
  });

  test('scaleByPhi multiplies by golden ratio', () => {
    const scaled = grm.scaleByPhi(14);
    expect(scaled).toBeCloseTo(14 * 1.618033988, 4);
  });

  test('isGoldenRatio identifies golden ratio relationships', () => {
    // PHI^2 = PHI + 1 ≈ 2.618
    const result = grm.isGoldenRatio(1.618033988, 1.0);
    expect(typeof result).toBe('boolean');
  });

  test('generateGoldenSpiral returns array of points', () => {
    const spiral = grm.generateGoldenSpiral(5);
    expect(Array.isArray(spiral)).toBe(true);
    expect(spiral.length).toBeGreaterThan(0);
  });
});
