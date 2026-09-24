import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  User as UserIcon,
  KeyRound,
  Shield,
  ArrowUpRight,
  Trash2,
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
  ConfirmDialog,
} from "../components/common";
import { ResetPasswordSheet } from "../components/common/ChangePasswordSheet";
import { userApi } from "../services/domainApi";
import { memberApi } from "../services/memberApi";
import type { Member, Role, User } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ApiError, abortAllApiCalls } from "../services/api";
import { UsersSkeleton } from "../components/common/Skeleton";
import { queryKeys } from "../lib/queryClient";
import { ROLE_LABEL } from "../hooks/usePermission";

const ROLE_DESCRIPTION: Record<Role, string> = {
  SUPER_ADMIN: "Akses penuh ke semua fitur",
  ADMIN: "Kelola jamaah, kelompok, dan absensi",
  TIM_PNKB: "Khusus pembinaan pra nikah",
  TIM_ABSENSI: "Khusus absensi pengajian",
  PENGAWAS: "Lihat semua data + tulis pembinaan",
  MEMBER: "Hanya bisa lihat data sendiri",
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => userApi.list(),
    staleTime: 2 * 60_000,
  });

  const { data: members = [] } = useQuery({
    queryKey: queryKeys.members(),
    queryFn: () => memberApi.list({}),
    staleTime: 5 * 60_000,
  });

  const memberById = new Map(members.map((m) => [m.member_id, m]));

  return (
    <AppLayout
      hideNav
      fab={
        <FloatingActionButton
          onClick={() => setCreateOpen(true)}
          label="Tambah User"
          icon={<UserPlus size={22} strokeWidth={2.2} />}
        />
      }
    >
      <Header
        title="Manajemen User"
        subtitle={`${users.length} user`}
        onBack={() => history.back()}
        backLabel="Kembali"
      />

      <div className="py-3">
        {isLoading && <UsersSkeleton rows={4} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError ? error.message : "Gagal memuat user"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && users.length === 0 && (
          <EmptyState
            title="Belum ada user"
            description="Tambahkan user untuk memberikan akses ke aplikasi."
            action={
              <Button
                onClick={() => setCreateOpen(true)}
                leftIcon={<UserPlus size={16} />}
              >
                Tambah User
              </Button>
            }
          />
        )}

        {!isLoading && !error && users.length > 0 && (
          <GroupedList>
            {users.map((u, i) => {
              const member = u.member_id ? memberById.get(u.member_id) : null;
              return (
                <ListRow
                  key={u.user_id}
                  insetDivider={i !== users.length - 1}
                  onClick={() => setEditTarget(u)}
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
                        {member ? ` · ${member.nama_lengkap}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge>{ROLE_LABEL[u.role]}</Badge>
                      <Button
                        variant="ghost"
                        size="xs"
                        iconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          setResetTarget({
                            userId: u.user_id,
                            userName: u.nama || u.username,
                          });
                        }}
                        aria-label={`Reset password ${u.nama}`}
                        title="Reset password"
                        className="hover:bg-accent-soft hover:text-accent"
                      >
                        <KeyRound size={14} />
                      </Button>
                    </div>
                  </div>
                </ListRow>
              );
            })}
          </GroupedList>
        )}
      </div>

      <CreateUserSheet
        open={createOpen}
        members={members}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.users() });
        }}
      />

      <EditUserSheet
        user={editTarget}
        members={members}
        onClose={() => setEditTarget(null)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.users() });
          setEditTarget(null);
        }}
        onViewMember={(memberId) => {
          setEditTarget(null);
          navigate(`/jamaah/${memberId}`);
        }}
        onRequestDelete={(u) => {
          setEditTarget(null);
          setDeleteTarget(u);
        }}
      />

      <DeleteUserConfirmModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.users() });
          queryClient.invalidateQueries({ queryKey: queryKeys.members() });
          queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
          queryClient.invalidateQueries({ queryKey: ["member"] });
          setDeleteTarget(null);
        }}
      />

      <ResetPasswordSheet
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        userId={resetTarget?.userId || null}
        userName={resetTarget?.userName || ""}
      />
    </AppLayout>
  );
}

function CreateUserSheet({
  open,
  members,
  onClose,
  onCreated,
}: {
  open: boolean;
  members: Member[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [memberId, setMemberId] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setNama("");
    setPassword("");
    setRole("MEMBER");
    setMemberId("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      userApi.create({
        username,
        nama,
        password,
        role,
        member_id: memberId,
      }),
    onSuccess: () => {
      showToast("User berhasil dibuat");
      onCreated();
      onClose();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat user",
        "error",
      );
    },
  });

  const canSubmit =
    username.trim().length >= 3 &&
    nama.trim().length >= 2 &&
    password.length >= 6 &&
    memberId !== "";

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="User Baru">
        <div className="mb-4 p-3 rounded-xl bg-accent-soft border border-accent/15">
          <p className="text-ios-footnote text-accent/80 leading-relaxed">
            Setiap user harus terhubung ke jamaah. Pilih jamaah terlebih dahulu.
          </p>
        </div>

        <Select
          label="Jamaah"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          hint="Pilih jamaah yang terhubung dengan akun ini"
        >
          <option value="">Pilih jamaah</option>
          {members.map((m) => (
            <option key={m.member_id} value={m.member_id}>
              {m.nama_lengkap}
              {m.kelompok ? ` · ${m.kelompok}` : ""}
            </option>
          ))}
        </Select>

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

        <Button
          fullWidth
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !canSubmit}
          leftIcon={!mutation.isPending ? <UserPlus size={16} /> : undefined}
        >
          {mutation.isPending ? "Menyimpan..." : "Buat User"}
        </Button>
      </BottomSheet>

      <LoadingOverlay open={mutation.isPending} label="Membuat user..." onCancel={() => abortAllApiCalls()} />
    </>
  );
}

function EditUserSheet({
  user,
  members,
  onClose,
  onUpdated,
  onViewMember,
  onRequestDelete,
}: {
  user: User | null;
  members: Member[];
  onClose: () => void;
  onUpdated: () => void;
  onViewMember: (memberId: string) => void;
  onRequestDelete: (u: User) => void;
}) {
  const { showToast } = useToast();
  const [nama, setNama] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNama(user.nama || "");
    setRole(user.role);
    setConfirmDeactivate(false);
  }, [user]);

  const member = user?.member_id
    ? members.find((m) => m.member_id === user.member_id)
    : null;

  const updateMutation = useMutation({
    mutationFn: () => userApi.update(user!.user_id, { nama }),
    onSuccess: () => {
      showToast("User diperbarui");
      onUpdated();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal memperbarui user",
        "error",
      );
    },
  });

  const roleMutation = useMutation({
    mutationFn: (newRole: Role) => userApi.updateRole(user!.user_id, newRole),
    onSuccess: () => {
      showToast(`Role diubah ke ${ROLE_LABEL[role]}`);
      onUpdated();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal mengubah role",
        "error",
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => userApi.update(user!.user_id, { status_aktif: false }),
    onSuccess: () => {
      showToast("User dinonaktifkan");
      onUpdated();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menonaktifkan user",
        "error",
      );
    },
  });

  if (!user) return null;

  const isDirty = nama !== (user.nama || "");
  const roleChanged = role !== user.role;

  return (
    <>
      <BottomSheet
        open={!!user}
        onClose={onClose}
        title={`Edit User: ${user.nama}`}
      >
        <div className="mb-4 p-3 rounded-xl bg-accent-soft border border-accent/15">
          <p className="text-ios-footnote text-accent/80 leading-relaxed">
            Username: <strong>@{user.username}</strong>
          </p>
        </div>

        {member && (
          <button
            onClick={() => onViewMember(member.member_id)}
            className="w-full mb-4 text-left rounded-xl border border-surface-border bg-surface-card hover:bg-surface-card2 p-3.5 flex items-center gap-3 transition-all active:scale-[0.99]"
          >
            <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <ArrowUpRight size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-ios-body font-medium text-surface-text truncate">
                {member.nama_lengkap}
              </p>
              <p className="text-ios-footnote text-surface-muted truncate">
                Lihat detail jamaah
              </p>
            </div>
          </button>
        )}

        <Input
          label="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <Button
          fullWidth
          onClick={() => updateMutation.mutate()}
          disabled={!isDirty || updateMutation.isPending}
        >
          {updateMutation.isPending ? "Menyimpan..." : "Simpan Nama"}
        </Button>

        <div className="mt-6 pt-4 border-t border-surface-border">
          <p className="text-ios-footnote font-medium text-surface-text mb-2 px-1">
            Ubah Role
          </p>
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
          <p className="-mt-2 mb-3 text-ios-caption text-surface-muted px-0.5">
            {ROLE_DESCRIPTION[role]}
          </p>
          <Button
            fullWidth
            onClick={() => roleMutation.mutate(role)}
            disabled={!roleChanged || roleMutation.isPending}
            leftIcon={<Shield size={16} />}
          >
            {roleMutation.isPending ? "Menyimpan..." : "Simpan Role"}
          </Button>
        </div>

        {user.status_aktif !== false && user.role !== "SUPER_ADMIN" && (
          <div className="mt-6 pt-4 border-t border-surface-border">
            <Button
              variant="danger"
              fullWidth
              onClick={() => setConfirmDeactivate(true)}
            >
              Nonaktifkan User
            </Button>
          </div>
        )}

        {user.role !== "SUPER_ADMIN" && (
          <div className="mt-6 pt-4 border-t border-surface-border">
            <p className="text-ios-caption text-danger font-medium mb-2 px-0.5">
              Zona Berbahaya
            </p>
            <button
              onClick={() => onRequestDelete(user)}
              className="w-full text-left rounded-xl border border-danger/30 bg-danger-soft hover:bg-danger-soft/80 p-3.5 flex items-center gap-3 transition-all active:scale-[0.99]"
            >
              <span className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} strokeWidth={2.2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ios-body font-medium text-danger">
                  Hapus Permanen
                </p>
                <p className="text-ios-caption text-danger/80">
                  User + data member dihapus. Tidak bisa dibatalkan.
                </p>
              </div>
            </button>
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Nonaktifkan user?"
        description={`User ${user.nama} tidak akan bisa login. Data jamaah tetap tersimpan.`}
        confirmLabel="Ya, Nonaktifkan"
        danger
        loading={deactivateMutation.isPending}
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => {
          deactivateMutation.mutate();
          setConfirmDeactivate(false);
        }}
      />
    </>
  );
}


/* -------------------------------------------------------------------------- */
/*                    DELETE USER CONFIRM MODAL                               */
/* -------------------------------------------------------------------------- */

function DeleteUserConfirmModal({
  user,
  onClose,
  onDeleted,
}: {
  user: User | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { showToast } = useToast();
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    setConfirmText("");
  }, [user?.user_id]);

  const mutation = useMutation({
    mutationFn: () => userApi.deletePermanent(user!.user_id),
    onSuccess: () => {
      showToast("User berhasil dihapus permanen");
      onDeleted();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus user",
        "error",
      );
    },
  });

  if (!user) return null;

  const targetName = user.nama || user.username;
  const canDelete = confirmText.trim() === targetName;

  return (
    <BottomSheet
      open={!!user}
      onClose={onClose}
      title="Hapus Permanen User?"
    >
      <div className="mb-4 p-3 rounded-xl bg-danger-soft border border-danger/30">
        <p className="text-ios-footnote text-danger leading-relaxed">
          Tindakan ini <strong>tidak bisa dibatalkan</strong>. User{" "}
          <strong>{targetName}</strong> akan dihapus permanen bersama:
        </p>
        <ul className="mt-2 ml-4 list-disc text-ios-caption text-danger/90 space-y-0.5">
          <li>Data akun login</li>
          <li>Data member (biodata, foto)</li>
          <li>Riwayat absensi & pembinaan terkait</li>
        </ul>
      </div>

      <div className="mb-4">
        <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
          Ketik nama user untuk konfirmasi:
        </label>
        <div className="rounded-xl bg-surface-card2 px-3 py-2 mb-2">
          <code className="text-ios-body font-mono text-surface-text">
            {targetName}
          </code>
        </div>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Ketik nama persis di atas"
          autoComplete="off"
          autoCapitalize="none"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Batal
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={() => mutation.mutate()}
          disabled={!canDelete || mutation.isPending}
          leftIcon={!mutation.isPending ? <Trash2 size={16} /> : undefined}
        >
          {mutation.isPending ? "Menghapus..." : "Hapus Permanen"}
        </Button>
      </div>

      <LoadingOverlay open={mutation.isPending} label="Menghapus user..." onCancel={() => abortAllApiCalls()} />
    </BottomSheet>
  );
}
