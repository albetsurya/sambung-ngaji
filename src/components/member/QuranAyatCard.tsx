import { Play, Bookmark, Check } from "../common/FontAwesomeIcons";
import type { Ayat } from "../../data/quran";
import { FONT_SIZE_SPECS, type DoaFontSize } from "../../hooks/useDoaFontSize";
import { TranslationLockedNote } from "./TranslationLockedNote";

interface QuranAyatCardProps {
  ayat: Ayat;
  surahNomor: number;
  isBookmarked: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onToggleBookmark: () => void;
  fontSize?: DoaFontSize;
  showTranslation?: boolean;
}

export function QuranAyatCard({
  ayat,
  isBookmarked,
  isPlaying,
  onPlay,
  onToggleBookmark,
  fontSize = "medium",
  showTranslation = false,
}: QuranAyatCardProps) {
  const spec = FONT_SIZE_SPECS[fontSize];

  return (
    <div
      id={"ayat-" + ayat.nomorAyat}
      className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden transition-all duration-200 scroll-mt-32"
    >
      
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold tabular-nums flex-shrink-0">
            {ayat.nomorAyat}
          </span>
          <span className="text-ios-caption text-surface-muted">
            Ayat {ayat.nomorAyat}
          </span>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onPlay}
            aria-label={isPlaying ? "Sedang diputar" : "Putar ayat"}
            title={isPlaying ? "Sedang diputar" : "Putar ayat"}
            className={
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 " +
              (isPlaying
                ? "bg-accent text-white"
                : "text-surface-muted hover:bg-accent-soft hover:text-accent")
            }
          >
            <Play size={14} className={isPlaying ? "ml-0.5" : "ml-0.5"} />
          </button>

          <button
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? "Hapus bookmark" : "Bookmark ayat"}
            title={isBookmarked ? "Bookmarked" : "Bookmark ayat"}
            className={
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 " +
              (isBookmarked
                ? "text-warning hover:bg-warning-soft"
                : "text-surface-muted hover:bg-surface-card2")
            }
          >
            {isBookmarked ? (
              <Check size={16} strokeWidth={2.6} />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>
      </div>

      
      <div className="selectable px-4 py-4 space-y-3">
        <div
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri Quran", "Scheherazade New", serif',
            fontSize: spec.arab + "px",
            fontWeight: 400,
            lineHeight: spec.arabLineHeight + 0.1,
            wordSpacing: "0.1em",
            direction: "rtl",
            textAlign: "right",
            overflowWrap: "break-word",
          }}
        >
          {ayat.teksArab}
        </div>

        <p
          className="text-ios-footnote italic text-accent/70 leading-relaxed"
          style={{ fontSize: spec.body + "px", lineHeight: spec.bodyLineHeight }}
        >
          {ayat.teksLatin}
        </p>

        {showTranslation ? (
          <p
            className="text-ios-footnote text-surface-text leading-relaxed"
            style={{ fontSize: spec.body + "px", lineHeight: spec.bodyLineHeight }}
          >
            {ayat.teksIndonesia}
          </p>
        ) : (
          <TranslationLockedNote />
        )}
      </div>
    </div>
  );
}
