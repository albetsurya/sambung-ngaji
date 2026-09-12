import type { ReactNode } from "react";
import {
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "./FontAwesomeIcons";

const STATE_WRAPPER =
  "flex flex-col items-center justify-center text-center flex-1 min-h-[60vh] px-6";

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className={STATE_WRAPPER}>
      <div className="w-8 h-8 border-[3px] border-surface-card2 border-t-accent rounded-full animate-spin" />
      <span className="text-ios-subhead text-surface-muted mt-3">{label}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  open: boolean;
  label?: string;
  blockInteraction?: boolean;
  children?: ReactNode;
}

export function LoadingScreen({ label = "Memuat..." }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pt-safe pb-safe bg-surface-bg/60 backdrop-blur-md"
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="bg-surface-card border border-surface-border shadow-2xl rounded-2xl px-6 py-5 min-w-[200px] max-w-[280px] flex flex-col items-center gap-3 animate-[popIn_0.2s_ease-out]">
        <div className="w-8 h-8 border-[3px] border-surface-card2 border-t-accent rounded-full animate-spin" />
        <span className="text-ios-subhead text-surface-text font-medium text-center">
          {label}
        </span>
      </div>
    </div>
  );
}

export function LoadingOverlay({
  open = true,
  label = "Memuat...",
  blockInteraction = true,
  children,
}: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pt-safe pb-safe animate-[fadeIn_0.2s_ease-out] ${
        blockInteraction ? "pointer-events-auto" : "pointer-events-none"
      }`}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-surface-bg/60 backdrop-blur-md" />

      <div className="relative bg-surface-card border border-surface-border shadow-2xl rounded-2xl px-6 py-5 min-w-[200px] max-w-[280px] flex flex-col items-center gap-3 animate-[popIn_0.2s_ease-out]">
        <div className="w-8 h-8 border-[3px] border-surface-card2 border-t-accent rounded-full animate-spin" />

        {label && (
          <span className="text-ios-subhead text-surface-text font-medium text-center">
            {label}
          </span>
        )}

        {children}
      </div>
    </div>
  );
}

export function InlineSpinner({ size = 14 }: { size?: number }) {
  return (
    <Loader2
      size={size}
      className="animate-spin"
      strokeWidth={2.5}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={STATE_WRAPPER}>
      <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
        <ClipboardList size={26} className="text-accent" />
      </div>
      <h3 className="text-ios-nav font-semibold text-surface-text mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-ios-footnote text-surface-muted max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={STATE_WRAPPER}>
      <div className="w-16 h-16 rounded-2xl bg-danger-soft flex items-center justify-center mb-4">
        <AlertTriangle size={26} className="text-danger" />
      </div>
      <h3 className="text-ios-nav font-semibold text-surface-text mb-1.5">
        Terjadi kesalahan
      </h3>
      <p className="text-ios-footnote text-surface-muted max-w-xs leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-1.5 px-4 h-10 rounded-xl text-ios-subhead font-medium text-accent bg-accent-soft transition-colors hover:bg-accent-soft/70 active:scale-[0.97]"
        >
          <RefreshCw size={14} /> Coba lagi
        </button>
      )}
    </div>
  );
}
