import { useEffect, useRef, useState } from "react";

const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`,
    );
    const script = existing ?? document.createElement("script");

    const handleLoad = () => {
      if (window.google) resolve();
      else reject(new Error("Google Identity Services tidak tersedia"));
    };
    const handleError = () => reject(new Error("Gagal memuat Google OAuth"));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existing) {
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    googleScriptPromise = null;
    throw error;
  });

  return googleScriptPromise;
}

interface GoogleLoginButtonProps {
  clientId: string;
  theme: "light" | "dark";
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
}

export function GoogleLoginButton({
  clientId,
  theme,
  disabled = false,
  onCredential,
  onError,
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) return;

        buttonRef.current.replaceChildren();
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: ({ credential }) => {
            if (!disabled) onCredential(credential);
          },
        });
        // Google button width: Google GSI button min width 200, max 400.
        // Di dalam container card max-w-sm (384px) dengan p-6 (padding 24px kiri-kanan),
        // ruang bersih tersedia adalah ~336px pada layar lebar, namun pada layar ponsel 360-390px
        // (viewport 360 - margin luar 48 - padding 48 = ~264-280px).
        // Kita hitung dinamis berdasarkan container width aktual agar tidak pernah terpotong.
        const containerWidth = buttonRef.current.parentElement?.clientWidth || buttonRef.current.clientWidth || 300;
        const targetWidth = Math.max(220, Math.min(320, containerWidth));

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: theme === "dark" ? "filled_black" : "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: targetWidth,
          logo_alignment: "left",
        });
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoading(false);
        onError?.(
          error instanceof Error
            ? error.message
            : "Google OAuth tidak dapat dimuat",
        );
      });

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
      buttonRef.current?.replaceChildren();
    };
  }, [clientId, disabled, onCredential, onError, theme]);

  return (
    <div
      className={`flex min-h-[44px] w-full max-w-full justify-center items-center py-1 overflow-x-hidden transition-opacity ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
      aria-busy={loading}
      ref={buttonRef}
    />
  );
}
