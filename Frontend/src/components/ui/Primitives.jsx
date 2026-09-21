import { Loader2 } from 'lucide-react';

const ALGO_STYLES = {
  dijkstra: {
    text: 'text-[#6e3434]',
    bg: 'bg-[#ffdcdc]',
    border: 'border-[#d8a2a2]',
    solid: 'bg-[#d8a2a2]',
    dot: 'bg-[#d8a2a2]',
  },
  prim: {
    text: 'text-[#2f431a]',
    bg: 'bg-[#eef3e6]',
    border: 'border-[#8ea66b]',
    solid: 'bg-[#8ea66b]',
    dot: 'bg-[#8ea66b]',
  },
  floyd: {
    text: 'text-[#6e3434]',
    bg: 'bg-[#ffdcdc]',
    border: 'border-[#d8a2a2]',
    solid: 'bg-[#d8a2a2]',
    dot: 'bg-[#d8a2a2]',
  },
  ai: {
    text: 'text-[#2f431a]',
    bg: 'bg-[#fff9d6]',
    border: 'border-[#8ea66b]',
    solid: 'bg-[#8ea66b]',
    dot: 'bg-[#8ea66b]',
  },
  neutral: {
    text: 'text-[#4a4a4a]',
    bg: 'bg-[#fff3c4]',
    border: 'border-[#e5bebe]',
    solid: 'bg-[#66615a]',
    dot: 'bg-[#77716a]',
  },
};

export function algoStyle(key) {
  return ALGO_STYLES[key] || ALGO_STYLES.neutral;
}

/* Badge — high-contrast readable pill */
export function Badge({ children, tone = 'neutral', className = '' }) {
  const s = algoStyle(tone);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide border ${s.bg} ${s.text} ${s.border} ${className}`}
    >
      {children}
    </span>
  );
}

/* Button — strict contrast: Olive Green has white text, Dusty Rose has dark text */
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
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm font-bold',
  };
  const variants = {
    primary:
      'bg-[#8ea66b] text-white hover:bg-[#7a9159] active:scale-[0.98] shadow-xs',
    secondary:
      'bg-[#d8a2a2] text-[#2a2424] hover:bg-[#c78f8f] active:scale-[0.98] shadow-xs',
    outline:
      'border border-[#d8a2a2] bg-white text-[#252525] hover:bg-[#ffdcdc]/30 shadow-xs',
    ghost:
      'text-[#252525] hover:bg-[#ffdcdc]/40',
    danger:
      'bg-[#b93838] text-white hover:bg-[#a02c2c] shadow-xs',
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

/* Card — clean surface, soft borders, subtle shadow */
export function Card({ children, className = '', accent, variant = 'white' }) {
  const border = accent
    ? `border-l-4 ${algoStyle(accent).border} border-t border-r border-b border-[#e5bebe]`
    : 'border border-[#e5bebe]';
  const bg = variant === 'pink' ? 'bg-[#ffdcdc]' : 'bg-white';
  return (
    <div
      className={`rounded-xl ${bg} ${border} shadow-[0_2px_12px_rgba(42,36,36,0.04)] transition-all ${className}`}
    >
      {children}
    </div>
  );
}

/* SectionHeading — deep charcoal headings with strong contrast */
export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold text-[#8ea66b] uppercase tracking-wider mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1e1e1e]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#4a4a4a] max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* EmptyState */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-[#d8a2a2] bg-white shadow-xs">
      {Icon && (
        <Icon className="h-9 w-9 text-[#77716a] mb-3" strokeWidth={1.5} />
      )}
      <h3 className="font-bold text-[#1e1e1e] text-sm">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-[#4a4a4a] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* LoadingState */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2.5 text-[#4a4a4a]">
      <Loader2 className="h-6 w-6 animate-spin text-[#8ea66b]" />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}
