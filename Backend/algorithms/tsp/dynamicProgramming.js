/**
 * Bitonic-tour dynamic programming for the selected TSP locations.
 *
 * Locations are ordered by longitude and the recurrence builds two monotonic
 * chains. This is a polynomial DP formulation, not a subset-state solver.
 * The returned tour is optimal for the bitonic ordering assumption.
 */
function dynamicProgramming(matrix, cityIds, startIndex, cities = []) {
  const startTime = process.hrtime.bigint();
  const n = cityIds.length;
  if (n < 2) throw new Error('At least 2 locations are required for a TSP route.');

  const ordered = cityIds.map((id, index) => ({
    id,
    index,
    longitude: Number(cities[index]?.lng ?? index),
    latitude: Number(cities[index]?.lat ?? 0),
  })).sort((a, b) => a.longitude - b.longitude || a.latitude - b.latitude);
  const distance = (left, right) => matrix[ordered[left].index][ordered[right].index];
  const dp = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  const parent = Array.from({ length: n }, () => new Array(n).fill(-1));
  let statesComputed = 0;

  dp[0][1] = distance(0, 1);
  statesComputed += 1;
  for (let right = 2; right < n; right += 1) {
    for (let left = 0; left < right - 1; left += 1) {
      dp[left][right] = dp[left][right - 1] + distance(right - 1, right);
      parent[left][right] = left;
      statesComputed += 1;
    }
    let best = Infinity;
    let bestLeft = -1;
    for (let candidate = 0; candidate < right - 1; candidate += 1) {
      const value = dp[candidate][right - 1] + distance(candidate, right);
      if (value < best) {
        best = value;
        bestLeft = candidate;
      }
    }
    dp[right - 1][right] = best;
    parent[right - 1][right] = bestLeft;
    statesComputed += 1;
  }

  const edges = [];
  function traceback(left, right) {
    if (right === 1) {
      edges.push([0, 1]);
      return;
    }
    if (left < right - 1) {
      traceback(left, right - 1);
      edges.push([right - 1, right]);
      return;
    }
    const previous = parent[left][right];
    traceback(previous, right - 1);
    edges.push([previous, right]);
  }
  traceback(n - 2, n - 1);
  edges.push([n - 2, n - 1]);

  const adjacency = Array.from({ length: n }, () => []);
  for (const [left, right] of edges) {
    adjacency[left].push(right);
    adjacency[right].push(left);
  }

  // Trace the cycle from the leftmost location first, then rotate it so the
  // user-selected source is always the first and last tour location.
  const cycleOrdered = [0];
  let previous = -1;
  let current = 0;
  while (cycleOrdered.length < n) {
    const next = adjacency[current].find((candidate) => candidate !== previous);
    previous = current;
    current = next;
    cycleOrdered.push(current);
  }
  const orderedStart = cycleOrdered.indexOf(ordered.findIndex((city) => city.index === startIndex));
  const rotatedCycle = cycleOrdered.slice(orderedStart).concat(cycleOrdered.slice(0, orderedStart));
  let tourIndices = rotatedCycle.map((position) => ordered[position].index);
  // Orient cycle so forward outbound waypoints are traversed before return waypoints
  if (tourIndices.length > 2 && tourIndices[1] > tourIndices[tourIndices.length - 1]) {
    tourIndices = [tourIndices[0], ...tourIndices.slice(1).reverse()];
  }
  tourIndices.push(startIndex);
  let totalDistance = 0;
  for (let index = 0; index < tourIndices.length - 1; index += 1) {
    totalDistance += matrix[tourIndices[index]][tourIndices[index + 1]];
  }

  const tourCityIds = tourIndices.map((index) => cityIds[index]);
  const legs = [];
  for (let index = 0; index < tourCityIds.length - 1; index += 1) {
    const fromId = tourCityIds[index];
    const toId = tourCityIds[index + 1];
    const fromIdx = tourIndices[index];
    const toIdx = tourIndices[index + 1];
    legs.push({
      source: fromId,
      destination: toId,
      distance: Math.round(matrix[fromIdx][toIdx] * 100) / 100,
      path: [fromId, toId],
      isReturnLeg: index === tourCityIds.length - 2,
    });
  }

  const executionTimeMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
  return {
    algorithm: 'Dynamic Programming',
    category: 'Dynamic Programming',
    problemType: 'Traveling Salesman Problem',
    optimal: false,
    result: {
      startingCity: cityIds[startIndex],
      tour: tourCityIds,
      totalDistance: Math.round(totalDistance * 100) / 100,
      legs,
    },
    metrics: {
      citiesInTour: n,
      statesComputed,
      memoizationTableSize: `${n} × ${n}`,
      executionTimeMs: Math.round(executionTimeMs * 1000) / 1000,
    },
    complexity: {
      time: 'O(V^2)',
      space: 'O(V^2)',
      note: 'Bitonic-tour dynamic programming; optimal under the longitude-sorted two-chain assumption.',
    },
  };
}

module.exports = dynamicProgramming;