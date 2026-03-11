/*
 * SOLIDARITY PLATFORM - SAFETY SYSTEM UNIT TESTS
 * ================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { BridgingSafetyCoordinator } = require('../../src/safety/BridgingSafetyCoordinator');

describe('BridgingSafetyCoordinator', () => {
  let coordinator;

  beforeEach(() => {
    coordinator = new BridgingSafetyCoordinator();
  });

  test('initializes all component levels at anchor ratio 0.618', () => {
    const levels = coordinator.componentLevels;
    expect(levels.quantum).toBe(0.618);
    expect(levels.launcher).toBe(0.618);
    expect(levels.solidarity).toBe(0.618);
    expect(levels.ai).toBe(0.618);
    expect(levels.colorMotion).toBe(0.618);
    expect(levels.system).toBe(0.618);
  });

  test('has all 7 safety tiers defined', () => {
    const tiers = Object.keys(coordinator.safetyThresholds);
    expect(tiers).toHaveLength(7);
    expect(tiers).toContain('CRITICAL_EMERGENCY');
    expect(tiers).toContain('WARNING_LEVEL');
    expect(tiers).toContain('CAUTION_RANGE');
    expect(tiers).toContain('OPTIMAL_RANGE');
    expect(tiers).toContain('UPPER_CAUTION');
    expect(tiers).toContain('UPPER_WARNING');
    expect(tiers).toContain('CRITICAL_UPPER');
  });

  test('assessSafetyLevel returns OPTIMAL_RANGE for 0.618', () => {
    const result = coordinator.assessSafetyLevel(0.618);
    expect(result.level).toBe('OPTIMAL_RANGE');
    expect(result.priority).toBe('STANDARD');
  });

  test('assessSafetyLevel returns CRITICAL_EMERGENCY for 0.02', () => {
    const result = coordinator.assessSafetyLevel(0.02);
    expect(result.level).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MAXIMUM');
  });

  test('assessSafetyLevel returns CRITICAL_UPPER for 0.98', () => {
    const result = coordinator.assessSafetyLevel(0.98);
    expect(result.level).toBe('CRITICAL_UPPER');
    expect(result.priority).toBe('MAXIMUM');
  });

  test('assessSafetyLevel returns WARNING_LEVEL for 0.10', () => {
    const result = coordinator.assessSafetyLevel(0.10);
    expect(result.level).toBe('WARNING_LEVEL');
    expect(result.priority).toBe('HIGH');
  });

  test('setComponentSafety changes a specific component', () => {
    coordinator.setComponentSafety('ai', 0.50);
    expect(coordinator.componentLevels.ai).toBe(0.50);
    // Other components remain unchanged
    expect(coordinator.componentLevels.quantum).toBe(0.618);
  });

  test('getSystemStatus returns structured report', () => {
    const status = coordinator.getSystemStatus();
    expect(status).toBeDefined();
    expect(status).toHaveProperty('flowMode');
    expect(status).toHaveProperty('components');
    expect(status).toHaveProperty('system');
    expect(status).toHaveProperty('warnings');
  });

  test('conservative flow mode reflects lower component levels', () => {
    coordinator.currentFlowMode = 'conservative';
    coordinator.setComponentSafety('ai', 0.30);
    const status = coordinator.getSystemStatus();
    expect(status.system).toBeDefined();
  });

  test('safety thresholds cover full 0-1 range without gaps', () => {
    const thresholds = Object.values(coordinator.safetyThresholds);
    const sorted = thresholds.sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(0.00);
    expect(sorted[sorted.length - 1].max).toBe(1.00);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max);
    }
  });

  test('assessSafetyLevel includes value in result', () => {
    const result = coordinator.assessSafetyLevel(0.42);
    expect(result.value).toBe(0.42);
    expect(result.range).toBeDefined();
  });
});
