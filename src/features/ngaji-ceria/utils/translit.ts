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
  'sy': 'ش', 'sh': 'ص', 'zh': 'ظ', 'gh': 'غ', 'ny': 'ن'
};

const CONSONANTS_1: Record<string, string> = {
  'b': 'ب', 't': 'ت', 'j': 'ج', 'h': 'ح', 'd': 'د', 'r': 'ر',
  'z': 'ز', 's': 'س', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل',
  'm': 'م', 'n': 'ن', 'w': 'و', 'y': 'ي', "'": 'ع', '`': 'ع'
};

const VOWELS: Record<string, string> = {
  'an': 'ً', 'in': 'ٍ', 'un': 'ٌ',
  'a': 'َ', 'i': 'ِ', 'u': 'ُ',
  'o': 'َ', 'e': 'ِ'
};

/**
 * Transliterasi Latin ke Arab otomatis (Tilawati style)
 * Contoh: "ta" -> "تَ", "ba" -> "بَ", "ta ba ta" -> "تَ بَ تَ", "bata" -> "بَتَ"
 * Contoh Harakat: "fathah – kasrah – dammah" -> "ــَ ــِ ــُ"
 */
export function latinToArabic(text: string): string {
  if (!text) return '';

  let s = text.toLowerCase();
  const hasHarakat = HARAKAT_KEYS.some((k) => s.includes(k));
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

    if (i + 2 <= s.length && CONSONANTS_2[s.substring(i, i + 2)]) {
      cons = CONSONANTS_2[s.substring(i, i + 2)];
      cLen = 2;
    } else if (CONSONANTS_1[c]) {
      cons = CONSONANTS_1[c];
      cLen = 1;
    } else if (['a', 'i', 'u', 'o', 'e'].includes(c)) {
      if (i + 2 <= s.length && VOWELS[s.substring(i, i + 2)]) {
        res.push('ا' + VOWELS[s.substring(i, i + 2)]);
        i += 2;
      } else {
        res.push('ا' + VOWELS[c]);
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

    if (i + 2 <= s.length && VOWELS[s.substring(i, i + 2)]) {
      const vStr = s.substring(i, i + 2);
      vowel = VOWELS[vStr];
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
  '\u0652': '',
};

function arabicTokenToLatin(token: string): string {
  const strippedTatweel = token.replace(/\u0640+/g, '');
  if (strippedTatweel.length === 1 && ARABIC_HARAKAT_STANDALONE[strippedTatweel]) {
    return ARABIC_HARAKAT_STANDALONE[strippedTatweel];
  }

  let out = '';
  let i = 0;
  let prevVowel = '';

  while (i < token.length) {
    const ch = token[i];

    if (ch === '\u0640') {
      i++;
      continue;
    }

    if (ARABIC_LETTER_MAP[ch] !== undefined) {
      // Alif / alif maqsura penyangga tanwin fathatain (ـًا / ـًى) bersifat silent
      if ((ch === 'ا' || ch === 'ى') && prevVowel === 'an') {
        const nextChar = i + 1 < token.length ? token[i + 1] : '';
        if (!VOWEL_MAP[nextChar] || nextChar === '\u0652') {
          i++;
          if (i < token.length && token[i] === '\u0652') i++;
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
      if (i < token.length && token[i] === '\u0651') {
        hasShaddah = true;
        i++;
      }

      let vowel = '';
      if (i < token.length && VOWEL_MAP[token[i]] !== undefined) {
        vowel = VOWEL_MAP[token[i]];
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
      out += VOWEL_MAP[ch];
      prevVowel = VOWEL_MAP[ch];
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
  const tokens = arabic.trim().split(/\s+/).filter(Boolean);
  return tokens
    .map(arabicTokenToLatin)
    .filter((part) => part && !/^[=:\-–—.,_]+$/.test(part));
}

/**
 * Transliterasi Arab ke Latin otomatis
 */
export function arabicToLatin(arabic: string): string {
  return arabicToLatinParts(arabic).join(' ');
}
