/*
 * SOLIDARITY PLATFORM - CORE ENGINE DEMONSTRATION
 * ===============================================
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * Demonstrates the unified mathematical framework powering
 * all Solidarity Platform calculations.
 */

const CoreMathematicsEngine = require('../src/utils/CoreMathematicsEngine');

console.log('\n='.repeat(70));
console.log('SOLIDARITY PLATFORM - CORE MATHEMATICS ENGINE DEMO');
console.log('='.repeat(70));

// Initialize engine
const engine = new CoreMathematicsEngine({
    precision: 49,
    marketScale: 1e18,
    safetyLevel: 0.618
});

console.log('\n📊 System Constants:');
console.log('═'.repeat(70));
const constants = engine.getSystemConstants();
console.log(`φ (Phi):              ${constants.phi}`);
console.log(`1/φ (Reciprocal):     ${constants.phiReciprocal}`);
console.log(`φ² (Squared):         ${constants.phiSquared}`);
console.log(`Golden Angle:         ${constants.goldenAngle}°`);
console.log(`Henry Progression:    ${constants.henryBase} → ${constants.henryDouble} → ${constants.henrySquare}`);
console.log(`Control Ratio:        ${constants.controlRatio}`);
console.log(`Sacred Nodes:         [${constants.sacredNodes.join(', ')}]`);
console.log(`Safety Level:         ${constants.safetyLevel}`);

// ========================================
// DEMO 1: Quantum Cubic Processing
// ========================================
console.log('\n\n🔮 DEMO 1: Quantum Cubic Processing (697 Cubit Base)');
console.log('═'.repeat(70));

const quantumValue = 697;
const quantumResult = engine.processValue(quantumValue, {
    precision: 64,
    includeAlignment: true,
    includeChargeBalance: true,
    includeFractalProof: true
});

console.log(`Input Value:          ${quantumResult.input}`);
console.log(`Normalized:           ${quantumResult.normalized}`);
console.log(`Fractal Mirrored:     ${quantumResult.mirrored}`);
console.log(`Output (Exact):       ${quantumResult.output}`);
console.log(`Scaled:               ${quantumResult.scaled.toExponential(6)}`);

console.log('\n📐 Henry Progression Alignment:');
console.log(`  Base (÷7):          ${quantumResult.alignment.base.toFixed(6)}`);
console.log(`  Double (÷14):       ${quantumResult.alignment.double.toFixed(6)}`);
console.log(`  Square (÷49):       ${quantumResult.alignment.square.toFixed(6)}`);
console.log(`  Nearest Node:       ${quantumResult.alignment.nearestNode.node}`);
console.log(`  Henry Depth:        ${quantumResult.alignment.henryDepth}`);

console.log('\n⚡ Charge Balance:');
console.log(`  Same Charge (+/+):  ${quantumResult.chargeBalance.same.toFixed(6)} (containment)`);
console.log(`  Opposing Charge:    ${quantumResult.chargeBalance.opposing.toFixed(6)} (amplification)`);
console.log(`  Harmony Point:      ${quantumResult.chargeBalance.harmony.toFixed(6)}`);
console.log(`  Balance Ratio:      ${quantumResult.chargeBalance.ratio.toFixed(6)}`);

if (quantumResult.fractalProof) {
    console.log('\n🔄 Fractal Symmetry Verification:');
    console.log(`  Forward Transform:  ${quantumResult.fractalProof.forward.toFixed(15)}`);
    console.log(`  Inverse Transform:  ${quantumResult.fractalProof.inverse.toFixed(15)}`);
    console.log(`  Original Value:     ${quantumResult.fractalProof.original.toFixed(15)}`);
    console.log(`  Symmetry Error:     ${quantumResult.fractalProof.symmetryError.toExponential(3)}`);
    console.log(`  Perfect Symmetry:   ${quantumResult.fractalProof.isPerfectSymmetry ? '✅ YES' : '❌ NO'}`);
}

// ========================================
// DEMO 2: Financial Portfolio Optimization
// ========================================
console.log('\n\n💰 DEMO 2: Financial Portfolio Optimization');
console.log('═'.repeat(70));

