import { useMemo, useRef, useState } from 'react';

const TONE_HEX = {
  dijkstra: '#2563eb',
  prim: '#059669',
  floyd: '#7c3aed',
  ai: '#d97706',
  neutral: '#cbd5e1',
};

const WIDTH = 800;
const HEIGHT = 520;
const PADDING = 40;

/**
 * Projects lat/lng into SVG x/y using a simple equirectangular projection,
 * scaled to fit the selected cities' bounding box. This keeps relative
 * geography recognisable (west stays left, north stays up) without pulling
 * in a full mapping/force-layout library for what is meant to be the
 * "abstract" graph view (see MapView for the real geographic map).
 */
function useProjectedNodes(cities) {
  return useMemo(() => {
    if (cities.length === 0) return [];
    const lats = cities.map((c) => c.lat);
    const lngs = cities.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return cities.map((c) => ({
      ...c,
      x: PADDING + ((c.lng - minLng) / lngRange) * (WIDTH - PADDING * 2),
      // invert y since latitude increases northward but SVG y increases downward
      y: PADDING + (1 - (c.lat - minLat) / latRange) * (HEIGHT - PADDING * 2),
    }));
  }, [cities]);
}

export default function GraphCanvas({ cities = [], edgeList = [], highlightEdges = [], highlightTone = 'dijkstra', highlightNodeIds = [], currentNodeId = null }) {
  const nodes = useProjectedNodes(cities);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const highlightSet = useMemo(() => new Set(highlightEdges.map((e) => [e[0], e[1]].sort().join('|'))), [highlightEdges]);
  const highlightNodeSet = useMemo(() => new Set(highlightNodeIds), [highlightNodeIds]);

  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const dragState = useRef(null);
  const svgRef = useRef(null);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({ ...t, scale: Math.min(4, Math.max(0.5, t.scale * delta)) }));
  };

  const onPointerDown = (e) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: transform.x, origY: transform.y };
  };
  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setTransform((t) => ({ ...t, x: dragState.current.origX + dx, y: dragState.current.origY + dy }));
  };
  const onPointerUp = () => {
    dragState.current = null;
  };

  const resetView = () => setTransform({ scale: 1, x: 0, y: 0 });

  if (cities.length === 0) return null;

  return (
    <div className="relative h-full w-full bg-[#f8fafc] overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <pattern id="graph-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="#cbd5e1" opacity="0.75" />
          </pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#graph-dot-grid)" />

        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          {edgeList.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const key = [edge.from, edge.to].sort().join('|');
            const isHighlighted = highlightSet.has(key);
            return (
              <line
                key={key}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isHighlighted ? TONE_HEX[highlightTone] : '#94a3b8'}
                strokeWidth={isHighlighted ? 3 : 1}
                strokeOpacity={isHighlighted ? 0.95 : 0.25}
                strokeLinecap="round"
              />
            );
          })}

          {nodes.map((n) => {
            const emphasized = highlightNodeSet.has(n.id);
            const isCurrent = n.id === currentNodeId;
            return (
              <g key={n.id}>
                {emphasized && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={12}
                    fill={TONE_HEX[highlightTone]}
                    opacity={0.15}
                  />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isCurrent ? 9 : emphasized ? 7 : 5}
                  fill={isCurrent ? '#2563eb' : emphasized ? TONE_HEX[highlightTone] : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  className="shadow-sm"
                />
                <text
                  x={n.x + 10}
                  y={n.y + 4}
                  fontSize="11"
                  fontWeight="600"
                  fill="#0f172a"
                  className="select-none font-sans"
                  style={{
                    paintOrder: 'stroke',
                    stroke: '#ffffff',
                    strokeWidth: '3.5px',
                    strokeLinejoin: 'round',
                  }}
                >
                  {n.city}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <button
        onClick={resetView}
        className="absolute bottom-3 right-3 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
      >
        Reset view
      </button>
    </div>
  );
}
