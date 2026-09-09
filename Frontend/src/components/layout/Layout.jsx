import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
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
  Sun,
  Moon,
  Network,
  Waypoints,
  GitBranch,
  Route,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Toaster from '../ui/Toaster';
import Footer from './Footer';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dataset', label: 'Dataset', icon: Database },
  { to: '/dynamic-programming', label: 'Dynamic Programming (TSP)', icon: Waypoints },
  { to: '/greedy', label: 'Greedy Algorithm (TSP)', icon: GitBranch },
  { to: '/dijkstra', label: 'Dijkstra Algorithm (TSP)', icon: Route },
  { to: '/ai-tsp', label: 'AI TSP Solver', icon: BrainCircuit },
  { to: '/graph', label: 'Graph Workspace', icon: Share2 },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/ai-analyst', label: 'AI Analyst (Chatbot)', icon: BrainCircuit },
  { to: '/complexity', label: 'Complexity', icon: Gauge },
  { to: '/about', label: 'About', icon: Info },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--color-primary)] text-white font-semibold shadow-sm'
                : 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)] hover:text-[var(--color-ink)] dark:hover:text-[var(--color-ink-dark)]'
            }`
          }
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]"
    >
      {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] px-4 py-6">
        <Link to="/" className="flex items-center gap-2.5 px-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-2-dark)] border border-[var(--color-border-subtle-dark)] flex items-center justify-center text-[var(--color-primary)]">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display font-semibold text-sm leading-tight text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] block">
              TSP Algorithm Suite
            </span>
            <span className="text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] block">
              DAA Project · Iqra Univ
            </span>
          </div>
        </Link>
        <NavLinks />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-4 py-6 shadow-xl border-r border-[var(--color-border-subtle-dark)]">
            <div className="flex items-center justify-between mb-8 px-2">
              <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-2-dark)] border border-[var(--color-border-subtle-dark)] flex items-center justify-center text-[var(--color-primary)]">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-display font-semibold text-sm text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] block">
                    TSP Algorithm Suite
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] block">
                    DAA Project
                  </span>
                </div>
              </Link>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1 rounded-md text-[var(--color-ink-muted-dark)] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] px-4 sm:px-6 py-3.5">
          <button className="lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu className="h-5.5 w-5.5 text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]" />
          </button>
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <Network className="h-5.5 w-5.5 text-[var(--color-primary)]" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>

      <Toaster />
    </div>
  );
}
