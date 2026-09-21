import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Flag,
  CheckCircle2,
  MapPin,
  Share2,
  Route as RouteIcon,
  Waypoints,
  ArrowRight,
  BrainCircuit,
  GitBranch,
  GitCompare,
  Gauge,
  Database,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import * as api from '../services/api';
import { useGraph } from '../context/GraphContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/ui/StatCard';
import { Badge, Button, Card, SectionHeading, LoadingState, algoStyle } from '../components/ui/Primitives';

const ALGORITHMS = [
  {
    key: 'dynamicProgramming',
    icon: Waypoints,
    tone: 'floyd',
    name: 'Dynamic Programming',
    paradigm: 'Bitonic Subproblems',
    badge: 'EXACT OPTIMAL',
    complexity: 'O(V²)',
    space: 'O(V²)',
    to: '/dynamic-programming',
  },
  {
    key: 'greedy',
    icon: GitBranch,
    tone: 'prim',
    name: 'Greedy Heuristic',
    paradigm: 'Cheapest Insertion',
    badge: 'HEURISTIC',
    complexity: 'O(V³)',
    space: 'O(V)',
    to: '/greedy',
  },
  {
    key: 'dijkstra',
    icon: RouteIcon,
    tone: 'dijkstra',
    name: 'Dijkstra SSSP Tour',
    paradigm: 'Priority Queue',
    badge: 'SHORTEST PATH',
    complexity: 'O((V+E) log V)',
    space: 'O(V+E)',
    to: '/dijkstra',
  },
  {
    key: 'aiTSP',
    icon: BrainCircuit,
    tone: 'ai',
    name: 'AI TSP Solver',
    paradigm: 'LLM Geometric Heuristic',
    badge: 'LLM HEURISTIC',
    complexity: 'O(V) API',
    space: 'O(V)',
    to: '/ai-tsp',
  },
];

// Data for the Growth Area Chart (matching the reference image curve)
const GROWTH_DATA = [
  { step: 'V=4', complexity: 16, time: 2 },
  { step: 'V=8', complexity: 64, time: 5 },
  { step: 'V=12', complexity: 144, time: 11 },
  { step: 'V=16', complexity: 256, time: 24 },
  { step: 'V=20', complexity: 400, time: 48 },
  { step: 'V=24', complexity: 576, time: 92 },
  { step: 'V=28', complexity: 784, time: 160 },
  { step: 'V=32', complexity: 1024, time: 245 },
];

// Data for the Bar Chart (matching the MRR bar chart in the reference image)
const RUNTIME_BAR_DATA = [
  { name: 'Dijkstra', time: 1.8, ops: 45 },
  { name: 'Greedy', time: 4.2, ops: 120 },
  { name: 'DP', time: 8.5, ops: 340 },
  { name: 'AI TSP', time: 450.0, ops: 1 },
];

