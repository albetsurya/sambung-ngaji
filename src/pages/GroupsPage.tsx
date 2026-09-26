import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Button,
  Input,
  BottomSheet,
  EmptyState,
  GroupedList,
  ListRow,
  ChevronRow,
  ErrorState,
} from "../components/common";
import { groupApi } from "../services/domainApi";
import type { Group } from "../types";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { GroupedListSkeleton } from "../components/common/Skeleton";
import { queryKeys } from "../lib/queryClient";

export default function GroupsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { isAdminLike } = usePermission();
  const canEdit = isAdminLike;

  const {
    data: groups = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Group>) => groupApi.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups() });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      showToast("Kelompok disimpan");
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan kelompok",
        "error",
      );
    },
  });

  return (
    <AppLayout
      hideNav
      fab={
        canEdit ? (
          <FloatingActionButton
            label="Tambah Kelompok"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          />
        ) : undefined
      }
    >
      <Header
        title="Kelompok"
        onBack={() => history.back()}
        backLabel="Kembali"
      />
      <div className="py-3">
        {isLoading && <GroupedListSkeleton rows={5} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat kelompok"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && groups.length === 0 && (
          <EmptyState
            title="Belum ada kelompok"
            description="Tambahkan kelompok pertama untuk memulai pengelolaan."
            action={
              canEdit ? (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setOpen(true);
                  }}
                >
                  Tambah Kelompok
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading && !error && groups.length > 0 && (
          <GroupedList>
            {groups.map((g, i) => (
              <ListRow
                key={g.group_id}
                onClick={
                  canEdit
                    ? () => {
                        setEditing(g);
                        setOpen(true);
                      }
                    : undefined
                }
                insetDivider={i !== groups.length - 1}
              >
                {canEdit ? (
                  <ChevronRow>
                    <div>
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {g.group_name}
                      </p>
                      <p className="text-ios-footnote text-surface-muted truncate">
                        {g.pembina ? `Pembina: ${g.pembina}` : ""}{" "}
                        {g.jadwal ? `· ${g.jadwal}` : ""}
                      </p>
                    </div>
                  </ChevronRow>
                ) : (
                  <div>
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {g.group_name}
                    </p>
                    <p className="text-ios-footnote text-surface-muted truncate">
                      {g.pembina ? `Pembina: ${g.pembina}` : ""}{" "}
                      {g.jadwal ? `· ${g.jadwal}` : ""}
                    </p>
                  </div>
                )}
              </ListRow>
            ))}
          </GroupedList>
        )}
      </div>

      <GroupSheet
        open={open}
        group={editing}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSave={(payload) => saveMutation.mutate(payload)}
        saving={saveMutation.isPending}
      />
    </AppLayout>
  );
}

function GroupSheet({
  open,
  group,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSave: (payload: Partial<Group>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Group>>({});

  useEffect(() => {
    setForm(
      group || {
        group_code: "",
        group_name: "",
        pembina: "",
        penandatangan: "",
        jadwal: "Minggu,Selasa,Kamis",
      },
    );
  }, [group, open]);

  function handleSave() {
    onSave(group ? { ...form, group_id: group.group_id } : form);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={group ? "Edit Kelompok" : "Kelompok Baru"}
    >
      <Input
        label="Kode Kelompok"
        value={form.group_code || ""}
        onChange={(e) => setForm((f) => ({ ...f, group_code: e.target.value }))}
      />
      <Input
        label="Nama Kelompok"
        value={form.group_name || ""}
        onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))}
      />
      <Input
        label="Pembina"
        value={form.pembina || ""}
        onChange={(e) => setForm((f) => ({ ...f, pembina: e.target.value }))}
      />
      <Input
        label="Penandatangan"
        value={form.penandatangan || ""}
        onChange={(e) =>
          setForm((f) => ({ ...f, penandatangan: e.target.value }))
        }
      />
      <Input
        label="Jadwal"
        value={form.jadwal || ""}
        onChange={(e) => setForm((f) => ({ ...f, jadwal: e.target.value }))}
        hint="Contoh: Minggu,Selasa,Kamis"
      />
      <Button fullWidth onClick={handleSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan"}
      </Button>
    </BottomSheet>
  );
}
