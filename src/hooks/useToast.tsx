import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const toneStyles = toast.tone === 'success'
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
            : toast.tone === 'error'
              ? 'border-red-500/40 bg-red-500/15 text-red-100'
              : 'border-blue-500/40 bg-blue-500/15 text-blue-100';

          return (
            <div
              key={toast.id}
              className={`rounded-xl border px-4 py-3 shadow-2xl backdrop-blur ${toneStyles}`}
            >
              <div className="font-semibold">{toast.title}</div>
              {toast.description ? (
                <div className="mt-1 text-sm opacity-90">{toast.description}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
