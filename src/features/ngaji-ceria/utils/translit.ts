// src/features/ngaji-ceria/utils/translit.ts

const HARAKAT_WORDS: Record<string, string> = {
  fathatain: 'ــً',
  'fat-hatain': 'ــً',
  fatahtain: 'ــً',
  'fathah berdiri': 'ــٰ',
  'fathah tegak': 'ــٰ',
  fathah: 'ــَ',
  'fat-hah': 'ــَ',
  fatah: 'ــَ',
  kasratain: 'ــٍ',
  kasrohtain: 'ــٍ',
  'kasrah berdiri': 'ــٖ',
  'kasrah tegak': 'ــٖ',
  kasrah: 'ــِ',
  kasroh: 'ــِ',
  kasra: 'ــِ',
  dammatain: 'ــٌ',
  dhammatain: 'ــٌ',
  dommatain: 'ــٌ',
  dhommatain: 'ــٌ',
  'dammah terbalik': 'ــٗ',
  dammah: 'ــُ',
  dhammah: 'ــُ',
  dommah: 'ــُ',
  dhommah: 'ــُ',
  damma: 'ــُ',
  dhamma: 'ــُ',
  sukun: 'ــْ',
  sukoon: 'ــْ',
  tasydid: 'ــّ',
  tasdid: 'ــّ',
  syaddah: 'ــّ',
};

const HARAKAT_KEYS = Object.keys(HARAKAT_WORDS).sort((a, b) => b.length - a.length);

const CONSONANTS_2: Record<string, string> = {
  'ts': 'ث', 'th': 'ط', 'kh': 'خ', 'dz': 'ذ', 'dh': 'ض',
  'sy': 'ش', 'sh': 'ص', 'zh': 'ظ', 'gh': 'غ', 'ny': 'ن',
  'hh': 'ه'
};

const CONSONANTS_1: Record<string, string> = {
  'b': 'ب', 't': 'ت', 'j': 'ج', 'h': 'ح', 'd': 'د', 'r': 'ر',
  'z': 'ز', 's': 'س', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل',
  'm': 'م', 'n': 'ن', 'w': 'و', 'y': 'ي', "'": 'ع', '`': 'ع',
  '\u0001': 'ه'
};

const VOWELS: Record<string, string> = {
  'an': 'ً', 'in': 'ٍ', 'un': 'ٌ',
  'a': 'َ', 'i': 'ِ', 'u': 'ُ',
  'o': 'َ', 'e': 'ِ'
};

const KNOWN_ARABIC_WORDS: Record<string, string> = {
  hahunaa: 'هَاهُنَا',
  haahunaa: 'هٰهُنَا',
  hahuna: 'هَهُنَا',
  zahaqa: 'زَهَقَ',
  zahaqan: 'زَهَقًا',
  huwa: 'هُوَ',
  hiya: 'هِيَ',
  humaa: 'هُمَا',
  hum: 'هُمْ',
  hunna: 'هُنَّ',
  hadza: 'هٰذَا',
  haadza: 'هٰذَا',
  hadzihi: 'هٰذِهِ',
  haulaai: 'هٰٓؤُلَاءِ',
  halaka: 'هَلَكَ',
  hazama: 'هَزَمَ',
  lahu: 'لَهٗ',
  lahum: 'لَهُمْ',
  bihi: 'بِهٖ',
  fiiha: 'فِيْهَا',
  fiihaa: 'فِيْهَا',
  minhu: 'مِنْهُ',
  minhum: 'مِنْهُمْ',
  anhu: 'عَنْهُ',
  anhum: 'عَنْهُمْ',
  alayhim: 'عَلَيْهِمْ',
  alayhi: 'عَلَيْهِ',
  allahu: 'اللّٰهُ',
  allaha: 'اللّٰهَ',
  allahi: 'اللّٰهِ',
  lillahi: 'لِلّٰهِ',
  alhamdulillah: 'الْحَمْدُ لِلّٰهِ',
  dzahaba: 'ذَهَبَ',
  huda: 'هُدًى',
  hudan: 'هُدًى',
  ahli: 'اَهْلِ',
  yahdi: 'يَهْدِيْ',
  ihdina: 'اِهْدِنَا',
  hamiymun: 'حَمِيْمٌ',
  hamim: 'حَمِيْمٌ',
  rahima: 'رَحِمَ',
  marhamatan: 'مَرْحَمَةً',
  sanatin: 'سَنَةٍ',
};

