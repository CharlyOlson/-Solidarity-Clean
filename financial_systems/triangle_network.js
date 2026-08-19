/*
 * SOLIDARITY PLATFORM - TRIANGLE NETWORK BUILDER
 * ================================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * ================================================
 *
 * BFS-expanding triangle network.
 *
 * Starting from any center entity, the builder:
 *   1. Fetches the entity's connections from the registry
 *   2. Picks pairs of connectors to form triangles
 *      (each triangle = center + connA + connB)
 *   3. Each vertex (connA, connB) is itself an entity —
 *      so it becomes the center of its own triangle next
 *   4. Expansion continues BFS-outward until:
 *      a) a node has fewer than 2 unvisited connections, OR
 *      b) maxDepth is reached
 *
 * Result is a GRAPH — every node is unique (shared tips are
 * the same node object, not a copy), giving the fractal
 * mesh of connected triangles described in the spec.
 *
 * Output shape:
 * {
 *   nodes:     Map<id, NodeRecord>
 *   edges:     Set<"idA--idB">        (undirected, no duplicates)
 *   triangles: TriangleRecord[]
 *   depth:     number                 (max depth reached)
 *   centerEntityId: string
 *   coherenceMap: Map<id, number>     (per-node average coherence)
 *   networkCoherence: number          (φ-weighted overall score)
 * }
 *
 * NodeRecord  { id, name, role, signal, tier, depth, movementWeight }
 * TriangleRecord {
 *   id: string,            "centerId--connA--connB"
 *   vertices: [id,id,id],
 *   coherenceScore: number,
 *   safetyTier: string,
 *   isOptimal: boolean,
 *   depth: number,
 * }
 *
 * Henry node set for maxDepth default: {1,3,4,7,14,21}
 * φ = 1.618   safetyLevel = 0.618
 */

'use strict';

const registry     = require('./entity_registry');
const { computeTriangle, resolveTier } = require('./three_point_connector');
const { PHI, SAFETY_LEVEL, clamp01 }  = registry;

const DEFAULT_MAX_DEPTH = 7;   // Henry node 7

/**
 * Build the fractal triangle network starting from `centerEntityId`.
 *
 * @param {string} centerEntityId
 * @param {object} [opts]
 * @param {number} [opts.maxDepth=7]
 * @param {Map<string,number>} [opts.overrides]  signal overrides
 * @param {number} [opts.safetyLevel=0.618]
 * @returns {object}  graph described in module header
 */
