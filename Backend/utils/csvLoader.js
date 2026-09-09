/**
 * csvLoader.js
 * ---------------------------------------------------------------------------
 * Reads worldcities.csv from disk and parses it into an array of plain
 * objects, one per row, using the `csv-parse` library (a well-established
 * dependency purely for correct CSV parsing - it does not touch any
 * algorithmic logic).
 *
 * Actual columns present in the shipped dataset (verified before writing
 * this application - see README "Dataset" section):
 *   city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital,
 *   population, id
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function loadCitiesCSV(csvPath) {
  const resolvedPath = path.resolve(csvPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Dataset file not found at ${resolvedPath}. Make sure worldcities.csv is placed in the /dataset folder.`
    );
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records;
}

module.exports = { loadCitiesCSV };
