import type { DoaEntry } from "./doa";

export interface DoaHarianKategori {
  key: string;
  label: string;
  emoji: string;
  entries: DoaEntry[];
}

export const DOA_HARIAN: DoaHarianKategori[] = [
  {
    key: "makan",
    label: "Makan",
    emoji: "🍽️",
    entries: [
      {
        id: "harian-makan-sebelum",
        judul: "Sebelum Makan",
        arab: "بِسْمِ اللَّهِ",
        latin: "Bismillah",
        arti: "Dengan menyebut nama Allah.",
        sumber: "HR. Abu Dawud 3767",
        keutamaan:
          "Jika lupa membaca bismillah di awal, ucapkan: 'Bismillahi awwalahu wa akhirahu'.",
      },
      {
        id: "harian-makan-sesudah",
        judul: "Setelah Makan",
        arab:
          "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        latin:
          "Alhamdulillaahilladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin.",
        arti:
          "Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami kaum muslimin.",
        sumber: "HR. Abu Dawud 3850",
        keutamaan:
          "Dibaca setelah menyelesaikan makan sebagai rasa syukur atas nikmat yang telah Allah berikan.",
      },
    ],
  },

  {
    key: "tidur",
    label: "Tidur",
    emoji: "🌙",
    entries: [
      {
        id: "harian-tidur-sebelum",
        judul: "Sebelum Tidur",
        arab: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
        latin: "Allahumma bismika amuutu wa ahyaa.",
        arti: "Ya Allah, dengan nama-Mu aku mati dan aku hidup.",
        sumber: "HR. Bukhari 6324",
      },
      {
        id: "harian-tidur-bangun",
        judul: "Bangun Tidur",
        arab:
          "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        latin:
          "Alhamdulillaahil ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur.",
        arti:
          "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.",
        sumber: "HR. Bukhari 6312",
      },
    ],
  },

  {
    key: "rumah",
    label: "Rumah",
    emoji: "🏠",
    entries: [
      {
        id: "harian-rumah-keluar",
        judul: "Keluar Rumah",
        arab:
          "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin:
          "Bismillaahi, tawakkaltu 'alallaahi, wa laa haula wa laa quwwata illaa billaah.",
        arti:
          "Dengan nama Allah, aku bertawakal kepada Allah, tidak ada daya dan kekuatan kecuali dengan pertolongan Allah.",
        sumber: "HR. Tirmidzi 3426, Abu Dawud 5095",
        keutamaan:
          "Barangsiapa membacanya, akan diberi petunjuk, dicukupkan, dan dilindungi dari setan.",
      },
      {
        id: "harian-rumah-masuk",
        judul: "Masuk Rumah",
        arab:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        latin:
          "Allahumma inni as'aluka khairal maulaji wa khairal makhraji, bismillaahi walajnaa, wa bismillaahi kharajnaa, wa 'alallaahi rabbinaa tawakkalnaa.",
        arti:
          "Ya Allah, aku memohon kepada-Mu sebaik-baik tempat masuk dan sebaik-baik tempat keluar. Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.",
        sumber: "HR. Abu Dawud 5096",
      },
    ],
  },

  {
    key: "wc",
    label: "WC",
    emoji: "🚽",
    entries: [
      {
        id: "harian-wc-masuk",
        judul: "Masuk WC",
        arab:
          "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        latin: "Allahumma inni a'uudzu bika minal khubutsi wal khabaa'its.",
        arti:
          "Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.",
        sumber: "HR. Bukhari 142, Muslim 375",
      },
      {
        id: "harian-wc-keluar",
        judul: "Keluar WC",
        arab: "غُفْرَانَكَ",
        latin: "Ghufraanak.",
        arti: "(Aku memohon) ampunan-Mu.",
        sumber: "HR. Abu Dawud 30, Tirmidzi 7",
      },
    ],
  },

  {
    key: "safar",
    label: "Perjalanan",
    emoji: "🚗",
    entries: [
      {
        id: "harian-safar-naik",
        judul: "Naik Kendaraan",
        arab:
          "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        latin:
          "Subhaanal ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun.",
        arti:
          "Maha Suci Allah yang telah menundukkan (kendaraan) ini bagi kami, padahal kami sebelumnya tidak mampu menguasainya. Dan sesungguhnya kepada Tuhan kami, kami akan kembali.",
        sumber: "QS. Az-Zukhruf: 13-14, HR. Muslim 1342",
      },
      {
        id: "harian-safar-doa",
        judul: "Doa Safar",
        arab:
          "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ",
        latin:
          "Allahumma innaa nas'aluka fii safarinaa haadzal birra wat taqwaa, wa minal 'amali maa tardhaa. Allahumma hawwin 'alainaa safaranaa haadzaa wathwi 'annaa bu'dahu.",
        arti:
          "Ya Allah, kami memohon kepada-Mu dalam perjalanan kami ini kebaikan dan ketakwaan, serta amal yang Engkau ridhai. Ya Allah, mudahkanlah perjalanan kami ini dan dekatkanlah jaraknya bagi kami.",
        sumber: "HR. Muslim 1342",
      },
    ],
  },

  {
    key: "masjid",
    label: "Masjid",
    emoji: "🕌",
    entries: [
      {
        id: "harian-masjid-masuk",
        judul: "Masuk Masjid",
        arab:
          "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        latin: "Allahummaftah lii abwaaba rahmatik.",
        arti: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
        sumber: "HR. Muslim 713",
      },
      {
        id: "harian-masjid-keluar",
        judul: "Keluar Masjid",
        arab:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        latin: "Allahumma inni as'aluka min fadhlik.",
        arti: "Ya Allah, aku memohon kepada-Mu dari karunia-Mu.",
        sumber: "HR. Muslim 713",
      },
    ],
  },

  {
    key: "pakaian",
    label: "Pakaian",
    emoji: "👕",
    entries: [
      {
        id: "harian-pakaian-memakai",
        judul: "Memakai Pakaian",
        arab:
          "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        latin:
          "Alhamdulillaahil ladzii kasaanii haadzats tsauba wa razaqaniihi min ghairi haulin minnii wa laa quwwah.",
        arti:
          "Segala puji bagi Allah yang telah memberiku pakaian ini dan memberiku rezeki tanpa daya dan kekuatan dariku.",
        sumber: "HR. Tirmidzi 3458, Abu Dawud 4023",
      },
      {
        id: "harian-pakaian-melepas",
        judul: "Melepas Pakaian",
        arab: "بِسْمِ اللَّهِ",
        latin: "Bismillah",
        arti: "Dengan menyebut nama Allah.",
        sumber: "HR. Tirmidzi 606 (hasan)",
        keutamaan:
          "Menjadi penghalang antara aurat dan pandangan jin.",
      },
    ],
  },

  {
    key: "hujan",
    label: "Hujan",
    emoji: "🌧️",
    entries: [
      {
        id: "harian-hujan-turun",
        judul: "Saat Hujan Turun",
        arab: "اللَّهُمَّ صَيِّبًا نَافِعًا",
        latin: "Allahumma shayyiban naafi'aa.",
        arti: "Ya Allah, (jadikanlah) hujan yang bermanfaat.",
        sumber: "HR. Bukhari 1032",
      },
      {
        id: "harian-hujan-setelah",
        judul: "Setelah Hujan",
        arab: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
        latin: "Muthirnaa bifadhlillaahi wa rahmatih.",
        arti: "Kami diberi hujan dengan karunia dan rahmat Allah.",
        sumber: "HR. Bukhari 846, Muslim 71",
      },
    ],
  },
];

export function getDoaHarianKategori(key: string): DoaHarianKategori | undefined {
  return DOA_HARIAN.find((k) => k.key === key);
}
