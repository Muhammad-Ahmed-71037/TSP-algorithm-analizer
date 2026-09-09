import { Link } from 'react-router-dom';
import { ArrowRight, Network, Route as RouteIcon, Waypoints, GitBranch, BrainCircuit, Database, Share2, CheckCircle2, BarChart2, Cpu, Terminal } from 'lucide-react';
import NetworkHero from '../components/graph/NetworkHero';
import Footer from '../components/layout/Footer';

const ALGO_PREVIEW = [
  {
    icon: Waypoints,
    name: 'Dynamic Programming',
    paradigm: 'Exact DP / Bitonic Subproblems',
    complexity: 'O(V²)',
    tone: '#f97316',
    desc: 'Solves the closed TSP tour using structured recurrence relations and subproblem memoization across monotonic coordinate chains.',
    link: '/dynamic-programming',
  },
  {
    icon: GitBranch,
    name: 'Greedy Heuristic',
    paradigm: 'Cheapest Insertion Heuristic',
    complexity: 'O(V³)',
    tone: '#22c55e',
    desc: 'Incrementally inserts unvisited cities that yield the minimal increase in total tour perimeter at each algorithmic step.',
    link: '/greedy',
  },
  {
    icon: RouteIcon,
    name: 'Dijkstra SSSP Tour',
    paradigm: 'Priority Queue / Min-Heap',
    complexity: 'O((V+E) log V)',
    tone: '#38bdf8',
    desc: 'Computes exact shortest path trajectories between consecutive tour waypoints with strictly distinct outbound and return corridors.',
    link: '/dijkstra',
  },
  {
    icon: BrainCircuit,
    name: 'AI TSP Solver',
    paradigm: 'LLM Geometric Heuristic',
    complexity: 'Empirical Heuristic',
    tone: '#f59e0b',
    desc: 'Evaluates coordinate matrices and pairwise distance tables directly to compute tour sequences without invoking classical solver engines.',
    link: '/ai-tsp',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      {/* Navigation Header */}
      <header className="border-b border-[#263449] bg-[#172033]/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#172033] border border-[#263449] flex items-center justify-center text-[#f97316]">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-semibold text-sm text-[#F8FAFC] tracking-tight block">
                TSP Algorithm Laboratory
              </span>
              <span className="text-[11px] text-[#94a3b8] block">
                DAA Project · Iqra University
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/dynamic-programming"
              className="text-xs font-medium text-[#94a3b8] hover:text-white transition-colors hidden sm:block"
            >
              Algorithms
            </Link>
            <Link
              to="/graph"
              className="text-xs font-medium text-[#94a3b8] hover:text-white transition-colors hidden sm:block"
            >
              Graph Workspace
            </Link>
            <Link
              to="/compare"
              className="text-xs font-medium text-[#94a3b8] hover:text-white transition-colors hidden sm:block"
            >
              Benchmark
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 pb-16 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#263449] bg-[#172033] text-xs font-mono text-[#cbd5e1] mb-5">
            <Terminal className="h-3.5 w-3.5 text-[#f97316]" />
            <span>COURSEWORK: CS-301 · DESIGN &amp; ANALYSIS OF ALGORITHMS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.12] tracking-tight text-[#F8FAFC]">
            Traveling Salesman Problem
            <br />
            <span className="text-[#f97316]">Algorithmic Evaluation Suite</span>
          </h1>
          <p className="mt-4 text-base text-[#cbd5e1] font-medium leading-relaxed">
            Rigorous implementation and empirical benchmarking of classical, heuristic, and AI-assisted solutions on real-world spherical geographic networks.
          </p>
          <p className="mt-3 text-sm text-[#94a3b8] max-w-xl leading-relaxed">
            Developed as part of the DAA curriculum at Iqra University by <strong>Muhammad Ahmed</strong>. Compare execution runtime in high-precision microseconds, verify total tour distance with Haversine spherical geometry, and observe tour formation step by step.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dynamic-programming"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white transition-colors shadow-md"
            >
              Launch DP Solver <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/graph"
              className="inline-flex items-center gap-2 rounded-xl border border-[#263449] bg-[#172033] px-5 py-3 text-sm font-semibold text-[#cbd5e1] hover:text-white hover:border-[#f97316]/50 transition-colors"
            >
              <Share2 className="h-4 w-4" /> Graph Workspace
            </Link>
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-[#263449] bg-[#172033] px-5 py-3 text-sm font-semibold text-[#cbd5e1] hover:text-white hover:border-[#f59e0b]/50 transition-colors"
            >
              <BarChart2 className="h-4 w-4" /> Comparative Benchmark
            </Link>
          </div>

          {/* Academic Metric Specs */}
          <div className="mt-10 grid grid-cols-3 gap-3 border-t border-[#263449] pt-6 max-w-lg text-xs">
            <div>
              <span className="text-[#94a3b8] block">Dataset</span>
              <span className="font-mono font-semibold text-[#F8FAFC] text-sm mt-0.5 block">50,000+ Cities</span>
            </div>
            <div>
              <span className="text-[#94a3b8] block">Metric Formula</span>
              <span className="font-mono font-semibold text-[#F8FAFC] text-sm mt-0.5 block">Haversine (km)</span>
            </div>
            <div>
              <span className="text-[#94a3b8] block">Clock Timing</span>
              <span className="font-mono font-semibold text-[#F8FAFC] text-sm mt-0.5 block">process.hrtime</span>
            </div>
          </div>
        </div>

        {/* Hero Visualizer Canvas */}
        <div className="relative">
          <div className="rounded-2xl border border-[#263449] bg-[#172033] p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#263449] pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#f97316]" />
                <span className="font-mono text-[#cbd5e1]">Live Graph Topology Simulation</span>
              </div>
              <span className="font-mono text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20">
                ACTIVE
              </span>
            </div>
            <NetworkHero className="w-full h-auto" />
            <div className="mt-4 pt-3 border-t border-[#263449] flex items-center justify-between text-[11px] text-[#94a3b8] font-mono">
              <span>Nodes: 8 · Edges: 12</span>
              <span>Visualizer: SVG Dynamic Traversal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Four Algorithms Section */}
      <section id="algorithms" className="max-w-[1400px] mx-auto px-6 sm:px-10 pb-16 scroll-mt-6">
        <div className="border-t border-[#263449] pt-12 mb-8">
          <div className="flex items-center gap-2 mb-2 text-[#94a3b8]">
            <Terminal className="h-4 w-4 text-[#f97316]" />
            <span className="text-xs font-mono uppercase tracking-wider">Independent Algorithmic Paradigms</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            Four Dedicated Solvers
          </h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            Each paradigm is implemented independently from first principles to contrast theoretical bounds with empirical runtime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ALGO_PREVIEW.map(({ icon: Icon, name, paradigm, complexity, tone, desc, link }) => (
            <div
              key={name}
              className="rounded-2xl border border-[#263449] bg-[#172033] p-6 flex flex-col justify-between hover:border-[#384b66] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl border border-[#263449] bg-[#0F172A]" style={{ color: tone }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0F172A] border border-[#263449] text-[#cbd5e1]">
                    {complexity}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base text-[#F8FAFC] mb-1">{name}</h3>
                <span className="inline-block text-[11px] font-mono text-[#94a3b8] mb-3">
                  {paradigm}
                </span>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-6">{desc}</p>
              </div>
              <Link
                to={link}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors pt-3 border-t border-[#263449]"
              >
                Inspect Solver <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Dataset & Architecture Specifications */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#263449] bg-[#172033] p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#0F172A] border border-[#263449] text-[#38bdf8]">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">Real-World Geographic Dataset</h3>
                <span className="text-[11px] font-mono text-[#94a3b8]">worldcities.csv · Global Coverage</span>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-6">
              Powered by over 50,000 real global settlements. Distances between node pairs are computed via the spherical Haversine formula based on actual latitude and longitude coordinates, eliminating synthetic test artifacts.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[#cbd5e1]">
              <span className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded-md border border-[#263449]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> 50,000+ Verified Cities
              </span>
              <span className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded-md border border-[#263449]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> Haversine Spherical Metric
              </span>
              <span className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded-md border border-[#263449]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> Instant Autocomplete
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#263449] bg-[#172033] p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#0F172A] border border-[#263449] text-[#f59e0b]">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">Dual-Projection Graph Workspace</h3>
                <span className="text-[11px] font-mono text-[#94a3b8]">Geographic Tiles &amp; Topological Canvas</span>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-6">
              Switch dynamically between OpenStreetMap geographic projection and topological SVG graph views. Inspect intermediate steps, relaxations, outbound vs. return route distinction, and performance timings.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[#cbd5e1]">
              <span className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded-md border border-[#263449]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> OpenStreetMap &amp; Leaflet
              </span>
              <span className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded-md border border-[#263449]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> Outbound &amp; Return Segments
              </span>
              <span className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded-md border border-[#263449]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> Sub-Millisecond Clocking
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
