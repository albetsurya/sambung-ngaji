import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Pencil,
  User,
  MapPin,
  Heart,
  Briefcase,
  Check,
  Loader2,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, Input, Select, Textarea } from "../components/ui";
import { memberApi } from "../features/member/api/memberApi";
import { uploadApi, groupApi } from "../services/domainApi";
import type { Group, Member } from "../types";
import {
  getCategoryLabel,
  getMemberCategory,
  normalizePhoneNumber,
} from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { DateInput } from "../components/ui/DateInput";
import { queryKeys } from "../lib/queryClient";
import { useKeyboardVisible } from "../hooks/useKeyboardVisible";


const emptyForm: Partial<Member> = {
  full_name: "",
  nickname: "",
  gender: "L",
  birth_place: "",
  birth_date: "",
  group_id: "",
  group_label: "",
  village: "",
  region: "",
  home_address: "",
  whatsapp_number: "",
  is_married: false,
  is_employed: false,
  is_preacher: false,
  height: "",
  weight: "",
  hobby: "",
  occupation: "",
};


export default function MemberFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Member>>(emptyForm);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [compressing, setCompressing] = useState(false);
  const keyboardOpen = useKeyboardVisible();
  const { isSuperAdmin, assignedGroup } = usePermission();

  useEffect(() => {
    groupApi
      .list()
      .then((res) => {
        setGroups(res);
        if (!isEdit && !isSuperAdmin && assignedGroup) {
          const matched = res.find(
            (g) => g.group_id === assignedGroup || g.group_name === assignedGroup
          );
          if (matched) {
            setForm((f) => ({ ...f, group_id: matched.group_id, group_label: matched.group_name }));
          }
        }
      })
      .catch(() => {});
    if (isEdit && id) {
      memberApi
        .detail(id)
        .then((m) => {
          setForm(m);
          setPhotoPreview(m.photo_url || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Backfill group_id untuk data lama yang hanya punya kelompok (nama).
  useEffect(() => {
    if (!groups.length) return;
    setForm((f) => {
      if (f.group_id) return f;
      if (!f.group_label && !f.group_name) return f;
      const name = f.group_label || f.group_name || "";
      const matched =
        groups.find((g) => g.group_name === name) ||
        groups.find(
          (g) => g.group_name.toLowerCase() === String(name).toLowerCase()
        );
      if (!matched) return f;
      return { ...f, group_id: matched.group_id, group_label: matched.group_name };
    });
  }, [groups]);

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
      const { default: imageCompression } = await import(
        "browser-image-compression"
      );
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
      const matched = groups.find(
        (g) => g.group_id === form.group_id || g.group_name === form.group_label
      );
      const payload = {
        ...form,
        group_id: form.group_id || matched?.group_id || "",
        group_label: matched?.group_name || form.group_label || "",
        whatsapp_number: form.whatsapp_number ? normalizePhoneNumber(form.whatsapp_number) : "",
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
      if (memberId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.memberDetail(memberId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.attendanceByMember(memberId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.members() });
      queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });

      showToast(isEdit ? "Data jamaah diperbarui" : "Jamaah baru ditambahkan");
      navigate(memberId ? `/jamaah/${memberId}` : "/jamaah", {
        replace: true,
      });
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
              Kategori: {getCategoryLabel(previewCategory)}
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
            value={form.full_name || ""}
            onChange={(e) => update("full_name", e.target.value)}
            placeholder="Nama sesuai KTP"
          />
          <Input
            label="Nama Panggilan"
            value={form.nickname || ""}
            onChange={(e) => update("nickname", e.target.value)}
            placeholder="Nama sehari-hari"
          />
          <Select
            label="Jenis Kelamin"
            value={form.gender || "L"}
            onChange={(e) =>
              update("gender", e.target.value as Member["gender"])
            }
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tempat Lahir"
              value={form.birth_place || ""}
              onChange={(e) => update("birth_place", e.target.value)}
              placeholder="Kota"
            />
            <DateInput
              label="Tanggal Lahir"
              value={form.birth_date || ""}
              onChange={(iso) => update("birth_date", iso)}
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
            value={form.group_id || ""}
            disabled={!isSuperAdmin && !isEdit && !!assignedGroup}
            onChange={(e) => {
              const gid = e.target.value;
              const g = groups.find((x) => x.group_id === gid);
              setForm((f) => ({ ...f, group_id: gid, group_label: g?.group_name || "" }));
            }}
            hint={!isSuperAdmin && !isEdit && !!assignedGroup ? "Otomatis diisi sesuai kelompok Anda" : undefined}
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
              value={form.village || ""}
              onChange={(e) => update("village", e.target.value)}
              placeholder="Nama desa"
            />
            <Input
              label="Daerah"
              value={form.region || ""}
              onChange={(e) => update("region", e.target.value)}
              placeholder="Nama daerah"
            />
          </div>
          <Textarea
            label="Alamat Rumah"
            value={form.home_address || ""}
            onChange={(e) => update("home_address", e.target.value)}
            placeholder="Alamat lengkap"
          />
          <Input
            label="No. WhatsApp"
            placeholder="0812xxxxxxxx"
            inputMode="tel"
            value={form.whatsapp_number || ""}
            onChange={(e) => update("whatsapp_number", e.target.value)}
          />
        </FormSection>

        <FormSection
          icon={<Heart size={16} />}
          title="Status & Data Tambahan"
          description="Informasi pembinaan"
        >
          <ModernCheckbox
            checked={!!form.is_married}
            onChange={(v) => update("is_married", v)}
            label="Sudah menikah"
            description="Centang jika jamaah sudah menikah"
          />

          {!form.is_married && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tinggi Badan (cm)"
                  type="number"
                  inputMode="numeric"
                  value={form.height || ""}
                  onChange={(e) => update("height", e.target.value)}
                  placeholder="170"
                />
                <Input
                  label="Berat Badan (kg)"
                  type="number"
                  inputMode="numeric"
                  value={form.weight || ""}
                  onChange={(e) => update("weight", e.target.value)}
                  placeholder="60"
                />
              </div>
              <Input
                label="Hobi"
                value={form.hobby || ""}
                onChange={(e) => update("hobby", e.target.value)}
                placeholder="Membaca, olahraga, dll"
              />
            </div>
          )}

          <ModernCheckbox
            checked={!!form.is_preacher}
            onChange={(v) => update("is_preacher", v)}
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
            value={form.occupation || ""}
            onChange={(e) => update("occupation", e.target.value)}
            placeholder="Contoh: Karyawan, Wiraswasta"
          />
        </FormSection>
      </form>

      <div
        className={`fixed bottom-0 left-0 right-0 md:left-64 z-30 transition-transform duration-200 ${
          keyboardOpen ? "translate-y-full" : ""
        }`}
      >
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

      
      <div className="p-4 flex flex-col gap-4 [&_label]:mb-0">{children}</div>
    </section>
  );
}


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


function MemberFormSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 rounded-2xl bg-surface-card2 animate-pulse" />
        <div className="mt-3 h-6 w-32 rounded-full bg-surface-card2 animate-pulse" />
      </div>

      
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


async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
