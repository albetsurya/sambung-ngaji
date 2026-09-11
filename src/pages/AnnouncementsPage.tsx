import { useEffect, useState } from "react";
import { AlertTriangle, Megaphone, Copy, Share2, Calendar } from "lucide-react";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Badge,
  Button,
  Select,
  Input,
  Textarea,
  BottomSheet,
  Modal,
  ErrorState,
  EmptyState,
  GroupedList,
  ListRow,
} from "../components/common";
import { announcementApi, groupApi } from "../services/domainApi";
import type { Announcement, AnnouncementTemplate, Group } from "../types";
import { formatDateShort, getHariFromDate } from "../utils/format";
import { JADWAL_RUTIN } from "../constants";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";

/* -------------------------------------------------------------------------- */
/*                              Status Config                                 */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "ink" | "emerald" | "amber" | "red" }
> = {
  DRAFT: { label: "Draft", color: "ink" },
  SHARED: { label: "Terkirim", color: "emerald" },
  PENDING: { label: "Menunggu", color: "amber" },
};

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function AnnouncementsPage() {
  const { isAdminLike } = usePermission();
  const { showToast } = useToast();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState<Announcement | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await announcementApi.list();
      setList(res);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat pengumuman",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout
      fab={
        isAdminLike ? (
          <FloatingActionButton onClick={() => setCreateOpen(true)} />
        ) : undefined
      }
    >
      <Header title="Pengumuman" subtitle="Template WhatsApp pengajian" />

      <div className="flex flex-col flex-1">
        {loading && <AnnouncementListSkeleton rows={5} />}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && list.length === 0 && (
          <EmptyState
            title="Belum ada pengumuman"
            description="Buat pengumuman pertama untuk jadwal pengajian rutin."
            action={
              isAdminLike ? (
                <Button onClick={() => setCreateOpen(true)}>
                  Buat Pengumuman
                </Button>
              ) : undefined
            }
          />
        )}

        {!loading && !error && list.length > 0 && (
          <div className="py-3">
            <GroupedList>
              {list.map((a, i) => {
                const status = STATUS_CONFIG[a.status] || {
                  label: a.status,
                  color: "ink" as const,
                };
                return (
                  <ListRow
                    key={a.announcement_id}
                    onClick={() => setPreview(a)}
                    insetDivider={i !== list.length - 1}
                    leading={
                      <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                        <Megaphone size={16} />
                      </span>
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {a.acara || "Pengumuman"}
                        </p>
                        <p className="text-ios-footnote text-surface-muted truncate">
                          {a.hari}, {formatDateShort(a.tanggal)}
                        </p>
                      </div>
                      <Badge color={status.color}>{status.label}</Badge>
                    </div>
                  </ListRow>
                );
              })}
            </GroupedList>
          </div>
        )}
      </div>

      <CreateAnnouncementSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(a) => {
          setList((prev) => [a, ...prev]);
          setPreview(a);
        }}
      />

      <PreviewModal announcement={preview} onClose={() => setPreview(null)} />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Preview Modal                                 */
/* -------------------------------------------------------------------------- */

