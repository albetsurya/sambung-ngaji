import { useState } from "react";
import {
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  GraduationCap,
  User,
  Mars,
  Venus,
  Cake,
  Hourglass,
  Ruler,
  Building2,
  Home,
  Compass,
  MapPin,
  Phone,
  Briefcase,
  Star,
  Heart,
  Mosque,
  CalendarCheck,
} from "../../../components/ui/FontAwesomeIcons";
import { Card, Badge, GroupedList, ListRow } from "../../../components/ui";
import type { Member, Education, AttendanceStatus } from "../../../types";
import {
  CATEGORY_LABEL,
  formatDateShort,
  ATTENDANCE_LABEL,
  formatDateLongText,
} from "../../../utils/format";
import { getMood } from "../../ai-chat/data/mood";
import type { MoodEntry } from "../../../services/domainApi";


export function BiodataTab({ member }: { member: Member }) {
  const GenderIcon = member.gender === "P" ? Venus : Mars;
  const ttl = [member.birth_place, member.birth_date ? formatDateLongText(member.birth_date) : ""]
    .filter(Boolean)
    .join(", ");
  const fisik = [
    member.height ? `${member.height} cm` : "",
    member.weight ? `${member.weight} kg` : "",
  ]
    .filter(Boolean)
    .join(" / ");

  const sections: {
    title: string;
    rows: { Icon: typeof User; label: string; value?: string }[];
  }[] = [
    {
      title: "Pribadi",
      rows: [
        { Icon: User, label: "Nama panggilan", value: member.nickname },
        {
          Icon: GenderIcon,
          label: "Jenis kelamin",
          value:
            member.gender === "L"
              ? "Laki-laki"
              : member.gender === "P"
                ? "Perempuan"
                : undefined,
        },
        { Icon: Cake, label: "Tempat, tanggal lahir", value: ttl || undefined },
        {
          Icon: Hourglass,
          label: "Usia",
          value: member.usia != null ? `${member.usia} tahun` : undefined,
        },
        { Icon: Ruler, label: "Tinggi / berat badan", value: fisik || undefined },
        {
          Icon: CalendarCheck,
          label: "Aktif sejak",
          value: member.joined_date ? formatDateShort(member.joined_date) : undefined,
        },
      ],
    },
    {
      title: "Domisili",
      rows: [
        { Icon: Building2, label: "Kelompok", value: member.group_label },
        { Icon: Home, label: "Desa", value: member.village },
        { Icon: Compass, label: "Daerah", value: member.region },
        { Icon: MapPin, label: "Alamat rumah", value: member.home_address },
      ],
    },
    {
      title: "Kontak & Kesibukan",
      rows: [
        { Icon: Phone, label: "No. WhatsApp", value: member.whatsapp_number },
        { Icon: Briefcase, label: "Pekerjaan", value: member.occupation },
        { Icon: Star, label: "Hobi", value: member.hobby },
      ],
    },
  ];

  const visibleSections = sections
    .map((s) => ({ ...s, rows: s.rows.filter((r) => r.value) }))
    .filter((s) => s.rows.length > 0);

  return (
    <div className="-mx-4">
      {visibleSections.map((s, si) => {
        const rows = s.rows;
        return (
          <section key={s.title}>
            <p
              className={`px-4 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted ${
                si === 0 ? "mt-1" : "mt-5"
              }`}
            >
              {s.title}
            </p>
            <GroupedList>
              {rows.map((r, i) => {
                const Icon = r.Icon;
                return (
                  <ListRow
                    key={r.label}
                    insetDivider={i !== rows.length - 1}
                    leading={
                      <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                        <Icon size={15} />
                      </span>
                    }
                  >
                    <p className="text-ios-caption text-surface-muted">
                      {r.label}
                    </p>
                    <p className="text-ios-body font-medium text-surface-text leading-snug break-words">
                      {r.value}
                    </p>
                  </ListRow>
                );
              })}
            </GroupedList>
          </section>
        );
      })}

      <p className="text-ios-caption text-surface-muted px-5 mt-3">
        Data diperbarui:{" "}
        {member.updated_at ? formatDateShort(member.updated_at) : "-"}
      </p>
    </div>
  );
}


