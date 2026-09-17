import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { call } from "../../services/api";
import { meetingApi, groupApi } from "../../services/domainApi";
import { queryKeys } from "../../lib/queryClient";
import { useToast } from "../../contexts/ToastContext";
import { Button, Card, Input, Select } from "../common";
import { DateInput } from "../common/DateInput";
import { ApiError } from "../../services/api";
import { MEMBER_CATEGORIES } from "../../constants";
import {
  CATEGORY_LABEL,
  getHariFromDate,
  getTodayIso,
} from "../../utils/format";
import {
  parseMeetingFromPdf,
  type ParsedMeetingDraft,
} from "../../lib/parseDaftarHadir";
import { FileWarning, Check, RefreshCw } from "../common/FontAwesomeIcons";
import type { Meeting, MemberCategory } from "../../types";

/* -------------------------------------------------------------------------- */
/*                              PDF Text Extract                               */
/* -------------------------------------------------------------------------- */

async function extractPdfItems(file: File): Promise<any[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const allItems: any[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    allItems.push(...content.items);
  }
  return allItems;
}

/* -------------------------------------------------------------------------- */
/*                              Phase Types                                    */
/* -------------------------------------------------------------------------- */

type Phase = "upload" | "parsing" | "form";

/* -------------------------------------------------------------------------- */
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */

