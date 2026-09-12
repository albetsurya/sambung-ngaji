import { useEffect, useState } from "react";
import {
  UserPlus,
  User as UserIcon,
} from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Badge,
  Button,
  Input,
  Select,
  BottomSheet,
  LoadingOverlay,
  GroupedList,
  ListRow,
  ErrorState,
  EmptyState,
} from "../components/common";
import { userApi } from "../services/domainApi";
import { memberApi } from "../services/memberApi";
import type { Member, Role, User } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { UsersSkeleton } from "../components/common/Skeleton";

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TIM_PNKB: "Tim PNKB",
  TIM_ABSENSI: "Tim Absensi",
  MEMBER: "Member",
};

const ROLE_DESCRIPTION: Record<Role, string> = {
  SUPER_ADMIN: "Akses penuh ke semua fitur",
  ADMIN: "Kelola jamaah, kelompok, dan absensi",
  TIM_PNKB: "Khusus pembinaan pra nikah",
  TIM_ABSENSI: "Khusus absensi pengajian",
  MEMBER: "Hanya bisa lihat data sendiri",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setError("");
    try {
      setUsers(await userApi.list());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat daftar user",
      );
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
          onClick={() => setOpen(true)}
          label="Tambah User"
          icon={<UserPlus size={22} strokeWidth={2.2} />}
        />
      }
    >
      <Header
        title="Manajemen User"
        subtitle={`${users.length} user`}
        onBack={() => history.back()}
        backLabel="Lainnya"
      />

      <div className="py-3">
        {loading && <UsersSkeleton rows={4} />}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && users.length === 0 && (
          <EmptyState
            title="Belum ada user"
            description="Tambahkan user untuk memberikan akses ke aplikasi."
            action={
              <Button
                onClick={() => setOpen(true)}
                leftIcon={<UserPlus size={16} />}
              >
                Tambah User
              </Button>
            }
          />
        )}

        {!loading && !error && users.length > 0 && (
          <GroupedList>
            {users.map((u, i) => (
              <ListRow
                key={u.user_id}
                insetDivider={i !== users.length - 1}
                leading={
                  <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                    <UserIcon size={16} />
                  </span>
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {u.nama}
                    </p>
                    <p className="text-ios-footnote text-surface-muted truncate">
                      @{u.username}
                    </p>
                  </div>
                  <Badge>{ROLE_LABEL[u.role]}</Badge>
                </div>
              </ListRow>
            ))}
          </GroupedList>
        )}
      </div>

      <CreateUserSheet
        open={open}
        onClose={() => setOpen(false)}
        onCreated={load}
      />
    </AppLayout>
  );
}

function CreateUserSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("TIM_ABSENSI");
  const [memberId, setMemberId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setNama("");
    setPassword("");
    setRole("TIM_ABSENSI");
    setMemberId("");
    setMembers([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (role !== "MEMBER") return;

    setLoadingMembers(true);
    memberApi
      .list({})
      .then(setMembers)
      .catch(() => {
        showToast("Gagal memuat daftar jamaah", "error");
      })
      .finally(() => setLoadingMembers(false));
  }, [open, role]);

  const canSubmit =
    username.trim().length >= 3 &&
    nama.trim().length >= 2 &&
    password.length >= 6 &&
    (role !== "MEMBER" || memberId !== "");

  async function handleCreate() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await userApi.create({
        username,
        nama,
        password,
        role,
        member_id: role === "MEMBER" ? memberId : "",
      });
      showToast("User berhasil dibuat");
      onCreated();
      onClose();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat user",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="User Baru">
        <div className="mb-4 p-3 rounded-xl bg-accent-soft border border-accent/15">
          <p className="text-ios-footnote text-accent/80 leading-relaxed">
            User akan dapat login ke aplikasi dengan username dan password yang
            Anda buat.
          </p>
        </div>

        <Input
          label="Nama Lengkap"
          placeholder="Contoh: Ahmad Fauzi"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <Input
          label="Username"
          placeholder="Minimal 3 karakter"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="Password tidak dapat dilihat lagi setelah disimpan"
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>

        <p className="-mt-2 mb-4 text-ios-caption text-surface-muted px-0.5">
          {ROLE_DESCRIPTION[role]}
        </p>

        {role === "MEMBER" && (
          <Select
            label="Jamaah"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            hint={
              loadingMembers
                ? "Memuat daftar jamaah..."
                : "Pilih jamaah yang terhubung dengan akun ini"
            }
            disabled={loadingMembers}
          >
            <option value="">
              {loadingMembers ? "Memuat..." : "Pilih jamaah"}
            </option>
            {members.map((m) => (
              <option key={m.member_id} value={m.member_id}>
                {m.nama_lengkap}
                {m.kelompok ? ` — ${m.kelompok}` : ""}
              </option>
            ))}
          </Select>
        )}

        <Button
          fullWidth
          onClick={handleCreate}
          disabled={saving || !canSubmit}
          leftIcon={!saving ? <UserPlus size={16} /> : undefined}
        >
          {saving ? "Menyimpan..." : "Buat User"}
        </Button>
      </BottomSheet>

      <LoadingOverlay open={saving} label="Membuat user..." />
    </>
  );
}
