import { useMemo, useState } from "react";
import { Search, X, Bookmark } from "../common/FontAwesomeIcons";
import { Segmented } from "../common/Segmented";
import { fetchSurahList, type SurahSummary } from "../../data/quran";
import { JUZ_LIST } from "../../data/quran-juz";
import { useQuery } from "@tanstack/react-query";

interface QuranNavigationSheetProps {
  open: boolean;
  onClose: () => void;
  currentSurah: number;
  onSelectSurah: (surahNomor: number, ayatNomor?: number) => void;
  onSelectJuz: (surahNomor: number, ayatNomor: number) => void;
}

type Tab = "surah" | "juz";

export function QuranNavigationSheet({
  open,
  onClose,
  currentSurah,
  onSelectSurah,
  onSelectJuz,
}: QuranNavigationSheetProps) {
  const [tab, setTab] = useState<Tab>("surah");
  const [search, setSearch] = useState("");

  const { data: surahList = [] } = useQuery({
    queryKey: ["quran", "surah-list"],
    queryFn: fetchSurahList,
    enabled: open,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const filteredSurah = useMemo(() => {
    if (!search.trim()) return surahList;
    const q = search.toLowerCase().trim();
    return surahList.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        String(s.nomor) === q,
    );
  }, [surahList, search]);

  const filteredJuz = useMemo(() => {
    if (!search.trim()) return JUZ_LIST;
    const q = search.toLowerCase().trim();
    return JUZ_LIST.filter(
      (j) =>
        j.surahNama.toLowerCase().includes(q) ||
        String(j.juz) === q ||
        String(j.surah) === q,
    );
  }, [search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md md:max-w-lg h-[85vh] md:h-auto md:max-h-[80vh] rounded-t-3xl md:rounded-3xl bg-surface-bg border-t md:border border-surface-border flex flex-col animate-[slideUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="pt-3 pb-2 flex justify-center flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-surface-card2" />
        </div>

        
        <div className="px-4 pb-3 flex items-center justify-between flex-shrink-0">
          <p className="text-ios-body font-semibold text-surface-text">
            Lompat ke...
          </p>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-colors duration-200 hover:bg-surface-card2"
          >
            <X size={16} />
          </button>
        </div>

        
        <div className="px-4 pb-3 flex-shrink-0">
          <Segmented
            ariaLabel="Navigasi"
            size="sm"
            value={tab}
            onChange={setTab}
            options={[
              { value: "surah", label: "Surah (114)" },
              { value: "juz", label: "Juz (30)" },
            ]}
          />
        </div>

        
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "surah"
                  ? "Cari surah..."
                  : "Cari juz..."
              }
              className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {tab === "surah" && (
            <div className="space-y-1.5">
              {filteredSurah.length === 0 && (
                <p className="text-center py-8 text-ios-footnote text-surface-muted">
                  Tidak ditemukan
                </p>
              )}
              {filteredSurah.map((s) => (
                <SurahRow
                  key={s.nomor}
                  surah={s}
                  active={s.nomor === currentSurah}
                  onClick={() => {
                    onSelectSurah(s.nomor);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}

          {tab === "juz" && (
            <div className="space-y-1.5">
              {filteredJuz.length === 0 && (
                <p className="text-center py-8 text-ios-footnote text-surface-muted">
                  Tidak ditemukan
                </p>
              )}
              {filteredJuz.map((j) => (
                <button
                  key={j.juz}
                  onClick={() => {
                    onSelectJuz(j.surah, j.ayat);
                    onClose();
                  }}
                  className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-3 flex items-center gap-3 transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99]"
                >
                  <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-[13px] font-bold tabular-nums flex-shrink-0">
                    {j.juz}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      Juz {j.juz}
                    </p>
                    <p className="text-ios-caption text-surface-muted truncate">
                      Mulai: {j.surahNama} : {j.ayat}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

function SurahRow({
  surah,
  active,
  onClick,
}: {
  surah: SurahSummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full rounded-xl border px-3.5 py-3 flex items-center gap-3 transition-all duration-200 active:scale-[0.99] " +
        (active
          ? "border-accent bg-accent-soft"
          : "border-surface-border bg-surface-card hover:bg-surface-card2")
      }
    >
      <span
        className={
          "w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold tabular-nums flex-shrink-0 " +
          (active
            ? "bg-accent text-white"
            : "bg-surface-card2 text-surface-muted")
        }
      >
        {surah.nomor}
      </span>
      <div className="flex-1 min-w-0 text-left">
        <p
          className={
            "text-ios-body font-medium truncate " +
            (active ? "text-accent" : "text-surface-text")
          }
        >
          {surah.namaLatin}
        </p>
        <p className="text-ios-caption text-surface-muted truncate">
          {surah.jumlahAyat} ayat · {surah.tempatTurun}
        </p>
      </div>
      <p
        className="text-accent/90 flex-shrink-0"
        style={{
          fontFamily:
            '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
          fontSize: "18px",
          fontWeight: 400,
          lineHeight: 1.2,
        }}
      >
        {surah.nama}
      </p>
    </button>
  );
}

void Bookmark;
