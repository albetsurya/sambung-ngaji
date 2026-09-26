import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScrollText,
  Sparkles,
  RefreshCw,
  Calendar,
  CalendarCheck,
  Heart,
  Compass,
  BookOpen,
  ChevronRight,
  Trophy,
} from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
  FloatingActionGroup,
} from "../components/layout/AppLayout";
import { ProfileMenuSheet } from "../components/layout/ProfileMenuSheet";
import { Avatar } from "../components/common";
import { MeetingCardSkeleton } from "../components/common/Skeleton";
import { PrayerTimesCard } from "../components/member/PrayerTimesCard";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { meetingApi } from "../services/domainApi";
import { memberSelfApi } from "../services/memberSelfApi";
import { queryKeys } from "../lib/queryClient";
import type { Meeting, MemberCategory } from "../types";
import { normalizeGender } from "../utils/format";


type Tone = "accent" | "success" | "warning" | "info" | "danger";

interface QuickItem {
  key: string;
  label: string;
  Icon: (props: { size?: number; className?: string }) => ReactNode;
  to: string;
  tone: Tone;
}


const QUICK_ITEMS: QuickItem[] = [
  { key: "quran",   label: "Al-Quran",   Icon: ScrollText,    to: "/member/quran",         tone: "accent" },
  { key: "doa",     label: "Doa",        Icon: Sparkles,      to: "/member/doa",           tone: "warning" },
  { key: "dzikir",  label: "Dzikir",     Icon: RefreshCw,     to: "/member/dzikir",        tone: "success" },
  { key: "sholat",  label: "Sholat",     Icon: Calendar,      to: "/member/prayer",        tone: "info" },
  { key: "jurnal",  label: "Jurnal",     Icon: CalendarCheck, to: "/member/sholat-jurnal", tone: "accent" },
  { key: "tahfidz", label: "Tahfidz",    Icon: BookOpen,      to: "/member/tahfidz",       tone: "success" },
  { key: "kiblat",  label: "Kiblat",     Icon: Compass,       to: "/member/kiblat",        tone: "info" },
  { key: "mood",    label: "Tenangkan",  Icon: Heart,         to: "/member/mood",          tone: "danger" },
];

const TONE_BG: Record<Tone, string> = {
  accent:  "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info:    "bg-info-soft text-info",
  danger:  "bg-danger-soft text-danger",
};


function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

function formatScheduleDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return iso;
  }
}


