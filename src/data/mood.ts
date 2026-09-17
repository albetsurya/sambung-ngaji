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
    pembuka: "Allah tidak membiarkanmu sendiri. Dia mendengar setiap tetes air matamu.",
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
    ],
    doa: [
      {
        judul: "Doa Nabi Yunus (saat dalam kegelapan)",
        arab: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ",
        latin: "Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin.",
        arti:
          "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim.",
        sumber: "QS. Al-Anbiya: 87",
      },
      {
        judul: "Doa Saat Sedih",
        arab:
          "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ",
        latin:
          "Allahumma inni 'abduka, ibnu 'abdika, ibnu amatika, nashiyati biyadika, madhin fiyya hukmuka, 'adlun fiyya qadha'uka, as'aluka bikulli ismin huwa laka...",
        arti:
          "Ya Allah, aku adalah hamba-Mu, anak hamba-Mu (Adam) dan anak hamba perempuan-Mu (Hawa), ubun-ubunku di tangan-Mu, keputusan-Mu berlaku atasku, dan ketetapan-Mu adil pada diriku. Aku memohon kepada-Mu dengan setiap nama...",
        sumber: "HR. Ahmad 1/391",
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
    pembuka: "Tenangkan hatimu. Allah sudah mengatur segalanya sebelum engkau lahir.",
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
        teksArab: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
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
    ],
    doa: [
      {
        judul: "Doa Syukur",
        arab:
          "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        latin:
          "Allahumma a'inni 'ala dzikrika wa syukrika wa husni 'ibadatik.",
        arti:
          "Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.",
        sumber: "HR. Abu Dawud 1522",
      },
      {
        judul: "Doa Pujian Nikmat",
        arab:
          "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        latin: "Alhamdulillaahil ladzii bini'matihi tatimmush shaalihaat.",
        arti:
          "Segala puji bagi Allah, yang dengan nikmat-Nya segala kebaikan menjadi sempurna.",
        sumber: "HR. Ibnu Majah 3803",
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
        arab:
          "اللَّهُمَّ مُصَرِّفَ الْقُلُوبِ صَرِّفْ قُلُوبَنَا عَلَى طَاعَتِكَ",
        latin: "Allahumma musharrifal quluub, sharrif quluubanaa 'alaa thaa'atik.",
        arti:
          "Ya Allah, Zat yang membolak-balikkan hati, palingkanlah hati kami untuk taat kepada-Mu.",
        sumber: "HR. Muslim 2654",
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
        arab:
          "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin: "Laa haula wa laa quwwata illaa billaah.",
        arti:
          "Tidak ada daya dan tidak ada kekuatan kecuali dengan pertolongan Allah.",
        sumber: "HR. Bukhari 6384",
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
        teksArab: "فَإِنَّ حَسْبَكَ ٱللَّهُ ۚ هُوَ ٱلَّذِىٓ أَيَّدَكَ بِنَصْرِهِۦ",
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
    ],
    doa: [
      {
        judul: "Doa Perlindungan",
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
        arab:
          "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        latin: "A'udzu bikalimaatillaahit taammaati min syarri maa khalaq.",
        arti:
          "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk-Nya.",
        sumber: "HR. Muslim 2708",
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
        teksArab:
          "وَٱلَّذِينَ جَٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
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
    ],
    doa: [
      {
        judul: "Doa Memohon Ampunan & Harapan",
        arab:
          "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni.",
        arti:
          "Ya Allah, sesungguhnya Engkau Maha Pengampun dan menyukai ampunan, maka ampunilah aku.",
        sumber: "HR. Tirmidzi 3513",
      },
      {
        judul: "Doa Nabi Zakariya",
        arab:
          "رَبِّ لَا تَذَرْنِى فَرْدًا وَأَنتَ خَيْرُ ٱلْوَٰرِثِينَ",
        latin: "Rabbi laa tadzarnii fardan wa anta khairul waaritsiin.",
        arti:
          "Ya Tuhanku, janganlah Engkau biarkan aku hidup seorang diri (tanpa keturunan) dan Engkaulah ahli waris yang terbaik.",
        sumber: "QS. Al-Anbiya: 89",
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
        teksArab:
          "هُوَ ٱلَّذِىٓ أَنزَلَ ٱلسَّكِينَةَ فِى قُلُوبِ ٱلْمُؤْمِنِينَ",
        teksIndonesia:
          "Dialah yang telah menurunkan ketenangan ke dalam hati orang-orang mukmin.",
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
    ],
  },
];

export function getMood(key: MoodKey): Mood | undefined {
  return MOOD_LIST.find((m) => m.key === key);
}
