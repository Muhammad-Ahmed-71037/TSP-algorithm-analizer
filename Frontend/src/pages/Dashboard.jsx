import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe2,
  Flag,
  CheckCircle2,
  MapPin,
  Share2,
  Route as RouteIcon,
  Workflow,
  Waypoints,
  ArrowRight,
} from 'lucide-react';
import * as api from '../services/api';
import { useGraph } from '../context/GraphContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/ui/StatCard';
import { Badge, Button, Card, SectionHeading, LoadingState, algoStyle } from '../components/ui/Primitives';

import { BrainCircuit, GitBranch } from 'lucide-react';

const ALGORITHMS = [
  {
    key: 'dynamicProgramming',
    icon: Waypoints,
    tone: 'floyd',
    name: 'Dynamic Programming',
    subtitle: 'TSP Tour Optimization',
    badge: 'DYNAMIC PROGRAMMING',
    description: 'Constructs an optimal closed tour using subproblem memoization across monotonic two-chain recurrence.',
    complexity: 'O(V²)',
    to: '/dynamic-programming',
  },
  {
    key: 'greedy',
    icon: GitBranch,
    tone: 'prim',
    name: 'Greedy Heuristic',
    subtitle: 'Cheapest Insertion TSP',
    badge: 'GREEDY HEURISTIC',
    description: 'Sequentially inserts cities at the locally cheapest position along the evolving closed tour.',
    complexity: 'O(V³)',
    to: '/greedy',
  },
  {
    key: 'dijkstra',
    icon: RouteIcon,
    tone: 'dijkstra',
    name: 'Dijkstra SSSP Tour',
    subtitle: 'Shortest Path TSP',
    badge: 'GREEDY / SHORTEST PATH',
    description: 'Visits destinations via repeated Dijkstra shortest paths, with an independent return calculation.',
    complexity: 'O(V · (V + E) log V)',
    to: '/dijkstra',
  },
  {
    key: 'aiTSP',
    icon: BrainCircuit,
    tone: 'ai',
    name: 'AI TSP Solver',
    subtitle: 'LLM Route Optimization',
    badge: 'AI / LLM HEURISTIC',
    description: 'Independent LLM planner that selects an optimal destination sequence from genuine coordinate matrices.',
    complexity: 'API / O(V)',
    to: '/ai-tsp',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
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
    <div>
      <SectionHeading
        eyebrow="Overview"
        title="Dashboard"
        description="Select cities, generate a graph, and explore how different algorithms solve graph problems on real geographic data."
      />

      {/* Hero card */}
      <Card className="p-8 mb-8 relative overflow-hidden">
        <div className="relative max-w-2xl">
          <h2 className="font-display text-xl sm:text-2xl font-semibold mb-2">Ready to analyze your graph?</h2>
          <p className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-5">
            Select cities, generate a graph, and explore how different algorithms solve graph problems.
          </p>
          <Button icon={Share2} onClick={() => navigate('/graph')}>
            Create Graph
          </Button>
        </div>
      </Card>

      {/* Stats */}
      {loading ? (
        <LoadingState message="Loading dataset..." />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon={Globe2} label="Total Cities" value={stats?.totalRowsInFile.toLocaleString() ?? '—'} />
          <StatCard icon={Flag} label="Countries" value={stats?.uniqueCountries ?? '—'} />
          <StatCard icon={CheckCircle2} label="Valid Records" value={stats?.validRecords.toLocaleString() ?? '—'} tone="prim" />
          <StatCard icon={MapPin} label="Selected Cities" value={selectedCities.length} tone="dijkstra" />
          <StatCard icon={Share2} label="Graph Nodes" value={graph?.meta?.vertices ?? '—'} tone="floyd" />
          <StatCard icon={Share2} label="Graph Edges" value={graph?.meta?.edges ?? '—'} tone="floyd" />
        </div>
      )}

      {/* Algorithm cards */}
      <SectionHeading title="TSP Solvers & Graph Algorithms" description="Each algorithm runs independently on real datasets — no hardcoded shortcuts, genuine execution timing." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ALGORITHMS.map((a) => (
          <Card key={a.key} accent={a.tone} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <a.icon className={`h-6 w-6 ${algoStyle(a.tone).text}`} />
                <Badge tone={a.tone}>{a.badge}</Badge>
              </div>
              <h3 className="font-display font-semibold text-lg">{a.name}</h3>
              <p className="text-sm font-medium text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-2">{a.subtitle}</p>
              <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-4">{a.description}</p>
              <p className="font-data text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-4">{a.complexity}</p>
            </div>
            <Link to={a.to || '/graph'}>
              <Button variant="outline" className="w-full" icon={ArrowRight}>
                Launch {a.name}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
