const { getCitiesByIds, getCorridorCities } = require('./datasetService');
const { buildDistanceMatrix } = require('./tspGraphService');
const aiService = require('./aiService');
const { AppError } = require('../middleware/errorHandler');

function validateRequest(body) {
  let { source, destinationIds, destination } = body;
  if (!source || typeof source !== 'string') throw new AppError('A valid source city is required.');

  if (!destinationIds && destination && typeof destination === 'string') {
    destinationIds = [destination];
  }

  if (!Array.isArray(destinationIds) || destinationIds.length === 0) throw new AppError('Select at least one destination city.');
  if (destinationIds.includes(source)) throw new AppError('The source cannot also be a destination.');
  if (new Set(destinationIds).size !== destinationIds.length) throw new AppError('Duplicate destination selected.');

  let effectiveDestinationIds = [...destinationIds];
  let outboundIds = [];
  let inboundIds = [];
  let targetDestination = null;

  if (destinationIds.length === 1) {
    targetDestination = destinationIds[0];
    const corridor = getCorridorCities(source, targetDestination, 8);
    outboundIds = (corridor.outbound || []).map((c) => c.id).filter((id) => id !== source && id !== targetDestination);
    inboundIds = (corridor.inbound || []).map((c) => c.id).filter((id) => id !== source && id !== targetDestination && !outboundIds.includes(id));
    effectiveDestinationIds = [...outboundIds, targetDestination, ...inboundIds];
  }

  const cityIds = [source, ...effectiveDestinationIds];
  const cities = getCitiesByIds(cityIds);
  if (cities.length !== cityIds.length) throw new AppError('One or more selected cities were not found in the dataset.');
  return {
    source,
    destinationIds: effectiveDestinationIds,
    requestedDestinations: destinationIds,
    targetDestination,
    outboundIds,
    inboundIds,
    cityIds,
    cities,
  };
}

function validateRoute(route, source, destinationIds) {
  if (!Array.isArray(route) || route.length !== destinationIds.length + 2) {
    throw new AppError('The AI returned an invalid route length.');
  }
  if (route[0] !== source || route.at(-1) !== source) {
    throw new AppError('The AI route must start and end at the selected source.');
  }
  const expected = new Set(destinationIds);
  const actual = route.slice(1, -1);
  if (actual.some((id) => !expected.has(id)) || new Set(actual).size !== expected.size || actual.length !== expected.size) {
    throw new AppError('The AI route must contain every selected destination exactly once.');
  }
}

function normalizeAIRoute(rawRoute, source, destinationIds, cities = [], matrix = null, cityIds = null) {
  const cityByName = new Map();
  cities.forEach((c) => {
    cityByName.set(c.city.toLowerCase(), c.id);
    cityByName.set(c.id, c.id);
  });

  const expectedSet = new Set(destinationIds);
  const rawList = Array.isArray(rawRoute) ? rawRoute : [];

  // Convert city names or IDs
  const mappedList = rawList.map((item) => {
    const str = String(item).trim().toLowerCase();
    return cityByName.get(str) || item;
  });

  // Extract interior destinations in the order AI suggested
  const seen = new Set();
  const inner = [];
  for (const id of mappedList) {
    if (id !== source && expectedSet.has(id) && !seen.has(id)) {
      seen.add(id);
      inner.push(id);
    }
  }

  // Insert any missing destinations at the cheapest position
  const missing = destinationIds.filter((id) => !seen.has(id));
  for (const missingId of missing) {
    if (!matrix || !cityIds) {
      inner.push(missingId);
      continue;
    }
    let bestPos = inner.length;
    let minCost = Infinity;
    const mIdx = cityIds.indexOf(missingId);

    for (let pos = 0; pos <= inner.length; pos++) {
      const prevId = pos === 0 ? source : inner[pos - 1];
      const nextId = pos === inner.length ? source : inner[pos];
      const pIdx = cityIds.indexOf(prevId);
      const nIdx = cityIds.indexOf(nextId);

      if (pIdx >= 0 && nIdx >= 0 && mIdx >= 0) {
        const addedDist = matrix[pIdx][mIdx] + matrix[mIdx][nIdx] - matrix[pIdx][nIdx];
        if (addedDist < minCost) {
          minCost = addedDist;
          bestPos = pos;
        }
      }
    }
    inner.splice(bestPos, 0, missingId);
  }

  return [source, ...inner, source];
}

async function solve(req, res) {
  const startedAt = process.hrtime.bigint();
  const input = validateRequest(req.body);
  const { matrix, cityIds, edgeList, graphMeta } = buildDistanceMatrix(input.cities);
  const response = await aiService.solveTSP({
    source: input.source,
    destinations: input.destinationIds,
    cities: input.cities.map(({ id, city, country, lat, lng }) => ({ id, city, country, lat, lng })),
    distanceMatrix: matrix.map((row) => Array.from(row)),
  });

  const validTour = normalizeAIRoute(response.route, input.source, input.destinationIds, input.cities, matrix, cityIds);
  validateRoute(validTour, input.source, input.destinationIds);
  response.route = validTour;

  const targetIndex = input.targetDestination ? response.route.indexOf(input.targetDestination) : -1;
  const indexes = response.route.map((id) => cityIds.indexOf(id));
  let totalDistance = 0;
  const legs = [];
  for (let index = 0; index < indexes.length - 1; index += 1) {
    const fromId = response.route[index];
    const toId = response.route[index + 1];
    const legDist = matrix[indexes[index]][indexes[index + 1]];
    totalDistance += legDist;
    const isReturn = targetIndex > 0 ? index >= targetIndex : index === indexes.length - 2;
    legs.push({
      source: fromId,
      destination: toId,
      distance: Math.round(legDist * 100) / 100,
      path: [fromId, toId],
      isReturnLeg: isReturn,
    });
  }
  const requestTimeMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  res.json({
    algorithm: 'AI TSP Solver',
    category: 'AI / LLM',
    problemType: 'Traveling Salesman Problem',
    optimal: false,
    result: {
      startingCity: input.source,
      tour: response.route,
      totalDistance: Math.round(totalDistance * 100) / 100,
      legs,
    },
    reasoning: typeof response.reasoning === 'string' ? response.reasoning : 'The AI returned a valid route.',
    metrics: {
      destinations: input.destinationIds.length,
      requestTimeMs: Math.round(requestTimeMs * 1000) / 1000,
    },
    cities: input.cities,
    edgeList,
    graphMeta,
    selectedDestinations: input.destinationIds,
  });
}

module.exports = { solve, validateRoute };