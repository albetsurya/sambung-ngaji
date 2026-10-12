import { useRef, useState, type FormEvent } from "react";
import {
  useLocation,
  useSearchParams,
  Navigate,
  Link,
} from "react-router-dom";
import {
  Sun,
  Moon,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
} from "../components/ui/FontAwesomeIcons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "../components/ui";
import { ApiError } from "../services/api";
import { useEnvironment } from "../hooks/useEnvironment";
import { AppLogoIcon } from "../components/ui/AppLogoIcon";
import { GoogleLoginButton } from "../features/auth/components/GoogleLoginButton";

function AppIcon({ size = 44 }: { size?: number }) {
  return <AppLogoIcon size={size} />;
}

type LoginIntent = "ceria" | "member";

const LOGIN_INTENTS: Record<
  LoginIntent,
  {
    label: string;
    title: string;
    description: string;
    redirect: string;
    Icon: typeof GraduationCap;
  }
> = {
  ceria: {
    label: "Akun Ngaji Ceria",
    title: "Masuk ke Ngaji Ceria",
    description:
      "Simpan progres belajar Tilawati, kumpulkan koin, bintang, dan pantau papan peringkat game.",
    redirect: "/member/ngaji-ceria",
    Icon: GraduationCap,
  },
  member: {
    label: "Member Jamaah",
    title: "Masuk Member Jamaah",
    description:
      "Khusus jamaah internal untuk akses data absensi, iuran kas/shodaqoh, jadwal pengajian, dan grup.",
    redirect: "/member/home",
    Icon: Users,
  },
};

function parseLoginIntent(value: string | null): LoginIntent | null {
  return value === "ceria" || value === "member" ? value : null;
}

export default function LoginPage() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDevelopment } = useEnvironment();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState(false);
  const loginInFlight = useRef(false);
  const intent = parseLoginIntent(searchParams.get("intent"));
  const loginConfig = intent ? LOGIN_INTENTS[intent] : null;
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

  if (!loading && user) {
    const from =
      loginConfig?.redirect ||
      (location.state as { from?: string })?.from ||
      "/";
    return <Navigate to={from} replace />;
  }

  function chooseIntent(nextIntent: LoginIntent) {
    setError("");
    setSearchParams({ intent: nextIntent });
  }

  function changeIntent() {
    setError("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setSearchParams({}, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loginInFlight.current) return;
    loginInFlight.current = true;
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      setUsername("");
      setPassword("");
      window.location.replace(loginConfig?.redirect || "/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal masuk. Periksa koneksi Anda.",
      );
    } finally {
      loginInFlight.current = false;
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    if (loginInFlight.current) return;
    loginInFlight.current = true;
    setError("");
    setOauthSubmitting(true);
    try {
      await loginWithGoogle(credential);
      window.location.replace("/member/ngaji-ceria");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal masuk dengan Google. Coba lagi.",
      );
    } finally {
      loginInFlight.current = false;
      setOauthSubmitting(false);
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
                  theme === "dark"
                    ? "linear-gradient(135deg, #011A5E 0%, #0A97FF 52%, #00F5F0 100%)"
                    : "linear-gradient(135deg, #DDF4FF 0%, #7DD3FC 52%, #5EEAD4 100%)",
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
             {loginConfig
               ? "Gunakan akun Anda untuk melanjutkan."
               : "Pilih jenis akun untuk melanjutkan."}
           </p>
         </div>
         {!loginConfig ? (
           <div className="w-full max-w-sm mx-auto space-y-3">
             {(Object.keys(LOGIN_INTENTS) as LoginIntent[]).map((key) => {
               const option = LOGIN_INTENTS[key];
               const Icon = option.Icon;
               return (
                 <button
                   key={key}
                   type="button"
                   onClick={() => chooseIntent(key)}
                   className="w-full rounded-3xl border border-surface-border bg-surface-card/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] p-5 text-left transition-all hover:bg-surface-card2 active:scale-[0.99]"
                 >
                   <div className="flex items-start gap-4">
                     <span className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                       <Icon size={22} />
                     </span>
                     <span className="flex-1 min-w-0">
                       <span className="flex items-center justify-between gap-3">
                         <span className="text-ios-subhead font-semibold text-surface-text">
                           {option.label}
                         </span>
                         <ChevronRight
                           size={16}
                           className="text-surface-muted shrink-0"
                         />
                       </span>
                       <span className="block text-ios-footnote text-surface-muted leading-relaxed mt-1.5">
                         {option.description}
                       </span>
                     </span>
                   </div>
                 </button>
               );
             })}
           </div>
         ) : (
           <form
             onSubmit={handleSubmit}
             className="w-full max-w-sm mx-auto bg-surface-card/80 backdrop-blur-xl rounded-3xl border border-surface-border shadow-lg shadow-black/[0.03] p-6"
           >
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent mb-1">
                  Jenis akun
               </p>
               <h2 className="text-ios-nav font-bold text-surface-text">
                  {loginConfig.title}
                </h2>
              </div>
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
                disabled={!username || !password || oauthSubmitting}
               rightIcon={!submitting ? <ArrowRight size={16} /> : undefined}
              >
                {submitting ? "Memproses..." : "Masuk"}
              </Button>
              {intent === "ceria" && googleClientId && (
                <div className="mt-5 pt-1 space-y-3.5">
                  <div className="flex items-center gap-3 text-ios-caption text-surface-muted">
                    <span className="h-px flex-1 bg-surface-border" />
                    <span>atau</span>
                    <span className="h-px flex-1 bg-surface-border" />
                  </div>
                  <div className="w-full flex justify-center py-0.5 overflow-hidden">
                    <GoogleLoginButton
                      clientId={googleClientId}
                      theme={theme}
                      disabled={submitting || oauthSubmitting}
                      onCredential={handleGoogleCredential}
                      onError={setError}
                    />
                  </div>
                  <p className="text-center text-ios-caption text-surface-muted px-2 leading-relaxed">
                    {oauthSubmitting
                      ? "Memproses akun Google…"
                      : "Masuk atau daftar Ngaji Ceria langsung dengan akun Google Anda."}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={changeIntent}
                disabled={submitting || oauthSubmitting}
               className="w-full mt-3 min-h-[40px] rounded-2xl text-ios-footnote font-semibold text-accent transition-colors hover:bg-accent-soft"
             >
               <ChevronLeft size={14} className="mr-1" />
               Kembali ke Pilihan
             </button>
           </form>
         )}
        <div className="mt-6 text-center">
          {intent && (
            <>
              <p className="text-ios-footnote text-surface-muted mb-3">
                Belum punya akun?
              </p>
              <div className="flex flex-col gap-2 max-w-[240px] mx-auto">
                {intent === "ceria" ? (
                  <Link
                    to="/register/ngaji-ceria"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl border border-accent/30 bg-accent-soft text-accent text-ios-subhead font-semibold transition-all hover:bg-accent-soft/80 active:scale-[0.97]"
                  >
                    Daftar Akun Santri
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl border border-accent/30 bg-accent-soft text-accent text-ios-subhead font-semibold transition-all hover:bg-accent-soft/80 active:scale-[0.97]"
                  >
                    Daftar Jamaah
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </>
          )}
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
