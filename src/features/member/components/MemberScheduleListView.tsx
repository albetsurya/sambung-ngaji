import { useMemo } from "react";
import { Calendar, ChevronRight } from "../../../components/ui/FontAwesomeIcons";
import { Badge, EmptyState } from "../../../components/ui";
import type { Meeting, MemberCategory } from "../../../types";
import { CATEGORY_LABEL } from "../../../utils/format";
import { getTodayIso } from "../../../utils/format";

function normalizeTargets(raw: unknown): MemberCategory[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as MemberCategory[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as MemberCategory[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  if (!y || !m || m < 1 || m > 12) return monthKey;
  return BULAN[m - 1] + " " + y;
}

export function MemberScheduleListView({
  meetings,
  onSelect,
}: {
  meetings: Meeting[];
  onSelect: (m: Meeting) => void;
}) {
  const today = getTodayIso();

  const grouped = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const monthKey = m.tanggal.slice(0, 7);
      const list = map.get(monthKey) ?? [];
      list.push(m);
      map.set(monthKey, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, items]) => ({
        monthKey,
        label: formatMonthLabel(monthKey),
        items: [...items].sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
      }));
  }, [meetings]);

  if (meetings.length === 0) {
    return (
      <EmptyState
        title="Tidak ada jadwal"
        description="Belum ada jadwal pengajian untuk filter yang dipilih."
      />
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((g) => (
        <section key={g.monthKey}>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
              {g.label}
            </p>
            <span className="text-ios-caption text-surface-muted tabular-nums">
              {g.items.length} jadwal
            </span>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            {g.items.map((m, i) => {
              const isToday = m.tanggal === today;
              const targets = normalizeTargets(m.kategori_target);
              return (
                <button
                  key={m.meeting_id}
                  onClick={() => onSelect(m)}
                  className={
                    "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-surface-card2 active:scale-[0.995] " +
                    (i !== g.items.length - 1
                      ? "border-b border-surface-border "
                      : "") +
                    (isToday ? "bg-accent-soft/40" : "")
                  }
                >
                  <div
                    className={
                      "w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 " +
                      (isToday
                        ? "bg-accent text-white"
                        : "bg-surface-card2 text-surface-muted")
                    }
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
                      {m.hari.slice(0, 3)}
                    </span>
                    <span className="text-ios-subhead font-bold leading-none mt-0.5 tabular-nums">
                      {parseInt(m.tanggal.slice(8, 10), 10)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {m.acara || "Pengajian"}
                      </p>
                      {isToday && (
                        <span className="text-[9px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-1.5 py-0.5 uppercase flex-shrink-0">
                          Hari ini
                        </span>
                      )}
                    </div>
                    <p className="text-ios-caption text-surface-muted truncate">
                      {m.jam || "—"}
                    </p>
                    {targets.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {targets.slice(0, 3).map((k) => (
                          <span
                            key={k}
                            className="text-[9px] font-semibold tracking-wide text-accent bg-accent-soft rounded-full px-1.5 py-0.5 uppercase"
                          >
                            {CATEGORY_LABEL[k]}
                          </span>
                        ))}
                        {targets.length > 3 && (
                          <span className="text-[9px] font-medium text-surface-muted">
                            +{targets.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-surface-muted flex-shrink-0"
                  />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
