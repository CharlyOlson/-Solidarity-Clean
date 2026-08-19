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
 * BFS-expanding fractal triangle network.
 *
 * Starting from any center entity the builder:
 *   1. Fetches the entity's connections from the registry
 *   2. Pairs connectors to form triangles (each triangle = center + connA + connB)
 *   3. Each vertex IS a registered entity — it becomes the center of its own
 *      triangle next, connected at the shared tip (no duplication)
 *   4. Expansion continues BFS-outward until:
 *      a) a node has fewer than 2 unvisited connections, OR
 *      b) maxDepth is reached
 *
 * Every triangle carries full Pythagorean balance data:
 *   balance score, corrected signals, hypotenuse, all three means.
 *
 * Output shape:
 * {
 *   nodes:            Map<id, NodeRecord>
 *   edges:            Set<"idA--idB">        (undirected, no duplicates)
 *   triangles:        TriangleRecord[]
 *   depth:            number
 *   centerEntityId:   string
 *   coherenceMap:     Map<id, number>        (per-node average coherence)
 *   networkCoherence: number                 (φ-weighted overall)
 *   pythagoreanSummary: object               (network-wide balance stats)
 * }
 *
 * NodeRecord {
 *   id, name, role, signal, tier, depth, movementWeight
 * }
 *
 * TriangleRecord {
 *   id, vertices:[id,id,id], coherenceScore, rawCoherence,
 *   safetyTier, isOptimal, depth,
 *   pythagorean: { balance, balanceLabel, isBalanced, hypotenuse,
 *                  means:{arithmetic,geometric,harmonic},
 *                  corrected:{a,b,c,corrected}, pythagoreanBonus }
 * }
 */

'use strict';

const registry     = require('./entity_registry');
const { computeTriangle, resolveTier } = require('./three_point_connector');
const { PHI, SAFETY_LEVEL, clamp01 }  = registry;

const DEFAULT_MAX_DEPTH = 7;

/**
 * Build the fractal triangle network starting from `centerEntityId`.
 *
 * @param {string} centerEntityId
 * @param {object} [opts]
 * @param {number}             [opts.maxDepth=7]
 * @param {Map<string,number>} [opts.overrides]
 * @param {number}             [opts.safetyLevel=0.618]
 * @returns {object}
 */
