import { Check, X, AlertTriangle } from "../common/FontAwesomeIcons";
import { Card, Badge, GroupedList, ListRow } from '../common';
import type { Member, Education } from '../../types';
import { CATEGORY_LABEL, formatDateShort } from '../../utils/format';

export function BiodataTab({ member }: { member: Member }) {
  const rows: [string, string | undefined][] = [
    ['Nama Panggilan', member.nama_panggilan],
    ['Jenis Kelamin', member.jenis_kelamin === 'L' ? 'Laki-laki' : member.jenis_kelamin === 'P' ? 'Perempuan' : '-'],
    ['Tempat, Tgl Lahir', [member.tempat_lahir, member.tanggal_lahir ? formatDateShort(member.tanggal_lahir) : ''].filter(Boolean).join(', ')],
    ['Usia', member.usia != null ? `${member.usia} tahun` : '-'],
    ['Kelompok', member.kelompok],
    ['Desa', member.desa],
    ['Daerah', member.daerah],
    ['Alamat', member.alamat_rumah],
    ['No. WhatsApp', member.no_wa],
    ['Pekerjaan', member.pekerjaan]
  ];
  return (
    <div className="-mx-4">
      <GroupedList>
        {rows.map(([label, value], i) => (
          <ListRow key={label} insetDivider={i !== rows.length - 1}>
            <div className="flex justify-between gap-4">
              <span className="text-ios-body text-surface-muted flex-shrink-0">{label}</span>
              <span className="text-ios-body text-surface-text text-right truncate">{value || '-'}</span>
            </div>
          </ListRow>
        ))}
      </GroupedList>
      <p className="text-ios-caption text-surface-muted px-5 mt-1">Data diperbarui: {member.updated_at ? formatDateShort(member.updated_at) : '-'}</p>
    </div>
  );
}

export function EducationTab({ education }: { education: Education[] }) {
  if (!education.length) {
    return <Card><p className="text-ios-subhead text-surface-muted text-center py-4">Belum ada riwayat pendidikan.</p></Card>;
  }
  return (
    <div className="space-y-2">
      {education.map((e) => (
        <Card key={e.education_id} className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-medium text-ios-subhead text-surface-text truncate">{e.jenjang} {e.kelas ? `- Kelas ${e.kelas}` : ''}</p>
            <p className="text-ios-footnote text-surface-muted truncate">{e.sekolah}{e.jurusan ? ` · ${e.jurusan}` : ''}</p>
          </div>
          <Badge color={e.status === 'AKTIF' ? 'emerald' : 'ink'}>{e.status}</Badge>
        </Card>
      ))}
    </div>
  );
}

interface TimelineEvent {
  date: string;
  type: 'attendance' | 'monitoring';
  label: string;
  detail?: string;
  variant: 'success' | 'danger' | 'warning';
}

const TIMELINE_ICON: Record<TimelineEvent['variant'], { Icon: typeof Check; dot: string; color: string }> = {
  success: { Icon: Check, dot: 'border-accent', color: 'text-accent' },
  danger: { Icon: X, dot: 'border-danger', color: 'text-danger' },
  warning: { Icon: AlertTriangle, dot: 'border-warning', color: 'text-warning' }
};

export function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return <Card><p className="text-ios-subhead text-surface-muted text-center py-4">Belum ada aktivitas tercatat.</p></Card>;
  }
  return (
    <div className="relative pl-5">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-surface-border" />
      <div className="space-y-4">
        {events.map((ev, idx) => {
          const { Icon, dot, color } = TIMELINE_ICON[ev.variant];
          return (
            <div key={idx} className="relative">
              <div className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-surface-card border-2 ${dot}`} />
              <p className="text-ios-caption text-surface-muted">{formatDateShort(ev.date)}</p>
              <p className="text-ios-subhead text-surface-text flex items-center gap-1.5">
                <Icon size={13} className={color} /> {ev.label}
              </p>
              {ev.detail && <p className="text-ios-footnote text-surface-muted">{ev.detail}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { TimelineEvent };

export function CategoryHeaderBadge({ member }: { member: Member }) {
  if (!member.kategori) return null;
  return <Badge>{CATEGORY_LABEL[member.kategori]}</Badge>;
}
