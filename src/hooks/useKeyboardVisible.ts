import { useEffect, useState } from "react";

/**
 * Deteksi keyboard virtual sedang terbuka via visualViewport.
 * Dipakai untuk menyembunyikan bottom action bar yang fixed, supaya tidak
 * terangkat menutupi form saat mengetik.
 */
export function useKeyboardVisible(threshold = 150): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {
      // Fallback: browser sangat lama tanpa visualViewport.
      const onFocusIn = (e: FocusEvent) => {
        const t = e.target as HTMLElement | null;
        if (
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.isContentEditable)
        ) {
          setVisible(true);
        }
      };
      const onFocusOut = () => setVisible(false);
      document.addEventListener("focusin", onFocusIn);
      document.addEventListener("focusout", onFocusOut);
      return () => {
        document.removeEventListener("focusin", onFocusIn);
        document.removeEventListener("focusout", onFocusOut);
      };
    }

    let maxH = vv.height;
    const onResize = () => {
      if (vv.height > maxH) maxH = vv.height;
      setVisible(vv.height < maxH - threshold);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [threshold]);

  return visible;
}
