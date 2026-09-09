/**
 * Backend algorithm step descriptions are generated using generic graph
 * node ids (the algorithms don't know about "cities" - see server/algorithms).
 * This replaces those raw ids with human-readable city names for display.
 *
 * Also: JSON has no representation for Infinity, so any `Infinity` value in
 * an API response (e.g. an unvisited node's distance, or an unreachable
 * cell in the Floyd-Warshall matrix) is serialized as `null`. `isInfinite`
 * treats both as "infinite" for display purposes only - the real
 * algorithm computation on the server used actual Infinity throughout.
 */

export function humanizeDescription(text, cities) {
  if (!text) return text;
  let result = text;
  // Replace longer ids first to avoid partial-substring collisions.
  const sorted = [...cities].sort((a, b) => String(b.id).length - String(a.id).length);
  for (const c of sorted) {
    if (result.includes(String(c.id))) {
      result = result.split(String(c.id)).join(c.city);
    }
  }
  return result;
}

export function isInfinite(value) {
  return value === Infinity || value === null || value === undefined;
}

export function formatDistance(value, unit = 'km') {
  return isInfinite(value) ? '∞' : `${value} ${unit}`;
}
