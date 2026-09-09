/**
 * prim.js
 * ---------------------------------------------------------------------------
 * DAA Classification : Greedy Algorithm
 * Problem              : Minimum Spanning Tree (MST)
 * Data structures       : Adjacency list + binary min-heap priority queue
 * Time complexity       : O(E log V)   (binary heap implementation)
 * Space complexity      : O(V + E)
 *
 * From-scratch implementation. No external MST library is used.
 *
 *   1. Pick a starting vertex; mark it "in MST".
 *   2. Push all its outgoing edges into a priority queue keyed by weight.
 *   3. Repeatedly pop the minimum-weight edge whose far endpoint is NOT yet
 *      in the MST:
 *        - add that edge to the MST
 *        - mark the far endpoint as "in MST"
 *        - push all of the new vertex's outgoing edges
 *   4. Stop when the queue is empty (all reachable vertices included).
 *
 * Note: if the underlying graph is disconnected, Prim will only return a
 * spanning tree of the connected component containing the start vertex.
 * This is expected behaviour and is reported explicitly in the result.
 */

const MinHeap = require('../utils/MinHeap');

/**
 * @param {Object} graph - adjacency list: { [cityId]: [{ to, weight }] }
 * @param {string} startId
 * @returns {Object} structured result: { result, steps, metrics, complexity }
 */
function prim(graph, startId) {
  if (!graph[startId]) {
    throw new Error(`Start city "${startId}" does not exist in the graph.`);
  }

  const startTime = process.hrtime.bigint();

  const inMST = new Set();
  const mstEdges = [];
  const steps = [];
  let totalWeight = 0;
  let edgesConsidered = 0;
  let edgesRejected = 0;

  inMST.add(startId);
  steps.push({
    step: steps.length + 1,
    action: 'start',
    description: `Start MST construction from ${startId}.`,
    currentNode: startId,
    mstVertices: [...inMST],
    mstEdges: [],
    mstWeight: 0,
  });

  const pq = new MinHeap();

  const pushEdgesFrom = (vertex) => {
    const neighbors = graph[vertex] || [];
    for (const edge of neighbors) {
      if (!inMST.has(edge.to)) {
        // priority = weight; carry the edge info in the "key"
        pq.push({ from: vertex, to: edge.to, weight: edge.weight }, edge.weight);
      }
    }
  };

  pushEdgesFrom(startId);

  while (!pq.isEmpty() && inMST.size < Object.keys(graph).length) {
    const { key: candidateEdge } = pq.pop();
    edgesConsidered += 1;

    if (inMST.has(candidateEdge.to)) {
      // Both endpoints already in MST -> would form a cycle, reject it.
      edgesRejected += 1;
      steps.push({
        step: steps.length + 1,
        action: 'reject-edge',
        description: `Reject edge ${candidateEdge.from} → ${candidateEdge.to} (${candidateEdge.weight} km): both endpoints already in MST.`,
        edge: [candidateEdge.from, candidateEdge.to],
        weight: candidateEdge.weight,
        mstVertices: [...inMST],
        mstEdges: [...mstEdges],
        mstWeight: totalWeight,
      });
      continue;
    }

    // Accept the minimum-weight edge crossing the cut.
    inMST.add(candidateEdge.to);
    mstEdges.push({ from: candidateEdge.from, to: candidateEdge.to, weight: candidateEdge.weight });
    totalWeight += candidateEdge.weight;

    steps.push({
      step: steps.length + 1,
      action: 'add-edge',
      description: `Select minimum-weight edge ${candidateEdge.from} → ${candidateEdge.to} (${candidateEdge.weight} km) and add ${candidateEdge.to} to the MST.`,
      currentNode: candidateEdge.to,
      edge: [candidateEdge.from, candidateEdge.to],
      weight: candidateEdge.weight,
      mstVertices: [...inMST],
      mstEdges: [...mstEdges],
      mstWeight: Math.round(totalWeight * 100) / 100,
    });

    pushEdgesFrom(candidateEdge.to);
  }

  const totalVertices = Object.keys(graph).length;
  const isSpanning = inMST.size === totalVertices;

  steps.push({
    step: steps.length + 1,
    action: 'complete',
    description: isSpanning
      ? `MST complete: all ${totalVertices} vertices connected with total weight ${Math.round(totalWeight * 100) / 100} km.`
      : `MST construction finished for the connected component reachable from ${startId}: ${inMST.size} of ${totalVertices} vertices included (graph is disconnected).`,
    mstVertices: [...inMST],
    mstEdges: [...mstEdges],
    mstWeight: Math.round(totalWeight * 100) / 100,
  });

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1_000_000;

  return {
    algorithm: 'Prim',
    category: 'Greedy Algorithm',
    problemType: 'Minimum Spanning Tree',
    result: {
      start: startId,
      mstEdges,
      mstWeight: Math.round(totalWeight * 100) / 100,
      verticesIncluded: inMST.size,
      totalVertices,
      isSpanning,
    },
    steps,
    metrics: {
      nodesInGraph: totalVertices,
      edgesInMST: mstEdges.length,
      edgesConsidered,
      edgesRejected,
      totalSteps: steps.length,
      executionTimeMs: Math.round(executionTimeMs * 1000) / 1000,
    },
    complexity: {
      time: 'O(E log V)',
      space: 'O(V + E)',
      note: 'Binary min-heap priority queue implementation.',
    },
  };
}

module.exports = prim;
