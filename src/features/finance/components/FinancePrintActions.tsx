import React, { useState, type RefObject } from "react";
import { Button } from "../../../components/ui";
import {
  Download,
  FileText,
  Loader2,
} from "../../../components/ui/FontAwesomeIcons";
import { exportTaarufPdf } from "../../../features/taaruf/components/taarufExport";
import { exportElementToExcel } from "../lib/exportElementToExcel";
import { useToast } from "../../../contexts/ToastContext";
import type { PrintOrientation } from "./UnifiedPrintPreview";

interface FinancePrintActionsProps {
  exportRef: RefObject<HTMLDivElement | null>;
  filename: string;
  orientation: PrintOrientation;
}

export const FinancePrintActions: React.FC<FinancePrintActionsProps> = ({
  exportRef,
  filename,
  orientation,
}) => {
  const { showToast } = useToast();
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);

  async function handleExport(kind: "pdf" | "excel") {
    const node = exportRef.current;
    if (!node || busy) return;
    setBusy(kind);
    try {
      if (kind === "pdf") {
        await exportTaarufPdf(node, filename, "", {
          margin: 0,
          ignoreTransform: true,
          orientation,
          includeDate: false,
        });
      } else {
        await exportElementToExcel(node, filename);
      }
      showToast(
        kind === "pdf" ? "PDF berhasil diunduh" : "Excel berhasil diunduh",
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
              <FileText size={15} />
            )}
            {busy === "pdf" ? "Membuat..." : "PDF"}
          </span>
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled={busy !== null}
          onClick={() => handleExport("excel")}
        >
          <span className="inline-flex items-center gap-2">
            {busy === "excel" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            {busy === "excel" ? "Membuat..." : "Excel"}
          </span>
        </Button>
      </div>
      <p className="text-ios-caption text-surface-muted text-center">
        PDF mengikuti ukuran, orientasi, dan spasi sel pada pratinjau.
      </p>
    </>
  );
};
