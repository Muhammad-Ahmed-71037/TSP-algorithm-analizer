import { Loader2 } from 'lucide-react';

const ALGO_STYLES = {
  dijkstra: {
    text: 'text-[#2563eb]',
    bg: 'bg-[#eff6ff]',
    border: 'border-[#2563eb]',
    solid: 'bg-[#2563eb]',
    dot: 'bg-[#2563eb]',
  },
  prim: {
    text: 'text-[#059669]',
    bg: 'bg-[#ecfdf5]',
    border: 'border-[#059669]',
    solid: 'bg-[#059669]',
    dot: 'bg-[#059669]',
  },
  floyd: {
    text: 'text-[#7c3aed]',
    bg: 'bg-[#f5f3ff]',
    border: 'border-[#7c3aed]',
    solid: 'bg-[#7c3aed]',
    dot: 'bg-[#7c3aed]',
  },
  ai: {
    text: 'text-[#d97706]',
    bg: 'bg-[#fffbeb]',
    border: 'border-[#d97706]',
    solid: 'bg-[#d97706]',
    dot: 'bg-[#d97706]',
  },
  neutral: {
    text: 'text-[#64748b]',
    bg: 'bg-[#f1f5f9]',
    border: 'border-[#e2e8f0]',
    solid: 'bg-[#64748b]',
    dot: 'bg-[#94a3b8]',
  },
};

export function algoStyle(key) {
  return ALGO_STYLES[key] || ALGO_STYLES.neutral;
}

/* Badge — modern rounded pill or rounded tag */
export function Badge({ children, tone = 'neutral', className = '' }) {
  const s = algoStyle(tone);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ${s.bg} ${s.text} ${className}`}
    >
      {children}
    </span>
  );
}

/* Button — executive clean button */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon: Icon,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm font-semibold',
  };
  const variants = {
    primary:
      'bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:scale-[0.98] shadow-sm',
    secondary:
      'bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a] hover:bg-[#e2e8f0] hover:border-[#cbd5e1]',
    outline:
      'border border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#cbd5e1] hover:bg-[#f8fafc] shadow-xs',
    ghost:
      'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
    danger:
      'bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-sm',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}

/* Card — pure white elevated card with smooth rounded-2xl radii like reference image */
export function Card({ children, className = '', accent }) {
  const border = accent
    ? `border-l-4 ${algoStyle(accent).border} border-t border-r border-b border-[#e2e8f0]/80`
    : 'border border-[#e2e8f0]/70';
  return (
    <div
      className={`rounded-2xl bg-white ${border} shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all ${className}`}
    >
      {children}
    </div>
  );
}

/* SectionHeading — bold, confident heading matching the reference "Overview" design */
export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#64748b] max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* EmptyState */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-[#cbd5e1] bg-white shadow-xs">
      {Icon && (
        <Icon className="h-9 w-9 text-[#94a3b8] mb-3" strokeWidth={1.5} />
      )}
      <h3 className="font-semibold text-[#0f172a] text-sm">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-[#64748b] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* LoadingState */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2.5 text-[#64748b]">
      <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
