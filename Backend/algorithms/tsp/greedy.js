/**
 * Greedy TSP solver using cheapest insertion.
 * At every step it makes the locally cheapest valid insertion decision.
 */
function greedyTSP(matrix, cityIds, startIndex) {
  const startTime = process.hrtime.bigint();
  const unvisited = new Set(cityIds.map((_, index) => index).filter((index) => index !== startIndex));
  const tourIndices = [startIndex, startIndex];
  let totalDistance = 0;
  let decisions = 0;

  while (unvisited.size > 0) {
    let bestCity = -1;
    let bestPosition = -1;
    let bestIncrease = Infinity;

    for (const cityIndex of unvisited) {
      for (let position = 0; position < tourIndices.length - 1; position += 1) {
        const from = tourIndices[position];
        const to = tourIndices[position + 1];
        const increase = matrix[from][cityIndex] + matrix[cityIndex][to] - matrix[from][to];
        decisions += 1;
        if (increase < bestIncrease) {
          bestIncrease = increase;
          bestCity = cityIndex;
          bestPosition = position + 1;
        }
      }
    }

    tourIndices.splice(bestPosition, 0, bestCity);
    unvisited.delete(bestCity);
  }

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
    algorithm: 'Greedy',
    category: 'Greedy Algorithm',
    problemType: 'Traveling Salesman Problem',
    optimal: false,
    result: {
      startingCity: cityIds[startIndex],
      tour: tourCityIds,
      totalDistance: Math.round(totalDistance * 100) / 100,
      legs,
    },
    metrics: {
      citiesInTour: cityIds.length,
      insertionDecisions: decisions,
      executionTimeMs: Math.round(executionTimeMs * 1000) / 1000,
    },
    complexity: {
      time: 'O(V^3)',
      space: 'O(V)',
      note: 'Greedy cheapest-insertion heuristic; not guaranteed optimal.',
    },
  };
}

module.exports = greedyTSP;