import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = { success: CheckCircle2, error: TriangleAlert, info: Info };
const STYLES = {
  success: 'border-[var(--color-prim)] text-[var(--color-prim)]',
  error: 'border-[var(--color-danger)] text-[var(--color-danger)]',
  info: 'border-[var(--color-dijkstra)] text-[var(--color-dijkstra)]',
};

export default function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[1000] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border-l-4 bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-4 py-3 shadow-lg ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] hover:text-[var(--color-ink)] dark:hover:text-[var(--color-ink-dark)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
