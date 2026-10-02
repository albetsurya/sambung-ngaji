import { useState, type FormEvent } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import {
  Sun,
  Moon,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "../components/ui/FontAwesomeIcons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "../components/ui";
import { ApiError } from "../services/api";
import { useEnvironment } from "../hooks/useEnvironment";
function AppIcon({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="appicon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="appicon-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#appicon-bg)" />
      <rect width="512" height="256" rx="120" fill="url(#appicon-shine)" />
      <g transform="translate(0, 8)">
        <rect
          x="128"
          y="120"
          width="256"
          height="288"
          rx="28"
          fill="#ffffff"
          opacity="0.18"
        />
        <rect x="148" y="100" width="216" height="288" rx="24" fill="#ffffff" />
      </g>
      <g fill="url(#appicon-bg)">
        <circle cx="192" cy="176" r="18" />
        <circle cx="192" cy="240" r="18" />
        <circle cx="192" cy="304" r="18" />
      </g>
      <g
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M186 176 l5 5 l10 -12" />
        <path d="M186 240 l5 5 l10 -12" />
        <path d="M186 304 l5 5 l10 -12" />
      </g>
      <g fill="#CBD5E1">
        <rect x="232" y="168" width="108" height="16" rx="8" />
        <rect x="232" y="232" width="88" height="16" rx="8" />
        <rect x="232" y="296" width="98" height="16" rx="8" />
      </g>
    </svg>
  );
}
export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { isDevelopment } = useEnvironment();
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
      setUsername("");
      setPassword("");
      window.location.replace("/");
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
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none blur-3xl"
        style={{ background: "rgb(var(--c-accent) / 0.18)" }}
      />
      <div
        className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full pointer-events-none blur-3xl"
        style={{ background: "rgb(var(--c-accent) / 0.18)" }}
      />
      <button
        onClick={toggleTheme}
        aria-label="Ganti mode tampilan"
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-card/80 backdrop-blur-xl border border-surface-border text-surface-text transition-all hover:bg-surface-card2 active:scale-95"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-5">
            <div
              className="absolute inset-0 rounded-[26px] blur-2xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #8B5CF6 100%)",
                opacity: 0.55,
              }}
            />
            <div className="relative w-20 h-20 rounded-[26px] overflow-hidden shadow-xl">
              <AppIcon size={80} />
            </div>
            {isDevelopment && (
              <div className="absolute -top-1.5 -right-1.5 z-10 px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold uppercase tracking-wider shadow-md ring-2 ring-surface-bg">
                DEV
              </div>
            )}
          </div>
          <h1 className="text-[26px] font-bold text-surface-text tracking-[-0.02em] leading-tight">
            Sambung Ngaji
          </h1>
          <p className="text-ios-body text-surface-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
            Assalamu&apos;alaikum, silakan masuk.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mx-auto bg-surface-card/80 backdrop-blur-xl rounded-3xl border border-surface-border shadow-lg shadow-black/[0.03] p-6"
        >
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
                placeholder="Username kamu"
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
                placeholder="Password rahasia kamu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full min-h-[48px] rounded-2xl border border-surface-border bg-surface-bg/60 pl-10 pr-12 text-[16px] text-surface-text placeholder:text-surface-muted/60 transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-danger-soft border border-danger/20">
              <p className="text-ios-footnote text-danger leading-relaxed">
                {error}
              </p>
            </div>
          )}
          <Button
            type="submit"
            fullWidth
            loading={submitting}
            disabled={!username || !password}
            rightIcon={!submitting ? <ArrowRight size={16} /> : undefined}
          >
            {submitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-ios-footnote text-surface-muted mb-3">
            Belum punya akun?
          </p>
          <Link
            to="/daftar"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-accent/30 bg-accent-soft text-accent text-ios-subhead font-semibold transition-all hover:bg-accent-soft/80 active:scale-[0.97]"
          >
            Daftar sekarang
            <ArrowRight size={14} />
          </Link>
          <div className="mt-3">
            <Link
              to="/"
              className="text-ios-footnote text-surface-muted underline underline-offset-4"
            >
              Jelajahi tanpa masuk
            </Link>
          </div>
        </div>
        <p className="text-center text-ios-caption text-surface-muted/70 mt-6">
          Sambung Ngaji · v1.0.0
        </p>
      </div>
    </div>
  );
}
