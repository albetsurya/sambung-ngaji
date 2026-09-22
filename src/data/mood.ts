/* ============================================================================
 * Data mood, ayat, doa, hadits, dan nasehat.
 * Sudah termasuk versi "ADDITIONS" yang di-merge & di-dedupe.
 * ========================================================================== */

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

export interface MoodHadits {
  judul: string;
  arab: string;
  latin: string;
  arti: string;
  sumber: string;
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
  hadits: MoodHadits[];
}

export const MOOD_LIST: Mood[] = [
  /* ========================================================================== */
  /* SEDIH                                                                       */
  /* ========================================================================== */
  {
    key: "sedih",
    label: "Sedih",
    emoji: "🌧️",
    deskripsi: "Hati terasa berat, ingin menangis",
    pembuka:
      "Allah tidak membiarkanmu sendiri. Dia mendengar setiap tetes air matamu.",
    nasehat:
      'Perhatikan pola dari ayat-ayat di atas: Nabi Ya\'qub mengadu, "Sesungguhnya aku hanya mengadukan kesusahan dan kesedihanku kepada Allah" (Yusuf: 86), beliau tidak menyembunyikan sedihnya, tapi beliau tahu ke mana harus mengadu. Nabi ﷺ pun menangis saat Ibrahim wafat, namun lisannya tetap menjaga: "kami tidak mengucapkan kecuali apa yang diridhai Rabb kami" (HR. Bukhari 1303). Dan di setiap ayat, selalu ada janji yang menyertai: "Allah bersama kita" (At-Taubah: 40), "bersama kesulitan ada kemudahan" (Asy-Syarh: 5), "Tuhanmu tidak meninggalkanmu" (Ad-Duha: 3). Maka hikmahnya: sedihmu bukan tanda lemahnya iman, yang menjadi masalah adalah ketika sedih membuatmu berhenti mengadu pada Allah atau berprasangka buruk pada-Nya. Air mata yang jatuh karena iman justru dicatat, dan setiap kesulitan yang dijalani dengan sabar akan berbuah pahala tanpa batas (Az-Zumar: 10).',
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
      {
        surah: 12,
        ayat: 84,
        surahNama: "Yusuf",
        teksArab:
          "وَتَوَلَّىٰ عَنْهُمْ وَقَالَ يَٰٓأَسَفَىٰ عَلَىٰ يُوسُفَ وَٱبْيَضَّتْ عَيْنَاهُ مِنَ ٱلْحُزْنِ فَهُوَ كَظِيمٌ",
        teksIndonesia:
          "Dan Ya'qub berpaling dari mereka sambil berkata, 'Wahai dukacitaku atas Yusuf,' dan kedua matanya menjadi putih karena kesedihan, dan dia adalah orang yang menahan amarah.",
      },
      {
        surah: 39,
        ayat: 53,
        surahNama: "Az-Zumar",
        teksArab:
          "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا",
        teksIndonesia:
          "Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya.",
      },
      /* --- tambahan --- */
      {
        surah: 2,
        ayat: 155,
        surahNama: "Al-Baqarah",
        teksArab: "وَبَشِّرِ ٱلصَّٰبِرِينَ",
        teksIndonesia:
          "Dan sampaikanlah kabar gembira kepada orang-orang yang sabar.",
      },
      {
        surah: 2,
        ayat: 156,
        surahNama: "Al-Baqarah",
        teksArab: "إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ",
        teksIndonesia:
          "(Yaitu) orang-orang yang apabila ditimpa musibah, mereka mengucapkan: 'Inna lillahi wa inna ilaihi raji'un.'",
      },
      {
        surah: 2,
        ayat: 157,
        surahNama: "Al-Baqarah",
        teksArab:
          "أُو۟لَٰٓئِكَ عَلَيْهِمْ صَلَوَٰتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُهْتَدُونَ",
        teksIndonesia:
          "Mereka itulah yang mendapat keberkatan yang sempurna dan rahmat dari Tuhan mereka, dan mereka itulah orang-orang yang mendapat petunjuk.",
      },
      {
        surah: 35,
        ayat: 34,
        surahNama: "Fatir",
        teksArab: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَذْهَبَ عَنَّا ٱلْحَزَنَ",
        teksIndonesia:
          "Segala puji bagi Allah yang telah menghilangkan kesedihan dari kami.",
      },
      {
        surah: 12,
        ayat: 18,
        surahNama: "Yusuf",
        teksArab:
          "فَصَبْرٌ جَمِيلٌ ۖ وَٱللَّهُ ٱلْمُسْتَعَانُ عَلَىٰ مَا تَصِفُونَ",
        teksIndonesia:
          "Maka kesabaran yang baik itulah (kesabaranku). Dan Allah sajalah yang dimohon pertolongan-Nya terhadap apa yang kamu ceritakan.",
      },
      {
        surah: 12,
        ayat: 83,
        surahNama: "Yusuf",
        teksArab:
          "فَصَبْرٌ جَمِيلٌ ۖ عَسَى ٱللَّهُ أَن يَأْتِيَنِى بِهِمْ جَمِيعًا",
        teksIndonesia:
          "Maka kesabaran yang baik itulah (kesabaranku). Mudah-mudahan Allah mendatangkan mereka semuanya kepadaku.",
      },
      {
        surah: 11,
        ayat: 49,
        surahNama: "Hud",
        teksArab: "فَٱصْبِرْ ۖ إِنَّ ٱلْعَٰقِبَةَ لِلْمُتَّقِينَ",
        teksIndonesia:
          "Maka bersabarlah, sesungguhnya kesudahan yang baik adalah bagi orang-orang yang bertakwa.",
      },
      {
        surah: 20,
        ayat: 130,
        surahNama: "Ta-Ha",
        teksArab: "فَٱصْبِرْ عَلَىٰ مَا يَقُولُونَ",
        teksIndonesia: "Maka sabarlah engkau atas apa yang mereka katakan.",
      },
      {
        surah: 70,
        ayat: 5,
        surahNama: "Al-Ma'arij",
        teksArab: "فَٱصْبِرْ صَبْرًا جَمِيلًا",
        teksIndonesia: "Maka bersabarlah kamu dengan sabar yang baik.",
      },
      {
        surah: 13,
        ayat: 22,
        surahNama: "Ar-Ra'd",
        teksArab: "وَٱلَّذِينَ صَبَرُوا۟ ٱبْتِغَآءَ وَجْهِ رَبِّهِمْ",
        teksIndonesia:
          "Dan orang-orang yang sabar karena mengharap keridhaan Tuhannya.",
      },
      {
        surah: 103,
        ayat: 3,
        surahNama: "Al-'Asr",
        teksArab:
          "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
        teksIndonesia:
          "Kecuali orang-orang yang beriman dan mengerjakan amal saleh dan nasehat-menasehati supaya menaati kebenaran dan nasehat-menasehati supaya menetapi kesabaran.",
      },
      {
        surah: 2,
        ayat: 45,
        surahNama: "Al-Baqarah",
        teksArab: "وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ",
        teksIndonesia:
          "Dan mintalah pertolongan (kepada Allah) dengan sabar dan shalat.",
      },
      {
        surah: 21,
        ayat: 35,
        surahNama: "Al-Anbiya",
        teksArab: "وَنَبْلُوكُم بِٱلشَّرِّ وَٱلْخَيْرِ فِتْنَةً",
        teksIndonesia:
          "Dan Kami akan menguji kamu dengan keburukan dan kebaikan sebagai cobaan.",
      },
      {
        surah: 47,
        ayat: 31,
        surahNama: "Muhammad",
        teksArab:
          "وَلَنَبْلُوَنَّكُمْ حَتَّىٰ نَعْلَمَ ٱلْمُجَٰهِدِينَ مِنكُمْ وَٱلصَّٰبِرِينَ",
        teksIndonesia:
          "Dan sesungguhnya Kami benar-benar akan menguji kamu agar Kami mengetahui orang-orang yang berjihad dan bersabar di antara kamu.",
      },
      {
        surah: 2,
        ayat: 214,
        surahNama: "Al-Baqarah",
        teksArab:
          "أَمْ حَسِبْتُمْ أَن تَدْخُلُوا۟ ٱلْجَنَّةَ وَلَمَّا يَأْتِكُم مَّثَلُ ٱلَّذِينَ خَلَوْا۟ مِن قَبْلِكُم",
        teksIndonesia:
          "Apakah kamu mengira bahwa kamu akan masuk surga, padahal belum datang kepadamu (cobaan) sebagaimana halnya orang-orang terdahulu sebelum kamu.",
      },
      {
        surah: 3,
        ayat: 200,
        surahNama: "Ali 'Imran",
        teksArab:
          "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟",
        teksIndonesia:
          "Hai orang-orang yang beriman, bersabarlah kamu dan kuatkanlah kesabaranmu dan tetaplah bersiap siaga.",
      },
      {
        surah: 18,
        ayat: 6,
        surahNama: "Al-Kahf",
        teksArab:
          "فَلَعَلَّكَ بَٰخِعٌ نَّفْسَكَ عَلَىٰٓ ءَاثَٰرِهِمْ إِن لَّمْ يُؤْمِنُوا۟ بِهَٰذَا ٱلْحَدِيثِ أَسَفًا",
        teksIndonesia:
          "Maka barangkali kamu akan membunuh dirimu karena bersedih hati setelah mereka berpaling, sekiranya mereka tidak beriman kepada keterangan ini.",
      },
      {
        surah: 16,
        ayat: 96,
        surahNama: "An-Nahl",
        teksArab: "مَا عِندَكُمْ يَنفَدُ ۖ وَمَا عِندَ ٱللَّهِ بَاقٍ",
        teksIndonesia:
          "Apa yang di sisimu akan lenyap, dan apa yang ada di sisi Allah adalah kekal.",
      },
      {
        surah: 39,
        ayat: 10,
        surahNama: "Az-Zumar",
        teksArab:
          "قُلْ يَٰعِبَادِ ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ رَبَّكُمْ ۚ لِلَّذِينَ أَحْسَنُوا۟ فِى هَٰذِهِ ٱلدُّنْيَا حَسَنَةٌ",
        teksIndonesia:
          "Katakanlah: 'Hai hamba-hamba-Ku yang beriman, bertakwalah kepada Tuhanmu.' Orang-orang yang berbuat baik di dunia ini memperoleh kebaikan.",
      },
      {
        surah: 29,
        ayat: 2,
        surahNama: "Al-'Ankabut",
        teksArab:
          "أَحَسِبَ ٱلنَّاسُ أَن يُتْرَكُوٓا۟ أَن يَقُولُوٓا۟ ءَامَنَّا وَهُمْ لَا يُفْتَنُونَ",
        teksIndonesia:
          "Apakah manusia mengira mereka akan dibiarkan (saja) mengatakan 'Kami telah beriman' padahal mereka belum diuji?",
      },
    ],
    doa: [
      {
        judul: "Doa Nabi Yunus (saat dalam kegelapan)",
        arab: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ",
        latin:
          "Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin.",
        arti: "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim.",
        sumber: "QS. Al-Anbiya: 87",
      },
      {
        judul: "Doa Saat Sedih",
        arab: "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجِلَاءَ حُزْنِي، وَذَهَابَ هَمِّي",
        latin:
          "Allahumma inni 'abduka, ibnu 'abdika, ibnu amatika, nashiyati biyadika, madhin fiyya hukmuka, 'adlun fiyya qadha'uka, as'aluka bikulli ismin huwa laka, sammayta bihi nafsaka, aw anzaltahu fi kitabika, aw 'allamtahu ahadan min khalqika, aw ista'tsarta bihi fi 'ilmil ghaibi 'indaka, an taj'alal Qur'ana rabi'a qalbi, wa nura shadri, wa jila'a huzni, wa dzahaba hammi.",
        arti: "Ya Allah, aku adalah hamba-Mu, anak hamba-Mu (Adam) dan anak hamba perempuan-Mu (Hawa), ubun-ubunku di tangan-Mu, keputusan-Mu berlaku atasku, dan ketetapan-Mu adil pada diriku. Aku memohon kepada-Mu dengan setiap nama yang Engkau miliki, yang Engkau namakan diri-Mu dengannya, atau yang Engkau turunkan dalam kitab-Mu, atau yang Engkau ajarkan kepada seseorang dari makhluk-Mu, atau yang Engkau simpan dalam ilmu gaib di sisi-Mu, agar Engkau menjadikan Al-Qur'an sebagai penyejuk hatiku, cahaya dadaku, penghilang kesedihanku, dan pelenyap kesusahanku.",
        sumber: "HR. Ahmad 1/391, hasan",
      },
      {
        judul: "Doa Saat Kesusahan",
        arab: "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        latin:
          "Laa ilaaha illallahul 'azhiimul haliim, laa ilaaha illallahu rabbul 'arsyil 'azhiim, laa ilaaha illallahu rabbus samawaati wa rabbul ardhi wa rabbul 'arsyil kariim.",
        arti: "Tidak ada Tuhan selain Allah Yang Maha Agung lagi Maha Penyantun. Tidak ada Tuhan selain Allah, Tuhan Arsy yang agung. Tidak ada Tuhan selain Allah, Tuhan langit dan bumi, dan Tuhan Arsy yang mulia.",
        sumber: "HR. Bukhari 6346, Muslim 2730",
      },
      {
        judul: "Doa Memohon Pahala Atas Musibah",
        arab: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
        latin:
          "Innaa lillaahi wa innaa ilaihi raaji'uun. Allahumma'jurnii fii mushiibatii, wa akhlif lii khairan minhaa.",
        arti: "Sesungguhnya kami milik Allah dan kepada-Nya kami kembali. Ya Allah, berilah aku pahala atas musibahku ini, dan gantikanlah untukku dengan yang lebih baik darinya.",
        sumber: "HR. Muslim 918",
      },
      {
        judul: "Doa Nabi Ayyub",
        arab: "رَبِّ إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
        latin: "Rabbi innii massaniyadh dhurru wa anta arhamur raahimiin.",
        arti: "Ya Tuhanku, sesungguhnya aku telah ditimpa penyakit dan Engkau adalah Tuhan Yang Maha Penyayang di antara semua penyayang.",
        sumber: "QS. Al-Anbiya: 83",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Ketika Ditimpa Musibah (lengkap)",
        arab: "مَا مِنْ عَبْدٍ تُصِيبُهُ مُصِيبَةٌ فَيَقُولُ إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
        latin:
          "Maa min 'abdin tushiibuhu mushiibatun fayaquulu innaa lillaahi wa innaa ilaihi raaji'uun, Allahumma'jurnii fii mushiibatii wa akhlif lii khairan minhaa.",
        arti: "Tidaklah seorang hamba ditimpa musibah lalu ia mengucapkan: 'Sesungguhnya kami milik Allah dan kepada-Nya kami kembali, ya Allah berilah aku pahala dalam musibahku dan gantilah untukku dengan yang lebih baik darinya.'",
        sumber: "HR. Muslim 918",
      },
      {
        judul: "Doa Memohon Ketenangan dari Kesedihan",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ",
        latin:
          "Allahumma inni as'aluka minal khairi kullihi 'aajilihi wa aajilih, wa a'uudzu bika minasy syarri kullihi 'aajilihi wa aajilih.",
        arti: "Ya Allah, aku memohon kepada-Mu segala kebaikan, yang cepat maupun yang lambat, dan aku berlindung kepada-Mu dari segala keburukan, yang cepat maupun yang lambat.",
        sumber: "HR. Ibnu Majah, hasan",
      },
      {
        judul: "Doa agar Diberi Kesabaran",
        arab: "رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
        latin: "Rabbanaa afrigh 'alainaa shabran wa tawaffanaa muslimiin.",
        arti: "Ya Tuhan kami, limpahkanlah kesabaran atas diri kami, dan wafatkanlah kami dalam keadaan berserah diri (kepada-Mu).",
        sumber: "QS. Al-A'raf: 126",
      },
      {
        judul: "Doa Nabi Musa Saat Kesulitan",
        arab: "رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى",
        latin: "Rabbisyrah lii shadrii wa yassir lii amrii.",
        arti: "Ya Tuhanku, lapangkanlah untukku dadaku, dan mudahkanlah untukku urusanku.",
        sumber: "QS. Ta-Ha: 25-26",
      },
      {
        judul: "Doa Memohon Kelapangan Hati",
        arab: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        latin:
          "Allahumma laa sahla illaa maa ja'altahu sahlan, wa anta taj'alul hazna idzaa syi'ta sahlan.",
        arti: "Ya Allah, tidak ada kemudahan kecuali apa yang Engkau jadikan mudah, dan Engkau yang menjadikan kesedihan itu mudah apabila Engkau kehendaki.",
        sumber: "HR. Ibnu Hibban, shahih",
      },
      {
        judul: "Doa Minta Dijauhkan dari Duka",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الرِّضَا بَعْدَ الْقَضَاءِ",
        latin: "Allahumma inni as'alukar ridha ba'dal qadha'.",
        arti: "Ya Allah, aku memohon kepada-Mu keridhaan (menerima) setelah ada ketetapan-Mu.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Ketika Hati Gundah",
        arab: "اللَّهُمَّ إِنِّي عَائِذٌ بِكَ مِنَ الْحَزَنِ وَالْهَمِّ",
        latin: "Allahumma inni 'aaidzun bika minal hazani wal hammi.",
        arti: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kesedihan dan kegelisahan.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Meminta Dikuatkan Hati",
        arab: "رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا",
        latin: "Rabbanaa laa tu'aakhidznaa in nasiinaa au akhtha'naa.",
        arti: "Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau kami tersalah.",
        sumber: "QS. Al-Baqarah: 286",
      },
      {
        judul: "Doa Memohon Ganti yang Lebih Baik",
        arab: "اللَّهُمَّ لَا خَيْرَ إِلَّا خَيْرُكَ، وَأَنْتَ الْجَوَادُ الْكَرِيمُ",
        latin:
          "Allahumma laa khaira illaa khairuka, wa antal jawwaadul kariim.",
        arti: "Ya Allah, tidak ada kebaikan kecuali kebaikan-Mu, dan Engkaulah Yang Maha Pemurah lagi Maha Mulia.",
        sumber: "Doa ma'tsur, diamalkan ulama",
      },
      {
        judul: "Doa Nabi Ketika Ditinggal Orang Tercinta",
        arab: "إِنَّ لِلَّهِ مَا أَخَذَ وَلَهُ مَا أَعْطَى، وَكُلُّ شَىْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ",
        latin:
          "Inna lillaahi maa akhadza wa lahu maa a'thaa, wa kullu syai'in 'indahu bi ajalin musammaa, fal tashbir wal tahtasib.",
        arti: "Sesungguhnya milik Allah apa yang Dia ambil, dan milik-Nya apa yang Dia berikan. Segala sesuatu di sisi-Nya memiliki ajal (waktu) tertentu, maka bersabarlah dan berharaplah pahala.",
        sumber: "HR. Bukhari 1284, Muslim 923",
      },
      {
        judul: "Doa Memohon Hati yang Ridha",
        arab: "اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا تَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعَاصِيكَ",
        latin:
          "Allahummaqsim lanaa min khasy-yatika maa tahuulu bihi bainanaa wa baina ma'aashiik.",
        arti: "Ya Allah, berilah kami bagian dari rasa takut kepada-Mu yang dapat menghalangi kami dari perbuatan maksiat kepada-Mu.",
        sumber: "HR. Tirmidzi 3502, hasan",
      },
      {
        judul: "Doa Memohon Kebaikan Dunia Akhirat",
        arab: "رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْءَاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ",
        latin:
          "Rabbanaa aatinaa fid dunyaa hasanatan wa fil aakhirati hasanatan wa qinaa 'adzaaban naar.",
        arti: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami dari siksa neraka.",
        sumber: "QS. Al-Baqarah: 201",
      },
      {
        judul: "Doa Dzikir Pagi Penghilang Sedih",
        arab: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        latin:
          "Radhiitu billaahi rabban, wa bil islaami diinan, wa bi Muhammadin shallallaahu 'alaihi wa sallama nabiyyan.",
        arti: "Aku ridha Allah sebagai Rabb, Islam sebagai agama, dan Muhammad shallallahu 'alaihi wa sallam sebagai Nabi.",
        sumber: "HR. Abu Dawud 5072, Tirmidzi 3389",
      },
      {
        judul: "Doa Memohon Kekuatan Menghadapi Kehilangan",
        arab: "حَسْبِىَ ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ",
        latin: "Hasbiyallaahu laa ilaaha illaa huwa, 'alaihi tawakkaltu.",
        arti: "Cukuplah Allah bagiku, tidak ada Tuhan selain Dia, hanya kepada-Nya aku bertawakal.",
        sumber: "QS. At-Taubah: 129",
      },
      {
        judul: "Doa Memohon Digantikan yang Lebih Baik",
        arab: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun kariimun tuhibbul 'afwa fa'fu 'anni.",
        arti: "Ya Allah, sesungguhnya Engkau Maha Pemaaf lagi Maha Mulia, menyukai maaf, maka maafkanlah aku.",
        sumber: "HR. Tirmidzi 3513, hasan shahih",
      },
      {
        judul: "Doa Meminta Dilapangkan Rezeki dan Hati",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ وَرَحْمَتِكَ، فَإِنَّهُ لَا يَمْلِكُهَا إِلَّا أَنْتَ",
        latin:
          "Allahumma inni as'aluka min fadhlika wa rahmatika, fa innahu laa yamlikuhaa illaa anta.",
        arti: "Ya Allah, aku memohon karunia dan rahmat-Mu, sesungguhnya tidak ada yang memilikinya kecuali Engkau.",
        sumber: "HR. Thabrani, hasan",
      },
      {
        judul: "Doa Agar Dikuatkan dalam Ujian",
        arab: "رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَٰمَةِ",
        latin:
          "Rabbanaa wa aatinaa maa wa'adtanaa 'alaa rusulika wa laa tukhzinaa yaumal qiyaamah.",
        arti: "Ya Tuhan kami, berilah kami apa yang telah Engkau janjikan kepada kami dengan perantaraan rasul-rasul-Mu, dan janganlah Engkau hinakan kami pada hari kiamat.",
        sumber: "QS. Ali 'Imran: 194",
      },
      {
        judul: "Doa Memohon Ketenangan Setelah Kehilangan",
        arab: "اللَّهُمَّ لَا تَدَعْ لِي ذَنْبًا إِلَّا غَفَرْتَهُ، وَلَا هَمًّا إِلَّا فَرَّجْتَهُ، وَلَا حَاجَةً هِيَ لَكَ رِضًا إِلَّا قَضَيْتَهَا",
        latin:
          "Allahumma laa tada' lii dzanban illaa ghafartahu, wa laa hamman illaa farrajtahu, wa laa haajatan hiya laka ridhan illaa qadhaitahaa.",
        arti: "Ya Allah, janganlah Engkau biarkan dosaku kecuali Engkau ampuni, tidak pula kegelisahan kecuali Engkau lapangkan, dan tidak pula kebutuhan yang Engkau ridhai kecuali Engkau penuhi.",
        sumber: "HR. Ahmad, hasan",
      },
    ],
    hadits: [
      {
        judul: "Menangis Bukan Tanda Lemahnya Iman",
        arab: "إِنَّ الْعَيْنَ تَدْمَعُ، وَالْقَلْبَ يَحْزَنُ، وَلَا نَقُولُ إِلَّا مَا يَرْضَى رَبُّنَا، وَإِنَّا بِفِرَاقِكَ يَا إِبْرَاهِيمُ لَمَحْزُونُونَ",
        latin:
          "Innal 'aina tadma'u, wal qalba yahzanu, wa laa naquulu illaa maa yardhaa rabbunaa, wa innaa bifiraaqika yaa Ibraahiimu lamahzuunuun.",
        arti: "Sesungguhnya mata ini menangis, dan hati ini bersedih. Dan kami tidak mengucapkan kecuali apa yang diridhai Rabb kami. Dan sesungguhnya kami dengan perpisahan darimu wahai Ibrahim, sungguh bersedih.",
        sumber: "HR. Bukhari no. 1303",
      },
      {
        judul: "Keajaiban Urusan Mukmin",
        arab: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ",
        latin:
          "'Ajaban li amril mu'min, inna amrahu kulluhu khair, wa laisa dzaaka li ahadin illaa lil mu'min, in ashaabathu sarraa'u syakara fa kaana khairan lahu, wa in ashaabathu dharraa'u shabara fa kaana khairan lahu.",
        arti: "Sungguh ajaib mukmin itu. Segala yang terjadi pada dirinya itu baik. Semua itu hanya ada pada diri orang yang beriman. Jika dia mendapatkan nikmat maka dia bersyukur dan itu baik baginya. Jika dia mendapatkan musibah maka dia sabar dan itu baik baginya.",
        sumber: "HR. Muslim",
      },
      {
        judul: "Pahala Sabar Tanpa Batas",
        arab: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُمْ بِغَيْرِ حِسَابٍ",
        latin: "Innamaa yuwaffash shaabiruuna ajrahum bighairi hisaab.",
        arti: "Hanya orang-orang yang bersabarlah yang disempurnakan pahalanya tanpa batas.",
        sumber: "QS. Az-Zumar: 10",
      },
      {
        judul: "Allah Bersama Orang yang Sabar",
        arab: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        latin: "Innallaaha ma'ash shaabiriin.",
        arti: "Sesungguhnya Allah beserta orang-orang yang sabar.",
        sumber: "QS. Al-Baqarah: 153",
      },
      /* --- tambahan --- */
      {
        judul: "Kesedihan Menggugurkan Dosa",
        arab: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ وَلَا أَذًى وَلَا غَمٍّ، حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
        latin:
          "Maa yushiibul muslima min nashabin wa laa washabin wa laa hammin wa laa huznin wa laa adzan wa laa ghammin, hattasy syaukati yusyaakuhaa, illaa kaffarallaahu bihaa min khathaayaahu.",
        arti: "Tidaklah seorang muslim ditimpa keletihan, sakit, kegelisahan, kesedihan, gangguan, dan kesusahan, hingga duri yang menusuknya, melainkan Allah akan menghapus kesalahan-kesalahannya dengan itu.",
        sumber: "HR. Bukhari 5641, Muslim 2573",
      },
      {
        judul: "Orang Beriman Diuji Sesuai Kadar Agamanya",
        arab: "أَشَدُّ النَّاسِ بَلَاءً الْأَنْبِيَاءُ ثُمَّ الْأَمْثَلُ فَالْأَمْثَلُ",
        latin:
          "Asyaddun naasi balaa'an al-anbiyaa'u tsumal amtsalu fal amtsal.",
        arti: "Manusia yang paling berat ujiannya adalah para nabi, kemudian orang-orang yang semisal (dalam keimanan) setelah mereka.",
        sumber: "HR. Tirmidzi 2398, shahih",
      },
      {
        judul: "Menangisi Musibah Bukan Larangan",
        arab: "إِنَّمَا نَهَيْتُ عَنِ النَّوْحِ، فَأَمَّا الدَّمْعُ فَلَا بَأْسَ بِهِ",
        latin: "Innamaa nahaitu 'anin nauh, fa ammad dam'u falaa ba'sa bih.",
        arti: "Sesungguhnya aku melarang meratap (dengan menjerit-jerit), adapun air mata (yang menetes karena sedih) tidak mengapa.",
        sumber: "Makna sesuai HR. Bukhari-Muslim",
      },
      {
        judul: "Sabar di Awal Musibah",
        arab: "إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الْأُولَى",
        latin: "Innamash shabru 'indash shadmatil uulaa.",
        arti: "Sabar itu hanyalah pada saat pertama kali musibah datang.",
        sumber: "HR. Bukhari 1283, Muslim 926",
      },
      {
        judul: "Allah Menguji Hamba yang Dicintai",
        arab: "إِذَا أَحَبَّ اللَّهُ عَبْدًا ابْتَلَاهُ",
        latin: "Idzaa ahabballaahu 'abdan ibtalaahu.",
        arti: "Apabila Allah mencintai seorang hamba, Dia akan mengujinya.",
        sumber: "HR. Tirmidzi 2396, hasan",
      },
      {
        judul: "Pahala Sesuai Kadar Ujian",
        arab: "إِنَّ عِظَمَ الْجَزَاءِ مَعَ عِظَمِ الْبَلَاءِ",
        latin: "Inna 'izhamal jazaa'i ma'a 'izhamil balaa'.",
        arti: "Sesungguhnya besarnya pahala sesuai dengan besarnya ujian.",
        sumber: "HR. Tirmidzi 2396, hasan",
      },
      {
        judul: "Kesedihan Karena Kematian Anak, Diganti Surga",
        arab: "مَا مِنْ أَحَدٍ مِنَ الْمُسْلِمِينَ يُتَوَفَّى لَهُ ثَلَاثَةٌ مِنَ الْوَلَدِ لَمْ يَبْلُغُوا الْحِنْثَ، إِلَّا أَدْخَلَهُ اللَّهُ الْجَنَّةَ بِفَضْلِ رَحْمَتِهِ إِيَّاهُمْ",
        latin:
          "Maa min ahadin minal muslimiina yutawaffaa lahu tsalaatsatun minal waladi lam yablughul hints, illaa adkhalahullaahul jannata bifadhli rahmatihi iyyaahum.",
        arti: "Tidaklah seorang muslim yang ditinggal mati tiga orang anaknya yang belum baligh, kecuali Allah akan memasukkannya ke surga karena rahmat-Nya kepada anak-anak tersebut.",
        sumber: "HR. Bukhari 1381, Muslim 2632",
      },
      {
        judul: "Doa yang Dibaca Nabi ﷺ Saat Sedih",
        arab: "كَانَ إِذَا حَزَبَهُ أَمْرٌ صَلَّى",
        latin: "Kaana idzaa hazabahu amrun shallaa.",
        arti: "Adalah Nabi ﷺ apabila menghadapi suatu perkara yang berat (menyedihkan), beliau segera melaksanakan shalat.",
        sumber: "HR. Abu Dawud 1319, hasan",
      },
    ],
  },

  /* ========================================================================== */
  /* CEMAS                                                                       */
  /* ========================================================================== */
  {
    key: "cemas",
    label: "Cemas",
    emoji: "😰",
    deskripsi: "Khawatir, gelisah, tidak tenang",
    pembuka:
      "Tenangkan hatimu. Allah sudah mengatur segalanya sebelum engkau lahir.",
    nasehat:
      'Ayat-ayat di atas semuanya berporos pada satu kalimat: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenang" (Ar-Ra\'d: 28). Perhatikan bahwa Allah tidak menjawab kecemasan dengan menghilangkan masalah, tetapi dengan menjanjikan: jalan keluar bagi yang bertakwa (At-Talaq: 2), beban yang tidak melebihi kesanggupan (Al-Baqarah: 286), rezeki dari arah yang tak disangka (At-Talaq: 3), dan "cukuplah Allah bagi kami" (Ali \'Imran: 173). Bahkan ayat Al-Baqarah: 216 mengingatkan bahwa yang kau benci bisa jadi baik, dan yang kau suka bisa jadi buruk, artinya kecemasanmu belum tentu benar. Doa Nabi ﷺ "Allahumma inni a\'udzu bika minal hammi wal hazan" (HR. Bukhari 2893) mengajarkan bahwa cemas itu diakui sebagai beban, tetapi kita diajari berlindung darinya, bukan tenggelam di dalamnya. Hadits burung yang keluar pagi lapar dan pulang kenyang (HR. Ahmad) menunjukkan bahwa tawakal itu tetap bergerak, bukan pasrah tanpa usaha.',
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
      {
        surah: 65,
        ayat: 3,
        surahNama: "At-Talaq",
        teksArab:
          "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
        teksIndonesia:
          "Dan memberinya rezeki dari arah yang tiada disangka-sangkanya. Dan barangsiapa yang bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.",
      },
      {
        surah: 2,
        ayat: 155,
        surahNama: "Al-Baqarah",
        teksArab:
          "وَلَنَبْلُوَنَّكُم بِشَىْءٍ مِّنَ ٱلْخَوْفِ وَٱلْجُوعِ وَنَقْصٍ مِّنَ ٱلْأَمْوَٰلِ وَٱلْأَنفُسِ وَٱلثَّمَرَٰتِ ۗ وَبَشِّرِ ٱلصَّٰبِرِينَ",
        teksIndonesia:
          "Dan sungguh akan Kami berikan cobaan kepadamu, dengan sedikit ketakutan, kelaparan, kekurangan harta, jiwa dan buah-buahan. Dan berikanlah berita gembira kepada orang-orang yang sabar.",
      },
      /* --- tambahan --- */
      {
        surah: 3,
        ayat: 160,
        surahNama: "Ali 'Imran",
        teksArab: "إِن يَنصُرْكُمُ ٱللَّهُ فَلَا غَالِبَ لَكُمْ",
        teksIndonesia:
          "Jika Allah menolong kamu, maka tidak ada yang dapat mengalahkan kamu.",
      },
      {
        surah: 8,
        ayat: 2,
        surahNama: "Al-Anfal",
        teksArab:
          "وَإِذَا تُلِيَتْ عَلَيْهِمْ ءَايَٰتُهُۥ زَادَتْهُمْ إِيمَٰنًا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ",
        teksIndonesia:
          "Dan apabila dibacakan ayat-ayat-Nya, bertambahlah iman mereka, dan hanya kepada Tuhanlah mereka bertawakal.",
      },
      {
        surah: 6,
        ayat: 17,
        surahNama: "Al-An'am",
        teksArab:
          "وَإِن يَمْسَسْكَ ٱللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُۥٓ إِلَّا هُوَ",
        teksIndonesia:
          "Jika Allah menimpakan sesuatu kemudaratan kepadamu, maka tidak ada yang menghilangkannya melainkan Dia sendiri.",
      },
      {
        surah: 27,
        ayat: 62,
        surahNama: "An-Naml",
        teksArab:
          "أَمَّن يُجِيبُ ٱلْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ ٱلسُّوٓءَ",
        teksIndonesia:
          "Bukankah Dia (Allah) yang memperkenankan doa orang yang dalam kesulitan apabila ia berdoa kepada-Nya, dan yang menghilangkan kesusahan.",
      },
      {
        surah: 39,
        ayat: 36,
        surahNama: "Az-Zumar",
        teksArab: "أَلَيْسَ ٱللَّهُ بِكَافٍ عَبْدَهُۥ",
        teksIndonesia: "Bukankah Allah cukup untuk melindungi hamba-hamba-Nya?",
      },
      {
        surah: 13,
        ayat: 8,
        surahNama: "Ar-Ra'd",
        teksArab: "وَكُلُّ شَىْءٍ عِندَهُۥ بِمِقْدَارٍ",
        teksIndonesia: "Dan segala sesuatu pada sisi-Nya ada ukurannya.",
      },
      {
        surah: 54,
        ayat: 49,
        surahNama: "Al-Qamar",
        teksArab: "إِنَّا كُلَّ شَىْءٍ خَلَقْنَٰهُ بِقَدَرٍ",
        teksIndonesia:
          "Sesungguhnya Kami menciptakan segala sesuatu menurut ukuran (yang telah ditentukan).",
      },
      {
        surah: 57,
        ayat: 22,
        surahNama: "Al-Hadid",
        teksArab:
          "مَآ أَصَابَ مِن مُّصِيبَةٍ فِى ٱلْأَرْضِ وَلَا فِىٓ أَنفُسِكُمْ إِلَّا فِى كِتَٰبٍ مِّن قَبْلِ أَن نَّبْرَأَهَآ",
        teksIndonesia:
          "Tiada suatu bencana pun yang menimpa di bumi dan (tidak pula) pada dirimu sendiri, melainkan telah tertulis dalam kitab (Lauh Mahfuzh) sebelum Kami menciptakannya.",
      },
      {
        surah: 9,
        ayat: 59,
        surahNama: "At-Taubah",
        teksArab:
          "سَيُؤْتِينَا ٱللَّهُ مِن فَضْلِهِۦ وَرَسُولُهُۥٓ إِنَّآ إِلَى ٱللَّهِ رَٰغِبُونَ",
        teksIndonesia:
          "Allah dan Rasul-Nya akan memberikan kepada kami sebagian dari karunia-Nya; sesungguhnya hanya kepada Allah-lah kami berharap.",
      },
      {
        surah: 5,
        ayat: 23,
        surahNama: "Al-Ma'idah",
        teksArab: "وَعَلَى ٱللَّهِ فَتَوَكَّلُوٓا۟ إِن كُنتُم مُّؤْمِنِينَ",
        teksIndonesia:
          "Dan hanya kepada Allah hendaknya kamu bertawakal, jika kamu benar-benar orang yang beriman.",
      },
      {
        surah: 8,
        ayat: 49,
        surahNama: "Al-Anfal",
        teksArab:
          "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَإِنَّ ٱللَّهَ عَزِيزٌ حَكِيمٌ",
        teksIndonesia:
          "Dan barangsiapa yang bertawakal kepada Allah, sesungguhnya Allah Maha Perkasa lagi Maha Bijaksana.",
      },
      {
        surah: 25,
        ayat: 58,
        surahNama: "Al-Furqan",
        teksArab: "وَتَوَكَّلْ عَلَى ٱلْحَىِّ ٱلَّذِى لَا يَمُوتُ",
        teksIndonesia:
          "Dan bertawakallah kepada Allah Yang Hidup (Kekal) Yang tidak mati.",
      },
      {
        surah: 29,
        ayat: 58,
        surahNama: "Al-'Ankabut",
        teksArab: "وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُتَوَكِّلُونَ",
        teksIndonesia:
          "Dan hanya kepada Allah-lah hendaknya orang-orang yang bertawakal itu, berserah diri.",
      },
      {
        surah: 67,
        ayat: 29,
        surahNama: "Al-Mulk",
        teksArab:
          "قُلْ هُوَ ٱلرَّحْمَٰنُ ءَامَنَّا بِهِۦ وَعَلَيْهِ تَوَكَّلْنَا",
        teksIndonesia:
          "Katakanlah: 'Dialah Yang Maha Pemurah, kami beriman kepada-Nya dan kepada-Nya-lah kami bertawakal.'",
      },
      {
        surah: 12,
        ayat: 67,
        surahNama: "Yusuf",
        teksArab: "وَعَلَيْهِ فَلْيَتَوَكَّلِ ٱلْمُتَوَكِّلُونَ",
        teksIndonesia:
          "Dan kepada Allah sajalah hendaknya orang-orang yang bertawakal itu berserah diri.",
      },
      {
        surah: 3,
        ayat: 154,
        surahNama: "Ali 'Imran",
        teksArab:
          "قُل لَّوْ كُنتُمْ فِى بُيُوتِكُمْ لَبَرَزَ ٱلَّذِينَ كُتِبَ عَلَيْهِمُ ٱلْقَتْلُ إِلَىٰ مَضَاجِعِهِمْ",
        teksIndonesia:
          "Katakanlah: 'Sekiranya kamu berada di rumahmu, niscaya orang-orang yang telah ditakdirkan akan mati terbunuh itu keluar (juga) ke tempat mereka terbunuh.'",
      },
      {
        surah: 64,
        ayat: 11,
        surahNama: "At-Taghabun",
        teksArab: "مَآ أَصَابَ مِن مُّصِيبَةٍ إِلَّا بِإِذْنِ ٱللَّهِ",
        teksIndonesia:
          "Tidak ada suatu musibah pun yang menimpa seseorang kecuali dengan izin Allah.",
      },
      {
        surah: 22,
        ayat: 11,
        surahNama: "Al-Hajj",
        teksArab: "ذَٰلِكَ هُوَ ٱلْخُسْرَانُ ٱلْمُبِينُ",
        teksIndonesia:
          "Itulah kerugian yang nyata (bagi orang yang gelisah dan berbalik dari agamanya saat diuji).",
      },
      {
        surah: 76,
        ayat: 24,
        surahNama: "Al-Insan",
        teksArab: "فَٱصْبِرْ لِحُكْمِ رَبِّكَ",
        teksIndonesia:
          "Maka bersabarlah untuk (melaksanakan) ketetapan Tuhanmu.",
      },
      {
        surah: 40,
        ayat: 60,
        surahNama: "Ghafir",
        teksArab: "ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ",
        teksIndonesia:
          "Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu.",
      },
    ],
    doa: [
      {
        judul: "Doa Saat Cemas",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
        latin:
          "Allahumma inni a'udzu bika minal hammi wal hazan, wal 'ajzi wal kasal, wal bukhli wal jubn, wa dhala'id daini wa qahrir rijal.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari kegelisahan dan kesedihan, dari kelemahan dan kemalasan, dari kekikiran dan sifat pengecut, dari lilitan utang dan tekanan orang.",
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
        arab: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ",
        latin:
          "Allahumma rahmataka arjuu, fa laa takilnii ilaa nafsii, wa ashlih lii sya'nii kullahu, laa ilaaha illaa anta.",
        arti: "Ya Allah, hanya rahmat-Mu yang aku harapkan, maka jangan Engkau serahkan aku pada diriku sendiri, perbaikilah semua urusanku, tiada Tuhan selain Engkau.",
        sumber: "HR. Abu Dawud 5090",
      },
      {
        judul: "Doa Memohon Kecukupan",
        arab: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        latin:
          "Allahummakfinii bihalaalika 'an haraamik, wa aghninii bifadhlika 'amman siwaak.",
        arti: "Ya Allah, cukupkanlah aku dengan yang halal dari-Mu sehingga terhindar dari yang haram, dan kayakanlah aku dengan karunia-Mu sehingga tidak bergantung kepada selain-Mu.",
        sumber: "HR. Tirmidzi 3563",
      },
      {
        judul: "Doa Menghilangkan Kegalauan",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
        latin:
          "Allahumma inni a'uudzu bika minal hammi wal hazan, wa a'uudzu bika minal 'ajzi wal kasal, wa a'uudzu bika minal jubni wal bukhl, wa a'uudzu bika min ghalabatid daini wa qahrir rijaal.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari kecemasan dan kesedihan; aku berlindung kepada-Mu dari kelemahan dan kemalasan; aku berlindung kepada-Mu dari sifat pengecut dan kekikiran; dan aku berlindung kepada-Mu dari terlilit utang dan tekanan orang lain.",
        sumber: "HR. Abu Dawud, dishahihkan Al-Albani",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Keluar Rumah",
        arab: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin:
          "Bismillaahi tawakkaltu 'alallaah, wa laa haula wa laa quwwata illaa billaah.",
        arti: "Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan kecuali dengan pertolongan Allah.",
        sumber: "HR. Abu Dawud 5095, Tirmidzi 3426",
      },
      {
        judul: "Doa Memohon Ketetapan Hati",
        arab: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        latin: "Yaa muqallibal quluubi tsabbit qalbii 'alaa diinik.",
        arti: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
        sumber: "HR. Tirmidzi 2140, hasan shahih",
      },
      {
        judul: "Doa Memohon Kemudahan Urusan",
        arab: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        latin:
          "Allahumma laa sahla illaa maa ja'altahu sahlan, wa anta taj'alul hazna idzaa syi'ta sahlan.",
        arti: "Ya Allah, tidak ada kemudahan kecuali yang Engkau jadikan mudah, dan Engkau bisa jadikan kesulitan itu mudah bila Engkau kehendaki.",
        sumber: "HR. Ibnu Hibban, shahih",
      },
      {
        judul: "Doa Memohon Dijauhkan dari Kegelisahan Dunia",
        arab: "اللَّهُمَّ لَا تَجْعَلِ الدُّنْيَا أَكْبَرَ هَمِّنَا وَلَا مَبْلَغَ عِلْمِنَا",
        latin:
          "Allahumma laa taj'alid dunyaa akbara hamminaa wa laa mablagha 'ilminaa.",
        arti: "Ya Allah, janganlah Engkau jadikan dunia sebagai puncak kegelisahan kami dan ujung dari ilmu kami.",
        sumber: "HR. Tirmidzi 2626, hasan",
      },
      {
        judul: "Doa Memohon Perlindungan dari Fitnah Dunia",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا، وَمِنْ فِتْنَةِ الْقَبْرِ",
        latin:
          "Allahumma inni a'uudzu bika min fitnatid dunyaa, wa min fitnatil qabr.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari fitnah dunia dan fitnah kubur.",
        sumber: "HR. Bukhari 1377, Muslim 2867",
      },
      {
        judul: "Doa Memohon Rasa Cukup",
        arab: "اللَّهُمَّ اقْنِعْنِي بِمَا رَزَقْتَنِي وَبَارِكْ لِي فِيهِ",
        latin: "Allahummaqna'nii bimaa razaqtanii wa baarik lii fiih.",
        arti: "Ya Allah, jadikanlah aku merasa cukup dengan apa yang Engkau rezekikan kepadaku, dan berkahilah aku padanya.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Ketika Dilanda Was-was",
        arab: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        latin: "A'udzu billahi minasy syaithanir rajim.",
        arti: "Aku berlindung kepada Allah dari godaan setan yang terkutuk.",
        sumber: "HR. Bukhari 3276, Muslim 2203",
      },
      {
        judul: "Doa Memohon Kekuatan Iman Menghadapi Ketidakpastian",
        arab: "رَبِّ زِدْنِى عِلْمًا",
        latin: "Rabbi zidnii 'ilman.",
        arti: "Ya Tuhanku, tambahkanlah ilmu kepadaku.",
        sumber: "QS. Ta-Ha: 114",
      },
      {
        judul: "Doa Sebelum Tidur agar Tenang dari Kecemasan",
        arab: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        latin:
          "Bismika rabbii wadha'tu janbii, wa bika arfa'uhu, in amsakta nafsii farhamhaa, wa in arsaltahaa fahfazhhaa bimaa tahfazhu bihi 'ibaadakash shaalihiin.",
        arti: "Dengan nama-Mu ya Rabb, aku meletakkan tubuhku, dan dengan nama-Mu aku mengangkatnya. Jika Engkau menahan jiwaku, maka rahmatilah dia. Dan jika Engkau melepaskannya, maka jagalah dia sebagaimana Engkau menjaga hamba-hamba-Mu yang saleh.",
        sumber: "HR. Bukhari 6320, Muslim 2714",
      },
      {
        judul: "Doa Memohon Jalan Keluar",
        arab: "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مِنْ أَمْرِهِۦ يُسْرًا",
        latin: "Wa man yattaqillaaha yaj'al lahu min amrihi yusraa.",
        arti: "Dan barangsiapa bertakwa kepada Allah, niscaya Dia akan memberikan kemudahan dalam urusannya.",
        sumber: "QS. At-Talaq: 4",
      },
      {
        judul: "Doa Memohon Kelapangan dalam Rezeki",
        arab: "اللَّهُمَّ بَارِكْ لِي فِيمَا رَزَقْتَنِي وَاخْلُفْ عَلَيَّ خَيْرًا مِنْهُ",
        latin:
          "Allahumma baarik lii fiimaa razaqtanii wakhluf 'alayya khairan minhu.",
        arti: "Ya Allah, berkahilah aku pada apa yang Engkau rezekikan kepadaku, dan gantilah untukku dengan yang lebih baik darinya.",
        sumber: "HR. Muslim 918 (makna serupa)",
      },
      {
        judul: "Doa Ketika Takut Akan Masa Depan",
        arab: "رَبِّ إِنِّي لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ",
        latin: "Rabbi innii limaa anzalta ilayya min khairin faqiir.",
        arti: "Ya Tuhanku, sesungguhnya aku sangat memerlukan sesuatu kebaikan yang Engkau turunkan kepadaku.",
        sumber: "QS. Al-Qashash: 24",
      },
      {
        judul: "Doa Meminta Dijauhkan dari Rasa Was-was Berlebihan",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ",
        latin:
          "Allahumma inni a'uudzu bika min zawaali ni'matika, wa tahawwuli 'aafiyatika, wa fujaa'ati niqmatika, wa jamii'i sakhathik.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari hilangnya nikmat-Mu, berubahnya keselamatan yang Engkau berikan, datangnya siksa-Mu secara tiba-tiba, dan segala murka-Mu.",
        sumber: "HR. Muslim 2739",
      },
      {
        judul: "Doa Memohon Kebaikan pada Setiap Keadaan",
        arab: "اللَّهُمَّ اجْعَلْ خَيْرَ عُمُرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ",
        latin:
          "Allahummaj'al khaira 'umurii aakhirahu, wa khaira 'amalii khawaatimahu.",
        arti: "Ya Allah, jadikanlah sebaik-baik umurku di penghujungnya, dan sebaik-baik amalku pada penutupnya.",
        sumber: "HR. Al-Hakim, hasan",
      },
      {
        judul: "Doa Pagi dan Petang Menghilangkan Cemas",
        arab: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
        latin:
          "Allahumma 'aafinii fii badanii, Allahumma 'aafinii fii sam'ii, Allahumma 'aafinii fii basharii.",
        arti: "Ya Allah, berilah aku keselamatan pada badanku, pendengaranku, dan penglihatanku.",
        sumber: "HR. Abu Dawud 5090, hasan",
      },
      {
        judul: "Doa Meminta Diberikan Ketenangan Batin",
        arab: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي",
        latin: "Allahumma rabban naasi adzhibil ba's, isyfi antasy syaafii.",
        arti: "Ya Allah, Rabb manusia, hilangkanlah kesulitan ini, sembuhkanlah, Engkaulah Yang Maha Menyembuhkan.",
        sumber: "HR. Bukhari 5675, Muslim 2191",
      },
      {
        judul: "Doa Ketika Merasa Tidak Berdaya",
        arab: "اللَّهُمَّ إِنِّي ضَعِيفٌ فَقَوِّنِي",
        latin: "Allahumma innii dha'iifun faqawwinii.",
        arti: "Ya Allah, sesungguhnya aku lemah, maka kuatkanlah aku.",
        sumber: "Doa ma'tsur",
      },
    ],
    hadits: [
      {
        judul: "Tawakal Seperti Burung",
        arab: "لَوْ أَنَّكُمْ تَوَكَّلْتُمْ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ، لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا",
        latin:
          "Lau annakum tawakkaltum 'alallaahi haqqa tawakkulihi, larazaqakum kamaa yarzuquth thaira, taghduu khimaashan wa taruuhu bithaanan.",
        arti: "Sungguh, seandainya kalian bertawakkal kepada Allah sebenar-benar tawakkal, niscaya kalian akan diberi rizki sebagaimana rezeki burung-burung. Mereka berangkat pagi-pagi dalam keadaan lapar, dan pulang sore hari dalam keadaan kenyang.",
        sumber: "HR. Ahmad, Tirmidzi 2344, Ibnu Majah 4164, hasan sahih",
      },
      {
        judul: "Ikat Untamu, Lalu Bertawakal",
        arab: "اعْقِلْهَا وَتَوَكَّلْ",
        latin: "'Aqilhaa wa tawakkal.",
        arti: "Ikatlah untamu, kemudian bertawakallah.",
        sumber: "HR. Tirmidzi, hasan",
      },
      {
        judul: "Allah Tergantung Prasangka Hamba-Nya",
        arab: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي",
        latin: "Anaa 'inda zhanni 'abdii bii, wa anaa ma'ahu idzaa dzakaranii.",
        arti: "Aku sesuai dengan prasangka hamba-Ku kepada-Ku, dan Aku bersamanya apabila ia mengingat-Ku.",
        sumber: "HR. Bukhari dan Muslim",
      },
      /* --- tambahan --- */
      {
        judul: "Kelapangan Setelah Kesempitan",
        arab: "وَاعْلَمْ أَنَّ النَّصْرَ مَعَ الصَّبْرِ، وَأَنَّ الْفَرَجَ مَعَ الْكَرْبِ، وَأَنَّ مَعَ الْعُسْرِ يُسْرًا",
        latin:
          "Wa'lam annan nashra ma'ash shabri, wa annal faraja ma'al karbi, wa anna ma'al 'usri yusraa.",
        arti: "Ketahuilah, sesungguhnya pertolongan itu bersama kesabaran, jalan keluar itu bersama kesempitan, dan bersama kesulitan ada kemudahan.",
        sumber: "HR. Ahmad, Tirmidzi 2516, hasan shahih",
      },
      {
        judul: "Setiap Kesulitan Ada Kemudahan",
        arab: "لَنْ يَغْلِبَ عُسْرٌ يُسْرَيْنِ",
        latin: "Lan yaghliba 'usrun yusraini.",
        arti: "Satu kesulitan tidak akan pernah mengalahkan dua kemudahan.",
        sumber: "Atsar sebagian ulama tafsir atas QS. Asy-Syarh: 5-6",
      },
      {
        judul: "Berbaik Sangka kepada Allah",
        arab: "لَا يَمُوتَنَّ أَحَدُكُمْ إِلَّا وَهُوَ يُحْسِنُ الظَّنَّ بِاللَّهِ عَزَّ وَجَلَّ",
        latin:
          "Laa yamuutanna ahadukum illaa wa huwa yuhsinuzh zhanna billaahi 'azza wa jall.",
        arti: "Janganlah salah seorang dari kalian meninggal dunia kecuali dalam keadaan berbaik sangka kepada Allah.",
        sumber: "HR. Muslim 2877",
      },
      {
        judul: "Tawakal Tidak Meniadakan Ikhtiar",
        arab: "اعْقِلْهَا وَتَوَكَّلْ",
        latin: "I'qilhaa wa tawakkal.",
        arti: "Ikatlah untamu, kemudian bertawakallah.",
        sumber: "HR. Tirmidzi 2517, hasan",
      },
      {
        judul: "Doa Orang yang Terzalimi Tidak Terhalang",
        arab: "وَاتَّقِ دَعْوَةَ الْمَظْلُومِ فَإِنَّهُ لَيْسَ بَيْنَهَا وَبَيْنَ اللَّهِ حِجَابٌ",
        latin:
          "Wattaqi da'watal mazhluumi fa innahu laisa bainahaa wa bainallaahi hijaab.",
        arti: "Takutlah terhadap doa orang yang terzalimi, karena tidak ada penghalang antara doa itu dengan Allah.",
        sumber: "HR. Bukhari 1496, Muslim 19",
      },
      {
        judul: "Allah Dekat dengan Orang yang Berdoa",
        arab: "إِنَّ رَبَّكُمْ حَيِيٌّ كَرِيمٌ، يَسْتَحْيِي مِنْ عَبْدِهِ إِذَا رَفَعَ يَدَيْهِ إِلَيْهِ أَنْ يَرُدَّهُمَا صِفْرًا",
        latin:
          "Inna rabbakum hayiyyun kariim, yastahyii min 'abdihi idzaa rafa'a yadaihi ilaihi an yaruddahumaa shifraa.",
        arti: "Sesungguhnya Tuhan kalian Maha Pemalu lagi Maha Mulia. Dia malu terhadap hamba-Nya apabila mengangkat kedua tangannya kepada-Nya, untuk mengembalikannya dalam keadaan kosong.",
        sumber: "HR. Abu Dawud 1488, Tirmidzi 3556, hasan",
      },
      {
        judul: "Allah Bersama Prasangka Hamba",
        arab: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي",
        latin: "Anaa 'inda zhanni 'abdii bii.",
        arti: "Aku sesuai dengan prasangka hamba-Ku kepada-Ku.",
        sumber: "HR. Bukhari 7405, Muslim 2675",
      },
    ],
  },

  /* ========================================================================== */
  /* SYUKUR                                                                      */
  /* ========================================================================== */
  {
    key: "syukur",
    label: "Bersyukur",
    emoji: "🌟",
    deskripsi: "Hati terasa lapang, ingin berbagi kebaikan",
    pembuka:
      "Alhamdulillah. Syukurmu adalah cahaya yang menuntun ke lebih banyak nikmat.",
    nasehat:
      'Ayat-ayat di atas menunjukkan bahwa syukur bukan sekadar ucapan, melainkan sebuah siklus: "Jika kamu bersyukur, pasti Aku akan menambah (nikmat) kepadamu" (Ibrahim: 7), "Bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat)-Ku" (Al-Baqarah: 152), dan "Barangsiapa bersyukur, sesungguhnya ia bersyukur untuk dirinya sendiri" (Luqman: 12). Perhatikan bahwa Allah tidak butuh syukur kita, kitalah yang butuh. An-Nahl: 18 mengingatkan bahwa nikmat Allah tak terhitung, dan Ad-Duha: 11 memerintahkan "terhadap nikmat Tuhanmu, hendaklah engkau menyebut-sebutnya", artinya syukur itu juga dibagikan, bukan hanya disimpan. Doa Nabi Sulaiman "Rabbi auzi\'nii an asykura ni\'matak" (Al-Ahqaf: 15) menunjukkan bahwa bahkan seorang raja yang diberi kerajaan pun masih memohon agar bisa bersyukur. Hikmahnya: syukur itu sendiri adalah nikmat yang perlu diminta, dan orang yang bersyukur tidak akan pernah kehabisan alasan untuk bersyukur.',
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
          "Dan terhadap nikmat Tuhanmu, maka hendaklah engkau menyebut-sebutnya.",
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
      {
        surah: 27,
        ayat: 19,
        surahNama: "An-Naml",
        teksArab:
          "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
        teksIndonesia:
          "Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat Engkau yang telah Engkau berikan kepadaku dan kepada ibu bapakku dan supaya aku dapat berbuat amal yang saleh yang Engkau ridhai.",
      },
      {
        surah: 16,
        ayat: 14,
        surahNama: "An-Nahl",
        teksArab:
          "فَكُلُوا۟ مِمَّا رَزَقَكُمُ ٱللَّهُ حَلَٰلًا طَيِّبًا وَٱشْكُرُوا۟ نِعْمَتَ ٱللَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ",
        teksIndonesia:
          "Maka makanlah yang halal lagi baik dari rezeki yang telah diberikan Allah kepadamu; dan syukurilah nikmat Allah, jika kamu hanya kepada-Nya saja menyembah.",
      },
      /* --- tambahan --- */
      {
        surah: 16,
        ayat: 78,
        surahNama: "An-Nahl",
        teksArab:
          "وَجَعَلَ لَكُمُ ٱلسَّمْعَ وَٱلْأَبْصَٰرَ وَٱلْأَفْـِٔدَةَ ۙ لَعَلَّكُمْ تَشْكُرُونَ",
        teksIndonesia:
          "Dan Dia memberi kamu pendengaran, penglihatan dan hati, agar kamu bersyukur.",
      },
      {
        surah: 14,
        ayat: 34,
        surahNama: "Ibrahim",
        teksArab: "وَإِن تَعُدُّوا۟ نِعْمَتَ ٱللَّهِ لَا تُحْصُوهَآ",
        teksIndonesia:
          "Dan jika kamu menghitung nikmat Allah, tidaklah kamu dapat menghitungnya.",
      },
      {
        surah: 55,
        ayat: 13,
        surahNama: "Ar-Rahman",
        teksArab: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ",
        teksIndonesia:
          "Maka nikmat Tuhan kamu yang manakah yang kamu dustakan?",
      },
      {
        surah: 7,
        ayat: 10,
        surahNama: "Al-A'raf",
        teksArab: "قَلِيلًا مَّا تَشْكُرُونَ",
        teksIndonesia: "(Tetapi) sedikit sekali kamu bersyukur.",
      },
      {
        surah: 16,
        ayat: 114,
        surahNama: "An-Nahl",
        teksArab:
          "وَٱشْكُرُوا۟ نِعْمَتَ ٱللَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ",
        teksIndonesia:
          "Dan syukurilah nikmat Allah, jika kamu hanya kepada-Nya saja menyembah.",
      },
      {
        surah: 34,
        ayat: 13,
        surahNama: "Saba'",
        teksArab:
          "ٱعْمَلُوٓا۟ ءَالَ دَاوُۥدَ شُكْرًا ۚ وَقَلِيلٌ مِّنْ عِبَادِىَ ٱلشَّكُورُ",
        teksIndonesia:
          "Bekerjalah hai keluarga Daud untuk bersyukur (kepada Allah). Dan sedikit sekali dari hamba-hamba-Ku yang berterima kasih.",
      },
      {
        surah: 76,
        ayat: 3,
        surahNama: "Al-Insan",
        teksArab:
          "إِنَّا هَدَيْنَٰهُ ٱلسَّبِيلَ إِمَّا شَاكِرًا وَإِمَّا كَفُورًا",
        teksIndonesia:
          "Sesungguhnya Kami telah menunjukinya jalan yang lurus; ada yang bersyukur dan ada pula yang kafir.",
      },
      {
        surah: 28,
        ayat: 77,
        surahNama: "Al-Qashash",
        teksArab: "وَأَحْسِن كَمَآ أَحْسَنَ ٱللَّهُ إِلَيْكَ",
        teksIndonesia:
          "Dan berbuat baiklah (kepada orang lain) sebagaimana Allah telah berbuat baik kepadamu.",
      },
      {
        surah: 3,
        ayat: 144,
        surahNama: "Ali 'Imran",
        teksArab: "وَسَيَجْزِى ٱللَّهُ ٱلشَّٰكِرِينَ",
        teksIndonesia:
          "Dan Allah akan memberi balasan kepada orang-orang yang bersyukur.",
      },
      {
        surah: 22,
        ayat: 36,
        surahNama: "Al-Hajj",
        teksArab: "كَذَٰلِكَ سَخَّرْنَٰهَا لَكُمْ لَعَلَّكُمْ تَشْكُرُونَ",
        teksIndonesia:
          "Demikianlah Kami telah menundukkannya untuk kamu, mudah-mudahan kamu bersyukur.",
      },
      {
        surah: 45,
        ayat: 12,
        surahNama: "Al-Jatsiyah",
        teksArab: "ٱللَّهُ ٱلَّذِى سَخَّرَ لَكُمُ ٱلْبَحْرَ",
        teksIndonesia: "Allah-lah yang menundukkan lautan untukmu.",
      },
      {
        surah: 31,
        ayat: 20,
        surahNama: "Luqman",
        teksArab: "وَأَسْبَغَ عَلَيْكُمْ نِعَمَهُۥ ظَٰهِرَةً وَبَاطِنَةً",
        teksIndonesia:
          "Dan telah menyempurnakan untukmu nikmat-Nya lahir dan batin.",
      },
      {
        surah: 93,
        ayat: 5,
        surahNama: "Ad-Duha",
        teksArab: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ",
        teksIndonesia:
          "Dan kelak Tuhanmu pasti memberikan karunia-Nya kepadamu, hingga engkau menjadi puas.",
      },
      {
        surah: 76,
        ayat: 22,
        surahNama: "Al-Insan",
        teksArab:
          "إِنَّ هَٰذَا كَانَ لَكُمْ جَزَآءً وَكَانَ سَعْيُكُم مَّشْكُورًا",
        teksIndonesia:
          "Sesungguhnya ini adalah balasan untukmu, dan usahamu adalah disyukuri (diberi balasan).",
      },
      {
        surah: 39,
        ayat: 66,
        surahNama: "Az-Zumar",
        teksArab: "بَلِ ٱللَّهَ فَٱعْبُدْ وَكُن مِّنَ ٱلشَّٰكِرِينَ",
        teksIndonesia:
          "Karena itu, hendaklah Allah saja kamu sembah dan hendaklah kamu termasuk orang-orang yang bersyukur.",
      },
      {
        surah: 6,
        ayat: 53,
        surahNama: "Al-An'am",
        teksArab: "أَلَيْسَ ٱللَّهُ بِأَعْلَمَ بِٱلشَّٰكِرِينَ",
        teksIndonesia:
          "Bukankah Allah lebih mengetahui tentang orang-orang yang bersyukur?",
      },
      {
        surah: 10,
        ayat: 60,
        surahNama: "Yunus",
        teksArab:
          "إِنَّ ٱللَّهَ لَذُو فَضْلٍ عَلَى ٱلنَّاسِ وَلَٰكِنَّ أَكْثَرَهُمْ لَا يَشْكُرُونَ",
        teksIndonesia:
          "Sesungguhnya Allah mempunyai karunia yang dilimpahkan atas manusia, akan tetapi kebanyakan mereka tidak bersyukur.",
      },
      {
        surah: 27,
        ayat: 40,
        surahNama: "An-Naml",
        teksArab: "وَمَن شَكَرَ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِۦ",
        teksIndonesia:
          "Dan barangsiapa yang bersyukur, maka sesungguhnya dia bersyukur untuk (kebaikan) dirinya sendiri.",
      },
    ],
    doa: [
      {
        judul: "Doa Syukur",
        arab: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        latin: "Allahumma a'inni 'ala dzikrika wa syukrika wa husni 'ibadatik.",
        arti: "Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.",
        sumber: "HR. Abu Dawud 1522",
      },
      {
        judul: "Doa Pujian Nikmat",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        latin: "Alhamdulillaahil ladzii bini'matihi tatimmush shaalihaat.",
        arti: "Segala puji bagi Allah, yang dengan nikmat-Nya segala kebaikan menjadi sempurna.",
        sumber: "HR. Ibnu Majah 3803",
      },
      {
        judul: "Doa Nabi Sulaiman",
        arab: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
        latin:
          "Rabbi auzi'nii an asykura ni'matakal latii an'amta 'alayya wa 'alaa waalidayya wa an a'mala shaalihan tardhaah.",
        arti: "Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat Engkau yang telah Engkau berikan kepadaku dan kepada ibu bapakku dan supaya aku dapat berbuat amal yang saleh yang Engkau ridhai.",
        sumber: "QS. Al-Ahqaf: 15",
      },
      {
        judul: "Doa Syukur Pagi Hari",
        arab: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ، لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ، وَلَكَ الشُّكْرُ",
        latin:
          "Allahumma ma ashbaha bi min ni'matin aw bi ahadin min khalqika fa minka wahdaka la syarika laka fa lakal hamdu wa lakasy syukru.",
        arti: "Ya Allah, nikmat apapun yang ada padaku di waktu pagi atau yang ada pada setiap makhluk-Mu, semuanya hanya dari-Mu semata, tiada sekutu bagi-Mu, bagi-Mu segala puji dan bagi-Mu segala syukur.",
        sumber: "HR. An-Nasa'i",
      },
      {
        judul: "Doa Memohon Hati yang Syukur",
        arab: "اللَّهُمَّ اجْعَلْنِي شَكُورًا وَاجْعَلْنِي صَبُورًا وَاجْعَلْنِي فِي عَيْنِي صَغِيرًا وَفِي أَعْيُنِ النَّاسِ كَبِيرًا",
        latin:
          "Allahummaj'alnii syakuuran waj'alnii shabuuran waj'alnii fii 'ainii shaghiiran wa fii a'yunin naasi kabiira.",
        arti: "Ya Allah, jadikanlah aku hamba yang bersyukur, jadikanlah aku hamba yang sabar, jadikanlah aku kecil di mataku sendiri dan besar di mata manusia.",
        sumber: "HR. IslamQA, hasan",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Setelah Makan",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        latin:
          "Alhamdulillaahil ladzii ath'amanii haadzaa, wa razaqaniihi min ghairi haulin minnii wa laa quwwah.",
        arti: "Segala puji bagi Allah yang telah memberiku makan ini, dan memberiku rezeki tanpa daya dan kekuatan dariku.",
        sumber: "HR. Abu Dawud 4023, Tirmidzi 3458",
      },
      {
        judul: "Doa Melihat Orang Ditimpa Musibah (Bersyukur atas 'Afiyah)",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا",
        latin:
          "Alhamdulillaahil ladzii 'aafaanii mimmabtalaaka bihi, wa fadhdhalanii 'alaa katsiirin mimman khalaqa tafdhiilaa.",
        arti: "Segala puji bagi Allah yang telah menyelamatkanku dari apa yang menimpamu, dan melebihkanku atas banyak makhluk yang Dia ciptakan.",
        sumber: "HR. Tirmidzi 3431, hasan",
      },
      {
        judul: "Doa Bangun Tidur",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        latin:
          "Alhamdulillaahil ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur.",
        arti: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami (tidur), dan hanya kepada-Nya kami dibangkitkan.",
        sumber: "HR. Bukhari 6312",
      },
      {
        judul: "Doa Bersyukur atas Pakaian Baru",
        arab: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ خَيْرَهُ وَخَيْرَ مَا صُنِعَ لَهُ",
        latin:
          "Allahumma lakal hamdu anta kasautaniihi, as'aluka khairahu wa khaira maa shuni'a lah.",
        arti: "Ya Allah, bagi-Mu segala puji, Engkau yang telah memberiku pakaian ini, aku memohon kebaikannya dan kebaikan yang dibuat untuknya.",
        sumber: "HR. Abu Dawud 4020, hasan",
      },
      {
        judul: "Doa Ketika Bercermin",
        arab: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
        latin: "Allahumma kamaa hassanta khalqii fahassin khuluqii.",
        arti: "Ya Allah, sebagaimana Engkau telah membaguskan penciptaanku, maka baguskanlah akhlakku.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Bersyukur atas Kesehatan",
        arab: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
        latin: "Alhamdulillaahi 'alaa kulli haal.",
        arti: "Segala puji bagi Allah dalam segala keadaan.",
        sumber: "HR. Ibnu Majah 3803",
      },
      {
        judul: "Doa Ketika Rezeki Datang",
        arab: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        latin:
          "Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaaban naar.",
        arti: "Ya Allah, berkahilah kami pada apa yang Engkau rezekikan kepada kami, dan peliharalah kami dari azab neraka.",
        sumber: "Hisnul Muslim",
      },
      {
        judul: "Doa Ketika Mendapat Kabar Baik",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَآ أَنْ هَدَىٰنَا ٱللَّهُ",
        latin:
          "Alhamdulillaahil ladzii hadaanaa lihaadzaa wa maa kunnaa linahtadiya lau laa an hadaanallaah.",
        arti: "Segala puji bagi Allah yang telah memberi petunjuk kepada kami kepada (nikmat) ini, dan kami tidak akan mendapat petunjuk kalau Allah tidak memberi kami petunjuk.",
        sumber: "QS. Al-A'raf: 43",
      },
      {
        judul: "Doa Ketika Panen / Rezeki Melimpah",
        arab: "اللَّهُمَّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ",
        latin:
          "Allahumma lakal hamdu kamaa yanbaghii lijalaali wajhika wa 'azhiimi sulthaanik.",
        arti: "Ya Allah, bagi-Mu segala puji sebagaimana layak bagi keagungan wajah-Mu dan kebesaran kekuasaan-Mu.",
        sumber: "HR. Muslim 476",
      },
      {
        judul: "Doa Bersyukur atas Anak / Keturunan",
        arab: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِى وَهَبَ لِى عَلَى ٱلْكِبَرِ إِسْمَٰعِيلَ وَإِسْحَٰقَ",
        latin:
          "Alhamdulillaahil ladzii wahaba lii 'alal kibari Ismaa'iila wa Ishaaq.",
        arti: "Segala puji bagi Allah yang telah menganugerahkan kepadaku di usia tua (dua orang putra) Ismail dan Ishak.",
        sumber: "QS. Ibrahim: 39",
      },
      {
        judul: "Doa Ketika Menerima Nikmat Baru (Hujan, Rezeki, dsb.)",
        arab: "اللَّهُمَّ صَيِّبًا نَافِعًا",
        latin: "Allahumma shayyiban naafi'aa.",
        arti: "Ya Allah, (jadikanlah ini) hujan yang bermanfaat.",
        sumber: "HR. Bukhari 1032",
      },
      {
        judul: "Doa Setelah Selesai Suatu Pekerjaan Besar",
        arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        latin:
          "Subhaanakallahumma wa bihamdika, asyhadu an laa ilaaha illaa anta, astaghfiruka wa atuubu ilaik.",
        arti: "Maha Suci Engkau ya Allah dan dengan memuji-Mu, aku bersaksi tiada Tuhan selain Engkau, aku memohon ampun dan bertaubat kepada-Mu.",
        sumber: "HR. Abu Dawud 4859, hasan shahih",
      },
      {
        judul: "Doa Bersyukur di Waktu Petang",
        arab: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        latin:
          "Allahumma maa amsaa bii min ni'matin au bi ahadin min khalqika faminka wahdaka laa syariika laka falakal hamdu wa lakasy syukr.",
        arti: "Ya Allah, nikmat apa pun yang ada padaku di waktu petang atau ada pada makhluk-Mu, semua dari-Mu semata, tiada sekutu bagi-Mu, bagi-Mu segala puji dan syukur.",
        sumber: "HR. Abu Dawud 5075, hasan",
      },
      {
        judul: "Doa Bersyukur atas Kemudahan yang Diberikan",
        arab: "سُبْحَٰنَ ٱلَّذِى سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُۥ مُقْرِنِينَ",
        latin:
          "Subhaanal ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahu muqriniin.",
        arti: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya.",
        sumber: "QS. Az-Zukhruf: 13",
      },
      {
        judul: "Doa Bersyukur atas Nikmat Islam dan Iman",
        arab: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا وَرَسُولًا",
        latin:
          "Radhiitu billaahi rabban wa bil islaami diinan wa bi Muhammadin shallallaahu 'alaihi wa sallama nabiyyan wa rasuulaa.",
        arti: "Aku ridha Allah sebagai Rabb, Islam sebagai agama, dan Muhammad shallallahu 'alaihi wa sallam sebagai Nabi dan Rasul.",
        sumber: "HR. Abu Dawud 1529, hasan",
      },
    ],
    hadits: [
      {
        judul: "Barangsiapa Bersyukur di Pagi Hari",
        arab: "مَنْ قَالَ حِينَ يُصْبِحُ: اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ، فَقَدْ أَدَّى شُكْرَ ذَلِكَ الْيَوْمَ",
        latin:
          "Man qaala hiina yushbihu: Allahumma ma ashbaha bi min ni'matin aw bi ahadin min khalqika fa minka wahdaka la syarika laka, fa lakal hamdu wa lakasy syukru, faqad addaa syukra dzaalikal yaum.",
        arti: "Barangsiapa di pagi hari membaca: 'Ya Allah, nikmat apapun yang ada padaku di waktu pagi atau yang ada pada setiap makhluk-Mu, semuanya hanya dari-Mu semata, tiada sekutu bagi-Mu, bagi-Mu segala puji dan bagi-Mu segala syukur,' maka sungguh dia telah memenuhi syukurnya pada hari itu.",
        sumber: "HR. An-Nasa'i, hasan",
      },
      {
        judul: "Nikmat yang Tidak Disyukuri",
        arab: "مَنْ لَمْ يَشْكُرِ الْقَلِيلَ لَمْ يَشْكُرِ الْكَثِيرَ",
        latin: "Man lam yasykuril qaliila lam yasykuril katsiir.",
        arti: "Barangsiapa tidak mensyukuri yang sedikit, maka dia tidak akan mensyukuri yang banyak.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Syukur Menambah Nikmat",
        arab: "لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
        latin: "La'in syakartum la aziidannakum.",
        arti: "Jika kamu bersyukur, pasti Aku akan menambah (nikmat) kepadamu.",
        sumber: "QS. Ibrahim: 7",
      },
      {
        judul: "Allah Ridha dengan Syukur",
        arab: "إِنْ تَكْفُرُوا فَإِنَّ اللَّهَ غَنِيٌّ عَنْكُمْ وَلَا يَرْضَى لِعِبَادِهِ الْكُفْرَ وَإِنْ تَشْكُرُوا يَرْضَهُ لَكُمْ",
        latin:
          "In takfuruu fa innallaaha ghaniyyun 'ankum wa laa yardhaa li 'ibaadihil kufra wa in tasykuruu yardhahu lakum.",
        arti: "Jika kamu kafir, maka sesungguhnya Allah tidak memerlukanmu, dan Dia tidak ridha kepada hamba-Nya yang kafir. Dan jika kamu bersyukur, Dia ridha kepadamu.",
        sumber: "QS. Az-Zumar: 7",
      },
      /* --- tambahan --- */
      {
        judul: "Lihatlah yang Lebih Rendah agar Bersyukur",
        arab: "انْظُرُوا إِلَى مَنْ هُوَ أَسْفَلَ مِنْكُمْ وَلَا تَنْظُرُوا إِلَى مَنْ هُوَ فَوْقَكُمْ، فَإِنَّهُ أَجْدَرُ أَنْ لَا تَزْدَرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ",
        latin:
          "Unzhuruu ilaa man huwa asfala minkum wa laa tanzhuruu ilaa man huwa fauqakum, fa innahu ajdaru allaa tazdaruu ni'matallaahi 'alaikum.",
        arti: "Lihatlah orang yang lebih rendah (dalam hal dunia) daripada kalian, dan jangan melihat orang yang lebih tinggi, karena itu lebih layak agar kalian tidak meremehkan nikmat Allah kepada kalian.",
        sumber: "HR. Bukhari 6490, Muslim 2963",
      },
      {
        judul: "Bersyukur dengan Anggota Tubuh",
        arab: "كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ",
        latin:
          "Kullu sulaamaa minan naasi 'alaihi shadaqatun kulla yaumin tathlu'u fiihisy syams.",
        arti: "Setiap ruas tulang manusia wajib bersedekah setiap hari matahari terbit (sebagai wujud syukur).",
        sumber: "HR. Bukhari 2989, Muslim 1009",
      },
      {
        judul: "Nabi ﷺ Shalat Malam hingga Bengkak Kaki karena Syukur",
        arab: "أَفَلَا أَكُونُ عَبْدًا شَكُورًا",
        latin: "Afalaa akuunu 'abdan syakuuraa.",
        arti: "Tidakkah aku ingin menjadi hamba yang bersyukur? (jawaban Nabi ﷺ saat ditanya mengapa tetap shalat malam meski dosanya telah diampuni).",
        sumber: "HR. Bukhari 4837, Muslim 2820",
      },
      {
        judul: "Dua Nikmat yang Sering Dilalaikan",
        arab: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
        latin:
          "Ni'mataani maghbuunun fiihimaa katsiirun minan naas: ash-shihhatu wal faraagh.",
        arti: "Dua nikmat yang banyak manusia tertipu (melalaikannya): kesehatan dan waktu luang.",
        sumber: "HR. Bukhari 6412",
      },
      {
        judul: "Allah Ridha Hamba yang Memuji-Nya Saat Makan dan Minum",
        arab: "إِنَّ اللَّهَ لَيَرْضَى عَنِ الْعَبْدِ أَنْ يَأْكُلَ الْأَكْلَةَ فَيَحْمَدَهُ عَلَيْهَا، أَوْ يَشْرَبَ الشَّرْبَةَ فَيَحْمَدَهُ عَلَيْهَا",
        latin:
          "Innallaaha layardhaa 'anil 'abdi an ya'kulal aklata fayahmadahu 'alaihaa, au yasyrabasy syarbata fayahmadahu 'alaihaa.",
        arti: "Sesungguhnya Allah ridha kepada seorang hamba yang makan suatu makanan lalu memuji Allah karenanya, atau minum suatu minuman lalu memuji Allah karenanya.",
        sumber: "HR. Muslim 2734",
      },
      {
        judul: "Ucapan Setelah Bersin sebagai Bentuk Syukur",
        arab: "إِذَا عَطَسَ أَحَدُكُمْ فَلْيَقُلِ الْحَمْدُ لِلَّهِ",
        latin: "Idzaa 'athasa ahadukum fal yaqulil hamdu lillaah.",
        arti: "Apabila salah seorang dari kalian bersin, hendaklah ia mengucapkan 'Alhamdulillah'.",
        sumber: "HR. Bukhari 6224",
      },
    ],
  },

  /* ========================================================================== */
  /* MARAH                                                                       */
  /* ========================================================================== */
  {
    key: "marah",
    label: "Marah",
    emoji: "🔥",
    deskripsi: "Emosi memuncak, dada terasa sesak",
    pembuka:
      "Diam sejenak. Marah adalah api, jangan biarkan membakar amal baikmu.",
    nasehat:
      'Ayat-ayat di atas semuanya berbicara tentang menahan dan memaafkan: "orang-orang yang menahan amarahnya dan memaafkan" (Ali \'Imran: 134), "siapa yang bersabar dan memaafkan, itu termasuk hal yang diutamakan" (Asy-Syura: 43), "tolaklah dengan cara yang lebih baik, maka musuhmu akan menjadi teman setia" (Fussilat: 34), "jadilah pemaaf dan berpalinglah dari orang bodoh" (Al-A\'raf: 199). Perhatikan bahwa Allah tidak melarang marah, Dia mengarahkan apa yang harus dilakukan dengan amarah itu. Bahkan An-Nur: 22 mengaitkan memaafkan dengan ampunan Allah: "Apakah kamu tidak ingin bahwa Allah mengampunimu?" Doa "A\'udzu billahi minasy syaithanir rajim" yang diajarkan Nabi ﷺ saat marah (HR. Bukhari 3282) menunjukkan bahwa akar marah itu sering dari setan, dan cara melawannya bukan dengan menuruti, tetapi dengan berlindung. Hadits "orang kuat adalah yang mengendalikan diri saat marah" (HR. Bukhari-Muslim) mengubah definisi kekuatan: bukan yang menang bergulat, tetapi yang menang atas dirinya sendiri.',
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
      {
        surah: 42,
        ayat: 37,
        surahNama: "Asy-Syura",
        teksArab: "وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ",
        teksIndonesia: "Dan apabila mereka marah, mereka memberi maaf.",
      },
      {
        surah: 3,
        ayat: 133,
        surahNama: "Ali 'Imran",
        teksArab:
          "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
        teksIndonesia:
          "Dan bersegeralah kamu kepada ampunan dari Tuhanmu dan kepada surga yang luasnya seluas langit dan bumi yang disediakan untuk orang-orang yang bertakwa.",
      },
      /* --- tambahan --- */
      {
        surah: 16,
        ayat: 126,
        surahNama: "An-Nahl",
        teksArab: "وَإِن صَبَرْتُمْ لَهُوَ خَيْرٌ لِّلصَّٰبِرِينَ",
        teksIndonesia:
          "Dan jika kamu bersabar, sesungguhnya itulah yang lebih baik bagi orang-orang yang sabar.",
      },
      {
        surah: 16,
        ayat: 90,
        surahNama: "An-Nahl",
        teksArab: "إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَٰنِ",
        teksIndonesia:
          "Sesungguhnya Allah menyuruh (kamu) berlaku adil dan berbuat kebajikan.",
      },
      {
        surah: 42,
        ayat: 40,
        surahNama: "Asy-Syura",
        teksArab:
          "وَجَزَٰٓؤُا۟ سَيِّئَةٍ سَيِّئَةٌ مِّثْلُهَا ۖ فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُۥ عَلَى ٱللَّهِ",
        teksIndonesia:
          "Balasan suatu keburukan adalah keburukan yang setimpal, tetapi barangsiapa memaafkan dan berbuat baik, maka pahalanya atas (tanggungan) Allah.",
      },
      {
        surah: 3,
        ayat: 152,
        surahNama: "Ali 'Imran",
        teksArab: "وَلَقَدْ عَفَا ٱللَّهُ عَنكُمْ",
        teksIndonesia: "Dan sesungguhnya Allah telah memaafkan kamu.",
      },
      {
        surah: 5,
        ayat: 13,
        surahNama: "Al-Ma'idah",
        teksArab:
          "فَٱعْفُ عَنْهُمْ وَٱصْفَحْ ۚ إِنَّ ٱللَّهَ يُحِبُّ ٱلْمُحْسِنِينَ",
        teksIndonesia:
          "Maka maafkanlah mereka dan biarkanlah mereka, sesungguhnya Allah menyukai orang-orang yang berbuat baik.",
      },
      {
        surah: 15,
        ayat: 85,
        surahNama: "Al-Hijr",
        teksArab: "فَٱصْفَحِ ٱلصَّفْحَ ٱلْجَمِيلَ",
        teksIndonesia: "Maka maafkanlah (mereka) dengan cara yang baik.",
      },
      {
        surah: 64,
        ayat: 14,
        surahNama: "At-Taghabun",
        teksArab:
          "وَإِن تَعْفُوا۟ وَتَصْفَحُوا۟ وَتَغْفِرُوا۟ فَإِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ",
        teksIndonesia:
          "Dan jika kamu memaafkan dan tidak memarahi serta mengampuni (mereka), maka sesungguhnya Allah Maha Pengampun lagi Maha Penyayang.",
      },
      {
        surah: 4,
        ayat: 149,
        surahNama: "An-Nisa",
        teksArab: "فَإِنَّ ٱللَّهَ كَانَ عَفُوًّا قَدِيرًا",
        teksIndonesia: "Maka sesungguhnya Allah Maha Pemaaf lagi Maha Kuasa.",
      },
      {
        surah: 49,
        ayat: 11,
        surahNama: "Al-Hujurat",
        teksArab:
          "لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰٓ أَن يَكُونُوا۟ خَيْرًا مِّنْهُمْ",
        teksIndonesia:
          "Janganlah suatu kaum mengolok-olokkan kaum yang lain, boleh jadi mereka (yang diolok-olokkan) lebih baik dari mereka (yang mengolok-olokkan).",
      },
      {
        surah: 49,
        ayat: 12,
        surahNama: "Al-Hujurat",
        teksArab: "وَلَا يَغْتَب بَّعْضُكُم بَعْضًا",
        teksIndonesia:
          "Dan janganlah sebagian kamu menggunjing sebagian yang lain.",
      },
      {
        surah: 17,
        ayat: 53,
        surahNama: "Al-Isra",
        teksArab:
          "وَقُل لِّعِبَادِى يَقُولُوا۟ ٱلَّتِى هِىَ أَحْسَنُ ۚ إِنَّ ٱلشَّيْطَٰنَ يَنزَغُ بَيْنَهُمْ",
        teksIndonesia:
          "Dan katakanlah kepada hamba-hamba-Ku: 'Hendaklah mereka mengucapkan perkataan yang lebih baik (benar), sesungguhnya setan itu menimbulkan perselisihan di antara mereka.'",
      },
      {
        surah: 23,
        ayat: 96,
        surahNama: "Al-Mu'minun",
        teksArab: "ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ ٱلسَّيِّئَةَ",
        teksIndonesia:
          "Tolaklah perbuatan buruk mereka dengan cara yang lebih baik.",
      },
      {
        surah: 41,
        ayat: 36,
        surahNama: "Fussilat",
        teksArab:
          "وَإِمَّا يَنزَغَنَّكَ مِنَ ٱلشَّيْطَٰنِ نَزْغٌ فَٱسْتَعِذْ بِٱللَّهِ",
        teksIndonesia:
          "Dan jika setan mengganggumu dengan suatu gangguan, maka mohonlah perlindungan kepada Allah.",
      },
      {
        surah: 7,
        ayat: 200,
        surahNama: "Al-A'raf",
        teksArab:
          "وَإِمَّا يَنزَغَنَّكَ مِنَ ٱلشَّيْطَٰنِ نَزْغٌ فَٱسْتَعِذْ بِٱللَّهِ ۚ إِنَّهُۥ سَمِيعٌ عَلِيمٌ",
        teksIndonesia:
          "Dan jika setan mengganggumu dengan suatu gangguan, maka berlindunglah kepada Allah. Sesungguhnya Allah Maha Mendengar lagi Maha Mengetahui.",
      },
      {
        surah: 31,
        ayat: 19,
        surahNama: "Luqman",
        teksArab: "إِنَّ أَنكَرَ ٱلْأَصْوَٰتِ لَصَوْتُ ٱلْحَمِيرِ",
        teksIndonesia:
          "Sesungguhnya seburuk-buruk suara ialah suara keledai (nasihat Luqman untuk tidak meninggikan suara).",
      },
      {
        surah: 68,
        ayat: 4,
        surahNama: "Al-Qalam",
        teksArab: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
        teksIndonesia:
          "Dan sesungguhnya engkau (Muhammad) benar-benar berbudi pekerti yang luhur.",
      },
      {
        surah: 3,
        ayat: 159,
        surahNama: "Ali 'Imran",
        teksArab:
          "وَلَوْ كُنتَ فَظًّا غَلِيظَ ٱلْقَلْبِ لَٱنفَضُّوا۟ مِنْ حَوْلِكَ",
        teksIndonesia:
          "Sekiranya kamu bersikap keras lagi berhati kasar, tentulah mereka menjauhkan diri dari sekelilingmu.",
      },
      {
        surah: 25,
        ayat: 63,
        surahNama: "Al-Furqan",
        teksArab: "وَإِذَا خَاطَبَهُمُ ٱلْجَٰهِلُونَ قَالُوا۟ سَلَٰمًا",
        teksIndonesia:
          "Dan apabila orang-orang bodoh menyapa mereka, mereka mengucapkan kata-kata (yang mengandung) keselamatan.",
      },
      {
        surah: 28,
        ayat: 55,
        surahNama: "Al-Qashash",
        teksArab: "وَإِذَا سَمِعُوا۟ ٱللَّغْوَ أَعْرَضُوا۟ عَنْهُ",
        teksIndonesia:
          "Dan apabila mereka mendengar perkataan yang tidak bermanfaat, mereka berpaling darinya.",
      },
      {
        surah: 24,
        ayat: 21,
        surahNama: "An-Nur",
        teksArab:
          "وَلَوْلَا فَضْلُ ٱللَّهِ عَلَيْكُمْ وَرَحْمَتُهُۥ مَا زَكَىٰ مِنكُم مِّنْ أَحَدٍ أَبَدًا",
        teksIndonesia:
          "Kalau tidaklah karena karunia Allah dan rahmat-Nya kepadamu, niscaya tidak seorang pun dari kamu bersih (dari perbuatan keji dan mungkar) selama-lamanya.",
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
        arti: "Ya Allah, Zat yang membolak-balikkan hati, palingkanlah hati kami untuk taat kepada-Mu.",
        sumber: "HR. Muslim 2654",
      },
      {
        judul: "Doa Menghilangkan Amarah",
        arab: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي، وَأَذْهِبْ غَيْظَ قَلْبِي، وَأَجِرْنِي مِنَ الشَّيْطَانِ",
        latin:
          "Allahummaghfir lii dzanbii, wa adzhib ghaizha qalbii, wa ajirnii minasy syaithaan.",
        arti: "Ya Allah, ampunilah dosaku, hilangkanlah amarah dari hatiku, dan lindungilah aku dari setan.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Nabi untuk Ketenangan Jiwa",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً، تُؤْمِنُ بِلِقَائِكَ، وَتَرْضَى بِقَضَائِكَ، وَتَقْنَعُ بِعَطَائِكَ",
        latin:
          "Allahumma inni as'aluka nafsan bika muthma'innah, tu'minu biliqaa'ika, wa tardhaa biqadhaa'ika, wa taqna'u bi'athaa'ika.",
        arti: "Ya Allah, aku memohon kepada-Mu jiwa yang merasa tenang kepada-Mu, yang yakin akan bertemu dengan-Mu, yang ridha dengan ketetapan-Mu, dan yang merasa cukup dengan pemberian-Mu.",
        sumber: "HR. Thabrani, hasan",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Ketika Ada yang Menyakiti Hati",
        arab: "اللَّهُمَّ اغْفِرْ لِقَوْمِي فَإِنَّهُمْ لَا يَعْلَمُونَ",
        latin: "Allahummaghfir liqaumii fa innahum laa ya'lamuun.",
        arti: "Ya Allah, ampunilah kaumku, karena sesungguhnya mereka tidak mengetahui.",
        sumber: "HR. Bukhari 3477, Muslim 1792",
      },
      {
        judul: "Doa Nabi Ketika Disakiti di Thaif",
        arab: "اللَّهُمَّ إِلَيْكَ أَشْكُو ضَعْفَ قُوَّتِي، وَقِلَّةَ حِيلَتِي، وَهَوَانِي عَلَى النَّاسِ",
        latin:
          "Allahumma ilaika asykuu dha'fa quwwatii, wa qillata hiilatii, wa hawaanii 'alan naas.",
        arti: "Ya Allah, kepada-Mu aku mengadukan kelemahan kekuatanku, sedikitnya dayaku, dan kehinaanku di hadapan manusia.",
        sumber: "HR. Ibnu Hisyam (sirah), hasan",
      },
      {
        judul: "Doa Memohon Akhlak yang Baik",
        arab: "اللَّهُمَّ اهْدِنِي لِأَحْسَنِ الْأَخْلَاقِ، لَا يَهْدِي لِأَحْسَنِهَا إِلَّا أَنْتَ، وَاصْرِفْ عَنِّي سَيِّئَهَا",
        latin:
          "Allahummahdinii li ahsanil akhlaaq, laa yahdii li ahsanihaa illaa anta, washrif 'annii sayyi'ahaa.",
        arti: "Ya Allah, tunjukilah aku kepada akhlak yang paling baik, tidak ada yang bisa menunjukkannya kecuali Engkau, dan jauhkanlah dariku akhlak yang buruk.",
        sumber: "HR. Muslim 771",
      },
      {
        judul: "Doa Memohon Dilindungi dari Amarah",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ",
        latin: "Allahumma inni a'uudzu bika min jahdil balaa'.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari beratnya ujian.",
        sumber: "HR. Bukhari 6347, Muslim 2707",
      },
      {
        judul: "Doa Memohon Kesabaran Menghadapi Orang Lain",
        arab: "رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى وَٱحْلُلْ عُقْدَةً مِّن لِّسَانِى يَفْقَهُوا۟ قَوْلِى",
        latin:
          "Rabbisyrah lii shadrii wa yassir lii amrii wahlul 'uqdatan min lisaanii yafqahuu qaulii.",
        arti: "Ya Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku, supaya mereka mengerti perkataanku.",
        sumber: "QS. Ta-Ha: 25-28",
      },
      {
        judul: "Doa Agar Terhindar dari Perpecahan",
        arab: "رَبَّنَآ ٱغْفِرْ لَنَا وَلِإِخْوَٰنِنَا ٱلَّذِينَ سَبَقُونَا بِٱلْإِيمَٰنِ وَلَا تَجْعَلْ فِى قُلُوبِنَا غِلًّا لِّلَّذِينَ ءَامَنُوا۟",
        latin:
          "Rabbanaghfir lanaa wa li ikhwaaninal ladziina sabaquunaa bil iimaani wa laa taj'al fii quluubinaa ghillan lilladziina aamanuu.",
        arti: "Ya Tuhan kami, ampunilah kami dan saudara-saudara kami yang telah beriman lebih dahulu dari kami, dan janganlah Engkau jadikan dalam hati kami kedengkian terhadap orang-orang yang beriman.",
        sumber: "QS. Al-Hasyr: 10",
      },
      {
        judul: "Doa Memohon Hati yang Lembut",
        arab: "اللَّهُمَّ لَيِّنْ قَلْبِي، وَأَذْهِبْ غِلَّهُ وَغَيْظَهُ",
        latin: "Allahumma layyin qalbii, wa adzhib ghillahu wa ghaizhah.",
        arti: "Ya Allah, lembutkanlah hatiku, dan hilangkanlah kedengkian dan amarahnya.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Memohon Ampunan Setelah Marah",
        arab: "رَبِّ ٱغْفِرْ وَٱرْحَمْ وَأَنتَ خَيْرُ ٱلرَّٰحِمِينَ",
        latin: "Rabbighfir warham wa anta khairur raahimiin.",
        arti: "Ya Tuhanku, ampunilah dan sayangilah, Engkaulah sebaik-baik penyayang.",
        sumber: "QS. Al-Mu'minun: 118",
      },
      {
        judul: "Doa Memohon Perdamaian Hati Antar Sesama",
        arab: "وَأَلَّفَ بَيْنَ قُلُوبِهِمْ ۚ لَوْ أَنفَقْتَ مَا فِى ٱلْأَرْضِ جَمِيعًا مَّآ أَلَّفْتَ بَيْنَ قُلُوبِهِمْ وَلَٰكِنَّ ٱللَّهَ أَلَّفَ بَيْنَهُمْ",
        latin:
          "Wa allafa baina quluubihim, lau anfaqta maa fil ardhi jamii'an maa allafta baina quluubihim wa laakinnallaaha allafa bainahum.",
        arti: "Dan Allah mempersatukan hati mereka. Walaupun kamu membelanjakan semua (kekayaan) yang ada di bumi, niscaya kamu tidak dapat mempersatukan hati mereka, akan tetapi Allah telah mempersatukan hati mereka.",
        sumber: "QS. Al-Anfal: 63",
      },
      {
        judul: "Doa Sebelum Memaafkan",
        arab: "رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا",
        latin: "Rabbanaa laa tu'aakhidznaa in nasiinaa au akhtha'naa.",
        arti: "Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau tersalah.",
        sumber: "QS. Al-Baqarah: 286",
      },
      {
        judul: "Doa Memohon Ketenangan Setelah Bertengkar",
        arab: "اللَّهُمَّ أَصْلِحْ ذَاتَ بَيْنِنَا",
        latin: "Allahumma ashlih dzaata baininaa.",
        arti: "Ya Allah, perbaikilah hubungan di antara kami.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Berlindung dari Buruknya Akhlak",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ مُنْكَرَاتِ الْأَخْلَاقِ وَالْأَعْمَالِ وَالْأَهْوَاءِ",
        latin:
          "Allahumma inni a'uudzu bika min munkaraatil akhlaaqi wal a'maali wal ahwaa'.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari akhlak, amal, dan hawa nafsu yang buruk.",
        sumber: "HR. Tirmidzi 3591, hasan",
      },
      {
        judul: "Doa Memohon Kesatuan Umat",
        arab: "وَٱعْتَصِمُوا۟ بِحَبْلِ ٱللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا۟",
        latin: "Wa'tashimuu bihablillaahi jamii'an wa laa tafarraquu.",
        arti: "Dan berpeganglah kamu semuanya pada tali (agama) Allah, dan janganlah kamu bercerai berai.",
        sumber: "QS. Ali 'Imran: 103",
      },
      {
        judul: "Doa Memohon Ampun atas Kata-kata yang Terucap Saat Marah",
        arab: "رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَٰسِرِينَ",
        latin:
          "Rabbanaa zhalamnaa anfusanaa wa in lam taghfir lanaa wa tarhamnaa lanakuunanna minal khaasiriin.",
        arti: "Ya Tuhan kami, kami telah menzalimi diri kami sendiri, jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya kami termasuk orang-orang yang merugi.",
        sumber: "QS. Al-A'raf: 23",
      },
      {
        judul: "Doa Memohon Dijauhkan dari Perkataan yang Menyakiti",
        arab: "رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ",
        latin: "Rabbi najjinii minal qaumizh zhaalimiin.",
        arti: "Ya Tuhanku, selamatkanlah aku dari orang-orang yang zalim.",
        sumber: "QS. Al-Qashash: 21",
      },
    ],
    hadits: [
      {
        judul: "Jangan Marah",
        arab: "لَا تَغْضَبْ",
        latin: "Laa taghdhab.",
        arti: "Jangan marah.",
        sumber: "HR. Bukhari",
      },
      {
        judul: "Orang Kuat yang Sebenarnya",
        arab: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
        latin:
          "Laisasy syadiidu bish shura'ah, innamas syadiidul ladzii yamliku nafsahu 'indal ghadhab.",
        arti: "Orang yang kuat bukanlah yang jago dalam bergulat, tetapi orang kuat adalah orang yang dapat mengendalikan dirinya ketika marah.",
        sumber: "HR. Bukhari dan Muslim",
      },
      {
        judul: "Keutamaan Menahan Amarah",
        arab: "وَمَنْ كَظَمَ غَيْظَهُ، وَلَوْ شَاءَ أَنْ يُمْضِيَهُ أَمْضَاهُ، مَلأَ اللَّهُ عَزَّ وَجَلَّ قَلْبَهُ أَمْنًا يَوْمَ الْقِيَامَةِ",
        latin:
          "Wa man kazhama ghaizhahu, wa lau syaa'a an yumdhiyahu amdhaahu, mala'allahu 'azza wa jalla qalbahu amnan yaumal qiyaamah.",
        arti: "Siapa yang menahan amarahnya padahal ia mampu melakukannya, Allah 'azza wa jalla akan memenuhi hatinya dengan rasa aman pada hari kiamat.",
        sumber: "HR. Ibnu Asakir, hasan",
      },
      {
        judul: "Marah adalah Awal Keburukan",
        arab: "فَإِنَّ الْغَضَبَ يَجْمَعُ الشَّرَّ كُلَّهُ",
        latin: "Fa innal ghadhaba yajma'usy syarra kullah.",
        arti: "Sesungguhnya marah itu mengumpulkan segala keburukan.",
        sumber: "Muttafaqun 'alaih",
      },
      {
        judul: "Jika Marah, Diamlah",
        arab: "إِذَا غَضِبَ أَحَدُكُمْ فَلْيَسْكُتْ",
        latin: "Idzaa ghadhiba ahadukum fal yaskut.",
        arti: "Apabila salah seorang dari kalian marah, hendaklah ia diam.",
        sumber: "HR. Ahmad dan Bukhari",
      },
      /* --- tambahan --- */
      {
        judul: "Wasiat Nabi: Jangan Marah",
        arab: "أَوْصِنِي، قَالَ: لَا تَغْضَبْ، فَرَدَّدَ مِرَارًا، قَالَ: لَا تَغْضَبْ",
        latin:
          "Aushinii, qaala: laa taghdhab, faraddada miraaran, qaala: laa taghdhab.",
        arti: "'Berilah aku wasiat,' Nabi ﷺ bersabda: 'Jangan marah.' Orang itu mengulangi permintaannya berkali-kali, Nabi ﷺ tetap bersabda: 'Jangan marah.'",
        sumber: "HR. Bukhari 6116",
      },
      {
        judul: "Wudhu Meredakan Amarah",
        arab: "إِنَّ الْغَضَبَ مِنَ الشَّيْطَانِ، وَإِنَّ الشَّيْطَانَ خُلِقَ مِنَ النَّارِ، وَإِنَّمَا تُطْفَأُ النَّارُ بِالْمَاءِ، فَإِذَا غَضِبَ أَحَدُكُمْ فَلْيَتَوَضَّأْ",
        latin:
          "Innal ghadhaba minasy syaithaani, wa innasy syaithaana khuliqa minan naari, wa innamaa tuthfa'un naaru bil maa'i, fa idzaa ghadhiba ahadukum fal yatawadhdha'.",
        arti: "Sesungguhnya marah itu dari setan, dan setan diciptakan dari api, dan api hanya dipadamkan dengan air. Maka apabila salah seorang di antara kalian marah, hendaklah ia berwudhu.",
        sumber: "HR. Abu Dawud 4784, hasan",
      },
      {
        judul: "Ubahlah Posisi Ketika Marah",
        arab: "إِذَا غَضِبَ أَحَدُكُمْ وَهُوَ قَائِمٌ فَلْيَجْلِسْ، فَإِنْ ذَهَبَ عَنْهُ الْغَضَبُ وَإِلَّا فَلْيَضْطَجِعْ",
        latin:
          "Idzaa ghadhiba ahadukum wa huwa qaa'imun fal yajlis, fa in dzahaba 'anhul ghadhabu wa illaa fal yadhthaji'.",
        arti: "Apabila salah seorang di antara kalian marah dalam keadaan berdiri, hendaklah ia duduk. Jika amarahnya hilang (maka baik), jika tidak, hendaklah ia berbaring.",
        sumber: "HR. Abu Dawud 4782, hasan",
      },
      {
        judul: "Larangan Bertengkar Lebih dari Tiga Hari",
        arab: "لَا يَحِلُّ لِمُسْلِمٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلَاثِ لَيَالٍ",
        latin:
          "Laa yahillu limuslimin an yahjura akhaahu fauqa tsalaatsi layaal.",
        arti: "Tidak halal bagi seorang muslim mendiamkan saudaranya lebih dari tiga malam.",
        sumber: "HR. Bukhari 6076, Muslim 2560",
      },
      {
        judul: "Rasulullah Tidak Pernah Membalas untuk Dirinya Sendiri",
        arab: "مَا خُيِّرَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ بَيْنَ أَمْرَيْنِ إِلَّا اخْتَارَ أَيْسَرَهُمَا، وَمَا انْتَقَمَ لِنَفْسِهِ قَطُّ",
        latin:
          "Maa khuyyira rasuulullaahi shallallaahu 'alaihi wa sallama baina amraini illakhtaara aisarahumaa, wa maantaqama linafsihi qaththu.",
        arti: "Rasulullah ﷺ tidak pernah diberi pilihan antara dua perkara kecuali beliau memilih yang paling mudah, dan beliau tidak pernah membalas dendam untuk dirinya sendiri.",
        sumber: "HR. Bukhari 3560, Muslim 2327",
      },
      {
        judul: "Larangan Saling Membenci",
        arab: "لَا تَبَاغَضُوا، وَلَا تَحَاسَدُوا، وَلَا تَدَابَرُوا، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا",
        latin:
          "Laa tabaaghadhuu, wa laa tahaasaduu, wa laa tadaabaruu, wa kuunuu 'ibaadallaahi ikhwaanaa.",
        arti: "Janganlah kalian saling membenci, saling mendengki, saling membelakangi, dan jadilah kalian hamba-hamba Allah yang bersaudara.",
        sumber: "HR. Bukhari 6065, Muslim 2559",
      },
      {
        judul: "Senyum adalah Sedekah yang Meredakan Ketegangan",
        arab: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
        latin: "Tabassumuka fii wajhi akhiika laka shadaqah.",
        arti: "Senyummu di hadapan saudaramu adalah sedekah bagimu.",
        sumber: "HR. Tirmidzi 1956, hasan",
      },
    ],
  },

  /* ========================================================================== */
  /* LELAH                                                                       */
  /* ========================================================================== */
  {
    key: "lelah",
    label: "Lelah",
    emoji: "🥱",
    deskripsi: "Fisik dan hati capek, ingin rehat dari dunia",
    pembuka:
      "Istirahatlah. Bahkan Rasulullah ﷺ pun butuh waktu untuk dirinya sendiri.",
    nasehat:
      'Ayat-ayat di atas mengajarkan bahwa istirahat itu bagian dari desain Allah: "Kami jadikan tidurmu untuk istirahat" (An-Naba: 9), "Kami jadikan malam dan siang supaya kamu beristirahat" (Al-Qashash: 73). Bahkan perintah tahajud pun disebut "nafilah", ibadah tambahan, bukan beban yang memaksa (Al-Isra: 79). Ayat "bersama kesulitan ada kemudahan" diulang dua kali (Asy-Syarh: 5-6), seolah menegaskan bahwa kelegaan itu pasti datang, dan "Kami tinggikan sebutan namamu" (Asy-Syarh: 4) mengingatkan bahwa lelahmu dalam kebaikan tidak akan sia-sia. Nabi ﷺ menegur Abdullah bin Amr yang shalat terus-menerus: "Sesungguhnya tubuhmu punya hak atas dirimu" (HR. Bukhari 1975). Doa "Allahumma inni a\'udzu bika minal \'ajzi wal kasal" (HR. Bukhari 6367) bukan untuk orang malas, tetapi untuk orang yang lelah dan ingin tetap kuat. Hikmahnya: rehatlah dengan niat yang benar, karena tidurmu bisa menjadi ibadah jika kau niatkan untuk bangkit kembali.',
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
      {
        surah: 28,
        ayat: 73,
        surahNama: "Al-Qashash",
        teksArab:
          "وَمِن رَّحْمَتِهِۦ جَعَلَ لَكُمُ ٱلَّيْلَ وَٱلنَّهَارَ لِتَسْكُنُوا۟ فِيهِ وَلِتَبْتَغُوا۟ مِن فَضْلِهِۦ وَلَعَلَّكُمْ تَشْكُرُونَ",
        teksIndonesia:
          "Dan karena rahmat-Nya, Dia jadikan untukmu malam dan siang, supaya kamu beristirahat pada malam hari dan supaya kamu mencari sebagian dari karunia-Nya (pada siang hari) dan agar kamu bersyukur kepada-Nya.",
      },
      {
        surah: 17,
        ayat: 79,
        surahNama: "Al-Isra",
        teksArab:
          "وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ عَسَىٰ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا",
        teksIndonesia:
          "Dan pada sebagian malam hari, bertahajudlah kamu sebagai suatu ibadah tambahan bagimu; mudah-mudahan Tuhanmu mengangkat kamu ke tempat yang terpuji.",
      },
      /* --- tambahan --- */
      {
        surah: 30,
        ayat: 23,
        surahNama: "Ar-Rum",
        teksArab: "وَمِنْ ءَايَٰتِهِۦ مَنَامُكُم بِٱلَّيْلِ وَٱلنَّهَارِ",
        teksIndonesia:
          "Dan di antara tanda-tanda kekuasaan-Nya ialah tidurmu di waktu malam dan siang.",
      },
      {
        surah: 25,
        ayat: 47,
        surahNama: "Al-Furqan",
        teksArab:
          "وَهُوَ ٱلَّذِى جَعَلَ لَكُمُ ٱلَّيْلَ لِبَاسًا وَٱلنَّوْمَ سُبَاتًا",
        teksIndonesia:
          "Dialah yang menjadikan untukmu malam (sebagai) pakaian, dan tidur untuk istirahat.",
      },
      {
        surah: 6,
        ayat: 96,
        surahNama: "Al-An'am",
        teksArab: "وَجَعَلَ ٱلَّيْلَ سَكَنًا",
        teksIndonesia: "Dan Dia menjadikan malam untuk beristirahat.",
      },
      {
        surah: 40,
        ayat: 61,
        surahNama: "Ghafir",
        teksArab:
          "وَجَعَلَ ٱلَّيْلَ لِتَسْكُنُوا۟ فِيهِ وَٱلنَّهَارَ مُبْصِرًا",
        teksIndonesia:
          "Dan Dia menjadikan malam untukmu supaya kamu beristirahat padanya, dan menjadikan siang terang benderang.",
      },
      {
        surah: 20,
        ayat: 2,
        surahNama: "Ta-Ha",
        teksArab: "مَآ أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰٓ",
        teksIndonesia:
          "Kami tidak menurunkan Al-Qur'an ini kepadamu agar kamu menjadi susah.",
      },
      {
        surah: 2,
        ayat: 185,
        surahNama: "Al-Baqarah",
        teksArab:
          "يُرِيدُ ٱللَّهُ بِكُمُ ٱلْيُسْرَ وَلَا يُرِيدُ بِكُمُ ٱلْعُسْرَ",
        teksIndonesia:
          "Allah menghendaki kemudahan bagimu, dan tidak menghendaki kesukaran bagimu.",
      },
      {
        surah: 22,
        ayat: 78,
        surahNama: "Al-Hajj",
        teksArab: "وَمَا جَعَلَ عَلَيْكُمْ فِى ٱلدِّينِ مِنْ حَرَجٍ",
        teksIndonesia:
          "Dan Dia tidak menjadikan kesempitan untukmu dalam agama.",
      },
      {
        surah: 65,
        ayat: 7,
        surahNama: "At-Talaq",
        teksArab:
          "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّآ مَآ ءَاتَىٰهَا ۚ سَيَجْعَلُ ٱللَّهُ بَعْدَ عُسْرٍ يُسْرًا",
        teksIndonesia:
          "Allah tidak memikulkan beban kepada seseorang melainkan sekedar apa yang Allah berikan kepadanya. Allah kelak akan memberikan kelapangan setelah kesempitan.",
      },
      {
        surah: 51,
        ayat: 56,
        surahNama: "Adz-Dzariyat",
        teksArab: "وَمَا خَلَقْتُ ٱلْجِنَّ وَٱلْإِنسَ إِلَّا لِيَعْبُدُونِ",
        teksIndonesia:
          "Dan aku tidak menciptakan jin dan manusia melainkan supaya mereka beribadah kepada-Ku.",
      },
      {
        surah: 76,
        ayat: 26,
        surahNama: "Al-Insan",
        teksArab:
          "وَمِنَ ٱلَّيْلِ فَٱسْجُدْ لَهُۥ وَسَبِّحْهُ لَيْلًا طَوِيلًا",
        teksIndonesia:
          "Dan pada sebagian dari malam, sujudlah kepada-Nya dan bertasbihlah kepada-Nya pada bagian yang panjang di malam hari.",
      },
      {
        surah: 3,
        ayat: 17,
        surahNama: "Ali 'Imran",
        teksArab: "وَٱلْمُسْتَغْفِرِينَ بِٱلْأَسْحَارِ",
        teksIndonesia: "Dan orang-orang yang memohon ampun di waktu sahur.",
      },
      {
        surah: 73,
        ayat: 20,
        surahNama: "Al-Muzzammil",
        teksArab:
          "عَلِمَ أَن لَّن تُحْصُوهُ فَتَابَ عَلَيْكُمْ ۖ فَٱقْرَءُوا۟ مَا تَيَسَّرَ مِنَ ٱلْقُرْءَانِ",
        teksIndonesia:
          "Dia mengetahui bahwa kamu sekali-kali tidak dapat menentukan batas-batas waktu itu, maka Dia memberi keringanan kepadamu, karena itu bacalah apa yang mudah (bagimu) dari Al-Qur'an.",
      },
      {
        surah: 62,
        ayat: 10,
        surahNama: "Al-Jumu'ah",
        teksArab:
          "فَإِذَا قُضِيَتِ ٱلصَّلَوٰةُ فَٱنتَشِرُوا۟ فِى ٱلْأَرْضِ وَٱبْتَغُوا۟ مِن فَضْلِ ٱللَّهِ",
        teksIndonesia:
          "Apabila telah ditunaikan shalat, maka bertebaranlah kamu di muka bumi; dan carilah karunia Allah.",
      },
      {
        surah: 5,
        ayat: 6,
        surahNama: "Al-Ma'idah",
        teksArab: "مَا يُرِيدُ ٱللَّهُ لِيَجْعَلَ عَلَيْكُم مِّنْ حَرَجٍ",
        teksIndonesia: "Allah tidak hendak menyulitkan kamu.",
      },
      {
        surah: 94,
        ayat: 2,
        surahNama: "Asy-Syarh",
        teksArab: "وَوَضَعْنَا عَنكَ وِزْرَكَ",
        teksIndonesia: "Dan Kami telah menurunkan dari padamu bebanmu.",
      },
      {
        surah: 94,
        ayat: 3,
        surahNama: "Asy-Syarh",
        teksArab: "ٱلَّذِىٓ أَنقَضَ ظَهْرَكَ",
        teksIndonesia: "Yang memberatkan punggungmu.",
      },
      {
        surah: 94,
        ayat: 7,
        surahNama: "Asy-Syarh",
        teksArab: "فَإِذَا فَرَغْتَ فَٱنصَبْ",
        teksIndonesia:
          "Maka apabila kamu telah selesai (dari sesuatu urusan), kerjakanlah dengan sungguh-sungguh (urusan) yang lain.",
      },
      {
        surah: 94,
        ayat: 8,
        surahNama: "Asy-Syarh",
        teksArab: "وَإِلَىٰ رَبِّكَ فَٱرْغَب",
        teksIndonesia: "Dan hanya kepada Tuhanmulah hendaknya kamu berharap.",
      },
      {
        surah: 18,
        ayat: 28,
        surahNama: "Al-Kahf",
        teksArab:
          "وَٱصْبِرْ نَفْسَكَ مَعَ ٱلَّذِينَ يَدْعُونَ رَبَّهُم بِٱلْغَدَوٰةِ وَٱلْعَشِىِّ",
        teksIndonesia:
          "Dan bersabarlah kamu bersama-sama dengan orang-orang yang menyeru Tuhannya di pagi dan senja hari.",
      },
      {
        surah: 2,
        ayat: 233,
        surahNama: "Al-Baqarah",
        teksArab: "لَا تُكَلَّفُ نَفْسٌ إِلَّا وُسْعَهَا",
        teksIndonesia:
          "Seseorang tidak dibebani melainkan menurut kadar kesanggupannya.",
      },
    ],
    doa: [
      {
        judul: "Doa Saat Lelah",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        latin: "Allahumma inni as'alukal 'afiyata fid dunya wal akhirah.",
        arti: "Ya Allah, aku memohon kepada-Mu kesehatan dan keselamatan di dunia dan akhirat.",
        sumber: "HR. Abu Dawud 5074",
      },
      {
        judul: "Doa Memohon Kekuatan",
        arab: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin: "Laa haula wa laa quwwata illaa billaah.",
        arti: "Tidak ada daya dan tidak ada kekuatan kecuali dengan pertolongan Allah.",
        sumber: "HR. Bukhari 6384",
      },
      {
        judul: "Doa Berlindung dari Kelemahan",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        latin: "Allahumma inni a'udzu bika minal 'ajzi wal kasal.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari kelemahan dan kemalasan.",
        sumber: "HR. Bukhari 6367",
      },
      {
        judul: "Doa Memohon Kesehatan dan Kekuatan",
        arab: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
        latin:
          "Allahumma 'aafinii fii badanii, Allahumma 'aafinii fii sam'ii, Allahumma 'aafinii fii basharii, laa ilaaha illaa anta.",
        arti: "Ya Allah, sehatkanlah badanku. Ya Allah, sehatkanlah pendengaranku. Ya Allah, sehatkanlah penglihatanku. Tiada Tuhan selain Engkau.",
        sumber: "HR. Abu Dawud 5090, hasan",
      },
      {
        judul: "Doa Nabi Ketika Kelelahan",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْهَرَمِ، وَالْبُخْلِ وَالْغَفْلَةِ، وَالْقَسْوَةِ وَالذِّلَّةِ وَالْمَسْكَنَةِ",
        latin:
          "Allahumma inni a'uudzu bika minal 'ajzi wal kasal, wal jubni wal haram, wal bukhli wal ghaflah, wal qaswati wadz dzillati wal maskanah.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari kelemahan dan kemalasan, dari sifat pengecut dan pikun, dari kekikiran dan kelalaian, dari kerasnya hati, kehinaan, dan kemiskinan.",
        sumber: "HR. Abu Dawud 1546, hasan",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Sebelum Tidur",
        arab: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        latin: "Bismikallahumma amuutu wa ahyaa.",
        arti: "Dengan nama-Mu ya Allah, aku mati dan aku hidup (tidur dan bangun).",
        sumber: "HR. Bukhari 6324",
      },
      {
        judul: "Doa Memohon Kekuatan Beribadah",
        arab: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        latin:
          "Allahumma a'inni 'alaa dzikrika wa syukrika wa husni 'ibaadatik.",
        arti: "Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.",
        sumber: "HR. Abu Dawud 1522",
      },
      {
        judul: "Doa Memohon Kekuatan Fisik dan Semangat",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْقُوَّةَ فِي طَاعَتِكَ",
        latin: "Allahumma inni as'alukal quwwata fii thaa'atik.",
        arti: "Ya Allah, aku memohon kepada-Mu kekuatan dalam menaati-Mu.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Ketika Terjaga di Malam Hari",
        arab: "لَا إِلَٰهَ إِلَّا اللَّهُ الْوَاحِدُ الْقَهَّارُ، رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الْعَزِيزُ الْغَفَّارُ",
        latin:
          "Laa ilaaha illallaahul waahidul qahhaar, rabbus samaawaati wal ardhi wa maa bainahumal 'aziizul ghaffaar.",
        arti: "Tiada Tuhan selain Allah Yang Maha Esa lagi Maha Perkasa, Tuhan langit dan bumi dan apa yang ada di antara keduanya, Yang Maha Perkasa lagi Maha Pengampun.",
        sumber: "HR. Ibnu Hibban, shahih",
      },
      {
        judul: "Doa Memohon Waktu yang Berkah",
        arab: "اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا",
        latin: "Allahumma baarik li ummatii fii bukuurihaa.",
        arti: "Ya Allah, berkahilah umatku pada (aktivitas) pagi harinya.",
        sumber: "HR. Abu Dawud 2606, Tirmidzi 1212, hasan",
      },
      {
        judul: "Doa Ketika Lelah Bekerja",
        arab: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
        latin: "Laa haula wa laa quwwata illaa billaahil 'aliyyil 'azhiim.",
        arti: "Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.",
        sumber: "HR. Bukhari 4205, Muslim 2704",
      },
      {
        judul: "Doa Memohon Diberi Waktu Istirahat yang Berkah",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الرَّاحَةَ عِنْدَ الْمَوْتِ وَالْعَفْوَ عِنْدَ الْحِسَابِ",
        latin:
          "Allahumma inni as'alukar raahata 'indal mauti wal 'afwa 'indal hisaab.",
        arti: "Ya Allah, aku memohon kepada-Mu ketenangan saat kematian, dan ampunan saat hisab.",
        sumber: "HR. Tirmidzi 3407, hasan",
      },
      {
        judul: "Doa Memohon Perlindungan dari Kemalasan",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكَسَلِ وَالْهَرَمِ",
        latin: "Allahumma inni a'uudzu bika minal kasali wal haram.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari kemalasan dan kepikunan.",
        sumber: "HR. Muslim 2706",
      },
      {
        judul: "Doa Memohon Kemudahan Bangun untuk Beribadah",
        arab: "اللَّهُمَّ أَعِنِّي وَلَا تُعِنْ عَلَيَّ",
        latin: "Allahumma a'inni wa laa tu'in 'alayya.",
        arti: "Ya Allah, tolonglah aku dan janganlah menolong (siapa pun) untuk melawanku.",
        sumber: "HR. Tirmidzi 3551, hasan",
      },
      {
        judul: "Doa Memohon Kelapangan Waktu",
        arab: "اللَّهُمَّ بَارِكْ لَنَا فِي وَقْتِنَا",
        latin: "Allahumma baarik lanaa fii waqtinaa.",
        arti: "Ya Allah, berkahilah waktu kami.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Memohon Ditolong Mengerjakan Kebaikan Meski Lelah",
        arab: "رَبَّنَا لَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ",
        latin: "Rabbanaa laa tuhammilnaa maa laa thaaqata lanaa bih.",
        arti: "Ya Tuhan kami, janganlah Engkau pikulkan kepada kami apa yang tak sanggup kami memikulnya.",
        sumber: "QS. Al-Baqarah: 286",
      },
      {
        judul: "Doa Memohon Penjagaan Selama Istirahat",
        arab: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        latin: "Allahumma qinii 'adzaabaka yauma tab'atsu 'ibaadak.",
        arti: "Ya Allah, jagalah aku dari azab-Mu pada hari Engkau membangkitkan hamba-hamba-Mu.",
        sumber: "HR. Abu Dawud 5045, Tirmidzi 3399",
      },
      {
        judul: "Doa Memohon Semangat Baru",
        arab: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا",
        latin: "Allahummaj'al fii qalbii nuuran.",
        arti: "Ya Allah, jadikanlah cahaya di dalam hatiku.",
        sumber: "HR. Bukhari 6316, Muslim 763",
      },
      {
        judul: "Doa Memohon Diberi Kekuatan Menjaga Amanah",
        arab: "رَبِّ أَوْزِعْنِىٓ أَنْ أَشْكُرَ نِعْمَتَكَ ... وَأَصْلِحْ لِى فِى ذُرِّيَّتِىٓ",
        latin:
          "Rabbi auzi'nii an asykura ni'mataka ... wa ashlih lii fii dzurriyyatii.",
        arti: "Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat-Mu, dan perbaikilah bagiku keturunanku.",
        sumber: "QS. Al-Ahqaf: 15",
      },
      {
        judul: "Doa Memohon Kemudahan dalam Kelelahan Perjalanan",
        arab: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
        latin:
          "Allahumma innaa nas'aluka fii safarinaa haadzal birra wat taqwaa, wa minal 'amali maa tardhaa.",
        arti: "Ya Allah, kami memohon kepada-Mu dalam perjalanan kami ini kebaikan dan ketakwaan, dan amal yang Engkau ridhai.",
        sumber: "HR. Muslim 1342",
      },
      {
        judul: "Doa Memohon Ketenangan Sebelum Beristirahat",
        arab: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَجْمَعُ عِبَادَكَ",
        latin: "Allahumma qinii 'adzaabaka yauma tajma'u 'ibaadak.",
        arti: "Ya Allah, lindungilah aku dari azab-Mu pada hari Engkau mengumpulkan hamba-hamba-Mu.",
        sumber: "HR. Abu Dawud 5045",
      },
      {
        judul: "Doa Memohon Dikuatkan dalam Rutinitas Ibadah",
        arab: "رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى رَبَّنَا وَتَقَبَّلْ دُعَآءِ",
        latin:
          "Rabbij'alnii muqiimash shalaati wa min dzurriyyatii rabbanaa wa taqabbal du'aa'.",
        arti: "Ya Tuhanku, jadikanlah aku dan anak cucuku orang yang tetap mendirikan shalat, ya Tuhan kami, perkenankanlah doaku.",
        sumber: "QS. Ibrahim: 40",
      },
      {
        judul: "Doa Memohon Kekuatan Menjalani Hari",
        arab: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
        latin: "Ashbahnaa wa ashbahal mulku lillaah, wal hamdu lillaah.",
        arti: "Kami memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah.",
        sumber: "HR. Muslim 2723",
      },
    ],
    hadits: [
      {
        judul: "Tubuhmu Punya Hak Atas Dirimu",
        arab: "وَاعْلَمْ أَنَّ لِجَسَدِكَ عَلَيْكَ حَقًّا، وَلِعَيْنِكَ عَلَيْكَ حَقًّا، وَلِزَوْجِكَ عَلَيْكَ حَقًّا",
        latin:
          "Wa'lam anna lijasadika 'alaika haqqan, wa li'ainika 'alaika haqqan, wa lizaujika 'alaika haqqan.",
        arti: "Ketahuilah bahwa tubuhmu punya hak atas dirimu, matamu punya hak atas dirimu, dan istrimu punya hak atas dirimu.",
        sumber: "HR. Bukhari no. 1975, Muslim",
      },
      {
        judul: "Jika Mengantuk Saat Shalat, Tidurlah",
        arab: "إِذَا نَعَسَ أَحَدُكُمْ وَهُوَ يُصَلِّي فَلْيَرْقُدْ حَتَّى يَذْهَبَ عَنْهُ النَّوْمُ",
        latin:
          "Idzaa na'asa ahadukum wa huwa yushallii fal yarqud hattaa yadzhaba 'anHun naum.",
        arti: "Apabila salah seorang dari kalian mengantuk ketika sedang shalat, hendaklah ia tidur sampai rasa kantuknya hilang.",
        sumber: "HR. Bukhari dan Muslim",
      },
      {
        judul: "Allah Tidak Pernah Bosan",
        arab: "خُذُوا مِنَ الْعَمَلِ مَا تُطِيقُونَ، فَوَاللَّهِ لَا يَسْأَمُ اللَّهُ حَتَّى تَسْأَمُوا",
        latin:
          "Khudzuu minal 'amali maa tuthiiqquun, fallaahi laa yas'amullaahu hattaa tas'amuu.",
        arti: "Ambillah amal sesuai kemampuanmu, karena demi Allah, Allah tidak akan bosan sampai kalian sendiri yang bosan.",
        sumber: "HR. Bukhari",
      },
      /* --- tambahan --- */
      {
        judul: "Tidur Siang (Qailulah) Dianjurkan",
        arab: "قِيلُوا فَإِنَّ الشَّيَاطِينَ لَا تَقِيلُ",
        latin: "Qiiluu fa innasy syayaathiina laa taqiil.",
        arti: "Tidur sianglah kalian, karena setan tidak tidur siang.",
        sumber: "HR. Abu Ya'la, hasan",
      },
      {
        judul: "Islam Adalah Agama yang Mudah",
        arab: "إِنَّ الدِّينَ يُسْرٌ، وَلَنْ يُشَادَّ الدِّينَ أَحَدٌ إِلَّا غَلَبَهُ",
        latin:
          "Innad diina yusrun, wa lan yusyaaddad diina ahadun illaa ghalabah.",
        arti: "Sesungguhnya agama itu mudah, dan tidaklah seseorang mempersulit diri dalam beragama kecuali ia akan kalah (kewalahan).",
        sumber: "HR. Bukhari 39",
      },
      {
        judul: "Nabi Menganjurkan Beramal Sesuai Kemampuan",
        arab: "خُذُوا مِنَ الْعَمَلِ مَا تُطِيقُونَ",
        latin: "Khudzuu minal 'amali maa tuthiiquun.",
        arti: "Ambillah amal sesuai kemampuan kalian.",
        sumber: "HR. Bukhari 43",
      },
      {
        judul: "Berhentilah Sejenak Saat Bosan/Lelah dalam Ibadah",
        arab: "إِنَّ هَذَا الدِّينَ مَتِينٌ فَأَوْغِلْ فِيهِ بِرِفْقٍ",
        latin: "Inna haadzad diina matiinun fa aughil fiihi birifqin.",
        arti: "Sesungguhnya agama ini kokoh, maka masukilah dengan lemah lembut (jangan berlebihan hingga membuatmu jenuh).",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul:
          "Amal yang Paling Dicintai Allah adalah yang Terus-Menerus Meski Sedikit",
        arab: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
        latin: "Ahabbul a'maali ilallaahi adwamuhaa wa in qalla.",
        arti: "Amalan yang paling dicintai Allah adalah yang paling terus-menerus (rutin) walaupun sedikit.",
        sumber: "HR. Bukhari 6465, Muslim 783",
      },
      {
        judul: "Rehat Bagian dari Menjaga Amanah Tubuh",
        arab: "فَصُمْ وَأَفْطِرْ، وَقُمْ وَنَمْ، فَإِنَّ لِجَسَدِكَ عَلَيْكَ حَقًّا",
        latin:
          "Fashum wa afthir, wa qum wa nam, fa inna lijasadika 'alaika haqqaa.",
        arti: "Berpuasalah dan berbukalah, shalat malamlah dan tidurlah, karena sesungguhnya badanmu punya hak atas dirimu.",
        sumber: "HR. Bukhari 1975, Muslim 1159",
      },
    ],
  },

  /* ========================================================================== */
  /* TAKUT                                                                       */
  /* ========================================================================== */
  {
    key: "takut",
    label: "Takut",
    emoji: "😨",
    deskripsi: "Ada yang mencemaskan, tidak merasa aman",
    pembuka: "Allah Maha Menjaga. Tidak ada yang bisa melukai tanpa izin-Nya.",
    nasehat:
      'Ayat-ayat di atas mengarah pada satu kesimpulan: "Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung" (Ali \'Imran: 173). Ayat-ayat ini tidak menjanjikan bahwa tidak akan ada bahaya, tetapi menjanjikan bahwa Allah cukup untuk menghadapinya: "Allah adalah Pemberi kecukupan bagimu" (Al-Anfal: 62), "tidak ada kekhawatiran bagi wali-wali Allah" (Yunus: 62), "jangan takut kepada mereka, tetapi takutlah kepada-Ku" (Ali \'Imran: 175). Perhatikan bahwa rasa takut itu diakui, bahkan Nabi ﷺ mengajarkan doa perlindungan dari segala penjuru (HR. Abu Dawud 5074). Yang dilarang adalah takut kepada makhluk melebihi takut kepada Allah. Doa "Bismillahil ladzi la yadhurru ma\'asmihi syai\'un..." mengajarkan bahwa perlindungan itu bukan dari kekuatan kita, tetapi dari nama Allah yang tidak ada sesuatu pun bisa menembusnya. Hadits "Jagalah Allah, maka Allah akan menjagamu" (HR. Tirmidzi 2516) adalah kontrak: siapa yang menjaga batas-batas Allah, Allah akan menjaga dia di mana pun dia berada.',
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
      {
        surah: 9,
        ayat: 40,
        surahNama: "At-Taubah",
        teksArab: "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا",
        teksIndonesia:
          "Janganlah engkau bersedih, sesungguhnya Allah bersama kita.",
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
      /* --- tambahan --- */
      {
        surah: 2,
        ayat: 38,
        surahNama: "Al-Baqarah",
        teksArab:
          "فَمَن تَبِعَ هُدَاىَ فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        teksIndonesia:
          "Barangsiapa yang mengikuti petunjuk-Ku, niscaya tidak ada kekhawatiran atas mereka, dan tidak (pula) mereka bersedih hati.",
      },
      {
        surah: 5,
        ayat: 69,
        surahNama: "Al-Ma'idah",
        teksArab: "فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        teksIndonesia:
          "Maka tidak ada kekhawatiran atas mereka, dan tidak (pula) mereka bersedih hati.",
      },
      {
        surah: 46,
        ayat: 13,
        surahNama: "Al-Ahqaf",
        teksArab:
          "إِنَّ ٱلَّذِينَ قَالُوا۟ رَبُّنَا ٱللَّهُ ثُمَّ ٱسْتَقَٰمُوا۟ فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        teksIndonesia:
          "Sesungguhnya orang-orang yang berkata: 'Tuhan kami adalah Allah' kemudian mereka meneguhkan pendirian mereka, maka tidak ada kekhawatiran atas mereka dan tidak (pula) mereka bersedih hati.",
      },
      {
        surah: 28,
        ayat: 7,
        surahNama: "Al-Qashash",
        teksArab:
          "فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِى ٱلْيَمِّ وَلَا تَخَافِى وَلَا تَحْزَنِىٓ",
        teksIndonesia:
          "Maka apabila kamu khawatir terhadapnya, jatuhkanlah dia ke sungai (Nil). Dan janganlah kamu khawatir dan janganlah (pula) bersedih hati.",
      },
      {
        surah: 20,
        ayat: 46,
        surahNama: "Ta-Ha",
        teksArab: "لَا تَخَافَآ ۖ إِنَّنِى مَعَكُمَآ أَسْمَعُ وَأَرَىٰ",
        teksIndonesia:
          "Janganlah kamu berdua khawatir, sesungguhnya Aku beserta kamu berdua, Aku mendengar dan melihat.",
      },
      {
        surah: 27,
        ayat: 10,
        surahNama: "An-Naml",
        teksArab: "لَا تَخَفْ إِنِّى لَا يَخَافُ لَدَىَّ ٱلْمُرْسَلُونَ",
        teksIndonesia:
          "Janganlah kamu takut, sesungguhnya orang-orang yang menjadi rasul tidak takut di sisi-Ku.",
      },
      {
        surah: 28,
        ayat: 31,
        surahNama: "Al-Qashash",
        teksArab: "وَأَقْبِلْ وَلَا تَخَفْ ۖ إِنَّكَ مِنَ ٱلْءَامِنِينَ",
        teksIndonesia:
          "Dan datanglah kepada-Ku, janganlah kamu takut. Sesungguhnya kamu termasuk orang-orang yang aman.",
      },
      {
        surah: 79,
        ayat: 40,
        surahNama: "An-Nazi'at",
        teksArab:
          "وَأَمَّا مَنْ خَافَ مَقَامَ رَبِّهِۦ وَنَهَى ٱلنَّفْسَ عَنِ ٱلْهَوَىٰ",
        teksIndonesia:
          "Dan adapun orang-orang yang takut kepada kebesaran Tuhannya dan menahan diri dari keinginan hawa nafsunya.",
      },
      {
        surah: 39,
        ayat: 23,
        surahNama: "Az-Zumar",
        teksArab:
          "تَقْشَعِرُّ مِنْهُ جُلُودُ ٱلَّذِينَ يَخْشَوْنَ رَبَّهُمْ ثُمَّ تَلِينُ جُلُودُهُمْ وَقُلُوبُهُمْ إِلَىٰ ذِكْرِ ٱللَّهِ",
        teksIndonesia:
          "Bergetar karenanya kulit orang-orang yang takut kepada Tuhannya, kemudian menjadi tenang kulit dan hati mereka di waktu mengingat Allah.",
      },
      {
        surah: 15,
        ayat: 49,
        surahNama: "Al-Hijr",
        teksArab: "نَبِّئْ عِبَادِىٓ أَنِّىٓ أَنَا ٱلْغَفُورُ ٱلرَّحِيمُ",
        teksIndonesia:
          "Kabarkanlah kepada hamba-hamba-Ku, bahwa sesungguhnya Aku-lah Yang Maha Pengampun lagi Maha Penyayang.",
      },
      {
        surah: 67,
        ayat: 16,
        surahNama: "Al-Mulk",
        teksArab: "ءَأَمِنتُم مَّن فِى ٱلسَّمَآءِ",
        teksIndonesia:
          "Apakah kamu merasa aman terhadap Allah yang (kekuasaan-Nya) di langit (bahwa Dia menjaga kamu)?",
      },
      {
        surah: 2,
        ayat: 249,
        surahNama: "Al-Baqarah",
        teksArab:
          "كَم مِّن فِئَةٍ قَلِيلَةٍ غَلَبَتْ فِئَةً كَثِيرَةًۢ بِإِذْنِ ٱللَّهِ",
        teksIndonesia:
          "Berapa banyak terjadi golongan yang sedikit dapat mengalahkan golongan yang banyak dengan izin Allah.",
      },
      {
        surah: 8,
        ayat: 10,
        surahNama: "Al-Anfal",
        teksArab: "وَمَا ٱلنَّصْرُ إِلَّا مِنْ عِندِ ٱللَّهِ",
        teksIndonesia: "Dan tidak ada kemenangan itu kecuali dari sisi Allah.",
      },
      {
        surah: 21,
        ayat: 87,
        surahNama: "Al-Anbiya",
        teksArab:
          "فَنَادَىٰ فِى ٱلظُّلُمَٰتِ أَن لَّآ إِلَٰهَ إِلَّآ أَنتَ سُبْحَٰنَكَ",
        teksIndonesia:
          "Maka ia (Yunus) menyeru dalam keadaan yang sangat gelap: 'Bahwa tidak ada Tuhan selain Engkau. Maha Suci Engkau.'",
      },
      {
        surah: 21,
        ayat: 88,
        surahNama: "Al-Anbiya",
        teksArab:
          "فَٱسْتَجَبْنَا لَهُۥ وَنَجَّيْنَٰهُ مِنَ ٱلْغَمِّ ۚ وَكَذَٰلِكَ نُۨجِى ٱلْمُؤْمِنِينَ",
        teksIndonesia:
          "Maka Kami telah memperkenankan doanya dan menyelamatkannya dari kedukaan. Dan demikianlah Kami selamatkan orang-orang yang beriman.",
      },
    ],
    doa: [
      {
        judul: "Doa Perlindungan dari Segala Bahaya",
        arab: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin:
          "Bismillahil ladzi la yadhurru ma'asmihi syai'un fil ardhi wa la fis sama'i wa huwas sami'ul 'alim.",
        arti: "Dengan nama Allah yang dengan nama-Nya tidak ada sesuatu pun yang membahayakan, baik di bumi maupun di langit. Dan Dia Maha Mendengar lagi Maha Mengetahui.",
        sumber: "HR. Abu Dawud 5088",
      },
      {
        judul: "Doa Perlindungan dari Kejahatan",
        arab: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        latin: "A'udzu bikalimaatillaahit taammaati min syarri maa khalaq.",
        arti: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk-Nya.",
        sumber: "HR. Muslim 2708",
      },
      {
        judul: "Doa Perlindungan dari Segala Penjuru",
        arab: "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        latin:
          "Allahummahfazhnii min baini yadayya wa min khalfii wa 'an yamiinii wa 'an syimaalii wa min fauqii, wa a'uudzu bika an ughtaala min tahtii.",
        arti: "Ya Allah, lindungilah aku dari depan, belakang, kanan, kiri, dan dari atasku. Aku berlindung kepada-Mu agar tidak diserang dari bawahku.",
        sumber: "HR. Abu Dawud 5074",
      },
      {
        judul: "Doa Perlindungan untuk Anak",
        arab: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ غَضَبِهِ وَعِقَابِهِ، وَمِنْ شَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ، وَأَنْ يَحْضُرُونِ",
        latin:
          "A'uudzu bikalimaatillaahit taammati min ghadhabihi wa 'iqaabihi, wa min syarri 'ibaadihi, wa min hamazaatisy syayaathiini wa an yahdhuruun.",
        arti: "Aku berlindung dengan kalimat Allah yang sempurna, dari murka dan siksa-Nya, kejahatan para hamba-Nya, godaan atau bisikan setan dan dari kepungan atau kehadiran setan itu.",
        sumber: "HR. Abu Daud dan Tirmidzi, hasan",
      },
      {
        judul: "Doa Memohon Perlindungan dari Akhlak Buruk",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ مُنْكَرَاتِ الْأَخْلَاقِ وَالْأَعْمَالِ وَالْأَهْوَاءِ وَالْأَدْوَاءِ",
        latin:
          "Allahumma inni a'uudzu bika min munkaraatil akhlaaqi wal a'maali wal ahwaa'i wal adwaa'.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari akhlak yang buruk, amal yang buruk, hawa nafsu yang buruk, dan penyakit yang buruk.",
        sumber: "HR. Tirmidzi 3591, hasan",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Ketika Takut Suatu Kaum/Golongan",
        arab: "اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ",
        latin:
          "Allahumma innaa naj'aluka fii nuhuurihim, wa na'uudzu bika min syuruurihim.",
        arti: "Ya Allah, sesungguhnya kami menjadikan-Mu di leher-leher mereka (sebagai penghalang), dan kami berlindung kepada-Mu dari kejahatan mereka.",
        sumber: "HR. Abu Dawud 1537, hasan",
      },
      {
        judul: "Doa Ketika Cemas Akan Bahaya",
        arab: "حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ",
        latin: "Hasbiyallaahu wa ni'mal wakiil.",
        arti: "Cukuplah Allah bagiku, dan Dia sebaik-baik pelindung.",
        sumber: "QS. Ali 'Imran: 173",
      },
      {
        judul: "Doa Memohon Keamanan",
        arab: "اللَّهُمَّ آمِنَّا فِي أَوْطَانِنَا وَأَصْلِحْ أَئِمَّتَنَا وَوُلَاةَ أُمُورِنَا",
        latin:
          "Allahumma aaminnaa fii authaaninaa wa ashlih a'immatanaa wa wulaata umuurinaa.",
        arti: "Ya Allah, jadikanlah kami aman di negeri kami, dan perbaikilah para pemimpin dan penguasa urusan kami.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Nabi Ibrahim Memohon Negeri yang Aman",
        arab: "رَبِّ ٱجْعَلْ هَٰذَا بَلَدًا ءَامِنًا",
        latin: "Rabbij'al haadzaa baladan aaminaa.",
        arti: "Ya Tuhanku, jadikanlah negeri ini negeri yang aman.",
        sumber: "QS. Ibrahim: 35",
      },
      {
        judul: "Doa Memohon Perlindungan Waktu Malam (Sayyidul Istighfar)",
        arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
        latin:
          "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa 'abduk.",
        arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan selain Engkau, Engkau yang menciptakanku dan aku adalah hamba-Mu.",
        sumber: "HR. Bukhari 6306",
      },
      {
        judul: "Doa Ketika Bermimpi Buruk",
        arab: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ",
        latin:
          "A'uudzu bikalimaatillaahit taammaati min ghadhabihi wa 'iqaabihi, wa syarri 'ibaadihi, wa min hamazaatisy syayaathiini wa an yahdhuruun.",
        arti: "Aku berlindung dengan kalimat Allah yang sempurna dari murka dan siksa-Nya, dari kejahatan hamba-hamba-Nya, dan dari bisikan setan serta kehadirannya.",
        sumber: "HR. Abu Dawud dan Tirmidzi, hasan",
      },
      {
        judul: "Doa Memohon Ketenangan Ketika Sendirian",
        arab: "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا",
        latin: "Laa tahzan innallaaha ma'anaa.",
        arti: "Janganlah bersedih, sesungguhnya Allah bersama kita.",
        sumber: "QS. At-Taubah: 40",
      },
      {
        judul: "Doa Memohon Dilindungi dari Bahaya Perjalanan",
        arab: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ",
        latin:
          "Allahumma hawwin 'alainaa safaranaa haadzaa, wathwi 'annaa bu'dah.",
        arti: "Ya Allah, mudahkanlah perjalanan kami ini, dan dekatkanlah jaraknya yang jauh.",
        sumber: "HR. Muslim 1342",
      },
      {
        judul: "Doa Memohon Perlindungan dari Kejahatan Manusia",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ",
        latin:
          "Allahumma inni a'uudzu bika min syarri maa 'amiltu wa min syarri maa lam a'mal.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari keburukan apa yang telah kuperbuat dan dari keburukan apa yang belum kuperbuat.",
        sumber: "HR. Muslim 2716",
      },
      {
        judul: "Doa Memohon Perlindungan dari Gempa dan Bencana",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبَرَصِ وَالْجُنُونِ وَالْجُذَامِ وَمِنْ سَيِّئِ الْأَسْقَامِ",
        latin:
          "Allahumma inni a'uudzu bika minal barashi wal junuuni wal judzaami wa min sayyi'il asqaam.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari penyakit kusta, gila, lepra, dan dari penyakit-penyakit yang buruk.",
        sumber: "HR. Abu Dawud 1554, hasan",
      },
      {
        judul: "Doa Memohon Tidak Ditimpa Bencana Mendadak",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فُجَاءَةِ نِقْمَتِكَ",
        latin: "Allahumma inni a'uudzu bika min fujaa'ati niqmatik.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari datangnya siksa-Mu secara tiba-tiba.",
        sumber: "HR. Muslim 2739",
      },
      {
        judul: "Doa Memohon Keteguhan di Tengah Ancaman",
        arab: "رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ",
        latin:
          "Rabbanaa afrigh 'alainaa shabran wa tsabbit aqdaamanaa wanshurnaa 'alal qaumil kaafiriin.",
        arti: "Ya Tuhan kami, tuangkanlah kesabaran atas diri kami, dan kokohkanlah pendirian kami, dan tolonglah kami terhadap orang-orang kafir.",
        sumber: "QS. Al-Baqarah: 250",
      },
      {
        judul: "Doa Perlindungan dari Kejahatan Setiap yang Melata",
        arab: "مَا مِن دَآبَّةٍ إِلَّا هُوَ ءَاخِذٌۢ بِنَاصِيَتِهَآ ۚ إِنَّ رَبِّى عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
        latin:
          "Maa min daabbatin illaa huwa aakhidzun binaashiyatihaa, inna rabbii 'alaa shiraathim mustaqiim.",
        arti: "Tidak satu pun makhluk bergerak melata melainkan Dia-lah yang memegang ubun-ubunnya. Sesungguhnya Tuhanku di atas jalan yang lurus.",
        sumber: "QS. Hud: 56",
      },
      {
        judul: "Doa Memohon Ditenangkan dari Rasa Takut Berlebihan",
        arab: "اللَّهُمَّ اكْفِنِيهِمْ بِمَا شِئْتَ",
        latin: "Allahummakfiniihim bimaa syi'ta.",
        arti: "Ya Allah, cukupilah (lindungilah) aku dari mereka dengan cara apa pun yang Engkau kehendaki.",
        sumber: "HR. Muslim 3006",
      },
      {
        judul: "Doa Memohon Dijauhkan dari Musuh yang Berbahaya",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُبْنِ",
        latin: "Allahumma inni a'uudzu bika minal jubn.",
        arti: "Ya Allah, aku berlindung kepada-Mu dari sifat pengecut.",
        sumber: "HR. Bukhari 6365",
      },
      {
        judul: "Doa Memohon Perlindungan Anak dari Bahaya",
        arab: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
        latin:
          "U'iidzukumaa bikalimaatillaahit taammati min kulli syaithaanin wa haammah, wa min kulli 'ainin laammah.",
        arti: "Aku memohonkan perlindungan untuk kalian berdua dengan kalimat Allah yang sempurna dari setiap setan dan binatang berbisa, dan dari setiap pandangan mata yang jahat.",
        sumber: "HR. Bukhari 3371",
      },
      {
        judul: "Doa Memohon Ditenangkan dari Ketakutan Akan Kematian",
        arab: "اللَّهُمَّ أَحْيِنِي مَا كَانَتِ الْحَيَاةُ خَيْرًا لِي، وَتَوَفَّنِي إِذَا كَانَتِ الْوَفَاةُ خَيْرًا لِي",
        latin:
          "Allahumma ahyinii maa kaanatil hayaatu khairan lii, wa tawaffanii idzaa kaanatil wafaatu khairan lii.",
        arti: "Ya Allah, hidupkanlah aku selama hidup itu baik bagiku, dan wafatkanlah aku apabila kematian itu baik bagiku.",
        sumber: "HR. Bukhari 5671, Muslim 2680",
      },
      {
        judul: "Doa Memohon Keselamatan Dunia Akhirat",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي",
        latin:
          "Allahumma inni as'alukal 'afwa wal 'aafiyata fii diinii wa dunyaaya wa ahlii wa maalii.",
        arti: "Ya Allah, aku memohon kepada-Mu ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku.",
        sumber: "HR. Ibnu Majah 3871, hasan",
      },
    ],
    hadits: [
      {
        judul: "Jagalah Allah, Allah Akan Menjagamu",
        arab: "احْفَظِ اللَّهَ يَحْفَظْكَ",
        latin: "Ihfazhillaaha yahfazhka.",
        arti: "Jagalah Allah, maka Allah akan menjagamu.",
        sumber: "HR. Tirmidzi 2516, hasan sahih",
      },
      {
        judul: "Perlindungan dari Kejahatan Makhluk",
        arab: "مَنْ قَالَ: أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ، لَمْ يَضُرَّهُ شَيْءٌ حَتَّى يَرْتَحِلَ مِنْ مَنْزِلِهِ ذَلِكَ",
        latin:
          "Man qaala: A'uudzu bikalimaatillaahit taammaati min syarri maa khalaq, lam yadhurrahu syai'un hattaa yartahila min manzilihi dzaalik.",
        arti: "Barangsiapa membaca: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk-Nya,' maka tidak akan ada sesuatu pun yang membahayakannya hingga ia pergi dari tempat itu.",
        sumber: "HR. Muslim 2708",
      },
      {
        judul: "Doa Saat Takut pada Penguasa Zalim",
        arab: "مَنْ خَافَ مِنْ سُلْطَانٍ جَائِرٍ فَلْيَقُلْ: اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، كُنْ لِي جَارًا مِنْ فُلَانٍ",
        latin:
          "Man khaafa min sulthaanin jaa'irin fal yaqul: Allahumma rabbas samawaatis sab'i wa rabbal 'arsyil 'azhiim, kun lii jaaran min fulaan.",
        arti: "Barangsiapa takut kepada penguasa yang zalim, hendaklah ia membaca: 'Ya Allah, Tuhan langit yang tujuh dan Tuhan Arsy yang agung, jadilah pelindungku dari si Fulan.'",
        sumber: "HR. Ahmad, hasan",
      },
      /* --- tambahan --- */
      {
        judul: "Jibril Menjaga Nabi dari Ketakutan",
        arab: "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا",
        latin: "Laa tahzan innallaaha ma'anaa.",
        arti: "Janganlah bersedih (takut), sesungguhnya Allah bersama kita (ucapan Nabi ﷺ kepada Abu Bakar di gua Tsur).",
        sumber: "QS. At-Taubah: 40, HR. Bukhari 3653",
      },
      {
        judul: "Berlindung Sebelum Tidur dari Rasa Takut",
        arab: "إِذَا أَخَذَ مَضْجَعَهُ نَفَثَ فِي يَدَيْهِ بِـ(قُلْ هُوَ اللَّهُ أَحَدٌ) وَ(الْمُعَوِّذَتَيْنِ) جَمِيعًا",
        latin:
          "Idzaa akhadza madhja'ahu nafatsa fii yadaihi bi (qul huwallaahu ahad) wa (al-mu'awwidzatain) jamii'aa.",
        arti: "Apabila hendak tidur, Nabi ﷺ meniup kedua telapak tangannya sambil membaca Al-Ikhlas, Al-Falaq, dan An-Nas, lalu mengusapkannya ke tubuh.",
        sumber: "HR. Bukhari 5017",
      },
      {
        judul: "Allah Menjamin Rasa Aman bagi yang Menjaga Batasan-Nya",
        arab: "احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ",
        latin: "Ihfazhillaaha tajidhu tujaahak.",
        arti: "Jagalah (batasan-batasan) Allah, niscaya kamu akan mendapati-Nya selalu bersamamu.",
        sumber: "HR. Tirmidzi 2516, hasan shahih",
      },
      {
        judul: "Membaca Ayat Kursi Sebelum Tidur untuk Perlindungan",
        arab: "إِذَا أَوَيْتَ إِلَى فِرَاشِكَ فَاقْرَأْ آيَةَ الْكُرْسِيِّ، فَإِنَّهُ لَنْ يَزَالَ عَلَيْكَ مِنَ اللَّهِ حَافِظٌ",
        latin:
          "Idzaa awaita ilaa firaasyika faqra' aayatal kursiyyi, fa innahu lan yazaala 'alaika minallaahi haafizh.",
        arti: "Apabila kamu hendak tidur, bacalah ayat Kursi, maka senantiasa ada penjaga dari Allah untukmu.",
        sumber: "HR. Bukhari 2311",
      },
      {
        judul: "Rasa Takut yang Terpuji adalah Takut kepada Allah",
        arab: "أَنَا أَعْلَمُكُمْ بِاللَّهِ وَأَشَدُّكُمْ لَهُ خَشْيَةً",
        latin: "Anaa a'lamukum billaahi wa asyaddukum lahu khasy-yatan.",
        arti: "Aku adalah orang yang paling mengetahui Allah di antara kalian dan paling takut kepada-Nya.",
        sumber: "HR. Bukhari 5063, Muslim 1401",
      },
      {
        judul: "Dua Rasa Takut yang Tidak Berkumpul di Hati Mukmin",
        arab: "لَا يَجْتَمِعُ خَوْفُ اللَّهِ وَخَوْفُ غَيْرِهِ فِي قَلْبِ عَبْدٍ",
        latin: "Laa yajtami'u khaufullaahi wa khaufu ghairihi fii qalbi 'abd.",
        arti: "Tidak akan berkumpul rasa takut kepada Allah dan rasa takut kepada selain-Nya (secara berlebihan) dalam hati seorang hamba.",
        sumber: "Atsar, makna sesuai ajaran tauhid",
      },
    ],
  },

  /* ========================================================================== */
  /* PUTUS ASA                                                                   */
  /* ========================================================================== */
  {
    key: "putus-asa",
    label: "Putus Asa",
    emoji: "💔",
    deskripsi: "Merasa tidak ada harapan lagi",
    pembuka:
      "Jangan berhenti. Rahmat Allah lebih luas dari yang kau bayangkan.",
    nasehat:
      'Ayat-ayat di atas semuanya adalah panggilan untuk tidak berhenti: "Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya" (Az-Zumar: 53), "Dan janganlah kamu berputus asa dari rahmat Allah" (Yusuf: 87), "orang-orang yang berjihad untuk (mencari keridhaan) Kami, benar-benar akan Kami tunjukkan kepada mereka jalan-jalan Kami" (Al-Ankabut: 69). Perhatikan bahwa Allah tidak mengatakan "jangan bersedih" atau "jangan gagal", Dia mengatakan "jangan putus asa dari rahmat-Ku". Artinya, boleh gagal, boleh jatuh, boleh salah, yang tidak boleh adalah berhenti percaya bahwa rahmat Allah masih terbuka. Doa Nabi Yunus dibaca saat beliau berada dalam tiga kegelapan: malam, laut, dan perut ikan, dan Allah menyelamatkannya (Al-Anbiya: 87-88). Doa Nabi Zakariya dibaca saat beliau sudah tua dan mandul, dan Allah memberinya Yahya (Al-Anbiya: 89-90). Hadits "rahmat-Ku mengalahkan murka-Ku" (HR. Bukhari-Muslim) adalah jaminan bahwa pintu itu tidak pernah tertutup.',
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
        surah: 94,
        ayat: 5,
        surahNama: "Asy-Syarh",
        teksArab: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        teksIndonesia: "Maka sesungguhnya bersama kesulitan ada kemudahan.",
      },
      /* --- tambahan --- */
      {
        surah: 15,
        ayat: 56,
        surahNama: "Al-Hijr",
        teksArab:
          "قَالَ وَمَن يَقْنَطُ مِن رَّحْمَةِ رَبِّهِۦٓ إِلَّا ٱلضَّآلُّونَ",
        teksIndonesia:
          "Ibrahim berkata: 'Tidak ada yang berputus asa dari rahmat Tuhan-nya, kecuali orang-orang yang sesat.'",
      },
      {
        surah: 12,
        ayat: 90,
        surahNama: "Yusuf",
        teksArab:
          "إِنَّهُۥ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ ٱللَّهَ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ",
        teksIndonesia:
          "Sesungguhnya barangsiapa yang bertakwa dan bersabar, maka sesungguhnya Allah tidak menyia-nyiakan pahala orang-orang yang berbuat baik.",
      },
      {
        surah: 21,
        ayat: 83,
        surahNama: "Al-Anbiya",
        teksArab: "أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ",
        teksIndonesia:
          "(Ayyub berdoa) 'Sesungguhnya aku telah ditimpa penyakit, dan Engkau Tuhan Yang Maha Penyayang di antara semua penyayang.'",
      },
      {
        surah: 21,
        ayat: 84,
        surahNama: "Al-Anbiya",
        teksArab: "فَٱسْتَجَبْنَا لَهُۥ فَكَشَفْنَا مَا بِهِۦ مِن ضُرٍّ",
        teksIndonesia:
          "Maka Kami pun memperkenankan seruannya itu, lalu Kami lenyapkan penyakit yang ada padanya.",
      },
      {
        surah: 6,
        ayat: 17,
        surahNama: "Al-An'am",
        teksArab:
          "وَإِن يَمْسَسْكَ ٱللَّهُ بِخَيْرٍ فَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
        teksIndonesia:
          "Dan jika Allah mendatangkan kebaikan kepadamu, maka Dia Maha Kuasa atas segala sesuatu.",
      },
      {
        surah: 3,
        ayat: 26,
        surahNama: "Ali 'Imran",
        teksArab: "بِيَدِكَ ٱلْخَيْرُ ۖ إِنَّكَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
        teksIndonesia:
          "Di tangan Engkaulah segala kebajikan. Sesungguhnya Engkau Maha Kuasa atas segala sesuatu.",
      },
      {
        surah: 40,
        ayat: 44,
        surahNama: "Ghafir",
        teksArab:
          "وَأُفَوِّضُ أَمْرِىٓ إِلَى ٱللَّهِ ۚ إِنَّ ٱللَّهَ بَصِيرٌۢ بِٱلْعِبَادِ",
        teksIndonesia:
          "Dan aku menyerahkan urusanku kepada Allah. Sesungguhnya Allah Maha Melihat akan hamba-hamba-Nya.",
      },
      {
        surah: 65,
        ayat: 7,
        surahNama: "At-Talaq",
        teksArab: "سَيَجْعَلُ ٱللَّهُ بَعْدَ عُسْرٍ يُسْرًا",
        teksIndonesia:
          "Allah kelak akan memberikan kelapangan setelah kesempitan.",
      },
      {
        surah: 18,
        ayat: 58,
        surahNama: "Al-Kahf",
        teksArab: "وَرَبُّكَ ٱلْغَفُورُ ذُو ٱلرَّحْمَةِ",
        teksIndonesia:
          "Dan Tuhanmu Maha Pengampun, mempunyai rahmat (yang luas).",
      },
      {
        surah: 7,
        ayat: 156,
        surahNama: "Al-A'raf",
        teksArab: "وَرَحْمَتِى وَسِعَتْ كُلَّ شَىْءٍ",
        teksIndonesia: "Dan rahmat-Ku meliputi segala sesuatu.",
      },
      {
        surah: 40,
        ayat: 3,
        surahNama: "Ghafir",
        teksArab:
          "غَافِرِ ٱلذَّنۢبِ وَقَابِلِ ٱلتَّوْبِ شَدِيدِ ٱلْعِقَابِ ذِى ٱلطَّوْلِ",
        teksIndonesia:
          "Yang mengampuni dosa dan menerima taubat lagi keras hukuman-Nya; Yang mempunyai karunia.",
      },
      {
        surah: 66,
        ayat: 8,
        surahNama: "At-Tahrim",
        teksArab:
          "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ تُوبُوٓا۟ إِلَى ٱللَّهِ تَوْبَةً نَّصُوحًا",
        teksIndonesia:
          "Hai orang-orang yang beriman, bertaubatlah kepada Allah dengan taubat yang semurni-murninya.",
      },
      {
        surah: 42,
        ayat: 25,
        surahNama: "Asy-Syura",
        teksArab:
          "وَهُوَ ٱلَّذِى يَقْبَلُ ٱلتَّوْبَةَ عَنْ عِبَادِهِۦ وَيَعْفُوا۟ عَنِ ٱلسَّيِّـَٔاتِ",
        teksIndonesia:
          "Dan Dialah yang menerima taubat dari hamba-hamba-Nya dan memaafkan kesalahan-kesalahan.",
      },
      {
        surah: 4,
        ayat: 110,
        surahNama: "An-Nisa",
        teksArab:
          "وَمَن يَعْمَلْ سُوٓءًا أَوْ يَظْلِمْ نَفْسَهُۥ ثُمَّ يَسْتَغْفِرِ ٱللَّهَ يَجِدِ ٱللَّهَ غَفُورًا رَّحِيمًا",
        teksIndonesia:
          "Dan barangsiapa yang mengerjakan kejahatan dan menganiaya dirinya, kemudian ia memohon ampun kepada Allah, niscaya ia mendapati Allah Maha Pengampun lagi Maha Penyayang.",
      },
      {
        surah: 25,
        ayat: 70,
        surahNama: "Al-Furqan",
        teksArab: "إِلَّا مَن تَابَ وَءَامَنَ وَعَمِلَ عَمَلًا صَٰلِحًا",
        teksIndonesia:
          "Kecuali orang-orang yang bertaubat, beriman dan mengerjakan amal saleh.",
      },
      {
        surah: 20,
        ayat: 82,
        surahNama: "Ta-Ha",
        teksArab:
          "وَإِنِّى لَغَفَّارٌ لِّمَن تَابَ وَءَامَنَ وَعَمِلَ صَٰلِحًا ثُمَّ ٱهْتَدَىٰ",
        teksIndonesia:
          "Dan sesungguhnya Aku Maha Pengampun bagi orang yang bertaubat, beriman, beramal saleh, kemudian tetap di jalan yang benar.",
      },
      {
        surah: 11,
        ayat: 6,
        surahNama: "Hud",
        teksArab:
          "وَمَا مِن دَآبَّةٍ فِى ٱلْأَرْضِ إِلَّا عَلَى ٱللَّهِ رِزْقُهَا",
        teksIndonesia:
          "Dan tidak ada suatu binatang melata pun di bumi melainkan Allah-lah yang memberi rezekinya.",
      },
      {
        surah: 51,
        ayat: 58,
        surahNama: "Adz-Dzariyat",
        teksArab: "إِنَّ ٱللَّهَ هُوَ ٱلرَّزَّاقُ ذُو ٱلْقُوَّةِ ٱلْمَتِينُ",
        teksIndonesia:
          "Sesungguhnya Allah, Dialah Maha Pemberi rezeki, yang mempunyai kekuatan lagi sangat kokoh.",
      },
      {
        surah: 2,
        ayat: 268,
        surahNama: "Al-Baqarah",
        teksArab:
          "ٱلشَّيْطَٰنُ يَعِدُكُمُ ٱلْفَقْرَ وَيَأْمُرُكُم بِٱلْفَحْشَآءِ ۖ وَٱللَّهُ يَعِدُكُم مَّغْفِرَةً مِّنْهُ وَفَضْلًا",
        teksIndonesia:
          "Setan menjanjikan (menakut-nakuti) kamu dengan kemiskinan dan menyuruh kamu berbuat keji, sedang Allah menjanjikan untukmu ampunan dari-Nya dan karunia.",
      },
      {
        surah: 30,
        ayat: 60,
        surahNama: "Ar-Rum",
        teksArab:
          "فَٱصْبِرْ إِنَّ وَعْدَ ٱللَّهِ حَقٌّ ۖ وَلَا يَسْتَخِفَّنَّكَ ٱلَّذِينَ لَا يُوقِنُونَ",
        teksIndonesia:
          "Maka bersabarlah kamu, sesungguhnya janji Allah adalah benar dan sekali-kali janganlah orang-orang yang tidak meyakini (kebenaran ayat Allah) itu menggelisahkan kamu.",
      },
    ],
    doa: [
      {
        judul: "Doa Memohon Ampunan & Harapan",
        arab: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni.",
        arti: "Ya Allah, sesungguhnya Engkau Maha Pengampun dan menyukai ampunan, maka ampunilah aku.",
        sumber: "HR. Tirmidzi 3513",
      },
      {
        judul: "Doa Nabi Zakariya",
        arab: "رَبِّ لَا تَذَرْنِى فَرْدًا وَأَنتَ خَيْرُ ٱلْوَٰرِثِينَ",
        latin: "Rabbi laa tadzarnii fardan wa anta khairul waaritsiin.",
        arti: "Ya Tuhanku, janganlah Engkau biarkan aku hidup seorang diri (tanpa keturunan) dan Engkaulah ahli waris yang terbaik.",
        sumber: "QS. Al-Anbiya: 89",
      },
      {
        judul: "Doa Kecukupan Rezeki",
        arab: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        latin:
          "Allahummakfinii bihalaalika 'an haraamik, wa aghninii bifadhlika 'amman siwaak.",
        arti: "Ya Allah, cukupkanlah aku dengan yang halal dari-Mu sehingga terhindar dari yang haram, dan kayakanlah aku dengan karunia-Mu sehingga tidak bergantung kepada selain-Mu.",
        sumber: "HR. Tirmidzi 3563",
      },
      {
        judul: "Doa Nabi Yunus",
        arab: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ",
        latin:
          "Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin.",
        arti: "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim.",
        sumber: "QS. Al-Anbiya: 87",
      },
      {
        judul: "Doa Memohon Rahmat",
        arab: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
        latin:
          "Rabbanaa laa tuzigh quluubanaa ba'da idz hadaitanaa wa hab lanaa min ladunka rahmatan innaka antal wahhaab.",
        arti: "Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu; sesungguhnya Engkaulah Maha Pemberi karunia.",
        sumber: "QS. Ali 'Imran: 8",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Taubat Nasuha",
        arab: "رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَٰسِرِينَ",
        latin:
          "Rabbanaa zhalamnaa anfusanaa wa in lam taghfir lanaa wa tarhamnaa lanakuunanna minal khaasiriin.",
        arti: "Ya Tuhan kami, kami telah menganiaya diri kami sendiri, dan jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya kami termasuk orang-orang yang merugi.",
        sumber: "QS. Al-A'raf: 23",
      },
      {
        judul: "Doa Memohon Rahmat yang Luas",
        arab: "رَبَّنَا وَسِعْتَ كُلَّ شَىْءٍ رَّحْمَةً وَعِلْمًا فَٱغْفِرْ لِلَّذِينَ تَابُوا۟ وَٱتَّبَعُوا۟ سَبِيلَكَ",
        latin:
          "Rabbanaa wasi'ta kulla syai'in rahmatan wa 'ilman faghfir lilladziina taabuu wattaba'uu sabiilak.",
        arti: "Ya Tuhan kami, rahmat dan ilmu Engkau meliputi segala sesuatu, maka berilah ampunan kepada orang-orang yang bertaubat dan mengikuti jalan Engkau.",
        sumber: "QS. Ghafir: 7",
      },
      {
        judul: "Sayyidul Istighfar",
        arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        latin:
          "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu, abuu'u laka bini'matika 'alayya, wa abuu'u bidzanbii faghfir lii, fa innahu laa yaghfirudz dzunuuba illaa anta.",
        arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan selain Engkau, Engkau menciptakanku dan aku hamba-Mu, aku akan setia pada perjanjian-Mu semampuku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku, sesungguhnya tiada yang mengampuni dosa kecuali Engkau.",
        sumber: "HR. Bukhari 6306",
      },
      {
        judul: "Doa Memohon Jalan Keluar dari Keputusasaan",
        arab: "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
        latin:
          "Wa man yattaqillaaha yaj'al lahu makhrajan wa yarzuqhu min haitsu laa yahtasib.",
        arti: "Barangsiapa bertakwa kepada Allah, niscaya Dia akan memberikan jalan keluar baginya, dan memberinya rezeki dari arah yang tiada disangka-sangkanya.",
        sumber: "QS. At-Talaq: 2-3",
      },
      {
        judul: "Doa Memohon Diberi Harapan Baru",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ",
        latin: "Allahumma inni as'aluka minal khairi kullih.",
        arti: "Ya Allah, aku memohon kepada-Mu segala kebaikan.",
        sumber: "HR. Ibnu Majah 3846, hasan",
      },
      {
        judul: "Doa Memohon Digantikan yang Lebih Baik",
        arab: "اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
        latin: "Allahumma'jurnii fii mushiibatii wa akhlif lii khairan minhaa.",
        arti: "Ya Allah, berilah aku pahala dalam musibahku dan gantikanlah untukku dengan yang lebih baik darinya.",
        sumber: "HR. Muslim 918",
      },
      {
        judul: "Doa Nabi Yaqub agar Tidak Berputus Asa",
        arab: "إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ وَأَعْلَمُ مِنَ ٱللَّهِ مَا لَا تَعْلَمُونَ",
        latin:
          "Innamaa asykuu batstsii wa huznii ilallaahi wa a'lamu minallaahi maa laa ta'lamuun.",
        arti: "Sesungguhnya aku hanya mengadukan kesusahan dan kesedihanku kepada Allah, dan aku mengetahui dari Allah apa yang tidak kamu ketahui.",
        sumber: "QS. Yusuf: 86",
      },
      {
        judul: "Doa Memohon Diberikan Pintu Rezeki dari Arah Tak Disangka",
        arab: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
        latin: "Wa yarzuqhu min haitsu laa yahtasib.",
        arti: "Dan memberinya rezeki dari arah yang tiada disangka-sangkanya.",
        sumber: "QS. At-Talaq: 3",
      },
      {
        judul: "Doa Memohon Dikuatkan Hati Setelah Terjatuh",
        arab: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً",
        latin:
          "Rabbanaa laa tuzigh quluubanaa ba'da idz hadaitanaa wa hab lanaa min ladunka rahmatan.",
        arti: "Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan setelah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu.",
        sumber: "QS. Ali 'Imran: 8",
      },
      {
        judul: "Doa Memohon agar Selalu Diberi Petunjuk",
        arab: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        latin: "Ihdinash shiraathal mustaqiim.",
        arti: "Tunjukilah kami jalan yang lurus.",
        sumber: "QS. Al-Fatihah: 6",
      },
      {
        judul: "Doa Memohon Kekuatan di Titik Terendah",
        arab: "رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ",
        latin: "Rabbi innii limaa anzalta ilayya min khairin faqiir.",
        arti: "Ya Tuhanku, sesungguhnya aku sangat membutuhkan kebaikan yang Engkau turunkan kepadaku.",
        sumber: "QS. Al-Qashash: 24",
      },
      {
        judul: "Doa Memohon Diampuni dan Diberi Harapan Baru",
        arab: "رَبِّ ٱغْفِرْ وَٱرْحَمْ وَأَنتَ خَيْرُ ٱلرَّٰحِمِينَ",
        latin: "Rabbighfir warham wa anta khairur raahimiin.",
        arti: "Ya Tuhanku, ampunilah dan sayangilah, Engkaulah sebaik-baik Penyayang.",
        sumber: "QS. Al-Mu'minun: 118",
      },
      {
        judul: "Doa Memohon Diberi Kekuatan seperti Nabi Ayyub",
        arab: "نِّعْمَ ٱلْعَبْدُ إِنَّهُۥٓ أَوَّابٌ",
        latin: "Ni'mal 'abdu innahu awwaab.",
        arti: "(Ayyub) adalah sebaik-baik hamba. Sesungguhnya dia amat taat (kepada Tuhannya).",
        sumber: "QS. Shad: 44",
      },
      {
        judul: "Doa Memohon Diberi Ganti Terbaik dari Allah",
        arab: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
        latin: "Wa man yatawakkal 'alallaahi fahuwa hasbuh.",
        arti: "Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.",
        sumber: "QS. At-Talaq: 3",
      },
      {
        judul: "Doa Memohon Kemudahan Setelah Kesulitan Panjang",
        arab: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        latin: "Fa inna ma'al 'usri yusraa, inna ma'al 'usri yusraa.",
        arti: "Maka sesungguhnya bersama kesulitan ada kemudahan. Sesungguhnya bersama kesulitan ada kemudahan.",
        sumber: "QS. Asy-Syarh: 5-6",
      },
      {
        judul: "Doa Memohon Diberi Kesabaran Menanti Jawaban Doa",
        arab: "وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ",
        latin: "Wa qaala rabbukumud'uunii astajib lakum.",
        arti: "Dan Tuhanmu berfirman: 'Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu.'",
        sumber: "QS. Ghafir: 60",
      },
      {
        judul: "Doa Memohon Tidak Diserahkan pada Diri Sendiri",
        arab: "وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        latin: "Wa laa takilnii ilaa nafsii tharfata 'ain.",
        arti: "Dan janganlah Engkau serahkan aku pada diriku sendiri walau sekejap mata.",
        sumber: "HR. Abu Dawud 5090, hasan",
      },
      {
        judul: "Doa Nabi Ayyub Memohon Kesembuhan dan Harapan",
        arab: "أَنِّى مَسَّنِىَ ٱلشَّيْطَٰنُ بِنُصْبٍ وَعَذَابٍ",
        latin: "Annii massaniyasy syaithaanu binushbin wa 'adzaab.",
        arti: "Sesungguhnya aku telah digoda setan dengan kepayahan dan siksaan.",
        sumber: "QS. Shad: 41",
      },
    ],
    hadits: [
      {
        judul: "Rahmat Allah Mengalahkan Murka-Nya",
        arab: "إِنَّ رَحْمَتِي تَغْلِبُ غَضَبِي",
        latin: "Inna rahmatii taghlibu ghadhabii.",
        arti: "Sesungguhnya rahmat-Ku mengalahkan murka-Ku.",
        sumber: "HR. Bukhari dan Muslim",
      },
      {
        judul: "Jangan Putus Asa dari Rahmat Allah",
        arab: "لَوْ يَعْلَمُ الْكَافِرُ مَا عِنْدَ اللَّهِ مِنَ الرَّحْمَةِ، مَا قَنَطَ مِنْ جَنَّتِهِ أَحَدٌ",
        latin:
          "Lau ya'lamul kaafiru maa 'indallaahi minar rahmati, maa qanatha min jannatihi ahad.",
        arti: "Kalaulah orang kafir itu mengetahui bagaimana rahmat yang sangat luas di sisi Allah, tentu mereka tidak akan putus asa dari surga Allah.",
        sumber: "HR. Muslim",
      },
      {
        judul: "Allah Lebih Dekat dari Urat Leher",
        arab: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
        latin: "Wa nahnu aqrabu ilaihi min hablil wariid.",
        arti: "Dan Kami lebih dekat kepadanya daripada urat lehernya.",
        sumber: "QS. Qaf: 16",
      },
      /* --- tambahan --- */
      {
        judul: "Pintu Taubat Terbuka Hingga Matahari Terbit dari Barat",
        arab: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ، وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ، حَتَّى تَطْلُعَ الشَّمْسُ مِنْ مَغْرِبِهَا",
        latin:
          "Innallaaha yabsuthu yadahu bil laili liyatuuba musii'un nahaar, wa yabsuthu yadahu bin nahaari liyatuuba musii'ul lail, hattaa tathlu'asy syamsu min maghribihaa.",
        arti: "Sesungguhnya Allah membentangkan tangan-Nya di malam hari untuk menerima taubat orang yang berbuat dosa di siang hari, dan membentangkan tangan-Nya di siang hari untuk menerima taubat orang yang berbuat dosa di malam hari, hingga matahari terbit dari barat.",
        sumber: "HR. Muslim 2759",
      },
      {
        judul: "Kegembiraan Allah atas Taubat Hamba-Nya",
        arab: "لَلَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ سَقَطَ عَلَى بَعِيرِهِ",
        latin:
          "Lallaahu afrahu bitaubati 'abdihi min ahadikum saqatha 'alaa ba'iirih.",
        arti: "Sungguh Allah lebih bergembira dengan taubat hamba-Nya daripada kegembiraan salah seorang dari kalian yang kembali menemukan untanya yang hilang.",
        sumber: "HR. Bukhari 6309, Muslim 2747",
      },
      {
        judul: "Dosa Sebesar Apapun Tetap Bisa Diampuni (Hadits Qudsi)",
        arab: "يَا ابْنَ آدَمَ، إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلَا أُبَالِي",
        latin:
          "Yaa ibna aadam, innaka maa da'autanii wa rajautanii ghafartu laka 'alaa maa kaana minka wa laa ubaalii.",
        arti: "Wahai anak Adam, sesungguhnya selama engkau berdoa dan berharap kepada-Ku, Aku akan mengampuni dosamu bagaimanapun keadaannya, dan Aku tidak peduli (banyaknya dosa itu).",
        sumber: "HR. Tirmidzi 3540, hasan",
      },
      {
        judul: "Allah Menerima Taubat Selama Nyawa Belum Sampai Kerongkongan",
        arab: "إِنَّ اللَّهَ يَقْبَلُ تَوْبَةَ الْعَبْدِ مَا لَمْ يُغَرْغِرْ",
        latin: "Innallaaha yaqbalu taubatal 'abdi maa lam yugharghir.",
        arti: "Sesungguhnya Allah menerima taubat seorang hamba selama nyawanya belum sampai di kerongkongan (sakaratul maut).",
        sumber: "HR. Tirmidzi 3537, hasan",
      },
      {
        judul: "Setiap Kesulitan Pasti Berakhir",
        arab: "وَاعْلَمْ أَنَّ مَا أَصَابَكَ لَمْ يَكُنْ لِيُخْطِئَكَ، وَمَا أَخْطَأَكَ لَمْ يَكُنْ لِيُصِيبَكَ",
        latin:
          "Wa'lam anna maa ashaabaka lam yakun liyukhthi'ak, wa maa akhtha'aka lam yakun liyushiibak.",
        arti: "Ketahuilah, apa yang menimpamu tidak akan meleset darimu, dan apa yang meleset darimu tidak akan menimpamu.",
        sumber: "HR. Tirmidzi 2516, hasan shahih",
      },
    ],
  },

  /* ========================================================================== */
  /* TENANG                                                                      */
  /* ========================================================================== */
  {
    key: "tenang",
    label: "Butuh Tenang",
    emoji: "🕊️",
    deskripsi: "Ingin duduk sejenak, menenangkan hati",
    pembuka: "Duduklah. Ambil napas. Biarkan ayat-ayat ini menenangkan jiwamu.",
    nasehat:
      'Ayat-ayat di atas semuanya berbicara tentang sakinah, ketenangan yang Allah turunkan, bukan yang diciptakan sendiri: "Dialah yang menurunkan ketenangan ke dalam hati orang-orang mukmin" (Al-Fath: 4), "hanya dengan mengingat Allah hati menjadi tenang" (Ar-Ra\'d: 28), "Hai jiwa yang tenang" (Al-Fajr: 27). Perhatikan bahwa ketenangan itu bukan hasil dari hilangnya masalah, Yusuf tetap dipenjara, Nabi ﷺ tetap diusir, tetapi hati mereka tenang. Ar-Rum: 21 menyebut pasangan sebagai sumber ketenangan, artinya ketenangan itu juga hadir lewat orang-orang di sekitar kita, bukan hanya lewat ibadah individual. Doa "Ya Hayyu ya Qayyum, birahmatika astaghits" mengajarkan bahwa saat segala cara sudah dicoba, yang tersisa adalah memohon rahmat Allah, dan itu bukan jalan terakhir, itu jalan utama. Hadits "majelis dzikir dinaungi rahmat dan dituruni sakinah" (HR. Muslim 2700) menunjukkan bahwa ketenangan itu sering datang justru saat kita duduk bersama orang-orang yang mengingat Allah.',
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
      {
        surah: 6,
        ayat: 13,
        surahNama: "Al-An'am",
        teksArab:
          "وَلَهُۥ مَا سَكَنَ فِى ٱلَّيْلِ وَٱلنَّهَارِ ۚ وَهُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
        teksIndonesia:
          "Dan kepunyaan-Nya lah segala yang ada pada malam dan siang. Dan Dialah Yang Maha Mendengar lagi Maha Mengetahui.",
      },
      {
        surah: 89,
        ayat: 27,
        surahNama: "Al-Fajr",
        teksArab: "يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ",
        teksIndonesia: "Hai jiwa yang tenang.",
      },
      /* --- tambahan --- */
      {
        surah: 89,
        ayat: 28,
        surahNama: "Al-Fajr",
        teksArab: "ٱرْجِعِىٓ إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً",
        teksIndonesia:
          "Kembalilah kepada Tuhanmu dengan hati yang puas lagi diridhai-Nya.",
      },
      {
        surah: 13,
        ayat: 29,
        surahNama: "Ar-Ra'd",
        teksArab:
          "ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ طُوبَىٰ لَهُمْ وَحُسْنُ مَـَٔابٍ",
        teksIndonesia:
          "Orang-orang yang beriman dan beramal saleh, bagi mereka kebahagiaan dan tempat kembali yang baik.",
      },
      {
        surah: 16,
        ayat: 97,
        surahNama: "An-Nahl",
        teksArab:
          "مَنْ عَمِلَ صَٰلِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُۥ حَيَوٰةً طَيِّبَةً",
        teksIndonesia:
          "Barangsiapa yang mengerjakan amal saleh, baik laki-laki maupun perempuan dalam keadaan beriman, maka sesungguhnya akan Kami berikan kepadanya kehidupan yang baik.",
      },
      {
        surah: 89,
        ayat: 30,
        surahNama: "Al-Fajr",
        teksArab: "وَٱدْخُلِى جَنَّتِى",
        teksIndonesia: "Dan masuklah ke dalam surga-Ku.",
      },
      {
        surah: 10,
        ayat: 57,
        surahNama: "Yunus",
        teksArab:
          "وَشِفَآءٌ لِّمَا فِى ٱلصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
        teksIndonesia:
          "Dan penyembuh bagi penyakit yang ada dalam dada, dan petunjuk serta rahmat bagi orang-orang yang beriman.",
      },
      {
        surah: 41,
        ayat: 44,
        surahNama: "Fussilat",
        teksArab: "قُلْ هُوَ لِلَّذِينَ ءَامَنُوا۟ هُدًى وَشِفَآءٌ",
        teksIndonesia:
          "Katakanlah: 'Al-Qur'an itu adalah petunjuk dan penyembuh bagi orang-orang yang beriman.'",
      },
      {
        surah: 6,
        ayat: 82,
        surahNama: "Al-An'am",
        teksArab:
          "ٱلَّذِينَ ءَامَنُوا۟ وَلَمْ يَلْبِسُوٓا۟ إِيمَٰنَهُم بِظُلْمٍ أُو۟لَٰٓئِكَ لَهُمُ ٱلْأَمْنُ وَهُم مُّهْتَدُونَ",
        teksIndonesia:
          "Orang-orang yang beriman dan tidak mencampuradukkan iman mereka dengan kezaliman (syirik), mereka itulah orang-orang yang mendapat keamanan dan mereka mendapat petunjuk.",
      },
      {
        surah: 3,
        ayat: 126,
        surahNama: "Ali 'Imran",
        teksArab:
          "وَمَا ٱلنَّصْرُ إِلَّا مِنْ عِندِ ٱللَّهِ ٱلْعَزِيزِ ٱلْحَكِيمِ",
        teksIndonesia:
          "Dan kemenangan itu hanyalah dari sisi Allah Yang Maha Perkasa lagi Maha Bijaksana.",
      },
      {
        surah: 48,
        ayat: 18,
        surahNama: "Al-Fath",
        teksArab:
          "فَعَلِمَ مَا فِى قُلُوبِهِمْ فَأَنزَلَ ٱلسَّكِينَةَ عَلَيْهِمْ",
        teksIndonesia:
          "Maka Allah mengetahui apa yang ada dalam hati mereka lalu menurunkan ketenangan atas mereka.",
      },
      {
        surah: 9,
        ayat: 26,
        surahNama: "At-Taubah",
        teksArab:
          "ثُمَّ أَنزَلَ ٱللَّهُ سَكِينَتَهُۥ عَلَىٰ رَسُولِهِۦ وَعَلَى ٱلْمُؤْمِنِينَ",
        teksIndonesia:
          "Kemudian Allah menurunkan ketenangan kepada Rasul-Nya dan kepada orang-orang yang beriman.",
      },
      {
        surah: 76,
        ayat: 11,
        surahNama: "Al-Insan",
        teksArab:
          "فَوَقَىٰهُمُ ٱللَّهُ شَرَّ ذَٰلِكَ ٱلْيَوْمِ وَلَقَّىٰهُمْ نَضْرَةً وَسُرُورًا",
        teksIndonesia:
          "Maka Allah memelihara mereka dari kesusahan hari itu, dan memberikan kepada mereka kejernihan wajah dan kegembiraan hati.",
      },
      {
        surah: 55,
        ayat: 60,
        surahNama: "Ar-Rahman",
        teksArab: "هَلْ جَزَآءُ ٱلْإِحْسَٰنِ إِلَّا ٱلْإِحْسَٰنُ",
        teksIndonesia:
          "Tidak ada balasan untuk kebaikan selain kebaikan (pula).",
      },
      {
        surah: 29,
        ayat: 45,
        surahNama: "Al-'Ankabut",
        teksArab: "إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ",
        teksIndonesia:
          "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.",
      },
      {
        surah: 20,
        ayat: 14,
        surahNama: "Ta-Ha",
        teksArab: "وَأَقِمِ ٱلصَّلَوٰةَ لِذِكْرِىٓ",
        teksIndonesia: "Dan dirikanlah shalat untuk mengingat-Ku.",
      },
      {
        surah: 62,
        ayat: 9,
        surahNama: "Al-Jumu'ah",
        teksArab: "فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ",
        teksIndonesia:
          "Maka bersegeralah kamu kepada mengingat Allah dan tinggalkanlah jual beli.",
      },
      {
        surah: 33,
        ayat: 41,
        surahNama: "Al-Ahzab",
        teksArab:
          "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱذْكُرُوا۟ ٱللَّهَ ذِكْرًا كَثِيرًا",
        teksIndonesia:
          "Hai orang-orang yang beriman, berzikirlah (dengan menyebut nama) Allah, zikir yang sebanyak-banyaknya.",
      },
      {
        surah: 18,
        ayat: 46,
        surahNama: "Al-Kahf",
        teksArab:
          "وَٱلْبَٰقِيَٰتُ ٱلصَّٰلِحَٰتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا",
        teksIndonesia:
          "Dan amal-amal yang kekal lagi saleh adalah lebih baik pahalanya di sisi Tuhanmu, dan lebih baik untuk menjadi harapan.",
      },
      {
        surah: 6,
        ayat: 162,
        surahNama: "Al-An'am",
        teksArab:
          "قُلْ إِنَّ صَلَاتِى وَنُسُكِى وَمَحْيَاىَ وَمَمَاتِى لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        teksIndonesia:
          "Katakanlah: 'Sesungguhnya shalatku, ibadahku, hidupku dan matiku hanyalah untuk Allah, Tuhan semesta alam.'",
      },
      {
        surah: 2,
        ayat: 112,
        surahNama: "Al-Baqarah",
        teksArab:
          "بَلَىٰ مَنْ أَسْلَمَ وَجْهَهُۥ لِلَّهِ وَهُوَ مُحْسِنٌ فَلَهُۥٓ أَجْرُهُۥ عِندَ رَبِّهِۦ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        teksIndonesia:
          "Ya, barangsiapa yang menyerahkan diri kepada Allah, sedang ia berbuat kebajikan, maka baginya pahala di sisi Tuhannya, dan tidak ada kekhawatiran terhadap mereka dan tidak (pula) mereka bersedih hati.",
      },
      {
        surah: 39,
        ayat: 22,
        surahNama: "Az-Zumar",
        teksArab:
          "أَفَمَن شَرَحَ ٱللَّهُ صَدْرَهُۥ لِلْإِسْلَٰمِ فَهُوَ عَلَىٰ نُورٍ مِّن رَّبِّهِۦ",
        teksIndonesia:
          "Maka apakah orang-orang yang dibukakan Allah hatinya untuk (menerima) agama Islam, lalu ia mendapat cahaya dari Tuhannya (sama dengan orang yang hatinya membatu)?",
      },
    ],
    doa: [
      {
        judul: "Doa Ketenangan Hati",
        arab: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        latin:
          "Ya Hayyu ya Qayyum, birahmatika astaghits, ashlih li sya'ni kullahu, wa la takilni ila nafsi tharfata 'ain.",
        arti: "Wahai Dzat yang Hidup, Wahai Dzat yang mengatur segala sesuatu, hanya dengan rahmat-Mu aku memohon pertolongan, perbaikilah semua keadaanku dan jangan Engkau menyerahkan aku pada diriku walau sekedipan mata.",
        sumber: "HR. Hakim 1/545",
      },
      {
        judul: "Doa Memohon Ketenangan",
        arab: "اللَّهُمَّ أَنْزِلْ عَلَيْنَا مِنْ بَرَكَاتِ السَّمَاءِ وَأَخْرِجْ لَنَا مِنْ بَرَكَاتِ الْأَرْضِ",
        latin:
          "Allahumma anzil 'alainaa min barakaatis samaa'i wa akhrij lanaa min barakaatil ardh.",
        arti: "Ya Allah, turunkanlah kepada kami keberkahan dari langit dan keluarkanlah untuk kami keberkahan dari bumi.",
        sumber: "HR. Thabrani",
      },
      {
        judul: "Doa Salam & Keberkahan",
        arab: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        latin:
          "Allahumma antas salaam wa minkas salaam, tabaarakta yaa dzal jalaali wal ikraam.",
        arti: "Ya Allah, Engkau Maha Pemberi keselamatan, dan dari-Mu keselamatan itu berasal. Maha Berkah Engkau, wahai Dzat yang memiliki keagungan dan kemuliaan.",
        sumber: "HR. Muslim 591",
      },
      {
        judul: "Doa Nabi untuk Ketenangan Jiwa",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً، تُؤْمِنُ بِلِقَائِكَ، وَتَرْضَى بِقَضَائِكَ، وَتَقْنَعُ بِعَطَائِكَ",
        latin:
          "Allahumma inni as'aluka nafsan bika muthma'innah, tu'minu biliqaa'ika, wa tardhaa biqadhaa'ika, wa taqna'u bi'athaa'ika.",
        arti: "Ya Allah, aku memohon kepada-Mu jiwa yang merasa tenang kepada-Mu, yang yakin akan bertemu dengan-Mu, yang ridha dengan ketetapan-Mu, dan yang merasa cukup dengan pemberian-Mu.",
        sumber: "HR. Thabrani, hasan",
      },
      {
        judul: "Doa Memohon Cahaya Hati",
        arab: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَأَمَامِي نُورًا، وَخَلْفِي نُورًا، وَفَوْقِي نُورًا، وَتَحْتِي نُورًا",
        latin:
          "Allahummaj'al fii qalbii nuuran, wa fii basharii nuuran, wa fii sam'ii nuuran, wa 'an yamiinii nuuran, wa 'an syimaalii nuuran, wa amaamii nuuran, wa khalfii nuuran, wa fauqii nuuran, wa tahtii nuuran.",
        arti: "Ya Allah, jadikanlah cahaya di hatiku, cahaya di penglihatanku, cahaya di pendengaranku, cahaya di kananku, cahaya di kiriku, cahaya di depanku, cahaya di belakangku, cahaya di atasku, dan cahaya di bawahku.",
        sumber: "HR. Bukhari dan Muslim",
      },
      /* --- tambahan --- */
      {
        judul: "Doa Memohon Hati yang Selalu Tenang",
        arab: "رَبِّ ٱشْرَحْ لِى صَدْرِى",
        latin: "Rabbisyrah lii shadrii.",
        arti: "Ya Tuhanku, lapangkanlah untukku dadaku.",
        sumber: "QS. Ta-Ha: 25",
      },
      {
        judul: "Doa Zikir Pagi untuk Ketenangan",
        arab: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ",
        latin: "Ashbahnaa 'alaa fithratil islaam, wa 'alaa kalimatil ikhlaash.",
        arti: "Kami memasuki waktu pagi di atas fitrah Islam, dan di atas kalimat keikhlasan.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Ketika Duduk di Suatu Majelis",
        arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        latin:
          "Subhaanakallahumma wa bihamdika asyhadu allaa ilaaha illaa anta astaghfiruka wa atuubu ilaik.",
        arti: "Maha Suci Engkau ya Allah dan dengan memuji-Mu, aku bersaksi tiada Tuhan selain Engkau, aku memohon ampun dan bertaubat kepada-Mu.",
        sumber: "HR. Abu Dawud 4859, hasan shahih",
      },
      {
        judul: "Doa Memohon Kedamaian Batin",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ طُمَأْنِينَةَ الْقَلْبِ",
        latin: "Allahumma inni as'aluka thuma'niinatal qalb.",
        arti: "Ya Allah, aku memohon kepada-Mu ketenangan hati.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Memohon Kehidupan yang Baik",
        arab: "اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الْأُمُورِ كُلِّهَا",
        latin: "Allahumma ahsin 'aaqibatanaa fil umuuri kullihaa.",
        arti: "Ya Allah, baguskanlah akibat (akhir) segala urusan kami.",
        sumber: "HR. Al-Hakim, hasan",
      },
      {
        judul: "Doa Memohon Diberi Rasa Cukup dan Tenteram",
        arab: "اللَّهُمَّ اقْنِعْنِي بِمَا رَزَقْتَنِي وَبَارِكْ لِي فِيهِ",
        latin: "Allahummaqna'nii bimaa razaqtanii wa baarik lii fiih.",
        arti: "Ya Allah, jadikanlah aku merasa cukup dengan apa yang Engkau rezekikan kepadaku, dan berkahilah aku padanya.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Sebelum Memulai Aktivitas dengan Tenang",
        arab: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ",
        latin: "Bismillaahi tawakkaltu 'alallaah.",
        arti: "Dengan nama Allah, aku bertawakal kepada Allah.",
        sumber: "HR. Abu Dawud 5095",
      },
      {
        judul: "Doa Memohon Hati yang Dijadikan Al-Qur'an Penyejuk",
        arab: "اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي",
        latin: "Allahummaj'alil qur'aana rabii'a qalbii.",
        arti: "Ya Allah, jadikanlah Al-Qur'an sebagai penyejuk hatiku.",
        sumber: "HR. Ahmad 1/391, hasan",
      },
      {
        judul: "Doa Zikir Petang untuk Ketenteraman",
        arab: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
        latin: "Amsainaa wa amsal mulku lillaah, wal hamdu lillaah.",
        arti: "Kami memasuki waktu petang dan kerajaan hanya milik Allah, segala puji bagi Allah.",
        sumber: "HR. Muslim 2723",
      },
      {
        judul: "Doa Memohon Ridha Allah dalam Segala Keadaan",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الرِّضَا بَعْدَ الْقَضَاءِ",
        latin: "Allahumma inni as'alukar ridhaa ba'dal qadhaa'.",
        arti: "Ya Allah, aku memohon keridhaan (menerima) setelah ada ketetapan-Mu.",
        sumber: "HR. Ahmad, hasan",
      },
      {
        judul: "Doa Memohon Kesejukan Mata (Qurrata A'yun)",
        arab: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        latin:
          "Rabbanaa hab lanaa min azwaajinaa wa dzurriyyaatinaa qurrata a'yunin waj'alnaa lilmuttaqiina imaamaa.",
        arti: "Ya Tuhan kami, anugerahkanlah kepada kami istri-istri kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami imam bagi orang-orang yang bertakwa.",
        sumber: "QS. Al-Furqan: 74",
      },
      {
        judul: "Doa Memohon Ditetapkan Hati di Atas Kebaikan",
        arab: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        latin: "Yaa muqallibal quluubi tsabbit qalbii 'alaa diinik.",
        arti: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
        sumber: "HR. Tirmidzi 2140, hasan shahih",
      },
      {
        judul: "Doa Ketika Merasa Damai dan Ingin Bersyukur",
        arab: "الْحَمْدُ لِلَّهِ الَّذِى بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        latin: "Alhamdulillaahil ladzii bini'matihi tatimmush shaalihaat.",
        arti: "Segala puji bagi Allah, yang dengan nikmat-Nya sempurnalah segala kebaikan.",
        sumber: "HR. Ibnu Majah 3803, hasan",
      },
      {
        judul: "Doa Memohon Diberikan Waktu-Waktu yang Tenang",
        arab: "اللَّهُمَّ بَارِكْ لَنَا فِي وَقْتِنَا وَأَعْمَالِنَا",
        latin: "Allahumma baarik lanaa fii waqtinaa wa a'maalinaa.",
        arti: "Ya Allah, berkahilah waktu dan amal-amal kami.",
        sumber: "Doa ma'tsur",
      },
      {
        judul: "Doa Ketika Duduk Berzikir Bersama",
        arab: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        latin:
          "Laa ilaaha illallaahu wahdahu laa syariika lah, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai'in qadiir.",
        arti: "Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya, bagi-Nya kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu.",
        sumber: "HR. Bukhari 6403, Muslim 2691",
      },
      {
        judul: "Doa Memohon Diistiqamahkan Hati",
        arab: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا",
        latin: "Rabbanaa laa tuzigh quluubanaa ba'da idz hadaitanaa.",
        arti: "Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan setelah Engkau beri petunjuk kepada kami.",
        sumber: "QS. Ali 'Imran: 8",
      },
      {
        judul: "Doa Memohon Ditutup dengan Husnul Khatimah",
        arab: "اللَّهُمَّ اجْعَلْ خَيْرَ عُمُرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ",
        latin:
          "Allahummaj'al khaira 'umurii aakhirahu, wa khaira 'amalii khawaatimahu, wa khaira ayyaamii yauma alqaaka fiih.",
        arti: "Ya Allah, jadikanlah sebaik-baik umurku di penghujungnya, sebaik-baik amalku pada penutupnya, dan sebaik-baik hariku adalah hari aku berjumpa dengan-Mu.",
        sumber: "HR. Al-Hakim, hasan",
      },
    ],
    hadits: [
      {
        judul: "Dzikir Menenangkan Hati",
        arab: "سُبْحَانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَى نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        latin:
          "Subhanallahi wa bihamdihi 'adada khalqihi wa ridha nafsihi wa zinata 'arsyihi wa midada kalimatihi.",
        arti: "Maha Suci Allah dan dengan mengucapkan puji-pujian pada-Nya, sebanyak hitungan makhluk-Nya, sesuai dengan keridhaan Zat-Nya, seberat timbangan Arsy-Nya dan sepanjang beberapa kalimat-Nya.",
        sumber: "HR. Muslim",
      },
      {
        judul: "Perumpamaan Orang Berdzikir",
        arab: "مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ رَبَّهُ مَثَلُ الْحَيِّ وَالْمَيِّتِ",
        latin:
          "Matsalul ladzii yadzkuru rabbahu wal ladzii laa yadzkuru rabbahu matsalul hayyi wal mayyit.",
        arti: "Perumpamaan orang yang berdzikir kepada Rabbnya dengan orang yang tidak berdzikir adalah seperti orang hidup dengan orang mati.",
        sumber: "HR. Bukhari dan Muslim",
      },
      {
        judul: "Majelis Dzikir Dinaungi Rahmat",
        arab: "لَا يَقْعُدُ قَوْمٌ يَذْكُرُونَ اللَّهَ عَزَّ وَجَلَّ إِلَّا حَفَّتْهُمُ الْمَلَائِكَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ، وَنَزَلَتْ عَلَيْهِمُ السَّكِينَةُ، وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ",
        latin:
          "Laa yaq'udu qaumun yadzkuruunallaaha 'azza wa jalla illaa haffathumul malaa'ikah, wa ghasyiyathumur rahmah, wa nazalat 'alaihimus sakiinah, wa dzakarahumullaahu fiiman 'indah.",
        arti: "Tidaklah suatu kaum duduk berdzikir kepada Allah 'azza wa jalla melainkan para malaikat mengelilingi mereka, rahmat meliputi mereka, ketenangan turun kepada mereka, dan Allah menyebut mereka di hadapan makhluk yang ada di sisi-Nya.",
        sumber: "HR. Muslim 2700",
      },
      /* --- tambahan --- */
      {
        judul: "Ketenangan Turun Bersama Al-Qur'an",
        arab: "مَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ يَتْلُونَ كِتَابَ اللَّهِ وَيَتَدَارَسُونَهُ بَيْنَهُمْ، إِلَّا نَزَلَتْ عَلَيْهِمُ السَّكِينَةُ",
        latin:
          "Maajtama'a qaumun fii baitin min buyuutillaahi yatluuna kitaaballaahi wa yatadaarasuunahu bainahum, illaa nazalat 'alaihimus sakiinah.",
        arti: "Tidaklah suatu kaum berkumpul di salah satu rumah Allah, membaca Kitabullah dan saling mempelajarinya, melainkan ketenangan akan turun atas mereka.",
        sumber: "HR. Muslim 2699",
      },
      {
        judul: "Shalat Sebagai Penyejuk Mata Nabi",
        arab: "وَجُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلَاةِ",
        latin: "Wa ju'ilat qurratu 'ainii fish shalaah.",
        arti: "Dan dijadikan penyejuk mataku ada dalam shalat.",
        sumber: "HR. An-Nasa'i 3940, Ahmad, hasan",
      },
      {
        judul: "Orang yang Zuhud Hatinya Tenang",
        arab: "ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ",
        latin:
          "Izhad fid dunyaa yuhibbakallaah, wazhad fiimaa 'indan naasi yuhibbukan naas.",
        arti: "Berzuhudlah terhadap dunia, niscaya Allah akan mencintaimu. Berzuhudlah terhadap apa yang dimiliki manusia, niscaya manusia akan mencintaimu.",
        sumber: "HR. Ibnu Majah 4102, hasan",
      },
      {
        judul: "Kunci Ketenangan adalah Ridha dengan Ketetapan Allah",
        arab: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
        latin: "'Ajaban li amril mu'min, inna amrahu kulluhu khair.",
        arti: "Sungguh menakjubkan urusan orang mukmin, segala urusannya adalah baik baginya.",
        sumber: "HR. Muslim 2999",
      },
      {
        judul: "Hati yang Tenang Adalah Hati yang Bersih",
        arab: "أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلَا وَهِيَ الْقَلْبُ",
        latin:
          "Alaa wa inna fil jasadi mudhghatan idzaa shalahat shalahal jasadu kulluh, wa idzaa fasadat fasadal jasadu kulluh, alaa wa hiyal qalb.",
        arti: "Ketahuilah, sesungguhnya dalam tubuh ada segumpal daging, apabila ia baik maka baiklah seluruh tubuh, dan apabila ia rusak maka rusaklah seluruh tubuh. Ketahuilah, itu adalah hati.",
        sumber: "HR. Bukhari 52, Muslim 1599",
      },
      {
        judul: "Doa Nabi Meminta Ketenangan dari Allah",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
        latin:
          "Allahumma inni as'alukal hudaa wat tuqaa wal 'afaafa wal ghinaa.",
        arti: "Ya Allah, aku memohon kepada-Mu petunjuk, ketakwaan, kesucian diri, dan kecukupan (hati).",
        sumber: "HR. Muslim 2721",
      },
    ],
  },
];

export function getMood(key: MoodKey): Mood | undefined {
  return MOOD_LIST.find((m) => m.key === key);
}
