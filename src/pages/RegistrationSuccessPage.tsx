import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Home, Calendar } from "../components/ui/FontAwesomeIcons";
import { Button } from "../components/ui";

interface SuccessState {
  nama?: string;
  submissionId?: string;
}

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SuccessState) || {};
  const { nama, submissionId } = state;

  useEffect(() => {
    if (!submissionId) {
      navigate("/daftar", { replace: true });
    }
  }, [submissionId, navigate]);

  if (!submissionId) return null;

  return (
    <div className="app-shell min-h-screen flex flex-col bg-surface-bg relative">
      
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />

      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl pointer-events-none"
              style={{ background: "rgb(var(--c-accent) / 0.4)" }}
            />
            <div className="relative w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
              <Check size={40} className="text-white" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-[26px] font-bold text-surface-text tracking-[-0.02em] leading-tight mb-2">
            Pendaftaran Diterima
          </h1>
          <p className="text-ios-body text-surface-muted max-w-[300px] mx-auto leading-relaxed">
            Terima kasih{nama ? `, ${nama}` : ""}! Data Anda sudah kami terima.
          </p>
        </div>

        <div className="bg-surface-card rounded-3xl border border-surface-border shadow-sm p-5 mb-6">
          <p className="text-ios-footnote text-surface-muted mb-3 font-medium">
            ID Pendaftaran
          </p>
          <div className="rounded-2xl bg-surface-card2 px-4 py-3 mb-4">
            <code className="text-ios-body  font-semibold text-accent">
              {submissionId}
            </code>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-accent">1</span>
              </div>
              <p className="text-ios-footnote text-surface-text leading-relaxed">
                Admin akan memverifikasi data Anda dalam 1x24 jam
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-accent">2</span>
              </div>
              <p className="text-ios-footnote text-surface-text leading-relaxed">
                Anda akan dihubungi via WhatsApp setelah diverifikasi
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-accent">3</span>
              </div>
              <p className="text-ios-footnote text-surface-text leading-relaxed">
                Setelah disetujui, Anda bisa login untuk lihat data sendiri
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            fullWidth
            onClick={() => navigate("/login", { replace: true })}
            leftIcon={<Home size={16} />}
          >
            Ke Halaman Login
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate("/daftar", { replace: true })}
          >
            Daftar Jamaah Lain
          </Button>
        </div>

        <p className="text-center text-ios-caption text-surface-muted/70 mt-8">
          Simpan ID pendaftaran Anda untuk referensi
        </p>
      </div>
    </div>
  );
}
