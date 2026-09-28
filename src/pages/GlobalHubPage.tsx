import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { FilterChip, HubMenuGrid } from "../components/common";
import { pendingApi } from "../services/pendingApi";
import { groupApi } from "../services/domainApi";
import { queryKeys } from "../lib/queryClient";
import { setSuperAdminFocusGroup } from "../hooks/usePermission";

export default function GlobalHubPage() {
  const navigate = useNavigate();

  useEffect(() => {
    setSuperAdminFocusGroup(null);
  }, []);

  const pendingQuery = useQuery({
    queryKey: queryKeys.pendingMembers("PENDING"),
    queryFn: () => pendingApi.list({ status: "PENDING" }),
    staleTime: 60_000,
  });
  const pendingCount = (pendingQuery.data ?? []).length;

  const groupsQuery = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });
  const allGroups = groupsQuery.data ?? [];

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
      description: "Atur akun & hak akses semua kelompok",
      Icon: KeyRound,
      to: "/lainnya/users",
      section: "jamaah",
    },
    {
      key: "pendaftar",
      label: "Pendaftar",
      description: "Verifikasi pendaftar baru semua kelompok",
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
      key: "kelompok",
      label: "Kelompok",
      description: "Kelola kelompok pengajian",
      Icon: Building2,
      to: "/lainnya/kelompok",
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
      description: "Bagikan link pendaftaran",
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
        title="Semua Kelompok"
        subtitle="Kelola global"
        onBack={() => navigate("/lainnya")}
        backLabel="Lainnya"
      />

      <div className="py-4">
        <div className="px-4 mb-2.5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterChip
            active
            label="Semua"
            onClick={() => {}}
          />
          {allGroups.map((g) => (
            <FilterChip
              key={g.group_id}
              active={false}
              label={g.group_name}
              onClick={() => {
                setSuperAdminFocusGroup(g.group_id);
                navigate(`/kelompok-saya?group_id=${g.group_id}`);
              }}
            />
          ))}
        </div>
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
      </div>
    </AppLayout>
  );
}
