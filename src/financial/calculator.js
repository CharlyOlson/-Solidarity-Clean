/*
 * SOLIDARITY PLATFORM - PAYMENT CALCULATOR API
 * =============================================
 * 
 * REST API endpoints for Payment Savings Calculator
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();

// Import the calculator (we'll create an enhanced version)
const PaymentSavingsCalculator = require('../../../financial_systems/PaymentSavingsCalculator');

// Initialize calculator instance
const calculator = new PaymentSavingsCalculator();

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Safety thresholds from financial optimizer (7-tier system)
const SAFETY_THRESHOLDS = {
  CRITICAL_EMERGENCY: { min: 0.00, max: 0.05, optimizationLevel: 'minimal', discount: 0.05 },
  WARNING_LEVEL: { min: 0.05, max: 0.15, optimizationLevel: 'conservative', discount: 0.15 },
  CAUTION_RANGE: { min: 0.15, max: 0.25, optimizationLevel: 'standard', discount: 0.25 },
  OPTIMAL_RANGE: { min: 0.25, max: 0.75, optimizationLevel: 'aggressive', discount: 0.40 },
  UPPER_CAUTION: { min: 0.75, max: 0.85, optimizationLevel: 'standard', discount: 0.30 },
  UPPER_WARNING: { min: 0.85, max: 0.95, optimizationLevel: 'conservative', discount: 0.20 },
  CRITICAL_UPPER: { min: 0.95, max: 1.00, optimizationLevel: 'minimal', discount: 0.10 }
};

// Constants
const BASE_RATIO = 1.618;
const BRIDGING_BASELINE = 0.618;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get safety configuration based on safety level
 * @param {number} safetyLevel - Safety level (0.00 - 1.00)
 * @returns {Object} Safety threshold config with level name
 */
function getSafetyConfig(safetyLevel = BRIDGING_BASELINE) {
  for (const [name, threshold] of Object.entries(SAFETY_THRESHOLDS)) {
    if (safetyLevel >= threshold.min && safetyLevel <= threshold.max) {
      return { ...threshold, level: name };
    }
  }
  return { ...SAFETY_THRESHOLDS.OPTIMAL_RANGE, level: 'OPTIMAL_RANGE' };
}

/**
 * Enhanced optimization with safety thresholds
 * 
 * Formula: optimizedRate = baseRate × (1 / (1 + log₁₀(volume) / φ)) × safetyMultiplier
 * 
 * @param {number} annualVolume - Annual payment volume ($)
 * @param {Object} paymentMix - Payment method distribution (%)
 * @param {number} safetyLevel - Safety level (0.00 - 1.00)
 * @returns {Object} Calculation results with safety config
 */
