import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
}

const TONE_HEX = {
  dijkstra: '#2563eb', // Royal Blue
  prim: '#059669',     // Emerald
  floyd: '#7c3aed',    // Purple/Indigo
  neutral: '#94a3b8',  // Slate gray
  ai: '#d97706',       // Amber/Ochre
};

/**
 * @param cities - array of { id, city, country, lat, lng }
 * @param edgeList - array of { from, to, weight } (base graph edges)
 * @param highlightEdges - array of [fromId, toId] to draw emphasized (e.g. shortest path / MST)
 * @param highlightTone - 'dijkstra' | 'prim' | 'floyd'
 * @param highlightNodeIds - Set/array of node ids to emphasize (e.g. visited nodes)
 */
export default function MapView({ cities = [], edgeList = [], highlightEdges = [], highlightTone = 'dijkstra', highlightNodeIds = [] }) {
  const cityById = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);
  const highlightSet = useMemo(() => new Set(highlightEdges.map((e) => [e[0], e[1]].sort().join('|'))), [highlightEdges]);
  const highlightNodeSet = useMemo(() => new Set(highlightNodeIds), [highlightNodeIds]);

  const bounds = useMemo(() => {
    if (cities.length === 0) return null;
    if (cities.length === 1) {
      const c = cities[0];
      return L.latLngBounds([c.lat - 5, c.lng - 5], [c.lat + 5, c.lng + 5]);
    }
    return L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
  }, [cities]);

  if (cities.length === 0) return null;

  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} scrollWheelZoom className="rounded-2xl">
      <FitBounds bounds={bounds} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {edgeList.map((edge) => {
        const from = cityById.get(edge.from);
        const to = cityById.get(edge.to);
        if (!from || !to) return null;
        const key = [edge.from, edge.to].sort().join('|');
        const isHighlighted = highlightSet.has(key);
        return (
          <Polyline
            key={key}
            positions={[[from.lat, from.lng], [to.lat, to.lng]]}
            pathOptions={{
              color: isHighlighted ? TONE_HEX[highlightTone] : TONE_HEX.neutral,
              weight: isHighlighted ? 4 : 1.5,
              opacity: isHighlighted ? 0.95 : 0.35,
            }}
          >
            <Tooltip sticky>{Math.round(edge.weight)} km</Tooltip>
          </Polyline>
        );
      })}

      {cities.map((c) => {
        const emphasized = highlightNodeSet.has(c.id);
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={emphasized ? 7 : 5}
            pathOptions={{
              color: emphasized ? TONE_HEX[highlightTone] : '#334155',
              fillColor: emphasized ? TONE_HEX[highlightTone] : '#64748B',
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {c.city}, {c.country}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
