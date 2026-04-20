/*
 * SOLIDARITY PLATFORM - PAYMENT CALCULATOR UI COMPONENT
 * =====================================================
 * 
 * Frontend React component for the Payment Savings Calculator
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useState, useMemo } from 'react';
import './PaymentCalculator.css';
import { BASE_RATIO, BRIDGING_BASELINE, SAFETY_THRESHOLDS } from '../config/constants';
import { useChainData } from '../hooks/useChainData';

// Industry standard fee rates
const INDUSTRY_RATES = {
  credit_card: { rate: 2.9, label: 'Credit Card', icon: '💳' },
  debit_card: { rate: 1.5, label: 'Debit Card', icon: '💳' },
  paypal: { rate: 3.4, label: 'PayPal', icon: '🅿️' },
  venmo: { rate: 3.0, label: 'Venmo', icon: '📱' },
  crypto: { rate: 0.1, label: 'Crypto', icon: '₿' },
  stablecoin: { rate: 0.05, label: 'Stablecoin', icon: '💵' },
  bank_transfer: { rate: 0.5, label: 'Bank Transfer', icon: '🏦' },
  lightning: { rate: 0.01, label: 'Lightning', icon: '⚡' }
};

// Preset business sizes
const PRESETS = [
  { label: 'Small Business', volume: 200000, transactions: 500 },
  { label: 'Medium Business', volume: 1000000, transactions: 2500 },
  { label: 'Growing Company', volume: 5000000, transactions: 10000 },
  { label: 'Enterprise', volume: 20000000, transactions: 50000 }
];

export default function PaymentCalculator() {
  // Chain data for coherence-adjusted rate
  const {
    loading: chainLoading,
    coherenceScore,
    coherenceLevel,
  } = useChainData();

  // Coherence multiplier: lower coherence = slightly higher fee (1.0 - 1.15 range)
  // Score 100 = 1.0x, score 0 = 1.15x
  const coherenceMultiplier = 1 + 0.15 * (1 - Math.min(coherenceScore, 100) / 100);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [annualVolume, setAnnualVolume] = useState(1000000);
  const [monthlyTransactions, setMonthlyTransactions] = useState(2500);
  const [safetyLevel, setSafetyLevel] = useState(BRIDGING_BASELINE);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState(new Date());
  const [paymentMix, setPaymentMix] = useState({
    credit_card: 50,
    paypal: 25,
    debit_card: 15,
    bank_transfer: 10
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projectionYears, setProjectionYears] = useState(5);
  const [growthRate, setGrowthRate] = useState(10);

  /**
   * Get current safety configuration based on safety level
   * @returns {Object} Safety threshold config with level name
   */
  const getSafetyConfig = () => {
    for (const [name, threshold] of Object.entries(SAFETY_THRESHOLDS)) {
      if (safetyLevel >= threshold.min && safetyLevel <= threshold.max) {
        return { ...threshold, level: name };
      }
    }
    return { ...SAFETY_THRESHOLDS.OPTIMAL_RANGE, level: 'OPTIMAL_RANGE' };
  };

  /**
   * Calculate traditional payment fees (without optimization)
   * @param {number} volume - Annual payment volume ($)
   * @param {Object} mix - Payment method distribution (%)
   * @returns {number} Total annual fees
   */
  const calculateTraditionalFees = (volume, mix) => {
    let totalFees = 0;

    for (const [method, percentage] of Object.entries(mix)) {
      const methodVolume = volume * (percentage / 100);
      const rate = INDUSTRY_RATES[method]?.rate || 2.9;
      totalFees += methodVolume * (rate / 100);
    }

    return totalFees;
  };

  /**
   * Calculate optimized fees with φ-ratio and safety thresholds
   * 
   * Formula: optimizedRate = baseRate × (1 / (1 + log₁₀(volume) / φ)) × safetyMultiplier
   * 
   * @param {number} volume - Annual payment volume ($)
   * @param {Object} mix - Payment method distribution (%)
   * @returns {number} Total annual fees with φ-ratio optimization
   */
  const calculateOptimizedFees = (volume, mix) => {
    const safetyConfig = getSafetyConfig();
    let totalFees = 0;

    for (const [method, percentage] of Object.entries(mix)) {
      const methodVolume = volume * (percentage / 100);
      const baseRate = INDUSTRY_RATES[method]?.rate || 2.9;

      // Apply φ-ratio optimization formula with safety-adjusted discount
      const volumeFactor = Math.log10(Math.max(methodVolume, 1)) / BASE_RATIO;
      const safetyMultiplier = 1 - ((safetyConfig.discount || 0) * safetyLevel);
      const optimizedRate = baseRate * (1 / (1 + volumeFactor)) * safetyMultiplier * coherenceMultiplier;

      totalFees += methodVolume * (optimizedRate / 100);
    }

    return totalFees;
  };

  /**
   * Calculate multi-year savings projection with growth rate
   * @returns {Object} Yearly breakdown and total savings
   */
  const calculateProjection = () => {
    const yearly = [];
    let totalSavings = 0;
    let currentVolume = annualVolume;
    const rate = growthRate / 100;

    for (let year = 1; year <= projectionYears; year++) {
      const traditional = calculateTraditionalFees(currentVolume, paymentMix);
      const optimized = calculateOptimizedFees(currentVolume, paymentMix);
      const savings = traditional - optimized;

      yearly.push({
        year,
        volume: currentVolume,
        traditional,
        optimized,
        savings,
        cumulative: totalSavings + savings
      });

      totalSavings += savings;
      currentVolume *= (1 + rate);
    }

    return { yearly, total: totalSavings };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMOIZED CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Memoized calculation results
   * Helper functions are stable (don't change) so only state values need tracking
   */
  const results = useMemo(() => {
    const traditional = calculateTraditionalFees(annualVolume, paymentMix);
    const optimized = calculateOptimizedFees(annualVolume, paymentMix);
    const savings = traditional - optimized;
    const percentage = traditional > 0 ? (savings / traditional) * 100 : 0;
    const monthlySavings = savings / 12;
    const implementationCost = 5000;
    const breakEvenMonths = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;
    const projection = calculateProjection();
    const safetyConfig = getSafetyConfig();

    return {
      traditional,
      optimized,
      savings,
      percentage,
      monthlySavings,
      breakEvenMonths,
      projection,
      safetyConfig,
      firstYearROI: savings > 0 ? ((savings - implementationCost) / implementationCost) * 100 : 0
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annualVolume, paymentMix, safetyLevel, projectionYears, growthRate, coherenceMultiplier]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Format number as USD currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value) => `${value.toFixed(1)}%`;

  // Handle payment mix change
  const handleMixChange = (method, value) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setPaymentMix(prev => ({ ...prev, [method]: newValue }));
  };

  // Apply preset
  const applyPreset = (preset) => {
    setAnnualVolume(preset.volume);
    setMonthlyTransactions(preset.transactions);
  };

  // Calculate total mix percentage
  const totalMix = Object.values(paymentMix).reduce((sum, val) => sum + val, 0);

  return (
    <div className="payment-calculator">
      {/* Header */}
      <div className="calc-header">
        <div className="calc-title">
          <span className="calc-icon">💰</span>
          <div>
            <h2>Payment Savings Calculator</h2>
            <p>See how much you can save with optimized fee calculations</p>
          </div>
        </div>
        <div className="safety-badge" data-level={results.safetyConfig.level}>
          <span className="safety-dot"></span>
          {results.safetyConfig.optimizationLevel}
        </div>
      </div>

      <div className="calc-body">
        {/* Input Section */}
        <div className="calc-inputs">
          <div className="input-section">
            <h3>📊 Business Details</h3>
            
            <div className="input-group">
              <label>Business Name (optional)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business"
              />
            </div>

            <div className="input-group">
              <label>Annual Volume</label>
              <div className="input-with-prefix">
                <span className="prefix">$</span>
                <input
                  type="number"
                  value={annualVolume}
                  onChange={(e) => setAnnualVolume(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
              <input
                type="range"
                min="100000"
                max="50000000"
                step="100000"
                value={annualVolume}
                onChange={(e) => setAnnualVolume(parseInt(e.target.value))}
                className="volume-slider"
              />
            </div>

            <div className="presets">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  className={`preset-btn ${annualVolume === preset.volume ? 'active' : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="input-group">
              <label>Monthly Transactions</label>
              <input
                type="number"
                value={monthlyTransactions}
                onChange={(e) => setMonthlyTransactions(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="input-section">
            <h3>💳 Payment Mix</h3>
            <p className="mix-total" data-valid={totalMix === 100}>
              Total: {totalMix}% {totalMix !== 100 && '(should equal 100%)'}
            </p>
            
            <div className="payment-mix-grid">
              {Object.entries(INDUSTRY_RATES).slice(0, 6).map(([method, info]) => (
                <div key={method} className="mix-item">
                  <label>
                    <span className="mix-icon">{info.icon}</span>
                    {info.label}
                    <span className="rate-badge">{info.rate}%</span>
                  </label>
                  <div className="mix-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={paymentMix[method] || 0}
                      onChange={(e) => handleMixChange(method, e.target.value)}
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="input-section">
            <h3>🛡️ Safety Level</h3>
            <div className="safety-slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={safetyLevel}
                onChange={(e) => setSafetyLevel(parseFloat(e.target.value))}
                className="safety-slider"
              />
              <div className="safety-labels">
                <span>Conservative</span>
                <span className="safety-value">{Math.round(safetyLevel * 100)}%</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          <button 
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>

          {showAdvanced && (
            <div className="input-section advanced">
              <div className="input-group">
                <label>Projection Years</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
                />
              </div>
              <div className="input-group">
                <label>Annual Growth Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                />
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <button 
            className="calculate-btn"
            onClick={() => {
              setIsCalculating(true);
              console.log('🧮 Calculating savings for:', { annualVolume, paymentMix, safetyLevel });
              setTimeout(() => {
                setLastCalculated(new Date());
                setIsCalculating(false);
                console.log('✅ Calculation complete:', results);
              }, 500);
            }}
          >
            {isCalculating ? '⏳ Calculating...' : '🧮 Calculate Savings'}
          </button>
          <p className="last-calc">Last calculated: {lastCalculated.toLocaleTimeString()}</p>
        </div>

        {/* Results Section */}
        <div className="calc-results">
          <div className="results-header">
            <h3>Your Savings Potential</h3>
            <span
              className="phi-badge"
              style={{
                background:
                  coherenceLevel === 'elevated' || coherenceLevel === 'stable'
                    ? '#33cc66'
                    : coherenceLevel === 'degraded'
                    ? '#ffcc00'
                    : '#ff6600',
                color: '#fff',
              }}
            >
              {chainLoading
                ? 'Status: Loading...'
                : `Status: ${coherenceLevel}`}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card current">
              <span className="metric-label">Current Annual Fees</span>
              <span className="metric-value">{formatCurrency(results.traditional)}</span>
              <span className="metric-sub">{formatPercent((results.traditional / annualVolume) * 100)} of volume</span>
            </div>
            
            <div className="metric-card optimized">
              <span className="metric-label">Optimized Fees</span>
              <span className="metric-value">{formatCurrency(results.optimized)}</span>
              <span className="metric-sub">{formatPercent((results.optimized / annualVolume) * 100)} of volume</span>
            </div>
            
            <div className="metric-card savings highlight">
              <span className="metric-label">Annual Savings</span>
              <span className="metric-value">{formatCurrency(results.savings)}</span>
              <span className="metric-sub savings-percent">{formatPercent(results.percentage)} reduction</span>
            </div>
            
            <div className="metric-card monthly">
              <span className="metric-label">Monthly Savings</span>
              <span className="metric-value">{formatCurrency(results.monthlySavings)}</span>
            </div>
          </div>

          {/* ROI Section */}
          <div className="roi-section">
            <h4>🎯 Return on Investment</h4>
            <div className="roi-grid">
              <div className="roi-item">
                <span className="roi-label">Break-Even</span>
                <span className="roi-value">
                  {results.breakEvenMonths < 12 
                    ? `${results.breakEvenMonths.toFixed(1)} months`
                    : `${(results.breakEvenMonths / 12).toFixed(1)} years`
                  }
                </span>
              </div>
              <div className="roi-item">
                <span className="roi-label">First Year ROI</span>
                <span className="roi-value positive">{formatPercent(results.firstYearROI)}</span>
              </div>
              <div className="roi-item">
                <span className="roi-label">{projectionYears}-Year Total</span>
                <span className="roi-value">{formatCurrency(results.projection.total)}</span>
              </div>
            </div>
          </div>

          {/* Projection Chart */}
          <div className="projection-section">
            <h4>📊 {projectionYears}-Year Projection</h4>
            <div className="projection-chart">
              {results.projection.yearly.map((year) => (
                <div key={year.year} className="projection-bar-container">
                  <div 
                    className="projection-bar"
                    style={{ height: `${(year.savings / results.projection.yearly[results.projection.yearly.length - 1].savings) * 100}%` }}
                  >
                    <span className="bar-value">{formatCurrency(year.savings)}</span>
                  </div>
                  <span className="bar-label">Year {year.year}</span>
                </div>
              ))}
            </div>
            <div className="projection-summary">
              <span>Cumulative {projectionYears}-year savings:</span>
              <span className="total-savings">{formatCurrency(results.projection.total)}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="benefits-section">
            <h4>💡 What Your Savings Could Fund</h4>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">👥</span>
                <span className="benefit-value">{Math.floor(results.savings / 50000)}</span>
                <span className="benefit-label">New Employees</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📢</span>
                <span className="benefit-value">{formatCurrency(results.savings * 0.7)}</span>
                <span className="benefit-label">Marketing Budget</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎁</span>
                <span className="benefit-value">{((results.savings / annualVolume) * 100).toFixed(2)}%</span>
                <span className="benefit-label">Customer Cashback</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-section">
            <button 
              className="cta-primary"
              onClick={() => {
                alert(`📊 Detailed Report for ${businessName || 'Your Business'}\n\n` +
                      `Annual Volume: ${formatCurrency(annualVolume)}\n` +
                      `Traditional Fees: ${formatCurrency(results.traditional)}\n` +
                      `Optimized Fees: ${formatCurrency(results.optimized)}\n` +
                      `Annual Savings: ${formatCurrency(results.savings)}\n` +
                      `${projectionYears}-Year Projection: ${formatCurrency(results.projection.total)}\n\n` +
                      `🚀 Contact us to implement these savings!`);
              }}
            >
              Get Your Free Detailed Report
            </button>
            <button 
              className="cta-secondary"
              onClick={() => {
                alert(`📅 Schedule a Demo\n\n` +
                      `Thank you for your interest! Based on your ${formatCurrency(annualVolume)} annual volume,\n` +
                      `we can save you ${formatCurrency(results.savings)} per year.\n\n` +
                      `Email: demo@solidarity-platform.com\n` +
                      `Call: 1-800-PHI-SAVE (1-800-744-7283)`);
              }}
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="calc-footer">
        <p>
          Powered by proportional optimization engine
        </p>
      </div>
    </div>
  );
}
