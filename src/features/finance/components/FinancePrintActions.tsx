import React, { useState, type RefObject } from "react";
import { Button } from "../../../components/common";
import { Download, Loader2, Share2 } from "../../../components/common/FontAwesomeIcons";
import { exportTaarufPdf, exportTaarufPng } from "../../../components/taaruf/taarufExport";
import { useToast } from "../../../contexts/ToastContext";

interface FinancePrintActionsProps {
  exportRef: RefObject<HTMLDivElement | null>;
  filename: string;
}

export const FinancePrintActions: React.FC<FinancePrintActionsProps> = ({
  exportRef,
  filename,
}) => {
  const { showToast } = useToast();
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);

  async function handleExport(kind: "pdf" | "png") {
    const node = exportRef.current;
    if (!node || busy) return;
    setBusy(kind);
    try {
      if (kind === "pdf") {
        await exportTaarufPdf(node, filename, "SabilKas");
      } else {
        await exportTaarufPng(node, filename, "SabilKas");
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
    <>
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
    </>
  );
};
