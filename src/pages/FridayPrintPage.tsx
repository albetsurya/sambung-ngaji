import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Button,
  EmptyState,
  ErrorState,
  Segmented,
} from "../components/ui";
import { GroupedListSkeleton } from "../components/ui/Skeleton";
import { Download, Loader2, Share2 } from "../components/ui/FontAwesomeIcons";
import { fridayApi } from "../services/domainApi";
import { FridaySchedulePrint } from "../features/friday/components/FridaySchedulePrint";
import { exportTaarufPdf, exportTaarufPng } from "../features/taaruf/components/taarufExport";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { todayIso } from "../features/friday/utils/friday";

export default function FridayPrintPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scopeParam = searchParams.get("scope");
  const scope: "upcoming" | "history" =
    scopeParam === "history" ? "history" : "upcoming";

  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.fridaySchedules(),
    queryFn: () => fridayApi.list(),
    staleTime: 5 * 60_000,
  });

  const today = todayIso();
  const upcoming = useMemo(
    () =>
      schedules
        .filter((s) => s.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [schedules, today],
  );
  const past = useMemo(
    () =>
      schedules
        .filter((s) => s.date < today)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [schedules, today],
  );

  const data = scope === "upcoming" ? upcoming : past;
  const scopeLabel = scope === "upcoming" ? "Mendatang" : "Riwayat";

  async function handleExport(kind: "pdf" | "png") {
    const node = exportRef.current;
    if (!node || busy) return;
    setBusy(kind);
    try {
      if (kind === "pdf") {
        await exportTaarufPdf(node, scopeLabel, "Jadwal-Petugas-Jumat");
      } else {
        await exportTaarufPng(node, scopeLabel, "Jadwal-Petugas-Jumat");
      }
      showToast(
        kind === "pdf" ? "PDF berhasil diunduh" : "Gambar berhasil diunduh",
      );
    } catch {
      showToast("Gagal mengekspor. Periksa koneksi lalu coba lagi", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppLayout hideNav>
      <Header
        title="Cetak Jadwal"
        subtitle="Jadwal Petugas Sholat Jumat"
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/lainnya/petugas-jumat", { replace: true });
        }}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        <Segmented
          ariaLabel="Cakupan cetak"
          value={scope}
          onChange={(v) =>
            setSearchParams({ scope: v }, { replace: true })
          }
          options={[
            { value: "upcoming", label: `Mendatang (${upcoming.length})` },
            { value: "history", label: `Riwayat (${past.length})` },
          ]}
        />

        {isLoading ? (
          <GroupedListSkeleton rows={4} />
        ) : error ? (
          <ErrorState
            message={
              error instanceof ApiError ? error.message : "Gagal memuat jadwal"
            }
            onRetry={refetch}
          />
        ) : data.length === 0 ? (
          <EmptyState
            title="Tidak ada jadwal"
            description={`Belum ada jadwal petugas Jumat ${scopeLabel.toLowerCase()}.`}
          />
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 px-4 pb-1">
              <FridaySchedulePrint
                schedules={data}
                title={`Jadwal Petugas Sholat Jumat (${scopeLabel})`}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                disabled={busy !== null}
                onClick={() => handleExport("pdf")}
              >
                <span className="inline-flex items-center gap-2">
                  {busy === "pdf" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  {busy === "pdf" ? "Membuat..." : "PDF"}
                </span>
              </Button>
              <Button
                variant="secondary"
                fullWidth
                disabled={busy !== null}
                onClick={() => handleExport("png")}
              >
                <span className="inline-flex items-center gap-2">
                  {busy === "png" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Share2 size={15} />
                  )}
                  {busy === "png" ? "Membuat..." : "Gambar"}
                </span>
              </Button>
            </div>
            <p className="text-ios-caption text-surface-muted text-center">
              Hasil unduhan sama persis dengan pratinjau di atas.
            </p>

            
            <div
              aria-hidden
              style={{ position: "fixed", left: -10000, top: 0, width: 900 }}
            >
              <div ref={exportRef}>
                <FridaySchedulePrint
                  schedules={data}
                  title={`Jadwal Petugas Sholat Jumat (${scopeLabel})`}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
