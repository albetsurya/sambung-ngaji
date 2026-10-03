import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Mosque,
  BookOpen,
  RefreshCw,
  Compass,
  CalendarCheck,
  Heart,
  Sparkles,
  Info,
  ArrowRight,
  ChevronRight,
} from "../components/ui/FontAwesomeIcons";
import { Card } from "../components/ui";
import { MasukButton } from "../components/ui";
import { PrayerTimesCard } from "../features/member/components/PrayerTimesCard";
import { meetingApi } from "../services/domainApi";
import { formatDateLongText } from "../utils/format";
import { MOOD_LIST } from "../features/ai-chat/data/mood";

const FEATURES = [
  { label: "Jadwal", desc: "Pengajian", Icon: Calendar, to: "/member/jadwal" },
  { label: "Petugas Jumat", desc: "Info", Icon: Mosque, to: "/member/petugas-jumat" },
  { label: "Sholat", desc: "Waktu", Icon: CalendarCheck, to: "/member/prayer" },
  { label: "Doa", desc: "Harian", Icon: Heart, to: "/member/doa" },
  { label: "Dzikir", desc: "Counter", Icon: RefreshCw, to: "/member/dzikir" },
  { label: "Quran", desc: "Baca", Icon: BookOpen, to: "/member/quran" },
  { label: "Kiblat", desc: "Arah", Icon: Compass, to: "/member/kiblat" },
  { label: "Puasa", desc: "Sunnah", Icon: Sparkles, to: "/member/puasa" },
  { label: "Panduan", desc: "Bantuan", Icon: Info, to: "/member/panduan" },
];

const MOOD_TEASER_KEYS = ["sedih", "cemas", "syukur", "lelah", "tenang"];

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PublicLandingPage() {
  const navigate = useNavigate();

  const { data: meetings = [] } = useQuery({
    queryKey: ["public-meetings"],
    queryFn: () => meetingApi.list().catch(() => []),
    staleTime: 5 * 60_000,
  });

  const upcoming = useMemo(() => {
    const t = todayIso();
    return meetings
      .filter((m) => m.date >= t && m.status !== "LIBUR")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [meetings]);

  const moods = useMemo(
    () =>
      MOOD_TEASER_KEYS.map((k) => MOOD_LIST.find((m) => m.key === k)).filter(
        (m): m is (typeof MOOD_LIST)[number] => !!m,
      ),
    [],
  );

  return (
    <div className="app-shell min-h-screen bg-surface-bg flex flex-col">
      
      <header className="sticky top-0 z-30 pt-safe border-b border-surface-border backdrop-blur-xl bg-surface-bg/80">
        <div className="flex items-center justify-between h-[52px] px-4 gap-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 min-w-0"
          >
            <span className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Mosque size={16} className="text-white" />
            </span>
            <span className="text-ios-subhead font-bold text-surface-text truncate hidden min-[380px]:block">
              Sambung Ngaji
            </span>
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            <MasukButton />
            <MasukButton variant="secondary" />
          </div>
        </div>
      </header>

      
      <div className="px-4 pt-4">
        <PrayerTimesCard />
      </div>

      
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <p className="text-ios-body font-semibold text-surface-text">
            Gimana perasaanmu hari ini?
          </p>
          <p className="text-ios-caption text-surface-muted mt-0.5 mb-3">
            Ketuk satu, dapatkan ayat dan doa penguatnya
          </p>
          <div className="flex items-center justify-between gap-1">
            {moods.map((m) => (
              <button
                key={m.key}
                onClick={() => navigate("/member/mood")}
                className="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all active:scale-90 hover:bg-surface-card2"
                aria-label={m.label}
              >
                <span className="text-[26px] leading-none">{m.emoji}</span>
                <span className="text-[10px] text-surface-muted font-medium">
                  {m.label}
                </span>
              </button>
            ))}
            <button
              onClick={() => navigate("/member/mood")}
              aria-label="Lihat semua"
              className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 transition-all active:scale-90"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      
      {upcoming.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <p className="text-ios-footnote font-medium text-surface-muted">
              Pengajian terdekat
            </p>
            <button
              onClick={() => navigate("/member/jadwal")}
              className="text-ios-footnote font-semibold text-accent transition-all active:scale-95"
            >
              Semua
            </button>
          </div>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <Card key={m.meeting_id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-ios-subhead font-bold text-accent leading-none tabular-nums">
                    {new Date(m.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ios-subhead text-surface-text truncate">
                    {m.event || "Pengajian"}
                  </p>
                  <p className="text-ios-caption text-surface-muted truncate">
                    {m.day} · {formatDateLongText(m.date)}
                    {m.time ? ` · ${m.time}` : ""}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      
      <div className="px-4 py-4">
        <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
          Fitur umum
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map((f) => {
            const Icon = f.Icon;
            return (
              <button
                key={f.to}
                onClick={() => navigate(f.to)}
                className="rounded-2xl border border-surface-border bg-surface-card p-3.5 flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97] hover:bg-surface-card2"
              >
                <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent">
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-ios-footnote font-semibold text-surface-text truncate">
                    {f.label}
                  </span>
                  <span className="block text-ios-caption text-surface-muted truncate">
                    {f.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 rounded-2xl border border-accent/30 bg-accent-soft p-3.5 flex items-center justify-center gap-2 text-ios-body font-semibold text-accent transition-all active:scale-[0.99]"
        >
          Masuk untuk absensi dan data pribadi
          <ArrowRight size={16} />
        </button>
        <p className="text-ios-caption text-surface-muted text-center pt-4 pb-3">
          Sambung Ngaji · v1.0.0
        </p>
      </div>
    </div>
  );
}
