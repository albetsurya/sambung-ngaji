// src/features/ngaji-ceria/utils/translit.ts

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
 */
export function latinToArabic(text: string): string {
  if (!text) return '';
  
  const res: string[] = [];
  let i = 0;
  const s = text.toLowerCase();
  
  while (i < s.length) {
    const c = s[i];
    
    // Simbol spasi / pemisah / new line
    if (' \t\n\r-,._/'.includes(c)) {
      res.push(c);
      i++;
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
      res.push(cons + vowel);
    } else if (cons) {
      res.push(cons);
    }
  }
  
  return res.join('');
}

export function quickTranslit(latin: string): string {
  return latinToArabic(latin);
}