function PreviewModal({
  announcement,
  onClose,
}: {
  announcement: Announcement | null;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  if (!announcement) return null;

  const status = STATUS_CONFIG[announcement.status] || {
    label: announcement.status,
    color: "ink" as const,
  };

  async function copyText() {
    try {
      await navigator.clipboard.writeText(announcement!.generated_text);
      showToast("Teks disalin");
    } catch {
      showToast("Gagal menyalin teks", "error");
    }
  }

  async function shareWA() {
    if (navigator.share) {
      try {
        await navigator.share({ text: announcement!.generated_text });
      } catch {
        /* user membatalkan share, abaikan */
      }
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(
        announcement!.generated_text,
      )}`;
      window.open(url, "_blank");
    }
  }

  return (
    <Modal open={!!announcement} onClose={onClose} title="Preview Pengumuman">
      {/* Metadata */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge color={status.color}>{status.label}</Badge>
        <span className="text-ios-caption text-surface-muted">
          {announcement.hari}, {formatDateShort(announcement.tanggal)}
        </span>
      </div>

      {/* Preview text */}
      <div className="rounded-2xl border border-surface-border p-4 mb-4 max-h-[45vh] overflow-y-auto bg-accent-soft/40">
        <pre className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-surface-text font-sans">
          {announcement.generated_text}
        </pre>
      </div>

      {/* Actions — icon-only untuk salin, icon+teks untuk bagikan */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          iconOnly
          aria-label="Salin teks pengumuman"
          onClick={copyText}
        >
          <Copy size={18} />
        </Button>
        <Button fullWidth leftIcon={<Share2 size={16} />} onClick={shareWA}>
          Bagikan
        </Button>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Create Announcement Sheet                         */
/* -------------------------------------------------------------------------- */

function CreateAnnouncementSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (a: Announcement) => void;
}) {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jam, setJam] = useState("Isya di tempat");
  const [acara, setAcara] = useState("Sambung Kelompok");
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  /* Reset form ketika sheet dibuka kembali */
  useEffect(() => {
    if (!open) return;

    announcementApi.templates().then((t) => {
      setTemplates(t);
      if (t[0]) setTemplateId(t[0].template_id);
    });
    groupApi.list().then(setGroups);

    // Reset ke nilai default
    setGroupId("");
    setTanggal(new Date().toISOString().slice(0, 10));
    setJam("Isya di tempat");
    setAcara("Sambung Kelompok");
    setMateri("");
    setCatatan("");
  }, [open]);

  const hari = getHariFromDate(tanggal);
  const isRoutine = JADWAL_RUTIN.includes(hari);

  async function handleCreate() {
    setSaving(true);
    try {
      const created = await announcementApi.create({
        template_id: templateId,
        group_id: groupId,
        tanggal,
        jam,
        acara,
        materi,
        catatan,
      });
      showToast("Pengumuman dibuat");
      onCreated(created);
      onClose();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat pengumuman",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Buat Pengumuman">
      <Select
        label="Template"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
      >
        {templates.map((t) => (
          <option key={t.template_id} value={t.template_id}>
            {t.nama_template}
          </option>
        ))}
      </Select>

      <Select
        label="Kelompok"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      >
        <option value="">Pilih kelompok</option>
        {groups.map((g) => (
          <option key={g.group_id} value={g.group_id}>
            {g.group_name}
          </option>
        ))}
      </Select>

      <Input
        label="Tanggal"
        type="date"
        value={tanggal}
        onChange={(e) => setTanggal(e.target.value)}
        hint={`Hari: ${hari}`}
      />

      {/* Warning jadwal rutin — di bawah input tanggal, tidak overlap */}
      {!isRoutine && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-soft border border-warning/20 mb-4 -mt-2">
          <AlertTriangle
            size={14}
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <p className="text-ios-footnote text-warning leading-relaxed">
            Tanggal ini bukan jadwal rutin pengajian (Minggu/Selasa/Kamis).
          </p>
        </div>
      )}

      <Input label="Jam" value={jam} onChange={(e) => setJam(e.target.value)} />
      <Input
        label="Acara"
        value={acara}
        onChange={(e) => setAcara(e.target.value)}
      />
      <Textarea
        label="Materi"
        value={materi}
        onChange={(e) => setMateri(e.target.value)}
        placeholder="Tema atau materi pengajian"
      />
      <Textarea
        label="Catatan (NB)"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Catatan tambahan (opsional)"
      />

      <Button
        fullWidth
        onClick={handleCreate}
        disabled={saving || !groupId || !templateId}
      >
        {saving ? "Membuat..." : "Generate & Preview"}
      </Button>
    </BottomSheet>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Announcement List Skeleton                        */
/* -------------------------------------------------------------------------- */

function AnnouncementListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="py-3">
      <div className="mx-4 my-4 bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 min-h-[60px] px-4 py-3 ${
              i !== rows - 1 ? "border-b border-surface-border" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-surface-card2 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-2/5 rounded-md bg-surface-card2 animate-pulse" />
              <div className="h-3 w-1/3 rounded-md bg-surface-card2 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-surface-card2 animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
