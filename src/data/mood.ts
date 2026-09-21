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
      'Perhatikan pola dari ayat-ayat di atas: Nabi Ya\'qub mengadu, "Sesungguhnya aku hanya mengadukan kesusahan dan kesedihanku kepada Allah" (Yusuf: 86) — beliau tidak menyembunyikan sedihnya, tapi beliau tahu ke mana harus mengadu. Nabi ﷺ pun menangis saat Ibrahim wafat, namun lisannya tetap menjaga: "kami tidak mengucapkan kecuali apa yang diridhai Rabb kami" (HR. Bukhari 1303). Dan di setiap ayat, selalu ada janji yang menyertai: "Allah bersama kita" (At-Taubah: 40), "bersama kesulitan ada kemudahan" (Asy-Syarh: 5), "Tuhanmu tidak meninggalkanmu" (Ad-Duha: 3). Maka hikmahnya: sedihmu bukan tanda lemahnya iman — yang menjadi masalah adalah ketika sedih membuatmu berhenti mengadu pada Allah atau berprasangka buruk pada-Nya. Air mata yang jatuh karena iman justru dicatat, dan setiap kesulitan yang dijalani dengan sabar akan berbuah pahala tanpa batas (Az-Zumar: 10).',
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
        judul: "Sabar di Awal Musibah",
        arab: "إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الْأُولَى",
        latin: "Innamash shabru 'indash shadmatil uulaa.",
        arti: "Sabar itu hanyalah pada saat pertama kali musibah datang.",
        sumber: "HR. Bukhari dan Muslim",
      },
      {
        judul: "Allah Bersama Orang yang Sabar",
        arab: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        latin: "Innallaaha ma'ash shaabiriin.",
        arti: "Sesungguhnya Allah beserta orang-orang yang sabar.",
        sumber: "QS. Al-Baqarah: 153",
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
      'Ayat-ayat di atas semuanya berporos pada satu kalimat: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenang" (Ar-Ra\'d: 28). Perhatikan bahwa Allah tidak menjawab kecemasan dengan menghilangkan masalah, tetapi dengan menjanjikan: jalan keluar bagi yang bertakwa (At-Talaq: 2), beban yang tidak melebihi kesanggupan (Al-Baqarah: 286), rezeki dari arah yang tak disangka (At-Talaq: 3), dan "cukuplah Allah bagi kami" (Ali \'Imran: 173). Bahkan ayat Al-Baqarah: 216 mengingatkan bahwa yang kau benci bisa jadi baik, dan yang kau suka bisa jadi buruk — artinya kecemasanmu belum tentu benar. Doa Nabi ﷺ "Allahumma inni a\'udzu bika minal hammi wal hazan" (HR. Bukhari 2893) mengajarkan bahwa cemas itu diakui sebagai beban, tetapi kita diajari berlindung darinya, bukan tenggelam di dalamnya. Hadits burung yang keluar pagi lapar dan pulang kenyang (HR. Ahmad) menunjukkan bahwa tawakal itu tetap bergerak — bukan pasrah tanpa usaha.',
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
    ],
    hadits: [
      {
        judul: "Tawakal Seperti Burung",
        arab: "لَوْ أَنَّكُمْ تَوَكَّلْتُمْ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ، لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا",
        latin:
          "Lau annakum tawakkaltum 'alallaahi haqqa tawakkulihi, larazaqakum kamaa yarzuquth thaira, taghduu khimaashan wa taruuhu bithaanan.",
        arti: "Sungguh, seandainya kalian bertawakkal kepada Allah sebenar-benar tawakkal, niscaya kalian akan diberi rizki sebagaimana rezeki burung-burung. Mereka berangkat pagi-pagi dalam keadaan lapar, dan pulang sore hari dalam keadaan kenyang.",
        sumber:
          "HR. Ahmad, Tirmidzi no. 2344, Ibnu Majah no. 4164, hasan sahih",
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
      {
        judul: "Cukuplah Allah Sebagai Pelindung",
        arab: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        latin: "Hasbunallaahu wa ni'mal wakiil.",
        arti: "Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung.",
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
    nasehat:
      'Ayat-ayat di atas menunjukkan bahwa syukur bukan sekadar ucapan, melainkan sebuah siklus: "Jika kamu bersyukur, pasti Aku akan menambah (nikmat) kepadamu" (Ibrahim: 7), "Bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat)-Ku" (Al-Baqarah: 152), dan "Barangsiapa bersyukur, sesungguhnya ia bersyukur untuk dirinya sendiri" (Luqman: 12). Perhatikan bahwa Allah tidak butuh syukur kita — kitalah yang butuh. An-Nahl: 18 mengingatkan bahwa nikmat Allah tak terhitung, dan Ad-Duha: 11 memerintahkan "terhadap nikmat Tuhanmu, hendaklah engkau menyebut-nyebutnya" — artinya syukur itu juga dibagikan, bukan hanya disimpan. Doa Nabi Sulaiman "Rabbi auzi\'nii an asykura ni\'matak" (Al-Ahqaf: 15) menunjukkan bahwa bahkan seorang raja yang diberi kerajaan pun masih memohon agar bisa bersyukur — karena syukur itu sendiri adalah nikmat yang perlu diminta. Doa pagi hari "Allahumma ma ashbaha bi min ni\'matin..." (HR. An-Nasa\'i) mengajarkan bahwa nikmat sekecil apapun di pagi hari sudah cukup untuk memenuhi syukur seharian.',
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
        sumber: "HR. An-Nasa'i dalam 'Amal al-Yaum wa al-Lailah",
      },
      {
        judul: "Doa Memohon Hati yang Syukur",
        arab: "اللَّهُمَّ اجْعَلْنِي شَكُورًا وَاجْعَلْنِي صَبُورًا وَاجْعَلْنِي فِي عَيْنِي صَغِيرًا وَفِي أَعْيُنِ النَّاسِ كَبِيرًا",
        latin:
          "Allahummaj'alnii syakuuran waj'alnii shabuuran waj'alnii fii 'ainii shaghiiran wa fii a'yunin naasi kabiira.",
        arti: "Ya Allah, jadikanlah aku hamba yang bersyukur, jadikanlah aku hamba yang sabar, jadikanlah aku kecil di mataku sendiri dan besar di mata manusia.",
        sumber: "HR. IslamQA, hasan",
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
      'Ayat-ayat di atas semuanya berbicara tentang menahan dan memaafkan: "orang-orang yang menahan amarahnya dan memaafkan" (Ali \'Imran: 134), "siapa yang bersabar dan memaafkan, itu termasuk hal yang diutamakan" (Asy-Syura: 43), "tolaklah dengan cara yang lebih baik, maka musuhmu akan menjadi teman setia" (Fussilat: 34), "jadilah pemaaf dan berpalinglah dari orang bodoh" (Al-A\'raf: 199). Perhatikan bahwa Allah tidak melarang marah — Dia mengarahkan apa yang harus dilakukan dengan amarah itu. Bahkan An-Nur: 22 mengaitkan memaafkan dengan ampunan Allah: "Apakah kamu tidak ingin bahwa Allah mengampunimu?" Doa "A\'udzu billahi minasy syaithanir rajim" yang diajarkan Nabi ﷺ saat marah (HR. Bukhari 3282) menunjukkan bahwa akar marah itu sering dari setan — dan cara melawannya bukan dengan menuruti, tetapi dengan berlindung. Hadits "orang kuat adalah yang mengendalikan diri saat marah" (HR. Bukhari-Muslim) mengubah definisi kekuatan: bukan yang menang bergulat, tetapi yang menang atas dirinya sendiri.',
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
      "Istirahatlah. Bahkan Rasulullah ﷺ pun butuh waktu untuk dirinya sendiri.",
    nasehat:
      'Ayat-ayat di atas mengajarkan bahwa istirahat itu bagian dari desain Allah: "Kami jadikan tidurmu untuk istirahat" (An-Naba: 9), "Kami jadikan malam dan siang supaya kamu beristirahat" (Al-Qashash: 73). Bahkan perintah tahajud pun disebut "nafilah" — ibadah tambahan, bukan beban yang memaksa (Al-Isra: 79). Ayat "bersama kesulitan ada kemudahan" diulang dua kali (Asy-Syarh: 5-6), seolah menegaskan bahwa kelegaan itu pasti datang, dan "Kami tinggikan sebutan namamu" (Asy-Syarh: 4) mengingatkan bahwa lelahmu dalam kebaikan tidak akan sia-sia. Nabi ﷺ menegur Abdullah bin Amr yang shalat terus-menerus: "Sesungguhnya tubuhmu punya hak atas dirimu" (HR. Bukhari 1975). Doa "Allahumma inni a\'udzu bika minal \'ajzi wal kasal" (HR. Bukhari 6367) bukan untuk orang malas, tetapi untuk orang yang lelah dan ingin tetap kuat. Hikmahnya: rehatlah dengan niat yang benar, karena tidurmu bisa menjadi ibadah jika kau niatkan untuk bangkit kembali.',
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
      {
        judul: "Tidur Sebagai Istirahat",
        arab: "وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا",
        latin: "Wa ja'alnaa naumakum subaataa.",
        arti: "Dan Kami jadikan tidurmu untuk istirahat.",
        sumber: "QS. An-Naba: 9",
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
      'Ayat-ayat di atas mengarah pada satu kesimpulan: "Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung" (Ali \'Imran: 173). Ayat-ayat ini tidak menjanjikan bahwa tidak akan ada bahaya, tetapi menjanjikan bahwa Allah cukup untuk menghadapinya: "Allah adalah Pemberi kecukupan bagimu" (Al-Anfal: 62), "tidak ada kekhawatiran bagi wali-wali Allah" (Yunus: 62), "jangan takut kepada mereka, tetapi takutlah kepada-Ku" (Ali \'Imran: 175). Perhatikan bahwa rasa takut itu diakui — bahkan Nabi ﷺ mengajarkan doa perlindungan dari segala penjuru (HR. Abu Dawud 5074). Yang dilarang adalah takut kepada makhluk melebihi takut kepada Allah. Doa "Bismillahil ladzi la yadhurru ma\'asmihi syai\'un..." mengajarkan bahwa perlindungan itu bukan dari kekuatan kita, tetapi dari nama Allah yang tidak ada sesuatu pun bisa menembusnya. Hadits "Jagalah Allah, maka Allah akan menjagamu" (HR. Tirmidzi 2516) adalah kontrak: siapa yang menjaga batas-batas Allah, Allah akan menjaga dia di mana pun dia berada.',
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
      {
        judul: "Aman dari Segala Bahaya",
        arab: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin:
          "Bismillahil ladzi la yadhurru ma'asmihi syai'un fil ardhi wa la fis sama'i wa huwas sami'ul 'alim.",
        arti: "Dengan nama Allah yang dengan nama-Nya tidak ada sesuatu pun yang membahayakan, baik di bumi maupun di langit. Dan Dia Maha Mendengar lagi Maha Mengetahui.",
        sumber: "HR. Abu Dawud 5088, hasan",
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
      'Ayat-ayat di atas semuanya adalah panggilan untuk tidak berhenti: "Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya" (Az-Zumar: 53), "Dan janganlah kamu berputus asa dari rahmat Allah" (Yusuf: 87), "orang-orang yang berjihad untuk (mencari keridhaan) Kami, benar-benar akan Kami tunjukkan kepada mereka jalan-jalan Kami" (Al-Ankabut: 69). Perhatikan bahwa Allah tidak mengatakan "jangan bersedih" atau "jangan gagal" — Dia mengatakan "jangan putus asa dari rahmat-Ku". Artinya, boleh gagal, boleh jatuh, boleh salah — yang tidak boleh adalah berhenti percaya bahwa rahmat Allah masih terbuka. Doa Nabi Yunus dibaca saat beliau berada dalam tiga kegelapan: malam, laut, dan perut ikan — dan Allah menyelamatkannya (Al-Anbiya: 87-88). Doa Nabi Zakariya dibaca saat beliau sudah tua dan mandul — dan Allah memberinya Yahya (Al-Anbiya: 89-90). Hadits "rahmat-Ku mengalahkan murka-Ku" (HR. Bukhari-Muslim) adalah jaminan bahwa pintu itu tidak pernah tertutup.',
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
      {
        judul: "Jangan Berputus Asa dari Rahmat Allah",
        arab: "وَلَا تَايْأَسُوا مِن رَّوْحِ اللَّهِ",
        latin: "Wa laa tai'asuu min rauhillaah.",
        arti: "Dan janganlah kamu berputus asa dari rahmat Allah.",
        sumber: "QS. Yusuf: 87",
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
    pembuka: "Duduklah. Ambil napas. Biarkan ayat-ayat ini menenangkan jiwamu.",
    nasehat:
      'Ayat-ayat di atas semuanya berbicara tentang sakinah — ketenangan yang Allah turunkan, bukan yang diciptakan sendiri: "Dialah yang menurunkan ketenangan ke dalam hati orang-orang mukmin" (Al-Fath: 4), "hanya dengan mengingat Allah hati menjadi tenang" (Ar-Ra\'d: 28), "Hai jiwa yang tenang" (Al-Fajr: 27). Perhatikan bahwa ketenangan itu bukan hasil dari hilangnya masalah — Yusuf tetap dipenjara, Nabi ﷺ tetap diusir, tetapi hati mereka tenang. Ar-Rum: 21 menyebut pasangan sebagai sumber ketenangan — artinya ketenangan itu juga hadir lewat orang-orang di sekitar kita, bukan hanya lewat ibadah individual. Doa "Ya Hayyu ya Qayyum, birahmatika astaghits" mengajarkan bahwa saat segala cara sudah dicoba, yang tersisa adalah memohon rahmat Allah — dan itu bukan jalan terakhir, itu jalan utama. Hadits "majelis dzikir dinaungi rahmat dan dituruni sakinah" (HR. Muslim 2700) menunjukkan bahwa ketenangan itu sering datang justru saat kita duduk bersama orang-orang yang mengingat Allah.',
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
      {
        judul: "Hati Tenang dengan Dzikir",
        arab: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        latin: "Alaa bidzikrillaahi tathma'innul quluub.",
        arti: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenang.",
        sumber: "QS. Ar-Ra'd: 28",
      },
    ],
  },
];

export function getMood(key: MoodKey): Mood | undefined {
  return MOOD_LIST.find((m) => m.key === key);
}
