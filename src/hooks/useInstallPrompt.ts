import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Hook untuk menangkap event `beforeinstallprompt` PWA.
 * Browser mewajibkan aksi user untuk install, jadi kita simpan event-nya
 * lalu tampilkan tombol install yang memanggil `promptInstall()`.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Sudah berjalan sebagai aplikasi terinstal (standalone)?
    const media = window.matchMedia("(display-mode: standalone)");
    const iosStandalone =
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (media.matches || iosStandalone) {
      setInstalled(true);
      setDeferred(null);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferred(null);
    return choice.outcome === "accepted";
  }, [deferred]);

  return {
    /** true jika browser siap menampilkan prompt install & belum terinstal */
    canInstall: !!deferred && !installed,
    installed,
    promptInstall,
  };
}