import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, variant?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
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

      {/* Toast container — posisi adaptif via --toast-offset */}
      <div
        className="fixed left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{
          bottom:
            "calc(1rem + var(--toast-offset, 0px) + var(--safe-bottom, 0px))",
        }}
      >
        {toasts.map((t) => (
          // Di ToastContext.tsx — opsional
          <div
            key={t.id}
            className={`app-shell w-full pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-neu-float text-white animate-toast-in ${
              t.variant === "success" ? "bg-accent" : "bg-danger"
            }`}
            style={{
              fontSize: "var(--toast-font-size, 0.875rem)",
            }}
          >
            {t.variant === "success" ? "\u2713 " : "\u26A0 "}
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
