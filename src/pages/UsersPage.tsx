import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  User as UserIcon,
  KeyRound,
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
import { ResetPasswordSheet } from "../components/common/ChangePasswordSheet";
import { userApi } from "../services/domainApi";
import { memberApi } from "../services/memberApi";
import type { Member, Role, User } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { UsersSkeleton } from "../components/common/Skeleton";
import { queryKeys } from "../lib/queryClient";

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
  const [open, setOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
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
                onClick={() => setOpen(true)}
                leftIcon={<UserPlus size={16} />}
              >
                Tambah User
              </Button>
            }
          />
        )}

        {!isLoading && !error && users.length > 0 && (
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge>{ROLE_LABEL[u.role]}</Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setResetTarget({
                          userId: u.user_id,
                          userName: u.nama || u.username,
                        });
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-colors hover:bg-accent-soft hover:text-accent active:scale-[0.95]"
                      aria-label={`Reset password ${u.nama}`}
                      title="Reset password"
                    >
                      <KeyRound size={14} />
                    </button>
                  </div>
                </div>
              </ListRow>
            ))}
          </GroupedList>
        )}
      </div>

      <CreateUserSheet
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.users() });
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
  const { showToast } = useToast();

  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: queryKeys.members(),
    queryFn: () => memberApi.list({}),
    enabled: open && role === "MEMBER",
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setNama("");
    setPassword("");
    setRole("TIM_ABSENSI");
    setMemberId("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      userApi.create({
        username,
        nama,
        password,
        role,
        member_id: role === "MEMBER" ? memberId : "",
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
    (role !== "MEMBER" || memberId !== "");

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
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !canSubmit}
          leftIcon={!mutation.isPending ? <UserPlus size={16} /> : undefined}
        >
          {mutation.isPending ? "Menyimpan..." : "Buat User"}
        </Button>
      </BottomSheet>

      <LoadingOverlay open={mutation.isPending} label="Membuat user..." />
    </>
  );
}
