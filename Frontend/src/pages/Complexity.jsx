import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles } from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';
import { SectionHeading, Card, Badge, Button } from '../components/ui/Primitives';

const ALGO_COMPLEXITY = [
  { name: 'DP Bitonic Tour (TSP)', category: 'Dynamic Programming', tone: 'floyd', time: 'O(V²)', space: 'O(V²)', note: 'Polynomial dynamic programming over monotonic chains with subproblem memoization.' },
  { name: 'Cheapest Insertion (TSP)', category: 'Greedy Heuristic', tone: 'prim', time: 'O(V³)', space: 'O(V)', note: 'Greedily tests insertion cost for all unvisited locations into all existing tour segments.' },
  { name: 'Dijkstra SSSP Tour (TSP)', category: 'Greedy / Shortest Path', tone: 'dijkstra', time: 'O(V · (V + E) log V)', space: 'O(V + E)', note: 'Repeated Dijkstra shortest path calculations across destinations with independent return leg.' },
  { name: 'AI TSP Solver', category: 'AI / LLM Heuristic', tone: 'ai', time: 'API / O(V)', space: 'O(V)', note: 'Evaluates pairwise distance matrices and coordinate geometries without calling other algorithms.' },
  { name: 'Dijkstra SSSP', category: 'Greedy', tone: 'dijkstra', time: 'O((V + E) log V)', space: 'O(V + E)', note: 'Binary min-heap priority queue for selecting the next closest unvisited node.' },
  { name: 'Prim MST', category: 'Greedy', tone: 'prim', time: 'O(E log V)', space: 'O(V + E)', note: 'Binary min-heap priority queue for selecting the next cheapest crossing edge.' },
  { name: 'Floyd-Warshall', category: 'Dynamic Programming', tone: 'floyd', time: 'O(V³)', space: 'O(V²)', note: 'Triple nested loop over all vertex triples (i, j, k) updating a V×V distance matrix.' },
];

function buildGrowthData() {
  const data = [];
  for (let v = 2; v <= 40; v++) {
    data.push({
      V: v,
      'O(V)': v,
      'O(log V)': Math.log2(v),
      'O(V log V)': v * Math.log2(v),
      'O(V²)': v * v,
      'O(V³)': v * v * v,
    });
  }
  return data;
}

export default function Complexity() {
  const { results } = useGraph();
  const { addToast } = useToast();
  const growthData = useMemo(buildGrowthData, []);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasMetrics = results.dijkstra || results.prim || results.floydWarshall;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const metrics = {
        vertices: results.dijkstra?.metrics.nodesInGraph || results.prim?.metrics.nodesInGraph || results.floydWarshall?.metrics.nodesInGraph,
        dijkstraMs: results.dijkstra?.metrics.executionTimeMs ?? null,
        primMs: results.prim?.metrics.executionTimeMs ?? null,
        floydWarshallMs: results.floydWarshall?.metrics.executionTimeMs ?? null,
      };
      const res = await api.aiPerformance(metrics);
      setAnalysis(res.analysis);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Theory"
        title="Complexity Analyzer"
        description="Understand the theoretical time and space complexity behind each algorithm, and how growth scales with input size."
      />

      <Card className="p-6 mb-6">
        <h3 className="font-display font-semibold text-lg mb-3">Big-O Notation, briefly</h3>
        <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed">
          Big-O describes how an algorithm's running time or memory use grows as the input size grows, ignoring
          constant factors. <span className="font-data">V</span> is the number of vertices (cities) and{' '}
          <span className="font-data">E</span> is the number of edges (connections) in the graph. An algorithm that
          is <span className="font-data">O(V²)</span> will take roughly four times as long if you double the number
          of cities; an <span className="font-data">O(V³)</span> algorithm will take roughly eight times as long.
        </p>
      </Card>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {ALGO_COMPLEXITY.map((a) => (
          <Card key={a.name} accent={a.tone} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">{a.name}</h3>
              <Badge tone={a.tone}>{a.category}</Badge>
            </div>
            <p className="font-data text-sm mb-1">Time: {a.time}</p>
            <p className="font-data text-sm mb-3">Space: {a.space}</p>
            <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">{a.note}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 mb-8">
        <h3 className="font-display font-semibold text-lg mb-1">Theoretical Growth Curves</h3>
        <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-4">
          A theoretical visualization of how each growth rate scales with input size V (log scale on the y-axis) —
          this is not a measured benchmark.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="V" tick={{ fontSize: 12 }} label={{ value: 'V (vertices)', position: 'insideBottom', offset: -5, fontSize: 12 }} />
            <YAxis scale="log" domain={['auto', 'auto']} tick={{ fontSize: 12 }} allowDataOverflow />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="O(V)" stroke="#94A3B8" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="O(log V)" stroke="#16B368" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="O(V log V)" stroke="#2E6BFF" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="O(V²)" stroke="#F0A233" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="O(V³)" stroke="#7C5CFC" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-semibold text-lg">AI Performance Analysis</h3>
            <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Uses your actual measured execution times - never invented figures.</p>
          </div>
          <Button variant="secondary" icon={Sparkles} loading={loading} onClick={handleAnalyze} disabled={!hasMetrics}>
            Analyze Performance
          </Button>
        </div>
        {!hasMetrics && <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Run an algorithm in the Graph Workspace first to unlock this.</p>}
        {analysis && <div className="mt-3 rounded-xl bg-[var(--color-ai-soft)] dark:bg-[var(--color-ai-soft-dark)] p-4 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>}
      </Card>
    </div>
  );
}
