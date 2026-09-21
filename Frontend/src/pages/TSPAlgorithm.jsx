import { useMemo, useState } from 'react';
import { Clock3, Map as MapIcon, Play, Sparkles, Navigation, ArrowRight, CornerDownLeft, Route } from 'lucide-react';
import { useTSP } from '../context/TSPContext';
import { SectionHeading, Button, Card, EmptyState, Badge } from '../components/ui/Primitives';
import CitySearchSelector from '../components/tsp/CitySearchSelector';
import MapView from '../components/map/MapView';
import GraphCanvas from '../components/graph/GraphCanvas';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

const CONFIG = {
  dynamicProgramming: {
    title: 'Dynamic Programming (TSP)',
    paradigm: 'Dynamic Programming',
    description: 'Constructs an optimal closed tour using subproblem memoization and structured two-chain recurrence.',
    tone: 'floyd',
    complexity: 'O(V²)',
    spaceComplexity: 'O(V²)',
    optimality: 'Optimal for two-chain permutation space',
    run: 'runDynamicProgrammingTSP',
  },
  greedy: {
    title: 'Greedy Algorithm (TSP)',
    paradigm: 'Greedy Heuristic',
    description: 'Constructs a tour by making locally cheapest insertion choices across all unvisited locations.',
    tone: 'prim',
    complexity: 'O(V³)',
    spaceComplexity: 'O(V)',
    optimality: 'Approximation heuristic (no optimality guarantee)',
    run: 'runGreedyTSP',
  },
  dijkstraTSP: {
    title: 'Dijkstra Algorithm (TSP)',
    paradigm: 'Greedy / Shortest Path',
    description: 'Sequences destinations using Dijkstra shortest paths, with independent outbound and return calculations.',
    tone: 'dijkstra',
    complexity: 'O(V · (V + E) log V)',
    spaceComplexity: 'O(V + E)',
    optimality: 'Shortest path optimal per leg; heuristic tour sequence',
    run: 'runDijkstraTSP',
  },
  aiTSP: {
    title: 'AI TSP Solver',
    paradigm: 'AI / LLM Heuristic',
    description: 'Independent LLM route planner that orders locations using only real coordinates and distance matrices.',
    tone: 'ai',
    complexity: 'API Request / Heuristic',
    spaceComplexity: 'O(V)',
    optimality: 'Heuristic recommendation verified by strict validator',
    run: 'runAITSP',
  },
};

