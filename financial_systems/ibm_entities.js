/*
 * SOLIDARITY PLATFORM - IBM ENTITY REGISTRY
 * ==========================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * ==========================================
 *
 * Seed registry of IBM ecosystem actors used by the three-point
 * connector system.  Each entity carries a movementWeight drawn
 * from the valid φ-hierarchy node set {1, 3, 4, 7, 14, 21}.
 *
 * Categories
 *   distributors  – channel partners that move IBM product
 *   competitors   – firms contesting the same markets
 *   investors     – consistently-profiting long-tenure holders
 *   suppliers     – companies providing critical inputs to IBM
 */

'use strict';

// Valid node weights from φ hierarchy {1, 3, 4, 7, 14, 21}
const NODES = Object.freeze([1, 3, 4, 7, 14, 21]);

// Baseline safety level per platform convention
const SAFETY_LEVEL = 0.618;
const PHI = 1.618;

/**
 * Normalize a raw weight to the nearest valid node value.
 * @param {number} raw
 * @returns {number}
 */
function nearestNode(raw) {
  return NODES.reduce((best, n) =>
    Math.abs(n - raw) < Math.abs(best - raw) ? n : best
  );
}

// ─── Distributors ────────────────────────────────────────────────────────────
const DISTRIBUTORS = Object.freeze([
  {
    id: 'arrow-electronics',
    name: 'Arrow Electronics',
    role: 'distributor',
    movementWeight: 14,    // large global reach, node 14
    baseSignal: 0.72,      // healthy channel
    description: 'Global distributor of electronic components and IBM enterprise hardware',
  },
  {
    id: 'avnet',
    name: 'Avnet',
    role: 'distributor',
    movementWeight: 14,    // comparable scale to Arrow
    baseSignal: 0.68,
    description: 'Technology distribution and supply-chain services including IBM lines',
  },
  {
    id: 'td-synnex',
    name: 'TD Synnex',
    role: 'distributor',
    movementWeight: 21,    // largest IT distributor by revenue, top node
    baseSignal: 0.75,
    description: 'Largest IT distributor; major IBM hardware/software channel partner',
  },
]);

// ─── Competitors ─────────────────────────────────────────────────────────────
const COMPETITORS = Object.freeze([
  {
    id: 'microsoft',
    name: 'Microsoft',
    role: 'competitor',
    movementWeight: 21,    // dominant cloud+enterprise, top node
    baseSignal: 0.80,
    description: 'Azure cloud and enterprise software competes directly with IBM Cloud/Watson',
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    role: 'competitor',
    movementWeight: 21,    // largest cloud provider
    baseSignal: 0.85,
    description: 'Market-leading public cloud; competes with IBM Cloud for enterprise workloads',
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    role: 'competitor',
    movementWeight: 14,    // strong AI/ML; node 14
    baseSignal: 0.70,
    description: 'AI-first cloud platform competing with IBM watsonx and data platforms',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    role: 'competitor',
    movementWeight: 14,    // strong DB/ERP overlap
    baseSignal: 0.65,
    description: 'Database and ERP leader competing with IBM Db2 and consulting services',
  },
  {
    id: 'sap',
    name: 'SAP',
    role: 'competitor',
    movementWeight: 7,     // node 7; significant ERP competitor
    baseSignal: 0.60,
    description: 'Enterprise application software competing with IBM business process portfolio',
  },
]);

// ─── Consistent Investors ─────────────────────────────────────────────────────
const INVESTORS = Object.freeze([
  {
    id: 'vanguard',
    name: 'Vanguard Group',
    role: 'investor',
    movementWeight: 21,    // largest institutional holder
    baseSignal: 0.82,
    description: 'Long-tenure top-3 IBM institutional holder; index + active funds',
  },
  {
    id: 'blackrock',
    name: 'BlackRock',
    role: 'investor',
    movementWeight: 21,    // co-largest institutional holder
    baseSignal: 0.80,
    description: 'Top-3 IBM holder; consistent through cycles via iShares and active mandates',
  },
  {
    id: 'state-street',
    name: 'State Street Global Advisors',
    role: 'investor',
    movementWeight: 14,    // top-10 holder; node 14
    baseSignal: 0.74,
    description: 'SPDR ETF and active mandates maintain consistent IBM position',
  },
]);

// ─── Suppliers ────────────────────────────────────────────────────────────────
const SUPPLIERS = Object.freeze([
  {
    id: 'intel',
    name: 'Intel',
    role: 'supplier',
    movementWeight: 14,    // processor supply; node 14
    baseSignal: 0.66,
    description: 'x86 silicon for IBM servers and ThinkPad/ThinkStation product lines',
  },
  {
    id: 'samsung-dram',
    name: 'Samsung Electronics (DRAM)',
    role: 'supplier',
    movementWeight: 14,    // memory supply; node 14
    baseSignal: 0.70,
    description: 'Primary DRAM and NAND flash supplier for IBM server and storage products',
  },
  {
    id: 'broadcom',
    name: 'Broadcom',
    role: 'supplier',
    movementWeight: 7,     // networking silicon; node 7
    baseSignal: 0.72,
    description: 'Networking and storage chips used in IBM infrastructure systems',
  },
  {
    id: 'lam-research',
    name: 'Lam Research',
    role: 'supplier',
    movementWeight: 4,     // semiconductor equipment; node 4
    baseSignal: 0.60,
    description: 'Semiconductor etch/deposition equipment feeding IBM\'s foundry supply chain',
  },
]);

// ─── IBM Core ─────────────────────────────────────────────────────────────────
const IBM_CORE = Object.freeze({
  id: 'ibm',
  name: 'International Business Machines (IBM)',
  ticker: 'IBM',
  role: 'core',
  movementWeight: 21,      // anchor node — highest weight
  baseSignal: 0.618,       // starts at φ-baseline
  safetyLevel: SAFETY_LEVEL,
  phi: PHI,
  description: 'Core entity — all projections are anchored to IBM\'s own financials',
});

// ─── Unified registry ─────────────────────────────────────────────────────────
const ALL_ENTITIES = Object.freeze([
  IBM_CORE,
  ...DISTRIBUTORS,
  ...COMPETITORS,
  ...INVESTORS,
  ...SUPPLIERS,
]);

/**
 * Get all entities of a given role.
 * @param {'distributor'|'competitor'|'investor'|'supplier'|'core'} role
 * @returns {readonly object[]}
 */
function getByRole(role) {
  return ALL_ENTITIES.filter(e => e.role === role);
}

/**
 * Get an entity by its id.
 * @param {string} id
 * @returns {object|undefined}
 */
function getById(id) {
  return ALL_ENTITIES.find(e => e.id === id);
}

/**
 * Compute the total weight for a role group (used for normalization).
 * @param {'distributor'|'competitor'|'investor'|'supplier'} role
 * @returns {number}
 */
function totalWeight(role) {
  return getByRole(role).reduce((s, e) => s + e.movementWeight, 0);
}

module.exports = {
  IBM_CORE,
  DISTRIBUTORS,
  COMPETITORS,
  INVESTORS,
  SUPPLIERS,
  ALL_ENTITIES,
  NODES,
  SAFETY_LEVEL,
  PHI,
  nearestNode,
  getByRole,
  getById,
  totalWeight,
};
