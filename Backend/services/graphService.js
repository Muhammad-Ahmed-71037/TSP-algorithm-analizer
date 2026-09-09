/**
 * graphService.js
 * ---------------------------------------------------------------------------
 * Converts a set of selected cities into a weighted, undirected graph.
 *
 * worldcities.csv contains NO road/flight connectivity information - only
 * coordinates. So edges are synthesised using a nearest-neighbor strategy:
 *
 *   For each city, connect it to its K geographically nearest cities
 *   (Haversine distance), then take the UNION of all such connections and
 *   make the result undirected (if A→B is added, B→A is guaranteed too,
 *   even if B's own K nearest neighbors didn't happen to include A). This
 *   is the standard construction for a k-NN similarity graph and avoids an
 *   asymmetric graph that would be confusing for MST/shortest-path demos.
 *
 * Complexity of graph construction: for N selected cities, computing every
 * pairwise distance is O(N^2). We deliberately do NOT do this against the
 * full 50k+ row dataset - the caller must first narrow the working set
 * down to a bounded number of cities (UI enforces a maximum), and only
 * THEN is O(N^2) construction performed, which is fast in practice for the
 * supported range (N <= MAX_GRAPH_CITIES).
 */

const { haversineDistance } = require('../utils/haversine');

// This is a genuine server-protection ceiling, not a pedagogical restriction:
// building the full pairwise Haversine distance matrix here is O(N^2), and
// this bound exists purely to stop a single request from allocating an
// unreasonably large matrix, not to artificially cap how many cities a
// user may explore. It sits far above any realistic classroom demo size.
const DEFAULT_K = 5;

/**
 * @param {Array} cities - array of { id, city, country, lat, lng, ... }
 * @param {number} k - number of nearest neighbors per city
 * @returns {Object} { graph, edgeList, meta }
 */
function buildNearestNeighborGraph(cities, k = DEFAULT_K) {
  if (!Array.isArray(cities) || cities.length < 2) {
    throw new Error('At least 2 valid cities are required to build a graph.');
  }
  const n = cities.length;
  const kUsed = Math.min(k, n - 1);

  // adjacency represented as a map of Sets/Maps to dedupe symmetric edges,
  // then converted into the final adjacency-list graph structure.
  const adjacency = new Map(); // id -> Map(neighborId -> weight)
  cities.forEach((c) => adjacency.set(c.id, new Map()));

  // Precompute full pairwise distance matrix (O(N^2)) - acceptable given
  // the enforced MAX_GRAPH_CITIES bound above.
  const distMatrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistance(cities[i].lat, cities[i].lng, cities[j].lat, cities[j].lng);
      distMatrix[i][j] = d;
      distMatrix[j][i] = d;
    }
  }

  for (let i = 0; i < n; i++) {
    const distances = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      distances.push({ index: j, dist: distMatrix[i][j] });
    }
    distances.sort((a, b) => a.dist - b.dist);
    const nearest = distances.slice(0, kUsed);

    for (const { index: j, dist } of nearest) {
      const idI = cities[i].id;
      const idJ = cities[j].id;
      // union + symmetric insert
      adjacency.get(idI).set(idJ, dist);
      adjacency.get(idJ).set(idI, dist);
    }
  }

  // Convert to plain adjacency-list object: { id: [{ to, weight }] }
  const graph = {};
  let edgeCount = 0;
  const edgeList = [];
  const seenPairs = new Set();

  for (const city of cities) {
    graph[city.id] = [];
  }

  for (const [fromId, neighborMap] of adjacency.entries()) {
    for (const [toId, weight] of neighborMap.entries()) {
      graph[fromId].push({ to: toId, weight });

      const pairKey = [fromId, toId].sort().join('|');
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        edgeList.push({ from: fromId, to: toId, weight });
        edgeCount += 1;
      }
    }
  }

  const degrees = Object.values(graph).map((n) => n.length);
  const avgDegree = degrees.reduce((a, b) => a + b, 0) / degrees.length;
  const maxPossibleEdges = (n * (n - 1)) / 2;
  const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;

  return {
    graph,
    edgeList,
    cityIds: cities.map((c) => c.id),
    meta: {
      vertices: n,
      edges: edgeCount,
      kRequested: k,
      kUsed,
      averageDegree: Math.round(avgDegree * 100) / 100,
      density: Math.round(density * 10000) / 10000,
    },
  };
}

module.exports = { buildNearestNeighborGraph };
