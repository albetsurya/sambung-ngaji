import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  ChevronRight,
  Trash2,
  X,
  Search,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { ConfirmDialog } from "../components/common";
import { fetchSurahList, type SurahSummary } from "../data/quran";
import { useQuranBookmark } from "../hooks/useQuranBookmark";
import { useIsMuballigh } from "../hooks/useIsMuballigh";
import { TranslationLockedNote } from "../components/member/TranslationLockedNote";
import { useToast } from "../contexts/ToastContext";

export default function MemberQuranBookmarkPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const showTranslation = useIsMuballigh();
  const { bookmarks, toggleBookmark, clearBookmarks } = useQuranBookmark();

  const [search, setSearch] = useState("");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { data: surahList = [] } = useQuery({
    queryKey: ["quran", "surah-list"],
    queryFn: fetchSurahList,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const surahMap = useMemo(() => {
    const m = new Map<number, SurahSummary>();
    surahList.forEach((s) => m.set(s.nomor, s));
    return m;
  }, [surahList]);

  /* ---------------------------- Filter + group ---------------------------- */

  const filtered = useMemo(() => {
    if (!search.trim()) return bookmarks;
    const q = search.toLowerCase().trim();
    return bookmarks.filter(
      (b) =>
        b.surahNama.toLowerCase().includes(q) ||
        b.ayatPreview.toLowerCase().includes(q) ||
        String(b.ayatNomor) === q ||
        String(b.surahNomor) === q,
    );
  }, [bookmarks, search]);

  const grouped = useMemo(() => {
    const map = new Map<number, typeof bookmarks>();
    for (const b of filtered) {
      const list = map.get(b.surahNomor) ?? [];
      list.push(b);
      map.set(b.surahNomor, list);
    }
    // Sort surah number ascending
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([surahNomor, items]) => {
        // Sort ayat ascending
        const sorted = [...items].sort((a, b) => a.ayatNomor - b.ayatNomor);
        return { surahNomor, items: sorted };
      });
  }, [filtered]);

  function formatDate(ts: number): string {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(ts));
    } catch {
      return "";
    }
  }

  function handleOpen(surah: number, ayat: number) {
    navigate("/member/quran/" + surah + "?ayat=" + ayat);
  }

  function handleRemove(surah: number, ayat: number, e: React.MouseEvent) {
    e.stopPropagation();
    const found = bookmarks.find(
      (b) => b.surahNomor === surah && b.ayatNomor === ayat,
    );
    if (found) {
      toggleBookmark(found);
      showToast("Bookmark dihapus");
    }
  }

  function handleClearAll() {
    clearBookmarks();
    setConfirmClearOpen(false);
    showToast("Semua bookmark dihapus");
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Bookmark Ayat"
        subtitle={
          bookmarks.length > 0
            ? bookmarks.length + " ayat"
            : "Belum ada bookmark"
        }
        onBack={() => navigate("/member/quran")}
        backLabel="Al-Quran"
        showSyncButton={false}
        right={
          bookmarks.length > 0 ? (
            <button
              onClick={() => setConfirmClearOpen(true)}
              aria-label="Hapus semua"
              title="Hapus semua bookmark"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-muted transition-all duration-200 hover:bg-danger-soft hover:text-danger hover:border-danger/30 active:scale-95"
            >
              <Trash2 size={15} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Search */}
        {bookmarks.length > 0 && (
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari surah atau preview ayat..."
              className="w-full min-h-[42px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {bookmarks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <Bookmark size={24} className="text-accent" />
            </div>
            <p className="text-ios-body font-semibold text-surface-text mb-1.5">
              Belum ada bookmark
            </p>
            <p className="text-ios-footnote text-surface-muted max-w-xs mx-auto leading-relaxed mb-5">
              Saat membaca Al-Quran, tap ikon bookmark di ayat untuk
              menyimpannya di sini.
            </p>
            <button
              onClick={() => navigate("/member/quran")}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-5 rounded-xl bg-accent text-white text-ios-footnote font-medium transition-all duration-200 hover:bg-accent-dark active:scale-95"
            >
              Buka Al-Quran
            </button>
          </div>
        )}

        {/* Empty search */}
        {bookmarks.length > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
            <p className="text-ios-body font-medium text-surface-text mb-1">
              Tidak ditemukan
            </p>
            <p className="text-ios-footnote text-surface-muted">
              Coba kata kunci lain
            </p>
          </div>
        )}

        {/* Grouped list */}
        {grouped.map((g) => {
          const surahInfo = surahMap.get(g.surahNomor);
          return (
            <section key={g.surahNomor} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold tabular-nums flex-shrink-0">
                    {g.surahNomor}
                  </span>
                  <p className="text-ios-footnote font-semibold text-surface-text truncate">
                    {surahInfo?.namaLatin ?? g.items[0].surahNama}
                  </p>
                </div>
                <span className="text-ios-caption text-surface-muted flex-shrink-0">
                  {g.items.length} ayat
                </span>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
                {g.items.map((b, i) => (
                  <div
                    key={b.surahNomor + ":" + b.ayatNomor}
                    className={
                      "flex items-center gap-3 px-4 py-3 " +
                      (i !== g.items.length - 1
                        ? "border-b border-surface-border"
                        : "")
                    }
                  >
                    <button
                      onClick={() => handleOpen(b.surahNomor, b.ayatNomor)}
                      className="flex-1 min-w-0 text-left active:scale-[0.995] transition-transform"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-ios-caption font-semibold text-accent tabular-nums">
                          Ayat {b.ayatNomor}
                        </span>
                        <span className="text-[10px] text-surface-muted">
                          · {formatDate(b.timestamp)}
                        </span>
                      </div>
                      {showTranslation ? (
                        <p className="text-ios-footnote text-surface-text truncate">
                          {b.ayatPreview || "(tanpa preview)"}
                        </p>
                      ) : (
                        <TranslationLockedNote className="truncate" />
                      )}
                    </button>

                    <button
                      onClick={(e) =>
                        handleRemove(b.surahNomor, b.ayatNomor, e)
                      }
                      aria-label="Hapus bookmark"
                      title="Hapus bookmark"
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-surface-muted transition-colors duration-200 hover:bg-danger-soft hover:text-danger active:scale-95"
                    >
                      <X size={14} />
                    </button>

                    <button
                      onClick={() => handleOpen(b.surahNomor, b.ayatNomor)}
                      aria-label="Buka ayat"
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-surface-muted transition-colors duration-200 hover:bg-accent-soft hover:text-accent active:scale-95"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {bookmarks.length > 0 && (
          <p className="text-center text-ios-caption text-surface-muted pt-2">
            Total {bookmarks.length} ayat di-bookmark ·{" "}
            {grouped.length} surah
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Hapus semua bookmark?"
        description={
          "Semua " +
          bookmarks.length +
          " bookmark ayat akan dihapus. Tindakan ini tidak bisa dibatalkan."
        }
        confirmLabel="Ya, Hapus Semua"
        danger
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={handleClearAll}
      />
    </AppLayout>
  );
}
