import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ComponentType } from "react";
import {
  Building2,
  Calendar,
  CalendarCheck,
  ClipboardList,
  FileText,
  KeyRound,
  Mosque,
  QrCode,
  UserPlus,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  ChevronRow,
  EmptyState,
  FilterChip,
  GroupedList,
  HubMenuGrid,
  ListRow,
} from "../components/common";
import { usePermission, setSuperAdminFocusGroup } from "../hooks/usePermission";
import { groupApi } from "../services/domainApi";
import { pendingApi } from "../services/pendingApi";
import { queryKeys } from "../lib/queryClient";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { GroupSheet } from "./GroupsPage";
import type { Group } from "../types";

export default function GroupHubPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { assignedGroup, isSuperAdmin, focusGroupId } = usePermission();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const urlGroupId = searchParams.get("group_id");

  useEffect(() => {
    if (isSuperAdmin && urlGroupId) {
      setSuperAdminFocusGroup(urlGroupId);
    }
  }, [isSuperAdmin, urlGroupId]);

  const groupsQuery = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });

  const allGroups = useMemo(
    () => groupsQuery.data ?? [],
    [groupsQuery.data],
  );

  const activeFocusGroupId = isSuperAdmin ? (urlGroupId || focusGroupId) : null;
  const effectiveGroupId = isSuperAdmin ? activeFocusGroupId : assignedGroup;
  const myGroup = allGroups.find((g) => g.group_id === effectiveGroupId);
  const isGlobalMode = isSuperAdmin && !activeFocusGroupId;

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Group>) => groupApi.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups() });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      showToast("Data kelompok berhasil diperbarui");
      setEditSheetOpen(false);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan kelompok",
        "error",
      );
    },
  });

  const pendingQuery = useQuery({
    queryKey: queryKeys.pendingMembers("PENDING"),
    queryFn: () => pendingApi.list({ status: "PENDING" }),
    staleTime: 60_000,
  });
  const pendingCount = (pendingQuery.data ?? []).length;

  const menu: {
    key: string;
    label: string;
    description: string;
    Icon: ComponentType<{ size?: number; className?: string }>;
    to: string;
    section: "jamaah" | "jadwal";
    badge?: number;
  }[] = useMemo(() => {
    return [
      {
        key: "users",
        label: "Manajemen User",
        description: isGlobalMode
          ? "Atur akun & hak akses semua kelompok"
          : "Kelola akun & hak akses kelompok ini",
        Icon: KeyRound,
        to: "/lainnya/users",
        section: "jamaah",
      },
      {
        key: "pendaftar",
        label: "Pendaftar",
        description: isGlobalMode
          ? "Verifikasi pendaftar baru semua kelompok"
          : "Verifikasi pendaftar kelompok ini",
        Icon: ClipboardList,
        to: "/lainnya/pendaftar",
        section: "jamaah",
        badge:
          pendingCount > 0 && (!isSuperAdmin || isGlobalMode)
            ? pendingCount
            : undefined,
      },
      {
        key: "permintaan-member",
        label: "Permintaan Member",
        description: "User minta menjadi member",
        Icon: UserPlus,
        to: "/lainnya/permintaan-member",
        section: "jamaah",
      },
      ...(isGlobalMode
        ? [
            {
              key: "kelompok",
              label: "Kelompok",
              description: "Kelola data master kelompok pengajian",
              Icon: Building2,
              to: "/lainnya/kelompok",
              section: "jamaah" as const,
            },
          ]
        : []),
      {
        key: "import-jamaah",
        label: "Import Jamaah",
        description: "Paste text biodata dari WhatsApp",
        Icon: FileText,
        to: "/lainnya/import-jamaah",
        section: "jamaah",
      },
      {
        key: "qr-code",
        label: "QR Pendaftaran",
        description: isGlobalMode
          ? "Bagikan link pendaftaran"
          : "Bagikan link pendaftaran kelompok",
        Icon: QrCode,
        to: "/lainnya/qr-code",
        section: "jamaah",
      },
      {
        key: "jadwal",
        label: "Kelola Jadwal",
        description: "Kalender, tambah massal & import PDF",
        Icon: Calendar,
        to: "/lainnya/jadwal",
        section: "jadwal",
      },
      {
        key: "rekap-absensi",
        label: "Rekap Absensi",
        description: "Matriks kehadiran bulanan",
        Icon: CalendarCheck,
        to: "/lainnya/rekap-absensi",
        section: "jadwal",
      },
      {
        key: "petugas-jumat",
        label: "Petugas Jumat",
        description: "Kelola petugas sholat Jumat",
        Icon: Mosque,
        to: "/lainnya/petugas-jumat",
        section: "jadwal",
      },
    ];
  }, [isGlobalMode, pendingCount, isSuperAdmin]);

  const headerTitle = isSuperAdmin ? "Kelola Kelompok" : "Kelompok Saya";
  const headerSubtitle = isSuperAdmin
    ? isGlobalMode
      ? "Semua Kelompok · mode super admin"
      : `${myGroup?.group_name || ""} · mode super admin`
    : myGroup?.group_name;

  return (
    <AppLayout>
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        onBack={() => navigate("/lainnya")}
        backLabel="Lainnya"
      />

      <div className="py-4">
        {isSuperAdmin && (
          <div className="px-4 mb-2.5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <FilterChip
              active={isGlobalMode}
              label="Semua"
              onClick={() => {
                setSuperAdminFocusGroup(null);
                if (urlGroupId) navigate("/kelompok-saya");
              }}
            />
            {allGroups.map((g) => (
              <FilterChip
                key={g.group_id}
                active={g.group_id === activeFocusGroupId}
                label={g.group_name}
                onClick={() => {
                  setSuperAdminFocusGroup(g.group_id);
                  navigate(`/kelompok-saya?group_id=${g.group_id}`);
                }}
              />
            ))}
          </div>
        )}

        {!isSuperAdmin && !effectiveGroupId ? (
          <EmptyState
            title="Tanpa kelompok"
            description="Akun Anda belum dipetakan ke kelompok mana pun."
          />
        ) : (
          <>
            {myGroup && (
              <section>
                <p className="px-4 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                  {myGroup.group_name}
                </p>
                <GroupedList>
                  <ListRow
                    insetDivider={false}
                    onClick={() => setEditSheetOpen(true)}
                  >
                    <ChevronRow>
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <span className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {(myGroup.group_name || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-ios-body font-semibold text-surface-text truncate">
                            {groupsQuery.isLoading
                              ? "Memuat..."
                              : myGroup.group_name}
                          </p>
                          <p className="text-ios-caption text-surface-muted truncate">
                            Pembina: {myGroup.pembina || "-"} ·{" "}
                            {myGroup.jadwal || ""}
                          </p>
                        </div>
                      </div>
                    </ChevronRow>
                  </ListRow>
                </GroupedList>
              </section>
            )}

            {[
              { key: "jamaah" as const, label: "Jamaah & Keanggotaan" },
              { key: "jadwal" as const, label: "Jadwal & Absensi" },
            ].map((sec) => {
              const items = menu.filter((m) => m.section === sec.key);
              if (items.length === 0) return null;
              return (
                <section key={sec.key}>
                  <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                    {sec.label}
                  </p>
                  <HubMenuGrid
                    items={items.map((m) => ({
                      key: m.key,
                      label: m.label,
                      Icon: m.Icon,
                      badge: m.badge,
                      onClick: () => navigate(m.to),
                    }))}
                  />
                </section>
              );
            })}
          </>
        )}
      </div>

      <GroupSheet
        open={editSheetOpen}
        group={myGroup ?? null}
        onClose={() => setEditSheetOpen(false)}
        onSave={(payload) => saveMutation.mutate(payload)}
        saving={saveMutation.isPending}
      />
    </AppLayout>
  );
}
