import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  Pencil,
  User,
  MapPin,
  Heart,
  Briefcase,
  Check,
  Loader2,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, Input, Select, Textarea } from "../components/common";
import { memberApi } from "../services/memberApi";
import { uploadApi, groupApi } from "../services/domainApi";
import type { Group, Member } from "../types";
import { getMemberCategory, normalizePhoneNumber } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import imageCompression from "browser-image-compression";
import { DateInput } from "../components/common/DateInput";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

const emptyForm: Partial<Member> = {
  nama_lengkap: "",
  nama_panggilan: "",
  jenis_kelamin: "L",
  tempat_lahir: "",
  tanggal_lahir: "",
  kelompok: "",
  desa: "",
  daerah: "",
  alamat_rumah: "",
  no_wa: "",
  is_nikah: false,
  is_kerja: false,
  is_muballigh: false,
  tinggi_badan: "",
  berat_badan: "",
  hobi: "",
  pekerjaan: "",
};

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function MemberFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<Partial<Member>>(emptyForm);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    groupApi
      .list()
      .then(setGroups)
      .catch(() => {});
    if (isEdit && id) {
      memberApi
        .detail(id)
        .then((m) => {
          setForm(m);
          setPhotoPreview(m.foto_url || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  const previewCategory = getMemberCategory(form);

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
    } catch (err) {
      console.error("Kompres gagal:", err);
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      showToast("Foto dikompres gagal, pakai file asli", "warning");
    } finally {
      setCompressing(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        no_wa: form.no_wa ? normalizePhoneNumber(form.no_wa) : "",
      };
      let memberId = id;
      if (isEdit && id) {
        await memberApi.update(id, payload);
      } else {
        const created = await memberApi.create(payload);
        memberId = created.member_id;
      }
      if (photoFile && memberId) {
        const base64 = await fileToBase64(photoFile);
        await uploadApi.photo(memberId, base64, photoFile.type);
      }
      showToast(isEdit ? "Data jamaah diperbarui" : "Jamaah baru ditambahkan");
      navigate(memberId ? `/jamaah/${memberId}` : "/jamaah");
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
        <Header
          title={isEdit ? "Edit Jamaah" : "Tambah Jamaah"}
          onBack={() => navigate(-1)}
        />
        <MemberFormSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      <Header
        title={isEdit ? "Edit Jamaah" : "Tambah Jamaah"}
        onBack={() => navigate(-1)}
      />

      <form
        onSubmit={handleSubmit}
        className="px-4 py-4 pb-40 space-y-4"
        id="member-form"
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

          {previewCategory && !compressing && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-ios-footnote font-medium text-accent bg-accent-soft px-3 py-1.5 rounded-full">
              <Check size={12} strokeWidth={3} />
              Kategori: {previewCategory}
            </div>
          )}
        </div>

        <FormSection
          icon={<User size={16} />}
          title="Data Diri"
          description="Informasi dasar jamaah"
        >
          <Input
            label="Nama Lengkap"
            required
            value={form.nama_lengkap || ""}
            onChange={(e) => update("nama_lengkap", e.target.value)}
            placeholder="Nama sesuai KTP"
          />
          <Input
            label="Nama Panggilan"
            value={form.nama_panggilan || ""}
            onChange={(e) => update("nama_panggilan", e.target.value)}
            placeholder="Nama sehari-hari"
          />
          <Select
            label="Jenis Kelamin"
            value={form.jenis_kelamin || "L"}
            onChange={(e) =>
              update("jenis_kelamin", e.target.value as Member["jenis_kelamin"])
            }
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tempat Lahir"
              value={form.tempat_lahir || ""}
              onChange={(e) => update("tempat_lahir", e.target.value)}
              placeholder="Kota"
            />
            <DateInput
              label="Tanggal Lahir"
              value={form.tanggal_lahir || ""}
              onChange={(iso) => update("tanggal_lahir", iso)}
            />
          </div>
        </FormSection>

        <FormSection
          icon={<MapPin size={16} />}
          title="Alamat & Kontak"
          description="Domisili dan kontak jamaah"
        >
          <Select
            label="Kelompok"
            value={form.kelompok || ""}
            onChange={(e) => update("kelompok", e.target.value)}
          >
            <option value="">Pilih kelompok</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Desa"
              value={form.desa || ""}
              onChange={(e) => update("desa", e.target.value)}
              placeholder="Nama desa"
            />
            <Input
              label="Daerah"
              value={form.daerah || ""}
              onChange={(e) => update("daerah", e.target.value)}
              placeholder="Nama daerah"
            />
          </div>
          <Textarea
            label="Alamat Rumah"
            value={form.alamat_rumah || ""}
            onChange={(e) => update("alamat_rumah", e.target.value)}
            placeholder="Alamat lengkap"
          />
          <Input
            label="No. WhatsApp"
            placeholder="0812xxxxxxxx"
            inputMode="tel"
            value={form.no_wa || ""}
            onChange={(e) => update("no_wa", e.target.value)}
          />
        </FormSection>

        <FormSection
          icon={<Heart size={16} />}
          title="Status & Data Tambahan"
          description="Informasi pembinaan"
        >
          <ModernCheckbox
            checked={!!form.is_nikah}
            onChange={(v) => update("is_nikah", v)}
            label="Sudah menikah"
            description="Centang jika jamaah sudah menikah"
          />

          {!form.is_nikah && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tinggi Badan (cm)"
                  type="number"
                  inputMode="numeric"
                  value={form.tinggi_badan || ""}
                  onChange={(e) => update("tinggi_badan", e.target.value)}
                  placeholder="170"
                />
                <Input
                  label="Berat Badan (kg)"
                  type="number"
                  inputMode="numeric"
                  value={form.berat_badan || ""}
                  onChange={(e) => update("berat_badan", e.target.value)}
                  placeholder="60"
                />
              </div>
              <Input
                label="Hobi"
                value={form.hobi || ""}
                onChange={(e) => update("hobi", e.target.value)}
                placeholder="Membaca, olahraga, dll"
              />
            </div>
          )}

          <ModernCheckbox
            checked={!!form.is_muballigh}
            onChange={(v) => update("is_muballigh", v)}
            label="Muballigh"
            description="Centang jika jamaah aktif sebagai muballigh"
          />
        </FormSection>

        <FormSection
          icon={<Briefcase size={16} />}
          title="Pekerjaan"
          description="Aktivitas sehari-hari"
        >
          <Input
            label="Pekerjaan"
            value={form.pekerjaan || ""}
            onChange={(e) => update("pekerjaan", e.target.value)}
            placeholder="Contoh: Karyawan, Wiraswasta"
          />
        </FormSection>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="pointer-events-none h-6 bg-gradient-to-t from-surface-bg to-transparent" />

        <div className="bg-surface-bg backdrop-blur-xl border-t border-surface-border pb-safe">
          <div className="app-shell px-5 pt-3 pb-4">
            <Button
              type="submit"
              form="member-form"
              fullWidth
              disabled={submitting || compressing}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : compressing ? (
                "Mengkompres..."
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Jamaah"
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Form Section                                  */
/* -------------------------------------------------------------------------- */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-ios-body font-semibold text-surface-text">
            {title}
          </h3>
          {description && (
            <p className="text-ios-caption text-surface-muted truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Body section */}
      <div className="p-4">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Modern Checkbox                               */
/* -------------------------------------------------------------------------- */

function ModernCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
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
      <div className="flex-1 min-w-0">
        <p className="text-ios-body font-medium text-surface-text">{label}</p>
        {description && (
          <p className="text-ios-caption text-surface-muted mt-0.5">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Member Form Skeleton                              */
/* -------------------------------------------------------------------------- */

function MemberFormSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Photo skeleton */}
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 rounded-2xl bg-surface-card2 animate-pulse" />
        <div className="mt-3 h-6 w-32 rounded-full bg-surface-card2 animate-pulse" />
      </div>

      {/* Sections skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-card2 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-surface-card2 animate-pulse" />
              <div className="h-3 w-32 rounded bg-surface-card2 animate-pulse" />
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: i === 0 ? 3 : 2 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-20 rounded bg-surface-card2 animate-pulse" />
                <div className="h-12 w-full rounded-2xl bg-surface-card2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

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
