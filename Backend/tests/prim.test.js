const test = require('node:test');
const assert = require('node:assert/strict');
const prim = require('../algorithms/prim');

test('Prim computes correct MST weight on a simple connected graph', () => {
  // Classic 4-vertex example, known MST weight = 19 (edges: A-B(1), B-C(2), C-D... )
  const graph = {
    A: [{ to: 'B', weight: 1 }, { to: 'C', weight: 4 }, { to: 'D', weight: 3 }],
    B: [{ to: 'A', weight: 1 }, { to: 'C', weight: 2 }],
    C: [{ to: 'A', weight: 4 }, { to: 'B', weight: 2 }, { to: 'D', weight: 5 }],
    D: [{ to: 'A', weight: 3 }, { to: 'C', weight: 5 }],
  };
  // MST: A-B(1) + B-C(2) + A-D(3) = 6
  const res = prim(graph, 'A');
  assert.equal(res.result.mstWeight, 6);
  assert.equal(res.result.mstEdges.length, 3); // V-1 edges for 4 vertices
  assert.equal(res.result.isSpanning, true);
});

test('Prim MST has exactly V-1 edges for a connected graph', () => {
  const graph = {
    A: [{ to: 'B', weight: 2 }],
    B: [{ to: 'A', weight: 2 }, { to: 'C', weight: 3 }],
    C: [{ to: 'B', weight: 3 }, { to: 'D', weight: 1 }],
    D: [{ to: 'C', weight: 1 }],
  };
  const res = prim(graph, 'A');
  assert.equal(res.result.mstEdges.length, 3);
  assert.equal(res.result.mstWeight, 6);
});

test('Prim on a disconnected graph only spans the reachable component', () => {
  const graph = {
    A: [{ to: 'B', weight: 1 }],
    B: [{ to: 'A', weight: 1 }],
    C: [{ to: 'D', weight: 1 }],
    D: [{ to: 'C', weight: 1 }],
  };
  const res = prim(graph, 'A');
  assert.equal(res.result.isSpanning, false);
  assert.equal(res.result.verticesIncluded, 2);
  assert.equal(res.result.mstEdges.length, 1);
});
