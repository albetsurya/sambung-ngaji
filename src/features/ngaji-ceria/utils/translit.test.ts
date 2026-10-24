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
});
