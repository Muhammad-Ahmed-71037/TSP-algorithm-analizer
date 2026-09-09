const { getDataset, queryCities, getCountriesList, getCitiesByIds, getCorridorCities } = require('../services/datasetService');
const { AppError } = require('../middleware/errorHandler');

function getCities(req, res) {
  const { search = '', country = '', sortBy = 'population', order = 'desc', page = '1', pageSize = '25' } = req.query;

  const result = queryCities({
    search,
    country,
    sortBy,
    order,
    page: Math.max(1, parseInt(page, 10) || 1),
    pageSize: Math.min(100000, Math.max(1, parseInt(pageSize, 10) || 25)),
  });

  res.json(result);
}

function getStats(req, res) {
  const { stats } = getDataset();
  res.json(stats);
}

function getCountries(req, res) {
  res.json({ countries: getCountriesList() });
}

function getCorridor(req, res) {
  const { source, destination, count = 12 } = req.query;
  if (!source || !destination) {
    throw new AppError('source and destination city ids are required.');
  }
  const corridorCities = getCorridorCities(source, destination, Math.min(30, Math.max(4, parseInt(count, 10) || 12)));
  res.json({ corridorCities });
}

function getCitiesBatch(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Provide an array of city ids in the request body.');
  }
  const cities = getCitiesByIds(ids);
  res.json({ cities });
}

module.exports = { getCities, getStats, getCountries, getCitiesBatch, getCorridor };
