import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  ScrollText,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle,
} from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Badge,
  Button,
  Input,
  Textarea,
  BottomSheet,
  ConfirmDialog,
  ErrorState,
  EmptyState,
  GroupedList,
  ListRow,
  Modal,
} from "../components/common";
import { announcementTemplateApi } from "../services/domainApi";
import type { AnnouncementTemplate } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";

const TEMPLATE_VARIABLES = [
  "{{nama_kelompok}}",
  "{{hari}}",
  "{{tanggal}}",
  "{{jam}}",
  "{{acara}}",
  "{{materi}}",
  "{{catatan}}",
  "{{penandatangan}}",
];

export default function AnnouncementTemplatesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementTemplate | null>(null);
  const [preview, setPreview] = useState<AnnouncementTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementTemplate | null>(
    null,
  );

  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["announcement-templates-all"],
    queryFn: () => announcementTemplateApi.listAll(true),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (template_id: string) =>
      announcementTemplateApi.remove(template_id),
    onSuccess: () => {
      showToast("Template dihapus");
      setDeleteTarget(null);
      queryClient.invalidateQueries({
        queryKey: ["announcement-templates-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["announcement-templates"],
      });
    },
    onError: (err) => {
      setDeleteTarget(null);
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus template",
        "error",
      );
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (template_id: string) =>
      announcementTemplateApi.update(template_id, { status_aktif: true }),
    onSuccess: () => {
      showToast("Template diaktifkan kembali");
      queryClient.invalidateQueries({
        queryKey: ["announcement-templates-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["announcement-templates"],
      });
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal mengaktifkan",
        "error",
      );
    },
  });

  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(t: AnnouncementTemplate) {
    setEditing(t);
    setEditorOpen(true);
  }

  return (
    <AppLayout
      hideNav
      fab={<FloatingActionButton onClick={openCreate} label="Template Baru" />}
    >
      <Header
        title="Template Pengumuman"
        subtitle={`${templates.length} template`}
        onBack={() => navigate("/pengumuman")}
        backLabel="Pengumuman"
        showSyncButton={false}
      />

      <div className="flex flex-col flex-1">
        {isLoading && (
          <div className="py-8 text-center text-ios-footnote text-surface-muted">
            Memuat...
          </div>
        )}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat template"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && templates.length === 0 && (
          <EmptyState
            title="Belum ada template"
            description="Buat template pertama untuk dipakai di pengumuman."
            action={<Button onClick={openCreate}>Buat Template</Button>}
          />
        )}

        {!isLoading && !error && templates.length > 0 && (
          <div className="py-3">
            <GroupedList>
              {templates.map((t, i) => {
                const active = t.status_aktif !== false;
                return (
                  <ListRow
                    key={t.template_id}
                    insetDivider={i !== templates.length - 1}
                    leading={
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? "bg-accent-soft text-accent"
                            : "bg-surface-card2 text-surface-muted"
                        }`}
                      >
                        <ScrollText size={16} />
                      </span>
                    }
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-ios-body font-medium truncate ${
                            active
                              ? "text-surface-text"
                              : "text-surface-muted line-through"
                          }`}
                        >
                          {t.nama_template}
                        </p>
                        <p className="text-ios-caption text-surface-muted truncate">
                          {t.kode}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!active && <Badge color="ink">Nonaktif</Badge>}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview(t);
                          }}
                          aria-label="Lihat template"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted hover:bg-surface-card2 hover:text-accent transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(t);
                          }}
                          aria-label="Edit template"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted hover:bg-info-soft hover:text-info transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {active ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(t);
                            }}
                            aria-label="Nonaktifkan template"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted hover:bg-danger-soft hover:text-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              reactivateMutation.mutate(t.template_id);
                            }}
                            aria-label="Aktifkan template"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted hover:bg-accent-soft hover:text-accent transition-colors"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </ListRow>
                );
              })}
            </GroupedList>
          </div>
        )}
      </div>

      {/* Editor Sheet */}
      <TemplateEditorSheet
        open={editorOpen}
        editing={editing}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setEditorOpen(false);
          setEditing(null);
          queryClient.invalidateQueries({
            queryKey: ["announcement-templates-all"],
          });
          queryClient.invalidateQueries({
            queryKey: ["announcement-templates"],
          });
        }}
      />

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={preview}
        onClose={() => setPreview(null)}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Nonaktifkan template?"
        description={
          deleteTarget
            ? `Template "${deleteTarget.nama_template}" akan dinonaktifkan. Anda bisa mengaktifkan kembali nanti.`
            : ""
        }
        confirmLabel="Nonaktifkan"
        danger
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.template_id);
          }
        }}
      />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                          EDITOR SHEET                                      */
