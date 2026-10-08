import { useMemo } from "react";
import type { MushafPage, MushafVerse } from "../../quran/data/quran-mushaf";
import type { SurahSummary } from "../../quran/data/quran";
import type { DoaFontSize } from "../../doa-dzikir/hooks/useDoaFontSize";

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicDigits(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_DIGITS[Number(d)] ?? d)
    .join("");
}

interface MushafPageViewProps {
  page: MushafPage;
  surahList: SurahSummary[];
  fontSize?: DoaFontSize;
  scale?: number;
}

export function MushafPageView({
  page,
  surahList,
  fontSize = "medium",
  scale = 1,
}: MushafPageViewProps) {
  const surahMap = useMemo(() => {
    const m = new Map<number, SurahSummary>();
    surahList.forEach((s) => m.set(s.nomor, s));
    return m;
  }, [surahList]);

  const baseFontSize = fontSize === "small" ? 20 : fontSize === "large" ? 30 : 24;
  const arabicSize = baseFontSize * scale;

  const grouped = useMemo(() => {
    const groups: { surah: number; verses: MushafVerse[] }[] = [];
    for (const v of page.verses) {
      const last = groups[groups.length - 1];
      if (last && last.surah === v.surah) {
        last.verses.push(v);
      } else {
        groups.push({ surah: v.surah, verses: [v] });
      }
    }
    return groups;
  }, [page.verses]);

  const juz = page.verses[0]?.juzNumber ?? 1;

  return (
    <div className="min-h-full flex flex-col px-5 py-4">
      
      <div className="flex items-center justify-between text-[11px] text-surface-muted pb-2 mb-3 border-b border-surface-border/60">
        <span>Juz {juz}</span>
        <span className="tabular-nums">Hal. {page.page}</span>
      </div>

      
      <div
        className="flex-1 text-surface-text"
        style={{
          fontFamily:
            '"Amiri Quran", "Amiri", "Scheherazade New", "Noto Naskh Arabic", serif',
          fontSize: arabicSize + "px",
          lineHeight: 2.1,
          direction: "rtl",
          textAlign: "justify",
          textAlignLast: "center",
          wordSpacing: "0.08em",
          overflowWrap: "break-word",
        }}
      >
        {grouped.map((g, gi) => {
          const surahInfo = surahMap.get(g.surah);
          const isNewSurah = g.verses[0]?.ayat === 1;
          const showBismillah = isNewSurah && g.surah !== 1 && g.surah !== 9;

          return (
            <div key={gi}>
              
              {isNewSurah && surahInfo && (
                <>
                  <div className="text-center my-3 not-italic">
                    <p
                      className="text-accent mb-1"
                      style={{
                        fontFamily:
                          '"Amiri Quran", "Amiri", "Scheherazade New", serif',
                        fontSize: arabicSize * 0.95 + "px",
                        lineHeight: 1.4,
                      }}
                    >
                      سُورَةُ {surahInfo.name.replace("سُورَةُ ", "")}
                    </p>
                    <p className="text-[11px] text-surface-muted">
                      {surahInfo.namaLatin} · {surahInfo.arti}
                    </p>
                  </div>

                  {showBismillah && (
                    <p
                      className="text-center mb-3"
                      style={{
                        fontSize: arabicSize * 0.9 + "px",
                        lineHeight: 1.6,
                      }}
                    >
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>
                  )}
                </>
              )}

              
              {g.verses.map((v) => (
                <span key={v.id}>
                  <span>{v.textUthmani}</span>
                  <span
                    className="text-accent/80 inline-block align-middle"
                    style={{
                      fontFamily:
                        '"Amiri Quran", "Amiri", serif',
                      fontSize: arabicSize * 0.75 + "px",
                      lineHeight: 1,
                      margin: "0 0.3em",
                      position: "relative",
                      top: "-0.05em",
                    }}
                  >
                    {"﴿" + toArabicDigits(v.ayat) + "﴾"}
                  </span>
                  {" "}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      
      <div className="flex items-center justify-between text-[11px] text-surface-muted pt-3 mt-3 border-t border-surface-border/60">
        <span>{surahList[0]?.namaLatin ? "" : ""}</span>
        <span className="tabular-nums">{page.page}</span>
      </div>
    </div>
  );
}