/**
 * Transliterasi Latin ke Arab otomatis (Tilawati style)
 * Contoh: "ta" -> "تَ", "ba" -> "بَ", "ta ba ta" -> "تَ بَ تَ", "bata" -> "بَتَ"
 * Contoh Harakat: "fathah – kasrah – dammah" -> "ــَ ــِ ــُ"
 */
export function latinToArabic(text: string): string {
  if (!text) return '';

  const trimmed = text.trim();
  const trimmedLower = trimmed.toLowerCase();
  if (KNOWN_ARABIC_WORDS[trimmedLower]) {
    return KNOWN_ARABIC_WORDS[trimmedLower];
  }

  const hasHarakat = HARAKAT_KEYS.some((k) => trimmedLower.includes(k));
  if (!hasHarakat && /[\s]/.test(text)) {
    const tokens = text.split(/(\s+)/);
    return tokens.map((t) => (/^\s+$/.test(t) ? t : latinToArabic(t))).join('');
  }

  // Preservasi 'H' kapital sebagai penanda ha tebal (ه)
  let s = text.replace(/H/g, '\u0001');
  s = s.toLowerCase();
  if (hasHarakat) {
    s = s.replace(/[\t ]*[–—-][\t ]*/g, ' ');
  }

  const res: string[] = [];
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    // Simbol spasi / pemisah / new line
    if (' \t\n\r-,._/–—'.includes(c)) {
      res.push(c);
      i++;
      continue;
    }

    // Cek harakat mandiri (fathah, kasrah, dammah, dll)
    const prevSep = i === 0 || /[\s\-_–—,.;/]/.test(s[i - 1]);
    let matchedHarakat: string | null = null;
    if (prevSep) {
      for (const k of HARAKAT_KEYS) {
        if (s.startsWith(k, i)) {
          const nextIdx = i + k.length;
          const nextSep = nextIdx === s.length || /[\s\-_–—,.;/]/.test(s[nextIdx]);
          if (nextSep) {
            matchedHarakat = k;
            break;
          }
        }
      }
    }

    if (matchedHarakat) {
      res.push(HARAKAT_WORDS[matchedHarakat]);
      i += matchedHarakat.length;
      continue;
    }

    let cons: string | null = null;
    let cLen = 0;

    // Deteksi ha tebal (ه):
    // 1. Prefix isyarat hahuna(a)
    // 2. Akhiran dhomir (-hu, -hi, -ha, -haa, -hum, -him, -huma, -humaa, -hunna)
    const isHahuna = s.startsWith('hahu', i);
    const isPronounSuffix =
      c === 'h' &&
      i > 1 &&
      (s.substring(i) === 'hu' ||
        s.substring(i) === 'hi' ||
        s.substring(i) === 'ha' ||
        s.substring(i) === 'haa' ||
        s.substring(i) === 'hum' ||
        s.substring(i) === 'him' ||
        s.substring(i) === 'huma' ||
        s.substring(i) === 'humaa' ||
        s.substring(i) === 'hunna');

    if (isHahuna || isPronounSuffix) {
      cons = 'ه';
      cLen = 1;
    } else if (i + 2 <= s.length && CONSONANTS_2[s.substring(i, i + 2)]) {
      cons = CONSONANTS_2[s.substring(i, i + 2)];
      cLen = 2;
    } else if (CONSONANTS_1[c]) {
      cons = CONSONANTS_1[c];
      cLen = 1;
    } else if (['a', 'i', 'u', 'o', 'e'].includes(c)) {
      const v2 = s.substring(i, i + 2);
      if (v2 === 'aa') {
        res.push('آ');
        i += 2;
      } else if (v2 === 'ii' || (v2 === 'iy' && !/[aiueo]/.test(s[i + 2] || ''))) {
        res.push('إِيْ');
        i += 2;
      } else if (v2 === 'uu' || (v2 === 'uw' && !/[aiueo]/.test(s[i + 2] || ''))) {
        res.push('أُوْ');
        i += 2;
      } else {
        res.push('ا' + (VOWELS[c] || 'َ'));
        i++;
      }
      continue;
    } else {
      res.push(c);
      i++;
      continue;
    }

    i += cLen;
    let vowel: string | null = null;

    const v2 = i + 2 <= s.length ? s.substring(i, i + 2) : '';
    const isTanwin = v2 === 'an' || v2 === 'in' || v2 === 'un';

    if (isTanwin) {
      // Tanwin hanya sah di akhir kata (setelah n adalah batas kata / spasi / akhir teks)
      const nextChar = i + 2 < s.length ? s[i + 2] : '';
      const isWordEnd = !nextChar || /[\s\-_–—,.;/]/.test(nextChar);
      if (isWordEnd) {
        vowel = VOWELS[v2];
        i += 2;
      } else {
        // Bukan tanwin karena diikuti karakter kata lain (seperti 'ani' -> a + ni)
        vowel = VOWELS[s[i]];
        i++;
      }
    } else if (v2 === 'aa') {
      vowel = 'َا';
      i += 2;
    } else if (v2 === 'ii' || (v2 === 'iy' && !/[aiueo]/.test(s[i + 2] || ''))) {
      vowel = 'ِيْ';
      i += 2;
    } else if (v2 === 'uu' || (v2 === 'uw' && !/[aiueo]/.test(s[i + 2] || ''))) {
      vowel = 'ُوْ';
      i += 2;
    } else if (i < s.length && VOWELS[s[i]]) {
      vowel = VOWELS[s[i]];
      i++;
    }

    if (vowel && cons) {
      if (vowel === 'ً' && cons !== 'ة' && cons !== 'ء' && cons !== 'ى') {
        res.push(cons + vowel + 'ا');
      } else {
        res.push(cons + vowel);
      }
    } else if (cons) {
      res.push(cons);
    }
  }

  return res.join('');
}

