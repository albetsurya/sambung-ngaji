import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Shield,
  Lock,
  Eye,
  Users,
  Trash2,
} from "../components/ui/FontAwesomeIcons";

export default function MemberPrivacyPage() {
  const navigate = useNavigate();
  return (
    <AppLayout hideNav>
      <Header
        title="Kebijakan Privasi"
        onBack={() => goBack(navigate, "/member/lainnya")}
        backLabel="Kembali"
      />

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-accent-soft/60 p-4 flex items-start gap-3">
          <Shield size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-ios-body text-surface-text leading-relaxed">
            Kami berkomitmen melindungi privasi Anda. Kebijakan ini menjelaskan
            bagaimana data Anda dikelola di aplikasi Sambung Ngaji.
          </p>
        </div>

        <PrivacySection
          Icon={Eye}
          title="Data yang Kami Kumpulkan"
          items={[
            "Biodata: nama, jenis kelamin, tempat & tanggal lahir",
            "Kontak: nomor WhatsApp, alamat rumah, desa, daerah",
            "Pendidikan: jenjang, sekolah, jurusan",
            "Foto profil (opsional)",
            "Riwayat absensi pengajian",
            "Catatan pembinaan dari tim",
          ]}
        />

        <PrivacySection
          Icon={Lock}
          title="Bagaimana Data Digunakan"
          items={[
            "Untuk keperluan administrasi pengajian",
            "Untuk absensi dan monitoring pembinaan",
            "Untuk komunikasi internal komunitas",
            "Untuk pengumuman jadwal pengajian",
          ]}
        />

        <PrivacySection
          Icon={Users}
          title="Siapa yang Bisa Melihat Data"
          items={[
            "Anda sendiri: biodata lengkap via halaman profil",
            "Admin & tim pengajian: sesuai peran & tanggung jawab",
            "Jamaah lain: hanya nama & kelompok (tidak detail)",
          ]}
          hint="Data sensitif seperti nomor WhatsApp & alamat hanya bisa diakses admin & tim yang berwenang"
        />

        <PrivacySection
          Icon={Shield}
          title="Keamanan Data"
          items={[
            "Data disimpan di Google Sheets dengan akses terbatas",
            "Foto disimpan di Google Drive pribadi komunitas",
            "Akses menggunakan sistem login dengan token",
            "Aktivitas admin tercatat di audit log",
          ]}
        />

        <PrivacySection
          Icon={Trash2}
          title="Hak Anda"
          items={[
            "Lihat & edit biodata sendiri via halaman profil",
            "Lihat riwayat absensi & pembinaan sendiri",
            "Hapus foto profil kapan saja",
            "Ajukan perubahan data terkunci via admin",
            "Ajukan penghapusan akun via admin",
          ]}
        />

        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <p className="text-ios-footnote text-surface-muted leading-relaxed">
            Dengan menggunakan aplikasi ini, Anda menyetujui pengelolaan data
            sesuai kebijakan di atas. Untuk pertanyaan lebih lanjut, hubungi
            admin komunitas pengajian Anda.
          </p>
        </div>

        <div className="text-center pt-4 pb-3">
          <p className="text-ios-caption text-surface-muted">
            Terakhir diperbarui: 12 September 2026
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function PrivacySection({
  Icon,
  title,
  items,
  hint,
}: {
  Icon: typeof Shield;
  title: string;
  items: string[];
  hint?: string;
}) {
  return (
    <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
          <Icon size={16} />
        </div>
        <h3 className="text-ios-body font-semibold text-surface-text">
          {title}
        </h3>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="text-accent flex-shrink-0 mt-0.5">•</span>
              <span className="text-ios-footnote text-surface-text leading-relaxed flex-1">
                {item}
              </span>
            </li>
          ))}
        </ul>
        {hint && (
          <div className="mt-3 rounded-xl bg-warning-soft border border-warning/20 p-3">
            <p className="text-ios-caption text-warning leading-relaxed">
              {hint}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
