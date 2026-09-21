import { Card } from '../ui/Primitives';
import { isInfinite } from '../../utils/format';

function cityName(cities, id) {
  return cities.find((c) => c.id === id)?.city || id;
}

export function DijkstraLiveState({ step, cities }) {
  if (!step) return null;
  const distances = step.distances || {};
  const visited = step.visitedNodes || [];

  return (
    <Card className="p-5">
      <h4 className="font-bold text-sm text-[#1E1E1E] mb-3">Live State</h4>
      <div className="mb-4">
        <p className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider mb-1.5">VISITED ({visited.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {visited.length === 0 && <span className="text-xs text-[#66615A] italic">None yet</span>}
          {visited.map((id) => (
            <span key={id} className="text-xs px-2.5 py-1 rounded-full bg-[#FFDCDC] text-[#252525] border border-[#E5BEBE] font-medium">
              {cityName(cities, id)}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider mb-1.5">DISTANCES</p>
      <div className="max-h-56 overflow-y-auto scroll-thin space-y-1 font-data text-xs">
        {Object.entries(distances).map(([id, dist]) => (
          <div key={id} className="flex justify-between border-b border-[#F5E6E6] py-1.5 text-xs">
            <span className="font-sans font-medium text-[#252525]">{cityName(cities, id)}</span>
            <span className="font-semibold text-[#4A4A4A]">{isInfinite(dist) ? '∞' : `${dist} km`}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PrimLiveState({ step, cities }) {
  if (!step) return null;
  const vertices = step.mstVertices || [];
  const edges = step.mstEdges || [];

  return (
    <Card className="p-5">
      <h4 className="font-bold text-sm text-[#1E1E1E] mb-3">Live State</h4>
      <div className="mb-4">
        <p className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider mb-1.5">MST VERTICES ({vertices.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {vertices.map((id) => (
            <span key={id} className="text-xs px-2.5 py-1 rounded-full bg-[#FFDCDC] text-[#252525] border border-[#E5BEBE] font-medium">
              {cityName(cities, id)}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider mb-1.5">
        MST EDGES ({edges.length}) · Total {step.mstWeight ?? 0} km
      </p>
      <div className="max-h-48 overflow-y-auto scroll-thin space-y-1 font-data text-xs">
        {edges.map((e, i) => (
          <div key={i} className="flex justify-between border-b border-[#F5E6E6] py-1.5 text-xs">
            <span className="font-sans font-medium text-[#252525]">
              {cityName(cities, e.from)} <span className="text-[#8EA66B]">→</span> {cityName(cities, e.to)}
            </span>
            <span className="font-semibold text-[#4A4A4A]">{e.weight} km</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function FloydMatrixView({ matrix, cityIds, cities, step }) {
  if (!matrix) return null;
  const labels = cityIds.map((id) => cityName(cities, id));
  const highlightI = step ? cityIds.indexOf(step.from) : -1;
  const highlightJ = step ? cityIds.indexOf(step.to) : -1;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-[#1E1E1E]">Distance Matrix</h4>
        {step && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFF9D6] text-[#252525] border border-[#E5BEBE]">
            via {cityName(cities, step.intermediateVertex)}
          </span>
        )}
      </div>
      <div className="overflow-auto scroll-thin max-h-80">
        <table className="font-data text-[11px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[#FFFDF5] px-2 py-1"></th>
              {labels.map((l, j) => (
                <th key={j} className={`px-2 py-1 text-center font-bold text-xs ${j === highlightJ ? 'text-[#8EA66B]' : 'text-[#4A4A4A]'}`}>
                  {l.slice(0, 3).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th className={`sticky left-0 bg-[#FFFDF5] px-2 py-1 text-left font-bold text-xs ${i === highlightI ? 'text-[#8EA66B]' : 'text-[#4A4A4A]'}`}>
                  {labels[i].slice(0, 3).toUpperCase()}
                </th>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`px-2 py-1 text-center ${
                      i === highlightI && j === highlightJ
                        ? 'bg-[#8EA66B] text-white rounded font-bold'
                        : i === j
                        ? 'text-[#77716A]'
                        : 'text-[#252525] font-medium'
                    }`}
                  >
                    {isInfinite(val) ? '∞' : Math.round(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
