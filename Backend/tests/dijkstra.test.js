const test = require('node:test');
const assert = require('node:assert/strict');
const dijkstra = require('../algorithms/dijkstra');

// Simple graph:
//   A --1-- B --2-- C
//   |               |
//   4-------------- 1
//   (A-C direct edge weight 4, but A-B-C = 1+2 = 3 which is shorter)
function simpleGraph() {
  return {
    A: [{ to: 'B', weight: 1 }, { to: 'C', weight: 4 }],
    B: [{ to: 'A', weight: 1 }, { to: 'C', weight: 2 }],
    C: [{ to: 'B', weight: 2 }, { to: 'A', weight: 4 }],
  };
}

test('Dijkstra finds the shorter multi-hop path over a longer direct edge', () => {
  const res = dijkstra(simpleGraph(), 'A', 'C');
  assert.equal(res.result.distance, 3);
  assert.deepEqual(res.result.path, ['A', 'B', 'C']);
});

test('Dijkstra source === destination returns distance 0', () => {
  const res = dijkstra(simpleGraph(), 'A', 'A');
  assert.equal(res.result.distance, 0);
  assert.deepEqual(res.result.path, ['A']);
});

test('Dijkstra reports unreachable destination correctly', () => {
  const graph = {
    A: [{ to: 'B', weight: 1 }],
    B: [{ to: 'A', weight: 1 }],
    C: [], // isolated
  };
  const res = dijkstra(graph, 'A', 'C');
  assert.equal(res.result.reachable, false);
  assert.equal(res.result.distance, null);
  assert.deepEqual(res.result.path, []);
});

test('Dijkstra picks correct path with multiple candidate routes', () => {
  const graph = {
    A: [{ to: 'B', weight: 7 }, { to: 'C', weight: 9 }, { to: 'F', weight: 14 }],
    B: [{ to: 'A', weight: 7 }, { to: 'C', weight: 10 }, { to: 'D', weight: 15 }],
    C: [{ to: 'A', weight: 9 }, { to: 'B', weight: 10 }, { to: 'D', weight: 11 }, { to: 'F', weight: 2 }],
    D: [{ to: 'B', weight: 15 }, { to: 'C', weight: 11 }, { to: 'E', weight: 6 }],
    E: [{ to: 'D', weight: 6 }, { to: 'F', weight: 9 }],
    F: [{ to: 'A', weight: 14 }, { to: 'C', weight: 2 }, { to: 'E', weight: 9 }],
  };
  const res = dijkstra(graph, 'A', 'E');
  assert.equal(res.result.distance, 20); // classic textbook example (A-C-F-E = 9+2+9=20)
  assert.deepEqual(res.result.path, ['A', 'C', 'F', 'E']);
});

test('Dijkstra step history is non-empty and structured', () => {
  const res = dijkstra(simpleGraph(), 'A', 'C');
  assert.ok(res.steps.length > 0);
  assert.ok(res.steps.every((s) => typeof s.step === 'number' && typeof s.action === 'string'));
});
