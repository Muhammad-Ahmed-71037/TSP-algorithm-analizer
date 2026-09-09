/**
 * floydWarshall.js
 * ---------------------------------------------------------------------------
 * DAA Classification : Dynamic Programming
 * Problem              : All-Pairs Shortest Path
 * Data structure        : V x V distance matrix (+ V x V "next" matrix for
 *                          path reconstruction)
 * Time complexity       : O(V^3)
 * Space complexity      : O(V^2)
 *
 * From-scratch implementation of the standard recurrence:
 *
 *   D[k][i][j] = min( D[k-1][i][j],  D[k-1][i][k] + D[k-1][k][j] )
 *
 * i.e. "is it shorter to go from i to j directly, or via intermediate
 * vertex k?" We use the common space optimisation of updating the matrix
 * in place (a single V x V matrix reused across all k), which is
 * mathematically equivalent to keeping V+1 layers.
 *
 * VISUALIZATION NOTE:
 * For V vertices the algorithm performs exactly V^3 comparisons. For a
 * graph of, say, 60 cities that is 216,000 comparisons - far too many to
 * animate one-by-one in a browser. So we:
 *   - always compute the mathematically correct, full result over all V^3
 *     comparisons (never skipped, never approximated), and
 *   - record a *step* only when a cell is actually IMPROVED (this is what a
 *     student watching the visualizer actually wants to see), capped at
 *     `maxSteps` recorded entries. If more updates occur than that cap,
 *     `truncatedSteps` is reported honestly in the metrics.
 */

/**
 * @param {Object} graph - adjacency list: { [cityId]: [{ to, weight }] }
 * @param {string[]} cityIds - ordered list of vertex ids (defines matrix indices)
 * @param {number} maxSteps - cap on how many update-steps are recorded for the UI
 * @returns {Object} structured result: { result, steps, metrics, complexity }
 */
function floydWarshall(graph, cityIds, maxSteps = 500) {
  const V = cityIds.length;
  const startTime = process.hrtime.bigint();

  const indexOf = new Map(cityIds.map((id, i) => [id, i]));

  // ---- Initialize distance matrix -----------------------------------------
  const dist = Array.from({ length: V }, () => new Array(V).fill(Infinity));
  const next = Array.from({ length: V }, () => new Array(V).fill(null));

  for (let i = 0; i < V; i++) {
    dist[i][i] = 0;
    next[i][i] = i;
  }

  for (const fromId of cityIds) {
    const i = indexOf.get(fromId);
    const edges = graph[fromId] || [];
    for (const edge of edges) {
      const j = indexOf.get(edge.to);
      if (j === undefined) continue;
      if (edge.weight < dist[i][j]) {
        dist[i][j] = edge.weight;
        next[i][j] = j;
      }
    }
  }

  const steps = [];
  let totalComparisons = 0;
  let totalUpdates = 0;
  let truncatedSteps = false;

  // ---- Core O(V^3) triple loop --------------------------------------------
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      // Small pruning: skip if there's no path i->k at all (still correct,
      // purely an implementation-level speed-up, does not change asymptotic
      // worst case, which remains O(V^3)).
      if (dist[i][k] === Infinity) continue;
      for (let j = 0; j < V; j++) {
        totalComparisons += 1;
        const throughK = dist[i][k] + dist[k][j];
        if (throughK < dist[i][j]) {
          const oldValue = dist[i][j];
          dist[i][j] = throughK;
          next[i][j] = next[i][k];
          totalUpdates += 1;

          if (steps.length < maxSteps) {
            steps.push({
              step: steps.length + 1,
              action: 'update',
              intermediateVertex: cityIds[k],
              from: cityIds[i],
              to: cityIds[j],
              previousDistance: oldValue === Infinity ? null : oldValue,
              viaDistance: Math.round(throughK * 100) / 100,
              description: `Via ${cityIds[k]}: D[${cityIds[i]}][${cityIds[j]}] improves from ${
                oldValue === Infinity ? '∞' : oldValue
              } to ${Math.round(throughK * 100) / 100}.`,
            });
          } else {
            truncatedSteps = true;
          }
        }
      }
    }
  }

  // ---- Path reconstruction helper -----------------------------------------
  function reconstructPath(fromId, toId) {
    const i = indexOf.get(fromId);
    const j = indexOf.get(toId);
    if (i === undefined || j === undefined) return null;
    if (next[i][j] === null) return null; // unreachable

    const path = [cityIds[i]];
    let cur = i;
    let guard = 0;
    while (cur !== j && guard < V + 1) {
      cur = next[cur][j];
      path.push(cityIds[cur]);
      guard += 1;
    }
    return path;
  }

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1_000_000;

  return {
    algorithm: 'Floyd-Warshall',
    category: 'Dynamic Programming',
    problemType: 'All-Pairs Shortest Path',
    cityIds,
    matrix: dist,
    // expose a bound reconstruction function for controllers to call with a
    // specific source/destination pair without re-running the DP.
    reconstructPath,
    steps,
    metrics: {
      nodesInGraph: V,
      totalComparisons,
      totalUpdates,
      recordedSteps: steps.length,
      truncatedSteps,
      executionTimeMs: Math.round(executionTimeMs * 1000) / 1000,
    },
    complexity: {
      time: 'O(V^3)',
      space: 'O(V^2)',
      note: 'In-place V x V distance matrix updated across V iterations of intermediate vertex k.',
    },
  };
}

module.exports = floydWarshall;
