import { useEffect, useState } from "react";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Button,
  Input,
  GroupedList,
  LoadingOverlay,
  ErrorState,
} from "../components/common";
import { SettingsSkeleton } from "../components/common/Skeleton";
import { settingsApi } from "../services/domainApi";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";

export default function SettingsPage() {
  const [jadwal, setJadwal] = useState<string[]>(["Minggu", "Selasa", "Kamis"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const s = await settingsApi.get();
      if (Array.isArray(s.jadwal_rutin)) {
        setJadwal(s.jadwal_rutin as string[]);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat pengaturan",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await settingsApi.update("jadwal_rutin", jadwal);
      showToast("Pengaturan disimpan");
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan pengaturan",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout hideNav>
      <Header
        title="Pengaturan"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />

      <div className="py-3">
        {loading && <SettingsSkeleton />}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          <GroupedList>
            <div className="p-4">
              <p className="text-ios-body font-semibold text-surface-text mb-1">
                Jadwal Rutin Pengajian
              </p>
              <p className="text-ios-footnote text-surface-muted mb-3">
                Pisahkan dengan koma, contoh: Minggu,Selasa,Kamis
              </p>
              <Input
                value={jadwal.join(",")}
                onChange={(e) =>
                  setJadwal(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
              <Button fullWidth onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </GroupedList>
        )}
      </div>

      <LoadingOverlay open={saving} label="Menyimpan pengaturan..." />
    </AppLayout>
  );
}
