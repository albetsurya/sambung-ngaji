import { TILAWATI_JILID_1_PAGES } from "../data/tilawatiQuizData";

export const getFallbackAudioUrl = (pageNumber: number): string | null => {
  if (pageNumber >= 1 && pageNumber <= 5) return `/audio/tilawati/jilid_1/JILID 1-HAL 1-5_chunk_${pageNumber === 1 ? 1 : pageNumber === 2 ? 4 : pageNumber === 3 ? 6 : pageNumber === 4 ? 8 : 11}.ogg`;
  if (pageNumber >= 6 && pageNumber <= 10) return `/audio/tilawati/jilid_1/JILID 1-HAL 6-10_chunk_${pageNumber - 5 + 1}.ogg`;
  if (pageNumber >= 11 && pageNumber <= 15) return `/audio/tilawati/jilid_1/JILID 1-HAL 11-15_chunk_${pageNumber - 11}.ogg`;
  if (pageNumber >= 16 && pageNumber <= 20) return `/audio/tilawati/jilid_1/JILID 1-HAL 16-20_chunk_${pageNumber - 16 + 2}.ogg`;
  if (pageNumber >= 21 && pageNumber <= 25) return `/audio/tilawati/jilid_1/JILID 1-HAL 21-25_chunk_${pageNumber - 21 + 1}.ogg`;
  if (pageNumber >= 26 && pageNumber <= 30) return `/audio/tilawati/jilid_1/JILID 1-HAL 26-30_chunk_${pageNumber - 26}.ogg`;
  if (pageNumber >= 31 && pageNumber <= 35) return `/audio/tilawati/jilid_1/JILID 1-HAL 31-35_chunk_${pageNumber - 31 + 1}.ogg`;
  if (pageNumber >= 36 && pageNumber <= 40) return `/audio/tilawati/jilid_1/JILID 1-HAL 36-40_chunk_${pageNumber - 36 + 4}.ogg`;
  if (pageNumber >= 41 && pageNumber <= 44) return `/audio/tilawati/jilid_1/JILID 1-HAL 41-44_chunk_${pageNumber - 41 + 1}.ogg`;
  return null;
};
