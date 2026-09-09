/**
 * dijkstra.js
 * ---------------------------------------------------------------------------
 * DAA Classification : Greedy Algorithm
 * Problem             : Single-Source Shortest Path
 * Data structures      : Adjacency list + binary min-heap priority queue
 * Time complexity      : O((V + E) log V)   (binary heap implementation)
 * Space complexity      : O(V + E)
 *
 * This is a from-scratch implementation. No routing/shortest-path library is
 * used. Every step below mirrors the textbook algorithm:
 *
 *   1. Initialize distances to Infinity, source to 0.
 *   2. Push source into the priority queue.
 *   3. While the queue is not empty:
 *        a. Pop the unvisited vertex with the smallest tentative distance.
 *        b. Mark it visited (finalized).
 *        c. For each neighbor, attempt an edge "relaxation":
 *             if dist[u] + weight(u,v) < dist[v]: update dist[v], prev[v]
 *   4. Stop early once the destination is popped (finalized).
 *   5. Reconstruct the path by walking `previous` pointers backward.
 *
 * The function also records a structured `steps` array so the frontend can
 * replay the exact decisions the algorithm made, node by node, edge by edge.
 */

const MinHeap = require('../utils/MinHeap');

/**
 * @param {Object} graph - adjacency list: { [cityId]: [{ to, weight }] }
 * @param {string} sourceId
 * @param {string} destinationId
 * @returns {Object} structured result: { result, steps, metrics, complexity }
 */
function dijkstra(graph, sourceId, destinationId) {
  if (!graph[sourceId]) {
    throw new Error(`Source city "${sourceId}" does not exist in the graph.`);
  }
  if (!graph[destinationId]) {
    throw new Error(`Destination city "${destinationId}" does not exist in the graph.`);
  }

  const startTime = process.hrtime.bigint();

  const distances = {};
  const previous = {};
  const visited = new Set();
  const steps = [];

  let nodesProcessed = 0;
  let edgesExamined = 0;
  let relaxations = 0;

  // ---- Step 1 & 2: initialization ----------------------------------------
  Object.keys(graph).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
  });
  distances[sourceId] = 0;

  steps.push({
    step: steps.length + 1,
    action: 'initialize',
    description: `Initialize all distances to Infinity, set source (${sourceId}) to 0.`,
    currentNode: sourceId,
    distances: { ...distances },
    visitedNodes: [],
  });

  const pq = new MinHeap();
  pq.push(sourceId, 0);

  let destinationReached = false;

  // ---- Step 3: main loop ---------------------------------------------------
  while (!pq.isEmpty()) {
    const { key: currentNode, priority: currentDist } = pq.pop();

    // Lazy-deletion check: skip stale heap entries.
    if (visited.has(currentNode)) continue;
    if (currentDist > distances[currentNode]) continue;

    visited.add(currentNode);
    nodesProcessed += 1;

    steps.push({
      step: steps.length + 1,
      action: 'select-min',
      description: `Select unvisited node with smallest tentative distance: ${currentNode} (${currentDist === Infinity ? '∞' : currentDist} km).`,
      currentNode,
      distances: { ...distances },
      visitedNodes: [...visited],
    });

    if (currentNode === destinationId) {
      destinationReached = true;
      break; // Early exit once destination is finalized - still correct Dijkstra.
    }

    const neighbors = graph[currentNode] || [];
    for (const edge of neighbors) {
      edgesExamined += 1;
      const { to: neighbor, weight } = edge;
      if (visited.has(neighbor)) continue;

      const candidateDist = distances[currentNode] + weight;

      steps.push({
        step: steps.length + 1,
        action: 'examine-edge',
        description: `Examine edge ${currentNode} → ${neighbor} (weight ${weight} km).`,
        currentNode,
        edge: [currentNode, neighbor],
        weight,
        distances: { ...distances },
        visitedNodes: [...visited],
      });

      if (candidateDist < distances[neighbor]) {
        const oldDist = distances[neighbor];
        distances[neighbor] = candidateDist;
        previous[neighbor] = currentNode;
        pq.push(neighbor, candidateDist);
        relaxations += 1;

        steps.push({
          step: steps.length + 1,
          action: 'relax',
          description: `Relax edge ${currentNode} → ${neighbor}: distance improves from ${oldDist === Infinity ? '∞' : oldDist} to ${candidateDist}.`,
          currentNode,
          edge: [currentNode, neighbor],
          previousDistance: oldDist,
          updatedDistance: candidateDist,
          distances: { ...distances },
          visitedNodes: [...visited],
        });
      }
    }
  }

  // ---- Step 5: path reconstruction -----------------------------------------
  const path = [];
  if (distances[destinationId] !== Infinity) {
    let cur = destinationId;
    while (cur !== null) {
      path.unshift(cur);
      cur = previous[cur];
    }
  }

  steps.push({
    step: steps.length + 1,
    action: 'complete',
    description:
      path.length > 0
        ? `Destination reached. Reconstructed shortest path with ${path.length} cities.`
        : `Destination is unreachable from the source in this graph.`,
    currentNode: destinationId,
    path,
    distances: { ...distances },
    visitedNodes: [...visited],
  });

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1_000_000;

  return {
    algorithm: 'Dijkstra',
    category: 'Greedy Algorithm',
    problemType: 'Single-Source Shortest Path',
    result: {
      source: sourceId,
      destination: destinationId,
      reachable: destinationReached && distances[destinationId] !== Infinity,
      distance: distances[destinationId] === Infinity ? null : distances[destinationId],
      path,
      pathLength: path.length,
    },
    steps,
    metrics: {
      nodesInGraph: Object.keys(graph).length,
      nodesProcessed,
      edgesExamined,
      relaxations,
      totalSteps: steps.length,
      executionTimeMs: Math.round(executionTimeMs * 1000) / 1000,
    },
    complexity: {
      time: 'O((V + E) log V)',
      space: 'O(V + E)',
      note: 'Binary min-heap priority queue implementation.',
    },
  };
}

module.exports = dijkstra;
