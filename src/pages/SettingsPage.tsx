import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { queryKeys } from "../lib/queryClient";

export default function SettingsPage() {
  const [jadwal, setJadwal] = useState<string[]>(["Minggu", "Selasa", "Kamis"]);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => settingsApi.get(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (data && Array.isArray(data.jadwal_rutin)) {
      setJadwal(data.jadwal_rutin as string[]);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => settingsApi.update("jadwal_rutin", jadwal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
      showToast("Pengaturan disimpan");
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan pengaturan",
        "error",
      );
    },
  });

  return (
    <AppLayout hideNav>
      <Header
        title="Pengaturan"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />

      <div className="py-3">
        {isLoading && <SettingsSkeleton />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat pengaturan"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && (
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
              <Button
                fullWidth
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </GroupedList>
        )}
      </div>

      <LoadingOverlay
        open={mutation.isPending}
        label="Menyimpan pengaturan..."
      />
    </AppLayout>
  );
}
