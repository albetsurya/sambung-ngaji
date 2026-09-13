import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const QUERY_KEYS_TO_SYNC = [
  "members",
  "member",
  "dashboard",
  "groups",
  "meetings",
  "announcements",
  "pending-members",
  "pending-member",
  "users",
  "user-detail",
  "settings",
  "monitoring",
  "member-self-dashboard",
  "member-self-profile",
];

const SYNC_THROTTLE_MS = 60_000;

export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    function syncIfNeeded() {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return;

      lastSyncRef.current = now;

      QUERY_KEYS_TO_SYNC.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }

    document.addEventListener("visibilitychange", syncIfNeeded);
    window.addEventListener("focus", syncIfNeeded);

    return () => {
      document.removeEventListener("visibilitychange", syncIfNeeded);
      window.removeEventListener("focus", syncIfNeeded);
    };
  }, [queryClient]);

  return {
    syncNow: () => {
      lastSyncRef.current = Date.now();
      QUERY_KEYS_TO_SYNC.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  };
}
