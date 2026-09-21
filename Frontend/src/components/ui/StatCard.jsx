/* Executive StatCard with warm palette, high contrast text, and mini sparklines */
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
    dijkstra: '#d8a2a2',
    prim:     '#8ea66b',
    floyd:    '#d8a2a2',
    ai:       '#8ea66b',
    neutral:  '#8ea66b',
  }[tone] || '#8ea66b';

  return (
    <div className="rounded-xl bg-white border border-[#e5bebe] p-5 shadow-[0_2px_10px_rgba(42,36,36,0.04)] flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">{label}</p>
        <p className="font-display font-bold text-2xl sm:text-3xl text-[#1e1e1e] mt-1 tracking-tight truncate">
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#2f431a]">
          <span className="text-[#8ea66b]">▲</span>
          <span>{sublabel}</span>
        </div>
      </div>

      {sparkline && (
        <div className="shrink-0 w-24 h-12 flex flex-col justify-end">
          <svg viewBox="0 0 100 40" className="w-full h-10 overflow-visible">
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
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
          <div className="flex justify-between text-[9px] text-[#66615a] font-mono font-semibold mt-0.5 px-0.5">
            <span>Min</span>
            <span>Max</span>
          </div>
        </div>
      )}
    </div>
  );
}
