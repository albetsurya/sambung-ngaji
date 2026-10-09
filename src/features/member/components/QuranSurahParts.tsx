import { ChevronLeft, ChevronRight, ChevronDown, Play, SkipForward } from "../../../components/ui/FontAwesomeIcons";
import type { SurahDetail } from "../../quran/data/quran";
import type { DoaFontSize } from "../../doa-dzikir/hooks/useDoaFontSize";
import { getQariName } from "../../quran/data/quran";
import { QuranAyatCard } from "./QuranAyatCard";


export function PerAyatView({
  data,
  ayatIndex,
  qariKey,
  playingAyat,
  isBookmarked,
  onPlay,
  onToggleBookmark,
  onNext,
  onPrev,
  fontSize,
  onJump,
  showTranslation = false,
}: {
  data: SurahDetail;
  ayatIndex: number;
  qariKey: string;
  playingAyat: number | null;
  isBookmarked: (s: number, a: number) => boolean;
  onPlay: (num: number) => void;
  onToggleBookmark: (ayat: import("../../quran/data/quran").Ayat) => void;
  onNext: () => void;
  onPrev: () => void;
  fontSize: DoaFontSize;
  onJump: (idx: number) => void;
  showTranslation?: boolean;
}) {
  const ayat = data.ayat[ayatIndex];
  if (!ayat) return null;

  const isFirst = ayatIndex === 0;
  const isLast = ayatIndex === data.ayat.length - 1;
  const hasNextSurah = !!data.suratSelanjutnya;
  const hasPrevSurah = !!data.suratSebelumnya;

  const prevDisabled = isFirst && !hasPrevSurah;
  const nextDisabled = isLast && !hasNextSurah;

  return (
    <>
      <div className="rounded-xl border border-surface-border bg-surface-card px-3 py-2 flex items-center gap-2">
        <span className="text-ios-caption text-surface-muted tabular-nums flex-shrink-0">
          Ayat {ayat.nomorAyat}/{data.ayat.length}
        </span>
        <div className="flex-1 h-1 rounded-full bg-surface-card2 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{
              width: ((ayatIndex + 1) / data.ayat.length) * 100 + "%",
            }}
          />
        </div>
      </div>

      <QuranAyatCard
        ayat={ayat}
        surahNomor={data.nomor}
        isBookmarked={isBookmarked(data.nomor, ayat.nomorAyat)}
        isPlaying={playingAyat === ayat.nomorAyat}
        onPlay={() => onPlay(ayat.nomorAyat)}
        onToggleBookmark={() => onToggleBookmark(ayat)}
        fontSize={fontSize}
        showTranslation={showTranslation}
      />

      <div className="flex gap-2 pt-2">
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 min-h-[52px] rounded-2xl bg-accent text-white flex items-center justify-center gap-2 text-ios-footnote font-medium transition-all duration-200 hover:bg-accent-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} className="text-white/80" />
          {isLast && hasNextSurah
            ? data.suratSelanjutnya && data.suratSelanjutnya.namaLatin
            : "Berikutnya"}
        </button>

        <button
          onClick={onPrev}
          disabled={prevDisabled}
          className="flex-1 min-h-[52px] rounded-2xl border border-surface-border bg-surface-card flex items-center justify-center gap-2 text-ios-footnote font-medium text-surface-text transition-all duration-200 hover:bg-surface-card2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isFirst && hasPrevSurah
            ? data.suratSebelumnya && data.suratSebelumnya.namaLatin
            : "Sebelumnya"}
          <ChevronRight size={18} className="text-surface-muted" />
        </button>
      </div>

      <details className="rounded-xl border border-surface-border bg-surface-card">
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-ios-footnote font-medium text-surface-text">
          <span>Lompat ke ayat...</span>
          <ChevronDown size={14} className="text-surface-muted" />
        </summary>
        <div className="border-t border-surface-border px-3 py-3 grid grid-cols-6 gap-1.5">
          {data.ayat.map((a, i) => (
            <button
              key={a.nomorAyat}
              onClick={() => {
                onJump(i);
                const el = document.querySelector("details");
                if (el instanceof HTMLDetailsElement) el.open = false;
              }}
              className={
                "aspect-square rounded-lg text-[11px] font-bold tabular-nums transition-all duration-200 active:scale-95 " +
                (i === ayatIndex
                  ? "bg-accent text-white"
                  : "bg-surface-card2 text-surface-muted hover:bg-accent-soft hover:text-accent")
              }
            >
              {a.nomorAyat}
            </button>
          ))}
        </div>
      </details>

      <button
        onClick={() => onPlay(ayat.nomorAyat)}
        className="w-full min-h-[44px] rounded-xl border border-surface-border bg-surface-card flex items-center justify-center gap-2 text-ios-footnote font-medium text-accent transition-all duration-200 hover:bg-accent-soft active:scale-[0.98]"
      >
        {playingAyat === ayat.nomorAyat ? (
          <>
            <SkipForward size={14} />
            Sedang diputar ({getQariName(qariKey)})
          </>
        ) : (
          <>
            <Play size={14} />
            Putar ayat ini
          </>
        )}
      </button>
    </>
  );
}


