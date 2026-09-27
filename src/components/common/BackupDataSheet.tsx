import { useRef, useState } from "react";
import { BottomSheet, Button, ConfirmDialog } from "./index";
import { Download, Upload, AlertTriangle, Check } from "./FontAwesomeIcons";
import {
  collectBackup,
  downloadBackup,
  parseBackupFile,
  restoreBackup,
  type ImportPreview,
} from "../../lib/backupData";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export function BackupDataSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  const userId = user?.user_id || "";
  const username = user?.username || "";

  const stats = collectBackup(userId, username).stats;

  function handleExport() {
    if (stats.keyCount === 0) {
      showToast("Belum ada data untuk di-backup", "error");
      return;
    }
    const { payload } = collectBackup(userId, username);
    downloadBackup(payload, username);
    showToast("File backup berhasil di-download");
    onClose();
  }

  function handleFilePick() {
    fileRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseBackupFile(text, userId);
      setPreview(parsed);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal membaca file backup",
        "error",
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleConfirmRestore() {
    if (!preview) return;
    try {
      const res = restoreBackup(preview.file, userId);
      showToast(
        "Berhasil restore " +
          res.restored +
          " data" +
          (res.skipped > 0 ? " (" + res.skipped + " dilewati)" : ""),
      );
      setConfirmRestoreOpen(false);
      setPreview(null);
      onClose();
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal restore data",
        "error",
      );
    }
  }

  function formatDateId(iso: string): string {
    if (!iso) return "(tidak ada tanggal)";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return iso;
    }
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Backup Data">
        <div className="rounded-xl bg-accent-soft/60 border border-accent/15 p-3 mb-4">
          <p className="text-ios-footnote text-accent/90 leading-relaxed">
            Data Anda tersimpan di HP ini saja. Lakukan backup rutin, khususnya
            sebelum ganti HP atau bersihkan browser.
          </p>
        </div>

        
        <div className="rounded-2xl border border-surface-border bg-surface-card p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-ios-caption text-surface-muted mb-1">
                Data saat ini
              </p>
              <p className="text-[20px] font-semibold text-surface-text tabular-nums leading-none">
                {stats.keyCount}
                <span className="text-[12px] font-medium text-surface-muted ml-1.5">
                  item
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-ios-caption text-surface-muted mb-1">Ukuran</p>
              <p className="text-[15px] font-semibold text-surface-text tabular-nums">
                {stats.sizeFormatted}
              </p>
            </div>
          </div>
        </div>

        
        <button
          onClick={handleExport}
          disabled={stats.keyCount === 0}
          className={
            "w-full rounded-2xl border p-4 flex items-center gap-3 transition-all duration-200 active:scale-[0.99] mb-2.5 " +
            (stats.keyCount === 0
              ? "border-surface-border bg-surface-card/50 opacity-60 cursor-not-allowed"
              : "border-accent/30 bg-accent-soft hover:bg-accent-soft/80")
          }
        >
          <span
            className={
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " +
              (stats.keyCount === 0
                ? "bg-surface-card2 text-surface-muted"
                : "bg-accent text-white")
            }
          >
            <Download size={18} />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-ios-body font-medium text-surface-text">
              Export Backup
            </p>
            <p className="text-ios-caption text-surface-muted">
              Download file .json, simpan di Drive / WhatsApp sendiri
            </p>
          </div>
        </button>

        
        <button
          onClick={handleFilePick}
          className="w-full rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3 transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99]"
        >
          <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Upload size={18} />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-ios-body font-medium text-surface-text">
              Import Backup
            </p>
            <p className="text-ios-caption text-surface-muted">
              Restore dari file .json yang sudah di-download sebelumnya
            </p>
          </div>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileSelected}
        />

        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-warning-soft/60 border border-warning/20 p-3">
          <AlertTriangle
            size={14}
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <p className="text-ios-caption text-warning leading-relaxed">
            <strong>Import akan menimpa</strong> data Anda saat ini. Pastikan
            Anda sudah export backup terbaru sebelum import.
          </p>
        </div>
      </BottomSheet>

      
      {preview && (
        <BottomSheet
          open={!!preview}
          onClose={() => setPreview(null)}
          title="Konfirmasi Restore"
        >
          <div className="rounded-2xl border border-success/20 bg-success-soft/60 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Check size={14} className="text-success" strokeWidth={3} />
              <p className="text-ios-footnote font-semibold text-success">
                File backup valid
              </p>
            </div>
            <div className="space-y-1.5 text-ios-caption text-surface-text">
              <p>
                <span className="text-surface-muted">Pemilik:</span>{" "}
                <span className="font-medium">@{preview.originalUsername}</span>
              </p>
              <p>
                <span className="text-surface-muted">Tanggal backup:</span>{" "}
                <span className="font-medium">
                  {formatDateId(preview.exportedAt)}
                </span>
              </p>
              <p>
                <span className="text-surface-muted">Jumlah data:</span>{" "}
                <span className="font-medium">
                  {preview.keyCount} item ({preview.sizeFormatted})
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-warning-soft border border-warning/20 p-3 mb-4">
            <p className="text-ios-footnote text-warning leading-relaxed">
              Data yang ada di HP ini akan <strong>ditimpa</strong> dengan data
              dari file backup. Setelah restore, halaman akan reload otomatis.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setPreview(null)}
            >
              Batal
            </Button>
            <Button fullWidth onClick={() => setConfirmRestoreOpen(true)}>
              Restore Sekarang
            </Button>
          </div>
        </BottomSheet>
      )}

      <ConfirmDialog
        open={confirmRestoreOpen}
        title="Restore data sekarang?"
        description={
          preview
            ? "Data " +
              preview.keyCount +
              " item akan direstore. Data yang ada di HP ini akan ditimpa."
            : ""
        }
        confirmLabel="Ya, Restore"
        loading={false}
        onCancel={() => setConfirmRestoreOpen(false)}
        onConfirm={handleConfirmRestore}
      />
    </>
  );
}
