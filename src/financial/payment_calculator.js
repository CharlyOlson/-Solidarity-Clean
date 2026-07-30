/*
 * SOLIDARITY PLATFORM - PAYMENT SAVINGS CALCULATOR
 * =================================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * Interactive calculator showing real savings with payment connector system
 * Demonstrates φ-ratio optimization across different business scenarios
 * 
 * FULLY OPERATIONAL VERSION with:
 * - Real-time calculations and event-driven updates
 * - Input validation and error handling
 * - 7-tier safety threshold integration
 * - Persistence and export functionality
 * - API-ready interface for frontend integration
 * - Live calculation mode for interactive UI
 */

const fs = require('fs');

// Delegated to core module for all calculation logic
const { PaymentCalculatorCore } = require('./payment_calculator.core');

// Main PaymentCalculator class (wrapper for orchestration, I/O, API)
class PaymentCalculator {
  constructor(config = {}) {
    this.core = new PaymentCalculatorCore(config);
  }

  // Proxy core calculation methods
  generateSavingsReport(config) {
    return this.core.generateSavingsReport(config);
  }

  calculateTraditionalFees(...args) {
    return this.core.calculateTraditionalFees(...args);
  }

  calculateOptimizedFees(...args) {
    return this.core.calculateOptimizedFees(...args);
  }

  compareScenarios(scenarios) {
    return this.core.compareScenarios(scenarios);
  }

  getSessionStats() {
    return this.core.getSessionStats();
  }

  getPaymentMethods() {
    return this.core.getPaymentMethods();
  }

  resetSession() {
    return this.core.resetSession();
  }

  // Add any orchestration, logging, or API-specific methods here
}

// Demo: Run calculator with example business
if (require.main === module) {
  const calculator = new PaymentCalculator({
    testMode: true,
    autoSave: false
  });

  console.log('🚀 SOLIDARITY PAYMENT SAVINGS CALCULATOR (MODULAR)');
  console.log('Powered by φ-ratio optimization (Base Ratio = 1.618)\n');

  // Example: Medium-sized e-commerce business
  const result = calculator.generateSavingsReport({
    businessName: 'Your E-commerce Store',
    annualVolume: 5000000,      // $5M annual volume
    monthlyTransactions: 10000,  // 10k transactions/month
    averageTransaction: 50,      // $50 average order
    paymentMix: {
      creditCard: 50,      // 50% credit card
      paypal: 30,          // 30% PayPal
      crypto: 10,          // 10% cryptocurrency
      bankTransfer: 10     // 10% bank transfer
    }
  });
  console.log('\n📊 Calculation Complete:', result);

  // Compare all scenarios
  const scenarios = calculator.compareScenarios();
  console.log('\n📈 Scenario Comparison:', scenarios);

  // Show session stats
  console.log('\n📈 Session Statistics:');
  console.log(calculator.getSessionStats());

  // Show available payment methods
  console.log('\n💳 Available Payment Methods:');
  console.table(calculator.getPaymentMethods());

  console.log('\n💡 READY TO CALCULATE YOUR SAVINGS?');
  console.log('Edit the configuration above or integrate with your systems!\n');
  console.log('✅ Payment connector ready for integration');
  console.log('⚡ φ-ratio optimization active');
  console.log(`🛡️ Safety level: ${calculator.core.safetyLevel?.toFixed(3) || 'N/A'} (optimal)\n`);
}

module.exports = PaymentCalculator;
