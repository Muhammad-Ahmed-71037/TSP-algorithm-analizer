import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { useToast } from './ToastContext';

const TSPContext = createContext(null);

/**
 * Deliberately separate from GraphContext: TSP has its own city selection,
 * its own "Starting City" concept (not a Source/Destination pair - a TSP
 * tour is a cycle that returns to where it began), and its own set of
 * algorithms. Keeping it isolated avoids confusing the two workflows.
 */
export function TSPProvider({ children }) {
  const { addToast } = useToast();

  const [selectedCities, setSelectedCities] = useState([]); // no artificial cap
  const [startingCity, setStartingCity] = useState(null); // full city object
  const [destinationCities, setDestinationCities] = useState([]);

  const [results, setResults] = useState({ dynamicProgramming: null, greedy: null, dijkstraTSP: null, aiTSP: null });
  const [running, setRunning] = useState({ dynamicProgramming: false, greedy: false, dijkstraTSP: false, aiTSP: false });

  const selectedCityIds = useMemo(() => selectedCities.map((c) => c.id), [selectedCities]);

  const toggleCity = useCallback((city) => {
    setSelectedCities((prev) => {
      const exists = prev.some((c) => c.id === city.id);
      if (exists) return prev.filter((c) => c.id !== city.id);
      return [...prev, city];
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedCities([]);
    setStartingCity(null);
    setDestinationCities([]);
    setResults({ dynamicProgramming: null, greedy: null, dijkstraTSP: null, aiTSP: null });
  }, []);

  // If the starting city gets removed from the selection, clear it too.
  useEffect(() => {
    if (startingCity && !selectedCities.some((c) => c.id === startingCity.id)) {
      setStartingCity(null);
    }
  }, [selectedCities, startingCity]);

  useEffect(() => {
    setDestinationCities((previous) => previous.filter((city) => selectedCities.some((selected) => selected.id === city.id) && city.id !== startingCity?.id));
  }, [selectedCities, startingCity]);

  const runIndependentAlgorithm = useCallback(
    async (key, apiFn, label) => {
      if (!startingCity) {
        addToast('Choose a source city first.', 'error');
        return;
      }
      if (destinationCities.length === 0) {
        addToast('Add at least one destination city.', 'error');
        return;
      }
      setRunning((r) => ({ ...r, [key]: true }));
      try {
        const data = await apiFn({ source: startingCity.id, destinationIds: destinationCities.map((city) => city.id) });
        setResults((r) => ({ ...r, [key]: data }));
        addToast(`${label} completed`, 'success');
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setRunning((r) => ({ ...r, [key]: false }));
      }
    },
    [startingCity, destinationCities, addToast]
  );

  const runDynamicProgrammingTSP = useCallback(() => runIndependentAlgorithm('dynamicProgramming', api.runDynamicProgrammingTSP, 'Dynamic Programming'), [runIndependentAlgorithm]);
  const runGreedyTSP = useCallback(() => runIndependentAlgorithm('greedy', api.runGreedyTSP, 'Greedy'), [runIndependentAlgorithm]);
  const runDijkstraTSP = useCallback(() => runIndependentAlgorithm('dijkstraTSP', api.runDijkstraTSP, 'Dijkstra'), [runIndependentAlgorithm]);
  const runAITSP = useCallback(() => runIndependentAlgorithm('aiTSP', api.aiSolveTSP, 'AI TSP Solver'), [runIndependentAlgorithm]);

  const value = {
    selectedCities,
    setSelectedCities,
    selectedCityIds,
    toggleCity,
    clearAll,
    startingCity,
    setStartingCity,
    destinationCities,
    setDestinationCities,
    results,
    running,
    runDynamicProgrammingTSP,
    runGreedyTSP,
    runDijkstraTSP,
    runAITSP,
  };

  return <TSPContext.Provider value={value}>{children}</TSPContext.Provider>;
}

export function useTSP() {
  const ctx = useContext(TSPContext);
  if (!ctx) throw new Error('useTSP must be used within a TSPProvider');
  return ctx;
}
