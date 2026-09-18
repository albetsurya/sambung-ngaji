import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ChevronRight } from "../common/FontAwesomeIcons";
import {
  getNextPrayer,
  getPrayerTimesForDate,
  getCurrentPrayer,
  LATUKAN_LABEL,
} from "../../utils/prayerTimes";

interface PrayerTimesCardProps {
  /** Kalau tidak di-override, klik akan navigate ke /member/prayer */
  onClick?: () => void;
  /** Path tujuan saat klik (default: /member/prayer) */
  to?: string;
}

/**
 * Card yang menampilkan:
 * - Waktu sholat berikutnya + countdown live (update tiap detik)
 * - 5 waktu sholat hari ini (highlight yang sedang aktif)
 * - Lokasi
 */
export function PrayerTimesCard({ onClick, to = "/member/prayer" }: PrayerTimesCardProps) {
  const navigate = useNavigate();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleClick() {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  }

  const next = getNextPrayer(now);
  const current = getCurrentPrayer(now);
  const today = getPrayerTimesForDate(now);

  // Hanya tampilkan waktu sholat wajib (skip sunrise)
  const wajib = today.prayers.filter((p) => p.key !== "sunrise");

  return (
    <button
      onClick={handleClick}
      className="w-full text-left rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 shadow-sm overflow-hidden transition-all active:scale-[0.99] hover:shadow-md"
    >
      {/* Header: lokasi + countdown */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={12} className="text-accent/70" />
          <p className="text-[11px] font-medium text-accent/70 truncate">
            {LATUKAN_LABEL}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-accent/70 uppercase tracking-wide mb-1">
              Menuju {next.prayer.label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-[32px] font-bold text-accent tabular-nums leading-none tracking-[-0.02em]">
                {next.remainingFormatted}
              </p>
            </div>
            <p className="text-[11px] text-accent/70 mt-1.5">
              Pukul {next.prayer.timeFormatted} WIB
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-accent/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-accent" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-accent/10" />

      {/* 5 waktu sholat */}
      <div className="px-4 py-3 flex items-center justify-between gap-1">
        {wajib.map((p) => {
          const isCurrent = current === p.key;
          const isNext = next.prayer.key === p.key;
          return (
            <div
              key={p.key}
              className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 rounded-xl transition-colors ${
                isCurrent
                  ? "bg-accent text-white shadow-sm"
                  : isNext
                    ? "bg-accent/15 text-accent"
                    : "text-accent/70"
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isCurrent ? "text-white/80" : ""
                }`}
              >
                {p.label}
              </span>
              <span
                className={`text-[13px] font-bold tabular-nums ${
                  isCurrent ? "text-white" : ""
                }`}
              >
                {p.timeFormatted}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 pb-3 flex items-center justify-end gap-1 text-[11px] text-accent/70">
        <span>Lihat jadwal lengkap</span>
        <ChevronRight size={12} />
      </div>
    </button>
  );
}
