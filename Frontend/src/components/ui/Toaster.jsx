import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = { success: CheckCircle2, error: TriangleAlert, info: Info };
const STYLES = {
  success: 'border-l-4 border-l-[#8EA66B] text-[#8EA66B]',
  error: 'border-l-4 border-l-[#c94a4a] text-[#c94a4a]',
  info: 'border-l-4 border-l-[#D8A2A2] text-[#B87B7B]',
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
            className={`flex items-start gap-3 rounded-xl border border-[#E5BEBE] bg-white px-4 py-3 shadow-md ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium text-[#1E1E1E]">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="text-[#66615A] hover:text-[#1E1E1E] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
