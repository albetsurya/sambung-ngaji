import { useEffect, useState } from "react";
import { initAppUpdate, subscribeAppUpdate } from "../../lib/appUpdate";
import { RefreshCw } from "./FontAwesomeIcons";

/**
 * Auto-update PWA: saat SW baru terdeteksi, langsung diterapkan + reload.
 * Banner ini hanya indikator singkat "memperbarui…" (fallback bila reload
 * tertunda, mis. browser menahan controllerchange).
 */
export function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    const cleanupInit = initAppUpdate();
    const unsub = subscribeAppUpdate((s) => setNeedRefresh(s.updateAvailable));
    return () => {
      unsub();
      cleanupInit();
    };
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed left-0 right-0 md:left-64 z-[60] flex justify-center px-4 pointer-events-none top-[calc(0.75rem+var(--safe-top,0px))]">
      <div className="app-shell pointer-events-auto flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 shadow-neu-float">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <RefreshCw size={16} className="animate-spin" />
        </span>
        <p className="min-w-0 flex-1 text-ios-footnote font-medium text-surface-text">
          Versi baru diterapkan, memuat ulang…
        </p>
      </div>
    </div>
  );
}
