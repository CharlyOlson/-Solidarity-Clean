/*
 * SOLIDARITY PLATFORM - GENERIC ENTITY REGISTRY
 * ===============================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * ===============================================
 *
 * Central registry of every market actor used by the triangle
 * network system.  Works for ANY center entity — IBM, Apple,
 * Tesla, etc.  Seed loaders (e.g. ibm_entities.js) populate
 * this registry at startup.
 *
 * Entity shape:
 * {
 *   id:            string          — unique kebab-case identifier
 *   name:          string          — display name
 *   role:          string          — 'core' | 'distributor' | 'competitor' |
 *                                    'investor' | 'supplier' | 'partner'
 *   movementWeight: number         — from valid node set {1,3,4,7,14,21}
 *   baseSignal:    number [0-1]    — default market signal
 *   connections:   string[]        — IDs of related entities (both directions)
 *   meta:          object          — arbitrary extra fields (ticker, sector…)
 * }
 *
 * φ hierarchy node set  {1, 3, 4, 7, 14, 21}
 * Safety baseline       0.618
 * Scale anchor          φ = 1.618
 */

'use strict';

const PHI          = 1.618;
const SAFETY_LEVEL = 0.618;
const VALID_NODES  = Object.freeze([1, 3, 4, 7, 14, 21]);

/**
 * Snap a raw weight value to the nearest valid φ-hierarchy node.
 * @param {number} raw
 * @returns {number}
 */
function nearestNode(raw) {
  return VALID_NODES.reduce((best, n) =>
    Math.abs(n - raw) < Math.abs(best - raw) ? n : best
  );
}

/**
 * Clamp a value to [0, 1].
 * @param {number} v
 * @returns {number}
 */
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// ─── Registry store ──────────────────────────────────────────────────────────

/** @type {Map<string, object>} */
const _store = new Map();

/**
 * Register one entity.  If the entity already exists it is merged
 * (existing fields are preserved; new fields overwrite).
 *
 * @param {object} entity
 * @returns {object} The registered entity
 */
function register(entity) {
  if (!entity || typeof entity.id !== 'string' || !entity.id) {
    throw new Error('EntityRegistry.register: entity must have a non-empty string id');
  }

  const weight = nearestNode(entity.movementWeight || 1);
  const signal = clamp01(entity.baseSignal !== undefined ? entity.baseSignal : SAFETY_LEVEL);

  const existing = _store.get(entity.id) || {};
  const merged = Object.assign({}, existing, entity, {
    movementWeight: weight,
    baseSignal:     signal,
    connections:    _mergeConnections(existing.connections, entity.connections),
    meta:           Object.assign({}, existing.meta || {}, entity.meta || {}),
  });

  _store.set(entity.id, merged);
  return merged;
}

/**
 * Register an array of entities.
 * @param {object[]} entities
 */
function registerAll(entities) {
  entities.forEach(register);
}

/**
 * Look up an entity by id.
 * @param {string} id
 * @returns {object|undefined}
 */
function get(id) {
  return _store.get(id);
}

/**
 * Check whether an entity is registered.
 * @param {string} id
 * @returns {boolean}
 */
function has(id) {
  return _store.has(id);
}

/**
 * Return all entities matching a role.
 * @param {string} role
 * @returns {object[]}
 */
function getByRole(role) {
  return Array.from(_store.values()).filter(e => e.role === role);
}

/**
 * Return all registered entities.
 * @returns {object[]}
 */
function getAll() {
  return Array.from(_store.values());
}

/**
 * Return the IDs of all entities connected to the given entity.
 * Connection is bidirectional: if A lists B, B is also a connector of A.
 * @param {string} id
 * @returns {string[]}  deduplicated list of connected entity IDs
 */
function getConnections(id) {
  const entity = _store.get(id);
  if (!entity) return [];

  const direct = new Set(entity.connections || []);

  // Reverse-index: find anything that lists `id` in its connections
  for (const [otherId, other] of _store.entries()) {
    if (otherId !== id && Array.isArray(other.connections) && other.connections.includes(id)) {
      direct.add(otherId);
    }
  }

  return Array.from(direct).filter(cid => _store.has(cid));
}

/**
 * Return the connection relationship type between two entities.
 * Returns the role of the target as seen from the source, or 'related'.
 * @param {string} sourceId
 * @param {string} targetId
 * @returns {string}
 */
function getRelationship(sourceId, targetId) {
  const target = _store.get(targetId);
  return target ? target.role : 'related';
}

/**
 * Clear the entire registry (useful between test runs).
 */
function clear() {
  _store.clear();
}

/**
 * Return the number of registered entities.
 * @returns {number}
 */
function size() {
  return _store.size;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _mergeConnections(existing, incoming) {
  const set = new Set([
    ...(Array.isArray(existing) ? existing : []),
    ...(Array.isArray(incoming) ? incoming : []),
  ]);
  return Array.from(set);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  register,
  registerAll,
  get,
  has,
  getByRole,
  getAll,
  getConnections,
  getRelationship,
  clear,
  size,
  nearestNode,
  clamp01,
  PHI,
  SAFETY_LEVEL,
  VALID_NODES,
};
