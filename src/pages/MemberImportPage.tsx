import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Copy,
  ChevronDown,
  Loader2,
  FileText,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Button,
  Card,
  Badge,
  ConfirmDialog,
} from "../components/ui";
import { memberApi } from "../features/member/api/memberApi";
import type { Member } from "../types";
import { useToast } from "../contexts/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { ApiError } from "../services/api";
import {
  parseMemberText,
  type ParsedMember,
} from "../features/member/lib/parseMember";

type Phase = "input" | "preview" | "saving" | "done";

interface SaveResult {
  member: ParsedMember;
  ok: boolean;
  error?: string;
}


const SAMPLE = `📋 *BIODATA GENERUS*

👤 Nama Lengkap : Ahmad Contoh
📝 Nama Panggilan : Ahmad
⚧️ Jenis Kelamin : Laki-laki
🎂 Tempat, Tanggal Lahir : Lamongan, 09-Oktober-2000
📱 No. WhatsApp : +62 81234567890
🏠 Alamat Rumah : desa latukan RT 01 RW 01
📝 Kesibukan : kuliah
💼 Pekerjaan : Belum bekerja
👳 Status Muballigh : Tidak
🎓 Jenjang Pendidikan : S1
🏫 Sekolah : Universitas Negeri Surabaya
📚 Jurusan : Teknik Informatika`;


