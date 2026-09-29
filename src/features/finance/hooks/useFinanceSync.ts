import { useState } from "react";
import { financeApi } from "../api/financeApi";
import { useToast } from "../../../contexts/ToastContext";
import { ApiError } from "../../../services/api";

/**
 * Sync data finance dari spreadsheet (POST /finance/sync).
 * Hanya SUPER_ADMIN yang diizinkan backend; role lain dapat pesan Forbidden.
 * Panggil dengan groupId kelompok aktif (atau tanpa argumen = semua kelompok).
 */
export function useFinanceSync(onDone: () => void) {
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  async function sync(groupId?: string | null) {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await financeApi.syncFromSheet(groupId);
      showToast(
        res.syncedGroup
          ? `Sync spreadsheet berhasil`
          : "Sync semua kelompok berhasil",
        "success",
      );
      onDone();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Sync spreadsheet gagal",
        "error",
      );
    } finally {
      setSyncing(false);
    }
  }

  return { syncing, sync };
}
