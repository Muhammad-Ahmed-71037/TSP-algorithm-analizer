import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';
import * as api from '../services/api';
import { useGraph } from '../context/GraphContext';
import { useToast } from '../context/ToastContext';
import { SectionHeading, Button, LoadingState, EmptyState } from '../components/ui/Primitives';
import StatCard from '../components/ui/StatCard';

const PAGE_SIZE = 15;

function SortHeader({ label, field, sortBy, order, onSort }) {
  const active = sortBy === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wide text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] hover:text-[var(--color-ink)] dark:hover:text-[var(--color-ink-dark)]"
    >
      {label}
      {active && (order === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
    </button>
  );
}

export default function Dataset() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedCities, toggleCity, MAX_SELECTABLE_CITIES } = useGraph();

  const [stats, setStats] = useState(null);
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('population');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchDatasetStats().then(setStats).catch(() => {});
    api.fetchCountries().then((d) => setCountries(d.countries)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .fetchCities({ search, country, sortBy, order, page, pageSize: PAGE_SIZE })
        .then(setResult)
        .catch((err) => addToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }, 250); // debounce search typing
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, country, sortBy, order, page]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const selectedIds = new Set(selectedCities.map((c) => c.id));

  return (
    <div>
      <SectionHeading
        eyebrow="Dataset"
        title="World Cities Dataset"
        description="Browse, search, and select cities to build your graph. Only cleaned, validated records are shown."
        action={
          selectedCities.length > 0 && (
            <Button icon={Share2} onClick={() => navigate('/graph')}>
              Use {selectedCities.length} selected in Graph
            </Button>
          )
        }
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Rows in File" value={stats.totalRowsInFile.toLocaleString()} />
          <StatCard label="Valid Records" value={stats.validRecords.toLocaleString()} tone="prim" />
          <StatCard label="Countries" value={stats.uniqueCountries} />
          <StatCard label="Selected Cities" value={`${selectedCities.length} / ${MAX_SELECTABLE_CITIES}`} tone="dijkstra" />
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search city or country..."
            className="w-full rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-dijkstra)]"
          />
        </div>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-dijkstra)] max-w-full sm:max-w-[220px]"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || country) && (
          <Button
            variant="ghost"
            icon={X}
            onClick={() => {
              setSearch('');
              setCountry('');
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]">
              <tr>
                <th className="px-4 py-3 text-left w-10"></th>
                <th className="px-4 py-3 text-left"><SortHeader label="City" field="city" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-left"><SortHeader label="Country" field="country" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-left"><SortHeader label="Latitude" field="lat" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-left"><SortHeader label="Longitude" field="lng" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-left"><SortHeader label="Population" field="population" sortBy={sortBy} order={order} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                result?.items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => toggleCity(c)}
                    className={`cursor-pointer border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] transition-colors ${
                      selectedIds.has(c.id)
                        ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)]'
                        : 'hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleCity(c)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 accent-[#2E6BFF]" />
                    </td>
                    <td className="px-4 py-2.5 font-medium">{c.city}</td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">{c.country}</td>
                    <td className="px-4 py-2.5 font-data text-xs">{c.lat.toFixed(3)}</td>
                    <td className="px-4 py-2.5 font-data text-xs">{c.lng.toFixed(3)}</td>
                    <td className="px-4 py-2.5 font-data text-xs">{c.population ? c.population.toLocaleString() : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {loading && <LoadingState message="Loading dataset..." />}
        {!loading && result?.items.length === 0 && (
          <EmptyState title="No cities match your filters" description="Try a different search term or clear the country filter." />
        )}

        {!loading && result && result.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
            <span>
              {result.total.toLocaleString()} cities · Page {result.page} of {result.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-30 p-1">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30 p-1">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
