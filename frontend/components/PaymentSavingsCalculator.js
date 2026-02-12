// PaymentSavingsCalculator.js
// Clean wrapper for PaymentSavingsCalculator.core.js

const PaymentSavingsCalculatorCore = require('./PaymentSavingsCalculator.core');

class PaymentSavingsCalculator extends PaymentSavingsCalculatorCore {}

// Export for use in other modules
module.exports = PaymentSavingsCalculator;

// Demo/CLI usage
if (require.main === module) {
  const calculator = new PaymentSavingsCalculator();
  console.log('💰 PAYMENT SAVINGS CALCULATOR - DEMO\n');
  // Quick calculation example
  console.log('🔍 QUICK CALCULATION:');
  const quick = calculator.quickCalculate(5000000);
  console.log(`   Volume: $5M`);
  console.log(`   Current Fees: ${calculator.formatCurrency(quick.currentFees)}`);
  console.log(`   Optimized Fees: ${calculator.formatCurrency(quick.newFees)}`);
  console.log(`   Annual Savings: ${calculator.formatCurrency(quick.annualSavings)} (${calculator.formatPercent(quick.savingsPercentage)})`);
  console.log(`   Break-Even: ${quick.breakEvenMonths.toFixed(1)} months\n`);
  // Full report example
  console.log('📊 FULL REPORT:\n');
  const report = calculator.generateReport({
    businessName: 'Example E-commerce Store',
    annualVolume: 5000000,
    monthlyTransactions: 10000,
    paymentMix: {
      credit_card: 50,
      paypal: 30,
      crypto: 10,
      bank_transfer: 10
    }
  });
  console.log(calculator.generateTextSummary({
    businessName: 'Example E-commerce Store',
    annualVolume: 5000000,
    monthlyTransactions: 10000
  }));
  // Scenario comparison
  console.log('\n\n📈 SCENARIO COMPARISON:\n');
  const scenarios = [
    { businessName: 'Small Shop', annualVolume: 200000, monthlyTransactions: 500 },
    { businessName: 'Medium Store', annualVolume: 2000000, monthlyTransactions: 5000 },
    { businessName: 'Large Platform', annualVolume: 20000000, monthlyTransactions: 50000 }
  ];
  const comparison = calculator.compareScenarios(scenarios);
  console.log('Business Type          Annual Volume    Annual Savings   % Saved   Break-Even');
  console.log('-'.repeat(80));
  comparison.forEach(row => {
    console.log(
      `${(row.businessName || '').padEnd(20)} ` +
      `$${(row.annualVolume / 1000000).toFixed(1)}M`.padEnd(15) +
      `$${(row.annualSavings / 1000).toFixed(1)}K`.padEnd(15) +
      `${row.savingsPercentage.toFixed(1)}%`.padEnd(10) +
      `${row.breakEvenMonths.toFixed(1)} mo`
    );
  });
  }
// ...existing code...