export default function MemberHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const greeting = getGreeting();
  const displayName = user?.nama || "Jamaah";
  const isNonMember = !!user?.role && user.role !== "MEMBER";

  const { data: selfDashboard } = useQuery({
    queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
    queryFn: () => memberSelfApi.getDashboard(),
    enabled: !!user?.user_id,
    staleTime: 5 * 60_000,
  });

  const userKategori = selfDashboard?.profile?.kategori as
    | MemberCategory
    | undefined;

  return (
    <AppLayout
      showAiChat={false}
      fab={
        <FloatingActionGroup>
          <FloatingActionButton
            onClick={() => navigate("/member/ai")}
            label="Tanya AI"
            variant="secondary"
            icon={<Sparkles size={18} strokeWidth={2.2} />}
          />
        </FloatingActionGroup>
      }
    >
      <Header
        title="Assalamu'alaikum"
        subtitle={
          isNonMember
            ? `${greeting}, ${displayName} · Mode Jamaah`
            : `${greeting}, ${displayName}`
        }
        showSyncButton={false}
        right={
          <button
            onClick={() => setProfileMenuOpen(true)}
            aria-label="Menu profil"
            className="rounded-full overflow-hidden transition-all hover:opacity-80 active:scale-95"
          >
            <Avatar
              src={user?.foto_url}
              name={user?.nama || "?"}
              size={32}
              gender={normalizeGender(user?.jenis_kelamin)}
            />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-5 pb-8">
        
        <PrayerTimesCard />

        
        <SchedulePreviewCard
          userKategori={userKategori}
          onSeeAll={() => navigate("/member/jadwal")}
        />

        
        <section>
          <p className="px-1 mb-3 text-ios-footnote font-semibold text-surface-text">
            Perkembangan Saya
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate("/member/progres")}
              className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card p-3.5 text-left transition-all active:scale-[0.98] hover:bg-surface-card2 hover:border-accent/30"
            >
              <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                <Trophy size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-ios-body font-medium text-surface-text">
                  Progres
                </span>
                <span className="block text-ios-caption text-surface-muted truncate">
                  Streak & badge
                </span>
              </span>
            </button>
            <button
              onClick={() => navigate("/member/absensi")}
              className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card p-3.5 text-left transition-all active:scale-[0.98] hover:bg-surface-card2 hover:border-accent/30"
            >
              <span className="w-10 h-10 rounded-xl bg-success-soft text-success flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-ios-body font-medium text-surface-text">
                  Absensi
                </span>
                <span className="block text-ios-caption text-surface-muted truncate">
                  Rekap kehadiran
                </span>
              </span>
            </button>
          </div>
        </section>

        
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <p className="text-ios-footnote font-semibold text-surface-text">
              Sering Dipakai
            </p>
            <button
              onClick={() => navigate("/member/lainnya")}
              className="flex items-center gap-1 text-ios-caption font-medium text-accent transition-colors hover:text-accent-dark"
            >
              Lihat semua
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ITEMS.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.to)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-surface-border bg-surface-card p-3 min-h-[88px] transition-all active:scale-[0.97] hover:bg-surface-card2 hover:border-accent/30"
                >
                  <span
                    className={
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " +
                      TONE_BG[item.tone]
                    }
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-[11px] font-medium text-center leading-tight text-surface-text">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        
        <button
          onClick={() => navigate("/member/lainnya")}
          className="w-full rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3 transition-all active:scale-[0.99] hover:bg-surface-card2"
        >
          <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-ios-body font-medium text-surface-text">
              Menu Lengkap
            </p>
            <p className="text-ios-caption text-surface-muted truncate">
              Puasa, backup data, pengaturan, & lainnya
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-surface-muted flex-shrink-0"
          />
        </button>
      </div>

      <ProfileMenuSheet
        open={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        profilePath="/member/profil"
      />
    </AppLayout>
  );
}


function SchedulePreviewCard({
  userKategori,
  onSeeAll,
}: {
  userKategori?: MemberCategory;
  onSeeAll: () => void;
}) {
  const range = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    return { from: isoDate(from), to: isoDate(to) };
  }, []);

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["member-schedule", range],
    queryFn: () => meetingApi.list({ from: range.from, to: range.to }),
    staleTime: 2 * 60_000,
  });

  const nextMeeting = useMemo(() => {
    const today = isoDate(new Date());
    const filtered = meetings.filter((m: Meeting) => {
      if (!userKategori) return true;
      const targets = normalizeTargets(m.kategori_target);
      if (targets.length > 0 && !targets.includes(userKategori)) return false;
      return true;
    });
    return (
      filtered
        .filter((m) => m.tanggal >= today)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0] || null
    );
  }, [meetings, userKategori]);

  if (isLoading) return <MeetingCardSkeleton />;

  return (
    <button
      onClick={onSeeAll}
      className="w-full text-left rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3 transition-all active:scale-[0.99] hover:bg-surface-card2 hover:border-accent/30"
    >
      <span className="w-11 h-11 rounded-2xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
        <Calendar size={18} strokeWidth={2.2} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/80 mb-0.5">
          {nextMeeting ? "Jadwal Terdekat" : "Jadwal Pengajian"}
        </p>
        {nextMeeting ? (
          <>
            <p className="text-ios-body font-medium text-surface-text truncate">
              {nextMeeting.acara || "Pengajian"}
            </p>
            <p className="text-ios-caption text-surface-muted truncate">
              {formatScheduleDate(nextMeeting.tanggal)}
              {nextMeeting.jam ? ` · ${nextMeeting.jam}` : ""}
            </p>
          </>
        ) : (
          <>
            <p className="text-ios-body font-medium text-surface-text truncate">
              Lihat Jadwal Pengajian
            </p>
            <p className="text-ios-caption text-surface-muted truncate">
              Kalender & daftar bulanan
            </p>
          </>
        )}
      </div>

      <ChevronRight size={18} className="text-surface-muted flex-shrink-0" />
    </button>
  );
}


function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}
