import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: "bg-accent",
  warning: "bg-warning",
  error: "bg-danger",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "\u2713 ",
  warning: "\u26A0 ",
  error: "\u26A0 ",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        2200,
      );
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="fixed left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{
          bottom:
            "calc(1rem + var(--toast-offset, 0px) + var(--safe-bottom, 0px))",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`app-shell toast toast-${t.variant} w-full pointer-events-auto rounded-2xl px-4 py-3 text-ios-subhead font-medium shadow-neu-float text-white animate-toast-in ${VARIANT_CLASS[t.variant]}`}
            style={{
              fontSize: "var(--toast-font-size, 0.875rem)",
            }}
          >
            {VARIANT_ICON[t.variant]}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}
