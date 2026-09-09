const test = require('node:test');
const assert = require('node:assert/strict');
const dynamicProgramming = require('../algorithms/tsp/dynamicProgramming');
const greedyTSP = require('../algorithms/tsp/greedy');
const dijkstraTour = require('../algorithms/tsp/dijkstraTour');
const { validateRoute } = require('../services/aiTspService');

function squareMatrix() {
  const points = [[0, 0], [0, 1], [1, 1], [1, 0]];
  return points.map((from) => points.map((to) => Math.hypot(from[0] - to[0], from[1] - to[1])));
}

test('Dynamic Programming uses bitonic subproblems and returns to source', () => {
  const cities = [
    { id: 'A', lng: 0, lat: 0 },
    { id: 'B', lng: 0, lat: 1 },
    { id: 'C', lng: 1, lat: 1 },
    { id: 'D', lng: 1, lat: 0 },
  ];
  const result = dynamicProgramming(squareMatrix(), cities.map((city) => city.id), 0, cities);
  assert.equal(result.algorithm, 'Dynamic Programming');
  assert.equal(result.optimal, false);
  assert.equal(result.result.tour[0], 'A');
  assert.equal(result.result.tour.at(-1), 'A');
  assert.equal(new Set(result.result.tour.slice(0, -1)).size, 4);
  assert.ok(result.metrics.statesComputed >= 3);
  assert.ok(result.metrics.executionTimeMs >= 0);
});

test('Dynamic Programming starts at the requested source when source is not first', () => {
  const cities = [
    { id: 'A', lng: 0, lat: 0 },
    { id: 'B', lng: 1, lat: 0 },
    { id: 'C', lng: 2, lat: 0 },
    { id: 'D', lng: 3, lat: 0 },
  ];
  const matrix = [
    [0, 1, 2, 1],
    [1, 0, 1, 2],
    [2, 1, 0, 1],
    [1, 2, 1, 0],
  ];
  const result = dynamicProgramming(matrix, cities.map((city) => city.id), 2, cities);
  assert.equal(result.result.tour[0], 'C');
  assert.equal(result.result.tour.at(-1), 'C');
  assert.equal(new Set(result.result.tour.slice(0, -1)).size, cities.length);
});

test('Greedy cheapest insertion returns to source', () => {
  const result = greedyTSP(squareMatrix(), ['A', 'B', 'C', 'D'], 0);
  assert.equal(result.algorithm, 'Greedy');
  assert.equal(result.category, 'Greedy Algorithm');
  assert.equal(result.result.tour[0], 'A');
  assert.equal(result.result.tour.at(-1), 'A');
  assert.equal(new Set(result.result.tour.slice(0, -1)).size, 4);
  assert.ok(result.metrics.insertionDecisions > 0);
});

test('Dijkstra TSP calculates intermediate paths and an independent return leg', () => {
  const graph = {
    A: [{ to: 'B', weight: 1 }, { to: 'C', weight: 10 }],
    B: [{ to: 'A', weight: 1 }, { to: 'C', weight: 1 }],
    C: [{ to: 'B', weight: 1 }, { to: 'A', weight: 10 }],
  };
  const result = dijkstraTour(graph, ['A', 'C'], 0);
  assert.deepEqual(result.result.tour, ['A', 'B', 'C', 'B', 'A']);
  assert.equal(result.result.legs.at(-1).source, 'C');
  assert.equal(result.result.legs.at(-1).destination, 'A');
  assert.ok(result.metrics.executionTimeMs >= 0);
});

test('AI route validation rejects omitted, added, or misplaced locations', () => {
  assert.doesNotThrow(() => validateRoute(['A', 'B', 'C', 'A'], 'A', ['B', 'C']));
  assert.throws(() => validateRoute(['A', 'B', 'A', 'A'], 'A', ['B', 'C']), /every selected destination/);
  assert.throws(() => validateRoute(['B', 'A', 'C', 'B'], 'A', ['B', 'C']), /start and end/);
});
