import { useState } from "react";
import { ChevronDown, Copy, Check } from "../common/FontAwesomeIcons";
import type { DoaEntry } from "../../data/doa";

interface DoaCardProps {
  doa: DoaEntry;
  index: number;
}

export function DoaCard({ doa, index }: DoaCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = [
      doa.judul,
      "",
      doa.arab,
      "",
      doa.latin,
      "",
      `Artinya: ${doa.arti}`,
      doa.sumber ? `\n(${doa.sumber})` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden transition-all">
      {/* Header — klik untuk expand */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-surface-card2 active:scale-[0.995]"
      >
        <span className="w-8 h-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-[12px] font-bold flex-shrink-0 tabular-nums">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-surface-text truncate">
            {doa.judul}
          </p>
          {doa.sumber && (
            <p className="text-ios-caption text-surface-muted truncate">
              {doa.sumber}
            </p>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`text-surface-muted flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Body — expand */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-border space-y-3">
          {/* Arab */}
          <div
            className="text-surface-text"
            style={{
              fontFamily: doa.sumber?.startsWith("Al-Quran")
                ? '"Amiri Quran", "Amiri", "Scheherazade New", serif'
                : '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
              fontSize: "21px",
              lineHeight: 1.9,
              direction: "rtl",
              textAlign: "right",
            }}
          >
            {doa.arab}
          </div>

          {/* Latin */}
          <p className="text-ios-footnote italic text-surface-muted leading-relaxed">
            {doa.latin}
          </p>

          {/* Arti */}
          <div className="rounded-xl bg-accent-soft/50 border border-accent/10 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/70 mb-1">
              Artinya
            </p>
            <p className="text-ios-footnote text-surface-text leading-relaxed">
              {doa.arti}
            </p>
          </div>

          {/* Keutamaan */}
          {doa.keutamaan && (
            <div className="rounded-xl bg-warning-soft/60 border border-warning/20 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-warning mb-1">
                Keutamaan
              </p>
              <p className="text-ios-caption text-warning leading-relaxed">
                {doa.keutamaan}
              </p>
            </div>
          )}

          {/* Dalil keutamaan (kalau ada) */}
          {doa.dalil && (
            <p className="text-ios-caption text-surface-muted">
              <span className="font-medium">Dalil keutamaan:</span> {doa.dalil}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-ios-caption font-medium text-accent transition-colors hover:bg-accent-soft active:scale-[0.97]"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Tersalin" : "Salin doa"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
