/*
 * SOLIDARITY PLATFORM - WALLET PAYMENT INTEGRATION EXAMPLE
 * =========================================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * =========================================================
 * 
 * Example: Integrating Wallet Manager with Payment Connectors
 */

const WalletManager = require('./wallet_manager.js');
const PaymentConnector = require('./payment_connector.js');

async function walletPaymentDemo() {
  console.log('\n💼 WALLET + PAYMENT CONNECTOR INTEGRATION DEMO');
  console.log('=' .repeat(70));
  
  // Initialize systems with matching safety levels
  const wallet = new WalletManager({
    testMode: true,
    safetyLevel: 0.618
  });
  
  const payments = new PaymentConnector({
    testMode: true,
    safetyLevel: 0.618,
    enableFeeOptimization: true,
    autoRouting: true
  });
  
  console.log('\n✅ Both systems initialized with safety level 0.618');
  
  // Create wallets for different chains
  console.log('\n--- Creating Wallets ---');
  const ethWallet = wallet.createWallet('ethereum', { name: 'Main ETH Wallet' });
  const solWallet = wallet.createWallet('solana', { name: 'Main SOL Wallet' });
  const btcWallet = wallet.createWallet('bitcoin', { name: 'Bitcoin Savings' });
  
  console.log(`✓ Created ${wallet.wallets.size} wallets`);
  
  // Scenario 1: Small payment from ETH wallet
  console.log('\n--- Scenario 1: Coffee Purchase ($5) ---');
  console.log('User: Alice wants to buy coffee with her ETH wallet');
  
  const coffee = await payments.processPayment({
    amount: 5,
    currency: 'USD',
    metadata: {
      walletId: ethWallet.id,
      walletType: 'ethereum',
      merchant: 'Coffee Shop',
      description: 'Latte + Muffin'
    }
  });
  
  console.log(`Payment Method: ${coffee.method}`);
  console.log(`Fee: $${coffee.fee.toFixed(2)} (${(coffee.fee/5*100).toFixed(2)}%)`);
  console.log(`Status: ${coffee.status}`);
  
  // Scenario 2: Medium payment - online shopping
  console.log('\n--- Scenario 2: Online Shopping ($250) ---');
  console.log('User: Bob buying electronics with SOL wallet');
  
  const shopping = await payments.processPayment({
    amount: 250,
    currency: 'USD',
    method: 'stablecoin', // Prefer stablecoin for medium amounts
    metadata: {
      walletId: solWallet.id,
      walletType: 'solana',
      merchant: 'Electronics Store',
      items: ['Headphones', 'Mouse']
    }
  });
  
  console.log(`Payment Method: ${shopping.method}`);
  console.log(`Fee: $${shopping.fee.toFixed(2)} (${(shopping.fee/250*100).toFixed(2)}%)`);
  console.log(`Status: ${shopping.status}`);
  
  // Scenario 3: Large payment - rent payment
  console.log('\n--- Scenario 3: Rent Payment ($2000) ---');
  console.log('User: Charlie paying rent from BTC wallet');
  
  const rent = await payments.processPayment({
    amount: 2000,
    currency: 'USD',
    metadata: {
      walletId: btcWallet.id,
      walletType: 'bitcoin',
      merchant: 'Property Management',
      description: 'Monthly rent - December 2025'
    }
  });
  
  console.log(`Payment Method: ${rent.method}`);
  console.log(`Fee: $${rent.fee.toFixed(2)} (${(rent.fee/2000*100).toFixed(2)}%)`);
  console.log(`Status: ${rent.status}`);
  
  // Scenario 4: Compare payment methods for a specific amount
  console.log('\n--- Scenario 4: Method Comparison for $100 ---');
  const methods = payments.getAvailableMethods(100);
  
  console.log('Available payment methods (sorted by fee):');
  methods.slice(0, 5).forEach((m, i) => {
    console.log(`${i+1}. ${m.name}: $${m.fee.toFixed(2)} fee (${m.feePercentage}%) - ${m.processingTime}s processing`);
  });
  
  // Calculate potential savings
  const highestFee = methods[methods.length - 1].fee;
  const lowestFee = methods[0].fee;
  const savings = highestFee - lowestFee;
  const savingsPercent = (savings / highestFee * 100).toFixed(2);
  
  console.log(`\n💰 Potential Savings: $${savings.toFixed(2)} (${savingsPercent}%) by choosing best method`);
  
  // Payment history from all wallets
  console.log('\n--- Payment History ---');
  const history = payments.getPaymentHistory();
  console.log(`Total Payments: ${history.length}`);
  
  history.forEach(p => {
    console.log(`\n  Payment ID: ${p.id}`);
    console.log(`  Amount: $${p.amount} ${p.currency}`);
    console.log(`  Method: ${p.methodName}`);
    console.log(`  Fee: $${p.fee.toFixed(2)}`);
    console.log(`  Wallet: ${p.metadata.walletType || 'N/A'}`);
    console.log(`  Status: ${p.status}`);
  });
  
  // Portfolio and payment metrics
  console.log('\n--- Portfolio Summary ---');
  const walletStatus = wallet.getSystemStatus();
  const paymentStatus = payments.getSystemStatus();
  
  console.log(`Wallets: ${walletStatus.wallets}`);
  console.log(`Total Payments: ${paymentStatus.metrics.totalPayments}`);
  console.log(`Success Rate: ${paymentStatus.metrics.successRate}%`);
  console.log(`Total Volume: $${paymentStatus.metrics.totalVolume.toFixed(2)}`);
  console.log(`Total Fees Paid: $${paymentStatus.metrics.totalFees.toFixed(2)}`);
  console.log(`Fee Savings (φ-optimization): $${paymentStatus.metrics.savedFees.toFixed(2)}`);
  console.log(`Average Fee Rate: ${paymentStatus.metrics.averageFeePercentage}%`);
  
  // Safety level analysis
  console.log('\n--- Safety Analysis ---');
  console.log(`Current Safety Level: ${wallet.safetyLevel.toFixed(3)}`);
  
  const walletSafety = wallet.getSafetyConfig();
  const paymentSafety = payments.getSafetyConfig();
  
  console.log(`Wallet Manager: ${walletSafety.level}`);
  console.log(`  - Max Wallets: ${walletSafety.maxWallets}`);
  console.log(`  - Operations Limited: ${walletSafety.operationsLimited ? 'Yes' : 'No'}`);
  
  console.log(`Payment Connector: ${paymentSafety.level}`);
  console.log(`  - Max Amount: $${paymentSafety.maxAmount}`);
  console.log(`  - Allowed Methods: ${paymentSafety.allowedMethods.join(', ')}`);
  
  console.log('\n✅ Integration Demo Complete!');
  console.log('=' .repeat(70));
  console.log('\nKey Takeaways:');
  console.log('  ✓ Wallets and payments share safety levels');
  console.log('  ✓ φ-ratio optimization saves on fees');
  console.log('  ✓ Auto-routing finds best payment method');
  console.log('  ✓ All transactions tracked with metadata');
  console.log('  ✓ Multiple chains supported (ETH, SOL, BTC)');
  console.log('  ✓ Test mode protects against real transactions');
}

// Run demo
if (require.main === module) {
  walletPaymentDemo().catch(console.error);
}

module.exports = { walletPaymentDemo };
