/**
 * tspGraphService.js
 * ---------------------------------------------------------------------------
 * TSP needs a COMPLETE weighted graph among the selected cities - any city
 * can be visited from any other city in a tour, unlike the sparse
 * nearest-neighbor graph used for Dijkstra/Prim/Floyd-Warshall
 * (see graphService.js). This builds a full V x V distance matrix using the
 * Haversine formula.
 *
 * This is O(V^2), same asymptotic cost as the k-NN graph builder, and is
 * cheap even for fairly large V (a few thousand cities) since Haversine is
 * a handful of trig operations. The TSP *algorithms* themselves (especially
 * Held-Karp and Branch and Bound) are what become infeasible for large V,
 * not this matrix construction step - see the algorithms in ./tsp for their
 * own, separately-justified feasibility bounds.
 */

const { haversineDistance } = require('../utils/haversine');

function buildDistanceMatrix(cities) {
  const n = cities.length;
  const matrix = Array.from({ length: n }, () => new Float64Array(n));
  const edgeList = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistance(cities[i].lat, cities[i].lng, cities[j].lat, cities[j].lng);
      matrix[i][j] = d;
      matrix[j][i] = d;
      edgeList.push({ from: cities[i].id, to: cities[j].id, weight: d });
    }
  }
  const vertices = n;
  const edges = edgeList.length;
  const averageDegree = vertices > 0 ? Number(((2 * edges) / vertices).toFixed(2)) : 0;
  const density = vertices > 1 ? Number((edges / ((vertices * (vertices - 1)) / 2)).toFixed(4)) : 0;
  return {
    matrix,
    cityIds: cities.map((c) => c.id),
    edgeList,
    graphMeta: { vertices, edges, averageDegree, density },
  };
}

module.exports = { buildDistanceMatrix };
