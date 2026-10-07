'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { CircleCheck, CircleAlert, X } from 'lucide-react';
type Toast = { id: number; message: string; kind: 'success' | 'error' };
const ToastContext = createContext<
  (message: string, kind?: Toast['kind']) => void
>(() => undefined);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback(
    (message: string, kind: Toast['kind'] = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((items) => [...items, { id, message, kind }]);
      window.setTimeout(
        () => setToasts((items) => items.filter((item) => item.id !== id)),
        4000,
      );
    },
    [],
  );
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed right-3 top-3 z-[90] flex w-[min(92vw,380px)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.kind === 'error' ? 'alert' : 'status'}
            className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold shadow-lg ${item.kind === 'error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
          >
            {item.kind === 'error' ? (
              <CircleAlert className="h-5 w-5 shrink-0" />
            ) : (
              <CircleCheck className="h-5 w-5 shrink-0" />
            )}
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="min-h-8 min-w-8 rounded-lg hover:bg-black/5"
              onClick={() =>
                setToasts((items) =>
                  items.filter((toastItem) => toastItem.id !== item.id),
                )
              }
            >
              <X className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  return useContext(ToastContext);
}
