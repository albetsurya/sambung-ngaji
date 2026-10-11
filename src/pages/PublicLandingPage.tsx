import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  RefreshCw,
  Compass,
  CalendarCheck,
  ClipboardList,
  CloudRain,
  CircleAlert,
  GraduationCap,
  Heart,
  Moon,
  Mosque,
  ScrollText,
  Sparkles,
  Info,
  ArrowRight,
  ChevronRight,
} from "../components/ui/FontAwesomeIcons";
import { PrayerTimesCard } from "../features/member/components/PrayerTimesCard";
import { MOOD_LIST } from "../features/ai-chat/data/mood";

const FEATURES = [
  { label: "Ngaji Ceria", desc: "Tilawati", Icon: GraduationCap, to: "/member/ngaji-ceria" },
  { label: "Quran", desc: "Baca", Icon: BookOpen, to: "/member/quran" },
  { label: "Sholat", desc: "Waktu", Icon: CalendarCheck, to: "/member/prayer" },
  { label: "Jurnal Sholat", desc: "Catatan", Icon: ClipboardList, to: "/member/ibadah" },
  { label: "Jurnal Tahfidz", desc: "Hafalan", Icon: ScrollText, to: "/member/tahfidz" },
  { label: "Doa", desc: "Harian", Icon: Heart, to: "/member/doa" },
  { label: "Dzikir", desc: "Counter", Icon: RefreshCw, to: "/member/dzikir" },
  { label: "Kiblat", desc: "Arah", Icon: Compass, to: "/member/kiblat" },
  { label: "Puasa", desc: "Sunnah", Icon: Sparkles, to: "/member/puasa" },
  { label: "Panduan", desc: "Bantuan", Icon: Info, to: "/member/panduan" },
];

const MOOD_TEASER_KEYS = ["sedih", "cemas", "syukur", "lelah", "tenang"];
const MOOD_ICONS: Record<string, typeof Heart> = {
  sedih: CloudRain,
  cemas: CircleAlert,
  syukur: Heart,
  lelah: Moon,
  tenang: Compass,
};
const MOODS = MOOD_TEASER_KEYS.map((key) =>
  MOOD_LIST.find((mood) => mood.key === key),
).filter(
  (mood): mood is (typeof MOOD_LIST)[number] => !!mood,
);

export default function PublicLandingPage() {
  const navigate = useNavigate();

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
            <button
              onClick={() => navigate("/login?intent=member")}
              className="h-8 px-3 rounded-xl bg-accent text-white text-[13px] font-semibold whitespace-nowrap transition-all active:scale-[0.97]"
            >
              Member
            </button>
            <button
              onClick={() => navigate("/login?intent=ceria")}
              className="h-8 px-3 rounded-xl border border-surface-border bg-surface-card text-surface-text text-[13px] font-semibold whitespace-nowrap transition-all hover:bg-surface-card2 active:scale-[0.97]"
            >
              Ngaji Ceria
            </button>
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
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => navigate("/member/mood")}
                className="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all active:scale-90 hover:bg-surface-card2"
                aria-label={m.label}
              >
                <span className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                  {(() => {
                    const MoodIcon = MOOD_ICONS[m.key] ?? Heart;
                    return <MoodIcon size={18} />;
                  })()}
                </span>
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
          onClick={() => navigate("/login?intent=member")}
          className="w-full mt-4 rounded-2xl border border-accent/30 bg-accent-soft p-3.5 flex items-center justify-center gap-2 text-ios-body font-semibold text-accent transition-all active:scale-[0.99]"
        >
          Masuk sebagai Member Jamaah
          <ArrowRight size={16} />
        </button>
        <p className="text-ios-caption text-surface-muted text-center pt-4 pb-3">
          Sambung Ngaji · v1.0.0
        </p>
      </div>
    </div>
  );
}