function buildNetwork(centerEntityId, opts = {}) {
  const maxDepth    = opts.maxDepth    !== undefined ? opts.maxDepth    : DEFAULT_MAX_DEPTH;
  const overrides   = opts.overrides   instanceof Map ? opts.overrides  : new Map();
  const safetyLevel = opts.safetyLevel !== undefined ? opts.safetyLevel : SAFETY_LEVEL;

  if (!registry.has(centerEntityId)) {
    throw new Error(`TriangleNetwork: entity "${centerEntityId}" not found in registry`);
  }

  // ── Output structures ──────────────────────────────────────────
  /** @type {Map<string, object>} */
  const nodes     = new Map();
  /** @type {Set<string>} */
  const edges     = new Set();
  /** @type {object[]} */
  const triangles = [];

  // Track which triangles each node has already been the CENTER of
  // (prevents infinite loops on shared tips)
  const centeredAlready = new Set();

  // BFS queue entries: { entityId, depth }
  const queue = [{ entityId: centerEntityId, depth: 0 }];

  let maxDepthReached = 0;

  // ── Helper: ensure a node is registered in output ─────────────
  function ensureNode(entityId, depth) {
    if (nodes.has(entityId)) {
      // Update depth to the shallowest seen
      const existing = nodes.get(entityId);
      if (depth < existing.depth) existing.depth = depth;
      return;
    }
    const entity = registry.get(entityId);
    if (!entity) return;
    const rawSignal = overrides.has(entityId) ? overrides.get(entityId) : entity.baseSignal;
    const signal    = clamp01(rawSignal);
    nodes.set(entityId, {
      id:             entity.id,
      name:           entity.name,
      role:           entity.role,
      signal,
      tier:           resolveTier(signal),
      depth,
      movementWeight: entity.movementWeight,
    });
  }

  // ── Helper: record an undirected edge ─────────────────────────
  function addEdge(a, b) {
    const key = [a, b].sort().join('--');
    edges.add(key);
  }

  // ── BFS ───────────────────────────────────────────────────────
  while (queue.length > 0) {
    const { entityId, depth } = queue.shift();

    if (centeredAlready.has(entityId)) continue;
    if (depth > maxDepth) continue;

    centeredAlready.add(entityId);
    ensureNode(entityId, depth);

    if (depth > maxDepthReached) maxDepthReached = depth;

    // Fetch connections from registry (bidirectional)
    const connIds = registry.getConnections(entityId)
      .filter(cid => registry.has(cid));

    if (connIds.length < 2) continue;  // can't form a triangle

    // Pair connectors: every adjacent pair forms one triangle
    // (connIds[0]+connIds[1], connIds[1]+connIds[2], …)
    // This gives N-1 triangles for N connections, all sharing
    // the center entity, maximising coverage without repetition.
    for (let i = 0; i < connIds.length - 1; i++) {
      const connA = connIds[i];
      const connB = connIds[i + 1];

      ensureNode(connA, depth + 1);
      ensureNode(connB, depth + 1);

      addEdge(entityId, connA);
      addEdge(entityId, connB);
      addEdge(connA, connB);

      const tri = computeTriangle(entityId, connA, connB, overrides, safetyLevel);

      const triangleId = `${entityId}--${connA}--${connB}`;
      triangles.push({
        id:             triangleId,
        vertices:       [entityId, connA, connB],
        coherenceScore: tri.coherenceScore,
        safetyTier:     tri.safetyTier,
        isOptimal:      tri.isOptimal,
        depth,
      });

      // Enqueue tips as future centers if not already processed
      if (!centeredAlready.has(connA) && depth + 1 <= maxDepth) {
        queue.push({ entityId: connA, depth: depth + 1 });
      }
      if (!centeredAlready.has(connB) && depth + 1 <= maxDepth) {
        queue.push({ entityId: connB, depth: depth + 1 });
      }
    }
  }

  // ── Per-node coherence average ─────────────────────────────────
  const coherenceMap = _buildCoherenceMap(nodes, triangles);

  // ── Network-wide coherence (φ-weighted by movementWeight) ─────
  const networkCoherence = _networkCoherence(triangles);

  return {
    nodes,
    edges,
    triangles,
    depth:            maxDepthReached,
    centerEntityId,
    coherenceMap,
    networkCoherence,
    safetyLevel,
  };
}

/**
 * Render the network as a plain JSON-serialisable object
 * (nodes as array, edges as array of {source,target} objects).
 * Suitable for D3, Cytoscape, or any graph renderer.
 *
 * @param {object} network  result of buildNetwork()
 * @returns {object}
 */
function toRenderableGraph(network) {
  return {
    nodes: Array.from(network.nodes.values()).map(n => ({
      id:             n.id,
      name:           n.name,
      role:           n.role,
      signal:         parseFloat(n.signal.toFixed(4)),
      tier:           n.tier,
      depth:          n.depth,
      movementWeight: n.movementWeight,
      coherence:      parseFloat((network.coherenceMap.get(n.id) || 0).toFixed(4)),
    })),
    edges: Array.from(network.edges).map(key => {
      const [source, target] = key.split('--');
      return { source, target, type: _edgeType(source, target) };
    }),
    triangles: network.triangles.map(t => ({
      id:             t.id,
      vertices:       t.vertices,
      coherenceScore: parseFloat(t.coherenceScore.toFixed(4)),
      safetyTier:     t.safetyTier,
      isOptimal:      t.isOptimal,
      depth:          t.depth,
    })),
    summary: {
      centerEntityId:   network.centerEntityId,
      nodeCount:        network.nodes.size,
      edgeCount:        network.edges.size,
      triangleCount:    network.triangles.size || network.triangles.length,
      maxDepth:         network.depth,
      networkCoherence: parseFloat(network.networkCoherence.toFixed(4)),
      safetyTier:       resolveTier(network.networkCoherence),
      isOptimal:        network.networkCoherence >= 0.25 && network.networkCoherence < 0.75,
    },
  };
}

