import { TilawatiJilid } from "../data/tilawati";

export function useNgajiCeriaProgress(jilidData: TilawatiJilid[]) {
  // Mockup: Saat ini selalu jilid 1, halaman 2
  return {
    currentJilid: "jilid-1",
    currentPage: 2,
    totalJilid: jilidData.length,
    totalHalaman: 40,
    progressPercentage: 1, // 1%
  };
}
