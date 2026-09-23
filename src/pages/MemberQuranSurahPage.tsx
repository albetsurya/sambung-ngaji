import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  List,
  AlignLeft,
  Play,
  Bookmark,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { ErrorState } from "../components/common";
import { QuranAyatCard } from "../components/member/QuranAyatCard";
import {
  AudioPlayerMini,
  type AudioTrack,
} from "../components/member/AudioPlayerMini";
import { QuranNavigationSheet } from "../components/member/QuranNavigationSheet";
import {
  PerAyatView,
  SurahHeaderCard,
  BismillahBlock,
  SurahNavFooter,
  SurahSkeleton,
} from "../components/member/QuranSurahParts";
import {
  fetchSurahDetail,
  getAyatAudioUrl,
  getQariName,
  QARI_LIST,
  type SurahDetail,
} from "../data/quran";
import { useQuranBookmark } from "../hooks/useQuranBookmark";
import { useDoaFontSize } from "../hooks/useDoaFontSize";
import { useIsMuballigh } from "../hooks/useIsMuballigh";

type BacaMode = "scroll" | "ayat";
const MODE_KEY = "quran-baca-mode";

function loadMode(): BacaMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "ayat" || v === "scroll") return v;
  } catch {
    // ignore
  }
  return "scroll";
}

function persistMode(m: BacaMode) {
  try {
    localStorage.setItem(MODE_KEY, m);
  } catch {
    // ignore
  }
}