export default function MemberImportPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedMember[]>([]);
  const [skipped, setSkipped] = useState<
    { blockPreview: string; reason: string }[]
  >([]);
  const [results, setResults] = useState<SaveResult[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSample, setShowSample] = useState(false);


  function handleParse() {
    const trimmed = text.trim();
    if (!trimmed) {
      showToast("Text masih kosong", "error");
      return;
    }
    const result = parseMemberText(trimmed);
    if (result.members.length === 0) {
      showToast("Tidak ada jamaah yang terdeteksi", "error");
      return;
    }
    setParsed(result.members);
    setSkipped(result.skipped);
    setPhase("preview");
  }


  async function handleSave() {
    setConfirmOpen(false);
    setPhase("saving");
    const out: SaveResult[] = [];

    for (const m of parsed) {
      try {
        const payload: Partial<Member> = {
          nama_lengkap: m.nama_lengkap,
          nama_panggilan: m.nama_panggilan || undefined,
          jenis_kelamin: m.jenis_kelamin || undefined,
          tempat_lahir: m.tempat_lahir || undefined,
          tanggal_lahir: m.tanggal_lahir || undefined,
          no_wa: m.no_wa || undefined,
          alamat_rumah: m.alamat_rumah || undefined,
          desa: m.desa || undefined,
          daerah: m.daerah || undefined,
          pekerjaan: m.pekerjaan || undefined,
          hobi: m.hobi || undefined,
          is_muballigh: m.is_muballigh,
          is_nikah: m.is_nikah,
          is_kerja: m.is_kerja,
          jenjang_pendidikan: m.jenjang_pendidikan || undefined,
          sekolah: m.sekolah || undefined,
          jurusan: m.jurusan || undefined,
        };
        await memberApi.create(payload);
        out.push({ member: m, ok: true });
      } catch (err) {
        out.push({
          member: m,
          ok: false,
          error:
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Gagal",
        });
      }
    }

    setResults(out);
    setPhase("done");

    const success = out.filter((r) => r.ok).length;
    const failed = out.length - success;
    if (failed === 0) {
      showToast(`${success} jamaah berhasil diimport`);
    } else {
      showToast(`${success} berhasil, ${failed} gagal`, "error");
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.members() });
    queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
  }


  function handleReset() {
    setText("");
    setParsed([]);
    setSkipped([]);
    setResults([]);
    setPhase("input");
  }


  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Import Jamaah"
        subtitle="Paste text biodata dari WhatsApp"
        onBack={() => navigate("/lainnya")}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {phase === "input" && (
          <InputPhase
            text={text}
            onChange={setText}
            onParse={handleParse}
            showSample={showSample}
            onToggleSample={() => setShowSample((v) => !v)}
            onCopySample={() => {
              navigator.clipboard.writeText(SAMPLE);
              showToast("Template disalin");
            }}
          />
        )}

        {phase === "preview" && (
          <PreviewPhase
            parsed={parsed}
            skipped={skipped}
            onBack={() => setPhase("input")}
            onSave={() => setConfirmOpen(true)}
          />
        )}

        {phase === "saving" && <SavingPhase total={parsed.length} />}

        {phase === "done" && (
          <DonePhase
            results={results}
            onReset={handleReset}
            onViewMembers={() => navigate("/jamaah", { replace: true })}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Import ${parsed.length} Jamaah?`}
        description={`${parsed.length} jamaah akan ditambahkan ke database. Proses mungkin memakan waktu 10-30 detik.`}
        confirmLabel="Ya, Import"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSave}
      />
    </AppLayout>
  );
}


function InputPhase({
  text,
  onChange,
  onParse,
  showSample,
  onToggleSample,
  onCopySample,
}: {
  text: string;
  onChange: (v: string) => void;
  onParse: () => void;
  showSample: boolean;
  onToggleSample: () => void;
  onCopySample: () => void;
}) {
  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  return (
    <>
      <div className="rounded-2xl bg-accent-soft border border-accent/15 p-3.5">
        <p className="text-ios-footnote text-accent/90 leading-relaxed">
          Copy text biodata dari WhatsApp, paste di bawah, lalu klik Parse.
          Format bebas, parser mendeteksi field secara otomatis. Bisa multi-jamaah
          sekaligus.
        </p>
      </div>

      
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-ios-footnote font-medium text-surface-text">
            Text Biodata
          </label>
          <span className="text-ios-caption text-surface-muted tabular-nums">
            {lineCount} baris
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste text biodata di sini..."
          rows={16}
          className="w-full rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-[14px] text-surface-text placeholder:text-surface-muted/60 shadow-sm transition-all resize-none focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 font-mono"
        />
      </div>

      
      <button
        onClick={onToggleSample}
        className="w-full flex items-center justify-between gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 transition-all hover:bg-surface-card2 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-accent" />
          <p className="text-ios-footnote font-medium text-surface-text">
            Lihat Contoh Format
          </p>
        </div>
        <ChevronDown
          size={16}
          className={
            "text-surface-muted transition-transform " +
            (showSample ? "rotate-180" : "")
          }
        />
      </button>

      {showSample && (
        <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border bg-surface-card2/40">
            <p className="text-ios-caption font-medium text-surface-muted">
              Contoh Template
            </p>
            <Button
              variant="ghost"
              size="xs"
              onClick={onCopySample}
              leftIcon={<Copy size={12} />}
            >
              Salin
            </Button>
          </div>
          <pre className="px-4 py-3 text-[12px] leading-relaxed text-surface-text font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
            {SAMPLE}
          </pre>
        </div>
      )}

      <Button fullWidth onClick={onParse} disabled={!text.trim()}>
        <span className="inline-flex items-center gap-1.5">
          Parse Text
          <ArrowRight size={16} />
        </span>
      </Button>
    </>
  );
}


function PreviewPhase({
  parsed,
  skipped,
  onBack,
  onSave,
}: {
  parsed: ParsedMember[];
  skipped: { blockPreview: string; reason: string }[];
  onBack: () => void;
  onSave: () => void;
}) {
  const warningCount = useMemo(
    () => parsed.filter((p) => p.warnings.length > 0).length,
    [parsed],
  );

  return (
    <>
      <div className="rounded-2xl bg-success-soft border border-success/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Check size={16} className="text-success" strokeWidth={3} />
          <p className="text-ios-body font-semibold text-success">
            {parsed.length} jamaah terdeteksi
          </p>
        </div>
        <p className="text-ios-caption text-surface-text/80 leading-relaxed">
          Review data di bawah. Klik Import kalau sudah benar.
        </p>
      </div>

      {warningCount > 0 && (
        <div className="rounded-2xl bg-warning-soft/60 border border-warning/20 p-3.5 flex items-start gap-2.5">
          <AlertTriangle
            size={16}
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-ios-footnote font-medium text-warning mb-0.5">
              {warningCount} jamaah dengan warning
            </p>
            <p className="text-ios-caption text-warning/80 leading-relaxed">
              Field kosong (tanggal lahir / WA) tetap bisa di-import. Lengkapi
              nanti via edit biodata.
            </p>
          </div>
        </div>
      )}

      {skipped.length > 0 && (
        <div className="rounded-2xl bg-danger-soft border border-danger/20 p-3.5">
          <p className="text-ios-footnote font-medium text-danger mb-2">
            {skipped.length} block di-skip
          </p>
          <ul className="space-y-1">
            {skipped.map((s, i) => (
              <li key={i} className="text-ios-caption text-danger/80">
                • {s.reason}: {s.blockPreview}
              </li>
            ))}
          </ul>
        </div>
      )}

      
      <div className="space-y-2.5">
        {parsed.map((m, i) => (
          <MemberPreviewCard key={i} index={i} member={m} />
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" fullWidth onClick={onBack}>
          <span className="inline-flex items-center gap-1.5">
            <X size={16} />
            Batal
          </span>
        </Button>
        <Button fullWidth onClick={onSave}>
          <span className="inline-flex items-center gap-1.5">
            <Check size={16} />
            Import {parsed.length}
          </span>
        </Button>
      </div>
    </>
  );
}

function MemberPreviewCard({
  index,
  member,
}: {
  index: number;
  member: ParsedMember;
}) {
  const [open, setOpen] = useState(false);
  const hasWarning = member.warnings.length > 0;

  return (
    <div
      className={
        "rounded-2xl border bg-surface-card overflow-hidden " +
        (hasWarning ? "border-warning/30" : "border-surface-border")
      }
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-card2"
      >
        <span className="w-8 h-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-shrink-0 tabular-nums">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-surface-text truncate">
            {member.nama_lengkap}
          </p>
          <p className="text-ios-caption text-surface-muted truncate">
            {member.jenis_kelamin === "L"
              ? "Laki-laki"
              : member.jenis_kelamin === "P"
                ? "Perempuan"
                : "Gender ?"}{" "}
            · {member.no_wa || "WA ?"}
          </p>
        </div>
        {hasWarning && (
          <Badge color="amber">{member.warnings.length}</Badge>
        )}
        <ChevronDown
          size={16}
          className={
            "text-surface-muted flex-shrink-0 transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-surface-border space-y-2">
          <Field label="Nama Lengkap" value={member.nama_lengkap} />
          <Field label="Nama Panggilan" value={member.nama_panggilan} />
          <Field label="Jenis Kelamin" value={member.jenis_kelamin} />
          <Field label="Tempat Lahir" value={member.tempat_lahir} />
          <Field label="Tanggal Lahir" value={member.tanggal_lahir} />
          <Field label="No. WA" value={member.no_wa} />
          <Field label="Alamat" value={member.alamat_rumah} />
          <Field label="Desa" value={member.desa} />
          <Field label="Daerah" value={member.daerah} />
          <Field label="Pekerjaan" value={member.pekerjaan} />
          <Field label="Hobi" value={member.hobi} />
          <Field label="Jenjang" value={member.jenjang_pendidikan} />
          <Field label="Sekolah" value={member.sekolah} />
          <Field label="Jurusan" value={member.jurusan} />
          <Field
            label="Muballigh"
            value={member.is_muballigh ? "Ya" : "Tidak"}
          />
          <Field label="Kerja" value={member.is_kerja ? "Ya" : "Tidak"} />
          <Field label="Nikah" value={member.is_nikah ? "Ya" : "Tidak"} />
          {hasWarning && (
            <div className="pt-2 mt-2 border-t border-surface-border">
              {member.warnings.map((w, i) => (
                <p key={i} className="text-ios-caption text-warning flex items-center gap-1.5">
                  <AlertTriangle size={12} className="flex-shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ios-caption text-surface-muted flex-shrink-0">
        {label}
      </span>
      <span
        className={
          "text-ios-footnote text-right truncate " +
          (value ? "text-surface-text" : "text-surface-muted italic")
        }
      >
        {value || "—"}
      </span>
    </div>
  );
}


function SavingPhase({ total }: { total: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
      <p className="text-ios-body font-semibold text-surface-text mb-1">
        Menyimpan {total} jamaah...
      </p>
      <p className="text-ios-footnote text-surface-muted max-w-xs">
        Jangan tutup halaman. Proses memakan waktu 10-30 detik.
      </p>
    </div>
  );
}


function DonePhase({
  results,
  onReset,
  onViewMembers,
}: {
  results: SaveResult[];
  onReset: () => void;
  onViewMembers: () => void;
}) {
  const success = results.filter((r) => r.ok).length;
  const failed = results.length - success;

  return (
    <>
      <div
        className={
          "rounded-2xl border p-5 text-center " +
          (failed === 0
            ? "bg-success-soft border-success/20"
            : "bg-warning-soft/60 border-warning/20")
        }
      >
        <div
          className={
            "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 " +
            (failed === 0
              ? "bg-success text-white"
              : "bg-warning text-white")
          }
        >
          {failed === 0 ? (
            <Check size={26} strokeWidth={3} />
          ) : (
            <AlertTriangle size={26} strokeWidth={2.4} />
          )}
        </div>
        <p
          className={
            "text-[20px] font-bold mb-1 " +
            (failed === 0 ? "text-success" : "text-warning")
          }
        >
          Import Selesai
        </p>
        <p className="text-ios-footnote text-surface-text/80">
          <strong className="text-success">{success}</strong> berhasil
          {failed > 0 && (
            <>
              {" · "}
              <strong className="text-danger">{failed}</strong> gagal
            </>
          )}
        </p>
      </div>

      {failed > 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <p className="text-ios-footnote font-medium text-danger mb-2">
            Detail Gagal
          </p>
          <div className="space-y-2">
            {results
              .filter((r) => !r.ok)
              .map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <X size={12} className="text-danger flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="text-ios-footnote font-medium text-surface-text truncate">
                      {r.member.nama_lengkap}
                    </p>
                    <p className="text-ios-caption text-danger/80">
                      {r.error}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" fullWidth onClick={onReset}>
          Import Lagi
        </Button>
        <Button fullWidth onClick={onViewMembers}>
          Lihat Jamaah
        </Button>
      </div>
    </>
  );
}
