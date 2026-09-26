import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") return;

    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    const main = document.querySelector(".app-shell") as HTMLElement | null;
    if (main) main.scrollTop = 0;
  }, [pathname, navType]);

  return null;
}
