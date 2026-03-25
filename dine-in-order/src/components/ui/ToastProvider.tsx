import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast } from '@/components/ui/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function createToastId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      const id = createToastId();
      setToasts((current) => [...current, { id, message, type }]);

      window.setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export type { ToastType, ToastContextValue };
