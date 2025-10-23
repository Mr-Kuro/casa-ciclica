import React, { createContext, useCallback, useContext, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number; // ms
}

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const full: Toast = { duration: 3500, type: "info", ...toast, id };
      setToasts((t) => [...t, full]);
      if (full.duration && full.duration > 0) {
        setTimeout(() => dismiss(id), full.duration);
      }
    },
    [dismiss]
  );

  const clear = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss, clear }}>
      {children}
      <div
        className="toast-viewport"
        role="region"
        aria-live="polite"
        aria-label="Notificações"
      >
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-message">{t.message}</span>
            <button
              className="toast-close"
              aria-label="Fechar"
              onClick={() => dismiss(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
