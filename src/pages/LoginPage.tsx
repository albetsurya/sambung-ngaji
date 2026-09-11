import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  Sun,
  Moon,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "../components/common";
import { ApiError } from "../services/api";

/* -------------------------------------------------------------------------- */
/*                            Custom Masjid Icon                              */
/* -------------------------------------------------------------------------- */

/**
 * Icon masjid + kubah + bulan sabit, digambar sebagai SVG inline.
 * Lebih relevan dengan konteks "pengajian" daripada icon Landmark generik.
 */
function MasjidIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Kubah utama */}
      <path
        d="M16 3c-3.5 2-6 5-6 8.5V14h12v-2.5C22 8 19.5 5 16 3Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Bulan sabit di atas kubah */}
      <circle cx="16" cy="4" r="1.2" fill="currentColor" />
      {/* Bangunan */}
      <rect x="8" y="14" width="16" height="12" rx="1" fill="currentColor" />
      {/* Menara kiri */}
      <rect
        x="4"
        y="10"
        width="3"
        height="16"
        rx="1"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Menara kanan */}
      <rect
        x="25"
        y="10"
        width="3"
        height="16"
        rx="1"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Kubah menara */}
      <circle cx="5.5" cy="9" r="1.5" fill="currentColor" />
      <circle cx="26.5" cy="9" r="1.5" fill="currentColor" />
      {/* Pintu utama */}
      <path d="M14 26v-5a2 2 0 0 1 4 0v5h-4Z" fill="rgba(255,255,255,0.85)" />
      {/* Jendela kiri & kanan */}
      <rect
        x="10"
        y="17"
        width="2"
        height="3"
        rx="0.5"
        fill="rgba(255,255,255,0.7)"
      />
      <rect
        x="20"
        y="17"
        width="2"
        height="3"
        rx="0.5"
        fill="rgba(255,255,255,0.7)"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const from = (location.state as { from?: string })?.from || "/";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal masuk. Periksa koneksi Anda.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell min-h-screen flex flex-col bg-surface-bg relative overflow-hidden">
      {/* -------------------- Decorative background -------------------- */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />
      <div
        className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />

      {/* -------------------------- Theme toggle ------------------------ */}
      <button
        onClick={toggleTheme}
        aria-label="Ganti mode tampilan"
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-card/80 backdrop-blur-xl border border-surface-border text-surface-text transition-all hover:bg-surface-card2 active:scale-95"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* --------------------------- Content ---------------------------- */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        {/* ---------------------------- Hero ---------------------------- */}
        <div className="mb-8 text-center">
          {/* Icon container dengan gradient + glow */}
          <div className="relative inline-block mb-5">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-3xl blur-2xl pointer-events-none"
              style={{ background: "rgb(var(--c-accent) / 0.4)" }}
            />
            {/* Icon box */}
            <div className="relative w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
              <MasjidIcon size={40} />
            </div>
            {/* Sparkle badge */}
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-surface-card border-2 border-surface-bg flex items-center justify-center shadow-md">
              <Sparkles size={11} className="text-accent" />
            </span>
          </div>

          <h1 className="text-[26px] font-bold text-surface-text tracking-[-0.02em] leading-tight">
            Selamat Datang
          </h1>
          <p className="text-ios-body text-surface-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
            Kelola jamaah, absensi, dan pembinaan dalam satu tempat.
          </p>
        </div>

        {/* ---------------------------- Form ---------------------------- */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mx-auto bg-surface-card/80 backdrop-blur-xl rounded-3xl border border-surface-border shadow-lg shadow-black/[0.03] p-6"
        >
          {/* Username field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-ios-footnote font-medium text-surface-text mb-2 px-1"
            >
              Username
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-muted pointer-events-none"
              />
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className="w-full min-h-[48px] rounded-2xl border border-surface-border bg-surface-bg/60 pl-10 pr-4 text-[16px] text-surface-text placeholder:text-surface-muted/60 transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-ios-footnote font-medium text-surface-text mb-2 px-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-muted pointer-events-none"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full min-h-[48px] rounded-2xl border border-surface-border bg-surface-bg/60 pl-10 pr-12 text-[16px] text-surface-text placeholder:text-surface-muted/60 transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
              {/* Toggle password visibility */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-surface-muted transition-colors hover:bg-surface-card2 hover:text-surface-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-danger-soft border border-danger/20">
              <p className="text-ios-footnote text-danger leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            disabled={submitting || !username || !password}
            rightIcon={
              !submitting ? (
                <ArrowRight size={16} strokeWidth={2.5} />
              ) : undefined
            }
          >
            {submitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        {/* --------------------------- Footer --------------------------- */}
        <p className="text-center text-ios-caption text-surface-muted/70 mt-8">
          © 2026 Manajemen Pengajian
        </p>
      </div>
    </div>
  );
}
