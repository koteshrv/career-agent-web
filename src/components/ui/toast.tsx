import * as React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type Toast = { id: number; message: string; tone: 'info' | 'success' | 'error' };
type ToastFn = (message: string, tone?: Toast['tone']) => void;

const ToastContext = React.createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return React.useContext(ToastContext);
}

/** Announces short confirmations through a polite live region. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const toast = React.useCallback<ToastFn>((message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-20 sm:bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-2 rounded-md border bg-card px-3.5 py-2.5 text-sm shadow-lg',
              t.tone === 'success' && 'border-success/30',
              t.tone === 'error' && 'border-destructive/40'
            )}
          >
            {t.tone === 'success' && <CheckCircle2 className="size-4 text-success" />}
            {t.tone === 'error' && <AlertCircle className="size-4 text-destructive" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