export function EducationTab({
  education,
  member,
}: {
  education: Education[];
  member?: Member;
}) {
  const items =
    education.length > 0 ? education : fallbackEducation(member);
  if (!items.length) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-6">
          <span className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center text-accent mb-3">
            <GraduationCap size={26} />
          </span>
          <p className="text-ios-subhead font-medium text-surface-text">
            Belum ada riwayat pendidikan
          </p>
          <p className="text-ios-caption text-surface-muted mt-1 max-w-[240px] leading-relaxed">
            Lengkapi data pendidikan melalui Edit Biodata.
          </p>
        </div>
      </Card>
    );
  }

  const latest = items[0];
  const yearRange = formatYearRange(latest.start_year, latest.end_year);
  const duration = studyDuration(latest.start_year, latest.end_year);

  return (
    <div className="space-y-3">
      
      <div className="rounded-2xl border border-surface-border bg-surface-card shadow-sm overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0 shadow-sm shadow-accent/30">
            <GraduationCap size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
              Pendidikan terakhir
            </p>
            <p className="text-[17px] font-semibold text-surface-text truncate tracking-[-0.01em]">
              {latest.level}
              {latest.grade ? ` · Kelas ${latest.grade}` : ""}
            </p>
            {(latest.school || latest.major) && (
              <p className="text-ios-footnote text-surface-muted truncate">
                {[latest.school, latest.major].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        {(yearRange || duration || latest.status) && (
          <div className="px-4 pb-3.5 flex items-center gap-2 flex-wrap">
            {yearRange && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums bg-accent-soft text-accent">
                {yearRange}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-card2 text-surface-muted">
                {duration}
              </span>
            )}
            {latest.status && (
              <Badge color={latest.status === "AKTIF" ? "emerald" : "ink"}>
                {latest.status}
              </Badge>
            )}
          </div>
        )}
      </div>

      
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-surface-border" />
        <div className="space-y-2.5">
          {items.map((e, idx) => {
            const range = formatYearRange(e.start_year, e.end_year);
            return (
              <div key={e.education_id} className="relative">
                <div
                  className={`absolute -left-5 top-4 w-3.5 h-3.5 rounded-full bg-surface-card border-2 ${
                    idx === 0 ? "border-accent" : "border-surface-muted/40"
                  }`}
                />
                <Card
                  className={idx === 0 ? "!border-accent/25" : ""}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ios-subhead text-surface-text truncate">
                        {e.level}
                        {e.grade ? ` · Kelas ${e.grade}` : ""}
                      </p>
                      {(e.school || e.major) && (
                        <p className="text-ios-footnote text-surface-muted truncate mt-0.5">
                          {[e.school, e.major].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    {range && (
                      <span className="text-[11px] font-bold tabular-nums text-surface-muted shrink-0">
                        {range}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-ios-caption text-surface-muted px-1">
        {items.length} riwayat pendidikan
        {member?.updated_at
          ? ` · diperbarui ${formatDateShort(member.updated_at)}`
          : ""}
      </p>
    </div>
  );
}

function formatYearRange(
  mulai?: string | number,
  selesai?: string | number,
): string {
  const m = mulai !== undefined && mulai !== "" ? String(mulai) : "";
  const s = selesai !== undefined && selesai !== "" ? String(selesai) : "";
  if (m && s) return `${m}-${s}`;
  if (m) return `${m}-sekarang`;
  if (s) return `s.d. ${s}`;
  return "";
}

function studyDuration(
  mulai?: string | number,
  selesai?: string | number,
): string {
  const m = Number(mulai);
  const s = Number(selesai);
  if (!mulai || !selesai || !Number.isFinite(m) || !Number.isFinite(s)) return "";
  const d = s - m;
  if (d <= 0) return "";
  return `${d} tahun`;
}

function fallbackEducation(member?: Member): Education[] {
  if (!member) return [];
  const { education_level, school, major } = member;
  if (!education_level && !school && !major) return [];
  return [
    {
      education_id: "biodata",
      member_id: member.member_id,
      level: education_level || "Pendidikan",
      school,
      major,
      start_year: member.education_start_year,
      end_year: member.education_end_year,
    },
  ];
}


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
                <Icon size={14} className={color} /> {ev.label}
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


export interface AttendanceItem {
  id: string;
  date?: string;
  label: string;
  sublabel?: string;
  status: AttendanceStatus;
  libur?: boolean;
}

const ATT_STATUS_CONFIG: Record<
  string,
  { label: string; color: "emerald" | "amber" | "red" | "ink" }
> = {
  HADIR: { label: "Hadir", color: "emerald" },
  IZIN: { label: "Izin", color: "amber" },
  SAKIT: { label: "Sakit", color: "amber" },
  ALPA: { label: "Alpa", color: "red" },
};


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
  return date.slice(0, 7);
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
    else if (it.status === "IZIN") map[key].ijin++;
    else if (it.status === "SAKIT") map[key].sakit++;
    else if (it.status === "ALPA") map[key].alpa++;
  });

  const list = Object.values(map);
  list.forEach((m) => {
    m.rate = m.total ? Math.round((m.hadir / m.total) * 100) : 0;
  });

  return list.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}


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

  const statsItems = items.filter((it) => !it.libur);

  const counts = {
    HADIR: 0,
    IZIN: 0,
    SAKIT: 0,
    ALPA: 0,
  };
  statsItems.forEach((it) => {
    if (counts.hasOwnProperty(it.status)) counts[it.status]++;
  });

  const persentase = statsItems.length
    ? Math.round((counts.HADIR / statsItems.length) * 100)
    : 0;

  const monthlyRecap = buildMonthlyRecap(statsItems);
  const hasMore = items.length > initialCount;
  const displayedItems = showAll ? items : items.slice(0, initialCount);

  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Hadir" value={counts.HADIR} color="emerald" />
        <StatBox label="Izin" value={counts.IZIN} color="amber" />
        <StatBox label="Sakit" value={counts.SAKIT} color="amber" />
        <StatBox label="Alpa" value={counts.ALPA} color="red" />
      </div>

      
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-semibold text-ios-nav">%</span>
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
                      <p className="font-medium text-ios-subhead text-surface-text truncate">
                        {it.label}
                      </p>
                      {it.sublabel && (
                        <p className="text-ios-caption text-surface-muted truncate">
                          {it.sublabel}
                        </p>
                      )}
                    </div>
                    {it.libur ? (
                      <Badge color="ink">Libur</Badge>
                    ) : (
                      <Badge color={config.color}>{config.label}</Badge>
                    )}
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


function MonthlyRecapCard({ recap }: { recap: MonthlyRecap }) {
  const { monthKey, total, hadir, ijin, sakit, alpa, rate } = recap;

  const barColor =
    rate >= 80 ? "bg-accent" : rate >= 50 ? "bg-warning" : "bg-danger";

  const chips: { label: string; value: number; color: string }[] = [];
  if (hadir > 0)
    chips.push({ label: "hadir", value: hadir, color: "text-accent" });
  if (ijin > 0)
    chips.push({ label: "izin", value: ijin, color: "text-warning" });
  if (sakit > 0)
    chips.push({ label: "sakit", value: sakit, color: "text-warning" });
  if (alpa > 0)
    chips.push({ label: "alpa", value: alpa, color: "text-danger" });

  return (
    <Card>
      
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

      
      <p className="text-ios-caption text-surface-muted mb-2">
        {chips.map((c, i) => (
          <span key={c.label}>
            {i > 0 && " · "}
            <span className={c.color}>{c.value}</span> {c.label}
          </span>
        ))}
        <span className="text-surface-muted"> dari {total} pertemuan</span>
      </p>

      
      <div className="h-1.5 rounded-full bg-surface-card2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </Card>
  );
}


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


export function CategoryHeaderBadge({ member }: { member: Member }) {
  if (!member.kategori) return null;
  return <Badge>{CATEGORY_LABEL[member.kategori]}</Badge>;
}

export function MemberStatusChips({
  member,
  inline = false,
}: {
  member: Member;
  inline?: boolean;
}) {
  const chips: { Icon: typeof Heart; label: string }[] = [];
  if (member.is_preacher) chips.push({ Icon: Mosque, label: "Muballigh" });
  if (member.is_employed) chips.push({ Icon: Briefcase, label: "Bekerja" });
  if (member.is_married) chips.push({ Icon: Heart, label: "Menikah" });
  if (chips.length === 0) return null;
  const items = chips.map((c) => {
    const Icon = c.Icon;
    return (
      <span
        key={c.label}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent-soft text-accent"
      >
        <Icon size={10} />
        {c.label}
      </span>
    );
  });
  if (inline) return <>{items}</>;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      {items}
    </div>
  );
}


function moodMeta(key: string): { emoji: string; label: string } {
  const m = getMood(key as Parameters<typeof getMood>[0]);
  return m ? { emoji: m.emoji, label: m.label } : { emoji: "•", label: key };
}

export function MoodTab({ entries }: { entries: MoodEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card>
        <p className="text-ios-subhead text-surface-muted text-center py-4">
          Belum ada catatan mood.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-ios-footnote font-medium text-surface-muted px-0.5">
        Riwayat mood harian
      </p>
      <Card>
        <GroupedList>
          {entries.map((e) => {
            const meta = moodMeta(e.mood_key);
            return (
              <ListRow
                key={e.mood_id}
                leading={<span className="text-[22px] leading-none">{meta.emoji}</span>}
              >
                <p className="text-ios-subhead text-surface-text font-medium">
                  {meta.label}
                </p>
                <p className="text-ios-caption text-surface-muted">
                  {formatDateLongText(e.date)}
                </p>
              </ListRow>
            );
          })}
        </GroupedList>
      </Card>
    </div>
  );
}
