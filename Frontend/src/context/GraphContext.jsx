import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as api from '../services/api';
import { useToast } from './ToastContext';

const GraphContext = createContext(null);

// Matches the server's genuine memory/CPU protection ceiling in
// graphService.js - not a pedagogical restriction on how many cities a
// user may explore. Floyd-Warshall's own O(V^3) cost is separately and
// honestly flagged via FLOYD_WARSHALL_WARNING_THRESHOLD below, as a
// feasibility warning the user can choose to continue past - never a
// silent reduction of their selection.
const FLOYD_WARSHALL_WARNING_THRESHOLD = 60;

export function GraphProvider({ children }) {
  const { addToast } = useToast();

  // ---- Selection -----------------------------------------------------------
  const [selectedCities, setSelectedCities] = useState([]); // full city objects
  const [k, setK] = useState(5);

  // ---- Graph -----------------------------------------------------------------
  const [graph, setGraph] = useState(null); // { cities, edgeList, meta, disclaimer }
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);

  // ---- Source / destination selection for algorithms --------------------
  const [sourceCity, setSourceCity] = useState(null); // city id
  const [destinationCity, setDestinationCity] = useState(null); // city id

  // ---- Results ---------------------------------------------------------------
  const [results, setResults] = useState({ dijkstra: null, prim: null, floydWarshall: null });
  const [running, setRunning] = useState({ dijkstra: false, prim: false, floydWarshall: false });

  const selectedCityIds = useMemo(() => selectedCities.map((c) => c.id), [selectedCities]);

  const toggleCity = useCallback(
    (city) => {
      setSelectedCities((prev) => {
        const exists = prev.some((c) => c.id === city.id);
        if (exists) return prev.filter((c) => c.id !== city.id);
        return [...prev, city];
      });
    },
    [addToast]
  );

  const clearSelection = useCallback(() => {
    setSelectedCities([]);
    setGraph(null);
    setSourceCity(null);
    setDestinationCity(null);
    setResults({ dijkstra: null, prim: null, floydWarshall: null });
  }, []);

  const resetGraph = useCallback(() => {
    setGraph(null);
    setSourceCity(null);
    setDestinationCity(null);
    setResults({ dijkstra: null, prim: null, floydWarshall: null });
    addToast('Graph reset', 'info');
  }, [addToast]);

  const generateGraphNow = useCallback(async () => {
    if (selectedCities.length < 2) {
      addToast('Select at least 2 cities before generating a graph.', 'error');
      return;
    }
    setIsGeneratingGraph(true);
    try {
      const data = await api.generateGraph({ cityIds: selectedCityIds, k });
      setGraph(data);
      setResults({ dijkstra: null, prim: null, floydWarshall: null });
      setSourceCity(data.cities[0]?.id ?? null);
      setDestinationCity(data.cities[1]?.id ?? null);
      addToast('Graph generated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsGeneratingGraph(false);
    }
  }, [selectedCities, selectedCityIds, k, addToast]);

  const runDijkstraNow = useCallback(async () => {
    if (!graph || !sourceCity || !destinationCity) return;
    setRunning((r) => ({ ...r, dijkstra: true }));
    try {
      const data = await api.runDijkstra({ cityIds: selectedCityIds, k, source: sourceCity, destination: destinationCity });
      setResults((r) => ({ ...r, dijkstra: data }));
      addToast('Dijkstra completed', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRunning((r) => ({ ...r, dijkstra: false }));
    }
  }, [graph, sourceCity, destinationCity, selectedCityIds, k, addToast]);

  const runPrimNow = useCallback(async () => {
    if (!graph || !sourceCity) return;
    setRunning((r) => ({ ...r, prim: true }));
    try {
      const data = await api.runPrim({ cityIds: selectedCityIds, k, source: sourceCity });
      setResults((r) => ({ ...r, prim: data }));
      addToast('Prim (MST) completed', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRunning((r) => ({ ...r, prim: false }));
    }
  }, [graph, sourceCity, selectedCityIds, k, addToast]);

  const runFloydWarshallNow = useCallback(async () => {
    if (!graph) return;
    setRunning((r) => ({ ...r, floydWarshall: true }));
    try {
      const data = await api.runFloydWarshall({
        cityIds: selectedCityIds,
        k,
        source: sourceCity,
        destination: destinationCity,
      });
      setResults((r) => ({ ...r, floydWarshall: data }));
      addToast('Floyd-Warshall completed', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRunning((r) => ({ ...r, floydWarshall: false }));
    }
  }, [graph, sourceCity, destinationCity, selectedCityIds, k, addToast]);

  const value = {
    FLOYD_WARSHALL_WARNING_THRESHOLD,
    selectedCities,
    setSelectedCities,
    selectedCityIds,
    toggleCity,
    clearSelection,
    k,
    setK,
    graph,
    isGeneratingGraph,
    generateGraphNow,
    resetGraph,
    sourceCity,
    setSourceCity,
    destinationCity,
    setDestinationCity,
    results,
    running,
    runDijkstraNow,
    runPrimNow,
    runFloydWarshallNow,
  };

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraph() {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error('useGraph must be used within a GraphProvider');
  return ctx;
}
