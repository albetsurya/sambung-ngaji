import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { useToast } from "../contexts/ToastContext";
import {
  getPrayerTimesForDate,
  getNextPrayer,
  getCurrentPrayer,
  getMonthlySchedule,
  getSunnahTimes,
  LATUKAN_LABEL,
  type PrayerDay,
  type PrayerKey,
  type SunnahTimeInfo,
} from "../utils/prayerTimes";

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function MemberPrayerPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [now, setNow] = useState<Date>(() => new Date());
  const [copied, setCopied] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);

  // Update tiap detik
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = useMemo(() => getPrayerTimesForDate(now), []);
  const next = getNextPrayer(now);
  const current = getCurrentPrayer(now);
  const sunnah = useMemo(() => getSunnahTimes(now), []);
  const hijri = formatHijri(now);

  async function handleShare() {
    const lines = today.prayers
      .filter((p) => p.key !== "sunrise")
      .map((p) => `${p.label.padEnd(8, " ")}: ${p.timeFormatted}`);
    const text = [
      `🕌 Waktu Sholat · ${LATUKAN_LABEL}`,
      `${formatDateId(now)}`,
      ``,
      ...lines,
      ``,
      `Sumber: Sambung Ngaji`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Waktu Sholat", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast("Jadwal disalin");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share — diabaikan
    }
  }

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Waktu Sholat"
        subtitle={LATUKAN_LABEL}
        onBack={() => navigate("/member")}
        backLabel="Home"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* --------------------- Hero: countdown besar --------------------- */}
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 shadow-sm p-5">
          <div
            className="absolute -right-12 -top-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "rgb(var(--c-accent) / 0.08)" }}
          />

          <div className="relative">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={12} className="text-accent/70" />
              <p className="text-[11px] font-medium text-accent/70 truncate">
                {LATUKAN_LABEL}
              </p>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/70 mb-1.5">
              Menuju {next.prayer.label}
            </p>

            <p className="text-[44px] font-bold text-accent tabular-nums leading-none tracking-[-0.03em]">
              {next.remainingFormatted}
            </p>

            <p className="text-ios-footnote text-accent/80 mt-2">
              Pukul{" "}
              <span className="font-semibold text-accent">
                {next.prayer.timeFormatted}
              </span>{" "}
              WIB
            </p>

            <div className="mt-4 pt-4 border-t border-accent/15 flex items-center justify-between text-[11px] text-accent/70">
              <span>{formatDateId(now)}</span>
              <span className="font-medium">{hijri}</span>
            </div>
          </div>
        </div>

        {/* ---------------------- 5 waktu sholat hari ini --------------------- */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <p className="text-ios-footnote font-semibold text-surface-text">
              Hari Ini
            </p>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-ios-caption font-medium text-accent hover:text-accent-dark transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Tersalin" : "Bagikan"}
            </button>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            {today.prayers
              .filter((p) => p.key !== "sunrise")
              .map((p, i, arr) => {
                const isCurrent = current === p.key;
                const isNext = next.prayer.key === p.key;
                return (
                  <div
                    key={p.key}
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      i !== arr.length - 1
                        ? "border-b border-surface-border"
                        : ""
                    } ${isCurrent ? "bg-accent/5" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-accent text-white shadow-sm"
                          : isNext
                            ? "bg-accent-soft text-accent"
                            : "bg-surface-card2 text-surface-muted"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide ${
                          isCurrent ? "text-white" : ""
                        }`}
                      >
                        {p.label.slice(0, 3)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-ios-body font-medium ${
                          isCurrent ? "text-accent" : "text-surface-text"
                        }`}
                      >
                        {p.label}
                      </p>
                      <p className="text-ios-caption text-surface-muted">
                        {p.arabic}
                        {isCurrent && " · waktu aktif"}
                        {isNext && !isCurrent && " · berikutnya"}
                      </p>
                    </div>

                    <p
                      className={`text-ios-body font-semibold tabular-nums ${
                        isCurrent ? "text-accent" : "text-surface-text"
                      }`}
                    >
                      {p.timeFormatted}
                    </p>
                  </div>
                );
              })}
          </div>

        </section>

        {/* ---------------------- Waktu Sunnah & Info ---------------------- */}
        <section>
          <p className="text-ios-footnote font-semibold text-surface-text mb-2.5 px-1">
            Waktu Sunnah & Info
          </p>

          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            <SunnahRow info={sunnah.syuruq} />
            <SunnahRow info={sunnah.dhuha} />
            <SunnahRow info={sunnah.nisfulLail} last />
          </div>

          <p className="text-ios-caption text-surface-muted mt-2 px-1 leading-relaxed">
            Syuruq & Dhuha untuk panduan sholat sunnah pagi. Nisful Lail
            (pertengahan malam) jadi batas akhir sholat Isya.
          </p>
        </section>

        {/* ---------------------- Qiyamul Lail (1/3 akhir) ---------------------- */}
        <section>
          <p className="text-ios-footnote font-semibold text-surface-text mb-2.5 px-1">
            Qiyamul Lail
          </p>

          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0">
                <span className="text-[16px] font-bold tabular-nums">
                  {sunnah.sepertigaAkhir.timeFormatted.slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-body font-medium text-accent">
                  {sunnah.sepertigaAkhir.label}
                </p>
                <p
                  className="text-accent/70 truncate"
                  style={{
                    fontFamily:
                      '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                    fontSize: "16px",
                  }}
                >
                  {sunnah.sepertigaAkhir.arabic}
                </p>
                <p className="text-ios-caption text-accent/70 mt-0.5">
                  {sunnah.sepertigaAkhir.description}
                </p>
              </div>
              <p className="text-ios-body font-semibold text-accent tabular-nums flex-shrink-0">
                {sunnah.sepertigaAkhir.timeFormatted}
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------- Jadwal Sebulan (collapsible) ---------------------- */}
        <section>
          <button
            onClick={() => setShowMonthly((v) => !v)}
            className="w-full flex items-center justify-between gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3.5 transition-all hover:bg-surface-card2 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
                <Calendar size={16} />
              </span>
              <div className="text-left">
                <p className="text-ios-body font-medium text-surface-text">
                  Jadwal Sebulan
                </p>
                <p className="text-ios-caption text-surface-muted">
                  {formatMonthId(now)}
                </p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-surface-muted flex-shrink-0 transition-transform ${
                showMonthly ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMonthly && <MonthlyTable now={now} />}
        </section>

        {/* ---------------------- Info Kemenag ---------------------- */}
        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5">
          <p className="text-ios-caption text-surface-muted leading-relaxed">
            Perhitungan mengikuti metode <strong>Kemenag RI</strong> (Fajr 20°,
            Isha 18°, madzhab Syafi'i, ihtiyati +2 menit). Selisih
            ±2 menit dari jadwal resmi adalah wajar.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Sunnah Row                                     */
/* -------------------------------------------------------------------------- */

function SunnahRow({
  info,
  last = false,
}: {
  info: SunnahTimeInfo;
  last?: boolean;
}) {
  const icons: Record<string, string> = {
    syuruq: "☀️",
    dhuha: "🌤️",
    nisfulLail: "🌙",
  };

  return (
    <div
      className={
        "flex items-center gap-3 px-4 py-3.5 " +
        (last ? "" : "border-b border-surface-border")
      }
    >
      <div className="w-10 h-10 rounded-xl bg-surface-card2 flex items-center justify-center flex-shrink-0">
        <span className="text-[18px] leading-none">
          {icons[info.key] || "•"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-ios-body font-medium text-surface-text">
          {info.label}
        </p>
        <p className="text-ios-caption text-surface-muted truncate">
          {info.description}
        </p>
      </div>

      <p className="text-ios-body font-semibold text-surface-text tabular-nums flex-shrink-0">
        {info.timeFormatted}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Monthly Table                                 */
/* -------------------------------------------------------------------------- */

function MonthlyTable({ now }: { now: Date }) {
  const schedule = useMemo(
    () => getMonthlySchedule(now.getFullYear(), now.getMonth()),
    [now.getFullYear(), now.getMonth()],
  );

  const todayIso = formatIso(now);

  return (
    <div className="mt-2 rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr] px-3 py-2.5 bg-surface-card2/50 border-b border-surface-border">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
          Tgl
        </span>
        {(["Subuh", "Dzuhur", "Ashar", "Magrib", "Isya"] as const).map((l) => (
          <span
            key={l}
            className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted text-center"
          >
            {l}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {schedule.map((day) => {
          const isToday = formatIso(day.date) === todayIso;
          const wajib = day.prayers.filter((p) => p.key !== "sunrise");
          return (
            <div
              key={formatIso(day.date)}
              className={`grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr] px-3 py-2 border-b border-surface-border last:border-b-0 items-center ${
                isToday ? "bg-accent/5" : ""
              }`}
            >
              <span
                className={`text-ios-footnote font-semibold tabular-nums ${
                  isToday ? "text-accent" : "text-surface-text"
                }`}
              >
                {day.date.getDate()}
              </span>
              {wajib.map((p) => (
                <span
                  key={p.key}
                  className={`text-[11px] tabular-nums text-center ${
                    isToday ? "text-accent" : "text-surface-muted"
                  }`}
                >
                  {p.timeFormatted}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Format Helpers                                */
/* -------------------------------------------------------------------------- */

function formatIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateId(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

function formatMonthId(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

function formatHijri(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}
