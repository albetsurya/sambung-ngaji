import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Pencil,
  Lock,
  Check,
  Trash2,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Button,
  Input,
  Select,
  Textarea,
  LoadingOverlay,
  ConfirmDialog,
} from "../components/common";
import { MemberFormSkeleton } from "../components/common/Skeleton";
import { memberSelfApi } from "../services/memberSelfApi";
import { uploadApi } from "../services/domainApi";
import type { Member } from "../types";
import { normalizePhoneNumber, formatDateShort } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import imageCompression from "browser-image-compression";
import { useAuth } from "../contexts/AuthContext";

export default function MemberEditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState<Partial<Member>>({});
  const [original, setOriginal] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    memberSelfApi
      .getProfile()
      .then((m) => {
        setForm(m);
        setOriginal(m);
        setPhotoPreview(m.foto_url || "");
      })
      .catch(() => {
        showToast("Gagal memuat profil", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Member>(key: K, value: Member[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Foto harus berformat JPEG/PNG/WEBP", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimum 5MB", "error");
      return;
    }

    setCompressing(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.8,
      });

      const compressedFile = new File(
        [compressed],
        file.name.replace(/\.[^.]+$/, ".jpg"),
        { type: "image/jpeg" },
      );

      setPhotoFile(compressedFile);
      setPhotoPreview(URL.createObjectURL(compressedFile));
    } catch {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      showToast("Kompres foto gagal, pakai file asli", "warning");
    } finally {
      setCompressing(false);
    }
  }

  async function handleDeletePhoto() {
    setDeletingPhoto(true);
    try {
      await uploadApi.delete();
      setPhotoFile(null);
      setPhotoPreview("");
      setConfirmDeleteOpen(false);
      showToast("Foto dihapus");
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus foto",
        "error",
      );
    } finally {
      setDeletingPhoto(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        nama_panggilan: form.nama_panggilan || "",
        no_wa: form.no_wa ? normalizePhoneNumber(form.no_wa) : "",
        alamat_rumah: form.alamat_rumah || "",
        desa: form.desa || "",
        daerah: form.daerah || "",
        pekerjaan: form.pekerjaan || "",
        hobi: form.hobi || "",
        tinggi_badan: form.tinggi_badan || "",
        berat_badan: form.berat_badan || "",
        is_kerja: !!form.is_kerja,
        is_nikah: !!form.is_nikah,
        jenjang_pendidikan: form.jenjang_pendidikan || "",
        sekolah: form.sekolah || "",
        jurusan: form.jurusan || "",
        tahun_mulai_pendidikan: form.tahun_mulai_pendidikan || "",
        tahun_selesai_pendidikan: form.tahun_selesai_pendidikan || "",
      };

      await memberSelfApi.updateProfile(payload);

      if (photoFile && original?.member_id) {
        const base64 = await fileToBase64(photoFile);
        await uploadApi.photo(original.member_id, base64, photoFile.type);
      }

      showToast("Biodata diperbarui");
      const returnPath = user?.role === "MEMBER" ? "/member" : "/profil-saya";
      navigate(returnPath, { replace: true });
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan data",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout hideNav>
        <Header title="Edit Biodata" onBack={() => navigate(-1)} />
        <MemberFormSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      <Header title="Edit Biodata" onBack={() => navigate(-1)} />

      <form
        id="member-edit-form"
        onSubmit={handleSubmit}
        className="px-4 py-4 pb-40 space-y-4"
      >
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer group">
            <div className="w-28 h-28 rounded-2xl bg-surface-card border-2 border-dashed border-surface-border overflow-hidden flex items-center justify-center transition-all group-hover:border-accent/60 group-active:scale-[0.98]">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-surface-muted">
                  <Camera size={24} />
                  <span className="text-[10px] font-medium">Tambah Foto</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={compressing}
            />
            <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-accent text-white shadow-lg shadow-accent/30 flex items-center justify-center border-[3px] border-surface-bg transition-transform group-hover:scale-110">
              <Pencil size={14} strokeWidth={2.5} />
            </span>
          </label>

          {compressing && (
            <p className="mt-3 text-ios-footnote text-surface-muted">
              Mengkompres foto...
            </p>
          )}

          {photoPreview && !compressing && (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={deletingPhoto || submitting}
              className="mt-3 inline-flex items-center gap-1.5 text-ios-footnote font-medium text-danger hover:text-danger/80 transition-colors active:scale-[0.97] disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deletingPhoto ? "Menghapus..." : "Hapus Foto"}
            </button>
          )}
        </div>

        <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-card2 flex items-center justify-center text-surface-muted flex-shrink-0">
              <Lock size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-ios-body font-semibold text-surface-text">
                Data Terkunci
              </h3>
              <p className="text-ios-caption text-surface-muted truncate">
                Hubungi admin untuk mengubah
              </p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <LockedField label="Nama Lengkap" value={original?.nama_lengkap} />
            <LockedField
              label="Jenis Kelamin"
              value={
                original?.jenis_kelamin === "L"
                  ? "Laki-laki"
                  : original?.jenis_kelamin === "P"
                    ? "Perempuan"
                    : "-"
              }
            />
            <LockedField label="Tempat Lahir" value={original?.tempat_lahir} />
            <LockedField
              label="Tanggal Lahir"
              value={
                original?.tanggal_lahir
                  ? formatDateShort(original.tanggal_lahir)
                  : "-"
              }
            />
            <LockedField label="Kelompok" value={original?.kelompok} />
          </div>
        </section>

        <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40">
            <h3 className="text-ios-body font-semibold text-surface-text">
              Data Diri
            </h3>
          </div>
          <div className="p-4">
            <Input
              label="Nama Panggilan"
              value={form.nama_panggilan || ""}
              onChange={(e) => update("nama_panggilan", e.target.value)}
              placeholder="Mis. Fauzi, Budi, dll"
            />
            <Input
              label="No. WhatsApp"
              placeholder="Mis. 081234567890"
              inputMode="tel"
              value={form.no_wa || ""}
              onChange={(e) => update("no_wa", e.target.value)}
            />
            <Input
              label="Pekerjaan"
              value={form.pekerjaan || ""}
              onChange={(e) => update("pekerjaan", e.target.value)}
              placeholder="Mis. Karyawan, Wiraswasta, Mahasiswa"
            />
            <Input
              label="Hobi"
              value={form.hobi || ""}
              onChange={(e) => update("hobi", e.target.value)}
              placeholder="Mis. Membaca, olahraga, traveling"
            />
          </div>
        </section>

        <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40">
            <h3 className="text-ios-body font-semibold text-surface-text">
              Alamat
            </h3>
          </div>
          <div className="p-4">
            <Textarea
              label="Alamat Rumah"
              value={form.alamat_rumah || ""}
              onChange={(e) => update("alamat_rumah", e.target.value)}
              placeholder="Mis. Jl. Merdeka No. 10, RT 02/RW 03"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Desa"
                value={form.desa || ""}
                onChange={(e) => update("desa", e.target.value)}
                placeholder="Mis. Medokan Semampir"
              />
              <Input
                label="Daerah"
                value={form.daerah || ""}
                onChange={(e) => update("daerah", e.target.value)}
                placeholder="Mis. Surabaya"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40">
            <h3 className="text-ios-body font-semibold text-surface-text">
              Pendidikan
            </h3>
          </div>
          <div className="p-4">
            <Select
              label="Jenjang"
              value={form.jenjang_pendidikan || ""}
              onChange={(e) => update("jenjang_pendidikan", e.target.value)}
            >
              <option value="">Pilih jenjang pendidikan</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Sekolah"
                value={form.sekolah || ""}
                onChange={(e) => update("sekolah", e.target.value)}
                placeholder="Mis. Universitas Airlangga"
              />
              <Input
                label="Jurusan"
                value={form.jurusan || ""}
                onChange={(e) => update("jurusan", e.target.value)}
                placeholder="Mis. Teknik Informatika"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tahun Mulai"
                type="number"
                inputMode="numeric"
                value={form.tahun_mulai_pendidikan || ""}
                onChange={(e) =>
                  update("tahun_mulai_pendidikan", e.target.value)
                }
                placeholder="Mis. 2018"
              />
              <Input
                label="Tahun Selesai"
                type="number"
                inputMode="numeric"
                value={form.tahun_selesai_pendidikan || ""}
                onChange={(e) =>
                  update("tahun_selesai_pendidikan", e.target.value)
                }
                placeholder="Mis. 2022"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40">
            <h3 className="text-ios-body font-semibold text-surface-text">
              Status & Data Tambahan
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <ModernCheckbox
              checked={!!form.is_nikah}
              onChange={(v) => update("is_nikah", v)}
              label="Sudah menikah"
            />
            <ModernCheckbox
              checked={!!form.is_kerja}
              onChange={(v) => update("is_kerja", v)}
              label="Sedang bekerja"
            />
            {!form.is_nikah && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Input
                  label="Tinggi Badan (cm)"
                  type="number"
                  inputMode="numeric"
                  value={form.tinggi_badan || ""}
                  onChange={(e) => update("tinggi_badan", e.target.value)}
                  placeholder="Mis. 170"
                />
                <Input
                  label="Berat Badan (kg)"
                  type="number"
                  inputMode="numeric"
                  value={form.berat_badan || ""}
                  onChange={(e) => update("berat_badan", e.target.value)}
                  placeholder="Mis. 60"
                />
              </div>
            )}
          </div>
        </section>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="pointer-events-none h-6 bg-gradient-to-t from-surface-bg to-transparent" />

        <div className="bg-surface-bg backdrop-blur-xl border-t border-surface-border pb-safe">
          <div className="app-shell px-5 pt-3 pb-4">
            <Button
              type="submit"
              form="member-edit-form"
              fullWidth
              disabled={submitting || compressing}
            >
              {submitting
                ? "Menyimpan..."
                : compressing
                  ? "Mengkompres..."
                  : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Hapus foto profil?"
        description="Anda bisa upload foto baru kapan saja."
        confirmLabel="Ya, Hapus"
        danger
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeletePhoto}
      />

      <LoadingOverlay open={submitting} label="Menyimpan biodata..." />
      <LoadingOverlay open={deletingPhoto} label="Menghapus foto..." />
    </AppLayout>
  );
}

function LockedField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-surface-border last:border-b-0">
      <span className="text-ios-footnote text-surface-muted flex-shrink-0">
        {label}
      </span>
      <span className="text-ios-body text-surface-text text-right truncate flex items-center gap-1.5">
        <Lock size={11} className="text-surface-muted/50 flex-shrink-0" />
        {value || "-"}
      </span>
    </div>
  );
}

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
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 active:scale-[0.99] text-left ${
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
