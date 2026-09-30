import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'ok' | 'error';
}

type Notify = (title: string, opts?: { body?: string; tone?: Toast['tone'] }) => void;

const ToastContext = createContext<Notify>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const notify = useCallback<Notify>((title, opts = {}) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, body: opts.body, tone: opts.tone ?? 'ok' }]);
    setTimeout(() => dismiss(id), 4200);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-2xl bg-ink p-4 text-white shadow-2xl">
            {t.tone === 'ok' ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-lime" /> : <CircleAlert className="mt-0.5 size-5 shrink-0 text-clay" />}
            <div className="flex-1">
              <p className="font-medium">{t.title}</p>
              {t.body && <p className="mt-0.5 text-sm text-white/65">{t.body}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="cursor-pointer text-white/50 hover:text-white" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
