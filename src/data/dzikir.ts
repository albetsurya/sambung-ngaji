export interface DzikirPreset {
  id: string;
  nama: string;
  arab: string;
  latin: string;
  arti: string;
  target: number;
  keutamaan?: string;
}

export const DZIKIR_PRESETS: DzikirPreset[] = [
  {
    id: "subhanallah",
    nama: "Subhanallah",
    arab: "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    latin: "Subhaanallah",
    arti: "Maha Suci Allah",
    target: 33,
    keutamaan:
      "Barangsiapa membacanya 33x setelah sholat, akan diampuni dosa-dosanya.",
  },
  {
    id: "alhamdulillah",
    nama: "Alhamdulillah",
    arab: "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650",
    latin: "Alhamdulillah",
    arti: "Segala puji bagi Allah",
    target: 33,
    keutamaan:
      "Kalimat yang memenuhi timbangan amal, sebagaimana disebutkan dalam hadits.",
  },
  {
    id: "allahuakbar",
    nama: "Allahu Akbar",
    arab: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    latin: "Allahu Akbar",
    arti: "Allah Maha Besar",
    target: 33,
    keutamaan:
      "Barangsiapa membacanya 33x setelah sholat, melengkapi 99 tasbih bersama Subhanallah & Alhamdulillah.",
  },
  {
    id: "tahlil",
    nama: "Tahlil",
    arab:
      "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f",
    latin:
      "Laa ilaaha illallahu wahdahu laa syariika lah",
    arti: "Tidak ada Tuhan selain Allah, Yang Maha Esa, tidak ada sekutu bagi-Nya",
    target: 100,
    keutamaan:
      "Dzikir paling utama. Barangsiapa membacanya 100x sehari, mendapat pahala seperti membebaskan 10 hamba sahaya.",
  },
  {
    id: "istighfar",
    nama: "Istighfar",
    arab: "\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647\u064e",
    latin: "Astaghfirullah",
    arti: "Aku memohon ampun kepada Allah",
    target: 100,
    keutamaan:
      "Barangsiapa membiasakan istighfar, Allah akan berikan jalan keluar dari setiap kesulitan.",
  },
  {
    id: "subhanallah-wabihamdihi",
    nama: "Subhanallah wa Bihamdihi",
    arab:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650",
    latin: "Subhaanallahi wa bihamdihi",
    arti: "Maha Suci Allah dan segala puji bagi-Nya",
    target: 100,
    keutamaan:
      "Barangsiapa membacanya 100x sehari, dihapus dosa-dosanya walau sebanyak buih di laut.",
  },
  {
    id: "lailahaillallah",
    nama: "Laa Ilaaha Illallah",
    arab:
      "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f",
    latin: "Laa ilaaha illallah",
    arti: "Tidak ada Tuhan selain Allah",
    target: 100,
    keutamaan:
      "Dzikir paling afdhal — kalimat tauhid yang menjadi kunci surga.",
  },
  {
    id: "hasbunallah",
    nama: "Hasbunallah",
    arab:
      "\u062d\u064e\u0633\u0652\u0628\u064f\u0646\u064e\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u0646\u0650\u0639\u0652\u0645\u064e \u0627\u0644\u0652\u0648\u064e\u0643\u0650\u064a\u0644\u064f",
    latin: "Hasbunallahu wa ni'mal wakiil",
    arti: "Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung",
    target: 33,
    keutamaan:
      "Doa Nabi Ibrahim & Nabi Muhammad SAW saat menghadapi kesulitan.",
  },
];

export function getDzikirPreset(id: string): DzikirPreset | undefined {
  return DZIKIR_PRESETS.find((d) => d.id === id);
}
