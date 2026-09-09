/**
 * tspController.js
 * ---------------------------------------------------------------------------
 * Unlike the Dijkstra/Prim/Floyd-Warshall controllers, TSP builds a COMPLETE
 * graph (distance matrix) from the selected cities - see tspGraphService.js.
 *
 * The request contains only the selected source and destinations. The server
 * retrieves those records and builds the relevant distance data on demand.
 */

const { getCitiesByIds, getCorridorCities } = require('../services/datasetService');
const { buildDistanceMatrix } = require('../services/tspGraphService');
const { AppError } = require('../middleware/errorHandler');

const dynamicProgramming = require('../algorithms/tsp/dynamicProgramming');
const greedyTSP = require('../algorithms/tsp/greedy');
const dijkstraTour = require('../algorithms/tsp/dijkstraTour');
const { buildNearestNeighborGraph } = require('../services/graphService');

function buildMatrixFromRequest(body) {
  const { cityIds } = body;
  if (!Array.isArray(cityIds) || cityIds.length < 3) {
    throw new AppError('Select at least 3 cities for a TSP tour.');
  }
  const uniqueIds = new Set(cityIds);
  if (uniqueIds.size !== cityIds.length) {
    throw new AppError('Duplicate city selected. Please select distinct cities.');
  }
  const cities = getCitiesByIds(cityIds);
  if (cities.length !== cityIds.length) {
    throw new AppError('One or more selected cities were not found in the dataset.');
  }
  const { matrix, cityIds: orderedIds } = buildDistanceMatrix(cities);
  return { matrix, cityIds: orderedIds, cities };
}

function resolveStartIndex(cityIds, startingCityId) {
  if (!startingCityId) throw new AppError('A starting city is required.');
  const idx = cityIds.indexOf(startingCityId);
  if (idx === -1) throw new AppError('Starting city is not part of the selected cities.');
  return idx;
}

function validateTourRequest(body) {
  let { source, destinationIds, destination } = body;
  if (!source || typeof source !== 'string') throw new AppError('A valid source city is required.');

  // If a single destination was passed instead of destinationIds
  if (!destinationIds && destination && typeof destination === 'string') {
    destinationIds = [destination];
  }

  if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
    throw new AppError('Select at least one destination city.');
  }
  if (destinationIds.includes(source)) throw new AppError('The source cannot also be a destination.');
  if (new Set(destinationIds).size !== destinationIds.length) {
    throw new AppError('Duplicate destination selected. Please select distinct destinations.');
  }

  // If exactly 1 destination is selected (e.g. Karachi to New York), automatically discover
  // high-significance corridor waypoint cities from the 50,000+ dataset so all candidate
  // graph paths between source and destination can be traversed and compared!
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
    startIndex: 0,
  };
}

function runDynamicProgramming(req, res) {
  const request = validateTourRequest(req.body);
  const { matrix, cityIds, edgeList, graphMeta } = buildDistanceMatrix(request.cities);
  const output = dynamicProgramming(matrix, cityIds, request.startIndex, request.cities);
  res.json({ ...output, cities: request.cities, edgeList, graphMeta, selectedDestinations: request.destinationIds });
}

function runGreedy(req, res) {
  const request = validateTourRequest(req.body);
  const { matrix, cityIds, edgeList, graphMeta } = buildDistanceMatrix(request.cities);
  const output = greedyTSP(matrix, cityIds, request.startIndex);
  res.json({ ...output, cities: request.cities, edgeList, graphMeta, selectedDestinations: request.destinationIds });
}

function runDijkstraTSP(req, res) {
  const request = validateTourRequest(req.body);
  const k = req.body.k === undefined ? 5 : Number(req.body.k);
  const built = buildNearestNeighborGraph(request.cities, k);
  const output = dijkstraTour(built.graph, request.cityIds, request.startIndex, {
    targetDestination: request.targetDestination,
    outboundIds: request.outboundIds,
    inboundIds: request.inboundIds,
  });
  res.json({ ...output, cities: request.cities, graphMeta: built.meta, edgeList: built.edgeList, selectedDestinations: request.destinationIds });
}

function generateTSPGraph(req, res) {
  const { matrix, cityIds, cities } = buildMatrixFromRequest(req.body);
  res.json({
    cities,
    vertices: cityIds.length,
    edges: (cityIds.length * (cityIds.length - 1)) / 2,
    disclaimer:
      'TSP requires a complete graph: every city is connected to every other city, with weight equal to approximate geographic (Haversine) distance.',
  });
}

module.exports = {
  generateTSPGraph,
  runDynamicProgramming,
  runGreedy,
  runDijkstraTSP,
};
