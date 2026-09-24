import { useEffect, useRef, useState } from "react";
import type { Member } from "../../types";
import { BottomSheet, Button, Input } from "../common";
import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Share2,
} from "../common/FontAwesomeIcons";
import { useToast } from "../../contexts/ToastContext";
import { TAARUF_FIELDS } from "./taarufFields";
import { TAARUF_THEME_LIST } from "./taarufThemes";
import { exportTaarufPdf, exportTaarufPng } from "./taarufExport";
import {
  DEFAULT_PRINT_OPTIONS,
  clampPhoto,
  TaarufCvPreview,
  type TaarufPrintOptions,
  type TaarufRegionKey,
  type TaarufSectionKey,
} from "./TaarufCvPreview";

const SECTION_LABEL: Record<TaarufSectionKey, string> = {
  biodata: "Data Pribadi",
  pendidikan: "Pendidikan",
};

/**
 * Sheet CV Taaruf: preview WYSIWYG + sesuaikan isi & tata letak cetakan.
 * Perubahan di sini khusus cetakan ini. Tidak mengubah data tersimpan.
 * Tombol export PDF & gambar menyusul setelah desain disetujui.
 */
export function TaarufCvSheet({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member: Member | null;
}) {
  const [editing, setEditing] = useState(false);
  const [selection, setSelection] = useState<TaarufRegionKey | null>(null);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [options, setOptions] = useState<TaarufPrintOptions>(
    DEFAULT_PRINT_OPTIONS,
  );
  const exportRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Reset tiap sheet dibuka.
  useEffect(() => {
    if (open) {
      setEditing(false);
      setSelection(null);
      setBusy(null);
      setOptions(DEFAULT_PRINT_OPTIONS);
    }
  }, [open, member?.member_id]);

  if (!open) return null;

  async function handleExport(kind: "pdf" | "png") {
    const node = exportRef.current;
    if (!node || !member || busy) return;
    setBusy(kind);
    try {
      if (kind === "pdf") await exportTaarufPdf(node, member.nama_lengkap);
      else await exportTaarufPng(node, member.nama_lengkap);
      showToast(kind === "pdf" ? "PDF berhasil diunduh" : "Gambar berhasil diunduh");
    } catch {
      showToast(
        "Gagal mengekspor. Periksa koneksi lalu coba lagi",
        "error",
      );
    } finally {
      setBusy(null);
    }
  }

  const fontChanged = (["kop", "biodata", "pendidikan"] as const).some(
    (k) => options.fontSize[k] !== DEFAULT_PRINT_OPTIONS.fontSize[k],
  );

  const layoutChanged =
    options.theme !== DEFAULT_PRINT_OPTIONS.theme ||
    options.photoSide !== DEFAULT_PRINT_OPTIONS.photoSide ||
    options.sectionOrder.join() !== DEFAULT_PRINT_OPTIONS.sectionOrder.join() ||
    options.photo.scale !== 1 ||
    options.photo.x !== 0 ||
    options.photo.y !== 0 ||
    fontChanged;

  const editedCount =
    Object.keys(options.overrides).length +
    Object.values(options.hidden).filter(Boolean).length +
    (options.showPhoto ? 0 : 1) +
    (options.showBiodata ? 0 : 1) +
    (options.showEducation ? 0 : 1) +
    (layoutChanged ? 1 : 0);

  function toggleHidden(key: string) {
    setOptions((o) => ({
      ...o,
      hidden: { ...o.hidden, [key]: !o.hidden[key] },
    }));
  }

  function setOverride(key: string, value: string, original: string) {
    setOptions((o) => {
      const next = { ...o.overrides };
      if (value === original) delete next[key];
      else next[key] = value;
      return { ...o, overrides: next };
    });
  }

  function moveSection(key: TaarufSectionKey, dir: -1 | 1) {
    setOptions((o) => {
      const order = [...o.sectionOrder];
      const i = order.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return o;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...o, sectionOrder: order };
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="CV Taaruf">
      {member ? (
        <div className="pb-2">
          <TaarufCvPreview
            member={member}
            options={options}
            selection={selection}
            onSelect={setSelection}
            onPhotoChange={(p) => setOptions((o) => ({ ...o, photo: p }))}
            onSectionOrderChange={(order) =>
              setOptions((o) => ({ ...o, sectionOrder: order }))
            }
            onMoveSection={moveSection}
            onFontSize={(region, s) =>
              setOptions((o) => ({
                ...o,
                fontSize: { ...o.fontSize, [region]: s },
              }))
            }
            onToggleSection={(key) =>
              setOptions((o) =>
                key === "biodata"
                  ? { ...o, showBiodata: !o.showBiodata }
                  : { ...o, showEducation: !o.showEducation },
              )
            }
            onTogglePhotoSide={() =>
              setOptions((o) => ({
                ...o,
                photoSide: o.photoSide === "right" ? "left" : "right",
              }))
            }
            onHidePhoto={() => setOptions((o) => ({ ...o, showPhoto: false }))}
            onRestoreSection={(key) =>
              setOptions((o) =>
                key === "biodata"
                  ? { ...o, showBiodata: true, hidden: {} }
                  : { ...o, showEducation: true },
              )
            }
            onRestorePhoto={() =>
              setOptions((o) => ({ ...o, showPhoto: true }))
            }
          />
          <p className="text-ios-caption text-surface-muted text-center mt-2 max-w-[560px] mx-auto leading-relaxed">
            Ketuk foto / judul / bagian di pratinjau untuk mengedit langsung.
            Seret foto untuk crop, seret ⋮⋮ untuk menyusun ulang.
          </p>

          {/* Toggle editor */}
          <div className="max-w-[560px] mx-auto mt-4">
            <button
              onClick={() => setEditing((v) => !v)}
              className="w-full rounded-2xl border border-surface-border bg-surface-card p-3.5 flex items-center gap-3 text-left transition-all active:scale-[0.99] hover:bg-surface-card2"
            >
              <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                <Pencil size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-ios-body font-medium text-surface-text">
                  Sesuaikan isi & tata letak
                  {editedCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[10px] font-bold">
                      {editedCount}
                    </span>
                  )}
                </span>
                <span className="block text-ios-caption text-surface-muted">
                  Tema, foto, urutan bagian, tampil/sembunyi isian
                </span>
              </span>
            </button>

            {editing && (
              <div className="mt-3 rounded-2xl border border-surface-border bg-surface-card p-4 space-y-5">
                <p className="text-ios-caption text-surface-muted leading-relaxed">
                  Hasil cetakan sama persis dengan pratinjau. Perubahan hanya
                  untuk cetakan ini, tidak mengubah data yang tersimpan.
                </p>

                {/* Tema */}
                <div>
                  <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
                    Tema
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {TAARUF_THEME_LIST.map((t) => {
                      const active = options.theme === t.key;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setOptions((o) => ({ ...o, theme: t.key }))}
                          className={`rounded-xl border p-2.5 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                            active
                              ? "border-accent bg-accent-soft/60 ring-2 ring-accent/20"
                              : "border-surface-border hover:bg-surface-card2"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full ${t.swatch}`}
                          />
                          <span
                            className={`text-ios-caption font-medium ${
                              active ? "text-accent" : "text-surface-muted"
                            }`}
                          >
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sisi foto */}
                <div>
                  <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
                    Posisi foto
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-card2">
                    {(["right", "left"] as const).map((side) => {
                      const active = options.photoSide === side;
                      return (
                        <button
                          key={side}
                          onClick={() =>
                            setOptions((o) => ({ ...o, photoSide: side }))
                          }
                          className={`h-9 rounded-lg text-ios-footnote font-medium transition-all active:scale-[0.98] ${
                            active
                              ? "bg-surface-card text-surface-text shadow-sm"
                              : "text-surface-muted"
                          }`}
                        >
                          {side === "right" ? "Kanan" : "Kiri"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Urutan bagian */}
                <div>
                  <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
                    Urutan bagian
                  </p>
                  <div className="space-y-2">
                    {options.sectionOrder.map((key, i) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 rounded-xl border border-surface-border px-3 py-2"
                      >
                        <span className="flex-1 text-ios-body text-surface-text">
                          {i + 1}. {SECTION_LABEL[key]}
                        </span>
                        <button
                          onClick={() => moveSection(key, -1)}
                          disabled={i === 0}
                          aria-label={`Naikkan ${SECTION_LABEL[key]}`}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-muted transition-all active:scale-95 disabled:opacity-30 hover:bg-surface-card2"
                        >
                          <ChevronDown size={16} className="rotate-180" />
                        </button>
                        <button
                          onClick={() => moveSection(key, 1)}
                          disabled={i === options.sectionOrder.length - 1}
                          aria-label={`Turunkan ${SECTION_LABEL[key]}`}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-muted transition-all active:scale-95 disabled:opacity-30 hover:bg-surface-card2"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Foto: zoom */}
                {member.foto_url && (
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-ios-footnote font-medium text-surface-muted">
                        Zoom foto ·{" "}
                        {Math.round(options.photo.scale * 100)}%
                      </p>
                      <button
                        onClick={() =>
                          setOptions((o) => ({
                            ...o,
                            photo: { scale: 1, x: 0, y: 0 },
                          }))
                        }
                        className="text-ios-caption font-medium text-accent active:scale-95 transition-transform"
                      >
                        Atur ulang
                      </button>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={2.5}
                      step={0.05}
                      value={options.photo.scale}
                      onChange={(e) =>
                        setOptions((o) => ({
                          ...o,
                          photo: clampPhoto({
                            ...o.photo,
                            scale: Number(e.target.value),
                          }),
                        }))
                      }
                      className="w-full accent-[var(--accent,#059669)]"
                      aria-label="Zoom foto"
                    />
                  </div>
                )}

                {/* Isian: sembunyi + ubah */}
                <div>
                  <p className="text-ios-footnote font-medium text-surface-muted mb-1 px-1">
                    Isian cetakan
                  </p>
                  <div className="space-y-3">
                    {TAARUF_FIELDS.map((f) => {
                      const original = f.getValue(member);
                      const hidden = !!options.hidden[f.key];
                      const value = options.overrides[f.key] ?? original;
                      const EyeIcon = hidden ? EyeOff : Eye;
                      return (
                        <div key={f.key} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <Input
                              label={f.label}
                              value={value}
                              disabled={hidden}
                              placeholder={original || "-"}
                              onChange={(e) =>
                                setOverride(f.key, e.target.value, original)
                              }
                            />
                          </div>
                          <button
                            onClick={() => toggleHidden(f.key)}
                            aria-label={
                              hidden
                                ? `Tampilkan ${f.label}`
                                : `Sembunyikan ${f.label}`
                            }
                            className={`w-11 h-11 mt-6 rounded-xl flex items-center justify-center shrink-0 border transition-all active:scale-95 ${
                              hidden
                                ? "bg-surface-card2 text-surface-muted border-surface-border"
                                : "bg-accent-soft text-accent border-accent/20"
                            }`}
                          >
                            <EyeIcon size={16} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Toggle foto & bagian */}
                    {(
                      [
                        ["foto", "Foto", options.showPhoto],
                        ["biodata", "Data pribadi", options.showBiodata],
                        ["pendidikan", "Riwayat pendidikan", options.showEducation],
                      ] as [string, string, boolean][]
                    ).map(([key, label, shown]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setOptions((o) =>
                            key === "foto"
                              ? { ...o, showPhoto: !o.showPhoto }
                              : key === "biodata"
                                ? { ...o, showBiodata: !o.showBiodata }
                                : { ...o, showEducation: !o.showEducation },
                          )
                        }
                        className="w-full flex items-center justify-between gap-3 py-2"
                      >
                        <span className="text-ios-body text-surface-text">
                          {label}
                        </span>
                        <span
                          className={`relative w-11 rounded-full transition-colors h-[26px] ${
                            shown ? "bg-accent" : "bg-surface-card2"
                          }`}
                        >
                          <span
                            className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-all ${
                              shown ? "left-[22px]" : "left-[3px]"
                            }`}
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {editedCount > 0 && (
                  <Button
                    variant="ghost"
                    fullWidth
                    size="sm"
                    onClick={() => setOptions(DEFAULT_PRINT_OPTIONS)}
                  >
                    Kembalikan ke data asli
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4 max-w-[560px] mx-auto">
            <Button
              variant="secondary"
              fullWidth
              disabled={busy !== null}
              onClick={() => handleExport("pdf")}
            >
              <span className="inline-flex items-center gap-2">
                {busy === "pdf" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                {busy === "pdf" ? "Membuat..." : "PDF"}
              </span>
            </Button>
            <Button
              variant="secondary"
              fullWidth
              disabled={busy !== null}
              onClick={() => handleExport("png")}
            >
              <span className="inline-flex items-center gap-2">
                {busy === "png" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Share2 size={15} />
                )}
                {busy === "png" ? "Membuat..." : "Gambar"}
              </span>
            </Button>
          </div>
          <p className="text-ios-caption text-surface-muted text-center mt-2">
            Hasil unduhan sama persis dengan pratinjau di atas.
          </p>

          {/* Node cetak off-screen: tanpa toolbar & tanpa catatan rahasia */}
          <div
            aria-hidden
            style={{ position: "fixed", left: -10000, top: 0, width: 560 }}
          >
            <div ref={exportRef}>
              <TaarufCvPreview
                member={member}
                options={options}
                hideConfidential
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-ios-body text-surface-muted text-center py-6">
          Data tidak tersedia.
        </p>
      )}
    </BottomSheet>
  );
}
