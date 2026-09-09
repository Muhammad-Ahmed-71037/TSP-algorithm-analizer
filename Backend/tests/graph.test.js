const test = require('node:test');
const assert = require('node:assert/strict');
const { haversineDistance } = require('../utils/haversine');
const { buildNearestNeighborGraph } = require('../services/graphService');

test('haversineDistance returns 0 for identical points', () => {
  assert.equal(haversineDistance(24.8607, 67.0011, 24.8607, 67.0011), 0);
});

test('haversineDistance: Karachi to Lahore straight-line distance is approximately 1035 km', () => {
  // Karachi (24.8607, 67.0011), Lahore (31.5497, 74.3436)
  // Note: ~1210km is the ROAD distance; Haversine gives straight-line ("as the
  // crow flies") distance, which is shorter - approximately 1034-1040 km.
  const d = haversineDistance(24.8607, 67.0011, 31.5497, 74.3436);
  assert.ok(d > 1000 && d < 1070, `expected ~1035km, got ${d}`);
});

test('buildNearestNeighborGraph produces a symmetric, connected-looking graph', () => {
  const cities = [
    { id: '1', lat: 24.8607, lng: 67.0011 }, // Karachi
    { id: '2', lat: 31.5497, lng: 74.3436 }, // Lahore
    { id: '3', lat: 33.6844, lng: 73.0479 }, // Islamabad
    { id: '4', lat: 25.396, lng: 68.3578 }, // Hyderabad, PK
  ];
  const { graph, edgeList, meta } = buildNearestNeighborGraph(cities, 2);

  assert.equal(meta.vertices, 4);
  assert.ok(edgeList.length > 0);

  // Symmetry: if A has edge to B, B must have edge to A.
  for (const [id, neighbors] of Object.entries(graph)) {
    for (const edge of neighbors) {
      const reciprocal = graph[edge.to].some((e) => e.to === id);
      assert.ok(reciprocal, `Expected symmetric edge ${edge.to} -> ${id}`);
    }
  }
});

test('buildNearestNeighborGraph rejects fewer than 2 cities', () => {
  assert.throws(() => buildNearestNeighborGraph([{ id: '1', lat: 0, lng: 0 }], 3));
});