export function quickTranslit(latin: string): string {
  return latinToArabic(latin);
}

const ARABIC_HARAKAT_STANDALONE: Record<string, string> = {
  '\u064e': 'fathah',
  '\u0650': 'kasrah',
  '\u064f': 'dammah',
  '\u064b': 'fathatain',
  '\u064d': 'kasratain',
  '\u064c': 'dammatain',
  '\u0652': 'sukun',
  '\u0651': 'tasydid',
  '\u0670': 'fathah berdiri',
  '\u0656': 'kasrah berdiri',
  '\u0657': 'dammah terbalik',
};

const ARABIC_LETTER_MAP: Record<string, string> = {
  'ث': 'ts', 'ط': 'th', 'خ': 'kh', 'ذ': 'dz', 'ض': 'dh',
  'ش': 'sy', 'ص': 'sh', 'ظ': 'zh', 'غ': 'gh',
  'ب': 'b', 'ت': 't', 'ج': 'j', 'ح': 'h', 'د': 'd', 'ر': 'r',
  'ز': 'z', 'س': 's', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
  'م': 'm', 'ن': 'n', 'و': 'w', 'ي': 'y', 'ع': "'",
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ى': 'a', 'ء': "'", 'ؤ': "'", 'ئ': "'",
  'ة': 'h', 'ه': 'h',
  '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5',
  '٦': '6', '٧': '7', '٨': '8', '٩': '9', '٠': '0',
};

const VOWEL_MAP: Record<string, string> = {
  '\u064e': 'a',
  '\u0650': 'i',
  '\u064f': 'u',
  '\u064b': 'an',
  '\u064d': 'in',
  '\u064c': 'un',
  '\u0670': 'aa',
  '\u0656': 'i', // kasrah berdiri / subscript alef
  '\u0657': 'u', // dammah terbalik / inverted dammah
  '\u0653': '',  // maddah / tanda mad panjang (ٓ)
  '\u0654': '',  // hamzah di atas
  '\u0655': '',  // hamzah di bawah
  '\u0652': '',  // sukun
  '\u06df': '',  // sifr mustadir
  '\u06e0': '',  // sifr mustatil
  '\u06e1': '',  // kepala kho (sukun mushaf)
  '\u06e2': '',  // mim kecil
};

const QURANIC_ORNAMENTS = /[\u06d6-\u06ed\u0600-\u0605\u25cb\u25ef]/g;
const WAQF_SYMBOL = '\u25cb';  // ○

