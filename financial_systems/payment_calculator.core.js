/*
 * SOLIDARITY PLATFORM - PAYMENT CALCULATOR CORE MODULE
 * ===================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

// Core payment calculation logic, fully modular and testable

class PaymentCalculatorCore {
  // Internal error memory for adaptive correction
  static errorMemory = [];

  /**
   * Adaptive error correction using harmonics, cubic, pentatonic, and Henry 7→14→49
   * @param {number} value - The value to correct
   * @param {object} [options] - { type: 'harmonic'|'cubic'|'pentatonic'|'henry', context: any }
   * @returns {number} Corrected value
   */
  static adaptiveCorrect(value, options = {}) {
    let corrected = value;
    const { type = 'harmonic', context = {} } = options;
    // Harmonic correction: smooth error using weighted average of neighbors
    if (type === 'harmonic' && Array.isArray(context.series)) {
      const idx = context.index ?? context.series.length - 1;
      const prev = context.series[idx - 1] ?? value;
      const next = context.series[idx + 1] ?? value;
      corrected = (prev + value + next) / 3;
    }
    // Cubic correction: apply cubic root scaling for outliers
    if (type === 'cubic' && Math.abs(value) > (context.threshold ?? 10000)) {
      corrected = Math.cbrt(value) * (context.cubicScale ?? 7);
    }
    // Pentatonic scaling: quantize to nearest pentatonic step
    if (type === 'pentatonic') {
      const steps = [0, 2, 4, 7, 9]; // Major pentatonic intervals
      const base = context.base ?? 12;
      const nearest = steps.reduce((a, b) => Math.abs(b - (value % base)) < Math.abs(a - (value % base)) ? b : a);
      corrected = Math.round(value / base) * base + nearest;
    }
    // Henry 7→14→49: snap to nearest in sequence
    if (type === 'henry') {
      const sequence = [1, 3, 4, 7, 14, 21, 49];
      corrected = sequence.reduce((a, b) => Math.abs(b - value) < Math.abs(a - value) ? b : a);
    }
    // Save error correction for learning
    this.errorMemory.push({ value, corrected, type, context, timestamp: Date.now() });
    if (this.errorMemory.length > 1000) this.errorMemory.shift();
    return corrected;
  }

  /**
   * Learn from past corrections to adapt future calculations
   * @param {number} value - The value to adapt
   * @returns {number} Adapted value
   */
  static adaptFromHistory(value) {
    if (this.errorMemory.length === 0) return value;
    // Weighted average of last 7 corrections (Henry base)
    const recent = this.errorMemory.slice(-7);
    const avgCorrection = recent.reduce((sum, e) => sum + (e.corrected - e.value), 0) / recent.length;
    return value + avgCorrection;
  }

  /**
   * Clear error memory (for testing or reset)
   */
  static clearErrorMemory() {
    this.errorMemory = [];
  }
  /**
   * Calculate monthly payment for a loan
   * @param {number} principal - The loan amount
   * @param {number} annualRate - Annual interest rate (e.g., 0.05 for 5%)
   * @param {number} years - Loan term in years
   * @returns {number} Monthly payment
   */
  static calculateMonthlyPayment(principal, annualRate, years) {
    if (principal <= 0 || annualRate < 0 || years <= 0) return 0;
    let n = years * 12;
    let r = annualRate / 12;
    // Adaptive correction for n and r if out of expected range
    n = this.adaptiveCorrect(n, { type: 'henry' });
    r = this.adaptiveCorrect(r, { type: 'harmonic', context: { series: [annualRate, r, n] } });
    if (r === 0) return principal / n;
    let payment = principal * r / (1 - Math.pow(1 + r, -n));
    // Adapt from history if recent corrections exist
    payment = this.adaptFromHistory(payment);
    return payment;
  }

  /**
   * Calculate total payment over the loan term
   * @param {number} monthlyPayment
   * @param {number} years
   * @returns {number} Total payment
   */
  static calculateTotalPayment(monthlyPayment, years) {
    let n = years * 12;
    n = this.adaptiveCorrect(n, { type: 'henry' });
    let total = monthlyPayment * n;
    total = this.adaptFromHistory(total);
    return total;
  }

  /**
   * Calculate total interest paid over the loan term
   * @param {number} totalPayment
   * @param {number} principal
   * @returns {number} Total interest
   */
  static calculateTotalInterest(totalPayment, principal) {
    let interest = totalPayment - principal;
    interest = this.adaptiveCorrect(interest, { type: 'cubic', context: { threshold: 10000, cubicScale: 7 } });
    interest = this.adaptFromHistory(interest);
    return interest;
  }

  /**
   * Calculate savings between two loan scenarios
   * @param {object} scenarioA {principal, annualRate, years}
   * @param {object} scenarioB {principal, annualRate, years}
   * @returns {object} {monthlySavings, totalSavings, interestSavings}
   */
  static compareScenarios(scenarioA, scenarioB) {
    let aMonthly = this.calculateMonthlyPayment(scenarioA.principal, scenarioA.annualRate, scenarioA.years);
    let bMonthly = this.calculateMonthlyPayment(scenarioB.principal, scenarioB.annualRate, scenarioB.years);
    // Pentatonic scaling for monthly savings
    let monthlySavings = this.adaptiveCorrect(aMonthly - bMonthly, { type: 'pentatonic', context: { base: 12 } });
    let aTotal = this.calculateTotalPayment(aMonthly, scenarioA.years);
    let bTotal = this.calculateTotalPayment(bMonthly, scenarioB.years);
    let totalSavings = this.adaptiveCorrect(aTotal - bTotal, { type: 'harmonic', context: { series: [aTotal, bTotal] } });
    let aInterest = this.calculateTotalInterest(aTotal, scenarioA.principal);
    let bInterest = this.calculateTotalInterest(bTotal, scenarioB.principal);
    let interestSavings = this.adaptiveCorrect(aInterest - bInterest, { type: 'cubic', context: { threshold: 10000, cubicScale: 7 } });
    // Adapt all from history
    monthlySavings = this.adaptFromHistory(monthlySavings);
    totalSavings = this.adaptFromHistory(totalSavings);
    interestSavings = this.adaptFromHistory(interestSavings);
    return {
      monthlySavings,
      totalSavings,
      interestSavings
    };
  }
}

module.exports = PaymentCalculatorCore;
