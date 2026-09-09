import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  RotateCcw,
  Map as MapIcon,
  Waypoints,
  Search,
  Sparkles,
  TriangleAlert,
  Route as RouteIcon,
  Workflow,
  X,
} from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import { useTSP } from '../context/TSPContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';
import { SectionHeading, Button, Card, Badge, EmptyState, LoadingState } from '../components/ui/Primitives';
import MapView from '../components/map/MapView';
import GraphCanvas from '../components/graph/GraphCanvas';
import StepVisualizer from '../components/visualizer/StepVisualizer';
import { DijkstraLiveState, PrimLiveState, FloydMatrixView } from '../components/visualizer/LiveStatePanels';
import ResultCard from '../components/results/ResultCard';

const K_OPTIONS = [3, 5, 8, 10];
const QUICK_SELECT_OPTIONS = [10, 20, 50, 100];

function QuickAddSearch() {
  const { toggleCity, selectedCities } = useGraph();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const selectedIds = new Set(selectedCities.map((c) => c.id));

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      return;
    }
    const t = setTimeout(() => {
      api.fetchCities({ search: query, pageSize: 6 }).then((r) => setMatches(r.items)).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city to add..."
          className="w-full rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-dijkstra)]"
        />
      </div>
      {matches.length > 0 && (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto scroll-thin">
          {matches.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                toggleCity(c);
                setQuery('');
                setMatches([]);
              }}
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]"
            >
              <span>
                {c.city}, <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">{c.country}</span>
              </span>
              <span className="text-xs text-[var(--color-dijkstra)]">{selectedIds.has(c.id) ? 'Remove' : 'Add'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigPanel() {
  const { addToast } = useToast();
  const { selectedCities, setSelectedCities, toggleCity, clearSelection, k, setK, generateGraphNow, isGeneratingGraph } = useGraph();

  const quickSelect = async (n) => {
    try {
      const result = await api.fetchCities({ sortBy: 'population', order: 'desc', pageSize: n });
      setSelectedCities(result.items);
      addToast(`Selected top ${n} cities by population`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-5">
      <div>
        <h3 className="font-display font-semibold text-sm mb-2">Quick Select</h3>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SELECT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => quickSelect(n)}
              className="rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]"
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-2">Add Cities</h3>
        <QuickAddSearch />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm">Selected Cities ({selectedCities.length})</h3>
          {selectedCities.length > 0 && (
            <button onClick={clearSelection} className="text-xs text-[var(--color-danger)]">
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scroll-thin">
          {selectedCities.length === 0 && (
            <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
              No cities yet. Use Quick Select, search above, or the{' '}
              <Link to="/dataset" className="text-[var(--color-dijkstra)]">
                Dataset page
              </Link>
              .
            </p>
          )}
          {selectedCities.map((c) => (
            <span key={c.id} className="flex items-center gap-1 text-xs pl-2 pr-1 py-1 rounded-full bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]">
              {c.city}
              <button onClick={() => toggleCity(c)} aria-label={`Remove ${c.city}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-2">Nearest Neighbors (k)</h3>
        <div className="flex gap-1.5">
          {K_OPTIONS.map((val) => (
            <button
              key={val}
              onClick={() => setK(val)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium ${
                k === val
                  ? 'border-[var(--color-dijkstra)] bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]'
                  : 'border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mt-2">
          Each city connects to its {k} geographically nearest selected cities.
        </p>
      </div>

      <Button icon={Share2} loading={isGeneratingGraph} onClick={generateGraphNow} disabled={selectedCities.length < 2}>
        Generate Graph
      </Button>
    </Card>
  );
}

function SourceDestinationPicker({ needsDestination }) {
  const { graph, sourceCity, setSourceCity, destinationCity, setDestinationCity } = useGraph();
  if (!graph) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-semibold text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-1 block">
          {needsDestination ? 'Source' : 'Start City'}
        </label>
        <select
          value={sourceCity || ''}
          onChange={(e) => setSourceCity(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-3 py-2 text-sm"
        >
          {graph.cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.city}
            </option>
          ))}
        </select>
      </div>
      {needsDestination && (
        <div>
          <label className="text-xs font-semibold text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-1 block">Destination</label>
          <select
            value={destinationCity || ''}
            onChange={(e) => setDestinationCity(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-3 py-2 text-sm"
          >
            {graph.cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.city}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function TSPRoutePreview() {
  const { results } = useTSP();
  const [algorithm, setAlgorithm] = useState('dynamicProgramming');
  const available = [
    ['dynamicProgramming', 'Dynamic Programming'],
    ['greedy', 'Greedy'],
    ['dijkstraTSP', 'Dijkstra'],
    ['aiTSP', 'AI TSP Solver'],
  ].filter(([key]) => results[key]);
  const result = results[algorithm] || results[available[0]?.[0]];
  if (!result) return null;
  const route = result.result.tour;
  const edges = route.slice(0, -1).map((from, index) => ({ from, to: route[index + 1], weight: 0 }));
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
        <div>
          <h2 className="font-display font-semibold">Calculated TSP Routes</h2>
          <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Only selected route locations are rendered.</p>
        </div>
        <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)} className="rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-3 py-2 text-sm">
          {available.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="h-[360px]"><MapView cities={result.cities} edgeList={result.edgeList || edges} highlightEdges={edges.map((edge) => [edge.from, edge.to])} highlightTone={algorithm === 'aiTSP' ? 'ai' : algorithm === 'dynamicProgramming' ? 'floyd' : algorithm === 'greedy' ? 'prim' : 'dijkstra'} highlightNodeIds={result.cities.map((city) => city.id)} /></div>
      <p className="p-4 text-sm font-medium break-words">{route.join(' → ')}</p>
    </Card>
  );
}

const ALGO_TABS = [
  { key: 'dijkstra', label: 'Dijkstra', icon: RouteIcon, tone: 'dijkstra' },
  { key: 'prim', label: 'Prim', icon: Workflow, tone: 'prim' },
  { key: 'floyd', label: 'Floyd-Warshall', icon: Waypoints, tone: 'floyd' },
];

export default function GraphWorkspace() {
  const { graph, resetGraph, results, running, runDijkstraNow, runPrimNow, runFloydWarshallNow, selectedCities, FLOYD_WARSHALL_WARNING_THRESHOLD } = useGraph();
  const [view, setView] = useState('map'); // 'map' | 'graph'
  const [activeAlgo, setActiveAlgo] = useState('dijkstra');
  const [currentStep, setCurrentStep] = useState(null);
  const [fwWarningAcked, setFwWarningAcked] = useState(false);

  useEffect(() => setCurrentStep(null), [activeAlgo, results]);

  const activeResult = results[activeAlgo === 'floyd' ? 'floydWarshall' : activeAlgo];
  const steps = activeResult?.steps || [];

  let highlightEdges = [];
  let highlightNodeIds = [];
  let currentNodeId = null;

  if (activeAlgo === 'dijkstra' && activeResult) {
    highlightNodeIds = currentStep?.visitedNodes || [];
    currentNodeId = currentStep?.currentNode;
    if (steps.length && currentStep === steps[steps.length - 1]) {
      const path = activeResult.result.path;
      highlightEdges = path.slice(0, -1).map((id, i) => [id, path[i + 1]]);
    } else if (currentStep?.edge) {
      highlightEdges = [currentStep.edge];
    }
  } else if (activeAlgo === 'prim' && activeResult) {
    highlightNodeIds = currentStep?.mstVertices || [];
    highlightEdges = (currentStep?.mstEdges || []).map((e) => [e.from, e.to]);
    currentNodeId = currentStep?.currentNode;
  } else if (activeAlgo === 'floyd' && currentStep) {
    highlightNodeIds = [currentStep.from, currentStep.to, currentStep.intermediateVertex].filter(Boolean);
  }

  const runActive = () => {
    if (activeAlgo === 'dijkstra') return runDijkstraNow();
    if (activeAlgo === 'prim') return runPrimNow();
    return runFloydWarshallNow();
  };

  const showFwWarning = activeAlgo === 'floyd' && selectedCities.length > FLOYD_WARSHALL_WARNING_THRESHOLD && !fwWarningAcked;

  return (
    <div>
      <SectionHeading
        eyebrow="Workspace"
        title="Graph Workspace"
        description="Configure your graph, then run and visualize each algorithm step by step."
        action={
          graph && (
            <Button variant="outline" icon={RotateCcw} onClick={resetGraph}>
              Reset
            </Button>
          )
        }
      />

      <TSPRoutePreview />

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 mb-6">
        <ConfigPanel />

        <div className="flex flex-col gap-4">
          {!graph ? (
            <EmptyState
              icon={MapIcon}
              title="No graph generated yet"
              description="Select cities from the left panel and generate your graph to begin."
            />
          ) : (
            <>
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setView('map')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'map' ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]' : 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]'}`}
                    >
                      Map
                    </button>
                    <button
                      onClick={() => setView('graph')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'graph' ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]' : 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]'}`}
                    >
                      Graph
                    </button>
                  </div>
                  <div className="hidden sm:flex gap-4 text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] font-data">
                    <span>{graph.meta.vertices} vertices</span>
                    <span>{graph.meta.edges} edges</span>
                    <span>avg degree {graph.meta.averageDegree}</span>
                    <span>density {graph.meta.density}</span>
                  </div>
                </div>
                <div className="h-[420px]">
                  {view === 'map' ? (
                    <MapView
                      cities={graph.cities}
                      edgeList={graph.edgeList}
                      highlightEdges={highlightEdges}
                      highlightTone={activeAlgo}
                      highlightNodeIds={highlightNodeIds}
                    />
                  ) : (
                    <GraphCanvas
                      cities={graph.cities}
                      edgeList={graph.edgeList}
                      highlightEdges={highlightEdges}
                      highlightTone={activeAlgo}
                      highlightNodeIds={highlightNodeIds}
                      currentNodeId={currentNodeId}
                    />
                  )}
                </div>
                <p className="px-4 py-2.5 text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
                  {graph.disclaimer}
                </p>
              </Card>
            </>
          )}
        </div>
      </div>

      {graph && (
        <>
          <div className="flex gap-2 mb-4 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
            {ALGO_TABS.map((tab) => {
              const hex = tab.tone === 'dijkstra' ? '#2E6BFF' : tab.tone === 'prim' ? '#16B368' : '#7C5CFC';
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveAlgo(tab.key)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
                  style={{
                    borderColor: activeAlgo === tab.key ? hex : 'transparent',
                    color: activeAlgo === tab.key ? hex : undefined,
                  }}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Card className="p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
              <SourceDestinationPicker needsDestination={activeAlgo !== 'prim'} />
              <Button icon={Sparkles} loading={running[activeAlgo === 'floyd' ? 'floydWarshall' : activeAlgo]} onClick={runActive} disabled={showFwWarning}>
                Run {ALGO_TABS.find((t) => t.key === activeAlgo)?.label}
              </Button>
            </div>

            {showFwWarning && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
                <TriangleAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Floyd-Warshall has <span className="font-data">O(V³)</span> time complexity. With {selectedCities.length} cities selected,
                    increasing the number of vertices can significantly increase computation time.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setFwWarningAcked(true)}>
                    Continue anyway
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {activeResult && (
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <div className="flex flex-col gap-6">
                {steps.length > 0 && <StepVisualizer steps={steps} cities={graph.cities} onStepChange={setCurrentStep} />}
                <ResultCard type={activeAlgo} data={activeResult} cities={graph.cities} />
              </div>
              <div>
                {activeAlgo === 'dijkstra' && <DijkstraLiveState step={currentStep} cities={graph.cities} />}
                {activeAlgo === 'prim' && <PrimLiveState step={currentStep} cities={graph.cities} />}
                {activeAlgo === 'floyd' && (
                  <FloydMatrixView matrix={activeResult.matrix} cityIds={activeResult.cityIds} cities={graph.cities} step={currentStep} />
                )}
              </div>
            </div>
          )}

          {!activeResult && (
            <EmptyState title="Run an algorithm to see results here." icon={Sparkles} />
          )}
        </>
      )}
    </div>
  );
}
