import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  RefreshCw,
  Compass,
  CalendarCheck,
  ClipboardList,
  Heart,
  ScrollText,
  Sparkles,
  Info,
  ChevronRight,
} from "../components/ui/FontAwesomeIcons";
import { PrayerTimesCard } from "../features/member/components/PrayerTimesCard";
import { AppLogoIcon } from "../components/ui/AppLogoIcon";
import { MOOD_LIST } from "../features/ai-chat/data/mood";
import { MoodIcon } from "../features/ai-chat/components/MoodIcon";
import { NGAJI_CERIA_ASSETS } from "../features/ngaji-ceria/data/assets";
import { useAuth } from "../contexts/AuthContext";
import { Avatar } from "../components/ui";
import { ProfileMenuSheet } from "../components/layout/ProfileMenuSheet";

const FEATURES = [
  { label: "Quran", desc: "Baca", Icon: BookOpen, to: "/member/quran" },
  { label: "Sholat", desc: "Waktu", Icon: CalendarCheck, to: "/member/prayer" },
  {
    label: "Jurnal Sholat",
    desc: "Catatan",
    Icon: ClipboardList,
    to: "/member/ibadah",
  },
  {
    label: "Jurnal Tahfidz",
    desc: "Hafalan",
    Icon: ScrollText,
    to: "/member/tahfidz",
  },
  { label: "Doa", desc: "Harian", Icon: Heart, to: "/member/doa" },
  { label: "Dzikir", desc: "Counter", Icon: RefreshCw, to: "/member/dzikir" },
  { label: "Kiblat", desc: "Arah", Icon: Compass, to: "/member/kiblat" },
  { label: "Puasa", desc: "Sunnah", Icon: Sparkles, to: "/member/puasa" },
  { label: "Panduan", desc: "Bantuan", Icon: Info, to: "/member/panduan" },
];

const MOOD_TEASER_KEYS = ["sedih", "cemas", "syukur", "lelah", "tenang"];
const MOODS = MOOD_TEASER_KEYS.map((key) =>
  MOOD_LIST.find((mood) => mood.key === key),
).filter((mood): mood is (typeof MOOD_LIST)[number] => !!mood);

const MOOD_TEASER_LABEL: Partial<Record<string, string>> = {
  tenang: "Tenang",
};

export default function PublicLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const isAuthenticated = Boolean(user);

  return (
    <div className="app-shell min-h-screen bg-surface-bg flex flex-col">
      <header className="sticky top-0 z-30 pt-safe border-b border-surface-border backdrop-blur-xl bg-surface-bg/80">
        <div className="flex items-center justify-between h-[52px] px-4 gap-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 min-w-0"
          >
            <AppLogoIcon size={32} />
            <span className="text-ios-subhead font-bold text-surface-text truncate hidden min-[380px]:block">
              Sambung Ngaji
            </span>
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                aria-label="Buka menu profil"
                className="rounded-full p-0.5 ring-2 ring-accent/20 transition hover:ring-accent/50 active:scale-95"
              >
                <Avatar
                  src={user.photo_url}
                  name={user.name || user.username}
                  size={34}
                  gender={user.gender === "P" ? "P" : "L"}
                />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="h-8 px-3.5 rounded-xl bg-accent text-white text-[13px] font-semibold whitespace-nowrap transition-all active:scale-[0.97] shadow-sm shadow-accent/20"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        <PrayerTimesCard />
      </div>

      <div className="px-4 pt-3">
        <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
              <Heart size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-ios-body font-bold text-surface-text">
                Tenangkan Hati
              </p>
              <p className="text-ios-caption text-surface-muted mt-0.5">
                Pilih perasaanmu, temukan penguat.
              </p>
            </div>
            <button
              onClick={() => navigate("/member/mood")}
              aria-label="Lihat semua"
              className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-md shadow-accent/25 transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="relative flex items-center justify-between gap-1 mt-3.5">
            {MOODS.map((m, idx) => (
              <button
                key={m.key}
                onClick={() => navigate("/member/mood")}
                className="group flex-1 min-w-0 flex flex-col items-center gap-1.5 rounded-2xl py-1.5 transition-all duration-300 active:scale-90 hover:bg-surface-card2"
                style={{ animationDelay: `${idx * 60}ms` }}
                aria-label={m.label}
              >
                <span className="relative flex h-11 w-11 items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <span className="absolute inset-0 rounded-full bg-accent/0 blur-lg transition-all duration-300 group-hover:bg-accent/20" />
                  <MoodIcon
                    mood={m.key}
                    size={40}
                    className="relative drop-shadow-sm"
                  />
                </span>
                <span className="w-full text-center text-[10px] leading-none whitespace-nowrap tracking-tight text-surface-muted font-semibold transition-colors group-hover:text-accent">
                  {MOOD_TEASER_LABEL[m.key] ?? m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("trigger_ngaji_ceria_splash", "true");
            navigate("/member/ngaji-ceria");
          }}
          className="group relative w-full overflow-hidden rounded-3xl border-2 border-[#FCD882] dark:border-[#6B4A1E] bg-[#FFF9ED] dark:bg-[#2A2418] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
        >
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FFCB45]/25 dark:bg-[#FFCB45]/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 p-2 shadow-sm ring-1 ring-[#FCD882] dark:ring-[#6B4A1E]">
              <img
                src={NGAJI_CERIA_ASSETS.iconGames}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain transition-transform group-hover:rotate-6 group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-ios-body font-black text-[#5A3A2A] dark:text-[#F5DDB5]">
                  Ngaji Ceria
                </h2>
                {!isAuthenticated && (
                  <span className="rounded-full bg-white/80 dark:bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#F58A3A] dark:text-[#FFA860]">
                    Mode Tamu
                  </span>
                )}
              </div>
              <p className="mt-1 text-ios-caption leading-relaxed text-[#8C7A68] dark:text-[#B8A898]">
                Belajar Tilawati, main game edukatif, dan bangun kebiasaan
                ngaji.
              </p>
            </div>
            <ChevronRight
              size={18}
              className="shrink-0 text-[#F58A3A] dark:text-[#FFA860] transition-transform group-hover:translate-x-1"
            />
          </div>
          {!isAuthenticated && (
            <p className="relative mt-3 border-t border-[#FCD882]/60 dark:border-[#6B4A1E]/60 pt-2 text-[10px] font-semibold text-[#A47635] dark:text-[#D4B078]">
              Bisa dicoba tanpa login · fitur lanjutan terbuka setelah masuk
            </p>
          )}
        </button>
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
        {!isAuthenticated && (
          <button
            onClick={() => navigate("/login?intent=member")}
            className="w-full mt-4 rounded-2xl border border-accent/30 bg-accent-soft p-3.5 flex items-center justify-center gap-2 text-ios-body font-semibold text-accent transition-all active:scale-[0.99]"
          >
            Masuk sebagai Member Jamaah
          </button>
        )}
        <p className="text-ios-caption text-surface-muted text-center pt-4 pb-3">
          Sambung Ngaji · v1.0.0
        </p>
      </div>
      {user && (
        <ProfileMenuSheet
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          profilePath="/member/ngaji-ceria/profile"
          logoutRedirect="/"
        />
      )}
    </div>
  );
}
