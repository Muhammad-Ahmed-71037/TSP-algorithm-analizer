/**
 * A self-contained, decorative animated node network used only on the
 * landing page hero. Node positions are fixed (deterministic layout, not
 * random per render) so the animation is stable across reloads. Edges
 * "pulse" a travelling highlight to suggest an algorithm moving through
 * the graph - this is the single orchestrated motion moment for the whole
 * app (see design principles: spend boldness in one place).
 */

const NODES = [
  { id: 'a', x: 60, y: 90, tone: 'dijkstra' },
  { id: 'b', x: 190, y: 40, tone: 'prim' },
  { id: 'c', x: 320, y: 110, tone: 'floyd' },
  { id: 'd', x: 130, y: 190, tone: 'dijkstra' },
  { id: 'e', x: 270, y: 220, tone: 'prim' },
  { id: 'f', x: 400, y: 60, tone: 'floyd' },
  { id: 'g', x: 400, y: 200, tone: 'dijkstra' },
  { id: 'h', x: 40, y: 250, tone: 'prim' },
];

const EDGES = [
  ['a', 'b'], ['b', 'c'], ['a', 'd'], ['b', 'd'], ['d', 'e'], ['c', 'e'],
  ['c', 'f'], ['e', 'g'], ['c', 'g'], ['d', 'h'], ['e', 'h'], ['f', 'g'],
];

const TONE_HEX = {
  dijkstra: '#38bdf8',
  prim: '#22c55e',
  floyd: '#f97316',
};

function nodeById(id) {
  return NODES.find((n) => n.id === id);
}

export default function NetworkHero({ className = '' }) {
  return (
    <svg
      viewBox="0 0 440 290"
      className={className}
      role="img"
      aria-label="Animated illustration of a graph network with cities as nodes"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {EDGES.map(([fromId, toId], i) => {
        const from = nodeById(fromId);
        const to = nodeById(toId);
        return (
          <g key={`${fromId}-${toId}`}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#263449" strokeWidth="1.5" />
            <circle r="3.5" fill="#ffffff">
              <animateMotion
                dur={`${4 + (i % 4)}s`}
                repeatCount="indefinite"
                path={`M${from.x},${from.y} L${to.x},${to.y}`}
                begin={`${i * 0.35}s`}
              />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${4 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} />
            </circle>
          </g>
        );
      })}

      {NODES.map((n, i) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="16" fill="url(#nodeGlow)" opacity="0.25" />
          <circle cx={n.x} cy={n.y} r="6.5" fill={TONE_HEX[n.tone]}>
            <animate attributeName="r" values="6.5;8;6.5" dur="3s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </circle>
          <circle cx={n.x} cy={n.y} r="6.5" fill="none" stroke={TONE_HEX[n.tone]} strokeOpacity="0.4">
            <animate attributeName="r" values="6.5;18;6.5" dur="3s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </circle>
        </g>
      ))}
    </svg>
  );
}
