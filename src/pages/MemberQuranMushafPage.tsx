import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  List,
  Bookmark,
  Type as TypeIcon,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MasukButton } from "../components/ui";
import { Button, ErrorState } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { MushafPageSkeleton } from "../components/ui/Skeleton";
import { MushafPageView } from "../features/member/components/MushafPageView";
import { QuranNavigationSheet } from "../features/member/components/QuranNavigationSheet";
import { fetchSurahList } from "../features/quran/data/quran";
import {
  fetchMushafPage,
  surahToStartPage,
  type MushafPage,
} from "../features/quran/data/quran-mushaf";
import { useMushafBookmark } from "../features/quran/hooks/useMushafBookmark";
import { useDoaFontSize } from "../features/doa-dzikir/hooks/useDoaFontSize";

const TOTAL_PAGES = 604;

export default function MemberQuranMushafPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const pageParam = Number(searchParams.get("hal"));
  const currentPage = useMemo(() => {
    if (Number.isInteger(pageParam) && pageParam >= 1 && pageParam <= TOTAL_PAGES) {
      return pageParam;
    }
    return 1;
  }, [pageParam]);

  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [scale, setScale] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem("mushaf-scale"));
      if (v >= 0.8 && v <= 1.4) return v;
    } catch {
    }
    return 1;
  });

  const { lastPage, setLastPage } = useMushafBookmark();
  const { size: fontSize } = useDoaFontSize();

  const swipeRef = useRef({ x: 0, y: 0, active: false });
  const hideTimer = useRef<number | null>(null);

  const { data: surahList = [] } = useQuery({
    queryKey: ["quran", "surah-list"],
    queryFn: fetchSurahList,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery<MushafPage>({
    queryKey: ["mushaf", "page", currentPage],
    queryFn: () => fetchMushafPage(currentPage),
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (!pageData) return;
    const neighbors = [currentPage - 2, currentPage - 1, currentPage + 1, currentPage + 2];
    const t = setTimeout(() => {
      for (const p of neighbors) {
        if (p >= 1 && p <= TOTAL_PAGES && p !== currentPage) {
          queryClient.prefetchQuery({
            queryKey: ["mushaf", "page", p],
            queryFn: () => fetchMushafPage(p),
            staleTime: Infinity,
          });
        }
      }
    }, 300);
    return () => clearTimeout(t);
  }, [currentPage, pageData, queryClient]);

  useEffect(() => {
    if (pageData) setLastPage(currentPage);
  }, [currentPage, pageData, setLastPage]);

  useEffect(() => {
    try {
      localStorage.setItem("mushaf-scale", String(scale));
    } catch {
    }
  }, [scale]);

  useEffect(() => {
    if (!controlsVisible) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 3000);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [controlsVisible, currentPage]);

  function goToPage(p: number) {
    if (p < 1 || p > TOTAL_PAGES) return;
    const next = new URLSearchParams(searchParams);
    next.set("hal", String(p));
    setSearchParams(next, { replace: true });
    setControlsVisible(true);
  }

  function nextPage() {
    goToPage(currentPage + 1);
  }

  function prevPage() {
    goToPage(currentPage - 1);
  }

  function onPointerDown(x: number, y: number) {
    swipeRef.current = { x, y, active: true };
  }

  function onPointerUp(x: number, y: number) {
    if (!swipeRef.current.active) return;
    const dx = x - swipeRef.current.x;
    const dy = y - swipeRef.current.y;
    swipeRef.current.active = false;

    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) nextPage();
    else prevPage();
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") nextPage();
      else if (e.key === "ArrowRight") prevPage();
      else if (e.key === "ArrowUp") goToPage(currentPage - 1);
      else if (e.key === "ArrowDown") goToPage(currentPage + 1);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  function cycleScale() {
    const next = scale < 1 ? 1 : scale < 1.2 ? 1.2 : 0.85;
    setScale(next);
  }

  function handleJumpInput(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(jumpInput);
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL_PAGES) {
      goToPage(n);
      setJumpInput("");
    }
  }

  const pageIndicator = currentPage + " / " + TOTAL_PAGES;

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title={pageData && surahList.length > 0
          ? (surahList.find((s) => s.nomor === pageData.verses[0]?.surah)?.namaLatin ?? "Al-Quran")
          : "Al-Quran Mushaf"}
        subtitle={"Halaman " + pageIndicator}
        onBack={() => navigate("/member/quran")}
        backLabel="Al-Quran"
        showSyncButton={false}
        right={
          <div className="flex items-center gap-1">
            {!user && <MasukButton />}
            <Button
              onClick={cycleScale}
              aria-label="Ubah ukuran"
              title="Ukuran teks"
              variant="secondary"
              size="xs"
              iconOnly
            >
              <TypeIcon size={14} />
            </Button>
            <Button
              onClick={() => setNavSheetOpen(true)}
              aria-label="Lompat ke surah / halaman"
              title="Lompat ke..."
              variant="secondary"
              size="xs"
              iconOnly
            >
              <List size={16} />
            </Button>
          </div>
        }
      />

      
      <div
        className="relative flex-1 overflow-hidden select-none"
        style={{ height: "calc(100vh - 52px - var(--safe-top) - 60px)" }}
        onPointerDown={(e) => onPointerDown(e.clientX, e.clientY)}
        onPointerUp={(e) => onPointerUp(e.clientX, e.clientY)}
        onPointerCancel={() => (swipeRef.current.active = false)}
      >
        {isLoading && <MushafPageSkeleton />}

        {!isLoading && error && (
          <div className="h-full flex items-center justify-center p-4">
            <ErrorState
              message={error instanceof Error ? error.message : "Gagal memuat halaman"}
              onRetry={refetch}
            />
          </div>
        )}

        {!isLoading && !error && pageData && (
          <div
            key={currentPage}
            className="h-full overflow-y-auto bg-surface-card mx-auto max-w-2xl anim-fade-fast pb-[140px]"
          >
            <MushafPageView
              page={pageData}
              surahList={surahList}
              fontSize={fontSize}
              scale={scale}
            />
          </div>
        )}

        
        <div
          className={
            "absolute left-1/2 -translate-x-1/2 bottom-3 pointer-events-none transition-opacity duration-300 " +
            (controlsVisible ? "opacity-100" : "opacity-0")
          }
        >
          <div className="px-3 py-1.5 rounded-full bg-surface-bg/90 backdrop-blur border border-surface-border shadow-sm text-[11px] text-surface-text tabular-nums">
            Hal. {pageIndicator}
          </div>
        </div>
      </div>

      
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 pb-safe bg-surface-bg/95 backdrop-blur border-t border-surface-border">
        <div className="app-shell px-3 py-2.5 flex items-center gap-2">
          <Button
            onClick={nextPage}
            disabled={currentPage >= TOTAL_PAGES}
            aria-label="Halaman berikutnya"
            title="Halaman berikutnya"
            variant="secondary"
            size="sm"
            iconOnly
          >
            <ChevronLeft size={20} />
          </Button>

          <form
            onSubmit={handleJumpInput}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="number"
              min={1}
              max={TOTAL_PAGES}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={"Hal. " + currentPage}
              className="flex-1 min-h-[44px] rounded-xl border border-surface-border bg-surface-card px-3 text-center text-[16px] text-surface-text placeholder:text-surface-muted focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 tabular-nums"
            />
            {jumpInput && (
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Go
              </Button>
            )}
          </form>

          <Button
            onClick={prevPage}
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
            title="Halaman sebelumnya"
            variant="secondary"
            size="sm"
            iconOnly
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        
        {lastPage && lastPage !== currentPage && (
          <div className="app-shell px-3 pb-2">
            <Button
              onClick={() => goToPage(lastPage)}
              variant="soft"
              size="sm"
              fullWidth
              leftIcon={<Bookmark size={12} />}
            >
              Lanjutkan dari hal. {lastPage}
            </Button>
          </div>
        )}
      </div>

      <QuranNavigationSheet
        open={navSheetOpen}
        onClose={() => setNavSheetOpen(false)}
        currentSurah={pageData?.verses[0]?.surah ?? 1}
        onSelectSurah={(s) => {
          goToPage(surahToStartPage(s));
        }}
        onSelectJuz={(s, _a) => {
          goToPage(surahToStartPage(s));
        }}
      />
    </AppLayout>
  );
}

void ChevronDown;
