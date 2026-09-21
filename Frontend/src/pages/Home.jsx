import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Network,
  Route as RouteIcon,
  Waypoints,
  GitBranch,
  BrainCircuit,
  Database,
  Share2,
  GitCompare,
  Gauge,
  Check,
  Cpu,
  Terminal,
} from 'lucide-react';
import Footer from '../components/layout/Footer';
import NetworkHero from '../components/graph/NetworkHero';

const ALGORITHMS = [
  {
    name: 'Dynamic Programming',
    category: 'Exact Optimal Solver',
    paradigm: 'Held-Karp / Bitonic Subproblems',
    timeComplexity: 'O(V²)',
    spaceComplexity: 'O(V²)',
    dotColor: '#d8a2a2',
    description: 'Computes optimal closed tours through systematic memoization across monotonic coordinate subproblems. Guarantees global optimality on tested topologies.',
    path: '/dynamic-programming',
  },
  {
    name: 'Greedy Heuristic',
    category: 'Approximation Solver',
    paradigm: 'Cheapest Insertion Heuristic',
    timeComplexity: 'O(V³)',
    spaceComplexity: 'O(V)',
    dotColor: '#8ea66b',
    description: 'Sequentially inserts unvisited nodes at the position that minimizes perimeter expansion. Yields rapid high-quality approximations for large city sets.',
    path: '/greedy',
  },
  {
    name: 'Dijkstra SSSP Tour',
    category: 'Graph Network Tour',
    paradigm: 'Min-Heap Priority Queue',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    dotColor: '#d8a2a2',
    description: 'Routes consecutive destination waypoints along shortest paths through intermediate transit nodes, featuring an independent return calculation.',
    path: '/dijkstra',
  },
  {
    name: 'AI TSP Solver',
    category: 'LLM Evaluator',
    paradigm: 'Empirical Coordinate Heuristic',
    timeComplexity: 'O(V) API Call',
    spaceComplexity: 'O(V)',
    dotColor: '#8ea66b',
    description: 'Evaluates pairwise distance tables and geographic coordinates directly through an LLM prompt pipeline, verified by a strict route-validity validator.',
    path: '/ai-tsp',
  },
];

