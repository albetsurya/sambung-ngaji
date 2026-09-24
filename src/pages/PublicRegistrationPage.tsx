import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Check,
  User as UserIcon,
  MapPin,
  GraduationCap,
  Eye,
  EyeOff,
} from "../components/common/FontAwesomeIcons";
import {
  Button,
  Input,
  Select,
  Textarea,
  LoadingOverlay,
} from "../components/common";
import { publicApi } from "../services/publicApi";
import { normalizePhoneNumber } from "../utils/format";
import { ApiError, abortAllApiCalls } from "../services/api";
import { DateInput } from "../components/common/DateInput";
import { useKeyboardVisible } from "../hooks/useKeyboardVisible";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface FormData {
  nama_lengkap: string;
  nama_panggilan: string;
  jenis_kelamin: "L" | "P" | "";
  tempat_lahir: string;
  tanggal_lahir: string;
  no_wa: string;
  alamat_rumah: string;
  desa: string;
  daerah: string;
  pekerjaan: string;
  hobi: string;
  is_nikah: boolean;
  jenjang_pendidikan: string;
  sekolah: string;
  jurusan: string;
  tahun_mulai_pendidikan: string;
  tahun_selesai_pendidikan: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

const EMPTY_FORM: FormData = {
  nama_lengkap: "",
  nama_panggilan: "",
  jenis_kelamin: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  no_wa: "",
  alamat_rumah: "",
  desa: "",
  daerah: "",
  pekerjaan: "",
  hobi: "",
  is_nikah: false,
  jenjang_pendidikan: "",
  sekolah: "",
  jurusan: "",
  tahun_mulai_pendidikan: "",
  tahun_selesai_pendidikan: "",
  username: "",
  password: "",
  passwordConfirm: "",
};

const STEPS = [
  { key: 1, label: "Data Diri", Icon: UserIcon },
  { key: 2, label: "Kontak & Alamat", Icon: MapPin },
  { key: 3, label: "Pendidikan & Akun", Icon: GraduationCap },
] as const;

const TOTAL_STEPS = 3;

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const MIN_PASSWORD_LENGTH = 6;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function PublicRegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  // Sembunyikan bottom bar saat keyboard terbuka agar tidak menutupi form.
  const keyboardOpen = useKeyboardVisible();

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ---------------------- Cek ketersediaan username ---------------------- */

  useEffect(() => {
    const uname = form.username.trim().toLowerCase();

    if (uname.length === 0) {
      setUsernameStatus("idle");
      return;
    }
    if (!USERNAME_REGEX.test(uname)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    let cancelled = false;

    const t = setTimeout(async () => {
      try {
        const res = await publicApi.checkUsername(uname);
        if (cancelled) return;
        setUsernameStatus(res.available ? "available" : "taken");
      } catch {
        if (cancelled) return;
        setUsernameStatus("idle");
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [form.username]);

  /* ----------------------------- Validasi step --------------------------- */

  function canProceed(): { ok: boolean; message?: string } {
    if (step === 1) {
      if (form.nama_lengkap.trim().length < 3) {
        return { ok: false, message: "Nama lengkap minimal 3 karakter" };
      }
      if (!form.jenis_kelamin) {
        return { ok: false, message: "Jenis kelamin wajib dipilih" };
      }
    }

    if (step === 2) {
      if (!form.no_wa.trim()) {
        return { ok: false, message: "Nomor WhatsApp wajib diisi" };
      }
      const normalized = normalizePhoneNumber(form.no_wa);
      if (normalized.length < 10 || normalized.length > 15) {
        return { ok: false, message: "Nomor WhatsApp tidak valid" };
      }
    }

    if (step === 3) {
      const uname = form.username.trim().toLowerCase();
      if (!USERNAME_REGEX.test(uname)) {
        return {
          ok: false,
          message:
            "Username tidak valid. Gunakan huruf kecil, angka, atau underscore (3-20 karakter).",
        };
      }
      if (usernameStatus === "checking") {
        return {
          ok: false,
          message: "Sedang memeriksa username, tunggu sebentar.",
        };
      }
      if (usernameStatus === "taken") {
        return {
          ok: false,
          message: "Username sudah dipakai. Coba yang lain.",
        };
      }
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        return {
          ok: false,
          message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
        };
      }
      if (form.password !== form.passwordConfirm) {
        return { ok: false, message: "Konfirmasi password tidak sama" };
      }
    }

    return { ok: true };
  }

  function handleNext() {
    setError("");
    const validation = canProceed();
    if (!validation.ok) {
      setError(validation.message || "Data belum lengkap");
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/login", { replace: true });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const validation = canProceed();
    if (!validation.ok) {
      setError(validation.message || "Data belum lengkap");
      return;
    }

    setSubmitting(true);
    try {
      const result = await publicApi.submitRegistration({
        nama_lengkap: form.nama_lengkap.trim(),
        nama_panggilan: form.nama_panggilan.trim(),
        jenis_kelamin: form.jenis_kelamin as "L" | "P",
        tempat_lahir: form.tempat_lahir.trim(),
        tanggal_lahir: form.tanggal_lahir,
        no_wa: normalizePhoneNumber(form.no_wa),
        alamat_rumah: form.alamat_rumah.trim(),
        desa: form.desa.trim(),
        daerah: form.daerah.trim(),
        pekerjaan: form.pekerjaan.trim(),
        hobi: form.hobi.trim(),
        is_nikah: form.is_nikah,
        jenjang_pendidikan: form.jenjang_pendidikan,
        sekolah: form.sekolah.trim(),
        jurusan: form.jurusan.trim(),
        tahun_mulai_pendidikan: form.tahun_mulai_pendidikan,
        tahun_selesai_pendidikan: form.tahun_selesai_pendidikan,
        username: form.username.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/daftar/sukses", {
        state: {
          nama: result.nama_lengkap,
          submissionId: result.submission_id,
        },
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal mengirim pendaftaran. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg relative overflow-x-hidden">
      {/* Decorative circles */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />
      <div
        className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />

      <div className="app-shell flex flex-col relative">
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-surface-bg/80 pt-safe border-b border-surface-border/50">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[52px] px-3 gap-2">
            <div className="flex items-center justify-start min-w-0">
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                onClick={handleBack}
                aria-label="Kembali"
              >
                <ChevronLeft size={24} strokeWidth={2.2} className="-ml-1" />
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center min-w-0 max-w-[60vw]">
              <h1 className="text-ios-nav font-semibold text-surface-text truncate">
                Pendaftaran Jamaah
              </h1>
              <p className="text-ios-caption text-surface-muted truncate">
                Step {step} dari {TOTAL_STEPS}
              </p>
            </div>

            <div />
          </div>

          {/* Progress bar */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2">
              {STEPS.map((s) => {
                const Icon = s.Icon;
                const active = step >= s.key;
                return (
                  <div key={s.key} className="flex-1 flex flex-col gap-1.5">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        active ? "bg-accent" : "bg-surface-card2"
                      }`}
                    />
                    <div className="flex items-center gap-1 justify-center">
                      <Icon
                        size={12}
                        className={
                          active ? "text-accent" : "text-surface-muted"
                        }
                      />
                      <span
                        className={`text-[10px] font-medium ${
                          active ? "text-accent" : "text-surface-muted"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex-1 flex flex-col px-5 py-4 pb-36"
        >
          {step === 1 && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <div className="mb-5">
                <h2 className="text-[20px] font-bold text-surface-text mb-1 tracking-[-0.02em]">
                  Data Diri
                </h2>
                <p className="text-ios-footnote text-surface-muted">
                  Isi data sesuai KTP/identitas Anda
                </p>
              </div>

              <Input
                label="Nama Lengkap *"
                placeholder="Nama sesuai KTP"
                value={form.nama_lengkap}
                onChange={(e) => update("nama_lengkap", e.target.value)}
                required
              />
              <Input
                label="Nama Panggilan"
                placeholder="Nama sehari-hari"
                value={form.nama_panggilan}
                onChange={(e) => update("nama_panggilan", e.target.value)}
              />
              <Select
                label="Jenis Kelamin *"
                value={form.jenis_kelamin}
                onChange={(e) =>
                  update("jenis_kelamin", e.target.value as "L" | "P" | "")
                }
                required
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tempat Lahir"
                  placeholder="Kota"
                  value={form.tempat_lahir}
                  onChange={(e) => update("tempat_lahir", e.target.value)}
                />
                <DateInput
                  label="Tanggal Lahir"
                  value={form.tanggal_lahir || ""}
                  onChange={(iso) => update("tanggal_lahir", iso)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <div className="mb-5">
                <h2 className="text-[20px] font-bold text-surface-text mb-1 tracking-[-0.02em]">
                  Kontak & Alamat
                </h2>
                <p className="text-ios-footnote text-surface-muted">
                  Agar admin bisa menghubungi Anda
                </p>
              </div>

              <Input
                label="No. WhatsApp *"
                placeholder="0812xxxxxxxx"
                inputMode="tel"
                value={form.no_wa}
                onChange={(e) => update("no_wa", e.target.value)}
                hint="Contoh: 081234567890"
                required
              />
              <Textarea
                label="Alamat Rumah"
                placeholder="Alamat lengkap"
                value={form.alamat_rumah}
                onChange={(e) => update("alamat_rumah", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Desa"
                  placeholder="Nama desa"
                  value={form.desa}
                  onChange={(e) => update("desa", e.target.value)}
                />
                <Input
                  label="Daerah"
                  placeholder="Nama daerah"
                  value={form.daerah}
                  onChange={(e) => update("daerah", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <div className="mb-5">
                <h2 className="text-[20px] font-bold text-surface-text mb-1 tracking-[-0.02em]">
                  Pendidikan & Akun
                </h2>
                <p className="text-ios-footnote text-surface-muted">
                  Data pendidikan opsional, akun login wajib diisi
                </p>
              </div>

              <Select
                label="Jenjang Pendidikan"
                value={form.jenjang_pendidikan}
                onChange={(e) => update("jenjang_pendidikan", e.target.value)}
              >
                <option value="">Pilih jenjang</option>
                <option value="PAUD">PAUD</option>
                <option value="TK">TK</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
                <option value="MA">MA</option>
                <option value="D1">D1</option>
                <option value="D2">D2</option>
                <option value="D3">D3</option>
                <option value="D4">D4</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Sekolah"
                  placeholder="Nama sekolah"
                  value={form.sekolah}
                  onChange={(e) => update("sekolah", e.target.value)}
                />
                <Input
                  label="Jurusan"
                  placeholder="Jurusan"
                  value={form.jurusan}
                  onChange={(e) => update("jurusan", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tahun Mulai"
                  type="number"
                  inputMode="numeric"
                  placeholder="2020"
                  value={form.tahun_mulai_pendidikan}
                  onChange={(e) =>
                    update("tahun_mulai_pendidikan", e.target.value)
                  }
                />
                <Input
                  label="Tahun Selesai"
                  type="number"
                  inputMode="numeric"
                  placeholder="2024"
                  value={form.tahun_selesai_pendidikan}
                  onChange={(e) =>
                    update("tahun_selesai_pendidikan", e.target.value)
                  }
                />
              </div>

              <Input
                label="Pekerjaan"
                placeholder="Contoh: Karyawan, Wiraswasta"
                value={form.pekerjaan}
                onChange={(e) => update("pekerjaan", e.target.value)}
              />

              <Input
                label="Hobi"
                placeholder="Membaca, olahraga, dll"
                value={form.hobi}
                onChange={(e) => update("hobi", e.target.value)}
              />

              <ModernCheckbox
                checked={form.is_nikah}
                onChange={(v) => update("is_nikah", v)}
                label="Sudah menikah"
              />

              {/* ---------------------- Section Akun Login ---------------------- */}

              <div className="mt-6 pt-5 border-t border-surface-border">
                <h2 className="text-[18px] font-bold text-surface-text mb-1 tracking-[-0.02em]">
                  Akun Login
                </h2>
                <p className="text-ios-footnote text-surface-muted mb-4 leading-relaxed">
                  Username dan password ini dipakai untuk masuk setelah
                  pendaftaran disetujui admin.
                </p>

                <Input
                  label="Username *"
                  placeholder="Contoh: ahmad_01"
                  value={form.username}
                  onChange={(e) =>
                    update(
                      "username",
                      e.target.value.toLowerCase().replace(/\s/g, ""),
                    )
                  }
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  hint="Huruf kecil, angka, underscore (3-20 karakter)"
                  required
                />

                {usernameStatus === "checking" && (
                  <p className="text-ios-caption text-surface-muted mt-1 px-1">
                    Memeriksa ketersediaan...
                  </p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-ios-caption text-success mt-1 px-1 flex items-center gap-1">
                    <Check size={12} /> Username tersedia
                  </p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-ios-caption text-danger mt-1 px-1">
                    Username sudah dipakai, coba yang lain
                  </p>
                )}
                {usernameStatus === "invalid" && (
                  <p className="text-ios-caption text-danger mt-1 px-1">
                    Format username tidak valid
                  </p>
                )}

                <Input
                  label="Password *"
                  type={showPassword ? "text" : "password"}
                  placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <Input
                  label="Konfirmasi Password *"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={form.passwordConfirm}
                  onChange={(e) => update("passwordConfirm", e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-ios-footnote text-accent mt-1 mb-2 px-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? "Sembunyikan password" : "Lihat password"}
                </button>

                {form.passwordConfirm &&
                  form.password !== form.passwordConfirm && (
                    <p className="text-ios-caption text-danger mt-1 px-1">
                      Password tidak sama
                    </p>
                  )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 px-3 py-2.5 rounded-xl bg-danger-soft border border-danger/20">
              <p className="text-ios-footnote text-danger leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Bottom action */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-200 ${
          keyboardOpen ? "translate-y-full" : ""
        }`}
      >
        <div className="pointer-events-none h-6 bg-gradient-to-t from-surface-bg to-transparent" />

        <div className="bg-surface-bg backdrop-blur-xl border-t border-surface-border pb-safe">
          <div className="app-shell px-5 pt-3 pb-4">
            {step < TOTAL_STEPS ? (
              <Button
                fullWidth
                onClick={handleNext}
                rightIcon={<ArrowRight size={16} />}
              >
                Lanjut
              </Button>
            ) : (
              <Button
                fullWidth
                onClick={handleSubmit}
                disabled={submitting}
                rightIcon={!submitting ? <Check size={16} /> : undefined}
              >
                {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <LoadingOverlay open={submitting} label="Mengirim pendaftaran..." onCancel={() => abortAllApiCalls()} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Modern Checkbox                               */
/* -------------------------------------------------------------------------- */

function ModernCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 active:scale-[0.99] text-left mb-4 ${
        checked
          ? "bg-accent-soft border-accent/40"
          : "bg-surface-card border-surface-border hover:bg-surface-card2"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-accent text-white"
            : "bg-surface-card2 border border-surface-border"
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      <span className="text-ios-body font-medium text-surface-text">
        {label}
      </span>
    </button>
  );
}