export function ImportPdfTab() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<Phase>("upload");
  const [fileName, setFileName] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [warning, setWarning] = useState<string | undefined>();

  // Form state — pre-filled dari parser, editable
  const [tanggal, setTanggal] = useState(getTodayIso());
  const [jam, setJam] = useState("");
  const [groupId, setGroupId] = useState("");
  const [acara, setAcara] = useState("");
  const [tempat, setTempat] = useState("");
  const [kategoriTarget, setKategoriTarget] = useState<MemberCategory[]>([]);

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const catatan = tempat ? `Tempat: ${tempat}` : "";
      return meetingApi.create({
        tanggal,
        jam: jam || "",
        group_id: groupId,
        acara,
        materi: "",
        kategori_target: kategoriTarget,
        catatan,
      });
    },
    onSuccess: () => {
      showToast("Jadwal berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["meetings", "calendar"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      resetAll();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal simpan jadwal",
        "error",
      );
    },
  });

  function resetAll() {
    setPhase("upload");
    setFileName("");
    setConfidence(0);
    setWarning(undefined);
    setTanggal(getTodayIso());
    setJam("");
    setGroupId("");
    setAcara("");
    setTempat("");
    setKategoriTarget([]);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("File harus PDF", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran PDF maksimum 10 MB", "error");
      return;
    }

    setFileName(file.name);
    setPhase("parsing");

    try {
      const items = await extractPdfItems(file);
      const parsed: ParsedMeetingDraft = parseMeetingFromPdf(items);

      // Pre-fill form
      if (parsed.tanggal) setTanggal(parsed.tanggal);
      if (parsed.acara) setAcara(parsed.acara);
      if (parsed.tempat) setTempat(parsed.tempat);

      setConfidence(parsed.confidence);
      setWarning(parsed.warning);

      // Kalau confidence sangat rendah, kasih toast warning
      if (parsed.confidence < 40) {
        showToast(
          "Hasil ekstraksi kurang yakin. Mohon periksa & lengkapi manual.",
          "warning",
        );
      }

      setPhase("form");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal baca PDF", "error");
      setPhase("upload");
    }
  }

  function toggleKategori(c: MemberCategory) {
    setKategoriTarget((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  const canSave = !!tanggal && !!acara.trim();

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="px-4 py-4 space-y-4">
      {phase === "upload" && (
        <>
          <div className="rounded-2xl bg-accent-soft border border-accent/15 p-3.5">
            <p className="text-ios-footnote text-accent/90 leading-relaxed">
              Upload PDF undangan/daftar hadir rapat. Sistem akan extract{" "}
              <strong>tanggal</strong>, <strong>acara</strong>, dan{" "}
              <strong>tempat</strong> secara otomatis. Anda bisa koreksi sebelum
              simpan.
            </p>
          </div>

          <label className="block cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="rounded-2xl border-2 border-dashed border-surface-border bg-surface-card hover:bg-surface-card2 transition-colors p-8 text-center active:scale-[0.99]">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent-soft flex items-center justify-center">
                <FileWarning size={26} className="text-accent" />
              </div>
              <p className="text-ios-body font-medium text-surface-text mb-1">
                Pilih file PDF
              </p>
              <p className="text-ios-caption text-surface-muted">
                Maks. 10 MB · PDF dengan text layer
              </p>
            </div>
          </label>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-card2 border border-surface-border">
            <p className="text-ios-caption text-surface-muted leading-relaxed">
              <strong className="text-surface-text">Catatan:</strong> PDF hasil
              scan gambar tidak bisa dibaca. Gunakan PDF digital (hasil export
              Word/Excel/Google Docs).
            </p>
          </div>
        </>
      )}

      {phase === "parsing" && (
        <div className="rounded-2xl bg-surface-card border border-surface-border p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-ios-body font-medium text-surface-text mb-1">
            Membaca PDF…
          </p>
          <p className="text-ios-caption text-surface-muted truncate">
            {fileName}
          </p>
        </div>
      )}

      {phase === "form" && (
        <>
          {/* Confidence banner */}
          <div
            className={`flex items-start gap-2 p-3 rounded-xl border ${
              confidence >= 70
                ? "bg-success-soft/60 border-success/20"
                : confidence >= 40
                  ? "bg-warning-soft/60 border-warning/20"
                  : "bg-danger-soft/60 border-danger/20"
            }`}
          >
            <Check
              size={14}
              className={`flex-shrink-0 mt-0.5 ${
                confidence >= 70
                  ? "text-success"
                  : confidence >= 40
                    ? "text-warning"
                    : "text-danger"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-ios-footnote font-medium ${
                  confidence >= 70
                    ? "text-success"
                    : confidence >= 40
                      ? "text-warning"
                      : "text-danger"
                }`}
              >
                {confidence >= 70
                  ? "Hasil ekstraksi akurat"
                  : confidence >= 40
                    ? "Hasil ekstraksi cukup akurat"
                    : "Hasil ekstraksi kurang akurat"}
                {" · "}
                {confidence}%
              </p>
              {warning && (
                <p className="text-ios-caption text-surface-muted mt-0.5">
                  {warning}
                </p>
              )}
              <p className="text-ios-caption text-surface-muted mt-0.5">
                Periksa & koreksi sebelum simpan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-card2 border border-surface-border">
            <p className="text-ios-caption text-surface-muted truncate flex-1">
              📄 {fileName}
            </p>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-ios-caption font-medium text-accent hover:opacity-80 flex-shrink-0"
            >
              <RefreshCw size={12} />
              Ganti PDF
            </button>
          </div>

          {/* Form */}
          <Card>
            <DateInput
              label="Tanggal"
              value={tanggal}
              onChange={setTanggal}
              hint={`Hari: ${getHariFromDate(tanggal)}`}
            />

            <Input
              label="Acara"
              value={acara}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcara(e.target.value)}
              placeholder="Sambung Kelompok"
            />

            <Input
              label="Tempat (opsional)"
              value={tempat}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempat(e.target.value)}
              placeholder="Mis. Sugihwaras"
            />

            <Select
              label="Kelompok"
              value={groupId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGroupId(e.target.value)}
            >
              <option value="">Pilih kelompok</option>
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {g.group_name}
                </option>
              ))}
            </Select>

            <Input
              label="Jam (opsional)"
              value={jam}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJam(e.target.value)}
              placeholder="Isya di tempat"
            />

            <div className="mb-2">
              <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
                Kategori Jamaah (opsional)
              </label>
              <div className="flex flex-wrap gap-2">
                {MEMBER_CATEGORIES.map((c) => {
                  const active = kategoriTarget.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleKategori(c)}
                      className={`px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all active:scale-[0.97] ${
                        active
                          ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
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
            onClick={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
          >
            {saveMutation.isPending ? "Menyimpan…" : "Buat Jadwal"}
          </Button>
        </>
      )}
    </div>
  );
}
