/**
 * Umpan balik getar halus saat tap, seperti aplikasi native.
 * Hanya Android yang mendukung (iOS mengabaikan). Aman dipanggil di mana saja.
 */
export function tapFeedback(pattern: number | number[] = 8): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* abaikan: perangkat tidak mendukung */
  }
}