function SelectionPanel() {
  const { selectedCities, startingCity, setStartingCity, destinationCities, setDestinationCities, toggleCity } = useTSP();
  const { addToast } = useToast();
  const [mode, setMode] = useState('singleDest'); // 'singleDest' | 'multiDest'
  const [loadingCorridor, setLoadingCorridor] = useState(false);
  const selectedIds = new Set(selectedCities.map((city) => city.id));

  const selectSource = (city) => {
    setStartingCity(city);
    setDestinationCities((cities) => cities.filter((destination) => destination.id !== city?.id));
    if (city && !selectedIds.has(city.id)) toggleCity(city);
  };

  const selectSingleDestination = (city) => {
    if (!city) {
      setDestinationCities([]);
      return;
    }
    if (city.id === startingCity?.id) {
      addToast('Destination must be different from the source.', 'error');
      return;
    }
    setDestinationCities([city]);
    if (!selectedIds.has(city.id)) toggleCity(city);
  };

  const toggleDestination = (city) => {
    if (city.id === startingCity?.id) return;
    toggleCity(city);
    setDestinationCities((cities) => {
      const exists = cities.some((destination) => destination.id === city.id);
      return exists ? cities.filter((destination) => destination.id !== city.id) : [...cities, city];
    });
  };

  const discoverCorridor = async () => {
    if (!startingCity || destinationCities.length === 0) {
      addToast('Select both 1 Source and 1 Destination first.', 'error');
      return;
    }
    setLoadingCorridor(true);
    try {
      const targetDest = destinationCities[destinationCities.length - 1];
      const data = await api.fetchCorridorCities({ source: startingCity.id, destination: targetDest.id, count: 10 });
      if (data.corridorCities && data.corridorCities.length > 0) {
        // Keep targetDest at the end, prepend discovered intermediate hubs
        const newCities = [...data.corridorCities, targetDest];
        setDestinationCities(newCities);
        newCities.forEach((c) => {
          if (!selectedIds.has(c.id)) toggleCity(c);
        });
        addToast(`Found ${data.corridorCities.length} intermediate hub cities along the route!`, 'success');
      } else {
        addToast('No intermediate hubs found within corridor tolerance.', 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingCorridor(false);
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-5">
      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold border border-slate-200/80">
        <button
          onClick={() => setMode('singleDest')}
          className={`flex-1 py-2 px-2 rounded-lg transition-all text-xs ${
            mode === 'singleDest'
              ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          1 Source & 1 Destination (Corridor)
        </button>
        <button
          onClick={() => setMode('multiDest')}
          className={`flex-1 py-2 px-2 rounded-lg transition-all text-xs ${
            mode === 'multiDest'
              ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Custom Multi-City
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></span>
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-700">1. Origin City (Source & Return)</h3>
          </div>
          {startingCity && <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">Selected</span>}
        </div>
        <CitySearchSelector mode="single" selected={startingCity} onSelect={selectSource} placeholder="Search origin (e.g. Karachi)..." />
      </div>

      {mode === 'singleDest' ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-600 ring-4 ring-violet-100"></span>
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-700">2. Target Destination</h3>
            </div>
            {destinationCities.length > 0 && <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">Selected</span>}
          </div>
          <CitySearchSelector
            mode="single"
            selected={destinationCities[destinationCities.length - 1] || null}
            onSelect={selectSingleDestination}
            placeholder="Search destination (e.g. New York)..."
          />

          {startingCity && destinationCities.length > 0 && (
            <div className="mt-3">
              <button
                disabled={loadingCorridor}
                onClick={discoverCorridor}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100/80 hover:to-indigo-100/80 text-blue-700 py-2.5 px-3 text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                {loadingCorridor ? 'Analyzing 50,000 cities...' : 'Auto-Discover Intermediate Waypoints'}
              </button>
              <p className="text-[11px] mt-1.5 text-slate-500 leading-tight">
                Inspects all 50k cities to find natural geographic transit hubs between {startingCity.city} and {destinationCities[destinationCities.length - 1].city}, enabling distinct forward and return paths.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-600 ring-4 ring-violet-100"></span>
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-700">Destinations ({destinationCities.length})</h3>
            </div>
            {destinationCities.length > 0 && (
              <button
                onClick={() => setDestinationCities([])}
                className="text-[11px] text-slate-400 hover:text-red-600 transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <CitySearchSelector
            mode="multi"
            selectedCities={destinationCities}
            onToggle={toggleDestination}
            placeholder="Search and add multiple destinations..."
          />
        </div>
      )}

      {destinationCities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selected Route Stops ({destinationCities.length})
            </p>
            {destinationCities.length > 1 && (
              <span className="text-[10px] text-slate-400 font-medium">Includes corridor hubs</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scroll-thin">
            {destinationCities.map((city, idx) => (
              <span
                key={city.id}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                  idx === destinationCities.length - 1
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{city.city}, {city.country}</span>
                <button
                  onClick={() => toggleDestination(city)}
                  className="hover:text-red-600 text-slate-400 ml-0.5"
                  aria-label={`Remove ${city.city}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function TSPAlgorithm({ algorithm }) {
  const config = CONFIG[algorithm];
  const { startingCity, destinationCities, selectedCities, results, running, ...tsp } = useTSP();
  const { addToast } = useToast();
  const [view, setView] = useState('map');
  const activeResult = results[algorithm];
  const run = tsp[config.run];

  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const route = activeResult?.result?.tour || [];
  const edgeList = useMemo(
    () => route.slice(0, -1).map((from, index) => ({ from, to: route[index + 1], weight: 0 })),
    [route]
  );

  const displayCities = activeResult?.cities || (selectedCities.length > 0 ? selectedCities : null);
  const displayEdges = activeResult?.edgeList || edgeList;

  const graphMeta = useMemo(() => {
    if (!displayCities || displayCities.length === 0) return null;
    const v = displayCities.length;
    const edges = displayEdges.length;
    const avgDeg = v > 0 ? Number(((2 * edges) / v).toFixed(2)) : 0;
    const maxEdges = (v * (v - 1)) / 2;
    const density = maxEdges > 0 ? Number((edges / maxEdges).toFixed(4)) : 0;
    return {
      vertices: activeResult?.graphMeta?.vertices ?? v,
      edges: activeResult?.graphMeta?.edges ?? edges,
      averageDegree: activeResult?.graphMeta?.averageDegree ?? avgDeg,
      density: activeResult?.graphMeta?.density ?? density,
    };
  }, [displayCities, displayEdges, activeResult]);

  const cityMap = useMemo(() => {
    const map = new Map();
    if (displayCities) {
      displayCities.forEach((c) => map.set(c.id, c));
    }
    return map;
  }, [displayCities]);

  const cityName = (id) => cityMap.get(id)?.city || id;
  const cityCountry = (id) => cityMap.get(id)?.country || '';

  const handleExplain = async () => {
    if (!activeResult) return;
    setExplaining(true);
    try {
      const res = await api.aiExplain({
        algorithm: activeResult.algorithm,
        category: activeResult.category,
        totalDistanceKm: activeResult.result.totalDistance,
        startingCity: cityName(activeResult.result.startingCity),
        tour: activeResult.result.tour.map(cityName),
        destinationsCount: activeResult.result.destinations?.length || destinationCities.length,
        executionTimeMs: activeResult.metrics.executionTimeMs ?? activeResult.metrics.requestTimeMs,
        legs: activeResult.result.legs?.map((leg) => ({
          from: cityName(leg.source),
          to: cityName(leg.destination),
          distanceKm: leg.distance,
          intermediateNodes: leg.intermediateNodes?.map(cityName) || [],
          isReturnLeg: leg.isReturnLeg,
        })),
      });
      setExplanation(res.explanation);
      addToast('AI analysis generated', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="DAA Traveling Salesman Problem" title={config.title} description={config.description} />

      {/* Algorithm Specs Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-md border border-[#e2e8f0] bg-white p-3 shadow-xs">
          <p className="text-[10px] text-[#637083] uppercase font-bold tracking-wider">Paradigm</p>
          <p className="text-xs font-semibold text-[#1a2332] mt-0.5">{config.paradigm}</p>
        </div>
        <div className="rounded-md border border-[#e2e8f0] bg-white p-3 shadow-xs">
          <p className="text-[10px] text-[#637083] uppercase font-bold tracking-wider">Time Complexity</p>
          <p className="text-xs font-mono font-semibold text-[#1a2332] mt-0.5">{config.complexity}</p>
        </div>
        <div className="rounded-md border border-[#e2e8f0] bg-white p-3 shadow-xs">
          <p className="text-[10px] text-[#637083] uppercase font-bold tracking-wider">Space Complexity</p>
          <p className="text-xs font-mono font-semibold text-[#1a2332] mt-0.5">{config.spaceComplexity}</p>
        </div>
        <div className="rounded-md border border-[#e2e8f0] bg-white p-3 shadow-xs">
          <p className="text-[10px] text-[#637083] uppercase font-bold tracking-wider">Optimality Guarantee</p>
          <p className="text-xs font-medium text-[#1a2332] mt-0.5 leading-snug">{config.optimality}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 mb-6">
        <SelectionPanel />
        <div className="flex flex-col gap-4">
          {!displayCities ? (
            <EmptyState
              icon={MapIcon}
              title="No TSP tour executed yet"
              description="Choose an origin city and one or more destinations, then trigger the solver."
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-[var(--color-border-subtle)] bg-slate-50/50">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    onClick={() => setView('map')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      view === 'map'
                        ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    Map View
                  </button>
                  <button
                    onClick={() => setView('graph')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      view === 'graph'
                        ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    Topological Graph
                  </button>
                </div>
                {graphMeta && (
                  <div className="hidden sm:flex items-center gap-2 text-xs font-data">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-slate-700 font-medium shadow-2xs">{graphMeta.vertices} vertices</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-slate-700 font-medium shadow-2xs">{graphMeta.edges} edges</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-slate-700 font-medium shadow-2xs">avg deg {graphMeta.averageDegree}</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-slate-700 font-medium shadow-2xs">density {graphMeta.density}</span>
                  </div>
                )}
              </div>
              <div className="h-[440px]">
                {view === 'map' ? (
                  <MapView
                    cities={displayCities}
                    edgeList={displayEdges}
                    highlightEdges={edgeList.map((edge) => [edge.from, edge.to])}
                    highlightTone={config.tone}
                    highlightNodeIds={displayCities.map((city) => city.id)}
                  />
                ) : (
                  <GraphCanvas
                    cities={displayCities}
                    edgeList={displayEdges}
                    highlightEdges={edgeList.map((edge) => [edge.from, edge.to])}
                    highlightTone={config.tone}
                    highlightNodeIds={displayCities.map((city) => city.id)}
                  />
                )}
              </div>
              <p className="px-4 py-2.5 text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
                Edges represent approximate geographic distance calculated from city coordinates using the Haversine formula (straight-line distance, not road/travel distance). The graph is generated using a nearest-neighbor strategy.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Execution and Results Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border-subtle)]">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tour Sequence Configured</p>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium mt-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                {startingCity ? `${startingCity.city}, ${startingCity.country}` : 'No Source Selected'}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs">
                {destinationCities.length} Destination{destinationCities.length === 1 ? '' : 's'}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                {startingCity ? `${startingCity.city} (Return)` : 'Source (Return)'}
              </span>
            </div>
          </div>
          <Button size="lg" icon={running[algorithm] ? Clock3 : Play} loading={running[algorithm]} onClick={run} className="shadow-md hover:shadow-lg font-semibold">
            Execute {config.title}
          </Button>
        </div>

        {activeResult && (
          <div className="mt-6 space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md bg-white border border-[#e2e8f0] p-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#637083] font-bold uppercase tracking-wider">Total Tour Distance</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                </div>
                <p className="font-mono text-xl sm:text-2xl font-bold mt-1.5 text-[#0f172a]">
                  {activeResult.result.totalDistance.toLocaleString()} <span className="text-xs font-normal text-[#64748b]">km</span>
                </p>
              </div>

              <div className="rounded-md bg-white border border-[#e2e8f0] p-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#637083] font-bold uppercase tracking-wider">
                    {algorithm === 'aiTSP' ? 'AI API Latency' : 'Execution Time'}
                  </p>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                </div>
                <p className="font-mono text-xl sm:text-2xl font-bold mt-1.5 text-[#0f172a]">
                  {activeResult.metrics.executionTimeMs ?? activeResult.metrics.requestTimeMs} <span className="text-xs font-normal text-[#64748b]">ms</span>
                </p>
              </div>

              <div className="rounded-md bg-white border border-[#e2e8f0] p-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#637083] font-bold uppercase tracking-wider">Tour Nodes</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                </div>
                <p className="font-mono text-xl sm:text-2xl font-bold mt-1.5 text-[#0f172a]">
                  {route.length} <span className="text-xs font-normal text-[#64748b]">stops</span>
                </p>
              </div>

              <div className="rounded-md bg-white border border-[#e2e8f0] p-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#637083] font-bold uppercase tracking-wider">
                    {algorithm === 'dynamicProgramming' ? 'DP States' : algorithm === 'greedy' ? 'Greedy Decisions' : 'Calculated Legs'}
                  </p>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" />
                </div>
                <p className="font-mono text-xl sm:text-2xl font-bold mt-1.5 text-[#0f172a]">
                  {activeResult.metrics.statesComputed ?? activeResult.metrics.insertionDecisions ?? activeResult.metrics.shortestPathsCalculated ?? activeResult.metrics.destinations}
                </p>
              </div>
            </div>

            {/* Complete Tour Sequence */}
            <div>
              <p className="text-xs font-bold text-[#637083] uppercase tracking-wider mb-2">
                Resolved Closed Tour Sequence
              </p>
              <div className="p-3 rounded-md border border-[#e2e8f0] bg-white">
                <div className="flex flex-wrap items-center gap-1.5">
                  {route.map((cityId, idx) => {
                    const isOrigin = idx === 0 || idx === route.length - 1;
                    return (
                      <span key={idx} className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono font-medium border ${
                            isOrigin
                              ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8] font-bold'
                              : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1a2332]'
                          }`}
                        >
                          {cityName(cityId)}
                          <span className="text-[10px] text-[#64748b] ml-1">({cityCountry(cityId)})</span>
                        </span>
                        {idx < route.length - 1 && <ArrowRight className="h-3 w-3 text-[#94a3b8]" />}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Leg-by-Leg Tour Breakdown */}
            {activeResult.result.legs && activeResult.result.legs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#637083] uppercase tracking-wider mb-2">
                  Leg-by-Leg Route Decomposition &amp; Independent Return Leg
                </p>
                <div className="overflow-x-auto rounded-md border border-[#e2e8f0] bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-[#637083] border-b border-[#e2e8f0] text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-3 py-2 w-10">Leg</th>
                        <th className="px-3 py-2">Departure</th>
                        <th className="px-3 py-2">Arrival</th>
                        <th className="px-3 py-2">Segment Classification</th>
                        <th className="px-3 py-2 text-right font-mono">Distance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {activeResult.result.legs.map((leg, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-[#f8fafc] transition-colors ${
                            leg.isReturnLeg ? 'bg-[#eff6ff]/30' : ''
                          }`}
                        >
                          <td className="px-3 py-2 font-mono text-[#637083]">#{idx + 1}</td>
                          <td className="px-3 py-2 font-semibold text-[#0f172a]">{cityName(leg.source)}</td>
                          <td className="px-3 py-2 font-semibold text-[#0f172a]">{cityName(leg.destination)}</td>
                          <td className="px-3 py-2">
                            {leg.isReturnLeg ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                                <CornerDownLeft className="h-3 w-3" /> Independent Return Leg
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#475569]">
                                <Route className="h-3 w-3 text-[#64748b]" /> Forward Traversal
                              </span>
                            )}
                            {leg.intermediateNodes && leg.intermediateNodes.length > 0 && (
                              <p className="text-[11px] text-[#64748b] mt-0.5">
                                Via: {leg.intermediateNodes.map(cityName).join(' → ')}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-[#0f172a]">
                            {leg.distance.toLocaleString()} <span className="text-[10px] text-[#64748b] font-normal">km</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Reasoning (for AI TSP Solver) */}
            {algorithm === 'aiTSP' && activeResult.reasoning && (
              <div className="p-4 rounded-xl bg-[var(--color-ai-soft)] dark:bg-[var(--color-ai-soft-dark)] text-sm">
                <p className="font-semibold text-xs text-[var(--color-ai)] mb-1 uppercase tracking-wider">AI Route Planner Reasoning</p>
                <p className="leading-relaxed">{activeResult.reasoning}</p>
              </div>
            )}

            {/* AI Explain Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <Button variant="secondary" size="sm" icon={Sparkles} loading={explaining} onClick={handleExplain}>
                Explain Tour with AI
              </Button>
              <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
                AI analyzes real measured timings and Haversine distances deterministically generated.
              </p>
            </div>

            {/* AI Explanation Display */}
            {explanation && (
              <div className="rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] p-5 text-sm leading-relaxed whitespace-pre-wrap">
                <div className="flex items-center gap-2 mb-2 font-semibold text-[var(--color-ai)]">
                  <Sparkles className="h-4 w-4" /> AI Pedagogical Analysis
                </div>
                {explanation}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}