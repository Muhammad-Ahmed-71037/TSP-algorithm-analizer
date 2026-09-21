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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#77716A]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city to add..."
          className="w-full rounded-lg border border-[#E5BEBE] bg-white pl-8 pr-3 py-2 text-xs text-[#252525] placeholder:text-[#77716A] outline-none focus:border-[#8EA66B] focus:ring-1 focus:ring-[#8EA66B] transition-colors"
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
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-[#252525] hover:bg-[#FFF9D6]/50 transition-colors font-medium"
            >
              <span>
                {c.city}, <span className="text-[#4A4A4A]">{c.country}</span>
              </span>
              <span className={`text-xs font-semibold ${selectedIds.has(c.id) ? 'text-[#c94a4a]' : 'text-[#8EA66B]'}`}>
                {selectedIds.has(c.id) ? 'Remove' : 'Add'}
              </span>
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
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e1e1e] mb-2">Quick Select</h3>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SELECT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => quickSelect(n)}
              className="rounded-lg border border-[#d8a2a2] bg-white px-2.5 py-1 text-xs font-bold text-[#252525] hover:bg-[#ffdcdc]/30 transition-colors shadow-2xs"
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e1e1e] mb-2">Add Cities</h3>
        <QuickAddSearch />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e1e1e]">Selected Cities ({selectedCities.length})</h3>
          {selectedCities.length > 0 && (
            <button onClick={clearSelection} className="text-xs font-bold text-[#b93838] hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scroll-thin">
          {selectedCities.length === 0 && (
            <p className="text-xs text-[#66615a] font-medium">
              No cities yet. Use Quick Select, search above, or the{' '}
              <Link to="/dataset" className="text-[#8ea66b] font-bold underline">
                Dataset page
              </Link>
              .
            </p>
          )}
          {selectedCities.map((c) => (
            <span key={c.id} className="flex items-center gap-1 text-xs pl-2.5 pr-1.5 py-1 rounded-lg bg-[#ffdcdc] border border-[#e5bebe] text-[#252525] font-bold">
              {c.city}
              <button onClick={() => toggleCity(c)} aria-label={`Remove ${c.city}`} className="hover:text-[#b93838] text-[#77716a]">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e1e1e] mb-2">Nearest Neighbors (k)</h3>
        <div className="flex gap-1.5">
          {K_OPTIONS.map((val) => (
            <button
              key={val}
              onClick={() => setK(val)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-bold transition-colors ${
                k === val
                  ? 'border-[#8ea66b] bg-[#eef3e6] text-[#2f431a] shadow-xs'
                  : 'border-[#e5bebe] bg-white text-[#4a4a4a] hover:bg-[#fff9d6]'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#66615a] font-medium mt-2">
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
        <label className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider mb-1 block">
          {needsDestination ? 'Source' : 'Start City'}
        </label>
        <select
          value={sourceCity || ''}
          onChange={(e) => setSourceCity(e.target.value)}
          className="w-full rounded-lg border border-[#E5BEBE] bg-white px-3 py-2 text-xs text-[#252525] outline-none focus:border-[#8EA66B] focus:ring-1 focus:ring-[#8EA66B] font-medium"
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
          <label className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider mb-1 block">Destination</label>
          <select
            value={destinationCity || ''}
            onChange={(e) => setDestinationCity(e.target.value)}
            className="w-full rounded-lg border border-[#E5BEBE] bg-white px-3 py-2 text-xs text-[#252525] outline-none focus:border-[#8EA66B] focus:ring-1 focus:ring-[#8EA66B] font-medium"
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
    <Card className="mb-6 overflow-hidden border border-[#E5BEBE] bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#E5BEBE] bg-[#FFFDF5]">
        <div>
          <h2 className="font-bold text-sm text-[#1E1E1E]">Calculated TSP Routes</h2>
          <p className="text-xs text-[#4A4A4A]">Only selected route locations are rendered.</p>
        </div>
        <select
          value={algorithm}
          onChange={(event) => setAlgorithm(event.target.value)}
          className="rounded-lg border border-[#E5BEBE] bg-white px-3 py-1.5 text-xs text-[#252525] outline-none focus:border-[#8EA66B] font-medium"
        >
          {available.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="h-[360px]">
        <MapView
          cities={result.cities}
          edgeList={result.edgeList || edges}
          highlightEdges={edges.map((edge) => [edge.from, edge.to])}
          highlightTone={algorithm === 'aiTSP' ? 'ai' : algorithm === 'dynamicProgramming' ? 'floyd' : algorithm === 'greedy' ? 'prim' : 'dijkstra'}
          highlightNodeIds={result.cities.map((city) => city.id)}
        />
      </div>
      <p className="p-4 text-xs font-semibold text-[#1E1E1E] break-words border-t border-[#E5BEBE] bg-[#FFFDF5]">{route.join(' → ')}</p>
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
                <div className="flex items-center justify-between p-3 border-b border-[#e5bebe] bg-[#fffdf5]">
                  <div className="flex gap-1 bg-[#fff9d6] p-1 rounded-xl border border-[#e5bebe]">
                    <button
                      onClick={() => setView('map')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        view === 'map'
                          ? 'bg-white text-[#1e1e1e] shadow-xs border border-[#d8a2a2]'
                          : 'text-[#4a4a4a] hover:text-[#1e1e1e]'
                      }`}
                    >
                      Map
                    </button>
                    <button
                      onClick={() => setView('graph')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        view === 'graph'
                          ? 'bg-white text-[#1e1e1e] shadow-xs border border-[#d8a2a2]'
                          : 'text-[#4a4a4a] hover:text-[#1e1e1e]'
                      }`}
                    >
                      Graph
                    </button>
                  </div>
                  <div className="hidden sm:flex gap-2 text-xs font-data">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5bebe] text-[#252525] font-bold shadow-2xs">{graph.meta.vertices} vertices</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5bebe] text-[#252525] font-bold shadow-2xs">{graph.meta.edges} edges</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5bebe] text-[#252525] font-bold shadow-2xs">avg degree {graph.meta.averageDegree}</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5bebe] text-[#252525] font-bold shadow-2xs">density {graph.meta.density}</span>
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
                <p className="px-4 py-2.5 text-xs text-[#66615A] border-t border-[#E5BEBE] bg-[#FFFDF5]">
                  {graph.disclaimer}
                </p>
              </Card>
            </>
          )}
        </div>
      </div>

      {graph && (
        <>
          <div className="flex gap-2 mb-4 border-b border-[#e5bebe]">
            {ALGO_TABS.map((tab) => {
              const hex = tab.tone === 'prim' ? '#8ea66b' : '#d8a2a2';
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveAlgo(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
                    activeAlgo === tab.key ? 'text-[#1e1e1e]' : 'text-[#4a4a4a] hover:text-[#1e1e1e]'
                  }`}
                  style={{
                    borderColor: activeAlgo === tab.key ? hex : 'transparent',
                  }}
                >
                  <tab.icon className="h-4 w-4" style={{ color: activeAlgo === tab.key ? hex : '#66615a' }} />
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
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#fff9d6] border border-[#d8a2a2] p-4 text-[#252525]">
                <TriangleAlert className="h-5 w-5 text-[#b93838] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#252525] font-medium">
                    Floyd-Warshall has <span className="font-data font-bold">O(V³)</span> time complexity. With {selectedCities.length} cities selected,
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
