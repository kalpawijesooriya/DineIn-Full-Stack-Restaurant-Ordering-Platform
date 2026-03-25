interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const styleMap: Record<ToastProps['type'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

const iconMap: Record<ToastProps['type'], string> = {
  success: 'M9 12.75 11.25 15 15 9.75',
  error: 'M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5',
  info: 'M12 8.25h.008v.008H12V8.25Zm0 3v4.5',
};

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={`pointer-events-auto w-full max-w-sm animate-[toast-slide-in_220ms_ease-out] rounded-xl border p-3 shadow-lg ${styleMap[type]}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d={iconMap[type]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <p className="flex-1 text-sm font-medium">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Dismiss notification"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <style>{`@keyframes toast-slide-in { from { opacity: 0; transform: translateY(-8px) translateX(16px); } to { opacity: 1; transform: translateY(0) translateX(0); } }`}</style>
    </div>
  );
}

export type { ToastProps };
