import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import {
  Calendar,
  Sparkles,
  ChevronDown,
  Info,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  formatDateShort,
  formatDayName,
  formatRelative,
  type PuasaDay,
  type PuasaInfo,
} from "../data/puasa";
import { usePuasaSchedule } from "../hooks/usePuasaSchedule";

const TONE_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  accent: {
    bg: "bg-accent-soft",
    text: "text-accent",
    border: "border-accent/30",
  },
  success: {
    bg: "bg-success-soft",
    text: "text-success",
    border: "border-success/30",
  },
  warning: {
    bg: "bg-warning-soft",
    text: "text-warning",
    border: "border-warning/30",
  },
};

export default function MemberPuasaPage() {
  const navigate = useNavigate();
  const { puasaDays, today, nextPuasa, nextPuasaDays } = usePuasaSchedule(60);
  const [showAll, setShowAll] = useState(false);

  const previewDays = showAll ? puasaDays : puasaDays.slice(0, 10);

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Puasa Sunnah"
        subtitle="Jadwal 60 hari ke depan"
        onBack={() => goBack(navigate, "/member")}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Hero: Puasa berikutnya */}
        {nextPuasa ? (
          <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 px-5 py-5">
            <div
              className="absolute -right-12 -top-12 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "rgb(var(--c-accent) / 0.08)" }}
            />

            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={13} className="text-accent/80" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                  {nextPuasaDays === 0
                    ? "Hari ini"
                    : nextPuasaDays === 1
                      ? "Besok"
                      : "Puasa Berikutnya"}
                </p>
              </div>

              <p className="text-ios-body font-semibold text-accent mb-1">
                {nextPuasa.puasaList.map((p) => p.nama).join(" + ")}
              </p>

              <p className="text-[12px] text-accent/70">
                {formatDayName(nextPuasa.date)},{" "}
                {formatDateShort(nextPuasa.date)}
                {nextPuasa.hijri && (
                  <span className="ml-1">
                    · {nextPuasa.hijri.day} {nextPuasa.hijri.monthName}{" "}
                    {nextPuasa.hijri.year} H
                  </span>
                )}
              </p>

              {nextPuasaDays > 0 && (
                <div className="mt-3 pt-3 border-t border-accent/15 flex items-baseline gap-2">
                  <span className="text-[28px] font-bold text-accent tabular-nums leading-none">
                    {nextPuasaDays}
                  </span>
                  <span className="text-[12px] font-medium text-accent/70">
                    hari lagi
                  </span>
                </div>
              )}

              {nextPuasa.puasaList[0]?.keutamaan && (
                <p className="text-[11px] text-accent/80 mt-3 leading-relaxed">
                  {nextPuasa.puasaList[0].keutamaan}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-surface-border bg-surface-card px-5 py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-3">
              <Calendar size={22} className="text-accent" />
            </div>
            <p className="text-ios-body font-medium text-surface-text mb-1">
              Tidak ada puasa dalam 60 hari ke depan
            </p>
            <p className="text-ios-footnote text-surface-muted">
              Cek kembali nanti
            </p>
          </div>
        )}

        {/* Info hari ini */}
        {today.puasaList.length > 0 && (
          <div className="rounded-2xl border border-success/20 bg-success-soft/60 px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-success mb-1">
              Hari Ini
            </p>
            <p className="text-ios-body font-semibold text-surface-text">
              {today.puasaList.map((p) => p.nama).join(" + ")}
            </p>
            <p className="text-ios-caption text-surface-text/70 mt-1 leading-relaxed">
              {today.puasaList[0]?.deskripsi}
            </p>
          </div>
        )}

        {/* List puasa */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-ios-footnote font-semibold text-surface-text">
              Jadwal Puasa
            </p>
            <span className="text-ios-caption text-surface-muted">
              {puasaDays.length} hari
            </span>
          </div>

          {puasaDays.length === 0 && (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
              <p className="text-ios-footnote text-surface-muted">
                Tidak ada jadwal puasa
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            {previewDays.map((day) => (
              <PuasaCard key={day.iso} day={day} />
            ))}
          </div>

          {puasaDays.length > 10 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full min-h-[44px] rounded-2xl border border-surface-border bg-surface-card hover:bg-surface-card2 flex items-center justify-center gap-2 text-ios-subhead font-medium text-accent transition-all active:scale-[0.98]"
            >
              <span>
                {showAll
                  ? "Tampilkan Lebih Sedikit"
                  : "Lihat Semua (" + puasaDays.length + ")"}
              </span>
              <ChevronDown
                size={16}
                className={
                  "transition-transform duration-200 " +
                  (showAll ? "rotate-180" : "")
                }
              />
            </button>
          )}
        </section>

        {/* Info sumber */}
        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5 flex items-start gap-2.5">
          <Info
            size={14}
            className="text-surface-muted flex-shrink-0 mt-0.5"
          />
          <p className="text-ios-caption text-surface-muted leading-relaxed">
            Jadwal berdasarkan kalender Hijriah (Umm al-Qura). Awal bulan
            Hijriah bisa berbeda ±1 hari tergantung metode hisab/rukyat yang
            dipakai. Ikuti ketetapan pemerintah setempat.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Puasa Card                                    */
/* -------------------------------------------------------------------------- */

function PuasaCard({ day }: { day: PuasaDay }) {
  const isToday = day.dayOffset === 0;
  const isTomorrow = day.dayOffset === 1;

  return (
    <div
      className={
        "rounded-2xl border bg-surface-card overflow-hidden transition-all duration-200 " +
        (isToday
          ? "border-success/40 shadow-sm shadow-success/10"
          : "border-surface-border")
      }
    >
      {/* Header: tanggal */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div
          className={
            "w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 " +
            (isToday
              ? "bg-success text-white"
              : isTomorrow
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent")
          }
        >
          <span className="text-[16px] font-bold leading-none tabular-nums">
            {day.date.getDate()}
          </span>
          <span
            className={
              "text-[9px] font-semibold uppercase mt-0.5 " +
              (isToday ? "text-white/80" : isTomorrow ? "text-white/80" : "text-accent/70")
            }
          >
            {formatDayName(day.date).slice(0, 3)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {(isToday || isTomorrow) && (
              <span
                className={
                  "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full " +
                  (isToday
                    ? "bg-success text-white"
                    : "bg-accent text-white")
                }
              >
                {isToday ? "Hari ini" : "Besok"}
              </span>
            )}
            <p className="text-ios-footnote text-surface-muted truncate">
              {formatDateShort(day.date)}
            </p>
          </div>

          {day.hijri && (
            <p className="text-ios-caption text-surface-muted truncate">
              {day.hijri.day} {day.hijri.monthName} {day.hijri.year} H
            </p>
          )}
        </div>
      </div>

      {/* Puasa labels */}
      <div className="border-t border-surface-border px-4 py-3 space-y-2">
        {day.puasaList.map((p) => (
          <PuasaLabel key={p.key} puasa={p} />
        ))}
      </div>
    </div>
  );
}

function PuasaLabel({ puasa }: { puasa: PuasaInfo }) {
  const tone = TONE_STYLE[puasa.tone] ?? TONE_STYLE.accent;
  return (
    <div
      className={
        "rounded-xl border " + tone.border + " " + tone.bg + " px-3 py-2"
      }
    >
      <p className={"text-ios-footnote font-semibold " + tone.text}>
        {puasa.nama}
      </p>
      <p className="text-ios-caption text-surface-text/70 mt-0.5 leading-relaxed">
        {puasa.deskripsi}
      </p>
    </div>
  );
}
