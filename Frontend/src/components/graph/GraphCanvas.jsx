import { useMemo, useRef, useState } from 'react';

const TONE_HEX = {
  dijkstra: '#8ea66b',
  prim: '#8ea66b',
  floyd: '#8ea66b',
  ai: '#8ea66b',
  neutral: '#d8a2a2',
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
    <div className="relative h-full w-full bg-[#fffdf5] overflow-hidden">
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
            <circle cx="12" cy="12" r="1" fill="#eadcc8" opacity="0.8" />
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
                stroke={isHighlighted ? '#8ea66b' : '#d8a2a2'}
                strokeWidth={isHighlighted ? 3.5 : 1.2}
                strokeOpacity={isHighlighted ? 0.95 : 0.4}
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
                    r={13}
                    fill="#d8a2a2"
                    opacity={0.25}
                  />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isCurrent ? 9 : emphasized ? 7 : 5}
                  fill={isCurrent ? '#8ea66b' : emphasized ? '#d8a2a2' : '#66615a'}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  className="shadow-sm"
                />
                <text
                  x={n.x + 10}
                  y={n.y + 4}
                  fontSize="11"
                  fontWeight="700"
                  fill="#1e1e1e"
                  className="select-none font-sans"
                  style={{
                    paintOrder: 'stroke',
                    stroke: '#ffffff',
                    strokeWidth: '4px',
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
        className="absolute bottom-3 right-3 rounded-lg bg-white/95 backdrop-blur-xs border border-[#d8a2a2] px-3 py-1.5 text-xs font-bold text-[#252525] shadow-xs hover:bg-[#ffdcdc]/30 transition-all cursor-pointer"
      >
        Reset view
      </button>
    </div>
  );
}
