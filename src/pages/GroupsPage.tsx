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
} from "../components/ui";
import { groupApi } from "../services/domainApi";
import type { Group } from "../types";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { GroupedListSkeleton } from "../components/ui/Skeleton";
import { queryKeys } from "../lib/queryClient";

export default function GroupsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermission();
  const canEdit = isSuperAdmin;

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
        subtitle="Data master kelompok pengajian"
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
                      <div className="flex items-center gap-2">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {g.group_name}
                        </p>
                        {g.group_code && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent-soft text-accent shrink-0">
                            {g.group_code}
                          </span>
                        )}
                        {g.is_active === false && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-danger-soft text-danger shrink-0">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="text-ios-footnote text-surface-muted truncate">
                        {g.mentor ? `Pembina: ${g.mentor}` : ""}
                        {g.mentor && g.schedule ? " · " : ""}
                        {g.schedule ? g.schedule : ""}
                        {g.signatory ? ` · TTD: ${g.signatory}` : ""}
                      </p>
                    </div>
                  </ChevronRow>
                ) : (
                  <div>
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {g.group_name}
                    </p>
                    <p className="text-ios-footnote text-surface-muted truncate">
                      {g.mentor ? `Pembina: ${g.mentor}` : ""}{" "}
                      {g.schedule ? `· ${g.schedule}` : ""}
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

export function GroupSheet({
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
        mentor: "",
        signatory: "",
        schedule: "Minggu,Selasa,Kamis",
        is_active: true,
      },
    );
  }, [group, open]);

  function handleSave() {
    const trimmedName = (form.group_name || "").trim();
    if (!trimmedName) return;
    const payload: Partial<Group> = {
      group_code: (form.group_code || "").trim(),
      group_name: trimmedName,
      mentor: (form.mentor || "").trim(),
      signatory: (form.signatory || "").trim(),
      schedule: (form.schedule || "").trim(),
      is_active: form.is_active ?? true,
    };
    onSave(group ? { ...payload, group_id: group.group_id } : payload);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={group ? "Edit Kelompok" : "Tambah Kelompok Baru"}
    >
      <div className="space-y-3">
        <Input
          label="Nama Kelompok *"
          placeholder="Contoh: Kelompok 1"
          value={form.group_name || ""}
          onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))}
          required
        />
        <Input
          label="Kode Kelompok"
          placeholder="Contoh: KLP-01"
          value={form.group_code || ""}
          onChange={(e) => setForm((f) => ({ ...f, group_code: e.target.value }))}
        />
        <Input
          label="Pembina"
          placeholder="Nama pembina kelompok"
          value={form.mentor || ""}
          onChange={(e) => setForm((f) => ({ ...f, mentor: e.target.value }))}
        />
        <Input
          label="Penandatangan"
          placeholder="Nama penandatangan laporan"
          value={form.signatory || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, signatory: e.target.value }))
          }
        />
        <Input
          label="Jadwal Pengajian"
          value={form.schedule || ""}
          onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
          hint="Contoh: Minggu,Selasa,Kamis"
        />
        {group && (
          <label className="flex items-center gap-2.5 pt-1 text-ios-footnote text-surface-text cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_active !== false}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span>Kelompok aktif</span>
          </label>
        )}
        <div className="pt-2">
          <Button
            fullWidth
            onClick={handleSave}
            disabled={saving || !(form.group_name || "").trim()}
          >
            {saving ? "Menyimpan..." : group ? "Simpan Perubahan" : "Tambah Kelompok"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
