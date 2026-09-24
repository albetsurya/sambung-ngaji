import { useEffect, useRef, useState } from "react";
import type { FridaySchedule } from "../../types";
import { BottomSheet, Button, Segmented } from "../common";
import { Download, Loader2, Share2 } from "../common/FontAwesomeIcons";
import { useToast } from "../../contexts/ToastContext";
import { FridaySchedulePrint } from "./FridaySchedulePrint";
import { exportTaarufPdf, exportTaarufPng } from "../taaruf/taarufExport";

/**
 * Sheet cetak jadwal petugas Jumat: pratinjau tabel + unduh PDF/Gambar.
 * Hasil = apa yang tampil di preview (WYSIWYG, landscape).
 */
export function FridayPrintSheet({
  open,
  onClose,
  upcoming,
  past,
}: {
  open: boolean;
  onClose: () => void;
  upcoming: FridaySchedule[];
  past: FridaySchedule[];
}) {
  const [scope, setScope] = useState<"upcoming" | "history">("upcoming");
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      setScope(upcoming.length > 0 ? "upcoming" : "history");
      setBusy(null);
    }
  }, [open, upcoming.length]);

  if (!open) return null;

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
    <BottomSheet open={open} onClose={onClose} title="Cetak Jadwal">
      <div className="pb-2">
        <div className="max-w-[560px] mx-auto mb-3">
          <Segmented
            ariaLabel="Cakupan cetak"
            size="sm"
            value={scope}
            onChange={setScope}
            options={[
              { value: "upcoming", label: `Mendatang (${upcoming.length})` },
              { value: "history", label: `Riwayat (${past.length})` },
            ]}
          />
        </div>

        <div className="overflow-x-auto -mx-5 px-5 pb-1">
          <FridaySchedulePrint
            schedules={data}
            title={`Jadwal Petugas Sholat Jumat (${scopeLabel})`}
          />
        </div>

        <div className="flex gap-2 mt-4 max-w-[560px] mx-auto">
          <Button
            variant="secondary"
            fullWidth
            disabled={busy !== null || data.length === 0}
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
            disabled={busy !== null || data.length === 0}
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
        <p className="text-ios-caption text-surface-muted text-center mt-2">
          Hasil unduhan sama persis dengan pratinjau di atas.
        </p>

        {/* Node cetak off-screen */}
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
      </div>
    </BottomSheet>
  );
}
