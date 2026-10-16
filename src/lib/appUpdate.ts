import { registerSW } from "virtual:pwa-register";


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

export async function checkForAppUpdate(): Promise<boolean> {
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
  }
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

export function initAppUpdate(): () => void {
  if (initialized) return () => undefined;
  initialized = true;

  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    reloadedForController = false;
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      setAvailable(true);
      updateSW(true);
    },
    onRegisteredSW(_swUrl, r) {
      registration = r ?? undefined;
      if (!r) return;
      const id = window.setInterval(() => {
        r.update().catch(() => undefined);
      }, 60_000);
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          r.update().catch(() => undefined);
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      applyUpdate = (reload: boolean) => updateSW(reload);
      (window as unknown as { __sngUpdateCleanup?: () => void }).__sngUpdateCleanup =
        () => {
          window.clearInterval(id);
          document.removeEventListener("visibilitychange", onVisible);
        };
    },
  });
  applyUpdate = (reload: boolean) => updateSW(reload);

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
