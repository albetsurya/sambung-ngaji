import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import {
  Check,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "../components/ui/FontAwesomeIcons";
import { BadgeCollection } from "../features/member/components/BadgeCollection";
import { useBadges } from "../features/member/hooks/useBadges";
import { useDzikirStreak } from "../features/doa-dzikir/hooks/useDzikirStreak";
import { useQuranStreak } from "../features/quran/hooks/useQuranStreak";
import type { Streaks } from "../types";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button } from "../components/ui";
import {
  WAKTU_LIST,
  STATUS_LIST,
  getStatusInfo,
  formatDateId,
  formatDateShort,
  type WaktuSholat,
  type StatusSholat,
} from "../features/ibadah/data/sholat";
import {
  useSholatJournal,
  countRecorded,
  countTepat,
  isComplete,
  WAKTU_ORDER,
} from "../features/ibadah/hooks/useSholatJournal";


const TONE_BG: Record<string, string> = {
  neutral: "bg-surface-card2 text-surface-muted border-surface-border",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  accent: "bg-accent-soft text-accent border-accent/30",
  danger: "bg-danger-soft text-danger border-danger/30",
};

const TONE_BAR: Record<string, string> = {
  neutral: "bg-surface-card2",
  success: "bg-success",
  warning: "bg-warning",
  accent: "bg-accent",
  danger: "bg-danger",
};

