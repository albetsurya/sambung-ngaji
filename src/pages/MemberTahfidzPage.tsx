import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  TrendingUp,
  RefreshCw,
  Check,
  ChevronRight,
  ScrollText,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  TAHFIDZ_KATEGORI,
  TAHFIDZ_TARGETS,
  getTargetsByKategori,
  type TahfidzKategori,
} from "../data/tahfidz";
import { fetchSurahList } from "../data/quran";
import {
  useTahfidz,
  getSurahProgress,
  getOverallStats,
  getReviewQueue,
} from "../hooks/useTahfidz";

type Tab = TahfidzKategori;

export default function MemberTahfidzPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("juz30");
  const { data, reset } = useTahfidz();

  const stats = useMemo(() => getOverallStats(data), [data]);
  const reviewQueue = useMemo(() => getReviewQueue(data, 5), [data]);

  const { data: surahList = [] } = useQuery({
    queryKey: ["quran", "surah-list"],
    queryFn: fetchSurahList,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const surahMap = useMemo(() => {
    const m = new Map<number, { namaLatin: string; arti: string }>();
    surahList.forEach((s) =>
      m.set(s.nomor, { namaLatin: s.namaLatin, arti: s.arti }),
    );
    return m;
  }, [surahList]);

  function handleReset() {
    if (
      !confirm(
        "Reset semua progress hafalan? Tindakan ini tidak bisa dibatalkan.",
      )
    )
      return;
    reset();
  }

  const targets = getTargetsByKategori(tab);

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Tahfidz"
        subtitle="Hafalan Al-Quran pribadi"
        onBack={() => navigate("/member")}
        backLabel="Home"
        showSyncButton={false}
        right={
          stats.totalHafal > 0 ? (
            <button
              onClick={handleReset}
              aria-label="Reset semua"
              title="Reset progress"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-muted transition-all duration-200 hover:bg-danger-soft hover:text-danger hover:border-danger/30 active:scale-95"
            >
              <RefreshCw size={15} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Hero stats */}
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 px-5 py-5">
          <div
            className="absolute -right-12 -top-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "rgb(var(--c-accent) / 0.06)" }}
          />

          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={13} className="text-accent/80" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                Progress Hafalan
              </p>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[36px] font-bold text-accent tabular-nums leading-none tracking-[-0.03em]">
                {stats.totalHafal}
              </span>
              <span className="text-[14px] font-medium text-accent/70">
                / {stats.totalAyat} ayat
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-accent/15 overflow-hidden mb-3 mt-3">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: stats.percentage + "%" }}
              />
            </div>

            <div className="flex gap-3 text-[11px] text-accent/80">
              <span>
                <strong className="text-accent">{stats.surahSelesai}</strong>{" "}
                surah selesai
              </span>
              <span>·</span>
              <span>
                <strong className="text-accent">{stats.surahMulai}</strong>{" "}
                sedang berjalan
              </span>
            </div>
          </div>
        </div>

        {/* Review Queue */}
        {reviewQueue.length > 0 && (
          <section className="space-y-2.5">
            <p className="text-ios-footnote font-semibold text-surface-text px-1 flex items-center gap-1.5">
              <RefreshCw size={13} className="text-warning" />
              Muraja'ah — Perlu Diulang
            </p>

            <div className="rounded-2xl border border-warning/20 bg-warning-soft/40 overflow-hidden">
              {reviewQueue.map((item, i) => {
                const info = surahMap.get(item.surah);
                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      navigate(
                        "/member/tahfidz/surah/" +
                          item.surah +
                          "?ayat=" +
                          item.ayat,
                      )
                    }
                    className={
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-warning-soft/60 active:scale-[0.995] " +
                      (i !== reviewQueue.length - 1
                        ? "border-b border-warning/15"
                        : "")
                    }
                  >
                    <span className="w-9 h-9 rounded-xl bg-warning/20 text-warning flex items-center justify-center text-[11px] font-bold tabular-nums flex-shrink-0">
                      {item.ayat}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {info?.namaLatin ?? "Surah " + item.surah}
                      </p>
                      <p className="text-ios-caption text-surface-muted truncate">
                        Ayat {item.ayat} ·{" "}
                        {formatAge(item.state.lastReview)} lalu
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-warning/70 flex-shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab kategori */}
        <div className="flex rounded-2xl bg-surface-card2 border border-surface-border overflow-hidden">
          {TAHFIDZ_KATEGORI.map((k, idx) => {
            const active = tab === k.key;
            return (
              <div key={k.key} className="flex-1 flex">
                {idx > 0 && <div className="w-px bg-surface-border" />}
                <button
                  onClick={() => setTab(k.key)}
                  className={
                    "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
                    (active
                      ? "bg-accent text-white"
                      : "text-surface-muted hover:bg-surface-card")
                  }
                >
                  <span>{k.emoji}</span>
                  {k.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* List surah */}
        <section className="space-y-2.5">
          {targets.map((t) => {
            const p = getSurahProgress(data, t);
            const info = surahMap.get(t.surah);
            const isPartial = t.ayatStart > 1 || t.ayatEnd < t.jumlahAyat;

            return (
              <button
                key={t.surah}
                onClick={() => navigate("/member/tahfidz/surah/" + t.surah)}
                className="w-full text-left rounded-2xl border border-surface-border bg-surface-card overflow-hidden transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    className={
                      "w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold tabular-nums flex-shrink-0 transition-colors duration-200 " +
                      (p.complete
                        ? "bg-success-soft text-success"
                        : p.hafal > 0
                          ? "bg-accent-soft text-accent"
                          : "bg-surface-card2 text-surface-muted")
                    }
                  >
                    {p.complete ? (
                      <Check size={16} strokeWidth={2.8} />
                    ) : (
                      t.surah
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {info?.namaLatin ?? t.namaLatin}
                    </p>
                    <p className="text-ios-caption text-surface-muted truncate">
                      {t.ayatEnd === t.jumlahAyat && t.ayatStart === 1
                        ? t.jumlahAyat + " ayat"
                        : "Ayat " + t.ayatStart + "-" + t.ayatEnd}
                      {isPartial && " · " + t.jumlahAyat + " ayat total"}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    {p.hafal > 0 && (
                      <span
                        className={
                          "text-ios-footnote font-semibold tabular-nums " +
                          (p.complete ? "text-success" : "text-accent")
                        }
                      >
                        {p.hafal}/{p.total}
                      </span>
                    )}
                    {p.hafal === 0 && (
                      <span className="text-ios-caption text-surface-muted">
                        Belum mulai
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      className="text-surface-muted flex-shrink-0"
                    />
                  </div>
                </div>

                {p.hafal > 0 && (
                  <div className="h-1 bg-surface-card2">
                    <div
                      className={
                        "h-full transition-all duration-500 " +
                        (p.complete ? "bg-success" : "bg-accent")
                      }
                      style={{ width: p.percentage + "%" }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </section>

        {stats.totalHafal === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-3">
              <ScrollText size={22} className="text-accent" />
            </div>
            <p className="text-ios-body font-medium text-surface-text mb-1">
              Mulai perjalanan hafalanmu
            </p>
            <p className="text-ios-footnote text-surface-muted max-w-xs mx-auto leading-relaxed">
              Pilih surah di atas untuk mulai menandai ayat yang sudah dihafal.
            </p>
          </div>
        )}

        <p className="text-center text-ios-caption text-surface-muted pt-2">
          Data tersimpan di perangkat Anda saja
        </p>
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helper                                        */
/* -------------------------------------------------------------------------- */

function formatAge(ts?: number): string {
  if (!ts) return "belum pernah";
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "baru saja";
  if (hours < 24) return hours + " jam";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + " hari";
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks + " minggu";
  const months = Math.floor(days / 30);
  return months + " bulan";
}

/* Suppress unused */
void TAHFIDZ_TARGETS;
