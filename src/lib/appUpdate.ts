import { registerSW } from "virtual:pwa-register";

/**
 * Manager update aplikasi (PWA service worker, mode auto-update).
 *
 * - Cek versi baru tiap 60 detik + saat tab kembali terlihat.
 * - Saat SW baru mengambil alih (controllerchange) → reload sekali otomatis.
 * - Halaman Lainnya bisa memanggil checkForAppUpdate() / applyAppUpdate().
 */

export interface AppUpdateState {
  updateAvailable: boolean;
  checking: boolean;
}

type Listener = (s: AppUpdateState) => void;

const listeners = new Set<Listener>();
let updateAvailable = false;
let checking = false;
let applyUpdate: ((reload: boolean) => void) | null = null;
let registration: ServiceWorkerRegistration | undefined;
let initialized = false;
let reloadedForController = false;

const RELOAD_FLAG = "sng:updated-reload";

function emit() {
  const s = { updateAvailable, checking };
  listeners.forEach((l) => l(s));
}

export function subscribeAppUpdate(l: Listener): () => void {
  listeners.add(l);
  l({ updateAvailable, checking });
  return () => {
    listeners.delete(l);
  };
}

export function getAppUpdateState(): AppUpdateState {
  return { updateAvailable, checking };
}

function setChecking(v: boolean) {
  checking = v;
  emit();
}

function setAvailable(v: boolean) {
  updateAvailable = v;
  emit();
}

/** Reload sekali per aktivasi SW baru (cegah loop). */
function reloadOnce() {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    if (reloadedForController) return;
    reloadedForController = true;
  }
  window.location.reload();
}

export function applyAppUpdate() {
  if (applyUpdate) applyUpdate(true);
  else window.location.reload();
}

/**
 * Cek manual ke SW registration. Resolve true bila versi baru ditemukan
 * (halaman akan reload otomatis), false bila sudah versi terbaru.
 */
export async function checkForAppUpdate(): Promise<boolean> {
  // Belum ada SW (mis. browser tidak support / dev tanpa SW) → fallback
  // ke reload biasa supaya user tetap dapat HTML terbaru dari server.
  if (!("serviceWorker" in navigator)) {
    window.location.reload();
    return true;
  }
  if (!registration) {
    window.location.reload();
    return true;
  }
  if (updateAvailable) {
    applyAppUpdate();
    return true;
  }
  setChecking(true);
  try {
    await registration.update();
  } catch {
    // abaikan, mis. offline
  }
  // Beri waktu callback onNeedRefresh / controllerchange jalan.
  for (let i = 0; i < 10; i++) {
    if (updateAvailable) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  setChecking(false);
  if (updateAvailable) {
    applyAppUpdate();
    return true;
  }
  return false;
}

/** Dipanggil sekali dari <PwaUpdatePrompt/>. */
export function initAppUpdate(): () => void {
  if (initialized) return () => undefined;
  initialized = true;

  // Flag reload hanya berlaku untuk reload otomatis kami. Bersihkan saat
  // halaman dimuat normal supaya update berikutnya bisa reload lagi.
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    reloadedForController = false;
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      setAvailable(true);
      // Auto-update: langsung terapkan tanpa menunggu klik user.
      updateSW(true);
    },
    onRegisteredSW(_swUrl, r) {
      registration = r ?? undefined;
      if (!r) return;
      // Poll tiap 60 detik.
      const id = window.setInterval(() => {
        r.update().catch(() => undefined);
      }, 60_000);
      // Cek saat tab kembali terlihat.
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          r.update().catch(() => undefined);
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      applyUpdate = (reload: boolean) => updateSW(reload);
      // Simpan cleanup di window agar HMR tidak menumpuk interval.
      (window as unknown as { __sngUpdateCleanup?: () => void }).__sngUpdateCleanup =
        () => {
          window.clearInterval(id);
          document.removeEventListener("visibilitychange", onVisible);
        };
    },
  });
  applyUpdate = (reload: boolean) => updateSW(reload);

  // SW baru (skipWaiting + clientsClaim) mengambil alih → reload otomatis.
  const onController = () => reloadOnce();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", onController);
  }

  return () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onController,
      );
    }
    const cleanup = (
      window as unknown as { __sngUpdateCleanup?: () => void }
    ).__sngUpdateCleanup;
    cleanup?.();
    initialized = false;
  };
}
