import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Copy, Share2 } from "../components/common/FontAwesomeIcons";
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
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "ink" | "emerald" | "amber" | "red" }
> = {
  DRAFT: { label: "Draft", color: "ink" },
  SHARED: { label: "Terkirim", color: "emerald" },
  PENDING: { label: "Menunggu", color: "amber" },
};

export default function AnnouncementsPage() {
  const { isAdminLike } = usePermission();
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState<Announcement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: list = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.announcements(),
    queryFn: () => announcementApi.list(),
    staleTime: 60_000,
  });

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
        {isLoading && <AnnouncementListSkeleton rows={5} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat pengumuman"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && list.length === 0 && (
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

        {!isLoading && !error && list.length > 0 && (
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
          queryClient.invalidateQueries({
            queryKey: queryKeys.announcements(),
          });
          setPreview(a);
        }}
      />

      <PreviewModal announcement={preview} onClose={() => setPreview(null)} />
    </AppLayout>
  );
}

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
      } catch {}
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(
        announcement!.generated_text,
      )}`;
      window.open(url, "_blank");
    }
  }

  return (
    <Modal open={!!announcement} onClose={onClose} title="Preview Pengumuman">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge color={status.color}>{status.label}</Badge>
        <span className="text-ios-caption text-surface-muted">
          {announcement.hari}, {formatDateShort(announcement.tanggal)}
        </span>
      </div>

      <div className="rounded-2xl border border-surface-border p-4 mb-4 max-h-[45vh] overflow-y-auto bg-accent-soft/40">
        <pre className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-surface-text font-sans">
          {announcement.generated_text}
        </pre>
      </div>

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
  const [templateId, setTemplateId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jam, setJam] = useState("Isya di tempat");
  const [acara, setAcara] = useState("Sambung Kelompok");
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ["announcement-templates"],
    queryFn: () => announcementApi.templates(),
    enabled: open,
    staleTime: 10 * 60_000,
  });

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  useMemo(() => {
    if (open && templates.length > 0 && !templateId) {
      setTemplateId(templates[0].template_id);
    }
  }, [open, templates, templateId]);

  useMemo(() => {
    if (open) {
      setGroupId("");
      setTanggal(new Date().toISOString().slice(0, 10));
      setJam("Isya di tempat");
      setAcara("Sambung Kelompok");
      setMateri("");
      setCatatan("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      announcementApi.create({
        template_id: templateId,
        group_id: groupId,
        tanggal,
        jam,
        acara,
        materi,
        catatan,
      }),
    onSuccess: (created) => {
      showToast("Pengumuman dibuat");
      onCreated(created);
      onClose();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat pengumuman",
        "error",
      );
    },
  });

  const hari = getHariFromDate(tanggal);

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
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !groupId || !templateId}
      >
        {mutation.isPending ? "Membuat..." : "Generate & Preview"}
      </Button>
    </BottomSheet>
  );
}

function AnnouncementListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="py-3">
      <div className="mx-4 my-2 bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
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