/**
 * Print a compact text report of the network to stdout.
 * @param {object} network
 */
function printReport(network) {
  const g = toRenderableGraph(network);
  console.log('\n' + '═'.repeat(64));
  console.log(`TRIANGLE NETWORK — center: ${g.summary.centerEntityId}`);
  console.log('═'.repeat(64));
  console.log(`Nodes     : ${g.summary.nodeCount}`);
  console.log(`Edges     : ${g.summary.edgeCount}`);
  console.log(`Triangles : ${g.summary.triangleCount}`);
  console.log(`Max Depth : ${g.summary.maxDepth}`);
  console.log(`Net Coh.  : ${g.summary.networkCoherence} [${g.summary.safetyTier}]`);
  console.log(`Optimal?  : ${g.summary.isOptimal ? '✅ YES' : '⚠️  NO'}`);
  console.log('─'.repeat(64));

  // Group triangles by depth
  const byDepth = {};
  g.triangles.forEach(t => {
    (byDepth[t.depth] = byDepth[t.depth] || []).push(t);
  });
  Object.keys(byDepth).sort((a,b)=>a-b).forEach(d => {
    console.log(`\nDepth ${d} triangles:`);
    byDepth[d].forEach(t => {
      console.log(
        `  [${t.safetyTier.padEnd(14)}] coh=${t.coherenceScore.toFixed(4)}` +
        `  ${t.vertices.join(' → ')}`
      );
    });
  });
  console.log('═'.repeat(64));
}

// ── Private helpers ───────────────────────────────────────────────────────────

function _buildCoherenceMap(nodes, triangles) {
  const sums   = new Map();
  const counts = new Map();
  for (const id of nodes.keys()) { sums.set(id, 0); counts.set(id, 0); }

  triangles.forEach(t => {
    t.vertices.forEach(id => {
      sums.set(id, (sums.get(id) || 0) + t.coherenceScore);
      counts.set(id, (counts.get(id) || 0) + 1);
    });
  });

  const map = new Map();
  for (const id of nodes.keys()) {
    const c = counts.get(id) || 0;
    map.set(id, c > 0 ? sums.get(id) / c : 0);
  }
  return map;
}

function _networkCoherence(triangles) {
  if (triangles.length === 0) return SAFETY_LEVEL;
  // Weight each triangle's coherence by its movementWeight sum via φ-decay by depth
  let weightedSum = 0;
  let totalWeight = 0;
  triangles.forEach(t => {
    // Deeper triangles contribute less (φ^depth decay)
    const w = 1 / Math.pow(PHI, t.depth);
    weightedSum += t.coherenceScore * w;
    totalWeight += w;
  });
  return clamp01(weightedSum / totalWeight);
}

function _edgeType(sourceId, targetId) {
  const src = registry.get(sourceId);
  const tgt = registry.get(targetId);
  if (!src || !tgt) return 'related';
  if (src.role === 'core' || tgt.role === 'core') return 'core-link';
  if (src.role === tgt.role) return `${src.role}-peer`;
  return `${src.role}-${tgt.role}`;
}

module.exports = {
  buildNetwork,
  toRenderableGraph,
  printReport,
  DEFAULT_MAX_DEPTH,
};
