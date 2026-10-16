// Assets import for Ngaji Ceria using 200+ new SVG asset suite
import * as NEW from "../../../assets/ngaji-ceria-new/index";
import ayatHunterCover from "../../../assets/ngaji-ceria-new/games/ayatHunter.svg";

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

  // Books / Jilid
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
  tangkapHarakat: NEW.coverTangkapHarakat,
  susunKata: NEW.coverSusunKata,
  // Cover sementara; ganti ke /assets/ngaji-ceria/games/* setelah aset final tersedia.
  hijaiyahPop: NEW.qirraPop,
  hijaiyahMatchArena: NEW.qirraMatch,
  juzAmmaSpeedrun: NEW.tebakSurahBaru,
  harakatRush: NEW.coverTangkapHarakat,
  ayatScramble: NEW.coverSusunKata,
  ayatHunter: ayatHunterCover,
  hijaiyahRush: NEW.qirraPop,
  arabicWordle: NEW.coverRodaHijaiyah,
  hijaiyah2048: NEW.coverRodaHijaiyah,
  quranQuizRoyale: NEW.tebakSurahBaru,
  wudhuFlow: NEW.coverRodaHijaiyah,
  santriIdle: NEW.avatarAnak,
  sholatHero: NEW.coverRodaHijaiyah,
  adabRpg: NEW.qirraMatch,
  tajwidTetris: NEW.coverRodaHijaiyah,
  doaDungeon: NEW.coverRodaHijaiyah,
  nabiChronicles: NEW.qirraMatch,
  malaikatMission: NEW.tebakSurahBaru,
  balonMerah: NEW.balonMerah,
  balonBiru: NEW.balonBiru,
  balonKuning: NEW.balonKuning,
  balonHijau: NEW.balonHijau,

  // UI Dock / TopBar / Pills (locked Ceria clay style)
  dockLatar: NEW.dockLatar,
  dockItemAktif: NEW.dockItemAktif,
  topBarLatar: NEW.topBarLatar,
  pillVip: NEW.pillVip,
  pillJudulLevel: NEW.pillJudulLevel,

  // Hero & Background panels
  heroBannerVip: NEW.heroBannerVip,
  heroLanjutkan: NEW.heroLanjutkan,
  heroKartuNgaji: NEW.heroKartuNgaji,
  heroStreak: NEW.heroStreak,
  bgPeta: NEW.bgPeta,
  bgGames: NEW.bgGames,
  bgKuis: NEW.bgKuis,

  // Characters / Avatar
  avatarAnak: NEW.avatarAnak,
  // yusuf, aisyah, fatimah, grr, frosty, chibi boy dihilangkan

  // Map buildings & decor (paket ngaji-ceria-aset-game)
  buildingMasjid: NEW.buildingMasjid,
  buildingKelas: NEW.buildingKelas,
  buildingAsrama: NEW.buildingAsrama,
  buildingPerpus: NEW.buildingPerpus,
  buildingDapur: NEW.buildingDapur,
  buildingRumah: NEW.buildingRumah,
  mapGerbang: NEW.mapGerbang,
  mapLapangan: NEW.mapLapangan,
  mapRuangTamu: NEW.mapRuangTamu,
  mapTaman: NEW.mapTaman,
  mapMalam: NEW.mapMalam,
  obstaclePohon: NEW.obstaclePohon,

  // Wudhu steps
  stepNiat: NEW.stepNiat,
  stepCuciTangan: NEW.stepCuciTangan,
  stepBerkumur: NEW.stepBerkumur,
  stepHirupAir: NEW.stepHirupAir,
  stepBasuhWajah: NEW.stepBasuhWajah,
  stepBasuhTangan: NEW.stepBasuhTangan,
  stepUsapKepala: NEW.stepUsapKepala,
  stepUsapTelinga: NEW.stepUsapTelinga,
  stepBasuhKaki: NEW.stepBasuhKaki,
  stepDoaSelesai: NEW.stepDoaSelesai,

  // Arcade obstacles & effects
  obstacleBatu: NEW.obstacleBatuRintangan,
  obstaclePagar: NEW.obstaclePagar,
  obstacleSemak: NEW.obstacleSemak,
  obstacleBalok: NEW.obstacleBalokKayu,
  sparkleBenar: NEW.effectSparkleCorrect,
  popBalon: NEW.efekPopBalon,

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

  // --- BATTLE & GLYPH UI ---
  // Characters
  avatarBoy: NEW.avatarBoy,
  avatarBoyBattle: NEW.avatarBoyBattle,
  avatarQirra: NEW.avatarQirra,
  avatarQirraBattle: NEW.avatarQirraBattle,
  avatarSafa: NEW.avatarSafa,
  avatarSafaBattle: NEW.avatarSafaBattle,

  // Monsters
  monsterGolem: NEW.monsterGolem,
  monsterPixel: NEW.monsterPixel,
  monsterSlime: NEW.monsterSlime,

  // UI Glyphs
  iconCheckMark: NEW.iconCheckMark,
  iconEnergyPetir: NEW.iconEnergyPetir,
  iconGearSettings: NEW.iconGearSettings,
  iconMergeClips: NEW.iconMergeClips,
  iconPlay: NEW.iconPlay,
  iconPlayHeadMarker: NEW.iconPlayHeadMarker,
  iconPowerShield: NEW.iconPowerShield,
  iconPowerSlowmo: NEW.iconPowerSlowmo,
  iconRedo: NEW.iconRedo,
  iconScissors: NEW.iconScissors,
  iconStop: NEW.iconStop,
  iconUndo: NEW.iconUndo,

  // Varian & Tema
  btnArrowDown: NEW.btnArrowDown,
  btnArrowLeft: NEW.btnArrowLeft,
  btnArrowRight: NEW.btnArrowRight,
  btnArrowUp: NEW.btnArrowUp,
  iconAlkimiaTabung: NEW.iconAlkimiaTabung,
  iconDetektifKacaPembesar: NEW.iconDetektifKacaPembesar,
  iconRadarScanner: NEW.iconRadarScanner,
  tileWordleAbsent: NEW.tileWordleAbsent,
  tileWordleCorrect: NEW.tileWordleCorrect,
  tileWordleEmpty: NEW.tileWordleEmpty,
  tileWordlePresent: NEW.tileWordlePresent,
};
