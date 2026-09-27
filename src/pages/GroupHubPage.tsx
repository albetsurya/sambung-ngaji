import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  Users,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  ChevronRow,
  EmptyState,
  GroupedList,
  ListRow,
} from "../components/common";
import { usePermission } from "../hooks/usePermission";
import { groupApi } from "../services/domainApi";
import { pendingApi } from "../services/pendingApi";
import { queryKeys } from "../lib/queryClient";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { GroupSheet } from "./GroupsPage";
import type { Group } from "../types";

/**
 * Hub "Kelompok Saya" untuk admin ber-kelompok (selain SUPER_ADMIN).
 * Satu pintu mengelola: anggota, pendaftar, permintaan member,
 * petugas Jumat, dan data kelompoknya. Semua daftar di bawah sudah
 * difilter group oleh backend mengikuti akun login.
 */
export default function GroupHubPage() {
  const navigate = useNavigate();
  const { assignedGroup } = usePermission();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const groupsQuery = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });
  const myGroup = (groupsQuery.data ?? []).find(
    (g) => g.group_id === assignedGroup,
  );

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
  }[] = [
    {
      key: "users",
      label: "Manajemen User",
      description: "Kelola akun & hak akses kelompok ini",
      Icon: KeyRound,
      to: "/lainnya/users",
      section: "jamaah",
    },
    {
      key: "pendaftar",
      label: "Pendaftar",
      description: "Verifikasi pendaftar baru",
      Icon: ClipboardList,
      to: "/lainnya/pendaftar",
      section: "jamaah",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      key: "permintaan-member",
      label: "Permintaan Member",
      description: "User minta menjadi member",
      Icon: UserPlus,
      to: "/lainnya/permintaan-member",
      section: "jamaah",
    },
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
      description: "Bagikan link pendaftaran kelompok",
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

  return (
    <AppLayout>
      <Header
        title="Kelompok Saya"
        subtitle={myGroup?.group_name}
        onBack={() => navigate("/lainnya")}
        backLabel="Lainnya"
      />

      <div className="py-4">
        {!assignedGroup ? (
          <EmptyState
            title="Tanpa kelompok"
            description="Akun Anda belum dipetakan ke kelompok mana pun."
          />
        ) : (
          <>
            <section>
              <p className="px-4 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                {myGroup ? `${myGroup.group_name}` : "Kelompok"}
              </p>
              <GroupedList>
                <ListRow
                  insetDivider={false}
                  onClick={myGroup ? () => setEditSheetOpen(true) : undefined}
                >
                  <ChevronRow>
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <span className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {(myGroup?.group_name || "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-ios-body font-semibold text-surface-text truncate">
                          {groupsQuery.isLoading
                            ? "Memuat..."
                            : (myGroup?.group_name ?? "-")}
                        </p>
                        <p className="text-ios-caption text-surface-muted truncate">
                          {myGroup
                            ? `Pembina: ${myGroup.pembina || "-"} · ${myGroup.jadwal || ""}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </ChevronRow>
                </ListRow>
              </GroupedList>
            </section>

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
                  <GroupedList>
                    {items.map((m, i) => {
                      const Icon = m.Icon;
                      return (
                        <ListRow
                          key={m.key}
                          onClick={() => navigate(m.to)}
                          insetDivider={i !== items.length - 1}
                          leading={
                            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                              <Icon size={16} />
                            </span>
                          }
                        >
                          <ChevronRow>
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="min-w-0 flex-1">
                                <p className="text-ios-body font-medium text-surface-text truncate">
                                  {m.label}
                                </p>
                                <p className="text-ios-caption text-surface-muted truncate">
                                  {m.description}
                                </p>
                              </div>
                              {m.badge !== undefined && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-[10px] font-bold shrink-0">
                                  {m.badge > 99 ? "99+" : m.badge}
                                </span>
                              )}
                            </div>
                          </ChevronRow>
                        </ListRow>
                      );
                    })}
                  </GroupedList>
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
