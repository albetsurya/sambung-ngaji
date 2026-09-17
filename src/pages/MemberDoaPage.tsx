import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  CheckCircle2,
  RefreshCw,
  Star,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { DoaCard } from "../components/member/DoaCard";
import { DoaFontSizeSheet } from "../components/member/DoaFontSizeSheet";
import { useDoaProgress } from "../hooks/useDoaProgress";
import { useDoaFontSize } from "../hooks/useDoaFontSize";
import { useDoaFavorites } from "../hooks/useDoaFavorites";
import { DOA_KATEGORI, getDoaKategori, type DoaWaktu } from "../data/doa";

type FilterMode = "all" | "favorites";

export default function MemberDoaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fontSheetOpen, setFontSheetOpen] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");

  const waktuParam = searchParams.get("waktu");
  const waktu: DoaWaktu = waktuParam === "sore" ? "sore" : "pagi";
  const kategori = getDoaKategori(waktu);

  const { readIds, toggle, reset, count, total, percentage } = useDoaProgress(
    waktu,
    kategori.entries.length,
  );
  const { size: fontSize, spec: fontSizeSpec } = useDoaFontSize();
  const {
    isFavorite,
    toggle: toggleFav,
    count: favCount,
  } = useDoaFavorites();

  const visibleEntries = useMemo(() => {
    if (filter === "favorites") {
      return kategori.entries.filter((d) => isFavorite(d.id));
    }
    return kategori.entries;
  }, [kategori.entries, filter, isFavorite]);

  // Hitung favCount khusus untuk waktu ini (bukan global)
  const favCountForWaktu = useMemo(
    () => kategori.entries.filter((d) => isFavorite(d.id)).length,
    [kategori.entries, isFavorite],
  );

  function switchWaktu(w: DoaWaktu) {
    setSearchParams({ waktu: w }, { replace: true });
    if (filter === "favorites") setFilter("all");
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title={kategori.label}
        subtitle={kategori.description}
        onBack={() => navigate("/member")}
        backLabel="Home"
        showSyncButton={false}
        right={
          <button
            onClick={() => setFontSheetOpen(true)}
            aria-label="Ubah ukuran teks"
            title="Ubah ukuran teks"
            className="flex items-center gap-1 h-9 px-3 rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all duration-200 hover:bg-surface-card2 active:scale-95"
          >
            <span
              className="text-[11px] font-bold"
              style={{
                fontFamily:
                  '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                fontSize: 16,
              }}
            >
              Aa
            </span>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        <div className="flex rounded-2xl bg-surface-card2 border border-surface-border overflow-hidden">
          {DOA_KATEGORI.map((k, idx) => {
            const active = k.key === waktu;
            const Icon = k.key === "pagi" ? Sun : Moon;
            return (
              <div key={k.key} className="flex-1 flex">
                {idx > 0 && <div className="w-px bg-surface-border" />}
                <button
                  onClick={() => switchWaktu(k.key)}
                  className={
                    "flex-1 min-h-[52px] flex items-center justify-center gap-2 text-ios-footnote font-medium transition-all duration-200 " +
                    (active
                      ? "bg-accent text-white"
                      : "text-surface-muted hover:bg-surface-card")
                  }
                >
                  <Icon size={16} />
                  {k.label}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={
              "px-3.5 h-9 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] " +
              (filter === "all"
                ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
                : "bg-surface-card text-surface-text border-surface-border hover:bg-surface-card2")
            }
          >
            Semua ({kategori.entries.length})
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={
              "flex items-center gap-1.5 px-3.5 h-9 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] " +
              (filter === "favorites"
                ? "bg-warning text-white border-warning shadow-sm shadow-warning/30"
                : "bg-surface-card text-surface-text border-surface-border hover:bg-surface-card2")
            }
          >
            <Star size={12} strokeWidth={2.4} />
            Favorit ({favCountForWaktu})
          </button>
        </div>

        {filter === "all" && (
          <div className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={14}
                  className={
                    count === total && total > 0
                      ? "text-success"
                      : "text-accent"
                  }
                />
                <span className="text-ios-footnote font-medium text-surface-text">
                  Progress hari ini
                </span>
              </div>
              <span
                className={
                  "text-ios-footnote font-semibold tabular-nums " +
                  (count === total && total > 0 ? "text-success" : "text-accent")
                }
              >
                {count}/{total}
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-surface-card2 overflow-hidden">
              <div
                className={
                  "h-full transition-all duration-500 " +
                  (count === total && total > 0 ? "bg-success" : "bg-accent")
                }
                style={{ width: percentage + "%" }}
              />
            </div>

            {count > 0 && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-ios-caption text-surface-muted">
                  {count === total
                    ? "Alhamdulillah, semua doa sudah dibaca"
                    : "Teruskan, tinggal " + (total - count) + " lagi"}
                </p>
                <button
                  onClick={reset}
                  className="flex items-center gap-1 text-ios-caption font-medium text-surface-muted transition-colors duration-200 hover:text-danger"
                >
                  <RefreshCw size={11} />
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {visibleEntries.length === 0 && filter === "favorites" && (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-warning-soft flex items-center justify-center mx-auto mb-3">
              <Star size={22} className="text-warning" />
            </div>
            <p className="text-ios-body font-medium text-surface-text mb-1">
              Belum ada favorit
            </p>
            <p className="text-ios-footnote text-surface-muted max-w-xs mx-auto leading-relaxed">
              Tap ikon bintang di samping judul doa untuk menandai favorit.
              Doa favorit tersimpan permanen.
            </p>
          </div>
        )}

        {visibleEntries.length > 0 && (
          <>
            <div className="text-center py-3 border-b border-surface-border/60">
              <p
                className="text-accent/80 py-2"
                style={{
                  fontFamily:
                    '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                  fontSize: fontSizeSpec.labelArabic + "px",
                  fontWeight: 400,
                  lineHeight: 2,
                  wordSpacing: "0.1em",
                }}
              >
                {kategori.arabLabel}
              </p>
              <p className="text-ios-footnote text-surface-muted mt-1">
                {visibleEntries.length} doa — klik untuk membuka
              </p>
            </div>

            <div className="space-y-2.5">
              {visibleEntries.map((doa) => {
                const realIndex = kategori.entries.findIndex(
                  (d) => d.id === doa.id,
                );
                return (
                  <DoaCard
                    key={doa.id}
                    doa={doa}
                    index={realIndex}
                    isRead={readIds.has(doa.id)}
                    onToggleRead={() => toggle(doa.id)}
                    isFavorite={isFavorite(doa.id)}
                    onToggleFavorite={() => toggleFav(doa.id)}
                    fontSize={fontSize}
                  />
                );
              })}
            </div>
          </>
        )}

        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5">
          <p className="text-ios-caption text-surface-muted leading-relaxed">
            Doa pagi dibaca setelah Subuh hingga terbit matahari. Doa sore
            dibaca setelah Ashar hingga terbenam matahari.
          </p>
          <p className="text-ios-caption text-surface-muted leading-relaxed mt-2">
            <span className="font-medium text-surface-text">Sumber:</span>{" "}
            Al-Quran & Kutubusittah — Shahih Bukhari, Shahih Muslim, Sunan Abu
            Dawud, Sunan at-Tirmidzi, Sunan an-Nasa'i, dan Sunan Ibnu Majah.
          </p>
        </div>
      </div>

      <DoaFontSizeSheet
        open={fontSheetOpen}
        onClose={() => setFontSheetOpen(false)}
      />
    </AppLayout>
  );
}
