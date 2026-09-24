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
} from "../components/common/FontAwesomeIcons";
import { Button, Card } from "../components/common";
import { meetingApi } from "../services/domainApi";
import { formatDateLongText } from "../utils/format";

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
      .filter((m) => m.tanggal >= t && m.status !== "LIBUR")
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      .slice(0, 3);
  }, [meetings]);

  return (
    <div className="app-shell min-h-screen bg-surface-bg flex flex-col">
      <div className="px-5 pt-10 pb-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 mx-auto mb-4">
          <Mosque size={30} className="text-white" />
        </div>
        <h1 className="text-[24px] font-bold text-surface-text tracking-[-0.02em]">
          Sambung Ngaji
        </h1>
        <p className="text-ios-footnote text-surface-muted mt-1 max-w-xs mx-auto leading-relaxed">
          Jadwal pengajian, waktu sholat, doa, dzikir, dan Al-Quran. Terbuka
          untuk semua.
        </p>
        <div className="flex gap-2 mt-5 max-w-xs mx-auto">
          <Button fullWidth onClick={() => navigate("/login")}>
            Masuk
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate("/daftar")}
            rightIcon={<ArrowRight size={15} />}
          >
            Daftar
          </Button>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
            Pengajian terdekat
          </p>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <Card key={m.meeting_id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-ios-subhead font-bold text-accent leading-none tabular-nums">
                    {new Date(m.tanggal).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ios-subhead text-surface-text truncate">
                    {m.acara || "Pengajian"}
                  </p>
                  <p className="text-ios-caption text-surface-muted truncate">
                    {m.hari} · {formatDateLongText(m.tanggal)}
                    {m.jam ? ` · ${m.jam}` : ""}
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
        <p className="text-ios-caption text-surface-muted text-center pt-5 pb-3">
          Masuk untuk absensi, progres, dan data pribadi Anda.
        </p>
      </div>
    </div>
  );
}
