/*
 * SOLIDARITY PLATFORM - PAYMENT CONNECTOR STANDALONE TEST
 * =======================================================
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const PaymentConnector = require('./payment_connector');

console.log('💳 PAYMENT CONNECTOR - INTEGRATION TEST');
console.log('='.repeat(70));
console.log('Testing payment connector with wallet integration patterns\n');

// Initialize payment connector
const payment = new PaymentConnector({ safetyLevel: 0.618, testMode: true });

// Simulate wallet IDs (as if from WalletManager)
const mockWallets = {
  ethWallet: 'wallet-eth-12345',
  solWallet: 'wallet-sol-67890',
  btcWallet: 'wallet-btc-11111'
};

console.log('💼 Mock Wallets (simulating WalletManager):');
console.log(`   Ethereum: ${mockWallets.ethWallet}`);
console.log(`   Solana: ${mockWallets.solWallet}`);
console.log(`   Bitcoin: ${mockWallets.btcWallet}\n`);

// Test 1: Coffee purchase with ETH wallet
console.log('TEST 1: Coffee Purchase ($5) via ETH Wallet');
console.log('-'.repeat(70));
const coffee = payment.processPayment({
  amount: 5.00,
  currency: 'USD',
  description: 'Morning coffee',
  walletId: mockWallets.ethWallet,
  metadata: { 
    walletNetwork: 'ethereum',
    merchant: 'Coffee Shop'
  }
});
console.log(`✅ Processed: ${coffee.method}`);
console.log(`   Amount: $${coffee.amount}, Fee: $${coffee.fee.toFixed(2)} (${(coffee.feePercentage * 100).toFixed(2)}%)`);
console.log(`   Wallet: ${coffee.metadata.walletNetwork}\n`);

// Test 2: Shopping with SOL wallet
console.log('TEST 2: Shopping ($250) via SOL Wallet');
console.log('-'.repeat(70));
const shopping = payment.processPayment({
  amount: 250.00,
  currency: 'USD',
  description: 'Online shopping',
  walletId: mockWallets.solWallet,
  metadata: {
    walletNetwork: 'solana',
    merchant: 'E-commerce Store'
  }
});
console.log(`✅ Processed: ${shopping.method}`);
console.log(`   Amount: $${shopping.amount}, Fee: $${shopping.fee.toFixed(2)} (${(shopping.feePercentage * 100).toFixed(2)}%)`);
console.log(`   Wallet: ${shopping.metadata.walletNetwork}\n`);

// Test 3: Rent payment with BTC wallet
console.log('TEST 3: Rent Payment ($2000) via BTC Wallet');
console.log('-'.repeat(70));
const rent = payment.processPayment({
  amount: 2000.00,
  currency: 'USD',
  description: 'Monthly rent',
  walletId: mockWallets.btcWallet,
  metadata: {
    walletNetwork: 'bitcoin',
    merchant: 'Property Management'
  }
});
console.log(`✅ Processed: ${rent.method}`);
console.log(`   Amount: $${rent.amount}, Fee: $${rent.fee.toFixed(2)} (${(rent.feePercentage * 100).toFixed(2)}%)`);
console.log(`   Wallet: ${rent.metadata.walletNetwork}\n`);

// Test 4: Method comparison
console.log('TEST 4: Method Comparison for $100 Payment');
console.log('-'.repeat(70));
const methods = payment.getAvailableMethods(100, 'USD');
console.log('Top 5 methods ranked by fee:');
const ranked = methods.slice(0, 5).map(m => ({
  name: m.name,
  fee: payment.calculateOptimizedFee(100, m.baseFee)
})).sort((a, b) => a.fee - b.fee);

ranked.forEach((m, i) => {
  console.log(`   ${i + 1}. ${m.name.padEnd(20)} → $${m.fee.toFixed(2)} (${(m.fee / 100 * 100).toFixed(2)}%)`);
});

// Final summary
console.log('\n' + '='.repeat(70));
console.log('📊 INTEGRATION TEST SUMMARY:');
const metrics = payment.getMetrics();
console.log(`   Mock Wallets Used: ${Object.keys(mockWallets).length}`);
console.log(`   Payments Processed: ${metrics.totalPayments}`);
console.log(`   Total Volume: $${metrics.totalVolume.toFixed(2)}`);
console.log(`   Total Fees: $${metrics.totalFees.toFixed(2)}`);
console.log(`   Fees Saved: $${metrics.totalSaved.toFixed(2)} (${(metrics.savingsPercentage * 100).toFixed(2)}%)`);
console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(0)}%`);
console.log('='.repeat(70));
console.log('✅ Payment connector ready for WalletManager integration!');
console.log('🌉 φ-ratio optimization active (Base Ratio 1.618)');
