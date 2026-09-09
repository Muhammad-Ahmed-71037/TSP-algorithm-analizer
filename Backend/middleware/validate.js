/**
 * validate.js
 * ---------------------------------------------------------------------------
 * Lightweight, dependency-free request validation helpers. Each function
 * throws an AppError (400) with a friendly message on invalid input.
 */

const { AppError } = require('./errorHandler');

function validateGraphRequest(body) {
  const { cityIds, k } = body;

  if (!Array.isArray(cityIds)) {
    throw new AppError('cityIds must be an array of city ids.');
  }
  if (cityIds.length < 2) {
    throw new AppError('Select at least 2 cities to build a graph.');
  }
  const uniqueIds = new Set(cityIds);
  if (uniqueIds.size !== cityIds.length) {
    throw new AppError('Duplicate city selected. Please select distinct cities.');
  }

  const kValue = k === undefined ? 5 : Number(k);
  if (!Number.isInteger(kValue) || kValue < 1 || kValue > 15) {
    throw new AppError('Nearest-neighbor count (k) must be an integer between 1 and 15.');
  }

  return { cityIds, k: kValue };
}

function validateSourceDestination(body, { requireDestination = true } = {}) {
  const { source, destination } = body;
  if (!source || typeof source !== 'string') {
    throw new AppError('A valid source city is required.');
  }
  if (requireDestination) {
    if (!destination || typeof destination !== 'string') {
      throw new AppError('A valid destination city is required.');
    }
    if (source === destination) {
      throw new AppError('Source and destination must be different cities.');
    }
  }
  return { source, destination };
}

module.exports = { validateGraphRequest, validateSourceDestination };