function buildNetwork(centerEntityId, opts = {}) {
  const maxDepth    = opts.maxDepth    !== undefined ? opts.maxDepth    : DEFAULT_MAX_DEPTH;
  const overrides   = opts.overrides   instanceof Map ? opts.overrides  : new Map();
  const safetyLevel = opts.safetyLevel !== undefined ? opts.safetyLevel : SAFETY_LEVEL;

  if (!registry.has(centerEntityId)) {
    throw new Error(`TriangleNetwork: entity "${centerEntityId}" not found in registry`);
  }

  /** @type {Map<string, object>} */
  const nodes     = new Map();
  /** @type {Set<string>} */
  const edges     = new Set();
  /** @type {object[]} */
  const triangles = [];

  // Prevents a node from being used as a center more than once
  const centeredAlready = new Set();

  // BFS queue
  const queue = [{ entityId: centerEntityId, depth: 0 }];
  let maxDepthReached = 0;

  // ── Helpers ──────────────────────────────────────────────────
  function ensureNode(entityId, depth) {
    if (nodes.has(entityId)) {
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

  function addEdge(a, b) {
    edges.add([a, b].sort().join('--'));
  }

  // ── BFS ──────────────────────────────────────────────────────
  while (queue.length > 0) {
    const { entityId, depth } = queue.shift();

    if (centeredAlready.has(entityId)) continue;
    if (depth > maxDepth)              continue;

    centeredAlready.add(entityId);
    ensureNode(entityId, depth);
    if (depth > maxDepthReached) maxDepthReached = depth;

    const connIds = registry.getConnections(entityId)
      .filter(cid => registry.has(cid));

    if (connIds.length < 2) continue;

    // Each adjacent pair forms one triangle
    for (let i = 0; i < connIds.length - 1; i++) {
      const connA = connIds[i];
      const connB = connIds[i + 1];

      ensureNode(connA, depth + 1);
      ensureNode(connB, depth + 1);

      addEdge(entityId, connA);
      addEdge(entityId, connB);
      addEdge(connA,    connB);

      // Compute triangle — full Pythagorean analysis included
      const tri = computeTriangle(entityId, connA, connB, overrides, safetyLevel);

      triangles.push({
        id:             `${entityId}--${connA}--${connB}`,
        vertices:       [entityId, connA, connB],
        coherenceScore: tri.coherenceScore,
        rawCoherence:   tri.rawCoherence,
        safetyTier:     tri.safetyTier,
        isOptimal:      tri.isOptimal,
        depth,
        pythagorean:    tri.pythagorean,
        means:          tri.means,
      });

      // Enqueue tips
      if (!centeredAlready.has(connA) && depth + 1 <= maxDepth) {
        queue.push({ entityId: connA, depth: depth + 1 });
      }
      if (!centeredAlready.has(connB) && depth + 1 <= maxDepth) {
        queue.push({ entityId: connB, depth: depth + 1 });
      }
    }
  }

  const coherenceMap      = _buildCoherenceMap(nodes, triangles);
  const networkCoherence  = _networkCoherence(triangles);
  const pythagoreanSummary = _pythagoreanSummary(triangles);

  return {
    nodes,
    edges,
    triangles,
    depth:              maxDepthReached,
    centerEntityId,
    coherenceMap,
    networkCoherence,
    pythagoreanSummary,
    safetyLevel,
  };
}

/**
 * Convert the network to a plain JSON-serialisable graph object
 * suitable for D3, Cytoscape, or any renderer.
 *
 * @param {object} network
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
      rawCoherence:   parseFloat(t.rawCoherence.toFixed(4)),
      safetyTier:     t.safetyTier,
      isOptimal:      t.isOptimal,
      depth:          t.depth,
      pythagorean: {
        balance:          t.pythagorean.balance,
        balanceLabel:     t.pythagorean.balanceLabel,
        isBalanced:       t.pythagorean.isBalanced,
        hypotenuse:       t.pythagorean.hypotenuse,
        pythagoreanBonus: t.pythagorean.pythagoreanBonus,
      },
      means: t.means,
    })),
    summary: {
      centerEntityId:      network.centerEntityId,
      nodeCount:           network.nodes.size,
      edgeCount:           network.edges.size,
      triangleCount:       network.triangles.length,
      maxDepth:            network.depth,
      networkCoherence:    parseFloat(network.networkCoherence.toFixed(4)),
      safetyTier:          resolveTier(network.networkCoherence),
      isOptimal:           network.networkCoherence >= 0.25 && network.networkCoherence < 0.75,
      pythagorean:         network.pythagoreanSummary,
    },
  };
}

/**
 * Print a compact text report to stdout.
 * @param {object} network
 */
function printReport(network) {
  const g = toRenderableGraph(network);
  const s = g.summary;
  console.log('\n' + '═'.repeat(68));
  console.log(`TRIANGLE NETWORK — center: ${s.centerEntityId}`);
  console.log('═'.repeat(68));
  console.log(`Nodes       : ${s.nodeCount}`);
  console.log(`Edges       : ${s.edgeCount}`);
  console.log(`Triangles   : ${s.triangleCount}`);
  console.log(`Max Depth   : ${s.maxDepth}`);
  console.log(`Net Coh.    : ${s.networkCoherence} [${s.safetyTier}]`);
  console.log(`Optimal?    : ${s.isOptimal ? '✅ YES' : '⚠️  NO'}`);
  console.log('─'.repeat(68));
  console.log('PYTHAGOREAN SUMMARY');
  console.log(`  Avg Balance    : ${s.pythagorean.avgBalance}`);
  console.log(`  Balanced Tri.  : ${s.pythagorean.balancedCount} / ${s.triangleCount}`);
  console.log(`  Dominant Label : ${s.pythagorean.dominantLabel}`);
  console.log(`  Arith Mean     : ${s.pythagorean.meanArithmetic}`);
  console.log(`  Geom  Mean     : ${s.pythagorean.meanGeometric}`);
  console.log(`  Harm  Mean     : ${s.pythagorean.meanHarmonic}`);
  console.log('─'.repeat(68));

  const byDepth = {};
  g.triangles.forEach(t => {
    (byDepth[t.depth] = byDepth[t.depth] || []).push(t);
  });
  Object.keys(byDepth).sort((a,b) => a-b).forEach(d => {
    console.log(`\nDepth ${d} triangles:`);
    byDepth[d].forEach(t => {
      console.log(
        `  [${t.safetyTier.padEnd(14)}] coh=${t.coherenceScore.toFixed(4)}` +
        `  bal=${t.pythagorean.balance.toFixed(3)} (${t.pythagorean.balanceLabel.padEnd(8)})` +
        `  ${t.vertices.join(' → ')}`
      );
    });
  });
  console.log('═'.repeat(68));
}

// ── Private helpers ───────────────────────────────────────────────────────────

function _buildCoherenceMap(nodes, triangles) {
  const sums   = new Map();
  const counts = new Map();
  for (const id of nodes.keys()) { sums.set(id, 0); counts.set(id, 0); }
  triangles.forEach(t => {
    t.vertices.forEach(id => {
      sums.set(id,   (sums.get(id)   || 0) + t.coherenceScore);
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
  let weightedSum = 0;
  let totalWeight = 0;
  triangles.forEach(t => {
    const w = 1 / Math.pow(PHI, t.depth);
    weightedSum += t.coherenceScore * w;
    totalWeight += w;
  });
  return clamp01(weightedSum / totalWeight);
}

function _pythagoreanSummary(triangles) {
  if (triangles.length === 0) {
    return { avgBalance: 0, balancedCount: 0, dominantLabel: 'NONE',
             meanArithmetic: 0, meanGeometric: 0, meanHarmonic: 0 };
  }
  let balanceSum = 0;
  let balancedCount = 0;
  let arithSum = 0, geoSum = 0, harmSum = 0;
  const labelCounts = {};

  triangles.forEach(t => {
    const p = t.pythagorean;
    balanceSum += p.balance;
    if (p.isBalanced) balancedCount++;
    arithSum += t.means.arithmetic;
    geoSum   += t.means.geometric;
    harmSum  += t.means.harmonic;
    labelCounts[p.balanceLabel] = (labelCounts[p.balanceLabel] || 0) + 1;
  });

  const n = triangles.length;
  const dominantLabel = Object.keys(labelCounts)
    .sort((a,b) => labelCounts[b] - labelCounts[a])[0];

  return {
    avgBalance:      parseFloat((balanceSum / n).toFixed(4)),
    balancedCount,
    dominantLabel,
    meanArithmetic:  parseFloat((arithSum / n).toFixed(4)),
    meanGeometric:   parseFloat((geoSum   / n).toFixed(4)),
    meanHarmonic:    parseFloat((harmSum  / n).toFixed(4)),
  };
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
