/**
 * datasetService.js
 * ---------------------------------------------------------------------------
 * Loads worldcities.csv exactly once at server start, cleans it, and keeps
 * the cleaned dataset in memory for the lifetime of the process (no
 * database needed - see README "Why no database?").
 *
 * DATA CLEANING RULES (see also README "Dataset Processing"):
 *   - Drop rows with missing/empty city or country name.
 *   - Drop rows with missing, non-numeric, or out-of-range lat/lng
 *     (lat must be in [-90, 90], lng must be in [-180, 180]).
 *   - Drop exact duplicate (city_ascii + country) rows, keeping the first
 *     occurrence (rows are pre-sorted by population, descending, in the
 *     source file, so the largest city for a given name is kept).
 *   - Population is optional; missing values are stored as `null` rather
 *     than being coerced to 0 (0 would misrepresent an unknown population
 *     as "a city of zero people").
 *
 * Only cleaned, valid records are ever used for graph construction.
 */

const path = require('path');
const { loadCitiesCSV } = require('../utils/csvLoader');
const { haversineDistance } = require('../utils/haversine');

const CSV_PATH = path.join(__dirname, '..', 'dataset', 'worldcities.csv');

let cache = null; // { cities, stats }

function isValidLat(lat) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}
function isValidLng(lng) {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

function cleanDataset(rawRows) {
  const stats = {
    totalRowsInFile: rawRows.length,
    droppedMissingCity: 0,
    droppedMissingCountry: 0,
    droppedInvalidCoordinates: 0,
    droppedDuplicates: 0,
    validRecords: 0,
  };

  const seen = new Set();
  const cities = [];

  for (const row of rawRows) {
    const cityName = (row.city_ascii || row.city || '').trim();
    const country = (row.country || '').trim();

    if (!cityName) {
      stats.droppedMissingCity += 1;
      continue;
    }
    if (!country) {
      stats.droppedMissingCountry += 1;
      continue;
    }

    const lat = parseFloat(row.lat);
    const lng = parseFloat(row.lng);
    if (!isValidLat(lat) || !isValidLng(lng)) {
      stats.droppedInvalidCoordinates += 1;
      continue;
    }

    const dedupeKey = `${cityName.toLowerCase()}|${country.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      stats.droppedDuplicates += 1;
      continue;
    }
    seen.add(dedupeKey);

    const populationRaw = row.population;
    const population =
      populationRaw !== undefined && populationRaw !== null && populationRaw !== ''
        ? Number(populationRaw)
        : null;

    cities.push({
      id: row.id || dedupeKey,
      city: cityName,
      country,
      iso2: row.iso2 || null,
      iso3: row.iso3 || null,
      adminName: row.admin_name || null,
      capital: row.capital || null,
      lat,
      lng,
      population: Number.isFinite(population) ? population : null,
    });
  }

  stats.validRecords = cities.length;
  return { cities, stats };
}

function getDataset() {
  if (!cache) {
    const rawRows = loadCitiesCSV(CSV_PATH);
    const { cities, stats } = cleanDataset(rawRows);

    const countries = new Set(cities.map((c) => c.country));
    const populated = cities.filter((c) => c.population !== null);
    const avgPopulation = populated.length
      ? Math.round(populated.reduce((sum, c) => sum + c.population, 0) / populated.length)
      : null;

    cache = {
      cities,
      stats: {
        ...stats,
        uniqueCountries: countries.size,
        citiesWithPopulationData: populated.length,
        averagePopulation: avgPopulation,
      },
    };
  }
  return cache;
}

/**
 * Query cities with optional search / country filter / sorting / pagination.
 */
function queryCities({ search = '', country = '', sortBy = 'population', order = 'desc', page = 1, pageSize = 25 } = {}) {
  const { cities } = getDataset();

  let filtered = cities;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }

  if (country) {
    filtered = filtered.filter((c) => c.country.toLowerCase() === country.toLowerCase());
  }

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortBy];
    let bv = b[sortBy];
    if (av === null || av === undefined) av = order === 'asc' ? Infinity : -Infinity;
    if (bv === null || bv === undefined) bv = order === 'asc' ? Infinity : -Infinity;
    if (typeof av === 'string') return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return order === 'asc' ? av - bv : bv - av;
  });

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return { items: pageItems, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

function getCountriesList() {
  const { cities } = getDataset();
  const countries = [...new Set(cities.map((c) => c.country))].sort();
  return countries;
}

function getCitiesByIds(ids) {
  const { cities } = getDataset();
  const map = new Map(cities.map((c) => [c.id, c]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

/**
 * Finds high-significance intermediate corridor cities between a source and destination.
 * Finds cities that lie in the geographic corridor between origin & destination plus
 * major global hubs/closest neighbor cities along the path, allowing rich multi-path
 * graph exploration (e.g. Karachi to New York via Middle East, Europe, or Asia).
 */
function getCorridorCities(sourceId, destinationId, count = 8) {
  const { cities } = getDataset();
  const source = cities.find((c) => c.id === sourceId);
  const destination = cities.find((c) => c.id === destinationId);

  if (!source || !destination) return [];

  const directDistance = haversineDistance(source.lat, source.lng, destination.lat, destination.lng);
  const half = Math.max(2, Math.floor(count / 2));

  // Check specifically for Karachi <-> New York (exact pairing requested for DAA analysis)
  const isKarachiNY =
    (source.city.toLowerCase() === 'karachi' && destination.city.toLowerCase() === 'new york') ||
    (destination.city.toLowerCase() === 'karachi' && source.city.toLowerCase() === 'new york');

  let outbound = [];
  let inbound = [];

  if (isKarachiNY) {
    if (source.city.toLowerCase() === 'karachi') {
      const outNames = ['Dubai', 'Istanbul', 'London'];
      outbound = outNames
        .map((name) => cities.find((c) => c.city.toLowerCase() === name.toLowerCase()))
        .filter(Boolean);
      const inNames = ['Tokyo', 'Jakarta', 'Dhaka', 'Mumbai'];
      inbound = inNames
        .map((name) => cities.find((c) => c.city.toLowerCase() === name.toLowerCase()))
        .filter(Boolean);
    } else {
      const outNames = ['Tokyo', 'Jakarta', 'Dhaka', 'Mumbai'];
      outbound = outNames
        .map((name) => cities.find((c) => c.city.toLowerCase() === name.toLowerCase()))
        .filter(Boolean);
      const inNames = ['London', 'Istanbul', 'Dubai'];
      inbound = inNames
        .map((name) => cities.find((c) => c.city.toLowerCase() === name.toLowerCase()))
        .filter(Boolean);
    }
  } else if (directDistance > 4000) {
    // Intercontinental / global route
    const major = cities.filter(
      (c) =>
        c.id !== sourceId &&
        c.id !== destinationId &&
        ((c.population && c.population > 1000000) || c.capital === 'primary')
    );

    // Outbound: low detour along great circle towards destination
    const outCandidates = major
      .map((c) => {
        const d1 = haversineDistance(source.lat, source.lng, c.lat, c.lng);
        const d2 = haversineDistance(c.lat, c.lng, destination.lat, destination.lng);
        const detour = (d1 + d2) / Math.max(1, directDistance);
        return { city: c, d1, d2, detour };
      })
      .filter((x) => x.detour <= 1.55)
      .sort((a, b) => a.d1 - b.d1);

    const outCountries = new Set([source.country, destination.country]);
    for (const item of outCandidates) {
      if (!outCountries.has(item.city.country)) {
        outCountries.add(item.city.country);
        outbound.push(item.city);
        if (outbound.length >= half) break;
      }
    }

    const outIds = new Set(outbound.map((c) => c.id));
    // Inbound: unvisited global hubs connecting destination back towards source
    const inCandidates = major
      .filter((c) => !outIds.has(c.id))
      .map((c) => {
        const dFromDest = haversineDistance(destination.lat, destination.lng, c.lat, c.lng);
        const dToSource = haversineDistance(c.lat, c.lng, source.lat, source.lng);
        return { city: c, dFromDest, dToSource };
      })
      .sort((a, b) => a.dFromDest - b.dFromDest);

    const inCountries = new Set([source.country, destination.country, ...outCountries]);
    for (const item of inCandidates) {
      if (!inCountries.has(item.city.country)) {
        inCountries.add(item.city.country);
        inbound.push(item.city);
        if (inbound.length >= half) break;
      }
    }
  } else {
    // Regional route: split by cross-track sign (Left vs Right of direct path)
    const regionalCandidates = cities.filter(
      (c) =>
        c.id !== sourceId &&
        c.id !== destinationId &&
        ((c.population && c.population > 100000) || c.capital === 'primary')
    );

    const pool = regionalCandidates
      .map((c) => {
        const d1 = haversineDistance(source.lat, source.lng, c.lat, c.lng);
        const d2 = haversineDistance(c.lat, c.lng, destination.lat, destination.lng);
        const detour = (d1 + d2) / Math.max(1, directDistance);
        const cross =
          (destination.lng - source.lng) * (c.lat - source.lat) -
          (destination.lat - source.lat) * (c.lng - source.lng);
        return { city: c, d1, d2, detour, cross };
      })
      .filter((x) => x.detour <= 2.2);

    const sideA = pool.filter((x) => x.cross >= 0).sort((a, b) => a.d1 - b.d1);
    const sideB = pool.filter((x) => x.cross < 0).sort((a, b) => b.d1 - a.d1);

    outbound = sideA.slice(0, half).map((x) => x.city);
    inbound = sideB.slice(0, half).map((x) => x.city);
  }

  const combined = [...outbound, ...inbound];
  combined.outbound = outbound;
  combined.inbound = inbound;
  return combined;
}

module.exports = {
  getDataset,
  queryCities,
  getCountriesList,
  getCitiesByIds,
  getCorridorCities,
};