const ethBalance = 10.5;  // ETH
const solBalance = 250;   // SOL

console.log(`ETH Balance:          ${ethBalance} ETH`);
console.log(`SOL Balance:          ${solBalance} SOL`);

const exchangeRate = engine.harmonizeExchangeRate(ethBalance, solBalance, 1e18);

console.log('\n📊 Exchange Rate Harmonization:');
console.log(`  Raw Ratio:          ${exchangeRate.rawRatio.toFixed(6)}`);
console.log(`  Mirrored Ratio:     ${exchangeRate.mirroredRatio.toFixed(6)}`);
console.log(`  Harmonized Rate:    ${exchangeRate.harmonizedRate.toExponential(6)}`);
console.log(`  Market Alignment:   ${exchangeRate.marketAlignment.toExponential(6)}`);
console.log(`  Symmetry Deviation: ${(exchangeRate.symmetryDeviation * 100).toFixed(3)}%`);
console.log(`  φ-Optimal:          ${exchangeRate.phiOptimal ? '✅ YES' : '❌ NO'}`);

console.log('\n⚖️ Charge Balance:');
console.log(`  Same Charge:        ${exchangeRate.chargeBalance.same.toExponential(6)}`);
console.log(`  Opposing Charge:    ${exchangeRate.chargeBalance.opposing.toExponential(6)}`);
console.log(`  Harmony Point:      ${exchangeRate.chargeBalance.harmony.toExponential(6)}`);

// Process individual balances
const ethProcessed = engine.processValue(ethBalance, { precision: 18 });
const solProcessed = engine.processValue(solBalance, { precision: 18 });

console.log('\n🔢 Optimized Balances:');
console.log(`  ETH Optimized:      ${ethProcessed.output.toFixed(18)}`);
console.log(`  SOL Optimized:      ${solProcessed.output.toFixed(18)}`);

// ========================================
// DEMO 3: Energy-Financial Trading Balance
// ========================================
console.log('\n\n⚡ DEMO 3: Energy-Financial Trading Balance');
console.log('═'.repeat(70));

const energyProduction = 15000; // kWh
const energyConsumption = 12000; // kWh
const netEnergy = energyProduction - energyConsumption;

console.log(`Energy Production:    ${energyProduction} kWh`);
console.log(`Energy Consumption:   ${energyConsumption} kWh`);
console.log(`Net Energy:           ${netEnergy} kWh`);

const energyBalance = engine.calculateChargeBalance(netEnergy, 1);

console.log('\n⚡ Energy Charge Balance:');
console.log(`  Same Charge:        ${energyBalance.same.toFixed(6)} kWh (storage capacity)`);
console.log(`  Opposing Charge:    ${energyBalance.opposing.toFixed(6)} kWh (market potential)`);
console.log(`  Harmony Point:      ${energyBalance.harmony.toFixed(6)} kWh (optimal trading)`);
console.log(`  Balance Ratio:      ${energyBalance.ratio.toFixed(6)}`);

// Optimize for market trading
const tradingOptimization = engine.optimizeCoilUnits(energyBalance.harmony, 6);
console.log('\n💱 Trading Optimization:');
console.log(`  Exact Trading Unit: ${tradingOptimization.exact.toFixed(6)} kWh`);
console.log(`  Harmony Score:      ${engine.calculateHarmonyScore(tradingOptimization.exact).toFixed(4)}`);

// ========================================
// DEMO 4: Sacred Geometry Harmony Scores
// ========================================
console.log('\n\n🌟 DEMO 4: Sacred Geometry Harmony Scores');
console.log('═'.repeat(70));

const testValues = [1, 3, 4, 7, 14, 21, 49, 1.618, Math.PI, Math.E];

console.log('Value'.padEnd(20) + 'Harmony Score'.padEnd(20) + 'Interpretation');
console.log('─'.repeat(70));