export function SurahHeaderCard({ data }: { data: SurahDetail }) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 px-4 py-5 text-center">
      <p
        className="text-accent mb-2"
        style={{
          fontFamily:
            '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
          fontSize: "32px",
          fontWeight: 400,
          lineHeight: 1.5,
          direction: "rtl",
        }}
      >
        {data.name}
      </p>
      <p className="text-ios-body font-semibold text-accent">
        {data.namaLatin}
      </p>
      <p className="text-ios-caption text-accent/70 mt-0.5">
        {data.arti} · {data.jumlahAyat} ayat
      </p>
    </div>
  );
}


export function BismillahBlock({
  showTranslation = false,
}: {
  showTranslation?: boolean;
}) {
  return (
    <div className="text-center py-3">
      <p
        className="text-accent/90"
        style={{
          fontFamily:
            '"Noto Naskh Arabic", "Amiri Quran", "Scheherazade New", serif',
          fontSize: "26px",
          fontWeight: 400,
          lineHeight: 1.8,
          direction: "rtl",
        }}
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
      {showTranslation && (
        <p className="text-ios-caption text-surface-muted mt-1">
          Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
        </p>
      )}
    </div>
  );
}


export function SurahNavFooter({
  data,
  onPrev,
  onNext,
}: {
  data: SurahDetail;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex gap-2 pt-3">
      {data.suratSelanjutnya ? (
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl border border-surface-border bg-surface-card px-3 py-3.5 flex items-center gap-2 transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99] text-left"
        >
          <ChevronLeft size={18} className="text-surface-muted flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
              Selanjutnya
            </p>
            <p className="text-ios-footnote font-medium text-surface-text truncate">
              {data.suratSelanjutnya.namaLatin}
            </p>
          </div>
        </button>
      ) : (
        <div className="flex-1" />
      )}

      {data.suratSebelumnya ? (
        <button
          onClick={onPrev}
          className="flex-1 rounded-2xl border border-surface-border bg-surface-card px-3 py-3.5 flex items-center justify-end gap-2 transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99] text-right"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
              Sebelumnya
            </p>
            <p className="text-ios-footnote font-medium text-surface-text truncate">
              {data.suratSebelumnya.namaLatin}
            </p>
          </div>
          <ChevronRight size={18} className="text-surface-muted flex-shrink-0" />
        </button>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}


export function SurahSkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-surface-border bg-surface-card px-4 py-5">
        <div className="h-6 w-3/5 rounded-md bg-surface-card2 animate-pulse mx-auto mb-2" />
        <div className="h-4 w-2/5 rounded-md bg-surface-card2 animate-pulse mx-auto" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-card2 animate-pulse" />
          </div>
          <div className="h-8 w-full rounded bg-surface-card2 animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-surface-card2 animate-pulse" />
          <div className="h-3 w-full rounded bg-surface-card2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
