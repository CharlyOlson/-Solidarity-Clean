/*
 * SOLIDARITY PLATFORM - IBM ENTITY SEED LOADER
 * =============================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * =============================================
 *
 * Registers all IBM-ecosystem entities into the generic entity
 * registry so the triangle network can use them.
 *
 * Every entity carries:
 *   movementWeight  – from valid φ-hierarchy node set {1,3,4,7,14,21}
 *   baseSignal      – normalised market signal [0,1]
 *   connections     – IDs of directly related entities
 *
 * Call seed() once at startup (idempotent).
 */

'use strict';

const registry = require('./entity_registry');

// ─── Raw seed data ────────────────────────────────────────────────────────────

const IBM_SEED = [

  // ── IBM Core ──────────────────────────────────────────────────
  {
    id: 'ibm',
    name: 'IBM (International Business Machines)',
    role: 'core',
    movementWeight: 21,
    baseSignal: 0.618,
    connections: [
      'arrow-electronics', 'avnet', 'td-synnex',           // distributors
      'microsoft', 'aws', 'google-cloud', 'oracle', 'sap', // competitors
      'vanguard', 'blackrock', 'state-street',              // investors
      'intel', 'samsung-dram', 'broadcom', 'lam-research',  // suppliers
    ],
    meta: { ticker: 'IBM', sector: 'Technology', exchange: 'NYSE' },
  },

  // ── Distributors ──────────────────────────────────────────────
  {
    id: 'arrow-electronics',
    name: 'Arrow Electronics',
    role: 'distributor',
    movementWeight: 14,
    baseSignal: 0.72,
    connections: [
      'ibm', 'intel', 'broadcom', 'samsung-dram',
      'td-synnex', 'avnet',
    ],
    meta: { ticker: 'ARW', sector: 'Technology Distribution', exchange: 'NYSE' },
  },
  {
    id: 'avnet',
    name: 'Avnet',
    role: 'distributor',
    movementWeight: 14,
    baseSignal: 0.68,
    connections: [
      'ibm', 'intel', 'broadcom',
      'arrow-electronics', 'td-synnex',
    ],
    meta: { ticker: 'AVT', sector: 'Technology Distribution', exchange: 'NASDAQ' },
  },
  {
    id: 'td-synnex',
    name: 'TD Synnex',
    role: 'distributor',
    movementWeight: 21,
    baseSignal: 0.75,
    connections: [
      'ibm', 'microsoft', 'intel', 'broadcom',
      'arrow-electronics', 'avnet',
    ],
    meta: { ticker: 'SNX', sector: 'Technology Distribution', exchange: 'NYSE' },
  },

  // ── Competitors ───────────────────────────────────────────────
  {
    id: 'microsoft',
    name: 'Microsoft',
    role: 'competitor',
    movementWeight: 21,
    baseSignal: 0.80,
    connections: [
      'ibm', 'td-synnex', 'aws', 'google-cloud', 'oracle',
      'vanguard', 'blackrock', 'state-street',
      'intel', 'broadcom',
    ],
    meta: { ticker: 'MSFT', sector: 'Technology', exchange: 'NASDAQ' },
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    role: 'competitor',
    movementWeight: 21,
    baseSignal: 0.85,
    connections: [
      'ibm', 'microsoft', 'google-cloud', 'oracle',
      'vanguard', 'blackrock',
      'intel', 'broadcom',
    ],
    meta: { ticker: 'AMZN', sector: 'Cloud / E-Commerce', exchange: 'NASDAQ' },
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud (Alphabet)',
    role: 'competitor',
    movementWeight: 14,
    baseSignal: 0.70,
    connections: [
      'ibm', 'microsoft', 'aws', 'oracle',
      'vanguard', 'blackrock',
      'broadcom',
    ],
    meta: { ticker: 'GOOGL', sector: 'Technology', exchange: 'NASDAQ' },
  },
  {
    id: 'oracle',
    name: 'Oracle',
    role: 'competitor',
    movementWeight: 14,
    baseSignal: 0.65,
    connections: [
      'ibm', 'microsoft', 'aws', 'google-cloud', 'sap',
      'vanguard', 'state-street',
    ],
    meta: { ticker: 'ORCL', sector: 'Enterprise Software', exchange: 'NYSE' },
  },
  {
    id: 'sap',
    name: 'SAP SE',
    role: 'competitor',
    movementWeight: 7,
    baseSignal: 0.60,
    connections: [
      'ibm', 'oracle', 'microsoft',
      'td-synnex',
    ],
    meta: { ticker: 'SAP', sector: 'Enterprise Software', exchange: 'NYSE' },
  },

  // ── Consistent Investors ──────────────────────────────────────
  {
    id: 'vanguard',
    name: 'Vanguard Group',
    role: 'investor',
    movementWeight: 21,
    baseSignal: 0.82,
    connections: [
      'ibm', 'microsoft', 'aws', 'google-cloud', 'oracle',
      'blackrock', 'state-street',
      'intel',
    ],
    meta: { sector: 'Asset Management', type: 'Institutional' },
  },
  {
    id: 'blackrock',
    name: 'BlackRock',
    role: 'investor',
    movementWeight: 21,
    baseSignal: 0.80,
    connections: [
      'ibm', 'microsoft', 'aws', 'google-cloud',
      'vanguard', 'state-street',
      'intel', 'broadcom',
    ],
    meta: { sector: 'Asset Management', type: 'Institutional' },
  },
  {
    id: 'state-street',
    name: 'State Street Global Advisors',
    role: 'investor',
    movementWeight: 14,
    baseSignal: 0.74,
    connections: [
      'ibm', 'oracle', 'microsoft',
      'vanguard', 'blackrock',
    ],
    meta: { sector: 'Asset Management', type: 'Institutional' },
  },

  // ── Suppliers ─────────────────────────────────────────────────
  {
    id: 'intel',
    name: 'Intel',
    role: 'supplier',
    movementWeight: 14,
    baseSignal: 0.66,
    connections: [
      'ibm', 'microsoft', 'aws',
      'arrow-electronics', 'avnet', 'td-synnex',
      'broadcom', 'lam-research',
      'vanguard', 'blackrock',
    ],
    meta: { ticker: 'INTC', sector: 'Semiconductors', exchange: 'NASDAQ' },
  },
  {
    id: 'samsung-dram',
    name: 'Samsung Electronics (DRAM/NAND)',
    role: 'supplier',
    movementWeight: 14,
    baseSignal: 0.70,
    connections: [
      'ibm', 'arrow-electronics',
      'broadcom', 'lam-research',
    ],
    meta: { ticker: '005930.KS', sector: 'Semiconductors', exchange: 'KRX' },
  },
  {
    id: 'broadcom',
    name: 'Broadcom',
    role: 'supplier',
    movementWeight: 7,
    baseSignal: 0.72,
    connections: [
      'ibm', 'microsoft', 'aws',
      'arrow-electronics', 'avnet', 'td-synnex',
      'intel', 'lam-research',
      'blackrock',
    ],
    meta: { ticker: 'AVGO', sector: 'Semiconductors', exchange: 'NASDAQ' },
  },
  {
    id: 'lam-research',
    name: 'Lam Research',
    role: 'supplier',
    movementWeight: 4,
    baseSignal: 0.60,
    connections: [
      'ibm', 'intel', 'samsung-dram', 'broadcom',
    ],
    meta: { ticker: 'LRCX', sector: 'Semiconductor Equipment', exchange: 'NASDAQ' },
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────

let _seeded = false;

/**
 * Register all IBM-ecosystem entities into the generic registry.
 * Idempotent — safe to call multiple times.
 */
function seed() {
  if (_seeded) return;
  registry.registerAll(IBM_SEED);
  _seeded = true;
}

/**
 * Force a re-seed even if already seeded (useful in tests).
 */
function reseed() {
  _seeded = false;
  seed();
}

module.exports = { seed, reseed, IBM_SEED };