testValues.forEach(value => {
    const score = engine.calculateHarmonyScore(value);
    const interpretation = score > 0.7 ? '✨ Highly Harmonic' : 
                          score > 0.4 ? '🌟 Moderately Harmonic' : 
                          '⚪ Low Harmony';
    console.log(
        value.toFixed(6).padEnd(20) + 
        score.toFixed(4).padEnd(20) + 
        interpretation
    );
});

// ========================================
// DEMO 5: Coil Unit Optimization (Large Scale)
// ========================================
console.log('\n\n🎯 DEMO 5: Coil Unit Optimization (Large Scale)');
console.log('═'.repeat(70));

const largeValue = 1000000000; // 1 billion
console.log(`Input Value:          ${largeValue.toLocaleString()}`);

const coilOptimized = engine.optimizeCoilUnits(largeValue, 49);

console.log('\n🔧 Optimization Results:');
console.log(`  Normalized:         ${coilOptimized.normalized.toFixed(6)}`);
console.log(`  Mirrored:           ${coilOptimized.mirrored.toFixed(6)}`);
console.log(`  Exact Output:       ${coilOptimized.exact.toExponential(6)}`);
console.log(`  Precision:          ${coilOptimized.precision} decimals`);
console.log(`  Symmetry Verified:  ${coilOptimized.verificationSymmetry < 1e-15 ? '✅ YES' : '❌ NO'}`);

console.log('\n📐 Henry Alignment:');
console.log(`  Base Alignment:     ${coilOptimized.alignment.base.toFixed(6)}`);
console.log(`  Double Alignment:   ${coilOptimized.alignment.double.toFixed(6)}`);
console.log(`  Square Alignment:   ${coilOptimized.alignment.square.toFixed(6)}`);
console.log(`  Nearest Node:       ${coilOptimized.alignment.nearestNode.node}`);

console.log('\n⚖️ Charge Balance:');
console.log(`  Same Charge:        ${coilOptimized.balanced.same.toExponential(6)}`);
console.log(`  Opposing Charge:    ${coilOptimized.balanced.opposing.toExponential(6)}`);
console.log(`  Harmony Point:      ${coilOptimized.balanced.harmony.toExponential(6)}`);

// ========================================
// DEMO 6: Batch Processing
// ========================================
console.log('\n\n📦 DEMO 6: Batch Processing (Sacred Nodes)');
console.log('═'.repeat(70));

const sacredNodes = [1, 3, 4, 7, 14, 21, 49];
const batchResults = engine.processMultiple(sacredNodes, { 
    precision: 14,
    includeAlignment: false,
    includeChargeBalance: false
});

console.log('Node'.padEnd(15) + 'Normalized'.padEnd(20) + 'Output'.padEnd(25) + 'Scaled');
console.log('─'.repeat(70));

batchResults.forEach(result => {
    console.log(
        result.input.toString().padEnd(15) + 
        result.normalized.toFixed(6).padEnd(20) + 
        result.output.toFixed(6).padEnd(25) +
        result.scaled.toExponential(3)
    );
});

// ========================================
// SUMMARY
// ========================================
console.log('\n\n📝 SUMMARY');
console.log('═'.repeat(70));
console.log('✅ Core Mathematics Engine successfully demonstrated across:');
console.log('   • Quantum cubic calculations (697 cubit base)');
console.log('   • Financial portfolio optimization (ETH/SOL)');
console.log('   • Energy-financial trading balance');
console.log('   • Sacred geometry harmony scoring');
console.log('   • Large-scale coil unit optimization');
console.log('   • Batch processing of sacred nodes');
console.log('\n🎯 All operations use the unified 6-step framework:');
console.log('   1. Normalize to φ-ratio scale');
console.log('   2. Apply Henry progression alignment (7→14→49)');
console.log('   3. Fractal mirror through equality');
console.log('   4. Calculate charge balance (same/opposing forces)');
console.log('   5. Optimize to exact numeric coil units');
console.log('   6. Harmonize large-scale exchange rates');
console.log('\n🌟 This engine powers EVERY calculation in the Solidarity Platform.');
console.log('='.repeat(70));
console.log('\n');
