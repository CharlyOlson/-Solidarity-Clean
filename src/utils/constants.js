/*
 * SOLIDARITY PLATFORM - MATHEMATICAL CONSTANTS
 * ============================================
 *
 * Centralized mathematical constants for Solidarity Platform
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const PHI = 1.618033988749895; // Golden ratio (precise)
const PHI_RECIPROCAL = 0.6180339887498948; // 1/phi (precise)
const BASE_RATIO = PHI;
// Platform anchor — intentionally 0.618 (3 decimal places) as defined in the
// Henry numerological specification. PHI_RECIPROCAL is kept separately for
// precise mathematical operations.
const BRIDGING_BASELINE = 0.618;
const HENRY_BASE = 7;
const HENRY_DOUBLE = 14;
const HENRY_SQUARE = 49;
const CONTROL_RATIO = 3.5; // 49/14
const SACRED_NODES = [1, 3, 4, 7, 14, 21, 49];
const PI = 3.141592653589793;
const CUBIT_BASE = 697;

module.exports = {
  PHI,
  PHI_RECIPROCAL,
  BASE_RATIO,
  BRIDGING_BASELINE,
  HENRY_BASE,
  HENRY_DOUBLE,
  HENRY_SQUARE,
  CONTROL_RATIO,
  SACRED_NODES,
  PI,
  CUBIT_BASE
};
