/*
 * SOLIDARITY PLATFORM - WALLET + PAYMENT CONNECTOR INTEGRATION DEMO (SIMPLIFIED)
 * ==============================================================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const WalletManager = require('./wallet_manager');
const PaymentConnector = require('./payment_connector');

console.log('🚀 WALLET + PAYMENT CONNECTOR INTEGRATION DEMO');
console.log('='.repeat(70));
console.log('TRADEMARK: Scott Charles Olson - March 31, 1997\n');

// Initialize systems
const wallet = new WalletManager({ safetyLevel: 0.618, testMode: true });
const payment = new PaymentConnector({ safetyLevel: 0.618, testMode: true });

console.log('✅ Systems initialized with safety level 0.618 (OPTIMAL)\n');

// Create wallets
console.log('💼 Creating wallets:');
const ethWallet = wallet.createWallet({ network: 'ethereum', name: 'eth-wallet', type: 'hot' });
const solWallet = wallet.createWallet({ network: 'solana', name: 'sol-wallet', type: 'hot' });
const btcWallet = wallet.createWallet({ network: 'bitcoin', name: 'btc-wallet', type: 'cold' });

console.log(`   ✅ Created ${wallet.getSystemStatus().stats.totalWallets} wallets`);
console.log(`   📊 Networks: ${wallet.getSystemStatus().stats.activeNetworks.join(', ')}\n`);

// Process payments from different wallets
console.log('💳 Processing payments:\n');

// Coffee purchase
const coffee = payment.processPayment({
  amount: 5.00,
  currency: 'USD',
  description: 'Coffee',
  walletId: ethWallet.id,
  metadata: { walletNetwork: 'ethereum' }
});
console.log(`☕ $5 Coffee (${coffee.method}): Fee $${coffee.fee.toFixed(2)} → Wallet: ${coffee.metadata.walletNetwork}`);

// Shopping
const shopping = payment.processPayment({
  amount: 250.00,
  currency: 'USD',
  description: 'Shopping',
  walletId: solWallet.id,
  metadata: { walletNetwork: 'solana' }
});
console.log(`🛍️ $250 Shopping (${shopping.method}): Fee $${shopping.fee.toFixed(2)} → Wallet: ${shopping.metadata.walletNetwork}`);

// Rent payment
const rent = payment.processPayment({
  amount: 2000.00,
  currency: 'USD',
  description: 'Rent',
  walletId: btcWallet.id,
  metadata: { walletNetwork: 'bitcoin' }
});
console.log(`🏠 $2000 Rent (${rent.method}): Fee $${rent.fee.toFixed(2)} → Wallet: ${rent.metadata.walletNetwork}`);

// Summary
const metrics = payment.getMetrics();
console.log('\n' + '='.repeat(70));
console.log('📊 INTEGRATION SUMMARY:');
console.log(`   Wallets: ${wallet.getSystemStatus().stats.totalWallets} across ${wallet.getSystemStatus().stats.activeNetworks.length} networks`);
console.log(`   Payments: ${metrics.totalPayments} processed`);
console.log(`   Volume: $${metrics.totalVolume.toFixed(2)}`);
console.log(`   Fees: $${metrics.totalFees.toFixed(2)} (saved $${metrics.totalSaved.toFixed(2)})`);
console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(0)}%`);
console.log('='.repeat(70));
console.log('✅ Integration successful! φ-optimization active (Base Ratio 1.618)');
