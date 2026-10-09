import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../contexts/ToastContext";
import {
  bulkMeetingApi,
  BulkMeetingPreviewResponse,
  groupApi,
} from "../../../services/domainApi";
import { queryKeys } from "../../../lib/queryClient";
import { ApiError } from "../../../services/api";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  Input,
  Select,
} from "../../../components/ui";
import { MEMBER_CATEGORIES } from "../../../constants";
import { CATEGORY_LABEL } from "../../../utils/format";
import { AlertTriangle, Check } from "../../../components/ui/FontAwesomeIcons";

const HARI_LIST = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const BULAN_LIST = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function BulkCreateTab() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const now = new Date();
  const [tahun, setTahun] = useState(now.getFullYear());
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [day, setDay] = useState<string[]>([]);
  const [time, setTime] = useState("Isya di tempat");
  const [groupId, setGroupId] = useState("");
  const [event, setEvent] = useState("Sambung Kelompok");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [kategoriTarget, setKategoriTarget] = useState<string[]>([]);

  const [preview, setPreview] = useState<BulkMeetingPreviewResponse | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      bulkMeetingApi.preview({
        tahun,
        bulan,
        day,
        time,
        group_id: groupId,
        event,
        topic,
        notes,
        target_categories: kategoriTarget,
      }),
    onSuccess: (data) => {
      setPreview(data);
      setPreviewOpen(true);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal preview",
        "error",
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      bulkMeetingApi.create({
        tahun,
        bulan,
        day,
        time,
        group_id: groupId,
        event,
        topic,
        notes,
        target_categories: kategoriTarget,
      }),
    onSuccess: (data) => {
      setShowConfirm(false);
      setPreviewOpen(false);
      setPreview(null);
      showToast(`${data.created} jadwal berhasil dibuat`);
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      navigate("/more/schedule");
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal buat jadwal",
        "error",
      );
    },
  });

  function toggleHari(h: string) {
    setDay((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );
  }

  function toggleKategori(k: string) {
    setKategoriTarget((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  }

  function handlePreviewClose() {
    setPreviewOpen(false);
    setPreview(null);
  }

  const canPreview =
    day.length > 0 && !!groupId && !!event.trim() && !!time.trim();
  const canSubmit = preview !== null && preview.total_new > 0;

  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      
      <div className="rounded-2xl bg-accent-soft border border-accent/15 p-3.5">
        <p className="text-ios-footnote text-accent/90 leading-relaxed">
          Buat jadwal pengajian sekaligus untuk 1 bulan penuh. Pilih bulan dan
          hari, sistem akan generate semua tanggalnya.
        </p>
      </div>

      
      <Card>
        <p className="text-ios-footnote font-medium text-surface-muted mb-3">
          Periode
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Select
            label="Bulan"
            value={String(bulan)}
            onChange={(e) => setBulan(Number(e.target.value))}
          >
            {BULAN_LIST.map((b, i) => (
              <option key={i} value={i + 1}>
                {b}
              </option>
            ))}
          </Select>
          <Input
            label="Tahun"
            type="number"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
          />
        </div>

        <p className="text-ios-footnote font-medium text-surface-muted mb-2">
          Hari Pengajian ({day.length} dipilih)
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {HARI_LIST.map((h) => {
            const active = day.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleHari(h)}
                className={`px-3 py-1.5 rounded-full text-ios-caption font-medium border transition-all active:scale-[0.97] ${
                  active
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>

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
          label="Jam"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Isya di tempat"
        />

        <Input
          label="Acara"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          placeholder="Sambung Kelompok"
        />

        <Input
          label="Materi (opsional)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <Input
          label="Catatan (opsional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="mt-2">
          <p className="text-ios-footnote font-medium text-surface-muted mb-2">
            Kategori Target ({kategoriTarget.length} dipilih)
          </p>
          <p className="text-ios-caption text-surface-muted mb-3">
            Kosongkan untuk semua kategori
          </p>
          <div className="flex flex-wrap gap-2">
            {MEMBER_CATEGORIES.map((c) => {
              const active = kategoriTarget.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleKategori(c)}
                  className={`px-3 py-1.5 rounded-full text-ios-caption font-medium border transition-all active:scale-[0.97] ${
                    active
                      ? "bg-accent text-white border-accent"
                      : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      
      <Button
        fullWidth
        onClick={() => previewMutation.mutate()}
        disabled={!canPreview || previewMutation.isPending}
      >
        {previewMutation.isPending ? "Memuat preview..." : "Preview Jadwal"}
      </Button>

      
      <BottomSheet
        open={previewOpen}
        onClose={handlePreviewClose}
        title="Hasil Preview"
      >
        {preview && (
          <>
            
            <div className="flex items-center justify-between mb-3">
              <p className="text-ios-caption text-surface-muted">
                Ringkasan
              </p>
              <Badge>{preview.total_new} baru</Badge>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card p-4 mb-4 space-y-2">
              <Row label="Total tanggal" value={preview.total_dates} />
              <Row
                label="Akan dibuat"
                value={preview.total_new}
                highlight
              />
              <Row
                label="Sudah ada (skip)"
                value={preview.total_existing}
                danger={preview.total_existing > 0}
              />
            </div>

            {preview.total_existing > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-soft border border-warning/20 mb-4">
                <AlertTriangle
                  size={16}
                  className="text-warning flex-shrink-0 mt-0.5"
                />
                <p className="text-ios-caption text-warning leading-relaxed">
                  {preview.total_existing} tanggal sudah ada dan akan di-skip
                  otomatis.
                </p>
              </div>
            )}

            
            <p className="text-ios-caption text-surface-muted mb-2">
              Daftar tanggal:
            </p>
            <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden mb-4">
              <div className="max-h-[280px] overflow-y-auto divide-y divide-surface-border">
                {preview.meetings.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2.5 text-ios-footnote ${
                      m.sudah_ada
                        ? "bg-surface-card2/40 text-surface-muted line-through"
                        : "text-surface-text"
                    }`}
                  >
                    <span className="truncate">
                      {m.day}, {m.tanggal_display}
                    </span>
                    {m.sudah_ada && (
                      <span className="text-ios-caption text-surface-muted flex-shrink-0 ml-2">
                        sudah ada
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={handlePreviewClose}>
                Revisi Form
              </Button>
              <Button
                fullWidth
                onClick={() => setShowConfirm(true)}
                disabled={!canSubmit || createMutation.isPending}
              >
                <Check size={16} className="mr-1.5" />
                Buat {preview.total_new} Jadwal
              </Button>
            </div>
          </>
        )}
      </BottomSheet>

      
      <ConfirmDialog
        open={showConfirm}
        title="Konfirmasi Tambah Massal"
        description={
          preview
            ? `Akan dibuat ${preview.total_new} jadwal pengajian. Lanjutkan?`
            : ""
        }
        confirmLabel="Ya, Buat"
        loading={createMutation.isPending}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => createMutation.mutate()}
      />
    </div>
  );
}


function Row({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ios-footnote text-surface-muted">{label}</span>
      <span
        className={`text-ios-body font-semibold tabular-nums ${
          danger
            ? "text-danger"
            : highlight
              ? "text-accent"
              : "text-surface-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
