# Payment Connector System

## Overview

The Payment Connector System provides unified access to multiple payment methods with φ-based fee optimization and safety-integrated routing.

## Features

### 🔌 Multiple Payment Connectors
- **Cryptocurrency**: BTC, ETH, SOL, USDT, USDC (0.1% base fee)
- **Stablecoin**: USDT, USDC, DAI, BUSD (0.05% base fee)
- **Credit Card**: Visa, Mastercard, Amex, Discover (2.9% base fee)
- **Debit Card**: Visa, Mastercard (1.5% base fee)
- **Bank Transfer**: ACH, Wire (0.5% base fee)
- **Lightning Network**: BTC instant payments (0.01% base fee)
- **PayPal**: PayPal Balance, PayPal Credit (3.4% base fee)
- **Venmo**: Venmo Balance (3% base fee)

### ⚖️ φ-Ratio Fee Optimization
- Automatic fee optimization using golden ratio (φ = 1.618)
- Larger amounts get better rates through economies of scale
- Smart routing to lowest-fee options

### 🛡️ Safety System Integration
- 7-tier safety thresholds control payment limits
- Amount caps based on current safety level
- Method restrictions for critical safety levels

### 🎯 Smart Auto-Routing
- Automatically selects best payment method
- Considers fees, processing time, and preferences
- Recommendation system for optimal user experience

## Installation

```bash
npm install
```

## Usage

### Basic Payment Processing

```javascript
const PaymentConnector = require('./financial_systems/payment_connector.js');

// Initialize connector
const connector = new PaymentConnector({
  testMode: true,
  safetyLevel: 0.618,
  enableFeeOptimization: true,
  autoRouting: true
});

// Process payment
const result = await connector.processPayment({
  amount: 100,
  currency: 'USD',
  method: 'crypto', // Optional - auto-routes if omitted
  metadata: { orderId: 'ORD-12345' }
});

console.log(result);
// {
//   success: true,
//   paymentId: 'pay_1639...',
//   status: 'completed',
//   amount: 100,
//   fee: 0.05,
//   method: 'Cryptocurrency',
//   timestamp: '2025-12-19T...'
// }
```

### Get Available Payment Methods

```javascript
// Get methods for specific amount
const methods = connector.getAvailableMethods(500, 'USD');

methods.forEach(method => {
  console.log(`${method.name}: $${method.fee.toFixed(2)} (${method.feePercentage}%)`);
});
```

### Check Payment Status

```javascript
// Get payment status
const status = connector.getPaymentStatus('pay_1639...');

if (status.found) {
  console.log(`Status: ${status.status}`);
  console.log(`Amount: $${status.amount}`);
  console.log(`Fee: $${status.fee}`);
}
```

### Payment History

```javascript
// Get all payments
const history = connector.getPaymentHistory();

// Filter by method
const cryptoPayments = connector.getPaymentHistory({ method: 'crypto' });

// Filter by amount range
const largePayments = connector.getPaymentHistory({
  minAmount: 1000,
  maxAmount: 10000
});
```

## Safety System

The payment connector integrates with Solidarity's 7-tier safety system:

| Safety Level | Range | Max Amount | Allowed Methods |
|-------------|-------|------------|-----------------|
| CRITICAL_EMERGENCY | 0.00-0.05 | $10 | crypto only |
| WARNING_LEVEL | 0.05-0.15 | $100 | crypto, stablecoin |
| CAUTION_RANGE | 0.15-0.25 | $1,000 | crypto, stablecoin, bank |
| OPTIMAL_RANGE | 0.25-0.75 | $10,000 | all methods |
| UPPER_CAUTION | 0.75-0.85 | $5,000 | all methods |
| UPPER_WARNING | 0.85-0.95 | $1,000 | crypto, stablecoin, bank |
| CRITICAL_UPPER | 0.95-1.00 | $100 | crypto only |

### Adjusting Safety Level

```javascript
// Set safety level
connector.safetyLevel = 0.85;

// Check current safety config
const config = connector.getSafetyConfig();
console.log(`Safety Level: ${config.level}`);
console.log(`Max Amount: $${config.maxAmount}`);
```

## Fee Optimization

### φ-Based Calculation

The system uses the golden ratio (φ = 1.618) to optimize fees:

