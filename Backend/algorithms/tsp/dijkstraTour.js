const dijkstra = require('../dijkstra');

function dijkstraTour(graph, cityIds, startIndex, options = {}) {
  const startTime = process.hrtime.bigint();
  const startId = cityIds[startIndex];
  const destinationIds = cityIds.filter((_, index) => index !== startIndex);
  const legs = [];
  const route = [startId];
  let totalDistance = 0;
  let currentId = startId;

  const targetDestination = options.targetDestination;
  const outboundIds = options.outboundIds;
  const inboundIds = options.inboundIds;

  if (targetDestination && Array.isArray(outboundIds) && Array.isArray(inboundIds)) {
    // 1. Outbound Phase: greedy nearest-unvisited through outbound waypoints
    const unvisitedOut = new Set(outboundIds.filter((id) => id !== startId && id !== targetDestination));
    while (unvisitedOut.size > 0) {
      let bestNextId = null;
      let bestLeg = null;
      let minDistance = Infinity;

      for (const candidateId of unvisitedOut) {
        const leg = dijkstra(graph, currentId, candidateId);
        if (leg.result.reachable && leg.result.distance < minDistance) {
          minDistance = leg.result.distance;
          bestNextId = candidateId;
          bestLeg = leg;
        }
      }

      if (!bestNextId || !bestLeg) {
        bestNextId = Array.from(unvisitedOut)[0];
        bestLeg = dijkstra(graph, currentId, bestNextId);
      }

      const legPath = bestLeg.result.path;
      route.push(...legPath.slice(1));
      totalDistance += bestLeg.result.distance;
      legs.push({
        source: currentId,
        destination: bestNextId,
        distance: Math.round(bestLeg.result.distance * 100) / 100,
        path: legPath,
        intermediateNodes: legPath.slice(1, -1),
        isReturnLeg: false,
      });

      unvisitedOut.delete(bestNextId);
      currentId = bestNextId;
    }

    // 2. Reach the turnaround target destination
    const toTargetLeg = dijkstra(graph, currentId, targetDestination);
    const toTargetPath = toTargetLeg.result.path;
    route.push(...toTargetPath.slice(1));
    totalDistance += toTargetLeg.result.distance;
    legs.push({
      source: currentId,
      destination: targetDestination,
      distance: Math.round(toTargetLeg.result.distance * 100) / 100,
      path: toTargetPath,
      intermediateNodes: toTargetPath.slice(1, -1),
      isReturnLeg: false,
    });
    currentId = targetDestination;

    // 3. Return Phase: route through unvisited return waypoints back towards source!
    const unvisitedIn = new Set(inboundIds.filter((id) => id !== startId && id !== targetDestination));
    while (unvisitedIn.size > 0) {
      let bestNextId = null;
      let bestLeg = null;
      let minDistance = Infinity;

      for (const candidateId of unvisitedIn) {
        const leg = dijkstra(graph, currentId, candidateId);
        if (leg.result.reachable && leg.result.distance < minDistance) {
          minDistance = leg.result.distance;
          bestNextId = candidateId;
          bestLeg = leg;
        }
      }

      if (!bestNextId || !bestLeg) {
        bestNextId = Array.from(unvisitedIn)[0];
        bestLeg = dijkstra(graph, currentId, bestNextId);
      }

      const legPath = bestLeg.result.path;
      route.push(...legPath.slice(1));
      totalDistance += bestLeg.result.distance;
      legs.push({
        source: currentId,
        destination: bestNextId,
        distance: Math.round(bestLeg.result.distance * 100) / 100,
        path: legPath,
        intermediateNodes: legPath.slice(1, -1),
        isReturnLeg: true,
      });

      unvisitedIn.delete(bestNextId);
      currentId = bestNextId;
    }

    // 4. Final return leg from last return waypoint back to source
    const finalReturnLeg = dijkstra(graph, currentId, startId);
    const returnPath = finalReturnLeg.result.path;
    route.push(...returnPath.slice(1));
    totalDistance += finalReturnLeg.result.distance;
    legs.push({
      source: currentId,
      destination: startId,
      distance: Math.round(finalReturnLeg.result.distance * 100) / 100,
      path: returnPath,
      intermediateNodes: returnPath.slice(1, -1),
      isReturnLeg: true,
    });
  } else {
    // Standard Greedy nearest unvisited Dijkstra tour
    const unvisitedDestinations = new Set(destinationIds);
    while (unvisitedDestinations.size > 0) {
      let bestNextId = null;
      let bestLeg = null;
      let minDistance = Infinity;

      for (const candidateId of unvisitedDestinations) {
        const leg = dijkstra(graph, currentId, candidateId);
        if (leg.result.reachable && leg.result.distance < minDistance) {
          minDistance = leg.result.distance;
          bestNextId = candidateId;
          bestLeg = leg;
        }
      }

      if (!bestNextId || !bestLeg) {
        const error = new Error(`No graph route exists from ${currentId} to remaining destinations.`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      const legPath = bestLeg.result.path;
      route.push(...legPath.slice(1));
      totalDistance += bestLeg.result.distance;
      legs.push({
        source: currentId,
        destination: bestNextId,
        distance: Math.round(bestLeg.result.distance * 100) / 100,
        path: legPath,
        intermediateNodes: legPath.slice(1, -1),
        isReturnLeg: false,
      });

      unvisitedDestinations.delete(bestNextId);
      currentId = bestNextId;
    }

    // Calculate return leg independently back to startId (NEVER reverse outbound path)
    const returnLeg = dijkstra(graph, currentId, startId);
    if (!returnLeg.result.reachable) {
      const error = new Error(`No graph route exists to return from ${currentId} to source ${startId}.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const returnPath = returnLeg.result.path;
    route.push(...returnPath.slice(1));
    totalDistance += returnLeg.result.distance;
    legs.push({
      source: currentId,
      destination: startId,
      distance: Math.round(returnLeg.result.distance * 100) / 100,
      path: returnPath,
      intermediateNodes: returnPath.slice(1, -1),
      isReturnLeg: true,
    });
  }

  const executionTimeMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
  return {
    algorithm: 'Dijkstra',
    category: 'Greedy Algorithm',
    problemType: 'TSP using repeated shortest-path calculations',
    optimal: false,
    result: {
      startingCity: startId,
      destinations: destinationIds,
      tour: route,
      totalDistance: Math.round(totalDistance * 100) / 100,
      legs,
    },
    metrics: {
      destinations: destinationIds.length,
      shortestPathsCalculated: legs.length,
      executionTimeMs: Math.round(executionTimeMs * 1000) / 1000,
    },
    complexity: {
      time: 'O(V * (V + E) log V)',
      space: 'O(V + E)',
      note: 'Each TSP leg uses Dijkstra over the generated graph; the return leg is independently calculated.',
    },
  };
}

module.exports = dijkstraTour;