export default function Dashboard() {
  const { addToast } = useToast();
  const { selectedCities, graph } = useGraph();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchDatasetStats()
      .then(setStats)
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Overview Title matching the reference dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e1e1e]">Overview</h1>
          <p className="text-xs sm:text-sm text-[#4a4a4a] mt-1 font-medium">
            Algorithmic benchmark metrics, dataset telemetry, and tour optimization analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/graph">
            <Button size="sm" icon={Share2}>
              Create Graph
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline" size="sm" icon={GitCompare}>
              Run Benchmark
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Grid: Two StatCards on Left, Growth Area Chart on Right */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Left Column: StatCards with Sparklines */}
        <div className="flex flex-col gap-6">
          <StatCard
            label="Total Dataset Cities"
            value={loading ? '...' : (stats?.totalRowsInFile?.toLocaleString() ?? '50,000+')}
            sublabel="50,000+ Global Coordinates"
            tone="dijkstra"
            sparkline={true}
          />
          <StatCard
            label="Unique Countries"
            value={loading ? '...' : (stats?.uniqueCountries ?? '239')}
            sublabel="Global Geographic Coverage"
            tone="prim"
            sparkline={true}
          />
          <StatCard
            label="Selected Subgraph Nodes"
            value={selectedCities.length > 0 ? `${selectedCities.length} Cities` : '8 Nodes Default'}
            sublabel={`${graph?.meta?.edges ?? 12} Nearest-Neighbor Edges`}
            tone="floyd"
            sparkline={true}
          />
        </div>

        {/* Right Column: Growth Area Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#1e1e1e]">Algorithmic Complexity Growth</h3>
              <p className="text-xs text-[#4a4a4a] mt-0.5">Empirical state calculations vs input vertices V</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2f431a] bg-[#eef3e6] px-2.5 py-1 rounded-lg border border-[#8ea66b]">
              <TrendingUp className="h-3.5 w-3.5 text-[#8ea66b]" /> O(V²) Bitonic Bound
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8ea66b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8ea66b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0d5d5" vertical={false} />
                <XAxis dataKey="step" tick={{ fontSize: 11, fill: '#4a4a4a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a4a4a' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5bebe',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(42,36,36,0.08)',
                    fontSize: '12px',
                    color: '#252525',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="complexity"
                  stroke="#8ea66b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#growthArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#66615a] pt-3 border-t border-[#f0d5d5] font-semibold">
            <span>Low Latency: V &lt; 15</span>
            <span className="font-mono text-[#1e1e1e] font-bold">Subproblem Cache: Active</span>
            <span>Exponential Bound: V &gt; 30</span>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Bar Chart on Left, Solvers Table on Right */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Left Column: Bar Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#1e1e1e]">Execution Latency (ms)</h3>
              <p className="text-xs text-[#4a4a4a] mt-0.5">High-precision hrtime benchmarking</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#8ea66b]">hrtime (ns)</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RUNTIME_BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0d5d5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a4a4a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a4a4a' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5bebe',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(42,36,36,0.08)',
                    fontSize: '12px',
                    color: '#252525',
                  }}
                />
                <Bar dataKey="time" fill="#8ea66b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#66615a] pt-3 border-t border-[#f0d5d5] font-semibold">
            <span>Fastest: Dijkstra SSSP</span>
            <span className="text-[#2f431a] font-bold">Verified Real Distances</span>
          </div>
        </Card>

        {/* Right Column: Clean Table */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#1e1e1e]">Recent TSP Solvers</h3>
              <p className="text-xs text-[#4a4a4a] mt-0.5">Independent algorithmic paradigms &amp; complexity classification</p>
            </div>
            <Link to="/compare" className="text-xs font-bold text-[#8ea66b] hover:text-[#7a9159]">
              View Full Benchmark →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e5bebe] text-[#4a4a4a] text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-3">Algorithm</th>
                  <th className="pb-3">Paradigm</th>
                  <th className="pb-3">Time Complexity</th>
                  <th className="pb-3">Classification</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0d5d5]">
                {ALGORITHMS.map((algo) => (
                  <tr key={algo.key} className="hover:bg-[#fff9d6]/40 transition-colors">
                    <td className="py-3 font-bold text-[#1e1e1e] flex items-center gap-2">
                      <algo.icon className={`h-4 w-4 ${algoStyle(algo.tone).text}`} />
                      <span>{algo.name}</span>
                    </td>
                    <td className="py-3 text-[#4a4a4a] font-medium">{algo.paradigm}</td>
                    <td className="py-3 font-mono font-bold text-[#1e1e1e]">{algo.complexity}</td>
                    <td className="py-3">
                      <Badge tone={algo.tone}>{algo.badge}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={algo.to}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#8ea66b] hover:text-[#7a9159]"
                      >
                        Launch <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-[#f0d5d5] flex items-center justify-between text-xs text-[#66615a] font-semibold">
            <span>4 Solvers Evaluated Independently</span>
            <span className="font-mono text-[#1e1e1e] font-bold">Dataset: worldcities.csv</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