export default function MemberQuranSurahPage() {
  const navigate = useNavigate();
  const { nomor } = useParams<{ nomor: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const nomorNum = Number(nomor);

  const [mode, setMode] = useState<BacaMode>(() => loadMode());
  const [qariKey, setQariKey] = useState<string>(() => {
    try {
      return localStorage.getItem("quran-qari") ?? "01";
    } catch {
      return "01";
    }
  });
  const [qariSheetOpen, setQariSheetOpen] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const [playingAyat, setPlayingAyat] = useState<number | null>(null);

  const ayatParam = Number(searchParams.get("ayat"));
  const [ayatIndex, setAyatIndex] = useState(0);

  const { setLastRead, isBookmarked, toggleBookmark } = useQuranBookmark();
  const { size: fontSize } = useDoaFontSize();
  const showTranslation = useIsMuballigh();
  const topRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } = useQuery<SurahDetail>({
    queryKey: ["quran", "surah", nomorNum],
    queryFn: () => fetchSurahDetail(nomorNum),
    enabled: Number.isFinite(nomorNum) && nomorNum >= 1 && nomorNum <= 114,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (!data) return;
    if (
      Number.isFinite(ayatParam) &&
      ayatParam >= 1 &&
      ayatParam <= data.ayat.length
    ) {
      setAyatIndex(ayatParam - 1);
    } else if (!ayatParam) {
      setAyatIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.nomor]);

  useEffect(() => {
    persistMode(mode);
  }, [mode]);

  useEffect(() => {
    setPlayingAyat(null);
    topRef.current?.scrollIntoView({ behavior: "auto" });
  }, [nomorNum]);

  useEffect(() => {
    try {
      localStorage.setItem("quran-qari", qariKey);
    } catch {
      // ignore
    }
  }, [qariKey]);

  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => {
      const ayatNow = mode === "ayat" ? ayatIndex + 1 : 1;
      setLastRead({
        surahNomor: data.nomor,
        surahNama: data.namaLatin,
        ayatNomor: ayatNow,
        timestamp: Date.now(),
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [data, mode, ayatIndex, setLastRead]);

  useEffect(() => {
    if (mode !== "ayat" || !data) return;
    const current = Number(searchParams.get("ayat"));
    if (current !== ayatIndex + 1) {
      const next = new URLSearchParams(searchParams);
      next.set("ayat", String(ayatIndex + 1));
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayatIndex, mode, data?.nomor]);

  useEffect(() => {
    if (mode !== "ayat") return;
    function handler(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && data && ayatIndex < data.ayat.length - 1) {
        setAyatIndex((i) => i + 1);
      } else if (e.key === "ArrowRight" && ayatIndex > 0) {
        setAyatIndex((i) => i - 1);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, ayatIndex, data]);

  const currentTrack: AudioTrack | null = useMemo(() => {
    if (!data || playingAyat === null) return null;
    const ayat = data.ayat.find((a) => a.nomorAyat === playingAyat);
    if (!ayat) return null;
    return {
      url: getAyatAudioUrl(ayat, qariKey),
      title: data.namaLatin + " : " + ayat.nomorAyat,
      subtitle: getQariName(qariKey),
      index: ayat.nomorAyat - 1,
      total: data.ayat.length,
    };
  }, [data, playingAyat, qariKey]);

  function playAyat(num: number) {
    setPlayingAyat(num);
  }

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

  function goNextAyat() {
    if (!data) return;
    if (ayatIndex < data.ayat.length - 1) {
      setAyatIndex(ayatIndex + 1);
      topRef.current?.scrollIntoView({ behavior: "auto" });
    } else if (data.suratSelanjutnya) {
      navigate("/member/quran/" + data.suratSelanjutnya.nomor);
    }
  }

  function goPrevAyat() {
    if (ayatIndex > 0) {
      setAyatIndex(ayatIndex - 1);
      topRef.current?.scrollIntoView({ behavior: "auto" });
    } else if (data?.suratSebelumnya) {
      navigate("/member/quran/" + data.suratSebelumnya.nomor + "?ayat=999");
    }
  }

  function handleModeSwitch(next: BacaMode) {
    setMode(next);
    if (next === "ayat" && data) {
      const cur = Number(searchParams.get("ayat"));
      if (Number.isFinite(cur) && cur >= 1 && cur <= data.ayat.length) {
        setAyatIndex(cur - 1);
      }
    } else if (next === "scroll" && data) {
      const target = data.ayat[ayatIndex];
      if (target) {
        setTimeout(() => {
          const el = document.getElementById("ayat-" + target.nomorAyat);
          el?.scrollIntoView({ behavior: "auto", block: "start" });
        }, 50);
      }
    }
  }

  if (!Number.isFinite(nomorNum) || nomorNum < 1 || nomorNum > 114) {
    return (
      <AppLayout hideNav showAiChat={false}>
        <Header
          title="Surah tidak ditemukan"
          onBack={() => navigate("/member/quran")}
          backLabel="Al-Quran"
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
          data ? data.arti + " · " + data.jumlahAyat + " ayat" : "Memuat..."
        }
        onBack={() => navigate("/member/quran")}
        backLabel="Al-Quran"
        showSyncButton={false}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNavSheetOpen(true)}
              aria-label="Lompat ke surah / juz"
              title="Lompat ke..."
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all duration-200 hover:bg-surface-card2 active:scale-95"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setQariSheetOpen(true)}
              aria-label="Pilih qari"
              title="Pilih qari"
              className="flex items-center gap-1 h-9 px-2.5 rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all duration-200 hover:bg-surface-card2 active:scale-95"
            >
              <Play size={13} />
              <ChevronDown size={12} className="text-surface-muted" />
            </button>
          </div>
        }
      />

      <div ref={topRef} />

      {data && (
        <div className="px-4 pt-3">
          <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
            <div className="flex-1 flex">
              <button
                onClick={() => handleModeSwitch("scroll")}
                className={
                  "flex-1 min-h-[36px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
                  (mode === "scroll"
                    ? "bg-accent text-white"
                    : "text-surface-muted hover:bg-surface-card")
                }
              >
                <AlignLeft size={13} />
                Scroll
              </button>
            </div>
            <div className="w-px bg-surface-border" />
            <div className="flex-1 flex">
              <button
                onClick={() => handleModeSwitch("ayat")}
                className={
                  "flex-1 min-h-[36px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
                  (mode === "ayat"
                    ? "bg-accent text-white"
                    : "text-surface-muted hover:bg-surface-card")
                }
              >
                <Bookmark size={13} />
                Per Ayat
              </button>
            </div>
          </div>
        </div>
      )}

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

        {!isLoading && data && mode === "scroll" && (
          <>
            <SurahHeaderCard data={data} />
            {data.nomor !== 1 && data.nomor !== 9 && (
              <BismillahBlock showTranslation={showTranslation} />
            )}
            {data.ayat.map((ayat) => (
              <QuranAyatCard
                key={ayat.nomorAyat}
                ayat={ayat}
                surahNomor={data.nomor}
                isBookmarked={isBookmarked(data.nomor, ayat.nomorAyat)}
                isPlaying={playingAyat === ayat.nomorAyat}
                onPlay={() => playAyat(ayat.nomorAyat)}
                onToggleBookmark={() =>
                  toggleBookmark({
                    surahNomor: data.nomor,
                    surahNama: data.namaLatin,
                    ayatNomor: ayat.nomorAyat,
                    ayatPreview: ayat.teksIndonesia.slice(0, 80),
                    timestamp: Date.now(),
                  })
                }
                fontSize={fontSize}
                showTranslation={showTranslation}
              />
            ))}
            <SurahNavFooter
              data={data}
              onPrev={() =>
                data.suratSebelumnya &&
                navigate("/member/quran/" + data.suratSebelumnya.nomor)
              }
              onNext={() =>
                data.suratSelanjutnya &&
                navigate("/member/quran/" + data.suratSelanjutnya.nomor)
              }
            />
          </>
        )}

        {!isLoading && data && mode === "ayat" && (
          <PerAyatView
            data={data}
            ayatIndex={ayatIndex}
            qariKey={qariKey}
            playingAyat={playingAyat}
            isBookmarked={isBookmarked}
            onPlay={playAyat}
            onToggleBookmark={(ayat) =>
              toggleBookmark({
                surahNomor: data.nomor,
                surahNama: data.namaLatin,
                ayatNomor: ayat.nomorAyat,
                ayatPreview: ayat.teksIndonesia.slice(0, 80),
                timestamp: Date.now(),
              })
            }
            onNext={goNextAyat}
            onPrev={goPrevAyat}
            fontSize={fontSize}
            onJump={(idx) => setAyatIndex(idx)}
            showTranslation={showTranslation}
          />
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

      <QuranNavigationSheet
        open={navSheetOpen}
        onClose={() => setNavSheetOpen(false)}
        currentSurah={nomorNum}
        onSelectSurah={(s) => navigate("/member/quran/" + s)}
        onSelectJuz={(s, a) => navigate("/member/quran/" + s + "?ayat=" + a)}
      />

      {qariSheetOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
          onClick={() => setQariSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-surface-bg border-t border-surface-border p-4 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-surface-card2 mx-auto mb-3" />
            <p className="text-ios-body font-semibold text-surface-text mb-3 text-center">
              Pilih Qari
            </p>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {QARI_LIST.map((q) => {
                const active = q.key === qariKey;
                return (
                  <button
                    key={q.key}
                    onClick={() => {
                      setQariKey(q.key);
                      setQariSheetOpen(false);
                    }}
                    className={
                      "w-full rounded-xl border px-3.5 py-3 flex items-center gap-3 transition-all duration-200 active:scale-[0.99] " +
                      (active
                        ? "border-accent bg-accent-soft"
                        : "border-surface-border bg-surface-card hover:bg-surface-card2")
                    }
                  >
                    <span
                      className={
                        "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 " +
                        (active
                          ? "bg-accent text-white"
                          : "bg-surface-card2 text-surface-muted")
                      }
                    >
                      {q.key}
                    </span>
                    <span
                      className={
                        "flex-1 text-left text-ios-body font-medium truncate " +
                        (active ? "text-accent" : "text-surface-text")
                      }
                    >
                      {q.nama}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
