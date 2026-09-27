import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import {
  Building2,
  ClipboardList,
  Mosque,
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

/**
 * Hub "Kelompok Saya" untuk admin ber-kelompok (selain SUPER_ADMIN).
 * Satu pintu mengelola: anggota, pendaftar, permintaan member,
 * petugas Jumat, dan data kelompoknya. Semua daftar di bawah sudah
 * difilter group oleh backend mengikuti akun login.
 */
export default function GroupHubPage() {
  const navigate = useNavigate();
  const { assignedGroup } = usePermission();

  const groupsQuery = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });
  const myGroup = (groupsQuery.data ?? []).find(
    (g) => g.group_id === assignedGroup,
  );

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
    badge?: number;
  }[] = [
    {
      key: "anggota",
      label: "Kelola Anggota",
      description: "Kelola jamaah kelompok ini",
      Icon: Users,
      to: "/jamaah",
    },
    {
      key: "pendaftar",
      label: "Pendaftar",
      description: "Verifikasi pendaftar baru",
      Icon: ClipboardList,
      to: "/lainnya/pendaftar",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      key: "permintaan-member",
      label: "Permintaan Member",
      description: "User minta menjadi member",
      Icon: UserPlus,
      to: "/lainnya/permintaan-member",
    },
    {
      key: "petugas-jumat",
      label: "Petugas Jumat",
      description: "Kelola petugas sholat Jumat",
      Icon: Mosque,
      to: "/lainnya/petugas-jumat",
    },
    {
      key: "data-kelompok",
      label: "Data Kelompok",
      description: "Profil & pengaturan kelompok",
      Icon: Building2,
      to: "/lainnya/kelompok",
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
                <ListRow insetDivider={false}>
                  <div className="flex items-center gap-3">
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
                </ListRow>
              </GroupedList>
            </section>

            <section>
              <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Kelola
              </p>
              <GroupedList>
                {menu.map((m, i) => {
                  const Icon = m.Icon;
                  return (
                    <ListRow
                      key={m.key}
                      onClick={() => navigate(m.to)}
                      insetDivider={i !== menu.length - 1}
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
