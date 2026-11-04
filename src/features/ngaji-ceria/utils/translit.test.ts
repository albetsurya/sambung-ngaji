import { describe, it, expect } from 'vitest';
import { latinToArabic, arabicToLatin, arabicToLatinParts } from './translit';

describe('translit bidirectional conversions', () => {
  it('converts standalone harakat chain from Latin to Arabic', () => {
    const latin = 'fathah – kasrah – dammah – dammah – kasrah – dammah';
    expect(latinToArabic(latin)).toBe('ــَ ــِ ــُ ــُ ــِ ــُ');
  });

  it('converts standalone harakat chain from Arabic to Latin parts', () => {
    const arabic = 'ــَ ــِ ــُ ــُ ــِ ــُ';
    expect(arabicToLatinParts(arabic)).toEqual([
      'fathah',
      'kasrah',
      'dammah',
      'dammah',
      'kasrah',
      'dammah',
    ]);
  });

  it('converts standard Arabic words to Latin parts and back', () => {
    const arabic = 'اَ بَ تَ';
    expect(arabicToLatinParts(arabic)).toEqual(['a', 'ba', 'ta']);
    expect(latinToArabic('a ba ta')).toBe('اَ بَ تَ');
  });

  it('converts connected Arabic words correctly', () => {
    expect(arabicToLatin('وَلَكَ')).toBe('walaka');
  });

  it('handles fathatain with silent alif correctly (zahaqa zahaqan)', () => {
    expect(arabicToLatinParts('زَهَقَ   زَهَقًا')).toEqual(['zahaqa', 'zahaqan']);
    expect(arabicToLatin('زَهَقَ   زَهَقًا')).toBe('zahaqa zahaqan');
    expect(latinToArabic('zahaqan')).toContain('ً');
  });

  it('handles hamzah, ta marbutah, punctuation, and shaddah correctly', () => {
    expect(arabicToLatinParts('ءَ هَ')).toEqual(["'a", 'ha']);
    expect(arabicToLatinParts('يَمْلَؤُوْنَ')).toEqual(["yamla'uwna"]);
    expect(arabicToLatinParts('بَأْ')).toEqual(["ba'"]);
    expect(arabicToLatinParts('مَ = مَ')).toEqual(['ma', 'ma']);
    expect(arabicToLatinParts('اللّٰهِ')).toEqual(['allaahi']);
    expect(arabicToLatinParts('مَرْحَمَةً')).toEqual(['marhamatan']);
    expect(arabicToLatinParts('سَنَةٍ')).toEqual(['sanatin']);
  });

  it('correctly handles non-tanwin syllables like "ni" in "\'aniyatin"', () => {
    expect(latinToArabic("'aniyatin")).toBe('عَنِيَتٍ');
    expect(latinToArabic("'aaniyatin")).toBe('عَانِيَتٍ');
  });

  it('correctly distinguishes ha tebal (ه) vs ha tipis (ح)', () => {
    expect(latinToArabic('hahunaa')).toBe('هَاهُنَا');
    expect(latinToArabic('haahunaa')).toBe('هٰهُنَا');
    expect(latinToArabic('hha')).toBe('هَ');
    expect(latinToArabic('Ha')).toBe('هَ');
    expect(latinToArabic('ja ha kha')).toBe('جَ حَ خَ');
  });

  it('strips tanwin when waqf symbol (○) present', () => {
    expect(arabicToLatin('كَاذِبَةٌ ○')).toBe('kaadzibah');
    expect(arabicToLatin('كَاذِبَةٌ')).toBe('kaadzibatun');
  });

  it('handles waqf at end of sentence', () => {
    // Waqf at end suppresses tanwin of last word
    expect(arabicToLatin('كَاذِبَةٌ صَدَقَةٌ ○')).toBe('kaadzibatun shadaqah');
  });

  it('handles waqf in middle of sentence', () => {
    // Waqf suppresses tanwin of word before it
    expect(arabicToLatin('كَاذِبَةٌ ○ صَدَقَةٌ')).toBe('kaadzibah shadaqatun');
  });

  it('handles multiple waqf symbols', () => {
    expect(arabicToLatin('كَاذِبَةٌ ○ صَدَقَةٌ ○')).toBe('kaadzibah shadaqah');
  });

  it('handles inverted-dammah (U+0657) on ta marbuta', () => {
    // U+0657 (ٗ) after ة indicates silent - ة should be 'h', not 'tu'
    expect(arabicToLatin('ةٗ')).toBe('h');
    expect(arabicToLatin('حَمْدَةٗ')).toBe('hamdah');
    // Compare with regular dammah which gives 'tu'
    expect(arabicToLatin('ةُ')).toBe('tu');
    // U+0657 on ه (ha) still emits 'u'
    expect(arabicToLatin('لَهٗ')).toBe('lahu');
  });
});
