import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateRouteQueries } from "../lib/routeQueries";

export function useBackgroundSync() {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    let timer: number | null = null;

    const run = () => {
      if (document.visibilityState !== "visible") return;
      invalidateRouteQueries(queryClient, location.pathname);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(run, 800);
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (timer) window.clearTimeout(timer);
    };
  }, [location.pathname, queryClient]);
}
