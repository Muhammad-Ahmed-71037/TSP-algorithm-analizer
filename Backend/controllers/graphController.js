const { getCitiesByIds } = require('../services/datasetService');
const { buildNearestNeighborGraph } = require('../services/graphService');
const { validateGraphRequest } = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

function generateGraph(req, res) {
  const { cityIds, k } = validateGraphRequest(req.body);

  const cities = getCitiesByIds(cityIds);
  if (cities.length !== cityIds.length) {
    throw new AppError('One or more selected cities were not found in the dataset.');
  }

  const { graph, edgeList, meta } = buildNearestNeighborGraph(cities, k);

  res.json({
    cities,
    edgeList,
    meta,
    disclaimer:
      'Edges represent approximate geographic distance calculated from city coordinates using the Haversine formula (straight-line distance, not road/travel distance). The graph is generated using a nearest-neighbor strategy.',
  });
}

module.exports = { generateGraph };
