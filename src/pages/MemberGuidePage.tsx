import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import { useAuth } from "../contexts/AuthContext";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MasukButton } from "../components/ui";
import {
  User,
  Calendar,
  Heart,
  Sparkles,
  Pencil,
  Check,
} from "../components/ui/FontAwesomeIcons";

export default function MemberGuidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <AppLayout hideNav>
      <Header
        title="Panduan Penggunaan"
        onBack={() => goBack(navigate, user ? "/member/lainnya" : "/")}
        backLabel="Kembali"
        right={
          !user ? (
              <MasukButton />
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <p className="text-ios-body text-surface-text leading-relaxed">
            Panduan ini membantu Anda memahami cara menggunakan aplikasi
            Sambung Ngaji sebagai jamaah.
          </p>
        </div>

        <GuideSection
          number={1}
          title="Lihat Profil Anda"
          Icon={User}
          description="Tab Profil menampilkan biodata lengkap Anda: nama, usia, kelompok, alamat, kontak, dan pendidikan."
          steps={[
            "Buka tab Profil di halaman utama",
            "Scroll untuk melihat semua data",
            "Data kategori dihitung otomatis berdasarkan usia & status",
          ]}
        />

        <GuideSection
          number={2}
          title="Edit Biodata"
          Icon={Pencil}
          description="Anda bisa memperbarui data tertentu tanpa perlu menghubungi admin."
          steps={[
            "Klik FAB 'Edit Biodata' di bawah",
            "Ubah field yang diizinkan (nama panggilan, kontak, alamat, pekerjaan, dll)",
            "Field seperti nama lengkap, jenis kelamin, dan tanggal lahir terkunci",
            "Klik 'Simpan Perubahan'",
          ]}
          hint="Field yang terkunci hanya bisa diubah oleh admin"
        />

        <GuideSection
          number={3}
          title="Lihat Absensi"
          Icon={Calendar}
          description="Tab Absensi menampilkan statistik kehadiran dan riwayat lengkap Anda."
          steps={[
            "Buka tab Absensi",
            "Lihat 4 stat box: Hadir, Izin, Sakit, Alpa",
            "Persentase kehadiran dihitung otomatis",
            "Scroll untuk riwayat per pengajian",
          ]}
        />

        <GuideSection
          number={4}
          title="Lihat Pembinaan"
          Icon={Heart}
          description="Tab Pembinaan menampilkan catatan monitoring dari tim pembina."
          steps={[
            "Buka tab Pembinaan",
            "Lihat riwayat catatan & tindak lanjut",
            "Status pembinaan: Aktif, Perlu Perhatian, Kurang Aktif, Tidak Aktif",
          ]}
        />

        <GuideSection
          number={5}
          title="Tanya Asisten AI"
          Icon={Sparkles}
          description="Asisten AI siap menjawab pertanyaan tentang data pribadi Anda."
          steps={[
            "Klik FAB 'Tanya AI' di bawah",
            "Ketik pertanyaan atau pilih saran yang tersedia",
            "AI hanya menjawab tentang data Anda sendiri",
            "Contoh: 'Berapa persen kehadiran saya?'",
          ]}
          hint="AI tidak bisa menjawab pertanyaan tentang jamaah lain"
        />

        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-ios-body font-medium text-surface-text mb-1">
                Butuh bantuan lebih lanjut?
              </p>
              <p className="text-ios-footnote text-surface-muted leading-relaxed">
                Hubungi admin atau tim pembina kelompok Anda untuk bantuan lebih
                lanjut.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function GuideSection({
  number,
  title,
  Icon,
  description,
  steps,
  hint,
}: {
  number: number;
  title: string;
  Icon: typeof User;
  description: string;
  steps: string[];
  hint?: string;
}) {
  return (
    <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-ios-caption text-surface-muted font-medium">
            Langkah {number}
          </p>
          <h3 className="text-ios-body font-semibold text-surface-text">
            {title}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-ios-body text-surface-text leading-relaxed">
          {description}
        </p>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent-soft text-accent text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-ios-footnote text-surface-text leading-relaxed flex-1">
                {step}
              </span>
            </div>
          ))}
        </div>

        {hint && (
          <div className="rounded-xl bg-warning-soft border border-warning/20 p-3">
            <p className="text-ios-footnote text-warning leading-relaxed">
              {hint}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