function arabicTokenToLatin(token: string): string {
  const hasWaqf = token.includes(WAQF_SYMBOL);
  // Remove waqf symbol for processing; if waqf present, skip tanwin output
  const cleanToken = token.replace(WAQF_SYMBOL, '');
  const strippedTatweel = cleanToken.replace(/\u0640+/g, '');
  if (strippedTatweel.length === 1 && ARABIC_HARAKAT_STANDALONE[strippedTatweel]) {
    return ARABIC_HARAKAT_STANDALONE[strippedTatweel];
  }

  let out = '';
  let i = 0;
  let prevVowel = '';

  while (i < cleanToken.length) {
    const ch = cleanToken[i];

    if (ch === '\u0640') {
      i++;
      continue;
    }

    if (ARABIC_LETTER_MAP[ch] !== undefined) {
      // Alif / alif maqsura penyangga tanwin fathatain (ـًا / ـًى) bersifat silent
      if ((ch === 'ا' || ch === 'ى') && prevVowel === 'an') {
        const nextChar = i + 1 < cleanToken.length ? cleanToken[i + 1] : '';
        if (!VOWEL_MAP[nextChar] || nextChar === '\u0652') {
          i++;
          if (i < cleanToken.length && cleanToken[i] === '\u0652') i++;
          continue;
        }
      }

      const isStart = i === 0;
      let letter = ARABIC_LETTER_MAP[ch];
      if ((ch === 'أ' || ch === 'إ') && !isStart) {
        letter = "'";
      }
      i++;

      let hasShaddah = false;
      if (i < cleanToken.length && cleanToken[i] === '\u0651') {
        hasShaddah = true;
        i++;
      }

      let vowel = '';
      if (i < cleanToken.length && VOWEL_MAP[cleanToken[i]] !== undefined) {
        const vowelChar = cleanToken[i];
        vowel = VOWEL_MAP[vowelChar];
        // When waqf present, suppress tanwin (fathatain/dammatain/kasratain)
        if (hasWaqf && (vowel === 'an' || vowel === 'in' || vowel === 'un')) {
          vowel = '';
        }
        // U+0657 (inverted-dammah) on ta marbuta (ة): silent 'h', no vowel emitted
        if (ch === 'ة' && vowelChar === '\u0657') {
          letter = 'h';
          vowel = '';
        }
        i++;
      }

      if (ch === 'ة') {
        letter = vowel ? 't' : 'h';
      }

      if ((ch === 'ا' || ch === 'ى') && vowel === 'an' && out.endsWith('a')) {
        out = out.slice(0, -1);
      }

      if (ch === 'ا' || ((ch === 'أ' || ch === 'إ') && isStart)) {
        out += vowel || letter;
      } else {
        if (hasShaddah) {
          if (!out.endsWith(letter)) {
            letter += letter;
          }
        }
        out += letter + vowel;
      }

      prevVowel = vowel;
      continue;
    }

    if (VOWEL_MAP[ch] !== undefined) {
      const v = VOWEL_MAP[ch];
      // When waqf present, suppress tanwin
      if (hasWaqf && (v === 'an' || v === 'in' || v === 'un')) {
        prevVowel = '';
      } else {
        out += v;
        prevVowel = v;
      }
      i++;
      continue;
    }

    out += ch;
    prevVowel = '';
    i++;
  }
  return out;
}

/**
 * Transliterasi Arab ke Latin (array per token / kata)
 */
export function arabicToLatinParts(arabic: string): string[] {
  if (!arabic) return [];
  // Merge waqf symbol with adjacent token so tanwin is suppressed when waqf present.
  // Handles waqf at start (^○ space) and after word (space ○).
  const waqfAtStart = new RegExp(`^${WAQF_SYMBOL}\\s+`, 'g');
  const waqfAfterWord = new RegExp(`\\s+${WAQF_SYMBOL}`, 'g');
  const withWaqf = arabic.replace(waqfAtStart, WAQF_SYMBOL).replace(waqfAfterWord, WAQF_SYMBOL).trim();
  const rawTokens = withWaqf.trim().split(/\s+/).filter(Boolean);
  return rawTokens
    .filter((t) => !/^[\u06d6-\u06ed\u0600-\u0605\u25cb\u25ef\d\s١-٩٠=:\-–—.,_/]+$/.test(t))
    .map((t) => t.replace(/[\u06d6-\u06ed\u0600-\u0605\u25ef]/g, ''))
    .filter(Boolean)
    .map(arabicTokenToLatin)
    .filter((part) => part && !/^[=:\-–—.,_/]+$/.test(part));
}

/**
 * Transliterasi Arab ke Latin otomatis
 */
export function arabicToLatin(arabic: string): string {
  return arabicToLatinParts(arabic).join(' ');
}
