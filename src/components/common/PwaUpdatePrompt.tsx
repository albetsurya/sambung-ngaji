import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import { RefreshCw } from "./FontAwesomeIcons";
import { Button } from "./Button";

/**
 * Banner pembaruan PWA: muncul saat service worker mendeteksi versi baru.
 * Cek ulang tiap 30 menit agar pengguna tidak terjebak di versi basi.
 */
export function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegistered(r) {
        if (r) {
          const id = window.setInterval(
            () => {
              r.update().catch(() => undefined);
            },
            30 * 60 * 1000,
          );
          return () => window.clearInterval(id);
        }
        return undefined;
      },
    });
    setUpdateSW(() => update);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none top-[calc(0.75rem+var(--safe-top,0px))]">
      <div className="app-shell pointer-events-auto flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 shadow-neu-float">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <RefreshCw size={16} />
        </span>
        <p className="min-w-0 flex-1 text-ios-footnote font-medium text-surface-text">
          Versi baru tersedia. Muat ulang untuk mendapatkan tampilan terbaru.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => updateSW?.()}
          className="shrink-0"
        >
          Muat ulang
        </Button>
      </div>
    </div>
  );
}
