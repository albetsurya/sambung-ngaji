export type MoodKey =
  | "sedih"
  | "cemas"
  | "syukur"
  | "marah"
  | "lelah"
  | "takut"
  | "putus-asa"
  | "tenang";

export interface MoodAyat {
  surah: number;
  ayat: number;
  surahNama: string;
  teksArab: string;
  teksIndonesia: string;
}

export interface MoodDoa {
  judul: string;
  arab: string;
  latin: string;
  arti: string;
  sumber?: string;
}

export interface Mood {
  key: MoodKey;
  label: string;
  emoji: string;
  deskripsi: string;
  pembuka: string;
  nasehat: string;
  ayat: MoodAyat[];
  doa: MoodDoa[];
}

export const MOOD_LIST: Mood[] = [
  /* ============================================================ */
  /* SEDIH */
  /* ============================================================ */
  {
    key: "sedih",
    label: "Sedih",
    emoji: "🌧️",
    deskripsi: "Hati terasa berat, ingin menangis",
    pembuka:
      "Allah tidak membiarkanmu sendiri. Dia mendengar setiap tetes air matamu.",
        nasehat:
      "Kesedihan adalah tamu yang datang dan pergi. Allah tidak membiarkanmu sendiri — Dia mencatat setiap air mata yang jatuh karena iman. Jangan tahan tangismu, tapi jangan biarkan ia menenggelamkanmu. Berpalinglah pada-Nya, karena Dia yang menggenggam hatimu.",
    ayat: [
      {
        surah: 9,
        ayat: 40,
        surahNama: "At-Taubah",
        teksArab: "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا",
        teksIndonesia:
          "Janganlah engkau bersedih, sesungguhnya Allah bersama kita.",
      },
      {
        surah: 94,
        ayat: 5,
        surahNama: "Asy-Syarh",
        teksArab: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        teksIndonesia: "Maka sesungguhnya bersama kesulitan ada kemudahan.",
      },
      {
        surah: 93,
        ayat: 3,
        surahNama: "Ad-Duha",
        teksArab: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
        teksIndonesia:
          "Tuhanmu tidak meninggalkanmu dan tidak (pula) membencimu.",
      },
      {
        surah: 12,
        ayat: 86,
        surahNama: "Yusuf",
        teksArab: "إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ",
        teksIndonesia:
          "Sesungguhnya aku hanya mengadukan kesusahan dan kesedihanku kepada Allah.",
      },
      {
        surah: 3,
        ayat: 139,
        surahNama: "Ali 'Imran",
        teksArab:
          "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
        teksIndonesia:
          "Janganlah kamu bersikap lemah, dan janganlah (pula) kamu bersedih hati, padahal kamulah orang-orang yang paling tinggi (derajatnya), jika kamu orang-orang yang beriman.",
      },
      {
        surah: 9,
        ayat: 129,
        surahNama: "At-Taubah",
        teksArab:
          "فَإِن تَوَلَّوْا۟ فَقُلْ حَسْبِىَ ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ",
        teksIndonesia:
          "Jika mereka berpaling (dari keimanan), maka katakanlah: 'Cukuplah Allah bagiku; tidak ada Tuhan selain Dia. Hanya kepada-Nya aku bertawakkal.'",
      },
    ],
    doa: [
      {
        judul: "Doa Nabi Yunus (saat dalam kegelapan)",
        arab:
          "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ",
        latin:
          "Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin.",
        arti:
          "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim.",
        sumber: "QS. Al-Anbiya: 87",
      },
      {
        judul: "Doa Saat Sedih",
        arab:
          "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ",
        latin:
          "Allahumma inni 'abduka, ibnu 'abdika, ibnu amatika, nashiyati biyadika, madhin fiyya hukmuka, 'adlun fiyya qadha'uka.",
        arti:
          "Ya Allah, aku adalah hamba-Mu, anak hamba-Mu (Adam) dan anak hamba perempuan-Mu (Hawa), ubun-ubunku di tangan-Mu, keputusan-Mu berlaku atasku, dan ketetapan-Mu adil pada diriku.",
        sumber: "HR. Ahmad 1/391",
      },
      {
        judul: "Doa Saat Kesusahan",
        arab:
          "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        latin:
          "Laa ilaaha illallahul 'azhiimul haliim, laa ilaaha illallahu rabbul 'arsyil 'azhiim, laa ilaaha illallahu rabbus samawaati wa rabbul ardhi wa rabbul 'arsyil kariim.",
        arti:
          "Tidak ada Tuhan selain Allah Yang Maha Agung lagi Maha Penyantun. Tidak ada Tuhan selain Allah, Tuhan Arsy yang agung. Tidak ada Tuhan selain Allah, Tuhan langit dan bumi, dan Tuhan Arsy yang mulia.",
        sumber: "HR. Bukhari 6346, Muslim 2730",
      },
    ],
  },

  /* ============================================================ */
  /* CEMAS */
  /* ============================================================ */
  {
    key: "cemas",
    label: "Cemas",
    emoji: "😰",
    deskripsi: "Khawatir, gelisah, tidak tenang",
    pembuka:
      "Tenangkan hatimu. Allah sudah mengatur segalanya sebelum engkau lahir.",
        nasehat:
      "Kekhawatiran menguras energi yang seharusnya untuk beribadah. Serahkan pada Allah apa yang di luar kendalimu, dan kerjakan yang masih bisa kau kerjakan. Tawakal bukan berarti pasrah tanpa usaha — tawakal berarti berusaha, lalu memasrahkan hasilnya pada-Nya.",
    ayat: [
      {
        surah: 13,
        ayat: 28,
        surahNama: "Ar-Ra'd",
        teksArab: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
        teksIndonesia:
          "Ingatlah, hanya dengan mengingat Allah hati menjadi tenang.",
      },
      {
        surah: 65,
        ayat: 2,
        surahNama: "At-Talaq",
        teksArab: "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا",
        teksIndonesia:
          "Dan barangsiapa bertakwa kepada Allah, niscaya Dia akan menjadikan jalan keluar baginya.",
      },
      {
        surah: 2,
        ayat: 286,
        surahNama: "Al-Baqarah",
        teksArab: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        teksIndonesia:
          "Allah tidak membebani seseorang melainkan sesuai kesanggupannya.",
      },
      {
        surah: 3,
        ayat: 173,
        surahNama: "Ali 'Imran",
        teksArab: "حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
        teksIndonesia:
          "Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung.",
      },
      {
        surah: 2,
        ayat: 216,
        surahNama: "Al-Baqarah",
        teksArab:
          "وَعَسَىٰٓ أَن تَكْرَهُوا۟ شَيْـًٔا وَهُوَ خَيْرٌ لَّكُمْ ۖ وَعَسَىٰٓ أَن تُحِبُّوا۟ شَيْـًٔا وَهُوَ شَرٌّ لَّكُمْ",
        teksIndonesia:
          "Boleh jadi kamu membenci sesuatu, padahal ia amat baik bagimu, dan boleh jadi (pula) kamu menyukai sesuatu, padahal ia amat buruk bagimu.",
      },
      {
        surah: 9,
        ayat: 51,
        surahNama: "At-Taubah",
        teksArab:
          "قُل لَّن يُصِيبَنَآ إِلَّا مَا كَتَبَ ٱللَّهُ لَنَا هُوَ مَوْلَىٰنَا ۚ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ",
        teksIndonesia:
          "Katakanlah: 'Sekali-kali tidak akan menimpa kami melainkan apa yang telah ditetapkan Allah untuk kami. Dialah Pelindung kami, dan hanya kepada Allah orang-orang yang beriman harus bertawakal.'",
      },
    ],
    doa: [
      {
        judul: "Doa Saat Cemas",
        arab:
          "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
        latin:
          "Allahumma inni a'udzu bika minal hammi wal hazan, wal 'ajzi wal kasal, wal bukhli wal jubn, wa dhala'id daini wa qahrir rijal.",
        arti:
          "Ya Allah, aku berlindung kepada-Mu dari kegelisahan dan kesedihan, dari kelemahan dan kemalasan, dari kekikiran dan sifat pengecut, dari lilitan utang dan tekanan orang.",
        sumber: "HR. Bukhari 2893",
      },
      {
        judul: "Doa Tawakal",
        arab: "حَسْبِىَ ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
        latin: "Hasbiyallaahu wa ni'mal wakiil.",
        arti: "Cukuplah Allah bagiku, dan Dia sebaik-baik pelindung.",
        sumber: "QS. Ali 'Imran: 173",
      },
      {
        judul: "Doa Memohon Pertolongan",
        arab:
          "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ",
        latin:
          "Allahumma rahmataka arjuu, fa laa takilnii ilaa nafsii, wa ashlih lii sya'nii kullahu, laa ilaaha illaa anta.",
        arti:
          "Ya Allah, hanya rahmat-Mu yang aku harapkan, maka jangan Engkau serahkan aku pada diriku sendiri, perbaikilah semua urusanku, tiada Tuhan selain Engkau.",
        sumber: "HR. Abu Dawud 5090",
      },
    ],
  },

  /* ============================================================ */
  /* SYUKUR */
  /* ============================================================ */
  {
    key: "syukur",
    label: "Bersyukur",
    emoji: "🌟",
    deskripsi: "Hati terasa lapang, ingin berbagi kebaikan",
    pembuka:
      "Alhamdulillah. Syukurmu adalah cahaya yang menuntun ke lebih banyak nikmat.",
        nasehat:
      "Syukur bukan hanya ucapan 'alhamdulillah', tapi juga hati yang ridha, lisan yang memuji, dan tindakan yang berbagi. Semakin kau syukuri yang sedikit, semakin Allah percayakan yang lebih banyak. Berbagilah, karena nikmat tidak berkurang dengan dibagi.",
    ayat: [
      {
        surah: 14,
        ayat: 7,
        surahNama: "Ibrahim",
        teksArab: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
        teksIndonesia:
          "Jika kamu bersyukur, pasti Aku akan menambah (nikmat) kepadamu.",
      },
      {
        surah: 2,
        ayat: 152,
        surahNama: "Al-Baqarah",
        teksArab:
          "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
        teksIndonesia:
          "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu. Bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat)-Ku.",
      },
      {
        surah: 93,
        ayat: 11,
        surahNama: "Ad-Duha",
        teksArab: "وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ",
        teksIndonesia:
          "Dan terhadap nikmat Tuhanmu, maka hendaklah engkau menyebut-nyebutnya.",
      },
      {
        surah: 16,
        ayat: 18,
        surahNama: "An-Nahl",
        teksArab:
          "وَإِن تَعُدُّوا۟ نِعْمَةَ ٱللَّهِ لَا تُحْصُوهَآ ۗ إِنَّ ٱللَّهَ لَغَفُورٌ رَّحِيمٌ",
        teksIndonesia:
          "Dan jika kamu menghitung-hitung nikmat Allah, niscaya kamu tak dapat menentukan jumlahnya. Sesungguhnya Allah benar-benar Maha Pengampun lagi Maha Penyayang.",
      },
      {
        surah: 31,
        ayat: 12,
        surahNama: "Luqman",
        teksArab:
          "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِۦ ۖ وَمَن كَفَرَ فَإِنَّ ٱللَّهَ غَنِىٌّ حَمِيدٌ",
        teksIndonesia:
          "Dan barangsiapa yang bersyukur (kepada Allah), maka sesungguhnya ia bersyukur untuk dirinya sendiri; dan barangsiapa yang tidak bersyukur, maka sesungguhnya Allah Maha Kaya lagi Maha Terpuji.",
      },
      {
        surah: 2,
        ayat: 172,
        surahNama: "Al-Baqarah",
        teksArab:
          "يَٰٓأَيُّهَا ٱلَّذِينَ آمَنُوا۟ كُلُوا۟ مِن طَيِّبَٰتِ مَا رَزَقْنَٰكُمْ وَٱشْكُرُوا۟ لِلَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ",
        teksIndonesia:
          "Hai orang-orang yang beriman, makanlah di antara rezeki yang baik-baik yang Kami berikan kepadamu dan bersyukurlah kepada Allah, jika benar-benar kepada-Nya kamu menyembah.",
      },
    ],
    doa: [
      {
        judul: "Doa Syukur",
        arab: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        latin: "Allahumma a'inni 'ala dzikrika wa syukrika wa husni 'ibadatik.",
        arti:
          "Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.",
        sumber: "HR. Abu Dawud 1522",
      },
      {
        judul: "Doa Pujian Nikmat",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        latin: "Alhamdulillaahil ladzii bini'matihi tatimmush shaalihaat.",
        arti:
          "Segala puji bagi Allah, yang dengan nikmat-Nya segala kebaikan menjadi sempurna.",
        sumber: "HR. Ibnu Majah 3803",
      },
      {
        judul: "Doa Nabi Sulaiman",
        arab:
          "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
        latin:
          "Rabbi auzi'nii an asykura ni'matakal latii an'amta 'alayya wa 'alaa waalidayya wa an a'mala shaalihan tardhaah.",
        arti:
          "Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat Engkau yang telah Engkau berikan kepadaku dan kepada ibu bapakku dan supaya aku dapat berbuat amal yang saleh yang Engkau ridhai.",
        sumber: "QS. Al-Ahqaf: 15",
      },
    ],
  },

  /* ============================================================ */
  /* MARAH */
  /* ============================================================ */
  {
    key: "marah",
    label: "Marah",
    emoji: "🔥",
    deskripsi: "Emosi memuncak, dada terasa sesak",
    pembuka:
      "Diam sejenak. Marah adalah api — jangan biarkan membakar amal baikmu.",
        nasehat:
      "Marah adalah bara api — jika tidak dikendalikan, ia membakar pemiliknya. Diam sejenak, ambil wudhu, ubah posisi, dan ingatlah: menahan marah itu pahala besar, apalagi memaafkan. Karena sesungguhnya, orang kuat bukanlah yang menang bergulat, tapi yang mampu menahan amarahnya.",
    ayat: [
      {
        surah: 3,
        ayat: 134,
        surahNama: "Ali 'Imran",
        teksArab:
          "وَٱلْكَٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ ۗ وَٱللَّهُ يُحِبُّ ٱلْمُحْسِنِينَ",
        teksIndonesia:
          "Dan orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang lain. Dan Allah mencintai orang-orang yang berbuat kebaikan.",
      },
      {
        surah: 42,
        ayat: 43,
        surahNama: "Asy-Syura",
        teksArab:
          "وَلَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِن عَزْمِ ٱلْأُمُورِ",
        teksIndonesia:
          "Tetapi orang yang bersabar dan memaafkan, sesungguhnya (perbuatan) yang demikian itu termasuk hal-hal yang diutamakan.",
      },
      {
        surah: 41,
        ayat: 34,
        surahNama: "Fussilat",
        teksArab:
          "ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ فَإِذَا ٱلَّذِى بَيْنَكَ وَبَيْنَهُۥ عَدَٰوَةٌ كَأَنَّهُۥ وَلِىٌّ حَمِيمٌ",
        teksIndonesia:
          "Tolaklah (kejahatan) dengan cara yang lebih baik, maka tiba-tiba orang yang antara kamu dan dia ada permusuhan, seakan-akan menjadi teman yang sangat setia.",
      },
      {
        surah: 7,
        ayat: 199,
        surahNama: "Al-A'raf",
        teksArab:
          "خُذِ ٱلْعَفْوَ وَأْمُرْ بِٱلْعُرْفِ وَأَعْرِضْ عَنِ ٱلْجَٰهِلِينَ",
        teksIndonesia:
          "Jadilah engkau pemaaf dan suruhlah orang mengerjakan yang makruf, serta berpalinglah dari orang-orang yang bodoh.",
      },
      {
        surah: 3,
        ayat: 159,
        surahNama: "Ali 'Imran",
        teksArab:
          "فَٱعْفُ عَنْهُمْ وَٱسْتَغْفِرْ لَهُمْ وَشَاوِرْهُمْ فِى ٱلْأَمْرِ",
        teksIndonesia:
          "Maka maafkanlah mereka, mohonkanlah ampun bagi mereka, dan bermusyawarahlah dengan mereka dalam urusan itu.",
      },
      {
        surah: 24,
        ayat: 22,
        surahNama: "An-Nur",
        teksArab:
          "وَلْيَعْفُوا۟ وَلْيَصْفَحُوٓا۟ ۗ أَلَا تُحِبُّونَ أَن يَغْفِرَ ٱللَّهُ لَكُمْ",
        teksIndonesia:
          "Dan hendaklah mereka memaafkan dan berlapang dada. Apakah kamu tidak ingin bahwa Allah mengampunimu?",
      },
    ],
    doa: [
      {
        judul: "Doa Menahan Amarah",
        arab: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        latin: "A'udzu billahi minasy syaithanir rajim.",
        arti: "Aku berlindung kepada Allah dari godaan setan yang terkutuk.",
        sumber: "HR. Bukhari 3282, Muslim 2610",
      },
      {
        judul: "Doa Memohon Petunjuk Hati",
        arab: "اللَّهُمَّ مُصَرِّفَ الْقُلُوبِ صَرِّفْ قُلُوبَنَا عَلَى طَاعَتِكَ",
        latin:
          "Allahumma musharrifal quluub, sharrif quluubanaa 'alaa thaa'atik.",
        arti:
          "Ya Allah, Zat yang membolak-balikkan hati, palingkanlah hati kami untuk taat kepada-Mu.",
        sumber: "HR. Muslim 2654",
      },
      {
        judul: "Doa Menghilangkan Amarah",
        arab:
          "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي، وَأَذْهِبْ غَيْظَ قَلْبِي، وَأَجِرْنِي مِنَ الشَّيْطَانِ",
        latin:
          "Allahummaghfir lii dzanbii, wa adzhib ghaizha qalbii, wa ajirnii minasy syaithaan.",
        arti:
          "Ya Allah, ampunilah dosaku, hilangkanlah amarah dari hatiku, dan lindungilah aku dari setan.",
        sumber: "HR. Ahmad, hasan",
      },
    ],
  },

  /* ============================================================ */
  /* LELAH */
  /* ============================================================ */
  {
    key: "lelah",
    label: "Lelah",
    emoji: "🥱",
    deskripsi: "Fisik dan hati capek, ingin rehat dari dunia",
    pembuka:
      "Istirahatlah. Bahkan Rasulullah pun butuh waktu untuk dirinya sendiri.",
        nasehat:
      "Kelelahan adalah tanda bahwa engkau telah berjuang. Istirahatlah tanpa rasa bersalah — karena tubuh juga punya hak. Nabi SAW pun butuh tidur, butuh makanan, butuh waktu bersama keluarga. Rehat bukan berarti lemah, tapi bagian dari strategi panjang.",
    ayat: [
      {
        surah: 94,
        ayat: 6,
        surahNama: "Asy-Syarh",
        teksArab: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        teksIndonesia: "Sesungguhnya bersama kesulitan ada kemudahan.",
      },
      {
        surah: 94,
        ayat: 1,
        surahNama: "Asy-Syarh",
        teksArab: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ",
        teksIndonesia: "Bukankah Kami telah melapangkan dadamu (Muhammad)?",
      },
      {
        surah: 65,
        ayat: 3,
        surahNama: "At-Talaq",
        teksArab: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
        teksIndonesia:
          "Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.",
      },
      {
        surah: 78,
        ayat: 9,
        surahNama: "An-Naba",
        teksArab: "وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا",
        teksIndonesia: "Dan Kami jadikan tidurmu untuk istirahat.",
      },
      {
        surah: 2,
        ayat: 153,
        surahNama: "Al-Baqarah",
        teksArab:
          "يَٰٓأَيُّهَا ٱلَّذِينَ آمَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ",
        teksIndonesia:
          "Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu. Sesungguhnya Allah beserta orang-orang yang sabar.",
      },
      {
        surah: 94,
        ayat: 4,
        surahNama: "Asy-Syarh",
        teksArab: "وَرَفَعْنَا لَكَ ذِكْرَكَ",
        teksIndonesia: "Dan Kami tinggikan sebutan (nama)mu bagimu.",
      },
    ],
    doa: [
      {
        judul: "Doa Saat Lelah",
        arab:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        latin: "Allahumma inni as'alukal 'afiyata fid dunya wal akhirah.",
        arti:
          "Ya Allah, aku memohon kepada-Mu kesehatan dan keselamatan di dunia dan akhirat.",
        sumber: "HR. Abu Dawud 5074",
      },
      {
        judul: "Doa Memohon Kekuatan",
        arab: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin: "Laa haula wa laa quwwata illaa billaah.",
        arti:
          "Tidak ada daya dan tidak ada kekuatan kecuali dengan pertolongan Allah.",
        sumber: "HR. Bukhari 6384",
      },
      {
        judul: "Doa Berlindung dari Kelemahan",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        latin: "Allahumma inni a'udzu bika minal 'ajzi wal kasal.",
        arti:
          "Ya Allah, aku berlindung kepada-Mu dari kelemahan dan kemalasan.",
        sumber: "HR. Bukhari 6367",
      },
    ],
  },

  /* ============================================================ */
  /* TAKUT */
  /* ============================================================ */
  {
    key: "takut",
    label: "Takut",
    emoji: "😨",
    deskripsi: "Ada yang mencemaskan, tidak merasa aman",
    pembuka: "Allah Maha Menjaga. Tidak ada yang bisa melukai tanpa izin-Nya.",
        nasehat:
      "Takut kepada makhluk adalah pintu kehinaan; takut kepada Allah adalah pintu kemuliaan. Gantungkan hatimu pada yang tidak pernah lelah menjaga hamba-Nya. Ketika kau merasa sendirian menghadapi ketakutan, ingatlah bahwa Dia selalu lebih dekat dari urat lehermu.",
    ayat: [
      {
        surah: 3,
        ayat: 173,
        surahNama: "Ali 'Imran",
        teksArab: "حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
        teksIndonesia:
          "Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung.",
      },
      {
        surah: 8,
        ayat: 62,
        surahNama: "Al-Anfal",
        teksArab:
          "فَإِنَّ حَسْبَكَ ٱللَّهُ ۚ هُوَ ٱلَّذِىٓ أَيَّدَكَ بِنَصْرِهِۦ",
        teksIndonesia:
          "Maka sesungguhnya Allah adalah Pemberi kecukupan bagimu. Dialah yang memperkuatmu dengan pertolongan-Nya.",
      },
      {
        surah: 2,
        ayat: 255,
        surahNama: "Al-Baqarah",
        teksArab: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
        teksIndonesia:
          "Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya).",
      },
      {
        surah: 10,
        ayat: 62,
        surahNama: "Yunus",
        teksArab:
          "أَلَآ إِنَّ أَوْلِيَآءَ ٱللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        teksIndonesia:
          "Ingatlah, sesungguhnya wali-wali Allah itu, tidak ada kekhawatiran terhadap mereka dan tidak (pula) mereka bersedih hati.",
      },
      {
        surah: 3,
        ayat: 175,
        surahNama: "Ali 'Imran",
        teksArab:
          "إِنَّمَا ذَٰلِكُمُ ٱلشَّيْطَٰنُ يُخَوِّفُ أَوْلِيَآءَهُۥ فَلَا تَخَافُوهُمْ وَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ",
        teksIndonesia:
          "Sesungguhnya mereka itu tidak lain hanyalah setan yang menakut-nakuti (kamu) dengan kawan-kawannya (orang-orang musyrik), karena itu janganlah kamu takut kepada mereka, tetapi takutlah kepada-Ku, jika kamu benar-benar orang yang beriman.",
      },
      {
        surah: 41,
        ayat: 30,
        surahNama: "Fussilat",
        teksArab:
          "أَلَّا تَخَافُوا۟ وَلَا تَحْزَنُوا۟ وَأَبْشِرُوا۟ بِٱلْجَنَّةِ ٱلَّتِى كُنتُمْ تُوعَدُونَ",
        teksIndonesia:
          "Janganlah kamu takut dan janganlah merasa sedih; dan gembirakanlah mereka dengan jannah yang telah dijanjikan Allah kepadamu.",
      },
    ],
    doa: [
      {
        judul: "Doa Perlindungan dari Segala Bahaya",
        arab:
          "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin:
          "Bismillahil ladzi la yadhurru ma'asmihi syai'un fil ardhi wa la fis sama'i wa huwas sami'ul 'alim.",
        arti:
          "Dengan nama Allah yang dengan nama-Nya tidak ada sesuatu pun yang membahayakan, baik di bumi maupun di langit. Dan Dia Maha Mendengar lagi Maha Mengetahui.",
        sumber: "HR. Abu Dawud 5088",
      },
      {
        judul: "Doa Perlindungan dari Kejahatan",
        arab: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        latin: "A'udzu bikalimaatillaahit taammaati min syarri maa khalaq.",
        arti:
          "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk-Nya.",
        sumber: "HR. Muslim 2708",
      },
      {
        judul: "Doa Perlindungan dari Segala Penjuru",
        arab:
          "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        latin:
          "Allahummahfazhnii min baini yadayya wa min khalfii wa 'an yamiinii wa 'an syimaalii wa min fauqii, wa a'uudzu bika an ughtaala min tahtii.",
        arti:
          "Ya Allah, lindungilah aku dari depan, belakang, kanan, kiri, dan dari atasku. Aku berlindung kepada-Mu agar tidak diserang dari bawahku.",
        sumber: "HR. Abu Dawud 5074",
      },
    ],
  },

  /* ============================================================ */
  /* PUTUS ASA */
  /* ============================================================ */
  {
    key: "putus-asa",
    label: "Putus Asa",
    emoji: "💔",
    deskripsi: "Merasa tidak ada harapan lagi",
    pembuka:
      "Jangan berhenti. Rahmat Allah lebih luas dari yang kau bayangkan.",
        nasehat:
      "Tidak ada kegelapan yang tidak fana. Yusuf dipenjara bertahun-tahun sebelum menjadi pembesar Mesir. Yunus berada dalam perut ikan sebelum diselamatkan. Jangan berhenti di bab yang belum selesai — karena halaman berikutnya bisa jadi bab paling indah dalam hidupmu.",
    ayat: [
      {
        surah: 39,
        ayat: 53,
        surahNama: "Az-Zumar",
        teksArab:
          "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا",
        teksIndonesia:
          "Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya.",
      },
      {
        surah: 29,
        ayat: 69,
        surahNama: "Al-Ankabut",
        teksArab: "وَٱلَّذِينَ جَٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
        teksIndonesia:
          "Dan orang-orang yang berjihad untuk (mencari keridhaan) Kami, benar-benar akan Kami tunjukkan kepada mereka jalan-jalan Kami.",
      },
      {
        surah: 12,
        ayat: 87,
        surahNama: "Yusuf",
        teksArab: "وَلَا تَا۟يْـَٔسُوا۟ مِن رَّوْحِ ٱللَّهِ",
        teksIndonesia: "Dan janganlah kamu berputus asa dari rahmat Allah.",
      },
      {
        surah: 17,
        ayat: 82,
        surahNama: "Al-Isra",
        teksArab:
          "وَنُنَزِّلُ مِنَ ٱلْقُرْآنِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
        teksIndonesia:
          "Dan Kami turunkan dari Al-Quran suatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman.",
      },
      {
        surah: 3,
        ayat: 139,
        surahNama: "Ali 'Imran",
        teksArab:
          "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
        teksIndonesia:
          "Janganlah kamu bersikap lemah, dan janganlah (pula) kamu bersedih hati, padahal kamulah orang-orang yang paling tinggi (derajatnya), jika kamu orang-orang yang beriman.",
      },
      {
        surah: 65,
        ayat: 3,
        surahNama: "At-Talaq",
        teksArab:
          "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
        teksIndonesia:
          "Dan memberinya rezeki dari arah yang tiada disangka-sangkanya. Dan barangsiapa yang bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.",
      },
    ],
    doa: [
      {
        judul: "Doa Memohon Ampunan & Harapan",
        arab: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni.",
        arti:
          "Ya Allah, sesungguhnya Engkau Maha Pengampun dan menyukai ampunan, maka ampunilah aku.",
        sumber: "HR. Tirmidzi 3513",
      },
      {
        judul: "Doa Nabi Zakariya",
        arab: "رَبِّ لَا تَذَرْنِى فَرْدًا وَأَنتَ خَيْرُ ٱلْوَٰرِثِينَ",
        latin: "Rabbi laa tadzarnii fardan wa anta khairul waaritsiin.",
        arti:
          "Ya Tuhanku, janganlah Engkau biarkan aku hidup seorang diri (tanpa keturunan) dan Engkaulah ahli waris yang terbaik.",
        sumber: "QS. Al-Anbiya: 89",
      },
      {
        judul: "Doa Kecukupan Rezeki",
        arab:
          "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        latin:
          "Allahummakfinii bihalaalika 'an haraamik, wa aghninii bifadhlika 'amman siwaak.",
        arti:
          "Ya Allah, cukupkanlah aku dengan yang halal dari-Mu sehingga terhindar dari yang haram, dan kayakanlah aku dengan karunia-Mu sehingga tidak bergantung kepada selain-Mu.",
        sumber: "HR. Tirmidzi 3563",
      },
    ],
  },

  /* ============================================================ */
  /* TENANG */
  /* ============================================================ */
  {
    key: "tenang",
    label: "Butuh Tenang",
    emoji: "🕊️",
    deskripsi: "Ingin duduk sejenak, menenangkan hati",
    pembuka:
      "Duduklah. Ambil napas. Biarkan ayat-ayat ini menenangkan jiwamu.",
        nasehat:
      "Ketenangan bukan berarti tidak ada masalah — ketenangan adalah hati yang tetap tenang walau di tengah badai. Itu hadiah dari Allah bagi yang mengingat-Nya. Cari ketenangan bukan di luar, tapi di dalam: dengan dzikir, dengan Al-Quran, dengan sujud di sepertiga malam.",
    ayat: [
      {
        surah: 13,
        ayat: 28,
        surahNama: "Ar-Ra'd",
        teksArab: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
        teksIndonesia:
          "Ingatlah, hanya dengan mengingat Allah hati menjadi tenang.",
      },
      {
        surah: 30,
        ayat: 21,
        surahNama: "Ar-Rum",
        teksArab:
          "وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا",
        teksIndonesia:
          "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati.",
      },
      {
        surah: 48,
        ayat: 4,
        surahNama: "Al-Fath",
        teksArab: "هُوَ ٱلَّذِىٓ أَنزَلَ ٱلسَّكِينَةَ فِى قُلُوبِ ٱلْمُؤْمِنِينَ",
        teksIndonesia:
          "Dialah yang telah menurunkan ketenangan ke dalam hati orang-orang mukmin.",
      },
      {
        surah: 13,
        ayat: 11,
        surahNama: "Ar-Ra'd",
        teksArab:
          "إِنَّ ٱللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا۟ مَا بِأَنفُسِهِمْ",
        teksIndonesia:
          "Sesungguhnya Allah tidak merubah keadaan sesuatu kaum sehingga mereka merubah keadaan yang ada pada diri mereka sendiri.",
      },
      {
        surah: 2,
        ayat: 186,
        surahNama: "Al-Baqarah",
        teksArab:
          "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ",
        teksIndonesia:
          "Dan apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, maka (jawablah), bahwasanya Aku adalah dekat. Aku mengabulkan permohonan orang yang berdoa apabila ia memohon kepada-Ku.",
      },
      {
        surah: 9,
        ayat: 40,
        surahNama: "At-Taubah",
        teksArab: "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا",
        teksIndonesia:
          "Janganlah engkau bersedih, sesungguhnya Allah bersama kita.",
      },
    ],
    doa: [
      {
        judul: "Doa Ketenangan Hati",
        arab:
          "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        latin:
          "Ya Hayyu ya Qayyum, birahmatika astaghits, ashlih li sya'ni kullahu, wa la takilni ila nafsi tharfata 'ain.",
        arti:
          "Wahai Dzat yang Hidup, Wahai Dzat yang mengatur segala sesuatu, hanya dengan rahmat-Mu aku memohon pertolongan, perbaikilah semua keadaanku dan jangan Engkau menyerahkan aku pada diriku walau sekedipan mata.",
        sumber: "HR. Hakim 1/545",
      },
      {
        judul: "Doa Memohon Ketenangan",
        arab:
          "اللَّهُمَّ أَنْزِلْ عَلَيْنَا مِنْ بَرَكَاتِ السَّمَاءِ وَأَخْرِجْ لَنَا مِنْ بَرَكَاتِ الْأَرْضِ",
        latin:
          "Allahumma anzil 'alainaa min barakaatis samaa'i wa akhrij lanaa min barakaatil ardh.",
        arti:
          "Ya Allah, turunkanlah kepada kami keberkahan dari langit dan keluarkanlah untuk kami keberkahan dari bumi.",
        sumber: "HR. Thabrani",
      },
      {
        judul: "Doa Salam & Keberkahan",
        arab:
          "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        latin:
          "Allahumma antas salaam wa minkas salaam, tabaarakta yaa dzal jalaali wal ikraam.",
        arti:
          "Ya Allah, Engkau Maha Pemberi keselamatan, dan dari-Mu keselamatan itu berasal. Maha Berkah Engkau, wahai Dzat yang memiliki keagungan dan kemuliaan.",
        sumber: "HR. Muslim 591",
      },
    ],
  },
];

export function getMood(key: MoodKey): Mood | undefined {
  return MOOD_LIST.find((m) => m.key === key);
}
