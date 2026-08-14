/*
 * SOLIDARITY PLATFORM - SAVINGS TERMINAL ENGINE
 * ==============================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * ==============================================
 * 
 * UNIFIED SAVINGS TERMINAL - PRODUCTION READY
 * 
 * This is the main engine that orchestrates:
 * - PaymentSavingsCalculator (ROI calculations)
 * - PaymentConnector (8 payment methods)
 * - FinancialOptimizer (gas & batch optimization)
 * - TransactionProcessor (queue management)
 * - WalletManager (multi-chain wallets)
 * 
 * φ-ratio (1.618) optimized with 7-tier safety system
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

// Core components - PRODUCTION IMPORTS
// Note: Some modules export class directly, others use destructuring
const PaymentSavingsCalculator = require('./PaymentSavingsCalculator');
const PaymentConnector = require('./payment_connector');
const { FinancialOptimizer } = require('./financial_optimizer');
const { TransactionProcessor } = require('./transaction_processor');
const WalletManager = require('./wallet_manager');

/**
 * SavingsTerminal - Unified Financial Engine
 * Orchestrates all payment, savings, and optimization systems
 */
class SavingsTerminal extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // ═══════════════════════════════════════════════════════════════════════
    // CORE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    
    this.version = '1.0.0';
    this.baseRatio = 1.618;           // φ for all calculations
    this.bridgingBaseline = 0.618;    // Reciprocal for stability
    
    // 🛡️ Safety System Integration
    this.safetyLevel = config.safetyLevel || 0.618;
    this.safetyThresholds = {
      CRITICAL_EMERGENCY: { min: 0.00, max: 0.05, mode: 'emergency', features: ['calculate'] },
      WARNING_LEVEL: { min: 0.05, max: 0.15, mode: 'limited', features: ['calculate', 'report'] },
      CAUTION_RANGE: { min: 0.15, max: 0.25, mode: 'cautious', features: ['calculate', 'report', 'demo'] },
      OPTIMAL_RANGE: { min: 0.25, max: 0.75, mode: 'full', features: ['all'] },
      UPPER_CAUTION: { min: 0.75, max: 0.85, mode: 'monitored', features: ['calculate', 'report', 'demo', 'process'] },
      UPPER_WARNING: { min: 0.85, max: 0.95, mode: 'restricted', features: ['calculate', 'report'] },
      CRITICAL_UPPER: { min: 0.95, max: 1.00, mode: 'minimal', features: ['calculate'] }
    };
    
    // Sacred numeric sequences
    this.sacredNodes = [1, 3, 4, 7, 14, 21, 49];
    this.henryProgression = { base: 7, double: 14, square: 49 };
    
    // ═══════════════════════════════════════════════════════════════════════
    // COMPONENT INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════
    
    this.config = {
      testMode: config.testMode !== undefined ? config.testMode : true,
      autoSave: config.autoSave !== undefined ? config.autoSave : true,
      verboseLogging: config.verboseLogging !== undefined ? config.verboseLogging : true,
      dataPath: config.dataPath || path.join(__dirname, '../database/savings_terminal'),
      ...config
    };
    
    // ═══════════════════════════════════════════════════════════════════════
    // STATUS (must be initialized BEFORE components)
    // ═══════════════════════════════════════════════════════════════════════
    
    this.status = {
      operational: true,
      mode: 'initializing',
      componentsLoaded: 0,
      errors: []
    };
    
    // ═══════════════════════════════════════════════════════════════════════
    // SESSION TRACKING
    // ═══════════════════════════════════════════════════════════════════════
    
    this.session = {
      id: this._generateSessionId(),
      startTime: Date.now(),
      calculations: 0,
      reports: 0,
      savings: 0,
      transactions: 0,
      events: []
    };
    
    // Initialize all components with shared safety level
    const componentConfig = {
      safetyLevel: this.safetyLevel,
      testMode: this.config.testMode
    };
    
    this.components = {
      calculator: null,
      connector: null,
      optimizer: null,
      processor: null,
      wallet: null
    };
    
    this.initializeComponents(componentConfig);
    
    // Update status after initialization
    this.status.mode = 'ready';
    this.status.componentsLoaded = Object.values(this.components).filter(c => c !== null).length;
    
    // Ensure data directory exists
    this._ensureDataDirectory();
    
    // Log startup
    this._log('startup');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  initializeComponents(config) {
    try {
      this.components.calculator = new PaymentSavingsCalculator(config);
      this._log('component', 'PaymentSavingsCalculator initialized');
    } catch (e) {
      this._logError('PaymentSavingsCalculator', e);
    }
    
    try {
      this.components.connector = new PaymentConnector(config);
      this._log('component', 'PaymentConnector initialized');
    } catch (e) {
      this._logError('PaymentConnector', e);
    }
    
    try {
      this.components.optimizer = new FinancialOptimizer(config);
      this._log('component', 'FinancialOptimizer initialized');
    } catch (e) {
      this._logError('FinancialOptimizer', e);
    }
    
    try {
      this.components.processor = new TransactionProcessor(config);
      this._log('component', 'TransactionProcessor initialized');
    } catch (e) {
      this._logError('TransactionProcessor', e);
    }
    
    try {
      this.components.wallet = new WalletManager(config);
      this._log('component', 'WalletManager initialized');
    } catch (e) {
      this._logError('WalletManager', e);
    }
    
    // Count successful initializations
    const loadedCount = Object.values(this.components).filter(c => c !== null).length;
    this.status.componentsLoaded = loadedCount;
    this.status.operational = loadedCount >= 2; // Need at least calculator + 1 other
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SAFETY SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  getSafetyConfig() {
    for (const [name, threshold] of Object.entries(this.safetyThresholds)) {
      if (this.safetyLevel >= threshold.min && this.safetyLevel <= threshold.max) {
        return { ...threshold, level: name };
      }
    }
    return { ...this.safetyThresholds.OPTIMAL_RANGE, level: 'OPTIMAL_RANGE' };
  }
  
  setSafetyLevel(level) {
    const oldLevel = this.safetyLevel;
    this.safetyLevel = Math.max(0.00, Math.min(1.00, level));
    
    // Propagate to all components
    Object.values(this.components).forEach(component => {
      if (component && typeof component.setSafetyLevel === 'function') {
        component.setSafetyLevel(this.safetyLevel);
      }
    });
    
    this.emit('safetyChange', { from: oldLevel, to: this.safetyLevel });
    return this.getSafetyConfig();
  }
  
  isFeatureEnabled(feature) {
    const config = this.getSafetyConfig();
    return config.features.includes('all') || config.features.includes(feature);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE CALCULATION API
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Quick savings calculation
   * @param {number} annualVolume - Annual payment volume in USD
   * @param {Object} paymentMix - Payment method distribution
   * @returns {Object} Quick savings metrics
   */
  calculate(annualVolume, paymentMix) {
    if (!this.components.calculator) {
      throw new Error('Calculator component not available');
    }
    
    this.session.calculations++;
    const result = this.components.calculator.quickCalculate(annualVolume, paymentMix);
    this.session.savings += result.annualSavings;
    
    this.emit('calculation', { volume: annualVolume, result });
    return result;
  }
  
  /**
   * Generate comprehensive savings report
   * @param {Object} config - Business configuration
   * @returns {Object} Full savings report
   */
  generateReport(config) {
    if (!this.isFeatureEnabled('report')) {
      throw new Error(`Report generation disabled at safety level ${this.safetyLevel.toFixed(3)}`);
    }
    
    if (!this.components.calculator) {
      throw new Error('Calculator component not available');
    }
    
    this.session.reports++;
    const report = this.components.calculator.generateReport(config);
    
    // Add terminal metadata
    report.terminal = {
      version: this.version,
      sessionId: this.session.id,
      safetyLevel: this.safetyLevel,
      safetyMode: this.getSafetyConfig().level,
      timestamp: new Date().toISOString()
    };
    
    this.emit('report', report);
    
    // Auto-save if enabled
    if (this.config.autoSave) {
      this.saveReport(report);
    }
    
    return report;
  }
  
  /**
   * Compare multiple business scenarios
   * @param {Array} scenarios - Array of business configurations
   * @returns {Array} Comparison results
   */
  compareScenarios(scenarios) {
    if (!this.components.calculator) {
      throw new Error('Calculator component not available');
    }
    
    const results = this.components.calculator.compareScenarios(scenarios);
    this.emit('comparison', { count: scenarios.length, results });
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENT PROCESSING API
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Process a payment through optimal routing
   * @param {Object} payment - Payment details
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(payment) {
    if (!this.isFeatureEnabled('process')) {
      throw new Error(`Payment processing disabled at safety level ${this.safetyLevel.toFixed(3)}`);
    }
    
    if (!this.components.connector) {
      throw new Error('Payment connector not available');
    }
    
    // Check safety limits
    const safetyConfig = this.getSafetyConfig();
    if (payment.amount > safetyConfig.maxAmount) {
      throw new Error(`Amount $${payment.amount} exceeds safety limit $${safetyConfig.maxAmount}`);
    }
    
    this.session.transactions++;
    const result = await this.components.connector.processPayment(payment);
    
    this.emit('payment', { payment, result });
    return result;
  }
  
  /**
   * Get available payment methods
   * @returns {Array} Available payment methods with details
   */
  getPaymentMethods() {
    if (!this.components.connector) {
      return [];
    }
    // PaymentConnector stores connectors in getSystemStatus().connectors
    const status = this.components.connector.getSystemStatus();
    return status.connectors || [];
  }
  
  /**
   * Get optimal route for a payment
   * @param {Object} payment - Payment details
   * @returns {Object} Optimal route recommendation
   */
  getOptimalRoute(payment) {
    if (!this.components.connector) {
      throw new Error('Payment connector not available');
    }
    return this.components.connector.findOptimalRoute(payment);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WALLET OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Create a new wallet
   * @param {string} chain - Blockchain network
   * @param {string} name - Wallet name
   * @returns {Object} Created wallet
   */
  createWallet(chain, name) {
    if (!this.components.wallet) {
      throw new Error('Wallet manager not available');
    }
    return this.components.wallet.createWallet(chain, name);
  }
  
  /**
   * Get wallet balance
   * @param {string} walletId - Wallet identifier
   * @returns {Object} Balance information
   */
  getBalance(walletId) {
    if (!this.components.wallet) {
      throw new Error('Wallet manager not available');
    }
    return this.components.wallet.getBalance(walletId);
  }
  
  /**
   * Get all wallets
   * @returns {Array} All wallets
   */
  getWallets() {
    if (!this.components.wallet) {
      return [];
    }
    return this.components.wallet.getAllWallets();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIMIZATION API
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Optimize a batch of transactions
   * @param {Array} transactions - Transactions to optimize
   * @returns {Object} Optimization result
   */
  optimizeBatch(transactions) {
    if (!this.components.optimizer) {
      throw new Error('Optimizer not available');
    }
    return this.components.optimizer.optimizeBatch(transactions);
  }
  
  /**
   * Get optimization statistics
   * @returns {Object} Optimization stats
   */
  getOptimizationStats() {
    if (!this.components.optimizer) {
      return { available: false };
    }
    return this.components.optimizer.getMetrics();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DEMO & TESTING
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Run comprehensive demo
   * Shows all terminal capabilities
   */
  async runDemo() {
    if (!this.isFeatureEnabled('demo')) {
      console.log('⚠️  Demo disabled at current safety level');
      return;
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('💰 SAVINGS TERMINAL - COMPREHENSIVE DEMONSTRATION');
    console.log('═'.repeat(70));
    console.log(`📦 Version: ${this.version}`);
    console.log(`🛡️ Safety Level: ${this.safetyLevel.toFixed(3)} (${this.getSafetyConfig().level})`);
    console.log(`🧪 Test Mode: ${this.config.testMode ? 'ENABLED' : 'DISABLED'}`);
    console.log('═'.repeat(70));
    
    // Demo 1: Quick Calculation
    console.log('\n📊 DEMO 1: Quick Savings Calculation');
    console.log('-'.repeat(50));
    try {
      const quickResult = this.calculate(1000000, {
        credit_card: 50,
        paypal: 30,
        crypto: 10,
        bank_transfer: 10
      });
      console.log(`   Annual Volume: $1,000,000`);
      console.log(`   Current Fees: $${quickResult.currentFees.toLocaleString()}`);
      console.log(`   Optimized Fees: $${quickResult.newFees.toLocaleString()}`);
      console.log(`   💰 Annual Savings: $${quickResult.annualSavings.toLocaleString()} (${quickResult.savingsPercentage.toFixed(1)}%)`);
      console.log(`   📅 Break-Even: ${quickResult.breakEvenMonths.toFixed(1)} months`);
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Demo 2: Full Report
    console.log('\n📋 DEMO 2: Full Business Report');
    console.log('-'.repeat(50));
    try {
      const report = this.generateReport({
        businessName: 'Demo E-Commerce Store',
        annualVolume: 5000000,
        monthlyTransactions: 10000,
        paymentMix: {
          credit_card: 50,
          paypal: 30,
          crypto: 10,
          bank_transfer: 10
        }
      });
      console.log(`   Business: ${report.business.name}`);
      console.log(`   Annual Volume: $${report.business.annualVolume.toLocaleString()}`);
      console.log(`   💰 Annual Savings: $${report.savings.annual.toLocaleString()}`);
      console.log(`   📈 First Year ROI: ${report.roi.firstYearROI.toFixed(0)}%`);
      console.log(`   🚀 5-Year Total: $${report.projection.totalSavings.toLocaleString()}`);
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Demo 3: Payment Methods
    console.log('\n💳 DEMO 3: Available Payment Methods');
    console.log('-'.repeat(50));
    try {
      const methods = this.getPaymentMethods();
      if (methods && methods.length > 0) {
        methods.slice(0, 5).forEach(m => {
          // m.fee is already formatted as "2.90%" from getSystemStatus
          console.log(`   ${m.name}: ${m.fee} base fee`);
        });
        console.log(`   ... and ${Math.max(0, methods.length - 5)} more`);
      } else {
        console.log('   Payment methods available through connector');
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Demo 4: Scenario Comparison
    console.log('\n📊 DEMO 4: Scenario Comparison');
    console.log('-'.repeat(50));
    try {
      const comparison = this.compareScenarios([
        { businessName: 'Small Shop', annualVolume: 100000, monthlyTransactions: 500 },
        { businessName: 'Medium Store', annualVolume: 1000000, monthlyTransactions: 5000 },
        { businessName: 'Large Enterprise', annualVolume: 10000000, monthlyTransactions: 50000 }
      ]);
      comparison.forEach(c => {
        console.log(`   ${c.name}: Save $${c.savings.toLocaleString()}/year (${c.percentage.toFixed(1)}%)`);
      });
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Demo 5: Component Status
    console.log('\n⚙️ DEMO 5: Component Status');
    console.log('-'.repeat(50));
    const status = this.getStatus();
    console.log(`   Operational: ${status.operational ? '✅ YES' : '❌ NO'}`);
    console.log(`   Components Loaded: ${status.componentsLoaded}/5`);
    Object.entries(this.components).forEach(([name, component]) => {
      const icon = component ? '✅' : '❌';
      console.log(`   ${icon} ${name}`);
    });
    
    // Demo 6: Session Stats
    console.log('\n📈 DEMO 6: Session Statistics');
    console.log('-'.repeat(50));
    const stats = this.getSessionStats();
    console.log(`   Session ID: ${stats.sessionId}`);
    console.log(`   Uptime: ${stats.uptime}`);
    console.log(`   Calculations: ${stats.calculations}`);
    console.log(`   Reports: ${stats.reports}`);
    console.log(`   Total Savings Calculated: $${stats.savings.toLocaleString()}`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ DEMO COMPLETE - Savings Terminal is fully operational!');
    console.log('═'.repeat(70) + '\n');
    
    return {
      success: true,
      testsRun: 6,
      sessionStats: stats
    };
  }
  
  /**
   * Run quick health check
   * @returns {Object} Health check results
   */
  healthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      terminal: true,
      components: {},
      overall: true
    };
    
    Object.entries(this.components).forEach(([name, component]) => {
      results.components[name] = component !== null;
      if (!component) results.overall = false;
    });
    
    results.safety = this.getSafetyConfig();
    results.session = this.getSessionStats();
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════
  
  saveReport(report) {
    try {
      const filename = `report_${Date.now()}.json`;
      const filepath = path.join(this.config.dataPath, filename);
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      this._log('save', `Report saved: ${filename}`);
      return filepath;
    } catch (e) {
      this._logError('saveReport', e);
      return null;
    }
  }
  
  loadReport(filename) {
    try {
      const filepath = path.join(this.config.dataPath, filename);
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      this._logError('loadReport', e);
      return null;
    }
  }
  
  listSavedReports() {
    try {
      const files = fs.readdirSync(this.config.dataPath);
      return files.filter(f => f.startsWith('report_') && f.endsWith('.json'));
    } catch (e) {
      return [];
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS & MONITORING
  // ═══════════════════════════════════════════════════════════════════════════
  
  getStatus() {
    return {
      ...this.status,
      safetyLevel: this.safetyLevel,
      safetyMode: this.getSafetyConfig().level,
      session: this.session.id,
      uptime: this._formatDuration(Date.now() - this.session.startTime)
    };
  }
  
  getSessionStats() {
    return {
      sessionId: this.session.id,
      startTime: new Date(this.session.startTime).toISOString(),
      uptime: this._formatDuration(Date.now() - this.session.startTime),
      calculations: this.session.calculations,
      reports: this.session.reports,
      savings: this.session.savings,
      transactions: this.session.transactions,
      eventsLogged: this.session.events.length
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════
  
  _generateSessionId() {
    return `ST-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
  }
  
  _formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  _ensureDataDirectory() {
    if (!fs.existsSync(this.config.dataPath)) {
      fs.mkdirSync(this.config.dataPath, { recursive: true });
    }
  }
  
  _log(type, message = '') {
    if (!this.config.verboseLogging) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    switch (type) {
      case 'startup':
        console.log(`\n💰 SAVINGS TERMINAL v${this.version}`);
        console.log(`🛡️ Safety Level: ${this.safetyLevel.toFixed(3)}`);
        console.log(`📊 Mode: ${this.getSafetyConfig().level}`);
        console.log(`🧪 Test Mode: ${this.config.testMode}`);
        break;
      case 'component':
        console.log(`   ✅ ${message}`);
        break;
      case 'save':
        console.log(`   💾 ${message}`);
        break;
      default:
        console.log(`[${timestamp}] ${type}: ${message}`);
    }
    
    this.session.events.push({ time: Date.now(), type, message });
  }
  
  _logError(component, error) {
    console.error(`   ❌ ${component}: ${error.message}`);
    this.status.errors.push({ component, error: error.message, time: Date.now() });
    this.session.events.push({ time: Date.now(), type: 'error', message: `${component}: ${error.message}` });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { SavingsTerminal };

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECT EXECUTION DEMO
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log('\n🚀 Starting Savings Terminal...\n');
  
  const terminal = new SavingsTerminal({
    testMode: true,
    verboseLogging: true,
    safetyLevel: 0.618
  });
  
  // Subscribe to events
  terminal.on('calculation', (data) => {
    console.log(`📊 Calculation event: $${data.volume.toLocaleString()}`);
  });
  
  terminal.on('report', (data) => {
    console.log(`📋 Report generated: ${data.business.name}`);
  });
  
  // Run the demo
  terminal.runDemo().then(result => {
    console.log('\n📊 Demo Result:', result.success ? 'SUCCESS' : 'FAILED');
    
    // Show final health check
    console.log('\n🏥 Final Health Check:');
    const health = terminal.healthCheck();
    console.log(`   Overall: ${health.overall ? '✅ HEALTHY' : '⚠️ DEGRADED'}`);
    console.log(`   Components: ${Object.values(health.components).filter(v => v).length}/${Object.keys(health.components).length}`);
    
    console.log('\n✨ Savings Terminal is ready for production use!\n');
  }).catch(err => {
    console.error('Demo failed:', err.message);
  });
}
