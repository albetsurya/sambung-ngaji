import { useState } from "react";
import {
  Check,
  X,
  AlertTriangle,
  ChevronDown,
} from "../common/FontAwesomeIcons";
import { Card, Badge, GroupedList, ListRow } from "../common";
import type { Member, Education, AttendanceStatus } from "../../types";
import {
  CATEGORY_LABEL,
  formatDateShort,
  ATTENDANCE_LABEL,
  formatDateLongText,
} from "../../utils/format";

/* -------------------------------------------------------------------------- */
/*                              BIODATA TAB                                   */
/* -------------------------------------------------------------------------- */

export function BiodataTab({ member }: { member: Member }) {
  console.log(member);
  const rows: [string, string | undefined][] = [
    ["Nama Panggilan", member.nama_panggilan],
    [
      "Jenis Kelamin",
      member.jenis_kelamin === "L"
        ? "Laki-laki"
        : member.jenis_kelamin === "P"
          ? "Perempuan"
          : "-",
    ],
    [
      "Tempat, Tgl Lahir",
      [
        member.tempat_lahir,
        member.tanggal_lahir ? formatDateLongText(member.tanggal_lahir) : "",
      ]
        .filter(Boolean)
        .join(", "),
    ],
    ["Usia", member.usia != null ? `${member.usia} tahun` : "-"],
    ["Kelompok", member.kelompok],
    ["Desa", member.desa],
    ["Daerah", member.daerah],
    ["Alamat", member.alamat_rumah],
    ["No. WhatsApp", member.no_wa],
    ["Pekerjaan", member.pekerjaan],
  ];

  console.log(member);
  return (
    <div className="-mx-4">
      <GroupedList>
        {rows.map(([label, value], i) => (
          <ListRow key={label} insetDivider={i !== rows.length - 1}>
            <div className="flex justify-between gap-4">
              <span className="text-ios-body text-surface-muted flex-shrink-0">
                {label}
              </span>
              <span className="text-ios-body text-surface-text text-right truncate">
                {value || "-"}
              </span>
            </div>
          </ListRow>
        ))}
      </GroupedList>
      <p className="text-ios-caption text-surface-muted px-5 mt-1">
        Data diperbarui:{" "}
        {member.updated_at ? formatDateShort(member.updated_at) : "-"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              EDUCATION TAB                                 */
/* -------------------------------------------------------------------------- */

export function EducationTab({ education }: { education: Education[] }) {
  if (!education.length) {
    return (
      <Card>
        <p className="text-ios-subhead text-surface-muted text-center py-4">
          Belum ada riwayat pendidikan.
        </p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {education.map((e) => (
        <Card
          key={e.education_id}
          className="flex items-center justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-ios-subhead text-surface-text truncate">
              {e.jenjang} {e.kelas ? `- Kelas ${e.kelas}` : ""}
            </p>
            <p className="text-ios-footnote text-surface-muted truncate">
              {e.sekolah}
              {e.jurusan ? ` · ${e.jurusan}` : ""}
            </p>
          </div>
          <Badge color={e.status === "AKTIF" ? "emerald" : "ink"}>
            {e.status}
          </Badge>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TIMELINE TAB                                  */
/* -------------------------------------------------------------------------- */

interface TimelineEvent {
  date: string;
  type: "attendance" | "monitoring";
  label: string;
  detail?: string;
  variant: "success" | "danger" | "warning";
}

const TIMELINE_ICON: Record<
  TimelineEvent["variant"],
  { Icon: typeof Check; dot: string; color: string }
> = {
  success: { Icon: Check, dot: "border-accent", color: "text-accent" },
  danger: { Icon: X, dot: "border-danger", color: "text-danger" },
  warning: {
    Icon: AlertTriangle,
    dot: "border-warning",
    color: "text-warning",
  },
};

export function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return (
      <Card>
        <p className="text-ios-subhead text-surface-muted text-center py-4">
          Belum ada aktivitas tercatat.
        </p>
      </Card>
    );
  }
  return (
    <div className="relative pl-5">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-surface-border" />
      <div className="space-y-4">
        {events.map((ev, idx) => {
          const { Icon, dot, color } = TIMELINE_ICON[ev.variant];
          return (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-surface-card border-2 ${dot}`}
              />
              <p className="text-ios-caption text-surface-muted">
                {formatDateShort(ev.date)}
              </p>
              <p className="text-ios-subhead text-surface-text flex items-center gap-1.5">
                <Icon size={13} className={color} /> {ev.label}
              </p>
              {ev.detail && (
                <p className="text-ios-footnote text-surface-muted">
                  {ev.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { TimelineEvent };

/* -------------------------------------------------------------------------- */
/*                              ATTENDANCE TAB                                */
/* -------------------------------------------------------------------------- */
/*
 * Layout:
 *  1. Stats grid (total)
 *  2. Percentage bar (total)
 *  3. Rekap bulanan (per YYYY-MM)
 *  4. Riwayat absensi (hybrid: 5 awal + tombol "Lihat Semua")
 */

export interface AttendanceItem {
  id: string;
  date?: string;
  label: string;
  sublabel?: string;
  status: AttendanceStatus;
}

const ATT_STATUS_CONFIG: Record<
  string,
  { label: string; color: "emerald" | "amber" | "red" | "ink" }
> = {
  HADIR: { label: "Hadir", color: "emerald" },
  IJIN: { label: "Ijin", color: "amber" },
  SAKIT: { label: "Sakit", color: "amber" },
  TANPA_KETERANGAN: { label: "Alpa", color: "red" },
};

/* ----------------------------- Month helpers ----------------------------- */

const BULAN_NAMA = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function getMonthKey(date?: string): string | null {
  if (!date || date.length < 7) return null;
  return date.slice(0, 7); // YYYY-MM
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return monthKey;
  return `${BULAN_NAMA[m - 1]} ${y}`;
}

interface MonthlyRecap {
  monthKey: string;
  total: number;
  hadir: number;
  ijin: number;
  sakit: number;
  alpa: number;
  rate: number;
}

function buildMonthlyRecap(items: AttendanceItem[]): MonthlyRecap[] {
  const map: Record<string, MonthlyRecap> = {};

  items.forEach((it) => {
    const key = getMonthKey(it.date);
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        monthKey: key,
        total: 0,
        hadir: 0,
        ijin: 0,
        sakit: 0,
        alpa: 0,
        rate: 0,
      };
    }
    map[key].total++;
    if (it.status === "HADIR") map[key].hadir++;
    else if (it.status === "IJIN") map[key].ijin++;
    else if (it.status === "SAKIT") map[key].sakit++;
    else if (it.status === "TANPA_KETERANGAN") map[key].alpa++;
  });

  const list = Object.values(map);
  list.forEach((m) => {
    m.rate = m.total ? Math.round((m.hadir / m.total) * 100) : 0;
  });

  // Sort: newest month first
  return list.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

/* ----------------------------- Main component ----------------------------- */

export function AttendanceTab({
  items,
  initialCount = 5,
  emptyMessage = "Belum ada riwayat absensi.",
}: {
  items: AttendanceItem[];
  initialCount?: number;
  emptyMessage?: string;
}) {
  const [showAll, setShowAll] = useState(false);

  /* ---------------------------- Compute stats ---------------------------- */
  const counts = {
    HADIR: 0,
    IJIN: 0,
    SAKIT: 0,
    TANPA_KETERANGAN: 0,
  };
  items.forEach((it) => {
    if (counts.hasOwnProperty(it.status)) counts[it.status]++;
  });

  const persentase = items.length
    ? Math.round((counts.HADIR / items.length) * 100)
    : 0;

  const monthlyRecap = buildMonthlyRecap(items);
  const hasMore = items.length > initialCount;
  const displayedItems = showAll ? items : items.slice(0, initialCount);

  return (
    <div className="space-y-4">
      {/* ------------------------------ Stats Grid ------------------------------ */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Hadir" value={counts.HADIR} color="emerald" />
        <StatBox label="Ijin" value={counts.IJIN} color="amber" />
        <StatBox label="Sakit" value={counts.SAKIT} color="amber" />
        <StatBox label="Alpa" value={counts.TANPA_KETERANGAN} color="red" />
      </div>

      {/* ---------------------------- Percentage Bar ---------------------------- */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-semibold text-lg">%</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ios-footnote text-surface-muted">
              Persentase kehadiran
            </p>
            <p className="text-[22px] font-semibold text-surface-text tabular-nums tracking-[-0.02em]">
              {persentase}%
            </p>
          </div>
          <div className="w-20 h-2 rounded-full bg-surface-card2 overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${persentase}%` }}
            />
          </div>
        </div>
      </Card>

      {/* ---------------------------- Rekap Bulanan ---------------------------- */}
      {monthlyRecap.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <p className="text-ios-footnote font-medium text-surface-muted">
              Rekap Bulanan
            </p>
            <span className="text-ios-caption text-surface-muted tabular-nums">
              {monthlyRecap.length} bulan
            </span>
          </div>
          <div className="space-y-2">
            {monthlyRecap.map((m) => (
              <MonthlyRecapCard key={m.monthKey} recap={m} />
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------- Riwayat Absensi ---------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <p className="text-ios-footnote font-medium text-surface-muted">
            Riwayat Absensi
          </p>
          {items.length > 0 && (
            <span className="text-ios-caption text-surface-muted tabular-nums">
              {showAll
                ? `${items.length} total`
                : `${Math.min(initialCount, items.length)} dari ${items.length}`}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <Card>
            <p className="text-ios-subhead text-surface-muted text-center py-4">
              {emptyMessage}
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {displayedItems.map((it) => {
                const config = ATT_STATUS_CONFIG[it.status] || {
                  label: it.status || "?",
                  color: "ink" as const,
                };
                return (
                  <Card key={it.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-surface-text truncate">
                        {it.label}
                      </p>
                      {it.sublabel && (
                        <p className="text-xs text-surface-muted truncate">
                          {it.sublabel}
                        </p>
                      )}
                    </div>
                    <Badge color={config.color}>{config.label}</Badge>
                  </Card>
                );
              })}
            </div>

            {hasMore && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full mt-3 min-h-[44px] rounded-2xl border border-surface-border bg-surface-card hover:bg-surface-card2 flex items-center justify-center gap-2 text-ios-subhead font-medium text-accent transition-all active:scale-[0.98]"
              >
                <span>
                  {showAll
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua (${items.length})`}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    showAll ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          MONTHLY RECAP CARD                                */
/* -------------------------------------------------------------------------- */

function MonthlyRecapCard({ recap }: { recap: MonthlyRecap }) {
  const { monthKey, total, hadir, ijin, sakit, alpa, rate } = recap;

  // Warna bar berdasarkan rate
  const barColor =
    rate >= 80 ? "bg-accent" : rate >= 50 ? "bg-warning" : "bg-danger";

  // Build detail chips (skip yang 0)
  const chips: { label: string; value: number; color: string }[] = [];
  if (hadir > 0)
    chips.push({ label: "hadir", value: hadir, color: "text-accent" });
  if (ijin > 0)
    chips.push({ label: "ijin", value: ijin, color: "text-warning" });
  if (sakit > 0)
    chips.push({ label: "sakit", value: sakit, color: "text-warning" });
  if (alpa > 0)
    chips.push({ label: "alpa", value: alpa, color: "text-danger" });

  return (
    <Card>
      {/* Header: bulan + persentase */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-ios-subhead font-medium text-surface-text truncate">
          {formatMonthLabel(monthKey)}
        </p>
        <span
          className={`text-ios-subhead font-semibold tabular-nums flex-shrink-0 ${
            rate >= 80
              ? "text-accent"
              : rate >= 50
                ? "text-warning"
                : "text-danger"
          }`}
        >
          {rate}%
        </span>
      </div>

      {/* Detail chips */}
      <p className="text-ios-caption text-surface-muted mb-2">
        {chips.map((c, i) => (
          <span key={c.label}>
            {i > 0 && " · "}
            <span className={c.color}>{c.value}</span> {c.label}
          </span>
        ))}
        <span className="text-surface-muted"> dari {total} pertemuan</span>
      </p>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-surface-card2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              STAT BOX                                      */
/* -------------------------------------------------------------------------- */

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "red" | "ink";
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-accent",
    amber: "text-warning",
    red: "text-danger",
    ink: "text-surface-muted",
  };
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card shadow-sm p-3 flex flex-col items-center justify-center gap-1 min-h-[80px]">
      <p
        className={`text-[19px] font-semibold tabular-nums tracking-[-0.02em] leading-none ${colorMap[color]}`}
      >
        {value}
      </p>
      <p className="text-ios-caption text-surface-muted leading-none">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          CATEGORY HEADER BADGE                             */
/* -------------------------------------------------------------------------- */

export function CategoryHeaderBadge({ member }: { member: Member }) {
  if (!member.kategori) return null;
  return <Badge>{CATEGORY_LABEL[member.kategori]}</Badge>;
}
