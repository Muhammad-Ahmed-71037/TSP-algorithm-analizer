export default function StatCard({ icon: Icon, label, value, tone = 'neutral' }) {
  const toneText = {
    dijkstra: 'text-[var(--color-dijkstra)]',
    prim: 'text-[var(--color-prim)]',
    floyd: 'text-[var(--color-floyd)]',
    ai: 'text-[var(--color-ai)]',
    neutral: 'text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]',
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">{label}</p>
        {Icon && <Icon className={`h-5 w-5 ${toneText}`} strokeWidth={1.75} />}
      </div>
      <p className={`mt-2 font-display font-data text-2xl font-semibold ${toneText}`}>{value}</p>
    </div>
  );
}
