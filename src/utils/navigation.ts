import type { NavigateFunction } from "react-router-dom";

/**
 * Kembali ke halaman sebelumnya bila ada riwayat navigasi,
 * kalau tidak (deep link / bookmark) pakai fallback.
 *
 * Dipakai tombol back header supaya tidak salah konteks
 * (mis. admin yang sedang di mode jamaah kembali ke /lainnya admin
 * padahal membukanya dari /member/lainnya).
 */
export function goBack(navigate: NavigateFunction, fallback: string) {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
}
