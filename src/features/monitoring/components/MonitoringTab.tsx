import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "../../../components/ui/FontAwesomeIcons";
import { Card, Badge, Button, Select, Textarea, BottomSheet } from "../../../components/ui";
import type { MonitoringEntry, MonitoringStatus } from "../../../types";
import { MONITORING_LABEL, formatDateShort } from "../../../utils/format";
import { MONITORING_STATUSES } from "../../../constants";
import { monitoringApi } from "../../../services/domainApi";
import { useToast } from "../../../contexts/ToastContext";
import { ApiError } from "../../../services/api";
import { queryKeys } from "../../../lib/queryClient";
import {
  analyzeAttendance,
  type AttendanceSnapshot,
} from "../utils/monitoringAnalysis";

const STATUS_COLOR: Record<string, "emerald" | "amber" | "red" | "ink"> = {
  AKTIF: "emerald",
  PERLU_PERHATIAN: "amber",
  KURANG_AKTIF: "amber",
  TIDAK_AKTIF: "red",
};

export function MonitoringTab({
  memberId,
  entries,
  attendance = [],
  canWrite,
  onSaved,
}: {
  memberId: string;
  entries: MonitoringEntry[];
  attendance?: AttendanceSnapshot[];
  canWrite: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MonitoringStatus>("AKTIF");
  const [catatan, setCatatan] = useState("");
  const [tindakLanjut, setTindakLanjut] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const analysis = useMemo(() => analyzeAttendance(attendance), [attendance]);

  function handleOpenSheet() {
    setCatatan(analysis.suggestedCatatan);

    if (analysis.alpaStreak >= 3 || analysis.sakitStreak >= 3) {
      setStatus("PERLU_PERHATIAN");
    } else if (analysis.last30Rate < 50 && analysis.last30Total >= 3) {
      setStatus("KURANG_AKTIF");
    } else {
      setStatus("AKTIF");
    }

    setTindakLanjut("");
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await monitoringApi.create({
        member_id: memberId,
        status,
        catatan,
        tindak_lanjut: tindakLanjut,
      });
      showToast("Catatan monitoring disimpan");
      setOpen(false);
      setCatatan("");
      setTindakLanjut("");
      queryClient.invalidateQueries({
        queryKey: queryKeys.monitoring(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberDetail(memberId),
      });
      onSaved();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan monitoring",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      
      {analysis.hasWarning && (
        <div className="rounded-2xl border border-warning/30 bg-warning-soft/50 p-3.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              size={16}
              className="text-warning mt-0.5 flex-shrink-0"
              strokeWidth={2.3}
            />
            <div className="flex-1 min-w-0">
              <p className="text-ios-footnote font-semibold text-warning mb-1.5">
                Perlu Perhatian
              </p>
              <ul className="space-y-1">
                {analysis.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-ios-caption text-warning/90 leading-relaxed"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      
      {canWrite && (
        <Button variant="secondary" fullWidth onClick={handleOpenSheet}>
          + Catatan Monitoring Baru
        </Button>
      )}

      
      {entries.length === 0 && (
        <Card>
          <p className="text-ios-subhead text-surface-muted text-center py-4">
            Belum ada histori monitoring.
          </p>
        </Card>
      )}
      {entries.map((m) => (
        <Card key={m.monitoring_id}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-ios-caption text-surface-muted">
              {formatDateShort(m.tanggal)}
            </span>
            <Badge color={STATUS_COLOR[m.status] || "ink"}>
              {MONITORING_LABEL[m.status]}
            </Badge>
          </div>
          {m.catatan && (
            <p className="text-ios-subhead text-surface-text mb-1 whitespace-pre-line">
              {m.catatan}
            </p>
          )}
          {m.tindak_lanjut && (
            <p className="text-ios-footnote text-surface-muted">
              Tindak lanjut: {m.tindak_lanjut}
            </p>
          )}
        </Card>
      ))}

      
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Catatan Monitoring"
      >
        
        {analysis.hasWarning && (
          <div className="mb-4 p-3 rounded-xl bg-accent-soft border border-accent/15">
            <p className="text-ios-caption text-accent/90 leading-relaxed">
              Catatan di bawah sudah <strong>diisi otomatis</strong>{" "}
              berdasarkan analisis kehadiran. Silakan edit sesuai kebutuhan.
            </p>
          </div>
        )}

        <Select
          label="Status Pembinaan"
          value={status}
          onChange={(e) => setStatus(e.target.value as MonitoringStatus)}
        >
          {MONITORING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MONITORING_LABEL[s]}
            </option>
          ))}
        </Select>

        <Textarea
          label="Catatan"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Ceritakan kondisi jamaah..."
          rows={5}
        />

        <Textarea
          label="Tindak Lanjut"
          value={tindakLanjut}
          onChange={(e) => setTindakLanjut(e.target.value)}
          placeholder="Langkah yang akan/sudah dilakukan..."
        />

        <Button fullWidth onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </BottomSheet>
    </div>
  );
}
