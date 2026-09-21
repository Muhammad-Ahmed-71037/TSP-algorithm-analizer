import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Share2,
  GitCompare,
  BrainCircuit,
  Gauge,
  Info,
  Menu,
  X,
  Network,
  Waypoints,
  GitBranch,
  Route,
  Activity,
  Terminal,
  Settings,
} from 'lucide-react';
import Toaster from '../ui/Toaster';
import Footer from './Footer';

const NAV_SECTIONS = [
  {
    title: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/dataset', label: 'Dataset Explorer', icon: Database },
      { to: '/graph', label: 'Graph Workspace', icon: Share2 },
    ],
  },
  {
    title: 'TSP Algorithms',
    items: [
      { to: '/dynamic-programming', label: 'Dynamic Programming', icon: Waypoints, dotColor: '#d8a2a2' },
      { to: '/greedy', label: 'Greedy Heuristic', icon: GitBranch, dotColor: '#8ea66b' },
      { to: '/dijkstra', label: 'Dijkstra SSSP Tour', icon: Route, dotColor: '#d8a2a2' },
      { to: '/ai-tsp', label: 'AI TSP Solver', icon: BrainCircuit, dotColor: '#8ea66b' },
    ],
  },
  {
    title: 'Analysis & Reference',
    items: [
      { to: '/compare', label: 'Comparison & Benchmarks', icon: GitCompare },
      { to: '/complexity', label: 'Complexity Matrix', icon: Gauge },
      { to: '/ai-analyst', label: 'AI Algorithm Tutor', icon: Terminal },
      { to: '/about', label: 'About & Documentation', icon: Info },
    ],
  },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-6">
      {NAV_SECTIONS.map((sec) => (
        <div key={sec.title}>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#a89c9a]">
            {sec.title}
          </p>
          <div className="flex flex-col gap-1">
            {sec.items.map(({ to, label, icon: Icon, dotColor }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3b3534] text-white shadow-xs'
                      : 'text-[#c4b7b5] hover:bg-[#322c2b] hover:text-white'
                  }`
                }
              >
                <Icon
                  className="h-4 w-4 shrink-0 transition-colors"
                  style={{ color: dotColor || undefined }}
                  strokeWidth={2}
                />
                <span className="truncate">{label}</span>
                {dotColor && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    /* h-screen + overflow-hidden on root = full viewport, nothing escapes */
    <div className="h-screen flex overflow-hidden bg-[#fff9d6] text-[#252525]">
      {/* Desktop sidebar — dark charcoal frame, fixed height with independent scroll */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-[#262322] text-[#c4b7b5] border-r border-[#383030] px-4 py-6 shrink-0 justify-between h-full overflow-y-auto scroll-thin">
        <div>
          <Link to="/" className="flex items-center gap-3 px-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-[#3b3534] border border-[#524948] flex items-center justify-center text-[#8ea66b] shrink-0">
              <Network className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-white block tracking-tight truncate">
                TSP Analyzer
              </span>
              <span className="text-[11px] text-[#a89c9a] block font-mono font-medium">
                DAA · CS-301
              </span>
            </div>
          </Link>

          <NavLinks />
        </div>

        {/* Sidebar Footer Credentials */}
        <div className="pt-4 border-t border-[#383030] px-2 text-xs text-[#a89c9a]">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#8ea66b]" />
            <span className="text-white text-xs font-semibold">Muhammad Ahmed</span>
          </div>
          <span className="text-[10px] text-[#a89c9a] block font-mono">Iqra University · 50k Dataset</span>
        </div>
      </aside>

      {/* Mobile drawer — absolute overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#262322] text-[#c4b7b5] px-4 py-6 shadow-2xl border-r border-[#383030] flex flex-col justify-between overflow-y-auto scroll-thin">
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#3b3534] border border-[#524948] flex items-center justify-center text-[#8ea66b]">
                    <Network className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">
                      TSP Analyzer
                    </span>
                    <span className="text-[10px] text-[#a89c9a] block font-mono">
                      DAA Coursework
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-[#c4b7b5] hover:text-white hover:bg-[#383030]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </div>

            <div className="pt-4 border-t border-[#383030] px-1 text-[11px] text-[#a89c9a]">
              <span className="text-white font-semibold block">Muhammad Ahmed</span>
              <span className="font-mono text-[10px]">Iqra University</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area — this column scrolls, sidebar stays fixed */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top App Header — pinned at top, never scrolls */}
        <header className="flex items-center justify-between border-b border-[#e5bebe] bg-[#fff9d6] px-6 sm:px-8 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl bg-white border border-[#e5bebe] text-[#252525] shadow-xs"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#4a4a4a]">
              <span className="font-bold text-[#1e1e1e] capitalize">
                {location.pathname.replace('/', '') || 'Overview'}
              </span>
              <span>/</span>
              <span className="font-mono text-[11px] text-[#66615a] font-medium">
                Real-World Spherical Coordinates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#e5bebe] text-[#252525] font-bold shadow-xs">
              <Activity className="h-3.5 w-3.5 text-[#8ea66b]" /> 50,000+ City Dataset Active
            </span>
          </div>
        </header>

        {/* Scrollable content area — only this div scrolls */}
        <div className="flex-1 overflow-y-auto scroll-thin">
          <main className="px-6 sm:px-8 py-8 max-w-[1440px] w-full mx-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>

      <Toaster />
    </div>
  );
}
