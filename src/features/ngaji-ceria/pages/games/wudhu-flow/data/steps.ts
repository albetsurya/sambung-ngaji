import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";

export interface WudhuStep {
  id: string;
  name: string;
  instruction: string;
  arabic: string;
  icon: string;
  /** Ilustrasi SVG langkah (opsional; fallback ke icon teks). */
  art?: string;
}

// TODO: review oleh ustadz/ustadzah sebelum production.
export const WUDHU_STEPS: WudhuStep[] = [
  { id: "niat", name: "Niat", instruction: "Hadirkan niat wudhu dengan tenang.", arabic: "نَوَيْتُ الْوُضُوءَ", icon: NGAJI_CERIA_ASSETS.stepNiat, art: NGAJI_CERIA_ASSETS.stepNiat },
  { id: "basmalah", name: "Basmalah", instruction: "Mulai dengan membaca basmalah.", arabic: "بِسْمِ اللَّهِ", icon: NGAJI_CERIA_ASSETS.stepCuciTangan, art: NGAJI_CERIA_ASSETS.stepCuciTangan }, 
  { id: "hands", name: "Membasuh tangan", instruction: "Basuh kedua telapak tangan.", arabic: "يَدَانِ", icon: NGAJI_CERIA_ASSETS.stepCuciTangan, art: NGAJI_CERIA_ASSETS.stepCuciTangan },
  { id: "mouth", name: "Berkumur", instruction: "Berkumur dengan air secukupnya.", arabic: "مَضْمَضَةٌ", icon: NGAJI_CERIA_ASSETS.stepBerkumur, art: NGAJI_CERIA_ASSETS.stepBerkumur },
  { id: "nose", name: "Membersihkan hidung", instruction: "Masukkan air ke hidung lalu keluarkan.", arabic: "اسْتِنْشَاقٌ", icon: NGAJI_CERIA_ASSETS.stepHirupAir, art: NGAJI_CERIA_ASSETS.stepHirupAir },
  { id: "face", name: "Membasuh wajah", instruction: "Basuh wajah dari batas tumbuh rambut sampai dagu.", arabic: "وَجْهٌ", icon: NGAJI_CERIA_ASSETS.stepBasuhWajah, art: NGAJI_CERIA_ASSETS.stepBasuhWajah },
  { id: "right-arm", name: "Membasuh tangan kanan", instruction: "Basuh tangan kanan sampai siku.", arabic: "يَمِينٌ", icon: NGAJI_CERIA_ASSETS.stepBasuhTangan, art: NGAJI_CERIA_ASSETS.stepBasuhTangan },
  { id: "left-arm", name: "Membasuh tangan kiri", instruction: "Basuh tangan kiri sampai siku.", arabic: "يَسَارٌ", icon: NGAJI_CERIA_ASSETS.stepBasuhTangan, art: NGAJI_CERIA_ASSETS.stepBasuhTangan },
  { id: "head", name: "Mengusap kepala", instruction: "Usap kepala dan telinga dengan tertib.", arabic: "رَأْسٌ", icon: NGAJI_CERIA_ASSETS.stepUsapKepala, art: NGAJI_CERIA_ASSETS.stepUsapKepala },
  { id: "feet", name: "Membasuh kaki", instruction: "Basuh kedua kaki sampai mata kaki.", arabic: "قَدَمٌ", icon: NGAJI_CERIA_ASSETS.stepBasuhKaki, art: NGAJI_CERIA_ASSETS.stepBasuhKaki },
  { id: "doa-selesai", name: "Doa Selesai Wudhu", instruction: "Sempurnakan wudhu dengan doa setelahnya.", arabic: "أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ", icon: NGAJI_CERIA_ASSETS.stepDoaSelesai, art: NGAJI_CERIA_ASSETS.stepDoaSelesai },
];
