/* Executive StatCard matching reference dashboard with mini sparklines and bold metrics */
export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel = 'Verified Data',
  trend = '+100%',
  tone = 'dijkstra',
  sparkline = true,
}) {
  const accentColor = {
    dijkstra: '#2563eb',
    prim:     '#059669',
    floyd:    '#7c3aed',
    ai:       '#d97706',
    neutral:  '#3b82f6',
  }[tone] || '#2563eb';

  return (
    <div className="rounded-2xl bg-white border border-[#e2e8f0]/80 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">{label}</p>
        <p className="font-display font-bold text-2xl sm:text-3xl text-[#0f172a] mt-1 tracking-tight truncate">
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#16a34a]">
          <span>▲</span>
          <span>{sublabel}</span>
        </div>
      </div>

      {sparkline && (
        <div className="shrink-0 w-24 h-12 flex flex-col justify-end">
          <svg viewBox="0 0 100 40" className="w-full h-10 overflow-visible">
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 35 Q 25 15, 50 25 T 100 8 L 100 40 L 0 40 Z"
              fill={`url(#grad-${label.replace(/\s+/g, '')})`}
            />
            <path
              d="M 0 35 Q 25 15, 50 25 T 100 8"
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="8" r="3.5" fill={accentColor} stroke="#ffffff" strokeWidth="2" />
          </svg>
          <div className="flex justify-between text-[9px] text-[#94a3b8] font-mono mt-0.5 px-0.5">
            <span>Min</span>
            <span>Max</span>
          </div>
        </div>
      )}
    </div>
  );
}
