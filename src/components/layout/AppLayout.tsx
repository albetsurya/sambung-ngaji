import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Plus,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
} from "../ui/FontAwesomeIcons";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Button } from "../ui/Button";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { useEnvironment } from "../../hooks/useEnvironment";
import { invalidateRouteQueries } from "../../lib/routeQueries";
import { tapFeedback } from "../../lib/haptics";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  showThemeToggle?: boolean;
  showSyncButton?: boolean;
  hideBackOnDesktop?: boolean;
}

export function Header({
  title,
  subtitle,
  onBack,
  backLabel,
  right,
  showThemeToggle,
  showSyncButton = true,
  hideBackOnDesktop = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const { isDevelopment } = useEnvironment();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      invalidateRouteQueries(queryClient, location.pathname);
      showToast("Data diperbarui");
    } finally {
      setTimeout(() => setSyncing(false), 500);
    }
  }

  return (
    <header className="sticky top-0 z-30 pt-safe border-b border-surface-border backdrop-blur-xl bg-surface-bg/80 supports-[backdrop-filter]:bg-surface-bg/70 surface-shift">
      <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center h-[52px] px-3 gap-2">
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
          <div className="w-full flex items-center justify-center gap-1.5">
            <h1 className="text-ios-nav font-semibold text-surface-text truncate tracking-[-0.01em]">
              {title}
            </h1>
            {isDevelopment && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shrink-0 bg-warning-soft text-warning border border-warning/20">
                DEV
              </span>
            )}
          </div>
          {subtitle && (
            <p className="w-full text-center text-ios-caption text-surface-muted truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 min-w-0">
          {showSyncButton && (
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={handleSync}
              disabled={syncing}
              aria-label="Sync data"
              title="Sync data"
              className="border border-surface-border bg-surface-card hover:bg-surface-card2 shrink-0"
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            </Button>
          )}
          {showThemeToggle && (
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={toggleTheme}
              aria-label="Ganti mode tampilan"
              className="border border-surface-border bg-surface-card hover:bg-surface-card2 shrink-0"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          )}
          {right}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between gap-4 h-16 px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack && !hideBackOnDesktop && (
            <button
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="flex items-center gap-1 pl-1.5 pr-3 h-9 rounded-xl text-surface-muted hover:text-surface-text hover:bg-surface-card2 text-ios-footnote font-medium transition-colors shrink-0 border border-surface-border/60 whitespace-nowrap"
            >
              <ChevronLeft size={18} strokeWidth={2.2} className="-ml-0.5" />
              {backLabel || "Kembali"}
            </button>
          )}

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="text-xl font-bold text-surface-text truncate tracking-tight leading-tight">
                {title}
              </h1>
              {isDevelopment && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 bg-warning-soft text-warning border border-warning/20">
                  DEV
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-ios-footnote text-surface-muted truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {showSyncButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              aria-label="Sync data"
              title="Sync data"
              className="border border-surface-border bg-surface-card hover:bg-surface-card2 gap-2"
            >
              <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
              <span className="text-ios-footnote font-medium hidden lg:inline ml-1">
                Refresh
              </span>
            </Button>
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
  const [entranceReady, setEntranceReady] = useState(false);

  const showAiChatFab = showAiChat && !hideNav;
  const bothFabs = showAiChatFab && !!fab;
  const singleFab = !bothFabs && (showAiChatFab || !!fab);
  const showFloating = showAiChatFab || !!fab || !hideNav;
  const containerPadding = hideNav ? "pb-[68px] md:pb-0" : "pb-2 md:pb-0";

  const contentPadding = hideNav
    ? ""
    : bothFabs
      ? "pb-40 md:pb-8"
      : singleFab
        ? "pb-32 md:pb-8"
        : "pb-24 md:pb-8";

  const softEase = "cubic-bezier(0.22, 1, 0.36, 1)";

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntranceReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let offset = 16;
    if (!hideNav) {
      offset = bothFabs ? 140 : showAiChatFab ? 96 : 80;
    } else if (fab) {
      offset = 84;
    }
    document.documentElement.style.setProperty("--toast-offset", `${offset}px`);
    return () => {
      document.documentElement.style.removeProperty("--toast-offset");
    };
  }, [hideNav, fab, showAiChatFab, bothFabs]);

  return (
    <div className="min-h-screen bg-surface-bg surface-shift flex flex-col md:flex-row">
      <DesktopSidebar />

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-x-clip">
        <div className="app-shell flex flex-col flex-1 w-full max-w-7xl md:px-0 py-2 md:py-6 md:border-x md:border-surface-border">
          <div className={`flex flex-col flex-1 min-w-0 ${contentPadding}`}>
            {children}
            {hideNav && fab && <div className="h-20 shrink-0" aria-hidden />}
          </div>
        </div>
      </div>

      {showFloating &&
        createPortal(
          <div
            className="fixed bottom-0 left-0 right-0 md:left-64 z-40 pb-safe pointer-events-none motion-safe:transition-all motion-safe:duration-[900ms]"
            style={{
              opacity: entranceReady ? 1 : 0,
              transform: entranceReady ? "translateY(0)" : "translateY(6px)",
              transitionTimingFunction: softEase,
            }}
          >
            <div
              className={`app-shell floating-dock px-3 md:px-8 ${containerPadding} flex flex-col items-end md:justify-start gap-2.5 md:gap-3 md:flex-row-reverse md:items-center`}
            >
              <div className="md:hidden flex flex-col items-end gap-2.5">
                {showAiChatFab && (
                  <div
                    className="pointer-events-auto motion-safe:transition-all motion-safe:duration-[800ms]"
                    style={{
                      opacity: entranceReady ? 1 : 0,
                      transform: entranceReady
                        ? "translateY(0)"
                        : "translateY(10px)",
                      filter: entranceReady ? "blur(0px)" : "blur(3px)",
                      transitionDelay: entranceReady ? "160ms" : "0ms",
                      transitionTimingFunction: softEase,
                      willChange: "opacity, transform, filter",
                    }}
                  >
                    <FloatingActionButton
                      onClick={() => navigate("/ai-chat")}
                      label="Tanya AI"
                      variant="secondary"
                      icon={<Sparkles size={18} strokeWidth={2.2} />}
                    />
                  </div>
                )}
                {fab && (
                  <div
                    className="pointer-events-auto motion-safe:transition-all motion-safe:duration-[800ms]"
                    style={{
                      opacity: entranceReady ? 1 : 0,
                      transform: entranceReady
                        ? "translateY(0)"
                        : "translateY(10px)",
                      filter: entranceReady ? "blur(0px)" : "blur(3px)",
                      transitionDelay: entranceReady ? "80ms" : "0ms",
                      transitionTimingFunction: softEase,
                      willChange: "opacity, transform, filter",
                    }}
                  >
                    {fab}
                  </div>
                )}
              </div>

              {showAiChatFab && (
                <div
                  className="pointer-events-auto hidden md:block motion-safe:transition-all motion-safe:duration-[800ms]"
                  style={{
                    opacity: entranceReady ? 1 : 0,
                    transform: entranceReady
                      ? "translateY(0)"
                      : "translateY(6px)",
                    transitionDelay: entranceReady ? "160ms" : "0ms",
                    transitionTimingFunction: softEase,
                  }}
                >
                  <button
                    onClick={() => {
                      tapFeedback();
                      navigate("/ai-chat");
                    }}
                    aria-label="Tanya AI"
                    className="hidden md:flex items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-surface-card text-accent border border-accent/30 fab fab-secondary text-ios-footnote font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95"
                  >
                    <Sparkles size={18} strokeWidth={2.2} />
                    Tanya AI
                  </button>
                </div>
              )}
              {fab && (
                <div
                  className="pointer-events-auto hidden md:block motion-safe:transition-all motion-safe:duration-[800ms]"
                  style={{
                    opacity: entranceReady ? 1 : 0,
                    transform: entranceReady
                      ? "translateY(0)"
                      : "translateY(6px)",
                    transitionDelay: entranceReady ? "80ms" : "0ms",
                    transitionTimingFunction: softEase,
                  }}
                >
                  {fab}
                </div>
              )}
              {!hideNav && (
                <div className="pointer-events-auto w-full md:hidden">
                  <BottomNav />
                </div>
              )}
            </div>
          </div>,
          document.body,
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
    ? `bg-accent text-white fab fab-primary fab-soft`
    : "bg-surface-card text-accent border border-accent/30 fab fab-secondary";

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
      onClick={() => {
        tapFeedback();
        onClick();
      }}
      aria-label={label}
      className={`relative ${sizeClass} rounded-2xl flex items-center justify-center motion-safe:transition-all motion-safe:duration-[500ms] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${variantClass} ${className}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <span className="relative z-10 flex items-center justify-center">
        {content}
      </span>
    </button>
  );
}
