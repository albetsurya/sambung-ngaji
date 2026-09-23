import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  ScrollText,
  Bookmark,
  ChevronRight,
  BookOpen,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { ErrorState } from "../components/common";
import { fetchSurahList, type SurahSummary } from "../data/quran";
import { useQuranBookmark } from "../hooks/useQuranBookmark";

/* -------------------------------------------------------------------------- */
/*                              Helper                                        */
/* -------------------------------------------------------------------------- */

function toArabicNumber(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n)
    .split("")
    .map((d) => arabicDigits[Number(d)] ?? d)
    .join("");
}

/* -------------------------------------------------------------------------- */
/*                              Main                                          */
/* -------------------------------------------------------------------------- */

export default function MemberQuranPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { lastRead, bookmarkCount } = useQuranBookmark();

  const {
    data: surahList = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quran", "surah-list"],
    queryFn: fetchSurahList,
    staleTime: 24 * 60 * 60 * 1000, // 24 jam — data tidak berubah
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!deferredSearch.trim()) return surahList;
    const q = deferredSearch.toLowerCase().trim();
    return surahList.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        String(s.nomor) === q,
    );
  }, [surahList, deferredSearch]);

  const hasSearch = search.trim().length > 0;

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Al-Quran"
        subtitle="114 surah"
        onBack={() => goBack(navigate, "/member")}
        backLabel="Kembali"
        showSyncButton={false}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/member/quran/mushaf")}
              aria-label="Baca mushaf"
              title="Baca mushaf (halaman per halaman)"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-soft border border-accent/30 text-accent transition-all duration-200 hover:bg-accent-soft/80 active:scale-95"
            >
              <BookOpen size={15} />
            </button>
            {bookmarkCount > 0 && (
              <button
                onClick={() => navigate("/member/quran/bookmark")}
                aria-label="Bookmark"
                title="Ayat yang di-bookmark"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all duration-200 hover:bg-surface-card2 active:scale-95"
              >
                <Bookmark size={15} />
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                  {bookmarkCount}
                </span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari surah (nama / arti / nomor)"
            className="w-full min-h-[42px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {hasSearch && (
            <button
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {isLoading && <SurahListSkeleton rows={12} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof Error ? error.message : "Gagal memuat surah"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && (
          <>
            {/* Card "Terakhir Dibaca" */}
            {lastRead && !hasSearch && (
              <button
                onClick={() =>
                  navigate("/member/quran/" + lastRead.surahNomor)
                }
                className="w-full mb-3 rounded-2xl border border-accent/25 bg-accent-soft/60 p-3.5 flex items-center gap-3 transition-all duration-200 hover:bg-accent-soft active:scale-[0.99]"
              >
                <span className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0">
                  <ScrollText size={17} />
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/80 mb-0.5">
                    Terakhir dibaca
                  </p>
                  <p className="text-ios-body font-medium text-surface-text truncate">
                    {lastRead.surahNama}
                  </p>
                  <p className="text-ios-caption text-surface-muted truncate">
                    Ayat {lastRead.ayatNomor}
                  </p>
                </div>
                <ChevronRight size={18} className="text-accent/70 flex-shrink-0" />
              </button>
            )}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
                <p className="text-ios-body font-medium text-surface-text mb-1">
                  Tidak ditemukan
                </p>
                <p className="text-ios-footnote text-surface-muted">
                  Coba kata kunci lain
                </p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
                {filtered.map((s, i) => (
                  <SurahRow
                    key={s.nomor}
                    surah={s}
                    divider={i !== filtered.length - 1}
                    onClick={() =>
                      navigate("/member/quran/" + s.nomor)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SurahRow                                      */
/* -------------------------------------------------------------------------- */

function SurahRow({
  surah,
  divider,
  onClick,
}: {
  surah: SurahSummary;
  divider: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-surface-card2 active:scale-[0.995] " +
        (divider ? "border-b border-surface-border" : "")
      }
    >
      <span className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="absolute inset-0"
        >
          <polygon
            points="20,2 36,11 36,29 20,38 4,29 4,11"
            fill="rgb(var(--c-accent) / 0.12)"
          />
        </svg>
        <span className="relative text-[12px] font-bold text-accent tabular-nums">
          {surah.nomor}
        </span>
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-ios-body font-medium text-surface-text truncate">
          {surah.namaLatin}
        </p>
        <p className="text-ios-caption text-surface-muted truncate">
          {surah.arti} · {surah.jumlahAyat} ayat · {surah.tempatTurun}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <p
          className="text-accent/90"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
            fontSize: "19px",
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          {surah.nama}
        </p>
        <p className="text-[11px] text-surface-muted tabular-nums">
          {toArabicNumber(surah.nomor)}
        </p>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Skeleton                                      */
/* -------------------------------------------------------------------------- */

function SurahListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={
            "flex items-center gap-3 px-4 py-3.5 " +
            (i !== rows - 1 ? "border-b border-surface-border" : "")
          }
        >
          <div className="w-10 h-10 rounded-xl bg-surface-card2 animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-2/5 rounded-md bg-surface-card2 animate-pulse" />
            <div className="h-3 w-1/2 rounded-md bg-surface-card2 animate-pulse" />
          </div>
          <div className="h-5 w-12 rounded-md bg-surface-card2 animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