/* -------------------------------------------------------------------------- */

function TemplateEditorSheet({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: AnnouncementTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const isEdit = !!editing;

  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [isi, setIsi] = useState("");
  const [active, setActive] = useState(true);

  // Sinkronisasi saat sheet dibuka
  useMemo(() => {
    if (!open) return;
    if (editing) {
      setNama(editing.nama_template || "");
      setKode(editing.kode || "");
      setIsi(editing.isi_template || "");
      setActive(editing.status_aktif !== false);
    } else {
      setNama("");
      setKode("");
      setIsi("");
      setActive(true);
    }
  }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        nama_template: nama.trim(),
        kode: kode.trim().toUpperCase(),
        isi_template: isi,
        status_aktif: active,
      };
      if (isEdit && editing) {
        return announcementTemplateApi.update(editing.template_id, payload);
      }
      return announcementTemplateApi.create(payload);
    },
    onSuccess: () => {
      showToast(isEdit ? "Template diperbarui" : "Template dibuat");
      onSaved();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "Gagal memperbarui template"
            : "Gagal membuat template",
        "error",
      );
    },
  });

  function insertVariable(v: string) {
    setIsi((prev) => prev + v);
  }

  const canSubmit =
    nama.trim().length >= 3 && kode.trim().length >= 3 && isi.trim().length > 0;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Template" : "Template Baru"}
    >
      <Input
        label="Nama Template"
        placeholder="Undangan Sambung Kelompok"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />

      <Input
        label="Kode"
        placeholder="UNDANGAN_SAMBUNG"
        value={kode}
        onChange={(e) => setKode(e.target.value.toUpperCase())}
        hint="Huruf kapital, angka, underscore. Contoh: UNDANGAN_SAMBUNG"
      />

      <Textarea
        label="Isi Template"
        value={isi}
        onChange={(e) => setIsi(e.target.value)}
        placeholder="Assalamu'alaikum..."
        rows={8}
      />

      {/* Variable chips */}
      <div className="mb-3">
        <p className="text-ios-caption text-surface-muted mb-2 px-1">
          Variabel tersedia (tap untuk sisipkan):
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="px-2 py-1 rounded-md text-[11px] font-mono bg-surface-card2 text-surface-muted border border-surface-border hover:bg-accent-soft hover:text-accent transition-colors active:scale-[0.97]"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Status toggle */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                active
                  ? "bg-accent-soft text-accent"
                  : "bg-surface-card2 text-surface-muted"
              }`}
            >
              {active ? <Eye size={14} /> : <EyeOff size={14} />}
            </span>
            <div className="text-left">
              <p className="text-ios-body font-medium text-surface-text">
                Status Aktif
              </p>
              <p className="text-ios-caption text-surface-muted">
                {active ? "Template bisa dipakai" : "Template disembunyikan"}
              </p>
            </div>
          </div>
          <span
            className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors shrink-0 ${
              active ? "bg-accent" : "bg-surface-card2"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                active ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </div>

      <Button
        fullWidth
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !canSubmit}
      >
        {mutation.isPending
          ? "Menyimpan..."
          : isEdit
            ? "Simpan Perubahan"
            : "Buat Template"}
      </Button>
    </BottomSheet>
  );
}

/* -------------------------------------------------------------------------- */
/*                          PREVIEW MODAL                                     */
/* -------------------------------------------------------------------------- */

function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: AnnouncementTemplate | null;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  if (!template) return null;

  async function copyText() {
    try {
      await navigator.clipboard.writeText(template!.isi_template || "");
      showToast("Template disalin");
    } catch {
      showToast("Gagal menyalin", "error");
    }
  }

  return (
    <Modal open={!!template} onClose={onClose} title={template.nama_template}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge color={template.status_aktif !== false ? "emerald" : "ink"}>
          {template.status_aktif !== false ? "Aktif" : "Nonaktif"}
        </Badge>
        <span className="text-ios-caption font-mono text-surface-muted">
          {template.kode}
        </span>
      </div>

      <div className="rounded-2xl border border-surface-border p-4 mb-4 max-h-[45vh] overflow-y-auto bg-accent-soft/40">
        <pre className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-surface-text font-sans">
          {template.isi_template}
        </pre>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Copy size={16} />}
          onClick={copyText}
        >
          Salin
        </Button>
        <Button fullWidth onClick={onClose}>
          Tutup
        </Button>
      </div>
    </Modal>
  );
}
