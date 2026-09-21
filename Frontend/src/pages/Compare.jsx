import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, GitCompare } from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import { useTSP } from '../context/TSPContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';
import { SectionHeading, Button, Card, EmptyState } from '../components/ui/Primitives';

function cityName(cities, id) {
  return cities.find((c) => c.id === id)?.city || id;
}

export default function Compare() {
  const { graph, results } = useGraph();
  const { results: tspResults } = useTSP();
  const { addToast } = useToast();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const { dijkstra, prim, floydWarshall } = results;
  const { dynamicProgramming: dpTsp, greedy: greedyTsp, dijkstraTSP, aiTSP } = tspResults;

  const graphRows = [
    dijkstra && {
      name: 'Dijkstra (Graph)',
      category: 'Greedy',
      purpose: 'Single-Source Shortest Path',
      vertices: dijkstra.metrics.nodesInGraph,
      edges: dijkstra.metrics.edgesExamined,
      time: dijkstra.metrics.executionTimeMs,
      operations: dijkstra.metrics.nodesProcessed + dijkstra.metrics.edgesExamined,
      complexity: dijkstra.complexity.time,
      result: dijkstra.result.reachable ? `${dijkstra.result.distance} km` : 'Unreachable',
    },
    prim && {
      name: 'Prim (Graph)',
      category: 'Greedy',
      purpose: 'Minimum Spanning Tree',
      vertices: prim.metrics.nodesInGraph,
      edges: prim.metrics.edgesConsidered,
      time: prim.metrics.executionTimeMs,
      operations: prim.metrics.edgesConsidered,
      complexity: prim.complexity.time,
      result: `${prim.result.mstWeight} km MST`,
    },
    floydWarshall && {
      name: 'Floyd-Warshall (Graph)',
      category: 'Dynamic Programming',
      purpose: 'All-Pairs Shortest Path',
      vertices: floydWarshall.metrics.nodesInGraph,
      edges: floydWarshall.metrics.totalComparisons,
      time: floydWarshall.metrics.executionTimeMs,
      operations: floydWarshall.metrics.totalComparisons,
      complexity: floydWarshall.complexity.time,
      result: floydWarshall.pathInfo?.reachable ? `${floydWarshall.pathInfo.distance} km (inspected pair)` : 'All-pairs computed',
    },
  ].filter(Boolean);

  const tspRows = [
    dpTsp && {
      name: 'Dynamic Programming (TSP)',
      category: 'Dynamic Programming',
      purpose: 'TSP Tour (Bitonic Two-Chain)',
      vertices: dpTsp.metrics.citiesInTour,
      edges: dpTsp.metrics.citiesInTour,
      time: dpTsp.metrics.executionTimeMs,
      operations: dpTsp.metrics.statesComputed,
      complexity: 'O(V²)',
      result: `${dpTsp.result.totalDistance} km tour`,
    },
    greedyTsp && {
      name: 'Greedy (TSP)',
      category: 'Greedy Heuristic',
      purpose: 'TSP Tour (Cheapest Insertion)',
      vertices: greedyTsp.metrics.citiesInTour,
      edges: greedyTsp.metrics.citiesInTour,
      time: greedyTsp.metrics.executionTimeMs,
      operations: greedyTsp.metrics.insertionDecisions,
      complexity: 'O(V³)',
      result: `${greedyTsp.result.totalDistance} km tour`,
    },
    dijkstraTSP && {
      name: 'Dijkstra (TSP)',
      category: 'Greedy / Shortest Path',
      purpose: 'TSP Tour (Repeated Dijkstra)',
      vertices: dijkstraTSP.result.destinations.length + 1,
      edges: dijkstraTSP.metrics.shortestPathsCalculated,
      time: dijkstraTSP.metrics.executionTimeMs,
      operations: dijkstraTSP.metrics.shortestPathsCalculated,
      complexity: 'O(V · (V + E) log V)',
      result: `${dijkstraTSP.result.totalDistance} km tour`,
    },
    aiTSP && {
      name: 'AI TSP Solver',
      category: 'AI / LLM Heuristic',
      purpose: 'TSP Tour (LLM Planner)',
      vertices: aiTSP.metrics.destinations + 1,
      edges: aiTSP.metrics.destinations + 1,
      time: aiTSP.metrics.requestTimeMs,
      operations: aiTSP.metrics.destinations,
      complexity: 'API / O(V)',
      result: `${aiTSP.result.totalDistance} km tour`,
    },
  ].filter(Boolean);

  const rows = [...tspRows, ...graphRows];
  const anyResult = rows.length > 0;

  const chartData = rows.map((r) => ({ name: r.name, 'Execution Time (ms)': r.time, Operations: r.operations }));

  const handleCompare = async () => {
    setLoading(true);
    try {
      const payload = rows.map((r) => ({ ...r }));
      const res = await api.aiCompare(payload);
      setComparison(res.comparison);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Analysis"
        title="Algorithm Comparison"
        description="Compare algorithm behavior on the same graph, using real measured metrics."
      />

      {!anyResult ? (
        <EmptyState
          icon={GitCompare}
          title="No results to compare yet"
          description="Run at least two algorithms in the Graph Workspace, then come back here to compare them."
        />
      ) : (
        <>
          <Card className="overflow-x-auto mb-8">
            <table className="w-full text-xs min-w-[640px]">
              <thead className="bg-[#fffdf5] border-b border-[#e5bebe]">
                <tr>
                  {['Metric', ...rows.map((r) => r.name)].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-[10px] uppercase tracking-wider text-[#4a4a4a]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-xs divide-y divide-[#f0d5d5]">
                {['category', 'purpose', 'vertices', 'edges', 'time', 'operations', 'complexity', 'result'].map((field, idx) => (
                  <tr key={field} className={idx % 2 === 1 ? 'bg-[#fff9d6]/30' : 'bg-white'}>
                    <td className="px-4 py-2.5 font-sans font-bold text-[#1e1e1e] capitalize">{field === 'time' ? 'Execution Time' : field}</td>
                    {rows.map((r) => (
                      <td key={r.name} className="px-4 py-2.5 text-[#252525] font-medium">
                        {field === 'time' ? `${r[field]} ms` : r[field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <Card className="p-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e1e1e] mb-0.5">Observed Execution Time</h3>
              <p className="text-xs text-[#4a4a4a] mb-4">Measured runtime on current graph (hrtime nanosecond resolution).</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0d5d5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a4a4a' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4a4a4a' }} />
                  <Tooltip />
                  <Bar dataKey="Execution Time (ms)" fill="#8ea66b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e1e1e] mb-0.5">Operations Performed</h3>
              <p className="text-xs text-[#4a4a4a] mb-4">Internal decisions, relaxations, or state computations evaluated.</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0d5d5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a4a4a' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4a4a4a' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Operations" fill="#d8a2a2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-[#1e1e1e]">AI Comparison</h3>
              <Button variant="secondary" icon={Sparkles} loading={loading} onClick={handleCompare} disabled={rows.length < 2}>
                Compare with AI
              </Button>
            </div>
            {rows.length < 2 && <p className="text-sm text-[#66615a] font-medium">Run at least 2 algorithms to enable AI comparison.</p>}
            {comparison && (
              <div className="mt-3 rounded-xl bg-[#fff9d6] border border-[#e5bebe] p-4 text-sm text-[#252525] leading-relaxed whitespace-pre-wrap">
                {comparison}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
