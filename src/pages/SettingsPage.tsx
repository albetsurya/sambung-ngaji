import { useEffect, useState } from "react";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Button,
  Input,
  GroupedList,
  LoadingOverlay,
} from "../components/common";
import { settingsApi } from "../services/domainApi";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { SettingsSkeleton } from "../components/common/Skeleton";

export default function SettingsPage() {
  const [jadwal, setJadwal] = useState<string[]>(["Minggu", "Selasa", "Kamis"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    settingsApi
      .get()
      .then((s) => {
        if (Array.isArray(s.jadwal_rutin)) {
          setJadwal(s.jadwal_rutin as string[]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        {loading ? (
          <SettingsSkeleton />
        ) : (
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

      {/* ✅ Overlay untuk submit (blocking) */}
      <LoadingOverlay open={saving} label="Menyimpan pengaturan..." />
    </AppLayout>
  );
}
