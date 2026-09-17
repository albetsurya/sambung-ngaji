import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingApi } from "../../services/domainApi";
import { MEMBER_CATEGORIES } from "../../constants";
import { CATEGORY_LABEL } from "../../utils/format";
import { queryKeys } from "../../lib/queryClient";
import { useToast } from "../../contexts/ToastContext";
import { Button, BottomSheet, Input, Card } from "../common";
import { DateInput } from "../common/DateInput";
import { ApiError } from "../../services/api";
import {
  parseMeetingsFromPdf,
  type ParsedMeetingDraft,
} from "../../lib/parseDaftarHadir";
import {
  FileWarning,
  Pencil,
  Trash2,
  Check,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from "../common/FontAwesomeIcons";
import { formatDateShort } from "../../utils/format";
import { GenderTargetPicker } from "./GenderTargetPicker";
import type { GenderTarget } from "./GenderTargetPicker";

/* -------------------------------------------------------------------------- */
/*                              PDF Extract                                    */
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
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */

type Phase = "upload" | "parsing" | "preview";

export function ImportPdfTab() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<Phase>("upload");
  const [fileName, setFileName] = useState("");
  const [drafts, setDrafts] = useState<ParsedMeetingDraft[]>([]);
  const [editing, setEditing] = useState<ParsedMeetingDraft | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (items: ParsedMeetingDraft[]) => {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const item of items) {
        if (!item.tanggal || !item.acara.trim()) {
          failed++;
          continue;
        }
        try {
          await meetingApi.create({
            tanggal: item.tanggal,
            jam: item.jam || "",
            group_id: "",
            acara: item.acara,
            materi: "",
            catatan: item.catatan || "",
            kategori_target: item.kategoriTarget,
            gender_target: item.genderTarget,
          });
          success++;
        } catch (err) {
          failed++;
          if (err instanceof ApiError) errors.push(err.message);
        }
      }

      return { success, failed, errors };
    },
    onSuccess: (result) => {
      if (result.failed > 0) {
        showToast(
          `${result.success} jadwal dibuat, ${result.failed} gagal`,
          "warning",
        );
      } else {
        showToast(`${result.success} jadwal berhasil dibuat`);
      }
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
    setDrafts([]);
    setEditing(null);
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
      const parsed = parseMeetingsFromPdf(items);

      if (parsed.length === 0) {
        showToast(
          "Tidak ada jadwal terdeteksi. Cek apakah PDF punya text layer.",
          "error",
        );
        setPhase("upload");
        return;
      }

      setDrafts(parsed);
      setPhase("preview");
      showToast(`${parsed.length} jadwal terdeteksi`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal baca PDF", "error");
      setPhase("upload");
    }
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  function updateDraft(updated: ParsedMeetingDraft) {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setEditing(null);
  }

  const validDrafts = drafts.filter((d) => d.tanggal && d.acara.trim());

  return (
    <div className="px-4 py-4 space-y-4">
      {phase === "upload" && (
        <>
          <div className="rounded-2xl bg-accent-soft border border-accent/15 p-3.5">
            <p className="text-ios-footnote text-accent/90 leading-relaxed">
              Upload PDF agenda rapat. Setiap point akan jadi 1 jadwal. Tempat &
              peserta otomatis masuk ke catatan.
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
              scan gambar tidak bisa dibaca. Gunakan PDF digital hasil export
              Word/Docs.
            </p>
          </div>
        </>
      )}

      {phase === "parsing" && (
        <div className="rounded-2xl bg-surface-card border border-surface-border p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-ios-body font-medium text-surface-text mb-1">
            Menganalisis PDF…
          </p>
          <p className="text-ios-caption text-surface-muted truncate">
            {fileName}
          </p>
        </div>
      )}

      {phase === "preview" && (
        <>
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-card2 border border-surface-border">
            <p className="text-ios-caption text-surface-muted truncate flex-1">
              📄 {fileName}
            </p>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-ios-caption font-medium text-accent hover:opacity-80 flex-shrink-0"
            >
              <RefreshCw size={12} />
              Ganti
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-soft/60 border border-warning/20">
            <AlertTriangle
              size={14}
              className="text-warning flex-shrink-0 mt-0.5"
            />
            <p className="text-ios-caption text-warning leading-relaxed">
              <strong>{drafts.length} jadwal</strong> terdeteksi. Periksa &
              koreksi sebelum buat.
            </p>
          </div>

          <div className="space-y-2">
            {drafts.map((d, idx) => (
              <DraftCard
                key={d.id}
                index={idx + 1}
                draft={d}
                onEdit={() => setEditing(d)}
                onDelete={() => removeDraft(d.id)}
              />
            ))}
          </div>

          {drafts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
              <p className="text-ios-footnote text-surface-muted">
                Semua item sudah dihapus
              </p>
              <button
                onClick={resetAll}
                className="mt-2 text-ios-footnote font-medium text-accent hover:opacity-80"
              >
                Upload ulang
              </button>
            </div>
          )}

          {drafts.length > 0 && (
            <div className="space-y-2 sticky bottom-0 bg-surface-bg pt-2 -mt-2">
              <Button
                fullWidth
                onClick={() => saveMutation.mutate(validDrafts)}
                disabled={validDrafts.length === 0 || saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? "Menyimpan…"
                  : `Buat ${validDrafts.length} Jadwal`}
              </Button>
              {validDrafts.length < drafts.length && (
                <p className="text-ios-caption text-warning text-center">
                  {drafts.length - validDrafts.length} jadwal tidak valid
                  (tanggal/acara kosong) dan akan dilewati
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit Sheet */}
      <BottomSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Jadwal"
      >
        {editing && (
          <EditDraftForm
            draft={editing}
            onSave={updateDraft}
            onCancel={() => setEditing(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Draft Card                                     */
/* -------------------------------------------------------------------------- */

function DraftCard({
  index,
  draft,
  onEdit,
  onDelete,
}: {
  index: number;
  draft: ParsedMeetingDraft;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const invalid = !draft.tanggal || !draft.acara.trim();

  return (
    <Card className={`${invalid ? "border-danger/30 bg-danger-soft/30" : ""}`}>
      <div className="flex items-start gap-2">
        <span className="text-ios-caption font-semibold text-surface-muted w-6 flex-shrink-0 pt-0.5 tabular-nums">
          {index}.
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-semibold text-surface-text mb-1 leading-snug">
            {draft.acara || "(tanpa acara)"}
          </p>

          <div className="flex items-center gap-2 text-ios-caption text-surface-muted mb-1 flex-wrap">
            {draft.tanggal ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={11} />
                  {draft.hari && `${draft.hari}, `}
                  {formatDateShort(draft.tanggal)}
                </span>
                {draft.jam && <span>· {draft.jam}</span>}
              </>
            ) : (
              <span className="text-danger">⚠ Tanggal tidak terdeteksi</span>
            )}
          </div>

          {(draft.genderTarget || draft.kategoriTarget.length > 0) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {draft.genderTarget && (
                <span className="inline-block text-[9px] font-semibold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 uppercase">
                  {draft.genderTarget === "L" ? "Laki-laki" : "Perempuan"}
                </span>
              )}
              {draft.kategoriTarget.map((k) => (
                <span
                  key={k}
                  className="inline-block text-[9px] font-semibold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 uppercase"
                >
                  {CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL] || k}
                </span>
              ))}
            </div>
          )}

          {draft.catatan && (
            <p className="text-ios-caption text-surface-muted whitespace-pre-line leading-relaxed">
              {draft.catatan}
            </p>
          )}

          {draft.warning && (
            <p className="text-ios-caption text-warning mt-1">
              ⚠ {draft.warning}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-accent hover:bg-accent-soft transition-colors"
            aria-label="Edit"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-danger hover:bg-danger-soft transition-colors"
            aria-label="Hapus"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Edit Form                                      */
/* -------------------------------------------------------------------------- */

function EditDraftForm({
  draft,
  onSave,
  onCancel,
}: {
  draft: ParsedMeetingDraft;
  onSave: (d: ParsedMeetingDraft) => void;
  onCancel: () => void;
}) {
  const [acara, setAcara] = useState(draft.acara);
  const [tanggal, setTanggal] = useState(draft.tanggal);
  const [jam, setJam] = useState(draft.jam);
  const [catatan, setCatatan] = useState(draft.catatan);
  const [genderTarget, setGenderTarget] = useState<GenderTarget>(
    draft.genderTarget,
  );
  const [kategoriTarget, setKategoriTarget] = useState<string[]>(
    draft.kategoriTarget,
  );

  function handleSave() {
    onSave({
      ...draft,
      acara: acara.trim(),
      tanggal,
      jam: jam.trim(),
      catatan: catatan.trim(),
      genderTarget,
      kategoriTarget,
    });
  }

  const canSave = !!acara.trim() && !!tanggal;

  return (
    <>
      <DateInput label="Tanggal" value={tanggal} onChange={setTanggal} />

      <Input
        label="Acara"
        value={acara}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setAcara(e.target.value)
        }
        placeholder="Nama acara"
      />

      <Input
        label="Jam"
        value={jam}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setJam(e.target.value)
        }
        placeholder="08:30 WIB - Selesai"
      />

      <div className="mb-4">
        <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
          Catatan (Tempat & Peserta)
        </label>
        <textarea
          value={catatan}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setCatatan(e.target.value)
          }
          rows={4}
          className="w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 text-ios-body text-surface-text placeholder:text-surface-muted/70 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 resize-none"
          placeholder="Tempat: ...&#10;Peserta: ..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
          Kategori Jamaah
        </label>
        <p className="text-ios-caption text-surface-muted mb-3 px-1">
          Kosongkan untuk semua kategori
        </p>
        <div className="flex flex-wrap gap-2">
          {MEMBER_CATEGORIES.map((c) => {
            const active = kategoriTarget.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  setKategoriTarget((prev) =>
                    prev.includes(c)
                      ? prev.filter((x) => x !== c)
                      : [...prev, c],
                  )
                }
                className={`px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] ${
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

      <GenderTargetPicker value={genderTarget} onChange={setGenderTarget} />

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-surface-border bg-surface-card text-ios-body font-medium text-surface-text transition-colors hover:bg-surface-card2"
        >
          Batal
        </button>
        <Button onClick={handleSave} disabled={!canSave}>
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} />
            Simpan
          </span>
        </Button>
      </div>
    </>
  );
}