function calculateWithSafety(annualVolume, paymentMix, safetyLevel = BRIDGING_BASELINE) {
  const safetyConfig = getSafetyConfig(safetyLevel);
  
  // Get base calculations
  const traditional = calculator.calculateTraditionalFees(annualVolume, paymentMix);
  
  // Enhanced optimized calculation with safety factors
  let optimizedTotal = 0;
  const INDUSTRY_RATES = {
    credit_card: 2.9,
    debit_card: 1.5,
    paypal: 3.4,
    venmo: 3.0,
    crypto: 0.1,
    stablecoin: 0.05,
    bank_transfer: 0.5,
    lightning: 0.01
  };
  
  for (const [method, percentage] of Object.entries(paymentMix)) {
    const methodVolume = annualVolume * (percentage / 100);
    const baseRate = INDUSTRY_RATES[method] || 2.9;
    
    // Apply φ-ratio optimization with safety-adjusted discount
    const volumeFactor = Math.log10(Math.max(methodVolume, 1)) / BASE_RATIO;
    const safetyMultiplier = 1 - (safetyConfig.discount * safetyLevel);
    const optimizedRate = baseRate * (1 / (1 + volumeFactor)) * safetyMultiplier;
    
    optimizedTotal += methodVolume * (optimizedRate / 100);
  }
  
  const savings = traditional - optimizedTotal;
  const percentage = traditional > 0 ? (savings / traditional) * 100 : 0;
  
  return {
    traditional,
    optimized: optimizedTotal,
    savings,
    percentage,
    safetyConfig: {
      level: safetyConfig.level,
      optimizationLevel: safetyConfig.optimizationLevel,
      appliedDiscount: safetyConfig.discount
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/calculator/quick
 * @desc    Quick calculation - returns key savings metrics
 * @access  Public
 * @body    { annualVolume: number, paymentMix?: object, safetyLevel?: number }
 */
router.post('/quick', (req, res) => {
  try {
    const { 
      annualVolume, 
      paymentMix = { credit_card: 50, paypal: 30, crypto: 10, bank_transfer: 10 },
      safetyLevel = BRIDGING_BASELINE
    } = req.body;

    if (!annualVolume || annualVolume <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid annual volume. Must be a positive number.'
      });
    }

    const result = calculateWithSafety(annualVolume, paymentMix, safetyLevel);
    const monthlySavings = result.savings / 12;
    const implementationCost = 5000;
    const breakEvenMonths = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;

    res.json({
      success: true,
      data: {
        currentFees: result.traditional,
        newFees: result.optimized,
        annualSavings: result.savings,
        savingsPercentage: result.percentage,
        monthlySavings,
        breakEvenMonths,
        safetyConfig: result.safetyConfig
      },
      metadata: {
        baseRatio: BASE_RATIO,
        bridgingBaseline: BRIDGING_BASELINE,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Calculator error:', error);
    res.status(500).json({
      success: false,
      error: 'Calculation failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/calculator/report
 * @desc    Generate comprehensive savings report
 * @access  Public
 * @body    { businessName, annualVolume, monthlyTransactions, paymentMix, safetyLevel, projectionYears, growthRate }
 */
router.post('/report', (req, res) => {
  try {
    const {
      businessName = 'Your Business',
      annualVolume,
      monthlyTransactions = Math.floor(annualVolume / 100),
      paymentMix = { credit_card: 50, paypal: 30, crypto: 10, bank_transfer: 10 },
      safetyLevel = BRIDGING_BASELINE,
      projectionYears = 5,
      growthRate = 0.10,
      implementationCost = 5000
    } = req.body;

    if (!annualVolume || annualVolume <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid annual volume. Must be a positive number.'
      });
    }

    const safetyConfig = getSafetyConfig(safetyLevel);
    const result = calculateWithSafety(annualVolume, paymentMix, safetyLevel);
    
    // Calculate projections
    const projection = [];
    let totalSavings = 0;
    let currentVolume = annualVolume;

    for (let year = 1; year <= projectionYears; year++) {
      const yearResult = calculateWithSafety(currentVolume, paymentMix, safetyLevel);
      
      projection.push({
        year,
        volume: currentVolume,
        traditional: yearResult.traditional,
        optimized: yearResult.optimized,
        savings: yearResult.savings,
        cumulative: totalSavings + yearResult.savings
      });
      
      totalSavings += yearResult.savings;
      currentVolume *= (1 + growthRate);
    }

    // Calculate benefits
    const avgTransaction = annualVolume / (monthlyTransactions * 12);
    const monthlySavings = result.savings / 12;
    const breakEvenMonths = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;
    const firstYearROI = result.savings > 0 ? ((result.savings - implementationCost) / implementationCost) * 100 : 0;

    res.json({
      success: true,
      data: {
        business: {
          name: businessName,
          annualVolume,
          monthlyTransactions,
          avgTransaction,
          paymentMix
        },
        fees: {
          traditional: result.traditional,
          optimized: result.optimized,
          difference: result.savings,
          percentage: result.percentage
        },
        savings: {
          annual: result.savings,
          monthly: monthlySavings,
          perTransaction: result.savings / (monthlyTransactions * 12)
        },
        roi: {
          implementationCost,
          breakEvenMonths,
          breakEvenDays: Math.ceil(breakEvenMonths * 30),
          firstYearROI
        },
        projection: {
          years: projectionYears,
          growthRate,
          yearlyBreakdown: projection,
          totalSavings
        },
        benefits: {
          employeesAffordable: Math.floor(result.savings / 50000),
          marketingBudget: Math.round(result.savings * 0.7),
          customerCashback: ((result.savings / annualVolume) * 100).toFixed(2),
          revenuePercentFreed: ((result.savings / annualVolume) * 100).toFixed(2)
        },
        safety: {
          level: safetyConfig.level,
          safetyLevel,
          optimizationLevel: safetyConfig.optimizationLevel,
          appliedDiscount: safetyConfig.discount * 100 + '%'
        }
      },
      metadata: {
        baseRatio: BASE_RATIO,
        bridgingBaseline: BRIDGING_BASELINE,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Report generation failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/calculator/compare
 * @desc    Compare multiple business scenarios
 * @access  Public
 * @body    { scenarios: Array<{ businessName, annualVolume, monthlyTransactions, paymentMix }>, safetyLevel }
 */
router.post('/compare', (req, res) => {
  try {
    const { scenarios, safetyLevel = BRIDGING_BASELINE } = req.body;

    if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scenarios. Must be a non-empty array.'
      });
    }

    if (scenarios.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many scenarios. Maximum 10 allowed.'
      });
    }

    const safetyConfig = getSafetyConfig(safetyLevel);
    const comparison = scenarios.map(scenario => {
      const { 
        businessName = 'Business', 
        annualVolume, 
        paymentMix = { credit_card: 50, paypal: 30, crypto: 10, bank_transfer: 10 } 
      } = scenario;

      const result = calculateWithSafety(annualVolume, paymentMix, safetyLevel);
      const monthlySavings = result.savings / 12;
      const breakEvenMonths = monthlySavings > 0 ? 5000 / monthlySavings : Infinity;

      // Calculate 5-year total
      let fiveYearTotal = 0;
      let currentVolume = annualVolume;
      for (let year = 0; year < 5; year++) {
        const yearResult = calculateWithSafety(currentVolume, paymentMix, safetyLevel);
        fiveYearTotal += yearResult.savings;
        currentVolume *= 1.10; // 10% growth
      }

      return {
        name: businessName,
        volume: annualVolume,
        savings: result.savings,
        percentage: result.percentage,
        breakEven: breakEvenMonths,
        fiveYearTotal
      };
    });

    res.json({
      success: true,
      data: {
        comparison,
        totals: {
          combinedVolume: comparison.reduce((sum, s) => sum + s.volume, 0),
          combinedSavings: comparison.reduce((sum, s) => sum + s.savings, 0),
          avgPercentage: comparison.reduce((sum, s) => sum + s.percentage, 0) / comparison.length,
          combinedFiveYear: comparison.reduce((sum, s) => sum + s.fiveYearTotal, 0)
        },
        safety: {
          level: safetyConfig.level,
          optimizationLevel: safetyConfig.optimizationLevel
        }
      },
      metadata: {
        baseRatio: BASE_RATIO,
        bridgingBaseline: BRIDGING_BASELINE,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Comparison failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/calculator/rates
 * @desc    Get current industry rates and safety thresholds
 * @access  Public
 */
router.get('/rates', (req, res) => {
  res.json({
    success: true,
    data: {
      industryRates: {
        credit_card: { rate: 2.9, label: 'Credit Card' },
        debit_card: { rate: 1.5, label: 'Debit Card' },
        paypal: { rate: 3.4, label: 'PayPal' },
        venmo: { rate: 3.0, label: 'Venmo' },
        crypto: { rate: 0.1, label: 'Cryptocurrency' },
        stablecoin: { rate: 0.05, label: 'Stablecoin' },
        bank_transfer: { rate: 0.5, label: 'Bank Transfer (ACH)' },
        lightning: { rate: 0.01, label: 'Lightning Network' }
      },
      safetyThresholds: SAFETY_THRESHOLDS,
      constants: {
        baseRatio: BASE_RATIO,
        bridgingBaseline: BRIDGING_BASELINE,
        implementationCost: 5000
      }
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route   GET /api/calculator/health
 * @desc    API health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'Payment Savings Calculator API',
    version: '2.0.0',
    baseRatio: BASE_RATIO,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
