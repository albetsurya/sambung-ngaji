import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Reset scroll ke atas setiap navigasi PUSH / REPLACE.
 * Skip POP (back/forward) — biarkan browser restore posisi sebelumnya.
 *
 * Mount sekali di dalam <BrowserRouter>, sebelum <Routes>.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") return;

    // Scroll window utama
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    // Kalau ada scrollable container utama (mis. .app-shell scroll)
    // pastikan juga reset
    const main = document.querySelector(".app-shell") as HTMLElement | null;
    if (main) main.scrollTop = 0;
  }, [pathname, navType]);

  return null;
}
