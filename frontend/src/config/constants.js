// SOLIDARITY PLATFORM - FRONTEND CONSTANTS & SAFETY CONFIG
// ================================================
// Centralized constants, safety tiers, node configuration, and ratio logic for frontend
//
// TRADEMARKED BY SCOTT CHARLES OLSON

export const BASE_RATIO = 1.618;
export const BRIDGING_BASELINE = 0.618;
export const SACRED_NODES = [1, 3, 4, 7, 14, 21, 49];
export const HENRY_PROGRESSION = { base: 7, double: 14, square: 49, control: 3.5 };

export const SAFETY_THRESHOLDS = {
  CRITICAL_EMERGENCY: { min: 0.00, max: 0.05, label: 'Critical Emergency', color: '#ff0033', discount: 0.02 },
  WARNING_LEVEL: { min: 0.05, max: 0.15, label: 'Warning', color: '#ff6600', discount: 0.05 },
  CAUTION_RANGE: { min: 0.15, max: 0.25, label: 'Caution', color: '#ffcc00', discount: 0.08 },
  OPTIMAL_RANGE: { min: 0.25, max: 0.75, label: 'Optimal', color: '#33cc66', discount: 0.12 },
  UPPER_CAUTION: { min: 0.75, max: 0.85, label: 'Upper Caution', color: '#ffcc00', discount: 0.08 },
  UPPER_WARNING: { min: 0.85, max: 0.95, label: 'Upper Warning', color: '#ff6600', discount: 0.05 },
  CRITICAL_UPPER: { min: 0.95, max: 1.00, label: 'Critical Upper', color: '#ff0033', discount: 0.02 }
};

export function getSafetyTier(level) {
  for (const [key, threshold] of Object.entries(SAFETY_THRESHOLDS)) {
    if (level >= threshold.min && level <= threshold.max) {
      return { ...threshold, key };
    }
  }
  return { ...SAFETY_THRESHOLDS.OPTIMAL_RANGE, key: 'OPTIMAL_RANGE' };
}

export function getClosestSacredNode(n) {
  return SACRED_NODES.reduce((prev, curr) => Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev);
}

export function phiTransition(current, target, factor = 1.0) {
  return current + ((target - current) / BASE_RATIO) * factor;
}
