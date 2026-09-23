import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  BookOpen,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, ErrorState } from "../components/common";
import { AudioPlayerMini, type AudioTrack } from "../components/member/AudioPlayerMini";
import {
  fetchSurahDetail,
  getAyatAudioUrl,
  getQariName,
  QARI_LIST,
  type SurahDetail,
  type Ayat,
} from "../data/quran";
import { getTargetBySurah } from "../data/tahfidz";
import { useTahfidz } from "../hooks/useTahfidz";
import { useDoaFontSize } from "../hooks/useDoaFontSize";
import { useIsMuballigh } from "../hooks/useIsMuballigh";
import { TranslationLockedNote } from "../components/member/TranslationLockedNote";

type Mode = "baca" | "uji";

const MODE_KEY = "tahfidz-mode";

function loadMode(): Mode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "uji" || v === "baca") return v;
  } catch {
    // ignore
  }
  return "baca";
}

function persistMode(m: Mode) {
  try {
    localStorage.setItem(MODE_KEY, m);
  } catch {
    // ignore
  }
}

export default function MemberTahfidzSurahPage() {
  const navigate = useNavigate();
  const { nomor } = useParams<{ nomor: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const nomorNum = Number(nomor);

  const [mode, setMode] = useState<Mode>(() => loadMode());
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [playingAyat, setPlayingAyat] = useState<number | null>(null);
  const [qariKey, setQariKey] = useState<string>(() => {
    try {
      return localStorage.getItem("quran-qari") ?? "01";
    } catch {
      return "01";
    }
  });

  const { isHafal, toggleHafal, markReviewed, getState } = useTahfidz();
  const { size: fontSize } = useDoaFontSize();
  const showTranslation = useIsMuballigh();

  const topRef = useRef<HTMLDivElement>(null);

  // Ambil target surah
  const target = useMemo(() => getTargetBySurah(nomorNum), [nomorNum]);

  // Query surah
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SurahDetail>({
    queryKey: ["quran", "surah", nomorNum],
    queryFn: () => fetchSurahDetail(nomorNum),
    enabled: Number.isFinite(nomorNum) && nomorNum >= 1 && nomorNum <= 114,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  // Ayat dari query param
  const ayatParam = Number(searchParams.get("ayat"));

  // Persist mode
  useEffect(() => {
    persistMode(mode);
  }, [mode]);

  // Reset revealed & playing saat ganti surah
  useEffect(() => {
    setRevealed(new Set());
    setPlayingAyat(null);
    topRef.current?.scrollIntoView({ behavior: "auto" });
  }, [nomorNum]);

  // Persist qari
  useEffect(() => {
    try {
      localStorage.setItem("quran-qari", qariKey);
    } catch {
      // ignore
    }
  }, [qariKey]);

  // Auto-scroll ke ayat dari query
  useEffect(() => {
    if (!data || !ayatParam) return;
    const t = setTimeout(() => {
      const el = document.getElementById("tahfidz-ayat-" + ayatParam);
      el?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [data, ayatParam]);

  // Filter ayat berdasarkan target (mis. Juz 1 = Al-Baqarah 1-141)
  const visibleAyat: Ayat[] = useMemo(() => {
    if (!data) return [];
    if (!target) return data.ayat;
    return data.ayat.filter(
      (a) => a.nomorAyat >= target.ayatStart && a.nomorAyat <= target.ayatEnd,
    );
  }, [data, target]);

  // Stats surah
  const stats = useMemo(() => {
    if (!target || !data) return { hafal: 0, total: 0, percentage: 0 };
    let hafal = 0;
    const total = target.ayatEnd - target.ayatStart + 1;
    for (let a = target.ayatStart; a <= target.ayatEnd; a++) {
      if (isHafal(target.surah, a)) hafal++;
    }
    return {
      hafal,
      total,
      percentage: total > 0 ? Math.round((hafal / total) * 100) : 0,
    };
  }, [data, target, isHafal]);

  // Track "last reviewed" saat user buka mode uji
  function revealAyat(num: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(num);
      return next;
    });
    markReviewed(nomorNum, num);
  }

  function toggleHafalAyat(num: number) {
    toggleHafal(nomorNum, num);
  }

  function handleModeSwitch(next: Mode) {
    setMode(next);
    if (next === "baca") {
      setRevealed(new Set());
    }
  }

  const currentTrack: AudioTrack | null = useMemo(() => {
    if (!data || playingAyat === null) return null;
    const ayat = data.ayat.find((a) => a.nomorAyat === playingAyat);
    if (!ayat) return null;
    return {
      url: getAyatAudioUrl(ayat, qariKey),
      title: data.namaLatin + " : " + ayat.nomorAyat,
      subtitle: getQariName(qariKey),
      index: playingAyat - 1,
      total: data.ayat.length,
    };
  }, [data, playingAyat, qariKey]);

  function playNext() {
    if (!data || playingAyat === null) return;
    if (playingAyat >= data.ayat.length) return;
    setPlayingAyat(playingAyat + 1);
  }

  function playPrev() {
    if (playingAyat === null) return;
    if (playingAyat <= 1) return;
    setPlayingAyat(playingAyat - 1);
  }

  if (!Number.isFinite(nomorNum) || nomorNum < 1 || nomorNum > 114) {
    return (
      <AppLayout hideNav showAiChat={false}>
        <Header
          title="Surah tidak ditemukan"
          onBack={() => navigate("/member/tahfidz")}
          backLabel="Tahfidz"
        />
        <div className="p-6 text-center text-surface-muted">
          Nomor surah tidak valid.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title={data?.namaLatin ?? "Memuat..."}
        subtitle={
          target
            ? stats.hafal +
              "/" +
              stats.total +
              " ayat hafal · " +
              stats.percentage +
              "%"
            : undefined
        }
        onBack={() => navigate("/member/tahfidz")}
        backLabel="Tahfidz"
        showSyncButton={false}
        right={
          <Button
            onClick={() =>
              setQariKey(QARI_LIST[(QARI_LIST.findIndex((q) => q.key === qariKey) + 1) % QARI_LIST.length].key)
            }
            aria-label="Ganti qari"
            title="Ganti qari"
            variant="secondary"
            size="sm"
            leftIcon={<Play size={14} />}
            rightIcon={<ChevronDown size={12} className="text-surface-muted" />}
          />
        }
      />

      <div ref={topRef} />

      {/* Progress bar surah */}
      {target && stats.total > 0 && (
        <div className="px-4 pt-3">
          <div className="rounded-xl border border-surface-border bg-surface-card px-3 py-2 flex items-center gap-2">
            <BookOpen size={14} className="text-accent flex-shrink-0" />
            <span className="text-ios-caption text-surface-muted tabular-nums flex-shrink-0">
              {stats.hafal}/{stats.total}
            </span>
            <div className="flex-1 h-1 rounded-full bg-surface-card2 overflow-hidden">
              <div
                className={
                  "h-full transition-all duration-300 " +
                  (stats.hafal === stats.total ? "bg-success" : "bg-accent")
                }
                style={{ width: stats.percentage + "%" }}
              />
            </div>
            <span className="text-ios-caption font-semibold tabular-nums flex-shrink-0 text-accent">
              {stats.percentage}%
            </span>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="px-4 pt-3">
        <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
          <div className="flex-1 flex">
            <button
              onClick={() => handleModeSwitch("baca")}
              className={
                "flex-1 min-h-[38px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
                (mode === "baca"
                  ? "bg-accent text-white"
                  : "text-surface-muted hover:bg-surface-card")
              }
            >
              <Eye size={14} />
              Baca
            </button>
          </div>
          <div className="w-px bg-surface-border" />
          <div className="flex-1 flex">
            <button
              onClick={() => handleModeSwitch("uji")}
              className={
                "flex-1 min-h-[38px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
                (mode === "uji"
                  ? "bg-warning text-white"
                  : "text-surface-muted hover:bg-surface-card")
              }
            >
              <EyeOff size={14} />
              Uji Hafalan
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-32">
        {isLoading && <SurahSkeleton />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof Error ? error.message : "Gagal memuat surah"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && data && (
          <>
            {/* Hero surah */}
            <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 px-4 py-4 text-center">
              <p
                className="text-accent mb-1.5"
                style={{
                  fontFamily:
                    '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                  fontSize: "28px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  direction: "rtl",
                }}
              >
                {data.nama}
              </p>
              <p className="text-ios-footnote font-semibold text-accent">
                {data.namaLatin}
              </p>
              {target && (
                <p className="text-ios-caption text-accent/70 mt-1">
                  Target: Ayat {target.ayatStart}-{target.ayatEnd}
                  {target.ayatEnd !== target.jumlahAyat &&
                    " dari " + target.jumlahAyat}
                </p>
              )}
            </div>

            {/* Info mode uji */}
            {mode === "uji" && (
              <div className="rounded-xl bg-warning-soft/60 border border-warning/20 px-3.5 py-3">
                <p className="text-ios-caption text-warning leading-relaxed">
                  Teks Arab disembunyikan. Tap card untuk reveal. Audio tetap
                  bisa diputar.
                </p>
              </div>
            )}

            {/* List ayat */}
            {visibleAyat.map((ayat) => {
              const hafal = isHafal(nomorNum, ayat.nomorAyat);
              const revealedNow = revealed.has(ayat.nomorAyat);
              const state = getState(nomorNum, ayat.nomorAyat);
              const isPlaying = playingAyat === ayat.nomorAyat;

              return (
                <TahfidzAyatCard
                  key={ayat.nomorAyat}
                  ayat={ayat}
                  surahNomor={nomorNum}
                  mode={mode}
                  revealed={revealedNow}
                  hafal={hafal}
                  isPlaying={isPlaying}
                  fontSize={fontSize}
                  lastReview={state?.lastReview}
                  onReveal={() => revealAyat(ayat.nomorAyat)}
                  onToggleHafal={() => toggleHafalAyat(ayat.nomorAyat)}
                  onPlay={() => setPlayingAyat(ayat.nomorAyat)}
                  showTranslation={showTranslation}
                />
              );
            })}

            {/* Prev/Next surah dalam kategori */}
            <div className="flex gap-2 pt-3">
              {data.suratSebelumnya ? (
                <button
                  onClick={() =>
                    navigate(
                      "/member/tahfidz/surah/" +
                        (data.suratSebelumnya === false
                          ? ""
                          : data.suratSebelumnya.nomor),
                    )
                  }
                  className="flex-1 rounded-2xl border border-surface-border bg-surface-card px-3 py-3.5 flex items-center gap-2 transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99] text-left"
                >
                  <ChevronRight
                    size={18}
                    className="text-surface-muted flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
                      Sebelumnya
                    </p>
                    <p className="text-ios-footnote font-medium text-surface-text truncate">
                      {data.suratSebelumnya.namaLatin}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="flex-1" />
              )}

              {data.suratSelanjutnya ? (
                <button
                  onClick={() =>
                    navigate(
                      "/member/tahfidz/surah/" +
                        (data.suratSelanjutnya === false
                          ? ""
                          : data.suratSelanjutnya.nomor),
                    )
                  }
                  className="flex-1 rounded-2xl border border-surface-border bg-surface-card px-3 py-3.5 flex items-center justify-end gap-2 transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99] text-right"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
                      Selanjutnya
                    </p>
                    <p className="text-ios-footnote font-medium text-surface-text truncate">
                      {data.suratSelanjutnya.namaLatin}
                    </p>
                  </div>
                  <ChevronLeft
                    size={18}
                    className="text-surface-muted flex-shrink-0"
                  />
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </>
        )}
      </div>

      <AudioPlayerMini
        track={currentTrack}
        onClose={() => setPlayingAyat(null)}
        onPrev={playingAyat && playingAyat > 1 ? playPrev : undefined}
        onNext={
          data && playingAyat && playingAyat < data.ayat.length
            ? playNext
            : undefined
        }
      />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Tahfidz Ayat Card                             */
/* -------------------------------------------------------------------------- */

function TahfidzAyatCard({
  ayat,
  surahNomor,
  mode,
  revealed,
  hafal,
  isPlaying,
  fontSize,
  lastReview,
  onReveal,
  onToggleHafal,
  onPlay,
  showTranslation = false,
}: {
  ayat: Ayat;
  surahNomor: number;
  mode: Mode;
  revealed: boolean;
  hafal: boolean;
  isPlaying: boolean;
  fontSize: import("../hooks/useDoaFontSize").DoaFontSize;
  lastReview?: number;
  onReveal: () => void;
  onToggleHafal: () => void;
  onPlay: () => void;
  showTranslation?: boolean;
}) {
  const { spec } = useDoaFontSize();
  const hidden = mode === "uji" && !revealed;

  return (
    <div
      id={"tahfidz-ayat-" + ayat.nomorAyat}
      className={
        "rounded-2xl border overflow-hidden transition-all duration-200 scroll-mt-32 " +
        (hafal
          ? "border-success/30 bg-success-soft/20"
          : "border-surface-border bg-surface-card")
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-surface-border">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums flex-shrink-0 " +
              (hafal
                ? "bg-success text-white"
                : "bg-accent-soft text-accent")
            }
          >
            {hafal ? <Check size={14} strokeWidth={3} /> : ayat.nomorAyat}
          </span>
          <span className="text-ios-caption text-surface-muted truncate">
            Ayat {ayat.nomorAyat}
            {hafal && lastReview && (
              <span className="ml-1.5 text-success/80">
                · {formatAge(lastReview)}
              </span>
            )}
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
            <Play size={14} className="ml-0.5" />
          </button>

          <button
            onClick={onToggleHafal}
            aria-label={hafal ? "Tandai belum hafal" : "Tandai hafal"}
            title={hafal ? "Sudah hafal, tap untuk batalkan" : "Tandai hafal"}
            className={
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 " +
              (hafal
                ? "bg-success text-white"
                : "text-surface-muted hover:bg-success-soft hover:text-success")
            }
          >
            <Check size={16} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3">
        {/* Arab — blur kalau mode uji */}
        <button
          onClick={onReveal}
          disabled={!hidden}
          className={
            "block w-full text-left transition-all duration-300 " +
            (hidden ? "cursor-pointer" : "cursor-default")
          }
        >
          <div
            className="text-surface-text border-r-2 border-accent/30 pr-4 py-2 transition-all duration-300"
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
              filter: hidden ? "blur(10px)" : "none",
              userSelect: hidden ? "none" : "auto",
              opacity: hidden ? 0.6 : 1,
            }}
          >
            {ayat.teksArab}
          </div>

          {hidden && (
            <p className="text-ios-caption text-warning mt-2 text-center flex items-center justify-center gap-1.5">
              <EyeOff size={12} />
              Tap untuk lihat teks
            </p>
          )}
        </button>

        {/* Latin + terjemah — latin selalu tampil, terjemah khusus mubaligh */}
        {!hidden && (
          <>
            <p
              className="text-ios-footnote italic text-accent/70 leading-relaxed"
              style={{
                fontSize: spec.body + "px",
                lineHeight: spec.bodyLineHeight,
              }}
            >
              {ayat.teksLatin}
            </p>

            {showTranslation ? (
              <p
                className="text-ios-footnote text-surface-text leading-relaxed"
                style={{
                  fontSize: spec.body + "px",
                  lineHeight: spec.bodyLineHeight,
                }}
              >
                {ayat.teksIndonesia}
              </p>
            ) : (
              <TranslationLockedNote />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

function formatAge(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "baru di-review";
  if (hours < 24) return hours + " jam lalu";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + " hari lalu";
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks + " minggu lalu";
  const months = Math.floor(days / 30);
  return months + " bulan lalu";
}

function SurahSkeleton() {
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
