import { useEffect, useRef, useState } from 'react';
import { Search, X, Loader2, Check } from 'lucide-react';
import * as api from '../../services/api';

/**
 * CitySearchSelector
 * ---------------------------------------------------------------------------
 * A reusable, debounced search-and-select control over the full city
 * dataset (server-side search - never renders the whole dataset at once).
 *
 * Two modes:
 *
 *   mode="single"  - for picking one city (e.g. TSP's Starting City).
 *     props: selected (city object | null), onSelect(city | null)
 *
 *   mode="multi"   - for building a set of cities (e.g. TSP's tour cities).
 *     props: selectedCities (city[]), onToggle(city)
 *
 * Search results are capped at a small page size purely as a UI rendering
 * optimization (see api.fetchCities pageSize) - this never restricts the
 * underlying dataset or what the user can ultimately select; it only
 * limits how many result rows are drawn on screen for a given keystroke.
 */
export default function CitySearchSelector({
  mode = 'multi',
  selected = null,
  onSelect,
  selectedCities = [],
  onToggle,
  placeholder = 'Search city or country...',
  resultLimit = 20,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  const selectedIds = new Set(selectedCities.map((c) => c.id));

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api
        .fetchCities({ search: query, pageSize: resultLimit })
        .then((r) => {
          setResults(r.items);
          setActiveIndex(-1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250); // debounce
    return () => clearTimeout(t);
  }, [query, resultLimit]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pick = (city) => {
    if (mode === 'single') {
      onSelect?.(city);
      setQuery('');
      setOpen(false);
    } else {
      onToggle?.(city);
    }
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {mode === 'single' && selected ? (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-2xs">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-blue-950 dark:text-blue-200 block text-xs">
                {selected.city}, {selected.country}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                {selected.lat.toFixed(2)}°, {selected.lng.toFixed(2)}°
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelect?.(null)}
            aria-label="Clear starting city"
            className="p-1 rounded-md text-blue-500 hover:text-blue-800 hover:bg-blue-100/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-white dark:bg-[var(--color-surface-dark)] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] placeholder-[var(--color-ink-muted)]/70 shadow-2xs outline-none transition-all duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--color-primary)]" />
          )}
        </div>
      )}

      {open && query.trim() && mode !== 'single' && (
        <ResultsDropdown results={results} loading={loading} activeIndex={activeIndex} selectedIds={selectedIds} onPick={pick} mode={mode} />
      )}
      {open && query.trim() && mode === 'single' && !selected && (
        <ResultsDropdown results={results} loading={loading} activeIndex={activeIndex} selectedIds={new Set()} onPick={pick} mode={mode} />
      )}
    </div>
  );
}

function ResultsDropdown({ results, loading, activeIndex, selectedIds, onPick, mode }) {
  return (
    <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto scroll-thin rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] shadow-lg">
      {loading && results.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-3 text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching...
        </div>
      )}
      {!loading && results.length === 0 && (
        <div className="px-3 py-3 text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">No cities found.</div>
      )}
      {results.map((c, i) => {
        const isSelected = selectedIds.has(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onPick(c)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm border-b last:border-b-0 border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] ${
              i === activeIndex ? 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]' : 'hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]'
            }`}
          >
            <div>
              <p className="font-medium">{c.city}</p>
              <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
                {c.country} · {c.lat.toFixed(3)}°, {c.lng.toFixed(3)}°
              </p>
            </div>
            {mode === 'multi' && (isSelected ? <Check className="h-4 w-4 text-[var(--color-dijkstra)]" /> : <span className="text-xs text-[var(--color-dijkstra)]">Add</span>)}
          </button>
        );
      })}
    </div>
  );
}