```javascript
// Formula
const phiAdjustment = 1 / (1 + Math.log10(amount) / 1.618);
const optimizedRate = baseFeeRate * phiAdjustment;
const fee = amount * optimizedRate;
```

### Savings Example

```
Amount: $1000
Base Fee Rate: 2.9% (credit card)
Standard Fee: $29.00
Optimized Fee: $23.47
Savings: $5.53 (19% reduction)
```

## Auto-Routing Logic

The system automatically selects the best payment method based on:

1. **Safety Level**: Only methods allowed at current safety level
2. **Amount Limits**: Method must support the payment amount
3. **Fee Optimization**: Lowest φ-optimized fee
4. **User Preferences**: Preferred methods get priority
5. **Processing Time**: Instant methods preferred for small amounts
6. **Recommendations**: Crypto for large amounts, cards for small

## API Reference

### Constructor

```javascript
new PaymentConnector(config)
```

**Options:**
- `testMode` (boolean): Enable test mode (default: true)
- `safetyLevel` (number): Initial safety level 0-1 (default: 0.618)
- `enableFeeOptimization` (boolean): Enable φ-ratio optimization (default: true)
- `autoRouting` (boolean): Auto-select best method (default: true)
- `preferredMethods` (array): Preferred payment methods

### Methods

#### `getAvailableMethods(amount, currency)`
Get available payment methods for an amount.

**Returns:** Array of method objects with fees and details.

#### `processPayment(paymentDetails)`
Process a payment.

**Parameters:**
- `amount` (number): Payment amount
- `currency` (string): Currency code (default: 'USD')
- `method` (string): Payment method ID (optional, auto-routes if omitted)
- `metadata` (object): Additional payment metadata

**Returns:** Promise with payment result.

#### `getPaymentStatus(paymentId)`
Get status of a payment.

**Returns:** Payment status object.

#### `getPaymentHistory(filters)`
Get payment history with optional filters.

**Filters:**
- `method` (string): Filter by payment method
- `status` (string): Filter by status
- `minAmount` (number): Minimum amount
- `maxAmount` (number): Maximum amount

**Returns:** Array of payment records.

#### `getMetrics()`
Get payment system metrics.

**Returns:** Metrics object with volume, fees, success rate, etc.

#### `getSystemStatus()`
Get comprehensive system status.

**Returns:** Status object with all connectors and metrics.

## Testing

Run the demo:

```bash
node financial_systems/payment_connector.js
```

Expected output shows:
- Small payment ($50) processing
- Medium payment ($500) with stablecoin
- Large payment ($5000) with auto-routing
- Complete metrics and fee savings

## Integration with Wallet Manager

```javascript
const WalletManager = require('./financial_systems/wallet_manager.js');
const PaymentConnector = require('./financial_systems/payment_connector.js');

// Initialize both systems
const wallet = new WalletManager({ safetyLevel: 0.618 });
const payments = new PaymentConnector({ safetyLevel: 0.618 });

// Create wallet
wallet.createWallet('ethereum', { name: 'Main Wallet' });

// Process payment from wallet
const result = await payments.processPayment({
  amount: 100,
  currency: 'USD',
  method: 'crypto',
  metadata: { walletId: 'wallet_123' }
});
```

## Configuration

Payment connector respects these config files:
- `config/financial_config.json` - Financial system settings
- `PROJECT_CONFIG.json` - Owner/trademark metadata

## Security

- All payments start in test mode by default
- Safety system prevents excessive transactions
- Fee optimization prevents overpayment
- Transaction history maintained for audit

## Metrics

Track performance:
- Total payments processed
- Success rate
- Total volume and fees
- Fee savings from optimization
- Average processing time per method

## Troubleshooting

### Payment Exceeds Safety Limit
```
Error: Amount exceeds safety limit: 1000
```
**Solution:** Increase safety level or split into smaller payments.

### No Payment Methods Available
```
Error: No payment methods available for this amount and safety level
```
**Solution:** Adjust amount or safety level to match available methods.

### Method Not Supported
```
Error: Payment method 'crypto' not available
```
**Solution:** Check available methods with `getAvailableMethods()` first.

## License

See [LICENSE](../LICENSE) file.

---

**TRADEMARKED BY SCOTT CHARLES OLSON**
**Base Ratio (φ = 1.618) · Safety Integration · Fee Optimization**
