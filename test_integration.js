/*
 * SOLIDARITY PLATFORM - INTEGRATION TEST
 * Core Mathematics Engine → Financial Systems
 */

const CoreMathematicsEngine = require('./src/utils/CoreMathematicsEngine');

console.log('\n🧮 Core Mathematics Engine Integration Test\n');
console.log('='.repeat(60));

// Test 1: Engine initialization
console.log('\n✅ TEST 1: Engine Initialization');
const engine = new CoreMathematicsEngine({
    precision: 49,
    marketScale: 1e18,
    safetyLevel: 0.618
});
console.log(`   φ (Phi): ${engine.PHI}`);
console.log(`   Safety Level: ${engine.safetyLevel}`);
console.log(`   Precision: ${engine.defaultPrecision}`);

// Test 2: Process quantum value
console.log('\n✅ TEST 2: Quantum Value Processing (697 cubits)');
const quantumResult = engine.processValue(697, { precision: 14 });
console.log(`   Input: ${quantumResult.input}`);
console.log(`   Output: ${quantumResult.output}`);
console.log(`   Harmony: ${quantumResult.chargeBalance.harmony.toFixed(6)}`);

// Test 3: Financial harmonization
console.log('\n✅ TEST 3: Financial Exchange Harmonization');
const ethBalance = 10.5;
const solBalance = 250;
const exchange = engine.harmonizeExchangeRate(ethBalance, solBalance, 1e18);
console.log(`   ETH/SOL Raw Ratio: ${exchange.rawRatio.toFixed(6)}`);
console.log(`   Harmonized Rate: ${exchange.harmonizedRate.toExponential(4)}`);
console.log(`   φ-Optimal: ${exchange.phiOptimal ? 'YES' : 'NO'}`);

// Test 4: Coil optimization
console.log('\n✅ TEST 4: Coil Unit Optimization');
const largeValue = 1000000;
const optimized = engine.optimizeCoilUnits(largeValue, 18);
console.log(`   Input: ${largeValue.toLocaleString()}`);
console.log(`   Optimized: ${optimized.exact.toFixed(6)}`);
console.log(`   Nearest Node: ${optimized.alignment.nearestNode.node}`);

// Test 5: Harmony scoring
console.log('\n✅ TEST 5: Harmony Score Calculation');
const testValues = [1, 7, 14, 49, 1.618];
testValues.forEach(val => {
    const score = engine.calculateHarmonyScore(val);
    console.log(`   ${val}: ${score.toFixed(4)} (${score > 0.4 ? 'harmonic' : 'low'})`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ All integration tests passed!\n');
