import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Plus,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
} from "../common/FontAwesomeIcons";
import { BottomNav } from "./BottomNav";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  showThemeToggle?: boolean;
  showSyncButton?: boolean;
}

export function Header({
  title,
  subtitle,
  onBack,
  backLabel,
  right,
  showThemeToggle,
  showSyncButton = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      await queryClient.invalidateQueries();
      showToast("Data diperbarui");
    } finally {
      setTimeout(() => setSyncing(false), 500);
    }
  }

  return (
    <header className="sticky top-0 z-30 pt-safe border-b border-surface-border backdrop-blur-xl bg-surface-bg/80 supports-[backdrop-filter]:bg-surface-bg/70">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[52px] px-3 gap-2">
        <div className="flex items-center justify-start min-w-0">
          {onBack && (
            <button
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="flex items-center gap-0.5 pl-1 pr-2 h-9 rounded-xl text-accent transition-colors hover:bg-accent-soft/60 active:scale-[0.97] min-w-0"
            >
              <ChevronLeft
                size={24}
                strokeWidth={2.2}
                className="-ml-1 shrink-0"
              />
              {backLabel && (
                <span className="text-ios-body truncate">{backLabel}</span>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center min-w-0 max-w-[60vw]">
          <h1 className="w-full text-center text-ios-nav font-semibold text-surface-text truncate tracking-[-0.01em]">
            {title}
          </h1>
          {subtitle && (
            <p className="w-full text-center text-ios-caption text-surface-muted truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 min-w-0">
          {showSyncButton && (
            <button
              onClick={handleSync}
              disabled={syncing}
              aria-label="Sync data"
              title="Sync data"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all hover:bg-surface-card2 active:scale-95 shrink-0 disabled:opacity-50"
            >
              <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            </button>
          )}
          {showThemeToggle && (
            <button
              onClick={toggleTheme}
              aria-label="Ganti mode tampilan"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all hover:bg-surface-card2 active:scale-95 shrink-0"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          {right}
        </div>
      </div>
    </header>
  );
}

export function AppLayout({
  children,
  hideNav,
  fab,
  showAiChat = true,
}: {
  children: ReactNode;
  hideNav?: boolean;
  fab?: ReactNode;
  showAiChat?: boolean;
}) {
  const navigate = useNavigate();

  const showAiChatFab = showAiChat && !hideNav;
  const showFloating = showAiChatFab || !!fab || !hideNav;
  const containerPadding = hideNav ? "pb-[68px]" : "pb-2";

  useEffect(() => {
    let offset = 16;

    if (!hideNav) {
      offset = showAiChatFab ? 96 : 80;
    } else if (fab) {
      offset = 84;
    }

    document.documentElement.style.setProperty("--toast-offset", `${offset}px`);

    return () => {
      document.documentElement.style.removeProperty("--toast-offset");
    };
  }, [hideNav, fab, showAiChatFab]);

  return (
    <div className="app-shell min-h-screen bg-surface-bg flex flex-col">
      <div className={`flex flex-col flex-1 ${hideNav ? "" : "pb-32"}`}>
        {children}
      </div>

      {showFloating && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
          <div
            className={`app-shell px-3 ${containerPadding} flex flex-col items-end gap-2.5 pointer-events-auto`}
          >
            {showAiChatFab && (
              <FloatingActionButton
                onClick={() => navigate("/ai-chat")}
                label="Tanya AI"
                variant="secondary"
                icon={<Sparkles size={18} strokeWidth={2.2} />}
              />
            )}
            {fab}
            {!hideNav && <BottomNav />}
          </div>
        </div>
      )}
    </div>
  );
}

export function FloatingActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-end gap-2.5">{children}</div>;
}

export function FloatingActionButton({
  onClick,
  label = "Tambah",
  variant = "primary",
  size,
  icon,
  children,
  className = "",
}: {
  onClick: () => void;
  label?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const isPrimary = variant === "primary";
  const resolvedSize = size ?? (isPrimary ? "md" : "sm");

  const sizeClass = resolvedSize === "sm" ? "w-12 h-12" : "w-14 h-14";

  const variantClass = isPrimary
    ? "bg-accent text-white fab-glow-primary"
    : "bg-surface-card text-accent border border-accent/30 fab-glow-secondary";

  const content = children ? (
    children
  ) : icon ? (
    icon
  ) : isPrimary ? (
    <Plus size={resolvedSize === "sm" ? 22 : 26} strokeWidth={2.5} />
  ) : (
    <Sparkles size={resolvedSize === "sm" ? 18 : 22} strokeWidth={2.2} />
  );

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative ${sizeClass} rounded-2xl flex items-center justify-center transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${variantClass} ${className}`}
    >
      {isPrimary && (
        <span
          className="absolute inset-0 rounded-2xl fab-pulse-ring pointer-events-none"
          aria-hidden="true"
        />
      )}

      <span className="relative z-10 flex items-center justify-center">
        {content}
      </span>
    </button>
  );
}
