/*
 * SOLIDARITY PLATFORM - PAYMENT SAVINGS CALCULATOR
 * =================================================
 * 
 * Streamlined, production-ready ROI calculator for payment optimization
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const PaymentConnector = require('./payment_connector');

/**
 * PaymentSavingsCalculator - Production-ready ROI calculator
 * 
 * Simple API for calculating payment processing savings using φ-ratio optimization.
 * Perfect for sales demos, web calculators, and customer proposals.
 */
class PaymentSavingsCalculator {
  // ═════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR & CONFIGURATION
  // ═════════════════════════════════════════════════════════════════════════

  constructor() {
    // Initialize payment connector
    this.connector = new PaymentConnector();
    
    // Mathematical constants (φ-ratio system)
    this.PHI = 1.618;
    this.BASELINE = 0.618;
    
    // 🛡️ Safety Thresholds Integration (7-tier system)
    this.safetyLevel = 0.618; // Default to bridging baseline
    this.SAFETY_THRESHOLDS = {
      CRITICAL_EMERGENCY: { min: 0.00, max: 0.05, discount: 0.05, mode: 'minimal' },
      WARNING_LEVEL: { min: 0.05, max: 0.15, discount: 0.15, mode: 'conservative' },
      CAUTION_RANGE: { min: 0.15, max: 0.25, discount: 0.25, mode: 'standard' },
      OPTIMAL_RANGE: { min: 0.25, max: 0.75, discount: 0.40, mode: 'aggressive' },
      UPPER_CAUTION: { min: 0.75, max: 0.85, discount: 0.30, mode: 'standard' },
      UPPER_WARNING: { min: 0.85, max: 0.95, discount: 0.20, mode: 'conservative' },
      CRITICAL_UPPER: { min: 0.95, max: 1.00, discount: 0.10, mode: 'minimal' }
    };
    
    // Industry standard fee rates (%)
    this.INDUSTRY_RATES = {
      credit_card: 2.9,
      debit_card: 1.5,
      paypal: 3.4,
      venmo: 3.0,
      crypto: 0.1,
      stablecoin: 0.05,
      bank_transfer: 0.5,
      lightning: 0.01
    };
    
    // Default implementation cost
    this.IMPLEMENTATION_COST = 5000;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SAFETY CONFIGURATION
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Get current safety configuration based on safety level
   * @returns {Object} Current safety threshold config
   */
  getSafetyConfig() {
    for (const [name, threshold] of Object.entries(this.SAFETY_THRESHOLDS)) {
      if (this.safetyLevel >= threshold.min && this.safetyLevel <= threshold.max) {
        return { ...threshold, level: name };
      }
    }
    return { ...this.SAFETY_THRESHOLDS.OPTIMAL_RANGE, level: 'OPTIMAL_RANGE' };
  }

  /**
   * Set safety level (0.00 - 1.00)
   * @param {number} level - Safety level
   */
  setSafetyLevel(level) {
    this.safetyLevel = Math.max(0.00, Math.min(1.00, level));
    const config = this.getSafetyConfig();
    console.log(`🛡️ Safety Level: ${this.safetyLevel.toFixed(3)} - ${config.level} (${config.mode})`);
    return config;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate traditional payment fees (without optimization)
   * @param {number} annualVolume - Total annual payment volume ($)
   * @param {Object} paymentMix - Percentage distribution of payment methods
   * @returns {number} Total annual fees
   */
  calculateTraditionalFees(annualVolume, paymentMix) {
    let totalFees = 0;
    
    for (const [method, percentage] of Object.entries(paymentMix)) {
      const methodVolume = annualVolume * (percentage / 100);
      const rate = this.INDUSTRY_RATES[method] || 2.9;
      totalFees += methodVolume * (rate / 100);
    }
    
    return totalFees;
  }

  /**
   * Calculate optimized fees using φ-ratio optimization with safety thresholds
   * @param {number} annualVolume - Total annual payment volume ($)
   * @param {Object} paymentMix - Percentage distribution of payment methods
   * @param {number} safetyLevel - Optional safety level override (0.00 - 1.00)
   * @returns {number} Total annual fees with optimization
   */
  calculateOptimizedFees(annualVolume, paymentMix, safetyLevel = null) {
    let totalFees = 0;
    
    // Use provided safety level or instance default
    const effectiveSafetyLevel = safetyLevel !== null ? safetyLevel : this.safetyLevel;
    
    // Get safety configuration
    let safetyConfig = this.SAFETY_THRESHOLDS.OPTIMAL_RANGE;
    for (const [name, threshold] of Object.entries(this.SAFETY_THRESHOLDS)) {
      if (effectiveSafetyLevel >= threshold.min && effectiveSafetyLevel <= threshold.max) {
        safetyConfig = { ...threshold, level: name };
        break;
      }
    }
    
    // Calculate safety multiplier (higher discount = lower fees)
    const safetyMultiplier = 1 - (safetyConfig.discount * effectiveSafetyLevel);
    
    for (const [method, percentage] of Object.entries(paymentMix)) {
      const methodVolume = annualVolume * (percentage / 100);
      const baseRate = this.INDUSTRY_RATES[method] || 2.9;
      
      // Apply φ-ratio optimization formula with safety threshold
      const phiOptimization = 1 / (1 + Math.log10(methodVolume) / this.PHI);
      const optimizedRate = baseRate * phiOptimization * safetyMultiplier;
      totalFees += methodVolume * (optimizedRate / 100);
    }
    
    return totalFees;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORT GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate comprehensive savings report
   * @param {Object} config - Business configuration
   * @returns {Object} Complete savings analysis
   */
  generateReport(config) {
    // Extract configuration
    const {
      businessName = 'Your Business',
      annualVolume,
      monthlyTransactions,
      paymentMix = { credit_card: 50, paypal: 30, crypto: 10, bank_transfer: 10 },
      implementationCost = this.IMPLEMENTATION_COST,
      projectionYears = 5,
      annualGrowthRate = 0.10,
      safetyLevel = this.safetyLevel
    } = config;

    // Apply safety level if provided
    if (safetyLevel !== this.safetyLevel) {
      this.setSafetyLevel(safetyLevel);
    }
    
    // Get current safety configuration
    const safetyConfig = this.getSafetyConfig();

    // Calculate base fees
    const traditionalFees = this.calculateTraditionalFees(annualVolume, paymentMix);
    const optimizedFees = this.calculateOptimizedFees(annualVolume, paymentMix, safetyLevel);
    const annualSavings = traditionalFees - optimizedFees;
    const savingsPercentage = (annualSavings / traditionalFees) * 100;

    // Monthly calculations
    const monthlySavings = annualSavings / 12;
    const avgTransaction = annualVolume / (monthlyTransactions * 12);
    const savingsPerTransaction = annualSavings / (monthlyTransactions * 12);

    // Break-even analysis
    const breakEvenMonths = implementationCost / monthlySavings;

    // Multi-year projection
    const projection = this.calculateProjection(
      annualVolume, 
      paymentMix, 
      projectionYears, 
      annualGrowthRate
    );

    return {
      business: {
        name: businessName,
        annualVolume,
        monthlyTransactions,
        avgTransaction,
        paymentMix
      },
      fees: {
        traditional: traditionalFees,
        optimized: optimizedFees,
        difference: annualSavings,
        percentage: savingsPercentage
      },
      savings: {
        annual: annualSavings,
        monthly: monthlySavings,
        perTransaction: savingsPerTransaction
      },
      roi: {
        implementationCost,
        breakEvenMonths,
        breakEvenDays: Math.ceil(breakEvenMonths * 30),
        firstYearROI: ((annualSavings - implementationCost) / implementationCost) * 100
      },
      projection: {
        years: projectionYears,
        growthRate: annualGrowthRate,
        yearlyBreakdown: projection.yearly,
        totalSavings: projection.total
      },
      safety: {
        level: this.safetyLevel,
        threshold: safetyConfig.level,
        mode: safetyConfig.mode,
        discount: safetyConfig.discount,
        multiplier: 1 - (safetyConfig.discount * this.safetyLevel)
      },
      benefits: this.calculateBenefits(annualSavings, annualVolume)
    };
  }

  /**
   * Calculate multi-year savings projection
   */
  calculateProjection(baseVolume, paymentMix, years, growthRate) {
    const yearly = [];
    let totalSavings = 0;
    let currentVolume = baseVolume;

    for (let year = 1; year <= years; year++) {
      const traditionalFees = this.calculateTraditionalFees(currentVolume, paymentMix);
      const optimizedFees = this.calculateOptimizedFees(currentVolume, paymentMix);
      const savings = traditionalFees - optimizedFees;
      
      yearly.push({
        year,
        volume: currentVolume,
        savings,
        cumulative: totalSavings + savings
      });
      
      totalSavings += savings;
      currentVolume *= (1 + growthRate);
    }

    return { yearly, total: totalSavings };
  }

  /**
   * Calculate practical benefits from savings
   */
  calculateBenefits(annualSavings, annualVolume) {
    return {
      employeesAffordable: Math.floor(annualSavings / 50000), // $50k salary
      marketingBudget: Math.round(annualSavings * 0.7), // 70% to marketing
      customerCashback: (annualSavings / (annualVolume / 100)).toFixed(2), // per $100 spent
      revenuePercentFreed: ((annualSavings / annualVolume) * 100).toFixed(2)
    };
  }

  /**
   * Quick calculation - returns just the key numbers
   * @param {number} annualVolume 
   * @param {Object} paymentMix 
   * @returns {Object} Key savings metrics
   */
  quickCalculate(annualVolume, paymentMix = { credit_card: 50, paypal: 30, crypto: 10, bank_transfer: 10 }) {
    const traditional = this.calculateTraditionalFees(annualVolume, paymentMix);
    const optimized = this.calculateOptimizedFees(annualVolume, paymentMix);
    const savings = traditional - optimized;
    const percentage = (savings / traditional) * 100;

    return {
      currentFees: traditional,
      newFees: optimized,
      annualSavings: savings,
      savingsPercentage: percentage,
      monthlySavings: savings / 12,
      breakEvenMonths: this.IMPLEMENTATION_COST / (savings / 12)
    };
  }

  /**
   * Compare multiple business scenarios side-by-side
   * @param {Array} scenarios - Array of business configurations
   * @returns {Array} Comparison results
   */
  compareScenarios(scenarios) {
    return scenarios.map(scenario => {
      const report = this.generateReport(scenario);
      return {
        name: scenario.businessName,
        volume: scenario.annualVolume,
        savings: report.savings.annual,
        percentage: report.fees.percentage,
        breakEven: report.roi.breakEvenMonths,
        fiveYearTotal: report.projection.totalSavings
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage for display
   * @param {number} value - Percentage value
   * @returns {string} Formatted percentage string
   */
  formatPercent(value) {
    return `${value.toFixed(2)}%`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTPUT GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate simple text summary (for emails/proposals)
   * @param {Object} config - Business configuration
   * @returns {string} Formatted text summary
   */
  generateTextSummary(config) {
    const report = this.generateReport(config);
    
    return `
PAYMENT PROCESSING SAVINGS ANALYSIS
${report.business.name}
${'='.repeat(50)}

📊 CURRENT SITUATION:
   Annual Volume: ${this.formatCurrency(report.business.annualVolume)}
   Traditional Fees: ${this.formatCurrency(report.fees.traditional)}
   Fee Rate: ${this.formatPercent((report.fees.traditional / report.business.annualVolume) * 100)}

💰 WITH OPTIMIZATION:
   New Annual Fees: ${this.formatCurrency(report.fees.optimized)}
   Annual Savings: ${this.formatCurrency(report.savings.annual)}
   Reduction: ${this.formatPercent(report.fees.percentage)}

📈 MONTHLY IMPACT:
   Monthly Savings: ${this.formatCurrency(report.savings.monthly)}
   Per Transaction: ${this.formatCurrency(report.savings.perTransaction)}

🎯 ROI ANALYSIS:
   Implementation Cost: ${this.formatCurrency(report.roi.implementationCost)}
   Break-Even: ${report.roi.breakEvenMonths.toFixed(1)} months (${report.roi.breakEvenDays} days)
   First Year ROI: ${this.formatPercent(report.roi.firstYearROI)}

🚀 5-YEAR PROJECTION:
   Total Savings: ${this.formatCurrency(report.projection.totalSavings)}
   Average Annual: ${this.formatCurrency(report.projection.totalSavings / 5)}

💡 WHAT YOU CAN DO WITH SAVINGS:
   • Hire ${report.benefits.employeesAffordable} new employees
   • Invest ${this.formatCurrency(report.benefits.marketingBudget)} in marketing
   • Offer ${report.benefits.customerCashback}% cashback to customers
   • Free up ${report.benefits.revenuePercentFreed}% of revenue for growth

${'='.repeat(50)}
Ready to start saving? Let's talk implementation.
    `.trim();
  }

  /**
   * Generate JSON output (for APIs/integrations)
   */
  generateJSON(config) {
    const report = this.generateReport(config);
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate HTML table (for email/web)
   */
  generateHTMLTable(scenarios) {
    const comparison = this.compareScenarios(scenarios);
    
    let html = `
<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
  <thead>
    <tr style="background-color: #f4f4f4;">
      <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Business Type</th>
      <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Annual Volume</th>
      <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Annual Savings</th>
      <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">% Saved</th>
      <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Break-Even</th>
    </tr>
  </thead>
  <tbody>
`;

    comparison.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
      html += `
    <tr style="background-color: ${bgColor};">
      <td style="border: 1px solid #ddd; padding: 12px;">${row.name}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${this.formatCurrency(row.volume)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #28a745; font-weight: bold;">${this.formatCurrency(row.savings)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${this.formatPercent(row.percentage)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${row.breakEven.toFixed(1)} mo</td>
    </tr>
`;
    });

    html += `
  </tbody>
</table>
`;
    return html;
  }
}

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
      `${row.name.padEnd(20)} ` +
      `$${(row.volume / 1000000).toFixed(1)}M`.padEnd(15) +
      `$${(row.savings / 1000).toFixed(1)}K`.padEnd(15) +
      `${row.percentage.toFixed(1)}%`.padEnd(10) +
      `${row.breakEven.toFixed(1)} mo`
    );
  });
}
