// Assets import for Ngaji Ceria using 200+ new SVG asset suite
import * as NEW from "../../../assets/ngaji-ceria-new/ngaji-ceria-tilawati/index";

export const NGAJI_CERIA_ASSETS = {
  // HUD Elements
  apiStreak: NEW.apiStreak,
  apiStreakMati: NEW.apiStreakMati,
  bintang: NEW.bintangPenuh,
  bintangKosong: NEW.bintangKosong,
  bukuQuran: NEW.bukuJuzAmma,
  hatiNyawa: NEW.hatiNyawa,
  hatiKosong: NEW.hatiKosong,
  koinHijaiyah: NEW.koinHijaiyah,
  mahkotaVip: NEW.mahkotaVip,
  
  // Icons & Buttons
  iconBeranda: NEW.iconBeranda,
  iconJelajah: NEW.iconJelajah,
  iconKuis: NEW.iconKuis,
  iconGames: NEW.iconGames,
  iconPrestasi: NEW.iconPrestasi,
  iconKeluar: NEW.iconKeluar,
  iconProfil: NEW.iconProfil,
  iconSuara: NEW.iconSuara,
  mikrofonBaca: NEW.ikonMikrofon,

  // Map / Path
  nodeAktif: NEW.nodeAktif,
  nodeSelesai: NEW.nodeSelesai,
  nodeTerkunci: NEW.nodeTerkunci,
  nodeBonus: NEW.nodeBonus,
  petiHarta: NEW.petiHarta,
  petiHartaTerbuka: NEW.petiHartaTerbuka,
  piala: NEW.piala,
  benderaCheckpoint: NEW.benderaCheckpoint,
  jalurSCurve: NEW.jalurSCurve,
  tombolMulaiNgaji: NEW.tombolMulaiNgaji,

  // Books / Tilawati Jilid
  bannerTilawati: NEW.nodeAktif,
  jilidCovers: {
    1: NEW.bukuTilawatiJilid1,
    2: NEW.bukuTilawatiJilid2,
    3: NEW.bukuTilawatiJilid3,
    4: NEW.bukuTilawatiJilid4,
    5: NEW.bukuTilawatiJilid5,
    6: NEW.bukuTilawatiJilid6,
  } as Record<number, string>,
  bukuGhorib: NEW.bukuTilawatiGhorib,
  bukuTajwid: NEW.bukuTilawatiTajwid,
  bukuJuzAmma: NEW.bukuJuzAmma,

  // Kartu Kuis
  kartuHuruf: NEW.kartuHuruf,
  kartuBelakang: NEW.kartuBelakang,
  kartuTebakJuz: NEW.kartuTebakJuz,
  kartuAcak: NEW.kartuAcak,
  kartuMatchCocok: NEW.kartuMatchCocok,
  kartuTerkunci: NEW.kartuTerkunci,

  // Mini Games
  qirraPop: NEW.qirraPop,
  qirraMatch: NEW.qirraMatch,
  tebakSurahBaru: NEW.tebakSurahBaru,
  balonMerah: NEW.balonMerah,
  balonBiru: NEW.balonBiru,
  balonKuning: NEW.balonKuning,
  balonHijau: NEW.balonHijau,

  // Characters / Avatar
  avatarAnak: NEW.avatarAnak,

  // Badges / Lencana
  lencanaJilid1: NEW.lencanaJilid1,
  lencanaJilid2: NEW.lencanaJilid2,
  lencanaJilid3: NEW.lencanaJilid3,
  lencanaJilid4: NEW.lencanaJilid4,
  lencanaJilid5: NEW.lencanaJilid5,
  lencanaJilid6: NEW.lencanaJilid6,

  // Legacy mappings for backwards compatibility
  hadiah: NEW.petiHarta,
  kalenderStreak: NEW.apiStreak,
  konfeti: NEW.ornamenKilau,
  lencanaKhatam: NEW.piala,
  medaliEmas: NEW.piala,
  medaliPerak: NEW.piala,
  medaliPerunggu: NEW.piala,
  perisai: NEW.nodeAktif,
  petirXp: NEW.koinHijaiyah,
  sertifikat: NEW.piala,
  kartuLengkung: NEW.kartuHuruf,
  lenteraPop: NEW.ornamenBulanSabit,
  tebakSurah: NEW.tebakSurahBaru,
};
