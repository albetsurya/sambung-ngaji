import { shuffle } from "../../_shared/random";

export type QuestionType = "lanjut-ayat" | "nama-surah" | "arti-ayat";
export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  promptArabic: string;
  options: string[];
  correctIndex: number;
  surahName: string;
  ayahNumber: number;
}

export interface VerseSeed {
  id: string;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  nextArabic: string;
  translation: string;
}

// TODO: review oleh ustadz/ustadzah. Teks ini juga menjadi sumber Ayat Scramble.
export const JUZ_AMMA_VERSES: VerseSeed[] = [
  { id: "114-1", surahName: "An-Nas", ayahNumber: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", nextArabic: "مَلِكِ النَّاسِ", translation: "Katakanlah, aku berlindung kepada Tuhannya manusia." },
  { id: "114-2", surahName: "An-Nas", ayahNumber: 2, arabic: "مَلِكِ النَّاسِ", nextArabic: "إِلَٰهِ النَّاسِ", translation: "Raja manusia." },
  { id: "113-1", surahName: "Al-Falaq", ayahNumber: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", nextArabic: "مِنْ شَرِّ مَا خَلَقَ", translation: "Katakanlah, aku berlindung kepada Tuhan yang menguasai subuh." },
  { id: "113-2", surahName: "Al-Falaq", ayahNumber: 2, arabic: "مِنْ شَرِّ مَا خَلَقَ", nextArabic: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "Dari kejahatan makhluk yang Dia ciptakan." },
  { id: "112-1", surahName: "Al-Ikhlas", ayahNumber: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", nextArabic: "اللَّهُ الصَّمَدُ", translation: "Katakanlah, Dialah Allah Yang Maha Esa." },
  { id: "112-2", surahName: "Al-Ikhlas", ayahNumber: 2, arabic: "اللَّهُ الصَّمَدُ", nextArabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "Allah tempat meminta segala sesuatu." },
  { id: "111-1", surahName: "Al-Lahab", ayahNumber: 1, arabic: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", nextArabic: "مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ", translation: "Binasalah kedua tangan Abu Lahab dan benar-benar binasa dia." },
  { id: "110-1", surahName: "An-Nasr", ayahNumber: 1, arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", nextArabic: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", translation: "Apabila telah datang pertolongan Allah dan kemenangan." },
  { id: "109-1", surahName: "Al-Kafirun", ayahNumber: 1, arabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", nextArabic: "لَا أَعْبُدُ مَا تَعْبُدُونَ", translation: "Katakanlah, wahai orang-orang kafir." },
  { id: "109-2", surahName: "Al-Kafirun", ayahNumber: 2, arabic: "لَا أَعْبُدُ مَا تَعْبُدُونَ", nextArabic: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ", translation: "Aku tidak akan menyembah apa yang kamu sembah." },
  { id: "108-1", surahName: "Al-Kautsar", ayahNumber: 1, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", nextArabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", translation: "Sungguh, Kami telah memberimu nikmat yang banyak." },
  { id: "108-2", surahName: "Al-Kautsar", ayahNumber: 2, arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", nextArabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", translation: "Maka laksanakanlah salat karena Tuhanmu dan berkurbanlah." },
  { id: "107-1", surahName: "Al-Ma'un", ayahNumber: 1, arabic: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", nextArabic: "فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ", translation: "Tahukah kamu orang yang mendustakan agama?" },
  { id: "106-1", surahName: "Quraisy", ayahNumber: 1, arabic: "لِإِيلَافِ قُرَيْشٍ", nextArabic: "إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", translation: "Karena kebiasaan orang-orang Quraisy." },
  { id: "106-3", surahName: "Quraisy", ayahNumber: 3, arabic: "فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ", nextArabic: "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ", translation: "Maka hendaklah mereka menyembah Tuhan pemilik rumah ini (Ka'bah)." },
  { id: "105-1", surahName: "Al-Fil", ayahNumber: 1, arabic: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", nextArabic: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ", translation: "Tidakkah engkau memperhatikan bagaimana Tuhanmu bertindak terhadap pasukan bergajah?" },
  { id: "103-1", surahName: "Al-'Asr", ayahNumber: 1, arabic: "وَالْعَصْرِ", nextArabic: "إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ", translation: "Demi masa." },
  { id: "103-2", surahName: "Al-'Asr", ayahNumber: 2, arabic: "إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ", nextArabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", translation: "Sungguh, manusia berada dalam kerugian." },
  { id: "102-1", surahName: "At-Takatsur", ayahNumber: 1, arabic: "أَلْهَاكُمُ التَّكَاثُرُ", nextArabic: "حَتَّىٰ زُرْتُمُ الْمَقَابِرَ", translation: "Bermegah-megahan telah melalaikan kamu." },
  { id: "99-1", surahName: "Az-Zalzalah", ayahNumber: 1, arabic: "إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا", nextArabic: "وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا", translation: "Apabila bumi diguncangkan dengan guncangan yang dahsyat." },
  { id: "97-1", surahName: "Al-Qadr", ayahNumber: 1, arabic: "إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", nextArabic: "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ", translation: "Sesungguhnya Kami telah menurunkannya (Al-Qur'an) pada malam kemuliaan." },
  { id: "94-1", surahName: "Al-Insyirah", ayahNumber: 1, arabic: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", nextArabic: "وَوَضَعْنَا عَنْكَ وِزْرَكَ", translation: "Bukankah Kami telah melapangkan dadamu?" },
  { id: "94-5", surahName: "Al-Insyirah", ayahNumber: 5, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", nextArabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Maka sesungguhnya bersama kesulitan ada kemudahan." },
  { id: "93-2", surahName: "Ad-Duha", ayahNumber: 2, arabic: "وَاللَّيْلِ إِذَا سَجَىٰ", nextArabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", translation: "Dan demi malam apabila telah sunyi." },
  { id: "95-1", surahName: "At-Tin", ayahNumber: 1, arabic: "وَالتِّينِ وَالزَّيْتُونِ", nextArabic: "وَطُورِ سِينِينَ", translation: "Demi buah tin dan buah zaitun." },
];

const TYPES: QuestionType[] = ["lanjut-ayat", "nama-surah", "arti-ayat"];
const answerFor = (verse: VerseSeed, type: QuestionType) => type === "lanjut-ayat" ? verse.nextArabic : type === "nama-surah" ? verse.surahName : verse.translation;

// 25 ayat × 3 tipe = 75 soal, masing-masing dengan empat opsi unik.
export const JUZ_AMMA_QUESTIONS: Question[] = JUZ_AMMA_VERSES.flatMap((verse, verseIndex) => TYPES.map((type) => {
  const correct = answerFor(verse, type);
  const candidates = JUZ_AMMA_VERSES.slice(verseIndex + 1).concat(JUZ_AMMA_VERSES.slice(0, verseIndex));
  const distractors = [...new Set(candidates.map((item) => answerFor(item, type)))].filter((answer) => answer !== correct).slice(0, 3);
  return { id: `${verse.id}:${type}`, type, prompt: type === "lanjut-ayat" ? "Ayat berikutnya adalah…" : type === "nama-surah" ? "Potongan ini dari surah apa?" : "Apa arti ayat ini?", promptArabic: verse.arabic, options: [correct, ...distractors], correctIndex: 0, surahName: verse.surahName, ayahNumber: verse.ayahNumber };
}));

export function shuffleQuestions(): Question[] {
  // Distribusi tetap 40% lanjutan, 30% nama, 30% arti; opsi turut diacak.
  const session = TYPES.flatMap((type) => shuffle(JUZ_AMMA_QUESTIONS.filter((q) => q.type === type)).slice(0, type === "lanjut-ayat" ? 4 : 3));
  return shuffle(session).map((question) => {
    const answer = question.options[question.correctIndex];
    const options = shuffle(question.options);
    return { ...question, options, correctIndex: options.indexOf(answer) };
  });
}
