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
      <div className="flex rounded-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] p-1 text-xs font-semibold">
        <button
          onClick={() => setMode('singleDest')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            mode === 'singleDest'
              ? 'bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] text-[var(--color-dijkstra)] shadow-sm'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          1 Source & 1 Destination (Corridor)
        </button>
        <button
          onClick={() => setMode('multiDest')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            mode === 'multiDest'
              ? 'bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] text-[var(--color-dijkstra)] shadow-sm'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          Custom Multi-City
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm">1. Origin City (Source & Return)</h3>
          {startingCity && <span className="text-[11px] text-[var(--color-prim)] font-medium">Selected</span>}
        </div>
        <CitySearchSelector mode="single" selected={startingCity} onSelect={selectSource} placeholder="Search origin (e.g. Karachi)..." />
      </div>

      {mode === 'singleDest' ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-sm">2. Target Destination</h3>
            {destinationCities.length > 0 && <span className="text-[11px] text-[var(--color-prim)] font-medium">Selected</span>}
          </div>
          <CitySearchSelector
            mode="single"
            selected={destinationCities[destinationCities.length - 1] || null}
            onSelect={selectSingleDestination}
            placeholder="Search destination (e.g. New York)..."
          />

          {startingCity && destinationCities.length > 0 && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                icon={Sparkles}
                loading={loadingCorridor}
                onClick={discoverCorridor}
              >
                Auto-Discover Intermediate Waypoints
              </Button>
              <p className="text-[11px] mt-1.5 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-tight">
                Inspects all 50k cities to find natural geographic transit hubs between {startingCity.city} and {destinationCities[destinationCities.length - 1].city}, enabling distinct forward and return paths.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-sm">Destinations ({destinationCities.length})</h3>
            {destinationCities.length > 0 && (
              <button
                onClick={() => setDestinationCities([])}
                className="text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] transition-colors"
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
            <p className="text-xs font-semibold text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase tracking-wide">
              Selected Route Stops ({destinationCities.length})
            </p>
            {destinationCities.length > 1 && (
              <span className="text-[10px] text-[var(--color-ink-muted)]">Includes corridor hubs</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scroll-thin">
            {destinationCities.map((city, idx) => (
              <span
                key={city.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  idx === destinationCities.length - 1
                    ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)] font-semibold'
                    : 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]'
                }`}
              >
                <span>{city.city}, {city.country}</span>
                <button
                  onClick={() => toggleDestination(city)}
                  className="hover:text-[var(--color-danger)] ml-0.5"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-3">
          <p className="text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase font-semibold">Paradigm</p>
          <p className="text-sm font-semibold mt-0.5">{config.paradigm}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-3">
          <p className="text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase font-semibold">Time Complexity</p>
          <p className="text-sm font-data font-semibold mt-0.5">{config.complexity}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-3">
          <p className="text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase font-semibold">Space Complexity</p>
          <p className="text-sm font-data font-semibold mt-0.5">{config.spaceComplexity}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-3">
          <p className="text-[11px] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase font-semibold">Optimality Guarantee</p>
          <p className="text-xs font-medium mt-0.5 leading-tight">{config.optimality}</p>
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
              <div className="flex items-center justify-between p-3 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
                <div className="flex gap-1">
                  <button
                    onClick={() => setView('map')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      view === 'map'
                        ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]'
                        : 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setView('graph')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      view === 'graph'
                        ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]'
                        : 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    Graph
                  </button>
                </div>
                {graphMeta && (
                  <div className="hidden sm:flex gap-4 text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] font-data">
                    <span>{graphMeta.vertices} vertices</span>
                    <span>{graphMeta.edges} edges</span>
                    <span>avg degree {graphMeta.averageDegree}</span>
                    <span>density {graphMeta.density}</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
          <div>
            <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase font-semibold">Tour Sequence Configured</p>
            <div className="flex items-center gap-1.5 text-sm font-medium mt-1">
              <span className="font-semibold text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                {startingCity ? `${startingCity.city}, ${startingCity.country}` : 'No Source Selected'}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--color-ink-muted)]" />
              <span>{destinationCities.length} Destination{destinationCities.length === 1 ? '' : 's'}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--color-ink-muted)]" />
              <span className="font-semibold text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                {startingCity ? startingCity.city : 'Source'} (Return)
              </span>
            </div>
          </div>
          <Button icon={running[algorithm] ? Clock3 : Play} loading={running[algorithm]} onClick={run}>
            Execute {config.title}
          </Button>
        </div>

        {activeResult && (
          <div className="mt-6 space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] p-4">
                <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] font-medium">Total Tour Distance</p>
                <p className="font-data text-xl font-bold mt-1 text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                  {activeResult.result.totalDistance.toLocaleString()} km
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] p-4">
                <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] font-medium">
                  {algorithm === 'aiTSP' ? 'AI Request Time' : 'Execution Time (hrtime)'}
                </p>
                <p className="font-data text-xl font-bold mt-1 text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                  {activeResult.metrics.executionTimeMs ?? activeResult.metrics.requestTimeMs} ms
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] p-4">
                <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] font-medium">Locations in Tour</p>
                <p className="font-data text-xl font-bold mt-1 text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                  {route.length} visits ({new Set(route).size} distinct)
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] p-4">
                <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] font-medium">
                  {algorithm === 'dynamicProgramming' ? 'DP States Computed' : algorithm === 'greedy' ? 'Greedy Decisions' : 'Shortest Path Legs'}
                </p>
                <p className="font-data text-xl font-bold mt-1 text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                  {activeResult.metrics.statesComputed ?? activeResult.metrics.insertionDecisions ?? activeResult.metrics.shortestPathsCalculated ?? activeResult.metrics.destinations}
                </p>
              </div>
            </div>

            {/* Complete Tour Sequence */}
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase tracking-wide mb-2">
                Resolved Closed Tour Sequence
              </p>
              <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)]">
                <div className="flex flex-wrap items-center gap-2">
                  {route.map((cityId, idx) => {
                    const isOrigin = idx === 0 || idx === route.length - 1;
                    return (
                      <span key={idx} className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isOrigin
                              ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)] font-semibold'
                              : 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]'
                          }`}
                        >
                          {cityName(cityId)}
                          <span className="text-[10px] opacity-70 ml-1">({cityCountry(cityId)})</span>
                        </span>
                        {idx < route.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--color-ink-muted)]" />}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Leg-by-Leg Tour Breakdown */}
            {activeResult.result.legs && activeResult.result.legs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] uppercase tracking-wide mb-2">
                  Leg-by-Leg Route Decomposition & Independent Return Leg
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto scroll-thin">
                  {activeResult.result.legs.map((leg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border text-sm ${
                        leg.isReturnLeg
                          ? 'border-[var(--color-dijkstra)] bg-[var(--color-dijkstra-soft)]/40 dark:bg-[var(--color-dijkstra-soft-dark)]/40'
                          : 'border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface-2)]/50 dark:bg-[var(--color-surface-2-dark)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {leg.isReturnLeg ? (
                          <CornerDownLeft className="h-4 w-4 text-[var(--color-dijkstra)] shrink-0" />
                        ) : (
                          <Route className="h-4 w-4 text-[var(--color-ink-muted)] shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold">{cityName(leg.source)}</span>
                          <span className="mx-2 text-[var(--color-ink-muted)]">→</span>
                          <span className="font-semibold">{cityName(leg.destination)}</span>
                          {leg.isReturnLeg && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-dijkstra)] bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded-full">
                              Independent Return Leg
                            </span>
                          )}
                          {leg.intermediateNodes && leg.intermediateNodes.length > 0 && (
                            <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mt-0.5">
                              Via intermediate graph nodes: {leg.intermediateNodes.map(cityName).join(' → ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="font-data font-semibold text-right mt-1 sm:mt-0 text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
                        {leg.distance} km
                      </div>
                    </div>
                  ))}
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