import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  User as UserIcon,
  KeyRound,
  Shield,
  ArrowUpRight,
  Trash2,
  Search,
  SlidersHorizontal,
  X,
} from "../components/ui/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  RoleBadge,
  Button,
  Input,
  Select,
  BottomSheet,
  LoadingOverlay,
  GroupedList,
  ListRow,
  ChevronRow,
  ErrorState,
  EmptyState,
  ConfirmDialog,
  Segmented,
  FilterChip,
} from "../components/ui";
import { ResetPasswordSheet } from "../components/ui/ChangePasswordSheet";
import { userApi } from "../services/domainApi";
import { memberApi } from "../features/member/api/memberApi";
import type { Member, MemberCategory, Role, User } from "../types";
import { CATEGORY_LABEL } from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { useToast } from "../contexts/ToastContext";
import { usePermission, ROLE_LABEL } from "../hooks/usePermission";
import { ApiError, abortAllApiCalls } from "../services/api";
import { UsersSkeleton } from "../components/ui/Skeleton";
import { queryKeys } from "../lib/queryClient";

const ROLE_DESCRIPTION: Record<Role, string> = {
  SUPER_ADMIN: "Akses penuh ke semua fitur",
  ADMIN: "Kelola jamaah, kelompok, dan absensi",
  TIM_KU: "Kelola modul keuangan (kas, shodaqoh, zakat)",
  TIM_PNKB: "Khusus pembinaan pra nikah",
  TIM_ABSENSI: "Khusus absensi pengajian",
  PENGAWAS: "Lihat semua data + tulis pembinaan",
  MEMBER: "Hanya bisa lihat data sendiri",
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { assignedGroup } = usePermission();
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
    queryKey: queryKeys.users(assignedGroup),
    queryFn: () =>
      userApi.list(assignedGroup ? { group_id: assignedGroup } : {}),
    staleTime: 2 * 60_000,
  });

  const { data: members = [] } = useQuery({
    queryKey: queryKeys.members(assignedGroup ? { group_id: assignedGroup } : undefined),
    queryFn: () =>
      memberApi.list(assignedGroup ? { group_id: assignedGroup } : {}),
    staleTime: 5 * 60_000,
  });

  const memberById = new Map(members.map((m) => [m.member_id, m]));

  const [fSearch, setFSearch] = useState("");
  const [fGender, setFGender] = useState<"" | "L" | "P">("");
  const [fKategori, setFKategori] = useState<MemberCategory | "">("");
  const [fStatus, setFStatus] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [fRole, setFRole] = useState<Role | "">("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const activeFilterCount = useMemo(
    () =>
      (fStatus ? 1 : 0) +
      (fRole ? 1 : 0) +
      (fGender ? 1 : 0),
    [fStatus, fRole, fGender],
  );

  const filteredUsers = useMemo(() => {
    const q = fSearch.trim().toLowerCase();
    return users.filter((u) => {
      const member = u.member_id ? memberById.get(u.member_id) : undefined;
      if (q) {
        const hay = `${u.name} ${u.username} ${u.role} ${member?.full_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fRole && u.role !== fRole) return false;
      if (fGender && member?.gender !== fGender) return false;
      if (fKategori && member?.kategori !== fKategori) return false;
      if (fStatus === "ACTIVE" && u.is_active === false) return false;
      if (fStatus === "INACTIVE" && u.is_active !== false) return false;
      return true;
    });
  }, [users, memberById, fSearch, fGender, fKategori, fStatus, fRole]);

  const hasActiveFilter = fSearch.trim() !== "" || activeFilterCount > 0;

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
        subtitle={`${filteredUsers.length} dari ${users.length} user`}
        onBack={() => history.back()}
        backLabel="Kembali"
      />

      <div className="px-4 pt-3 space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
            />
            <input
              value={fSearch}
              onChange={(e) => setFSearch(e.target.value)}
              placeholder="Cari nama, username, role..."
              className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            {fSearch.length > 0 && (
              <button
                onClick={() => setFSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setFilterSheetOpen(true)}
            aria-label="Filter User"
            className="relative bg-surface-card border border-surface-border hover:bg-surface-card2 min-w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0"
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterChip
            active={fKategori === ""}
            label="Semua"
            onClick={() => setFKategori("")}
          />
          {MEMBER_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={fKategori === c}
              label={CATEGORY_LABEL[c]}
              onClick={() => setFKategori(c)}
            />
          ))}
        </div>
      </div>

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

        {!isLoading && !error && users.length > 0 && filteredUsers.length === 0 && (
          <EmptyState
            title="Tidak ditemukan"
            description="Tidak ada user yang cocok dengan filter. Ubah kata kunci."
          />
        )}

        {!isLoading && !error && filteredUsers.length > 0 && (
          <GroupedList>
            {filteredUsers.map((u, i) => {
              const member = u.member_id ? memberById.get(u.member_id) : null;
              return (
                <ListRow
                  key={u.user_id}
                  onClick={() => setEditTarget(u)}
                  insetDivider={i !== filteredUsers.length - 1}
                  leading={
                    <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0 font-semibold">
                      {u.name ? u.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
                    </span>
                  }
                >
                  <ChevronRow>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-ios-body font-semibold text-surface-text truncate">
                          {u.name}
                        </p>
                        <p className="text-ios-footnote text-surface-muted truncate">
                        @{u.username}
                        {member ? ` · ${member.full_name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {u.is_active === false && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger-soft text-danger border border-danger/20">
                            Nonaktif
                          </span>
                        )}
                        <RoleBadge role={u.role} />
                        <Button
                          variant="ghost"
                          size="xs"
                          iconOnly
                          onClick={(e) => {
                            e.stopPropagation();
                            setResetTarget({
                              userId: u.user_id,
                              userName: u.name || u.username,
                            });
                          }}
                          aria-label={`Reset password ${u.name}`}
                          title="Reset password"
                          className="hover:bg-accent-soft hover:text-accent"
                        >
                          <KeyRound size={14} />
                        </Button>
                      </div>
                    </div>
                  </ChevronRow>
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
          navigate(`/members/${memberId}`);
        }}
        onRequestDelete={(u) => {
          setEditTarget(null);
          setDeleteTarget(u);
        }}
      />

      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter User"
      >
        <div className="space-y-4">
          <div>
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
              Status Akun
            </p>
            <Segmented<"" | "ACTIVE" | "INACTIVE">
              ariaLabel="Filter status user"
              value={fStatus}
              onChange={setFStatus}
              options={[
                { value: "", label: "Semua" },
                { value: "ACTIVE", label: "Aktif" },
                { value: "INACTIVE", label: "Non-Aktif" },
              ]}
            />
          </div>

          <div>
            <Select
              label="Filter Role"
              value={fRole}
              onChange={(e) => setFRole(e.target.value as Role | "")}
            >
              <option value="">Semua Role</option>
              {Object.entries(ROLE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
              Jenis Kelamin Jamaah
            </p>
            <Segmented<"" | "L" | "P">
              ariaLabel="Filter jenis kelamin"
              value={fGender}
              onChange={setFGender}
              options={[
                { value: "", label: "Semua" },
                { value: "L", label: "Laki-laki (L)" },
                { value: "P", label: "Perempuan (P)" },
              ]}
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="pt-2">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setFStatus("");
                  setFRole("");
                  setFGender("");
                }}
              >
                Reset Filter Slider
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>

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
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [memberId, setMemberId] = useState("");
  const { showToast } = useToast();
  const { isSuperAdmin } = usePermission();

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setName("");
    setPassword("");
    setRole("MEMBER");
    setMemberId("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      userApi.create({
        username,
        name,
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
    name.trim().length >= 2 &&
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
              {m.full_name}
              {m.group_label ? ` · ${m.group_label}` : ""}
            </option>
          ))}
        </Select>

        <Input
          label="Nama Lengkap"
          placeholder="Contoh: Ahmad Fauzi"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          {Object.entries(ROLE_LABEL)
            .filter(([k]) => isSuperAdmin || k !== "SUPER_ADMIN")
            .map(([k, v]) => (
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
  const { isSuperAdmin } = usePermission();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setRole(user.role);
    setConfirmDeactivate(false);
  }, [user]);

  const member = user?.member_id
    ? members.find((m) => m.member_id === user.member_id)
    : null;

  const updateMutation = useMutation({
    mutationFn: () => userApi.update(user!.user_id, { name }),
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

  const activateMutation = useMutation({
    mutationFn: () => userApi.update(user!.user_id, { status_aktif: true }),
    onSuccess: () => {
      showToast("User diaktifkan kembali");
      onUpdated();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal mengaktifkan user",
        "error",
      );
    },
  });

  if (!user) return null;

  const isDirty = name !== (user.name || "");
  const roleChanged = role !== user.role;

  return (
    <>
      <BottomSheet
        open={!!user}
        onClose={onClose}
        title={`Edit User: ${user.name}`}
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
                {member.full_name}
              </p>
              <p className="text-ios-footnote text-surface-muted truncate">
                Lihat detail jamaah
              </p>
            </div>
          </button>
        )}

        <Input
          label="Nama Lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            {Object.entries(ROLE_LABEL)
              .filter(([k]) => isSuperAdmin || k !== "SUPER_ADMIN")
              .map(([k, v]) => (
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

        {user.role !== "SUPER_ADMIN" && (
          <div className="mt-6 pt-4 border-t border-surface-border">
            {user.is_active !== false ? (
              <Button
                variant="danger"
                fullWidth
                onClick={() => setConfirmDeactivate(true)}
              >
                Nonaktifkan User
              </Button>
            ) : (
              <Button
                fullWidth
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
              >
                {activateMutation.isPending ? "Mengaktifkan..." : "Aktifkan User"}
              </Button>
            )}
          </div>
        )}

        {isSuperAdmin && user.role !== "SUPER_ADMIN" && (
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
        description={`User ${user.name} tidak akan bisa login. Data jamaah tetap tersimpan.`}
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

  const targetName = user.name || user.username;
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
          <code className="text-ios-body  text-surface-text">
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
