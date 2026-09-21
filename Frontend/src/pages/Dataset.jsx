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
      className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide text-[#4A4A4A] hover:text-[#1E1E1E]"
    >
      {label}
      {active && (order === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-[#8EA66B]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#8EA66B]" />)}
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
            <Button variant="primary" icon={Share2} onClick={() => navigate('/graph')}>
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
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#77716A]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by city or country name..."
            className="w-full rounded-lg border border-[#E5BEBE] bg-white pl-8 pr-3 py-2 text-xs text-[#252525] placeholder:text-[#77716A] outline-none focus:border-[#8EA66B] focus:ring-1 focus:ring-[#8EA66B] transition-colors"
          />
        </div>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#E5BEBE] bg-white px-3 py-2 text-xs text-[#252525] outline-none focus:border-[#8EA66B] focus:ring-1 focus:ring-[#8EA66B] max-w-full sm:max-w-[200px] transition-colors"
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
            variant="outline"
            size="sm"
            icon={X}
            onClick={() => {
              setSearch('');
              setCountry('');
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E5BEBE] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-[#FFFDF5] border-b border-[#E5BEBE] text-[11px] uppercase font-bold tracking-wider text-[#4A4A4A]">
              <tr>
                <th className="px-3 py-2.5 text-left w-8"></th>
                <th className="px-3 py-2.5 text-left"><SortHeader label="City" field="city" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-3 py-2.5 text-left"><SortHeader label="Country" field="country" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-3 py-2.5 text-left"><SortHeader label="Latitude" field="lat" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-3 py-2.5 text-left"><SortHeader label="Longitude" field="lng" sortBy={sortBy} order={order} onSort={handleSort} /></th>
                <th className="px-3 py-2.5 text-left"><SortHeader label="Population" field="population" sortBy={sortBy} order={order} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E6E6]">
              {!loading &&
                result?.items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => toggleCity(c)}
                    className={`cursor-pointer transition-colors ${
                      selectedIds.has(c.id)
                        ? 'bg-[#FFDCDC]/50 border-l-4 border-l-[#8EA66B]'
                        : 'hover:bg-[#FFF9D6]/40'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleCity(c)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 accent-[#8EA66B]" />
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-xs text-[#1E1E1E]">{c.city}</td>
                    <td className="px-4 py-2.5 text-xs text-[#4A4A4A]">{c.country}</td>
                    <td className="px-4 py-2.5 font-data text-xs text-[#66615A]">{c.lat.toFixed(3)}</td>
                    <td className="px-4 py-2.5 font-data text-xs text-[#66615A]">{c.lng.toFixed(3)}</td>
                    <td className="px-4 py-2.5 font-data text-xs font-medium text-[#252525]">{c.population ? c.population.toLocaleString() : '—'}</td>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5BEBE] bg-[#FFFDF5] text-xs font-medium text-[#4A4A4A]">
            <span>
              {result.total.toLocaleString()} cities · Page {result.page} of {result.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-[#E5BEBE] bg-white p-1 text-[#252525] hover:bg-[#FFDCDC]/30 disabled:opacity-30 disabled:hover:bg-white transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-[#E5BEBE] bg-white p-1 text-[#252525] hover:bg-[#FFDCDC]/30 disabled:opacity-30 disabled:hover:bg-white transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