export default function MemberSholatJournalPage() {
  const navigate = useNavigate();
  const {
    today,
    todayEntry,
    streak,
    setStatus,
    getHistory,
    resetDate,
  } = useSholatJournal();

  const recorded = countRecorded(todayEntry);
  const tepat = countTepat(todayEntry);
  const complete = isComplete(todayEntry);

  const history = getHistory(7);

  function handleResetToday() {
    if (!confirm("Reset catatan sholat hari ini?")) return;
    resetDate(today);
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Jurnal Sholat"
        subtitle={formatDateId(today)}
        onBack={() => goBack(navigate, "/member")}
        backLabel="Kembali"
        showSyncButton={false}
        right={
          recorded > 0 ? (
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={handleResetToday}
              aria-label="Reset hari ini"
              title="Reset hari ini"
              className="border border-surface-border hover:!bg-danger-soft hover:!text-danger hover:!border-danger/30"
            >
              <RefreshCw size={16} />
            </Button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        
        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={14} className="text-accent/80" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                  Streak
                </p>
              </div>
              <p className="text-[34px] font-bold text-accent tabular-nums leading-none tracking-[-0.03em]">
                {streak}
                <span className="text-[16px] font-medium text-accent/70 ml-1">
                  hari
                </span>
              </p>
              <p className="text-[11px] text-accent/70 mt-1.5">
                {streak === 0
                  ? "Mulai catat sholatmu hari ini"
                  : streak < 7
                    ? "Semangat, terus jaga!"
                    : streak < 30
                      ? "Luar biasa, istiqamah!"
                      : "Masya Allah, konsisten sekali!"}
              </p>
            </div>

            <div className="relative w-16 h-16 flex-shrink-0">
              <svg width="64" height="64" className="absolute inset-0 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgb(var(--c-accent) / 0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgb(var(--c-accent))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={
                    2 * Math.PI * 28 * (1 - (recorded / 5))
                  }
                  style={{ transition: "stroke-dashoffset 400ms ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[18px] font-bold text-accent tabular-nums leading-none">
                  {recorded}
                </span>
                <span className="text-[9px] text-accent/70">/5</span>
              </div>
            </div>
          </div>
        </div>

        
        <BadgeSection streak={streak} />

        
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-ios-footnote font-semibold text-surface-text">
              Hari Ini
            </p>
            {complete && (
              <span className="text-ios-caption font-semibold text-success flex items-center gap-1">
                <Check size={12} strokeWidth={2.8} />
                Lengkap
              </span>
            )}
          </div>

          {WAKTU_LIST.map((w) => (
            <WaktuRow
              key={w.key}
              waktu={w.key}
              label={w.label}
              arab={w.arab}
              status={todayEntry[w.key] ?? "belum"}
              onChange={(s) => setStatus(today, w.key, s)}
            />
          ))}
        </section>

        
        {recorded > 0 && (
          <div className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-0.5">
                Tercatat
              </p>
              <p className="text-[22px] font-bold text-surface-text tabular-nums leading-none">
                {recorded}
              </p>
            </div>
            <div className="text-center border-x border-surface-border">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-0.5">
                Tepat
              </p>
              <p className="text-[22px] font-bold text-success tabular-nums leading-none">
                {tepat}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-0.5">
                Sisa
              </p>
              <p className="text-[22px] font-bold text-surface-muted tabular-nums leading-none">
                {5 - recorded}
              </p>
            </div>
          </div>
        )}

        
        <section className="space-y-2.5">
          <p className="text-ios-footnote font-semibold text-surface-text px-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-accent" />
            7 Hari Terakhir
          </p>

          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            {history.map((h, i) => {
              const rec = countRecorded(h.entry);
              const complete2 = isComplete(h.entry);
              return (
                <div
                  key={h.tanggal}
                  className={
                    "flex items-center gap-3 px-4 py-3 " +
                    (i !== history.length - 1
                      ? "border-b border-surface-border"
                      : "")
                  }
                >
                  <div className="w-20 flex-shrink-0">
                    <p className="text-ios-caption font-medium text-surface-text truncate">
                      {i === 0 ? "Hari ini" : formatDateShort(h.tanggal)}
                    </p>
                  </div>

                  <div className="flex-1 flex items-center gap-1">
                    {WAKTU_ORDER.map((k) => {
                      const s = h.entry[k];
                      const info = s ? getStatusInfo(s) : null;
                      return (
                        <div
                          key={k}
                          title={
                            (w_label(k) ?? k) +
                            ": " +
                            (info?.label ?? "Belum")
                          }
                          className={
                            "flex-1 h-6 rounded-md flex items-center justify-center text-[10px] font-bold " +
                            (info
                              ? TONE_BAR[info.tone] +
                                (info.tone === "neutral" ? " text-surface-muted" : " text-white")
                              : "bg-surface-card2 text-surface-muted/50")
                          }
                        >
                          {info?.emoji ?? "·"}
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-10 text-right flex-shrink-0">
                    {complete2 ? (
                      <Check
                        size={14}
                        strokeWidth={2.8}
                        className="text-success ml-auto"
                      />
                    ) : (
                      <span className="text-ios-caption text-surface-muted tabular-nums">
                        {rec}/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-ios-caption text-surface-muted text-center pt-1">
            Streak dihitung dari hari yang lengkap (5 waktu tercatat)
          </p>
        </section>
      </div>
    </AppLayout>
  );
}

function w_label(k: WaktuSholat): string {
  return WAKTU_LIST.find((w) => w.key === k)?.label ?? k;
}


function WaktuRow({
  waktu,
  label,
  arab,
  status,
  onChange,
}: {
  waktu: WaktuSholat;
  label: string;
  arab: string;
  status: StatusSholat;
  onChange: (s: StatusSholat) => void;
}) {
  const currentInfo = getStatusInfo(status);
  const isActive = status !== "belum";

  return (
    <div
      className={
        "rounded-2xl border bg-surface-card overflow-hidden transition-colors duration-200 " +
        (isActive ? "border-accent/25" : "border-surface-border")
      }
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className={
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] font-bold tabular-nums transition-colors duration-200 " +
            (isActive
              ? TONE_BG[currentInfo.tone]
              : "bg-surface-card2 text-surface-muted border border-surface-border")
          }
        >
          {currentInfo.emoji}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-surface-text truncate">
            {label}
          </p>
          <p className="text-ios-caption text-surface-muted truncate">
            {isActive ? currentInfo.label : arab}
          </p>
        </div>
      </div>

      
      <div className="border-t border-surface-border px-3 py-2.5 flex gap-1.5">
        {STATUS_LIST.filter((s) => s.key !== "belum").map((s) => {
          const active = status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onChange(active ? "belum" : s.key)}
              className={
                "flex-1 min-h-[36px] rounded-xl border text-[11px] font-semibold transition-all duration-200 active:scale-[0.96] " +
                (active ? TONE_BG[s.tone] : "bg-surface-card2 text-surface-muted border-surface-border hover:bg-surface-card")
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


function BadgeSection({ streak }: { streak: number }) {
  const dzikir = useDzikirStreak();
  const quran = useQuranStreak();
  const streaks: Streaks = { sholat: streak, dzikir: dzikir.streak, tahfidz: 0, quran: quran.streak };
  const { badges } = useBadges(streaks);

  return <BadgeCollection badges={badges} />;
}
