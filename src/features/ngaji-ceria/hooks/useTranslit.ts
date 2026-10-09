// src/features/ngaji-ceria/hooks/useTranslit.ts
import { useCallback } from 'react';
import { quickTranslit } from '../utils/translit';

export function useTranslit() {
  /**
   * Mengonversi teks Latin (transliterasi) menjadi teks Arab dengan harakat.
   * Dirancang untuk bekerja dengan pola Tilawati.
   */
  const transliterateToArabic = useCallback((latin: string): string => {
    if (!latin) return '';
    // Kita gunakan quickTranslit yang menangani "ba" -> "بَ" dsb.
    return quickTranslit(latin);
  }, []);

  return {
    transliterateToArabic,
  };
}
