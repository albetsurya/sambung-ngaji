import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Button,
  Input,
  Textarea,
  BottomSheet,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Badge,
  LoadingOverlay,
} from "../components/common";
import { DateInput } from "../components/common/DateInput";
import { GroupedListSkeleton } from "../components/common/Skeleton";
import {
  Mosque,
  Pencil,
  Trash2,
  Copy,
  Send,
  CheckCircle2,
  CircleAlert,
  Plus,
} from "../components/common/FontAwesomeIcons";
import { fridayApi } from "../services/domainApi";
import type { FridaySchedule } from "../types";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { formatDateLongText } from "../utils/format";
import {
  FRIDAY_ROLES,
  missingRoles,
  isFridayComplete,
  todayIso,
  isFridayDate,
  buildFridayMessage,
} from "../utils/friday";

type Tab = "upcoming" | "history";

const EMPTY_FORM = {
  tanggal: "",
  khatib_imam: "",
  muadzin: "",
  penasihat: "",
  petugas_parkir: "",
  penata_sandal: "",
  catatan: "",
};

export default function FridaySchedulesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { role, isAdminLike } = usePermission();
  const canEdit = isAdminLike || role === "TIM_ABSENSI";

  const [tab, setTab] = useState<Tab>("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FridaySchedule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<FridaySchedule | null>(
    null,
  );
  const [followUp, setFollowUp] = useState<FridaySchedule | null>(null);

  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.fridaySchedules(),
    queryFn: () => fridayApi.list(),
    staleTime: 5 * 60_000,
  });

  const today = todayIso();
  const upcoming = useMemo(
    () =>
      schedules
        .filter((s) => s.tanggal >= today)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    [schedules, today],
  );
  const past = useMemo(
    () =>
      schedules
        .filter((s) => s.tanggal < today)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [schedules, today],
  );
  const shown = tab === "upcoming" ? upcoming : past;
  const incompleteCount = useMemo(
    () => upcoming.filter((s) => !isFridayComplete(s)).length,
    [upcoming],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.fridaySchedules(),
    });

  const saveMutation = useMutation({
    mutationFn: () =>
      fridayApi.save({
        tanggal: form.tanggal,
        khatib_imam: form.khatib_imam.trim(),
        muadzin: form.muadzin.trim(),
        penasihat: form.penasihat.trim(),
        petugas_parkir: form.petugas_parkir.trim(),
        penata_sandal: form.penata_sandal.trim(),
        catatan: form.catatan.trim(),
      }),
    onSuccess: () => {
      invalidate();
      showToast(
        editing ? "Jadwal petugas diperbarui" : "Jadwal petugas disimpan",
      );
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan jadwal",
        "error",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tanggal: string) => fridayApi.remove(tanggal),
    onSuccess: () => {
      invalidate();
      showToast("Jadwal dihapus");
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus jadwal",
        "error",
      );
    },
  });

  function openCreate() {
    setEditing(null);
    // Default tanggal: Jumat terdekat
    const d = new Date();
    const delta = (5 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + delta);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setForm({ ...EMPTY_FORM, tanggal: iso });
    setFormOpen(true);
  }

  function openEdit(s: FridaySchedule) {
    setEditing(s);
    setForm({
      tanggal: s.tanggal,
      khatib_imam: s.khatib_imam || "",
      muadzin: s.muadzin || "",
      penasihat: s.penasihat || "",
      petugas_parkir: s.petugas_parkir || "",
      penata_sandal: s.penata_sandal || "",
      catatan: s.catatan || "",
    });
    setFormOpen(true);
  }

  const tanggalValid = form.tanggal !== "" && isFridayDate(form.tanggal);
  const hasOneRole = FRIDAY_ROLES.some(
    (r) =>
      form[
        r.key as keyof typeof form
      ]?.trim(),
  );
  const canSave =
    tanggalValid && hasOneRole && !saveMutation.isPending;

  async function copyFollowUp(s: FridaySchedule) {
    try {
      await navigator.clipboard.writeText(buildFridayMessage(s));
      showToast("Teks follow-up disalin");
    } catch {
      showToast("Gagal menyalin teks", "error");
    }
  }

  function sendViaWA(s: FridaySchedule) {
    const url = `https://wa.me/?text=${encodeURIComponent(buildFridayMessage(s))}`;
    window.open(url, "_blank", "noopener");
  }

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <AppLayout
      hideNav
      fab={
        canEdit ? (
          <FloatingActionButton onClick={openCreate} aria-label="Tambah jadwal" />
        ) : undefined
      }
    >
      <Header
        title="Petugas Jumat"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />

      <div className="py-3 px-4 space-y-3">
        {/* Ringkasan */}
        {!isLoading && !error && upcoming.length > 0 && (
          <div className="rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              <Mosque size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-ios-footnote text-surface-muted">
                Jumat terdekat
              </p>
              <p className="text-ios-body font-semibold text-surface-text truncate">
                {formatDateLongText(upcoming[0].tanggal)}
              </p>
            </div>
            {incompleteCount > 0 ? (
              <Badge color="amber">{incompleteCount} belum lengkap</Badge>
            ) : (
              <Badge>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={12} /> Lengkap
                </span>
              </Badge>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-card border border-surface-border">
          {(
            [
              { key: "upcoming", label: `Mendatang (${upcoming.length})` },
              { key: "history", label: `Riwayat (${past.length})` },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-2 rounded-xl text-ios-footnote font-semibold transition-all ${
                tab === t.key
                  ? "bg-accent text-white shadow"
                  : "text-surface-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading && <GroupedListSkeleton rows={4} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat jadwal petugas"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && shown.length === 0 && (
          <EmptyState
            title={
              tab === "upcoming"
                ? "Belum ada jadwal mendatang"
                : "Belum ada riwayat"
            }
            description={
              tab === "upcoming"
                ? "Buat jadwal petugas untuk Jumat berikutnya."
                : "Jadwal yang sudah lewat akan muncul di sini."
            }
            action={
              canEdit && tab === "upcoming" ? (
                <Button onClick={openCreate} rightIcon={<Plus size={15} />}>
                  Buat Jadwal
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading &&
          !error &&
          shown.map((s) => {
            const missing = missingRoles(s);
            const complete = missing.length === 0;
            return (
              <div
                key={s.tanggal}
                className="rounded-2xl border border-surface-border bg-surface-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-ios-body font-semibold text-surface-text">
                      {formatDateLongText(s.tanggal)}
                    </p>
                    <p className="text-ios-caption text-surface-muted">
                      Sholat Jumat
                    </p>
                  </div>
                  {complete ? (
                    <Badge>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 size={12} /> Lengkap
                      </span>
                    </Badge>
                  ) : (
                    <Badge color="amber">
                      <span className="inline-flex items-center gap-1">
                        <CircleAlert size={12} /> {missing.length} kosong
                      </span>
                    </Badge>
                  )}
                </div>

                <div className="divide-y divide-surface-border/60">
                  {FRIDAY_ROLES.map((r) => {
                    const name = (s[r.key] || "").trim();
                    return (
                      <div
                        key={r.key}
                        className="flex items-center justify-between gap-2 py-1.5"
                      >
                        <span className="text-ios-footnote text-surface-muted">
                          {r.label}
                        </span>
                        {name ? (
                          <span className="text-ios-footnote font-medium text-surface-text text-right truncate">
                            {name}
                          </span>
                        ) : (
                          <span className="text-ios-footnote font-medium text-danger">
                            Belum diisi
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {s.catatan?.trim() && (
                  <p className="mt-2 text-ios-footnote text-surface-muted italic">
                    {s.catatan}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {tab === "upcoming" && (
                    <button
                      onClick={() => setFollowUp(s)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent-soft text-accent text-ios-footnote font-semibold active:scale-[0.97]"
                    >
                      <Send size={13} /> Follow Up
                    </button>
                  )}
                  {canEdit && (
                    <>
                      <button
                        onClick={() => openEdit(s)}
                        aria-label="Edit jadwal"
                        className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-surface-border text-surface-muted active:scale-95"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        aria-label="Hapus jadwal"
                        className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-danger/30 text-danger active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Form tambah / edit */}
      <BottomSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Petugas Jumat" : "Jadwal Petugas Baru"}
      >
        <div className="space-y-3 pb-2">
          <DateInput
            label="Tanggal (harus hari Jumat)"
            value={form.tanggal}
            onChange={(v) => set("tanggal", v)}
            disabled={!!editing}
            required
            hint={
              form.tanggal && !tanggalValid
                ? "Tanggal harus jatuh di hari Jumat"
                : undefined
            }
          />
          {FRIDAY_ROLES.map((r) => (
            <Input
              key={r.key}
              label={r.label}
              placeholder={`Nama ${r.short.toLowerCase()}`}
              value={form[r.key as keyof typeof form]}
              onChange={(e) => set(r.key as keyof typeof EMPTY_FORM, e.target.value)}
            />
          ))}
          <Textarea
            label="Catatan"
            placeholder="Catatan tambahan (opsional)"
            rows={2}
            value={form.catatan}
            onChange={(e) => set("catatan", e.target.value)}
          />
          <Button
            fullWidth
            disabled={!canSave}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending
              ? "Menyimpan..."
              : editing
                ? "Simpan Perubahan"
                : "Simpan Jadwal"}
          </Button>
        </div>
      </BottomSheet>

      {/* Follow up */}
      <BottomSheet
        open={!!followUp}
        onClose={() => setFollowUp(null)}
        title="Follow Up Petugas"
      >
        {followUp && (
          <div className="space-y-3 pb-2">
            <p className="text-ios-footnote text-surface-muted">
              {formatDateLongText(followUp.tanggal)} ·{" "}
              {missingRoles(followUp).length === 0
                ? "semua peran terisi, tinggal konfirmasi kehadiran."
                : `${missingRoles(followUp)
                    .map((r) => r.label)
                    .join(", ")} belum terisi.`}
            </p>
            <pre className="whitespace-pre-wrap text-ios-footnote text-surface-text bg-surface-bg rounded-xl border border-surface-border p-3 max-h-64 overflow-y-auto">
              {buildFridayMessage(followUp)}
            </pre>
            <div className="grid grid-cols-2 gap-2">
              <Button
                fullWidth
                onClick={() => copyFollowUp(followUp)}
                rightIcon={<Copy size={14} />}
              >
                Salin Teks
              </Button>
              <Button
                fullWidth
                onClick={() => sendViaWA(followUp)}
                rightIcon={<Send size={14} />}
              >
                Via WhatsApp
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus jadwal ini?"
        description={
          deleteTarget
            ? `Jadwal petugas ${formatDateLongText(deleteTarget.tanggal)} akan dihapus permanen.`
            : ""
        }
        confirmLabel="Ya, Hapus"
        danger
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate(deleteTarget.tanggal)
        }
      />

      <LoadingOverlay
        open={saveMutation.isPending}
        label="Menyimpan jadwal..."
      />
    </AppLayout>
  );
}
