import { useEffect, useState } from "react";

export function useDelayedLoading(loading: boolean, delay = 200) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const t = setTimeout(() => setShowSkeleton(true), delay);
    return () => clearTimeout(t);
  }, [loading, delay]);

  return showSkeleton;
}
