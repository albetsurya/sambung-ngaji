import { useState } from "react";
import { GroupedList, ListRow, ChevronRow, ConfirmDialog } from "./index";
import { RefreshCw, Trash2, Loader2 } from "./FontAwesomeIcons";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useAppUpdate } from "../../hooks/useAppUpdate";
import { flushAndReload } from "../../lib/clearAppData";

/**
 * Section "Aplikasi" untuk halaman Lainnya (admin & member):
 * - Periksa Pembaruan: cek SW baru + terapkan otomatis (reload).
 * - Bersihkan Data: flush cache lokal (tanpa logout) + reload fresh.
 */
export function AppMaintenanceSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { updateAvailable, checking, checkForUpdate } = useAppUpdate();
  const [confirmFlush, setConfirmFlush] = useState(false);
  const [flushing, setFlushing] = useState(false);

  async function handleCheckUpdate() {
    try {
      const updated = await checkForUpdate();
      if (!updated) showToast("Sudah memakai versi terbaru");
      // Bila updated → halaman reload otomatis via controllerchange.
    } catch {
      showToast("Gagal memeriksa pembaruan", "error");
    }
  }

  async function handleFlush() {
    setFlushing(true);
    try {
      showToast("Membersihkan data, memuat ulang…");
      await flushAndReload(user?.user_id);
    } catch {
      setFlushing(false);
      showToast("Gagal membersihkan data", "error");
    }
  }

  return (
    <>
      <section>
        <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
          Aplikasi
        </p>
        <GroupedList>
          <ListRow
            onClick={checking ? undefined : handleCheckUpdate}
            leading={
              <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                {checking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </span>
            }
          >
            <ChevronRow>
              <div className="min-w-0 flex-1">
                <p className="text-ios-body font-medium text-surface-text truncate">
                  {checking ? "Memeriksa…" : "Periksa Pembaruan"}
                </p>
                <p className="text-ios-caption text-surface-muted truncate">
                  {updateAvailable
                    ? "Versi baru tersedia, ketuk untuk muat ulang"
                    : "Cek versi terbaru dari server"}
                </p>
              </div>
              {updateAvailable && !checking ? (
                <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
              ) : null}
            </ChevronRow>
          </ListRow>

          <ListRow
            onClick={flushing ? undefined : () => setConfirmFlush(true)}
            insetDivider={false}
            leading={
              <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                {flushing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </span>
            }
          >
            <ChevronRow>
              <div className="min-w-0 flex-1">
                <p className="text-ios-body font-medium text-surface-text truncate">
                  {flushing ? "Membersihkan…" : "Bersihkan Data"}
                </p>
                <p className="text-ios-caption text-surface-muted truncate">
                  Hapus cache lokal & muat ulang fresh (tetap login)
                </p>
              </div>
            </ChevronRow>
          </ListRow>
        </GroupedList>
      </section>

      <ConfirmDialog
        open={confirmFlush}
        title="Bersihkan data lokal?"
        description="Cache & data sementara di HP ini akan dihapus, lalu aplikasi dimuat ulang. Anda tetap login dan data backup tidak ikut terhapus."
        confirmLabel="Ya, Bersihkan"
        loading={flushing}
        onCancel={() => setConfirmFlush(false)}
        onConfirm={handleFlush}
      />
    </>
  );
}
