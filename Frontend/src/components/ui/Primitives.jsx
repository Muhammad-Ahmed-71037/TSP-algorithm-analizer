import { Loader2 } from 'lucide-react';

const ALGO_STYLES = {
  dijkstra: {
    text: 'text-[var(--color-dijkstra)]',
    bg: 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)]',
    border: 'border-[var(--color-dijkstra)]',
    solid: 'bg-[var(--color-dijkstra)]',
  },
  prim: {
    text: 'text-[var(--color-prim)]',
    bg: 'bg-[var(--color-prim-soft)] dark:bg-[var(--color-prim-soft-dark)]',
    border: 'border-[var(--color-prim)]',
    solid: 'bg-[var(--color-prim)]',
  },
  floyd: {
    text: 'text-[var(--color-floyd)]',
    bg: 'bg-[var(--color-floyd-soft)] dark:bg-[var(--color-floyd-soft-dark)]',
    border: 'border-[var(--color-floyd)]',
    solid: 'bg-[var(--color-floyd)]',
  },
  ai: {
    text: 'text-[var(--color-ai)]',
    bg: 'bg-[var(--color-ai-soft)] dark:bg-[var(--color-ai-soft-dark)]',
    border: 'border-[var(--color-ai)]',
    solid: 'bg-[var(--color-ai)]',
  },
  neutral: {
    text: 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]',
    bg: 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]',
    border: 'border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]',
    solid: 'bg-slate-500',
  },
};

export function algoStyle(key) {
  return ALGO_STYLES[key] || ALGO_STYLES.neutral;
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const s = algoStyle(tone);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${s.bg} ${s.text} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, icon: Icon, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:brightness-110 active:scale-[0.98]',
    secondary:
      'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] hover:border-[var(--color-primary)]/50',
    outline:
      'border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]',
    ghost: 'text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2-dark)]',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function Card({ children, className = '', accent }) {
  const border = accent ? `border-l-4 ${algoStyle(accent).border}` : 'border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]';
  return (
    <div
      className={`rounded-2xl bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] ${border} shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        {eyebrow && <p className="text-sm font-medium text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">{eyebrow}</p>}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">{title}</h1>
        {description && <p className="mt-1 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] max-w-2xl">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)]">
      {Icon && <Icon className="h-10 w-10 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mb-4" strokeWidth={1.5} />}
      <h3 className="font-display text-lg font-semibold text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
