import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { useAuth } from "../../../contexts/AuthContext";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";
import { ACHIEVEMENT_LABELS, getRank, useNgajiProgress } from "./games/_shared/progression";
import { Home, LogOut, User } from "../../../components/ui/FontAwesomeIcons";
import { ModalPanel } from "./games/_shared/ModalPanel";
import { useNgajiCeriaStore } from "../hooks/useNgajiCeriaStore";
import { getTilawatiDataset } from "../data/tilawatiPageDatasets";
import "./games/_shared/games.css";

/**
 * Halaman profil santri mandiri (/member/ngaji-ceria/profile).
 * Menggantikan NgajiCeriaProfileSheet: identitas, statistik, lemari lencana, sesi.
 */
export default function NgajiCeriaProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentStreak } = useNgajiCeriaStreak();
  const progress = useNgajiProgress();
  const rank = getRank(progress.xp);
  const xpProgress = rank.nextXp === null
    ? 100
    : Math.min(100, Math.max(0, Math.round(((progress.xp - rank.minXp) / (rank.nextXp - rank.minXp)) * 100)));
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.name || "Tamu Ngaji Ceria";
  const earned = new Set(progress.achievements);
  const stars = useNgajiCeriaStore((state) => state.stars);
  for (let jilid = 1; jilid <= 5; jilid++) {
    const pages = Object.keys(getTilawatiDataset(jilid));
    if (pages.length && pages.every((page) => stars[`jilid-${jilid}-hal-${page}`] > 0)) earned.add(`jilid-${jilid}-clear`);
  }

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      navigate("/login");
    }
  };

  return <NgajiCeriaLayout title="Profil Santri" showBack onBack={() => navigate("/member/ngaji-ceria")}>
    <div className="space-y-4 rounded-t-3xl bg-[#FBF8F1] px-4 py-4">
      {/* Kartu Identitas Santri */}
      <section aria-label="Kartu identitas santri" className="rounded-3xl border-2 border-[#E2D4C0] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-[3px] border-white bg-[#FFF6D5] shadow-md">
            <img src={NGAJI_CERIA_ASSETS.avatarAnak} alt={`Avatar ${displayName}`} draggable={false} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-black text-[#5A3A2A]">{displayName}</h2>
            <p className="truncate text-xs font-bold text-[#8C7A68]">
              {user?.username ? `@${user.username}` : "Belum masuk sebagai anggota"}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FCE6DA] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#F58A3A]">
              Pangkat: {rank.title}
            </span>
          </div>
        </div>
        {/* Statistik Utama */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-[#FFF6EA] p-3">
            <p className="font-display text-xl font-black text-[#5A3A2A]">{progress.xp}</p>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#8C7A68]">Total XP</p>
          </div>
          <div className="rounded-2xl bg-[#FFF6EA] p-3">
            <p className="font-display text-xl font-black text-[#5A3A2A]">{progress.coins || 0} 🪙</p>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#8C7A68]">Koin</p>
          </div>
          <div className="rounded-2xl bg-[#FFF6EA] p-3">
            <p className="flex items-center justify-center gap-1 font-display text-xl font-black text-[#5A3A2A]">
              {currentStreak} <img src={NGAJI_CERIA_ASSETS.apiStreak} alt="api streak" draggable={false} className="h-5 w-5 object-contain" />
            </p>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#8C7A68]">Hari Beruntun</p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-[#FFF6EA] p-3" aria-label="Progress pangkat">
          <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wide text-[#8C7A68]">
            <span>{rank.title}</span>
            <span>{rank.nextXp === null ? "Pangkat tertinggi" : `${progress.xp}/${rank.nextXp} XP`}</span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#E2D4C0]/70"
            role="progressbar"
            aria-label="Progress menuju pangkat berikutnya"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={xpProgress}
          >
            <div className="h-full rounded-full bg-[#F58A3A] transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </section>

      {/* Lemari Lencana */}
      <section aria-label="Lemari lencana" className="rounded-3xl border-2 border-[#E2D4C0] bg-white p-4 shadow-sm">
        <h3 className="font-display text-sm font-black text-[#5A3A2A]">Lemari Lencana</h3>
        <p className="mt-0.5 text-xs text-[#8C7A68]">{earned.size}/{Object.keys(ACHIEVEMENT_LABELS).length} lencana diraih</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {Object.entries(ACHIEVEMENT_LABELS).map(([id, badge]) => {
            const has = earned.has(id);
            return <div key={id} data-testid={has ? `badge-${id}` : `badge-locked-${id}`}
              className={`rounded-2xl border-2 p-3 text-center ${has ? "border-[#FFCB45] bg-[#FFF8E1]" : "border-[#E2D4C0] bg-[#F5EFE6] opacity-70 grayscale"}`}>
              <span className="text-2xl" aria-hidden="true">{has ? id.startsWith("jilid-") ? "🎓" : "🏅" : "🔒"}</span>
              <p className="mt-1 text-[11px] font-black leading-tight text-[#5A3A2A]">{badge.title}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#8C7A68]">{badge.description}</p>
            </div>;
          })}
        </div>
      </section>

      {/* Pengaturan & Sesi */}
      <section aria-label="Pengaturan dan sesi" className="space-y-2">
        <button type="button" onClick={() => navigate("/member")}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-[#E2D4C0] bg-white p-3 text-left transition hover:bg-[#FFF6EA] active:scale-[0.99]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F4FF] text-[#2E7CC2]">
            <Home size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-[#5A3A2A]">Keluar Modul</span>
            <span className="block truncate text-xs font-bold text-[#8C7A68]">Kembali ke beranda anggota</span>
          </span>
        </button>
        {user ? (
          <button type="button" onClick={() => setConfirmLogout(true)} disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-[#F5B6B6] bg-[#FFF5F5] p-3 text-left transition active:scale-[0.99] disabled:opacity-60">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCEAEA] text-[#D32F2F]">
              <LogOut size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-[#D32F2F]">
                Keluar Aplikasi
              </span>
              <span className="block truncate text-xs font-bold text-[#D32F2F]/70">
                Keluar dari akun ini
              </span>
            </span>
          </button>
        ) : (
          <button type="button" onClick={() => navigate("/login")}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-[#FCD882] bg-[#FFF6D5] p-3 text-left transition hover:bg-[#FFF0C2] active:scale-[0.99]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#F58A3A]">
              <User size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-[#5A3A2A]">Masuk / Daftar</span>
              <span className="block truncate text-xs font-bold text-[#8C7A68]">Simpan progres ke akunmu</span>
            </span>
          </button>
        )}
      </section>
    </div>
    {confirmLogout && <ModalPanel title="Keluar dari akun?" warm onClose={loggingOut ? undefined : () => setConfirmLogout(false)}>
      <img src={NGAJI_CERIA_ASSETS.avatarAnak} alt="" className="mx-auto my-3 h-20 w-20 object-contain" />
      <p className="mb-5 text-sm text-[#8C7A68]">Sesi akunmu akan berakhir. Kamu bisa masuk kembali untuk melanjutkan belajar.</p>
      <div className="grid grid-cols-2 gap-2">
        <button className="game-button border-2 border-[#E2D4C0] bg-white text-[#5A3A2A]" disabled={loggingOut} onClick={() => setConfirmLogout(false)}>Batal</button>
        <button className="game-button bg-[#F58A3A]" disabled={loggingOut} onClick={handleLogout}>{loggingOut ? "Keluar…" : "Ya, Keluar"}</button>
      </div>
    </ModalPanel>}
  </NgajiCeriaLayout>;
}
