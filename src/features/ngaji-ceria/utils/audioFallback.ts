// Helper fallback url audio utuh per jilid & halaman
export const getFallbackAudioUrl = (jilid: number, pageNumber: number): string | null => {
  if (jilid === 1) {
    if (pageNumber >= 1 && pageNumber <= 5) return `/audio/tilawati/jilid_1/JILID 1-HAL 1-5_chunk_${pageNumber === 1 ? 1 : pageNumber === 2 ? 4 : pageNumber === 3 ? 6 : pageNumber === 4 ? 8 : 11}.ogg`;
    if (pageNumber >= 6 && pageNumber <= 10) return `/audio/tilawati/jilid_1/JILID 1-HAL 6-10_chunk_${pageNumber - 5 + 1}.ogg`;
    if (pageNumber >= 11 && pageNumber <= 15) return `/audio/tilawati/jilid_1/JILID 1-HAL 11-15_chunk_${pageNumber - 11}.ogg`;
    if (pageNumber >= 16 && pageNumber <= 20) return `/audio/tilawati/jilid_1/JILID 1-HAL 16-20_chunk_${pageNumber - 16 + 2}.ogg`;
    if (pageNumber >= 21 && pageNumber <= 25) return `/audio/tilawati/jilid_1/JILID 1-HAL 21-25_chunk_${pageNumber - 21 + 1}.ogg`;
    if (pageNumber >= 26 && pageNumber <= 30) return `/audio/tilawati/jilid_1/JILID 1-HAL 26-30_chunk_${pageNumber - 26}.ogg`;
    if (pageNumber >= 31 && pageNumber <= 35) return `/audio/tilawati/jilid_1/JILID 1-HAL 31-35_chunk_${pageNumber - 31 + 1}.ogg`;
    if (pageNumber >= 36 && pageNumber <= 40) return `/audio/tilawati/jilid_1/JILID 1-HAL 36-40_chunk_${pageNumber - 36 + 4}.ogg`;
    if (pageNumber >= 41 && pageNumber <= 44) return `/audio/tilawati/jilid_1/JILID 1-HAL 41-44_chunk_${pageNumber - 41 + 1}.ogg`;
  }
  
  if (jilid === 2) {
    if (pageNumber >= 1 && pageNumber <= 5) return `/audio/tilawati/jilid_2/JILID 2-HAL 1-5_chunk_${pageNumber}.ogg`;
    if (pageNumber >= 6 && pageNumber <= 10) return `/audio/tilawati/jilid_2/JILID 2-HAL 6-10_chunk_${pageNumber - 6}.ogg`;
    if (pageNumber >= 11 && pageNumber <= 15) return `/audio/tilawati/jilid_2/JILID 2-HAL 11-15_chunk_${pageNumber - 11}.ogg`;
    if (pageNumber >= 16 && pageNumber <= 19) return `/audio/tilawati/jilid_2/JILID 2-HAL 16-19_chunk_${pageNumber - 16}.ogg`;
    if (pageNumber >= 20 && pageNumber <= 27) return `/audio/tilawati/jilid_2/JILID 2-HAL 20-27_chunk_${pageNumber - 20}.ogg`;
    if (pageNumber >= 28 && pageNumber <= 31) return `/audio/tilawati/jilid_2/JILID 2-HAL 28-31_chunk_${pageNumber - 28}.ogg`;
    if (pageNumber >= 32 && pageNumber <= 35) return `/audio/tilawati/jilid_2/JILID 2-HAL 32-35_chunk_${pageNumber - 32}.ogg`;
    if (pageNumber >= 36 && pageNumber <= 39) return `/audio/tilawati/jilid_2/JILID 2-HAL 36-39_chunk_${pageNumber - 36}.ogg`;
    if (pageNumber >= 40 && pageNumber <= 42) return `/audio/tilawati/jilid_2/JILID 2-HAL 40-42_chunk_${pageNumber - 40}.ogg`;
    if (pageNumber >= 43 && pageNumber <= 44) return `/audio/tilawati/jilid_2/JILID 2-HAL 43-44_chunk_${pageNumber - 43}.ogg`;
  }

  if (jilid === 3) {
    if (pageNumber >= 1 && pageNumber <= 5) return `/audio/tilawati/jilid_3/JILID 3-HAL 1-5_chunk_${pageNumber - 1}.ogg`;
    if (pageNumber >= 6 && pageNumber <= 10) return `/audio/tilawati/jilid_3/JILID 3-HAL 6-10_chunk_${pageNumber - 6}.ogg`;
    if (pageNumber >= 11 && pageNumber <= 15) return `/audio/tilawati/jilid_3/JILID 3-HAL 11-15_chunk_${pageNumber - 11}.ogg`;
    if (pageNumber >= 16 && pageNumber <= 20) return `/audio/tilawati/jilid_3/JILID 3-HAL 16-20_chunk_${pageNumber - 16}.ogg`;
    if (pageNumber >= 21 && pageNumber <= 25) return `/audio/tilawati/jilid_3/JILID 3-HAL 21-25_chunk_${pageNumber - 21}.ogg`;
    if (pageNumber >= 26 && pageNumber <= 30) return `/audio/tilawati/jilid_3/JILID 3-HAL 26-30_chunk_${pageNumber - 26}.ogg`;
    if (pageNumber >= 31 && pageNumber <= 35) return `/audio/tilawati/jilid_3/JILID 3-HAL 31-35_chunk_${pageNumber - 31}.ogg`;
    if (pageNumber >= 36 && pageNumber <= 40) return `/audio/tilawati/jilid_3/JILID 3-HAL 36-40_chunk_${pageNumber - 36}.ogg`;
    if (pageNumber >= 41 && pageNumber <= 44) return `/audio/tilawati/jilid_3/JILID 3-HAL 41-44_chunk_${pageNumber - 41}.ogg`;
  }

  if (jilid === 4) {
    if (pageNumber >= 1 && pageNumber <= 5) return `/audio/tilawati/jilid_4/JILID 4-HAL 1-5_chunk_${pageNumber - 1}.ogg`;
    if (pageNumber >= 6 && pageNumber <= 10) return `/audio/tilawati/jilid_4/JILID 4-HAL 6-10_chunk_${pageNumber - 6}.ogg`;
    if (pageNumber >= 11 && pageNumber <= 15) return `/audio/tilawati/jilid_4/JILID 4-HAL 11-15_chunk_${pageNumber - 11}.ogg`;
    if (pageNumber >= 16 && pageNumber <= 20) return `/audio/tilawati/jilid_4/JILID 4-HAL 16-20_chunk_${pageNumber - 16}.ogg`;
    if (pageNumber >= 21 && pageNumber <= 25) return `/audio/tilawati/jilid_4/JILID 4-HAL 21-25_chunk_${pageNumber - 21}.ogg`;
    if (pageNumber >= 26 && pageNumber <= 30) return `/audio/tilawati/jilid_4/JILID 4-HAL 26-30_chunk_${pageNumber - 26}.ogg`;
    if (pageNumber >= 31 && pageNumber <= 35) return `/audio/tilawati/jilid_4/JILID 4-HAL 31-35_chunk_${pageNumber - 31}.ogg`;
    if (pageNumber >= 36 && pageNumber <= 40) return `/audio/tilawati/jilid_4/JILID 4-HAL 36-40_chunk_${pageNumber - 36}.ogg`;
    if (pageNumber >= 41 && pageNumber <= 44) return `/audio/tilawati/jilid_4/JILID 4-HAL 41-44_chunk_${pageNumber - 41}.ogg`;
  }

  if (jilid === 5) {
    if (pageNumber >= 1 && pageNumber <= 5) return `/audio/tilawati/jilid_5/JILID 5-HAL 1-5_chunk_${pageNumber - 1}.ogg`;
    if (pageNumber >= 6 && pageNumber <= 10) return `/audio/tilawati/jilid_5/JILID 5-HAL 6-10_chunk_${pageNumber - 6}.ogg`;
    if (pageNumber >= 11 && pageNumber <= 15) return `/audio/tilawati/jilid_5/JILID 5-HAL 11-15_chunk_${pageNumber - 11}.ogg`;
    if (pageNumber >= 16 && pageNumber <= 20) return `/audio/tilawati/jilid_5/JILID 5-HAL 16-20_chunk_${pageNumber - 16}.ogg`;
    if (pageNumber >= 21 && pageNumber <= 25) return `/audio/tilawati/jilid_5/JILID 5-HAL 21-25_chunk_${pageNumber - 21}.ogg`;
    if (pageNumber >= 26 && pageNumber <= 30) return `/audio/tilawati/jilid_5/JILID 5-HAL 26-30_chunk_${pageNumber - 26}.ogg`;
    if (pageNumber >= 31 && pageNumber <= 35) return `/audio/tilawati/jilid_5/JILID 5-HAL 31-35_chunk_${pageNumber - 31}.ogg`;
    if (pageNumber >= 36 && pageNumber <= 40) return `/audio/tilawati/jilid_5/JILID 5-HAL 36-40_chunk_${pageNumber - 36}.ogg`;
    if (pageNumber >= 41 && pageNumber <= 44) return `/audio/tilawati/jilid_5/JILID 5-HAL 41-44_chunk_${pageNumber - 41}.ogg`;
  }

  if (jilid === 6) {
    if (pageNumber >= 1 && pageNumber <= 3) return `/audio/tilawati/jilid_6/JILID 6-HAL 1-3_chunk_${pageNumber - 1}.ogg`;
    if (pageNumber === 25) return `/audio/tilawati/jilid_6/JILID 6-HAL 25_chunk_0.ogg`;
    if (pageNumber === 26) return `/audio/tilawati/jilid_6/JILID 6-HAL 26_chunk_0.ogg`;
    if (pageNumber >= 27 && pageNumber <= 28) return `/audio/tilawati/jilid_6/JILID 6-HAL 27-28_chunk_${pageNumber - 27}.ogg`;
    if (pageNumber >= 29 && pageNumber <= 31) return `/audio/tilawati/jilid_6/JILID 6-HAL 29-31_chunk_${pageNumber - 29}.ogg`;
    if (pageNumber === 32) return `/audio/tilawati/jilid_6/JILID 6-HAL 32_chunk_0.ogg`;
    if (pageNumber >= 33 && pageNumber <= 34) return `/audio/tilawati/jilid_6/JILID 6-HAL 33-34_chunk_${pageNumber - 33}.ogg`;
    if (pageNumber >= 35 && pageNumber <= 36) return `/audio/tilawati/jilid_6/JILID 6-HAL 35-36_chunk_${pageNumber - 35}.ogg`;
    if (pageNumber >= 38 && pageNumber <= 40) return `/audio/tilawati/jilid_6/JILID 6-HAL 38-40_chunk_${pageNumber - 38}.ogg`;
    if (pageNumber === 41) return `/audio/tilawati/jilid_6/JILID 6-HAL 41_chunk_0.ogg`;
  }

  return null;
};
