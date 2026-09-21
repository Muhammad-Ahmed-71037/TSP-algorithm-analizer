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
  dijkstra: '#8ea66b',
  prim: '#8ea66b',
  floyd: '#8ea66b',
  neutral: '#d8a2a2',
  ai: '#8ea66b',
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
    <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} scrollWheelZoom className="rounded-xl border border-[#e5bebe]">
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
              color: isHighlighted ? '#8ea66b' : '#d8a2a2',
              weight: isHighlighted ? 4 : 1.5,
              opacity: isHighlighted ? 0.95 : 0.45,
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
              color: emphasized ? '#8ea66b' : '#d8a2a2',
              fillColor: emphasized ? '#8ea66b' : '#ffdcdc',
              fillOpacity: 0.95,
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
