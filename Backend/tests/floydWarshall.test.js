const test = require('node:test');
const assert = require('node:assert/strict');
const floydWarshall = require('../algorithms/floydWarshall');

test('Floyd-Warshall finds shortest distances via an intermediate vertex', () => {
  const graph = {
    A: [{ to: 'B', weight: 1 }, { to: 'C', weight: 4 }],
    B: [{ to: 'A', weight: 1 }, { to: 'C', weight: 2 }],
    C: [{ to: 'B', weight: 2 }, { to: 'A', weight: 4 }],
  };
  const cityIds = ['A', 'B', 'C'];
  const res = floydWarshall(graph, cityIds);

  const idx = { A: 0, B: 1, C: 2 };
  assert.equal(res.matrix[idx.A][idx.C], 3); // via B: 1+2=3, better than direct 4
  assert.equal(res.matrix[idx.A][idx.A], 0);
  assert.equal(res.matrix[idx.A][idx.B], 1);

  const path = res.reconstructPath('A', 'C');
  assert.deepEqual(path, ['A', 'B', 'C']);
});

test('Floyd-Warshall reports Infinity for unreachable pairs', () => {
  const graph = {
    A: [{ to: 'B', weight: 1 }],
    B: [{ to: 'A', weight: 1 }],
    C: [],
  };
  const res = floydWarshall(graph, ['A', 'B', 'C']);
  const idx = { A: 0, B: 1, C: 2 };
  assert.equal(res.matrix[idx.A][idx.C], Infinity);
  assert.equal(res.reconstructPath('A', 'C'), null);
});

test('Floyd-Warshall matches Dijkstra on a random-ish graph', () => {
  const dijkstra = require('../algorithms/dijkstra');
  const graph = {
    A: [{ to: 'B', weight: 7 }, { to: 'C', weight: 9 }, { to: 'F', weight: 14 }],
    B: [{ to: 'A', weight: 7 }, { to: 'C', weight: 10 }, { to: 'D', weight: 15 }],
    C: [{ to: 'A', weight: 9 }, { to: 'B', weight: 10 }, { to: 'D', weight: 11 }, { to: 'F', weight: 2 }],
    D: [{ to: 'B', weight: 15 }, { to: 'C', weight: 11 }, { to: 'E', weight: 6 }],
    E: [{ to: 'D', weight: 6 }, { to: 'F', weight: 9 }],
    F: [{ to: 'A', weight: 14 }, { to: 'C', weight: 2 }, { to: 'E', weight: 9 }],
  };
  const cityIds = Object.keys(graph);
  const fw = floydWarshall(graph, cityIds);
  const dj = dijkstra(graph, 'A', 'E');

  const idx = Object.fromEntries(cityIds.map((id, i) => [id, i]));
  assert.equal(fw.matrix[idx.A][idx.E], dj.result.distance);
});

test('Floyd-Warshall records update steps with intermediate vertex info', () => {
  const graph = {
    A: [{ to: 'B', weight: 1 }, { to: 'C', weight: 4 }],
    B: [{ to: 'A', weight: 1 }, { to: 'C', weight: 2 }],
    C: [{ to: 'B', weight: 2 }, { to: 'A', weight: 4 }],
  };
  const res = floydWarshall(graph, ['A', 'B', 'C']);
  assert.ok(res.steps.length > 0);
  assert.ok(res.steps.some((s) => s.intermediateVertex === 'B'));
});
