import { useEffect, useState } from "react";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Button,
  Input,
  BottomSheet,
  LoadingState,
  EmptyState,
  GroupedList,
  ListRow,
  ChevronRow,
  ErrorState,
} from "../components/common";
import { groupApi } from "../services/domainApi";
import type { Group } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { GroupedListSkeleton } from "../components/common/Skeleton";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const { showToast } = useToast();
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setGroups(await groupApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat kelompok");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppLayout
      hideNav
      fab={
        <FloatingActionButton
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        />
      }
    >
      <Header
        title="Kelompok"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />
      <div className="py-3">
        {loading && <GroupedListSkeleton rows={5} />}
        {!loading && !error && groups.length === 0 && (
          <EmptyState
            title="Belum ada kelompok"
            description="Tambahkan kelompok pertama untuk memulai pengelolaan."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                Tambah Kelompok
              </Button>
            }
          />
        )}
        {!loading && !error && groups.length === 0 && (
          <EmptyState title="Belum ada kelompok" />
        )}
        {!loading && !error && groups.length > 0 && (
          <GroupedList>
            {groups.map((g, i) => (
              <ListRow
                key={g.group_id}
                onClick={() => {
                  setEditing(g);
                  setOpen(true);
                }}
                insetDivider={i !== groups.length - 1}
              >
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
              </ListRow>
            ))}
          </GroupedList>
        )}
      </div>
      <GroupSheet
        open={open}
        group={editing}
        onClose={() => setOpen(false)}
        onSaved={load}
      />
    </AppLayout>
  );
}

function GroupSheet({
  open,
  group,
  onClose,
  onSaved,
}: {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Group>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

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

  async function handleSave() {
    setSaving(true);
    try {
      await groupApi.save(group ? { ...form, group_id: group.group_id } : form);
      showToast("Kelompok disimpan");
      onSaved();
      onClose();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan kelompok",
        "error",
      );
    } finally {
      setSaving(false);
    }
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
