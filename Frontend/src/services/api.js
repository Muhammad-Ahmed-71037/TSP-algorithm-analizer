/**
 * api.js
 * ---------------------------------------------------------------------------
 * Single place where the frontend talks to the backend. Every function
 * returns parsed JSON or throws an Error with a friendly `.message` taken
 * straight from the backend's { error: "..." } payload, so components can
 * just catch(err) and show err.message in a toast.
 */

const BASE = '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Could not reach the server. Is the backend running on port 5000?');
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Received an invalid response from the server.');
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status}).`);
  }
  return data;
}

// ---- Dataset -----------------------------------------------------------
export function fetchCities({ search = '', country = '', sortBy = 'population', order = 'desc', page = 1, pageSize = 25 } = {}) {
  const params = new URLSearchParams({ search, country, sortBy, order, page, pageSize });
  return request(`/cities?${params.toString()}`);
}

export function fetchDatasetStats() {
  return request('/cities/stats');
}

export function fetchCountries() {
  return request('/cities/countries');
}

export function fetchCorridorCities({ source, destination, count = 12 }) {
  const params = new URLSearchParams({ source, destination, count });
  return request(`/cities/corridor?${params.toString()}`);
}

export function fetchCitiesBatch(ids) {
  return request('/cities/batch', { method: 'POST', body: JSON.stringify({ ids }) });
}

// ---- Graph ---------------------------------------------------------------
export function generateGraph({ cityIds, k }) {
  return request('/graph', { method: 'POST', body: JSON.stringify({ cityIds, k }) });
}

// ---- Algorithms ------------------------------------------------------------
export function runDijkstra({ cityIds, k, source, destination }) {
  return request('/algorithm/dijkstra', {
    method: 'POST',
    body: JSON.stringify({ cityIds, k, source, destination }),
  });
}

export function runPrim({ cityIds, k, source }) {
  return request('/algorithm/prim', { method: 'POST', body: JSON.stringify({ cityIds, k, source }) });
}

export function runFloydWarshall({ cityIds, k, source, destination }) {
  return request('/algorithm/floyd-warshall', {
    method: 'POST',
    body: JSON.stringify({ cityIds, k, source, destination }),
  });
}

// ---- TSP ---------------------------------------------------------------
export function generateTSPGraph({ cityIds }) {
  return request('/tsp/graph', { method: 'POST', body: JSON.stringify({ cityIds }) });
}

export function runDynamicProgrammingTSP({ source, destinationIds }) {
  return request('/tsp/dynamic-programming', {
    method: 'POST',
    body: JSON.stringify({ source, destinationIds }),
  });
}

export function runGreedyTSP({ source, destinationIds }) {
  return request('/tsp/greedy', {
    method: 'POST',
    body: JSON.stringify({ source, destinationIds }),
  });
}

export function runDijkstraTSP({ source, destinationIds, k = 5 }) {
  return request('/tsp/dijkstra', {
    method: 'POST',
    body: JSON.stringify({ source, destinationIds, k }),
  });
}

// ---- AI --------------------------------------------------------------------
export function aiExplain(context) {
  return request('/ai/explain', { method: 'POST', body: JSON.stringify({ context }) });
}

export function aiTutor(question, context) {
  return request('/ai/tutor', { method: 'POST', body: JSON.stringify({ question, context }) });
}

export function aiCompare(results) {
  return request('/ai/compare', { method: 'POST', body: JSON.stringify({ results }) });
}

export function aiPerformance(metrics) {
  return request('/ai/performance', { method: 'POST', body: JSON.stringify({ metrics }) });
}

export function aiSolveTSP({ source, destinationIds }) {
  return request('/ai/tsp-solve', {
    method: 'POST',
    body: JSON.stringify({ source, destinationIds }),
  });
}