const SPECIFICATIONS = [
  { label: 'Geographic Dataset', value: 'worldcities.csv (50,000+ verified coordinates)' },
  { label: 'Distance Metric', value: 'Haversine spherical geodesic formula (km)' },
  { label: 'Timing Precision', value: 'High-resolution nanosecond clock (process.hrtime)' },
  { label: 'Graph Representation', value: 'Adjacency lists & symmetric distance matrices' },
  { label: 'Sub-Graph Strategy', value: 'k-Nearest Neighbors (k=4) geographic connectivity' },
  { label: 'Route Validation', value: 'Closed Hamiltonian cycle verification (Source → Dest → Source)' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fff9d6] text-[#252525] flex flex-col justify-between">
      <div>
        {/* Dark Charcoal Framing Header */}
        <header className="border-b border-[#383030] bg-[#262322] text-white sticky top-0 z-30">
          <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#3b3534] border border-[#524948] flex items-center justify-center text-[#8ea66b]">
                <Network className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  TSP Algorithm Analyzer
                </span>
                <span className="text-[10px] text-[#c4b7b5] block font-mono font-medium">
                  DAA Coursework Project · CS-301 · Iqra University
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#8ea66b] hover:bg-[#7a9159] text-xs font-bold text-white shadow-xs transition-colors"
              >
                Launch Workbench
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-[1280px] mx-auto px-6 py-10 space-y-10">
          {/* Top Section: Project Brief + Live Graph Simulation Card */}
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
            {/* Project Brief */}
            <div className="bg-white border border-[#e5bebe] rounded-xl p-6 sm:p-7 shadow-[0_2px_10px_rgba(42,36,36,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#66615a] mb-2 font-mono font-bold">
                  <Terminal className="h-3.5 w-3.5 text-[#8ea66b]" />
                  <span>DESIGN &amp; ANALYSIS OF ALGORITHMS · CS-301</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1e1e1e] tracking-tight">
                  Traveling Salesman Problem Analysis Workbench
                </h1>
                <p className="mt-2.5 text-xs sm:text-sm text-[#4a4a4a] leading-relaxed font-medium">
                  An algorithmic benchmarking laboratory comparing exact dynamic programming, greedy heuristics, shortest-path network tours, and AI-assisted solvers on over 50,000 real-world global cities.
                </p>

                <div className="mt-4 pt-4 border-t border-[#f0d5d5] grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#66615a] uppercase font-bold block">Dataset</span>
                    <span className="font-mono text-xs font-bold text-[#1e1e1e]">50k+ Cities</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#66615a] uppercase font-bold block">Distance Metric</span>
                    <span className="font-mono text-xs font-bold text-[#1e1e1e]">Haversine</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#66615a] uppercase font-bold block">Clock Timing</span>
                    <span className="font-mono text-xs font-bold text-[#1e1e1e]">hrtime (ns)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8ea66b] hover:bg-[#7a9159] text-xs font-bold text-white transition-colors shadow-xs"
                >
                  Overview Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/graph"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#ffdcdc]/30 border border-[#d8a2a2] text-xs font-bold text-[#252525] transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#8ea66b]" /> Graph Workspace
                </Link>
                <Link
                  to="/compare"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#ffdcdc]/30 border border-[#d8a2a2] text-xs font-bold text-[#252525] transition-colors"
                >
                  <GitCompare className="h-3.5 w-3.5 text-[#d8a2a2]" /> Benchmark
                </Link>
                <Link
                  to="/dataset"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#ffdcdc]/30 border border-[#d8a2a2] text-xs font-bold text-[#252525] transition-colors"
                >
                  <Database className="h-3.5 w-3.5 text-[#8ea66b]" /> Dataset
                </Link>
              </div>
            </div>

            {/* Live Graph Topology Simulation Card */}
            <div className="bg-white border border-[#e5bebe] rounded-xl p-5 shadow-[0_2px_10px_rgba(42,36,36,0.04)] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#f0d5d5] pb-3 mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#8ea66b]" />
                  <span className="font-bold text-[#1e1e1e]">Live Graph Topology Simulation</span>
                </div>
                <span className="font-mono text-[11px] text-[#2f431a] bg-[#eef3e6] px-2 py-0.5 rounded border border-[#8ea66b] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="my-auto py-2">
                <NetworkHero className="w-full h-auto" />
              </div>

              <div className="pt-3 border-t border-[#f0d5d5] flex items-center justify-between text-[11px] font-semibold text-[#66615a]">
                <span>Nodes: 8 · Edges: 12</span>
                <span>Visualizer: SVG Dynamic Traversal</span>
              </div>
            </div>
          </div>

          {/* Four Independent Algorithmic Approaches */}
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e1e1e]">Four Independent Algorithmic Paradigms</h2>
              <p className="text-xs text-[#4a4a4a] font-medium">Each solver operates independently with verified route execution, timing telemetry, and tour decomposition.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ALGORITHMS.map((algo) => (
                <div
                  key={algo.name}
                  className="bg-white border border-[#e5bebe] rounded-xl p-5 flex flex-col justify-between hover:border-[#d8a2a2] transition-colors shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#66615a]">
                        {algo.category}
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: algo.dotColor }}
                      />
                    </div>
                    <h3 className="font-bold text-sm text-[#1e1e1e]">{algo.name}</h3>
                    <p className="text-[11px] font-mono text-[#66615a] mb-2 font-medium">{algo.paradigm}</p>
                    <p className="text-xs text-[#4a4a4a] leading-relaxed mb-4">{algo.description}</p>

                    <div className="grid grid-cols-2 gap-2 py-2 border-t border-[#f0d5d5] text-[11px] mb-4">
                      <div>
                        <span className="text-[10px] text-[#66615a] block font-semibold">Time Complexity</span>
                        <span className="font-mono font-bold text-[#1e1e1e]">{algo.timeComplexity}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#66615a] block font-semibold">Space</span>
                        <span className="font-mono font-bold text-[#1e1e1e]">{algo.spaceComplexity}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={algo.path}
                    className="inline-flex items-center justify-between text-xs font-bold text-[#8ea66b] hover:text-[#7a9159] pt-2 border-t border-[#f0d5d5]"
                  >
                    <span>Open Solver</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="bg-white border border-[#e5bebe] rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4 text-[#8ea66b]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e1e1e]">Technical Implementation Specifications</h2>
            </div>
            <p className="text-xs text-[#4a4a4a] mb-5 font-medium">
              Summary of algorithmic guarantees, data integrity mechanisms, and execution environments employed throughout this project.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {SPECIFICATIONS.map((spec) => (
                <div key={spec.label} className="p-3 rounded-lg bg-[#fffdf5] border border-[#e5bebe]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66615a] block mb-0.5">
                    {spec.label}
                  </span>
                  <span className="font-mono text-[#1e1e1e] font-bold leading-tight block">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
