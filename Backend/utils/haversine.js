/**
 * haversine.js
 * ---------------------------------------------------------------------------
 * Computes the approximate great-circle distance between two points on
 * Earth's surface given their latitude/longitude, using the Haversine
 * formula. This is NOT actual road distance - it is a straight-line
 * ("as the crow flies") distance over a sphere, which is why every place
 * in the UI that shows this number is labelled "approximate geographic
 * distance".
 *
 * Formula:
 *   a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
 *   c = 2·atan2(√a, √(1−a))
 *   d = R·c
 *
 * R = mean Earth radius = 6371 km
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in kilometers, rounded to 2 decimals
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

module.exports = { haversineDistance, EARTH_RADIUS_KM };
