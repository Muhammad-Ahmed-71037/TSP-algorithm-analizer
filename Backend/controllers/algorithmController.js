/**
 * algorithmController.js
 * ---------------------------------------------------------------------------
 * Each endpoint rebuilds the nearest-neighbor graph deterministically from
 * the submitted { cityIds, k } (same inputs always produce the same graph -
 * see graphService), then runs the requested algorithm against it. This
 * keeps the backend stateless (no database, no session graph storage)
 * while guaranteeing the algorithm always executes against a real graph
 * derived from real data - never against AI-generated or client-trusted
 * results.
 */

const { getCitiesByIds } = require('../services/datasetService');
const { buildNearestNeighborGraph } = require('../services/graphService');
const { validateGraphRequest, validateSourceDestination } = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const dijkstra = require('../algorithms/dijkstra');
const prim = require('../algorithms/prim');
const floydWarshall = require('../algorithms/floydWarshall');

function rebuildGraph(body) {
  const { cityIds, k } = validateGraphRequest(body);
  const cities = getCitiesByIds(cityIds);
  if (cities.length !== cityIds.length) {
    throw new AppError('One or more selected cities were not found in the dataset.');
  }
  const built = buildNearestNeighborGraph(cities, k);
  return { ...built, cities };
}

function runDijkstra(req, res) {
  const { source, destination } = validateSourceDestination(req.body);
  const { graph, cities, meta } = rebuildGraph(req.body);

  if (!graph[source]) throw new AppError('Source city is not part of the generated graph.');
  if (!graph[destination]) throw new AppError('Destination city is not part of the generated graph.');

  const output = dijkstra(graph, source, destination);
  res.json({ ...output, graphMeta: meta, cities });
}

function runPrim(req, res) {
  const { source: start } = validateSourceDestination(req.body, { requireDestination: false });
  const { graph, cities, meta } = rebuildGraph(req.body);

  if (!graph[start]) throw new AppError('Start city is not part of the generated graph.');

  const output = prim(graph, start);
  res.json({ ...output, graphMeta: meta, cities });
}

function runFloydWarshall(req, res) {
  const { graph, cities, meta, cityIds } = rebuildGraph(req.body);
  const { source, destination } = req.body;

  if (cityIds.length > 60) {
    // Not a hard block (spec: "allow the user to continue" after a warning,
    // which the frontend shows before calling this endpoint) - but we do
    // cap runaway requests to protect the server.
    if (cityIds.length > 200) {
      throw new AppError('Too many cities for Floyd-Warshall in a single request.');
    }
  }

  const output = floydWarshall(graph, cityIds, 500);

  let pathInfo = null;
  if (source && destination && graph[source] && graph[destination]) {
    const path = output.reconstructPath(source, destination);
    const idx = cityIds.indexOf(source);
    const jdx = cityIds.indexOf(destination);
    pathInfo = {
      source,
      destination,
      distance: path ? output.matrix[idx][jdx] : null,
      path,
      reachable: !!path,
    };
  }

  // Strip the non-serializable function before sending JSON.
  const { reconstructPath, ...serializable } = output;

  res.json({ ...serializable, pathInfo, graphMeta: meta, cities });
}

module.exports = { runDijkstra, runPrim, runFloydWarshall };
