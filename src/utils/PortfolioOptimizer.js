/*
 * SOLIDARITY PLATFORM - PORTFOLIO OPTIMIZER
 * ==========================================
 *
 * Composable pairing with UnifiedMathematicsFramework
 * Optimizes asset allocation using φ-ratio distribution
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

class PortfolioOptimizer {
  constructor(mathFramework) {
    this.math = mathFramework;
    this.portfolio = new Map(); // assetName -> { value, allocation, recommendation }
    this.history = [];
    this.metrics = {
      optimizationCount: 0,
      totalValue: 0,
      drift: 0
    };
  }

  /**
   * Add asset to portfolio
   */
  addAsset(name, value) {
    this.portfolio.set(name, {
      name,
      value: Math.max(0, value),
      allocation: 0,
      recommendation: null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate total portfolio value
   */
  calculateTotalValue() {
    let total = 0;
    for (const asset of this.portfolio.values()) {
      total += asset.value;
    }
    this.metrics.totalValue = total;
    return total;
  }

  /**
   * Optimize allocation using φ-ratio distribution
   * Primary asset: 61.8% (φ reciprocal)
   * Secondary assets: Distributed by descending φ powers
   */
  optimizeAllocation() {
    const total = this.calculateTotalValue();
    if (total === 0) {
      return {
        success: false,
        error: 'Portfolio is empty',
        allocations: []
      };
    }

    // Sort assets by value (descending)
    const sorted = Array.from(this.portfolio.values())
      .sort((a, b) => b.value - a.value);

    const allocations = [];
    let remainingPercentage = 100;

    sorted.forEach((asset, index) => {
      let targetAllocation;

      if (index === 0) {
        // Primary asset gets golden ratio baseline
        targetAllocation = this.math.PHI_RECIPROCAL * 100;
      } else {
        // Secondary assets distributed by φ powers
        const divisor = Math.pow(this.math.PHI, index);
        targetAllocation = Math.min(
          (remainingPercentage / divisor),
          remainingPercentage
        );
      }

      targetAllocation = this.precisionRound(targetAllocation, 2);
      remainingPercentage -= targetAllocation;

      const currentAllocation = (asset.value / total) * 100;
      const drift = Math.abs(targetAllocation - currentAllocation);

      allocations.push({
        asset: asset.name,
        currentValue: asset.value,
        currentAllocation: this.precisionRound(currentAllocation, 2),
        targetAllocation: targetAllocation,
        recommendedValue: this.precisionRound((total * targetAllocation) / 100, 2),
        drift: this.precisionRound(drift, 2),
        action: drift > 5 ? (targetAllocation > currentAllocation ? 'BUY' : 'SELL') : 'HOLD'
      });

      // Update portfolio
      asset.allocation = targetAllocation;
      asset.recommendation = allocations[allocations.length - 1];
    });

    this.metrics.optimizationCount++;
    this.metrics.drift = allocations.reduce((sum, a) => sum + a.drift, 0) / allocations.length;
    this.history.push({
      timestamp: new Date().toISOString(),
      allocations: allocations,
      totalValue: total,
      drift: this.metrics.drift
    });

    return {
      success: true,
      totalValue: total,
      allocations: allocations,
      phiRatio: this.math.PHI,
      reciprocal: this.math.PHI_RECIPROCAL,
      averageDrift: this.metrics.drift
    };
  }

  /**
   * Rebalance to recommended allocation
   * Returns trading instructions
   */
  getRebalancingInstructions(tolerance = 5) {
    const total = this.calculateTotalValue();
    if (total === 0) return [];

    const instructions = [];

    for (const asset of this.portfolio.values()) {
      if (!asset.recommendation) continue;

      const { drift, action, currentValue, recommendedValue } = asset.recommendation;

      if (drift >= tolerance) {
        const amount = Math.abs(recommendedValue - currentValue);
        instructions.push({
          asset: asset.name,
          action: action,
          currentValue: currentValue,
          targetValue: recommendedValue,
          tradeAmount: amount,
          percentage: this.precisionRound((amount / total) * 100, 2),
          priority: drift // Higher drift = higher priority
        });
      }
    }

    // Sort by priority (descending)
    return instructions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check portfolio health (diversity and balance)
   */
  assessHealth() {
    const total = this.calculateTotalValue();
    if (total === 0) {
      return {
        health: 'empty',
        score: 0,
        issues: ['Portfolio is empty']
      };
    }

    const allocations = Array.from(this.portfolio.values()).map(
      a => (a.value / total) * 100
    );

    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = allocations.reduce((sum, a) => sum + (a * a), 0);
    
    // Ideal for diversification: HHI < 1500 (φ-adjusted: < 1618)
    const concentration = hhi > 1618 ? 'high' : hhi > 1000 ? 'moderate' : 'low';
    const health = concentration === 'low' ? 'good' : concentration === 'moderate' ? 'fair' : 'poor';

    const issues = [];
    if (concentration === 'high') {
      issues.push('Portfolio is too concentrated');
      issues.push('Consider diversifying into secondary assets');
    }

    if (this.metrics.drift > 10) {
      issues.push('Portfolio has drifted significantly from targets');
      issues.push('Rebalancing recommended');
    }

    return {
      health: health,
      score: Math.max(0, Math.min(100, 100 - (hhi / 16.18))),
      concentration: concentration,
      herfindahlIndex: this.precisionRound(hhi, 2),
      assetCount: this.portfolio.size,
      issues: issues
    };
  }

  /**
   * Precision rounding helper
   */
  precisionRound(value, decimals = 8) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Get current portfolio state
   */
  getPortfolioState() {
    return {
      timestamp: new Date().toISOString(),
      totalValue: this.calculateTotalValue(),
      assetCount: this.portfolio.size,
      assets: Array.from(this.portfolio.values()),
      metrics: this.metrics,
      health: this.assessHealth()
    };
  }

  /**
   * Export portfolio history for analysis
   */
  exportHistory() {
    return {
      portfolio: this.getPortfolioState(),
      history: this.history,
      optimizationCount: this.metrics.optimizationCount
    };
  }
}

module.exports = { PortfolioOptimizer };
