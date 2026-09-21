import { useState } from 'react';
import { Sparkles, Clock, Hash } from 'lucide-react';
import { Badge, Button, Card } from '../ui/Primitives';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function cityName(cities, id) {
  return cities.find((c) => c.id === id)?.city || id;
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-data text-sm font-bold text-[#1e1e1e]">{value}</p>
    </div>
  );
}

export default function ResultCard({ type, data, cities }) {
  const { addToast } = useToast();
  const [explanation, setExplanation] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  if (!data) return null;

  const tone = type === 'dijkstra' ? 'dijkstra' : type === 'prim' ? 'prim' : 'floyd';

  const handleExplain = async () => {
    setLoadingExplain(true);
    try {
      const context = buildContext(type, data, cities);
      const res = await api.aiExplain(context);
      setExplanation(res.explanation);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingExplain(false);
    }
  };

  return (
    <Card accent={tone} className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-[#1e1e1e]">Result</h3>
          <p className="text-sm font-semibold text-[#4a4a4a]">{data.algorithm}</p>
        </div>
        <Badge tone={tone}>{data.category}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        {type === 'dijkstra' && (
          <>
            <Field label="Source" value={cityName(cities, data.result.source)} />
            <Field label="Destination" value={cityName(cities, data.result.destination)} />
            <Field label="Shortest Distance" value={data.result.reachable ? `${data.result.distance} km` : 'Unreachable'} />
            <Field label="Nodes Processed" value={data.metrics.nodesProcessed} />
            <Field label="Edges Examined" value={data.metrics.edgesExamined} />
            <Field label="Execution Time" value={`${data.metrics.executionTimeMs} ms`} />
          </>
        )}
        {type === 'prim' && (
          <>
            <Field label="Start" value={cityName(cities, data.result.start)} />
            <Field label="MST Weight" value={`${data.result.mstWeight} km`} />
            <Field label="MST Edges" value={data.metrics.edgesInMST} />
            <Field label="Vertices Included" value={`${data.result.verticesIncluded} / ${data.result.totalVertices}`} />
            <Field label="Edges Considered" value={data.metrics.edgesConsidered} />
            <Field label="Execution Time" value={`${data.metrics.executionTimeMs} ms`} />
          </>
        )}
        {type === 'floyd' && (
          <>
            <Field label="Matrix Size" value={`${data.graphMeta.vertices} × ${data.graphMeta.vertices}`} />
            <Field label="Total Comparisons" value={data.metrics.totalComparisons.toLocaleString()} />
            <Field label="Updates" value={data.metrics.totalUpdates.toLocaleString()} />
            {data.pathInfo && (
              <>
                <Field label="Inspected Pair" value={`${cityName(cities, data.pathInfo.source)} → ${cityName(cities, data.pathInfo.destination)}`} />
                <Field label="Distance" value={data.pathInfo.reachable ? `${data.pathInfo.distance} km` : 'Unreachable'} />
              </>
            )}
            <Field label="Execution Time" value={`${data.metrics.executionTimeMs} ms`} />
          </>
        )}
      </div>

      {type !== 'floyd' && (
        <div className="mb-5">
          <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider mb-1.5">
            {type === 'dijkstra' ? 'PATH' : 'MST EDGES'}
          </p>
          {type === 'dijkstra' ? (
            <p className="text-sm font-semibold text-[#1e1e1e]">
              {data.result.path.length > 0 ? data.result.path.map((id) => cityName(cities, id)).join(' → ') : 'No path found'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.result.mstEdges.map((e, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-md bg-[#ffdcdc] text-[#252525] border border-[#e5bebe] font-data font-semibold">
                  {cityName(cities, e.from)}—{cityName(cities, e.to)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {data.pathInfo?.path && (
        <div className="mb-5">
          <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider mb-1.5">RECONSTRUCTED PATH</p>
          <p className="text-sm font-semibold text-[#1e1e1e]">{data.pathInfo.path.map((id) => cityName(cities, id)).join(' → ')}</p>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs font-semibold text-[#66615a] mb-5">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-[#8ea66b]" /> {data.complexity.time}
        </span>
        <span className="flex items-center gap-1">
          <Hash className="h-3.5 w-3.5 text-[#d8a2a2]" /> Space {data.complexity.space}
        </span>
      </div>

      <Button variant="secondary" size="sm" icon={Sparkles} loading={loadingExplain} onClick={handleExplain}>
        Explain with AI
      </Button>

      {explanation && (
        <div className="mt-4 rounded-xl bg-[#fff9d6] border border-[#e5bebe] p-4 text-sm text-[#252525] leading-relaxed whitespace-pre-wrap">
          {explanation}
        </div>
      )}
    </Card>
  );
}

function buildContext(type, data, cities) {
  const name = (id) => cityName(cities, id);
  if (type === 'dijkstra') {
    return {
      algorithm: 'Dijkstra',
      category: data.category,
      vertices: data.metrics.nodesInGraph,
      source: name(data.result.source),
      destination: name(data.result.destination),
      shortestDistanceKm: data.result.distance,
      path: data.result.path.map(name),
      nodesProcessed: data.metrics.nodesProcessed,
      edgesExamined: data.metrics.edgesExamined,
      executionTimeMs: data.metrics.executionTimeMs,
      complexity: data.complexity,
    };
  }
  if (type === 'prim') {
    return {
      algorithm: 'Prim',
      category: data.category,
      vertices: data.metrics.nodesInGraph,
      start: name(data.result.start),
      mstWeightKm: data.result.mstWeight,
      mstEdgeCount: data.metrics.edgesInMST,
      mstEdges: data.result.mstEdges.map((e) => `${name(e.from)}-${name(e.to)} (${e.weight}km)`),
      isSpanning: data.result.isSpanning,
      executionTimeMs: data.metrics.executionTimeMs,
      complexity: data.complexity,
    };
  }
  return {
    algorithm: 'Floyd-Warshall',
    category: data.category,
    vertices: data.graphMeta.vertices,
    totalComparisons: data.metrics.totalComparisons,
    totalUpdates: data.metrics.totalUpdates,
    inspectedPair: data.pathInfo ? `${name(data.pathInfo.source)} -> ${name(data.pathInfo.destination)}` : null,
    inspectedDistanceKm: data.pathInfo?.distance ?? null,
    executionTimeMs: data.metrics.executionTimeMs,
    complexity: data.complexity,
  };
}
