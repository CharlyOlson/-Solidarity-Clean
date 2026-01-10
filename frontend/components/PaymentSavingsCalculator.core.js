// PaymentSavingsCalculator.core.js
// Core logic for payment savings calculations

class PaymentSavingsCalculatorCore {
    /**
     * Generate a human-readable text summary for a savings scenario
     * @param {object} config - { businessName, annualVolume, monthlyTransactions, paymentMix, ... }
     * @returns {string}
     */
    generateTextSummary(config) {
      const report = this.generateReport(config);
      const name = config.businessName || 'Your Business';
      const volume = report.business.annualVolume;
      const tx = report.business.monthlyTransactions;
      const savings = report.savings.annual;
      const percent = report.fees.percentage;
      const breakEven = report.roi.breakEvenMonths;
      const cost = report.roi.implementationCost;
      return (
        `Business: ${name}\n` +
        `Annual Volume: ${this.formatCurrency(volume)}\n` +
        `Monthly Transactions: ${tx}\n` +
        `Annual Savings: ${this.formatCurrency(savings)} (${this.formatPercent(percent)})\n` +
        `Break-Even: ${breakEven.toFixed(1)} months\n` +
        `Implementation Cost: ${this.formatCurrency(cost)}\n` +
        `Safety Mode: ${report.safety.threshold} (${report.safety.mode})\n`
      );
    }
  constructor(config = {}) {
    this.PHI = 1.618;
    this.BASELINE = 0.618;
    this.safetyLevel = config.safetyLevel || 0.618;
    this.SAFETY_THRESHOLDS = {
      CRITICAL_EMERGENCY: { min: 0.00, max: 0.05, discount: 0.05, mode: 'minimal' },
      WARNING_LEVEL: { min: 0.05, max: 0.15, discount: 0.15, mode: 'conservative' },
      CAUTION_RANGE: { min: 0.15, max: 0.25, discount: 0.25, mode: 'standard' },
      OPTIMAL_RANGE: { min: 0.25, max: 0.75, discount: 0.40, mode: 'aggressive' },
      UPPER_CAUTION: { min: 0.75, max: 0.85, discount: 0.30, mode: 'standard' },
      UPPER_WARNING: { min: 0.85, max: 0.95, discount: 0.20, mode: 'conservative' },
      CRITICAL_UPPER: { min: 0.95, max: 1.00, discount: 0.10, mode: 'minimal' }
    };
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
    this.IMPLEMENTATION_COST = config.implementationCost || 5000;
  }

  getSafetyConfig() {
    for (const [name, threshold] of Object.entries(this.SAFETY_THRESHOLDS)) {
      if (this.safetyLevel >= threshold.min && this.safetyLevel <= threshold.max) {
        return { ...threshold, level: name };
      }
    }
    return { ...this.SAFETY_THRESHOLDS.OPTIMAL_RANGE, level: 'OPTIMAL_RANGE' };
  }

  setSafetyLevel(level) {
    this.safetyLevel = Math.max(0.00, Math.min(1.00, level));
    return this.getSafetyConfig();
  }

  calculateTraditionalFees(annualVolume, paymentMix) {
    let totalFees = 0;
    for (const [method, percentage] of Object.entries(paymentMix)) {
      const rate = this.INDUSTRY_RATES[method] || 2.9;
      totalFees += (annualVolume * (percentage / 100)) * (rate / 100);
    }
    return totalFees;
  }

  calculateOptimizedFees(annualVolume, paymentMix, safetyLevel = null) {
    let totalFees = 0;
    const effectiveSafetyLevel = safetyLevel !== null ? safetyLevel : this.safetyLevel;
    let safetyConfig = this.SAFETY_THRESHOLDS.OPTIMAL_RANGE;
    for (const [name, threshold] of Object.entries(this.SAFETY_THRESHOLDS)) {
      if (effectiveSafetyLevel >= threshold.min && effectiveSafetyLevel <= threshold.max) {
        safetyConfig = threshold;
        break;
      }
    }
    const safetyMultiplier = 1 - (safetyConfig.discount * effectiveSafetyLevel);
    for (const [method, percentage] of Object.entries(paymentMix)) {
      const rate = this.INDUSTRY_RATES[method] || 2.9;
      totalFees += (annualVolume * (percentage / 100)) * (rate / 100) * safetyMultiplier;
    }
    return totalFees;
  }

  generateReport(config) {
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
    if (safetyLevel !== this.safetyLevel) this.setSafetyLevel(safetyLevel);
    const safetyConfig = this.getSafetyConfig();
    const traditionalFees = this.calculateTraditionalFees(annualVolume, paymentMix);
    const optimizedFees = this.calculateOptimizedFees(annualVolume, paymentMix, safetyLevel);
    const annualSavings = traditionalFees - optimizedFees;
    const savingsPercentage = (annualSavings / traditionalFees) * 100;
    const monthlySavings = annualSavings / 12;
    const avgTransaction = annualVolume / (monthlyTransactions * 12);
    const savingsPerTransaction = annualSavings / (monthlyTransactions * 12);
    const breakEvenMonths = implementationCost / monthlySavings;
    const projection = this.calculateProjection(
      annualVolume, paymentMix, projectionYears, annualGrowthRate
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

  calculateProjection(baseVolume, paymentMix, years, growthRate) {
    const yearly = [];
    let totalSavings = 0;
    let currentVolume = baseVolume;
    for (let year = 1; year <= years; year++) {
      const traditional = this.calculateTraditionalFees(currentVolume, paymentMix);
      const optimized = this.calculateOptimizedFees(currentVolume, paymentMix);
      const savings = traditional - optimized;
      yearly.push({ year, volume: currentVolume, savings });
      totalSavings += savings;
      currentVolume *= (1 + growthRate);
    }
    return { yearly, total: totalSavings };
  }

  calculateBenefits(annualSavings, annualVolume) {
    return {
      employeesAffordable: Math.floor(annualSavings / 50000),
      marketingBudget: Math.round(annualSavings * 0.7),
      customerCashback: (annualSavings / (annualVolume / 100)).toFixed(2),
      revenuePercentFreed: ((annualSavings / annualVolume) * 100).toFixed(2)
    };
  }

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

  compareScenarios(scenarios) {
    return scenarios.map(scenario => {
      const report = this.generateReport(scenario);
      return {
        businessName: scenario.businessName,
        annualVolume: scenario.annualVolume,
        annualSavings: report.savings.annual,
        savingsPercentage: report.fees.percentage,
        breakEvenMonths: report.roi.breakEvenMonths
      };
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercent(value) {
    return `${value.toFixed(2)}%`;
  }
}

module.exports = PaymentSavingsCalculatorCore;
