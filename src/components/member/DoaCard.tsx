import { useState } from "react";
import { ChevronDown, Copy, Check, Star } from "../common/FontAwesomeIcons";
import type { DoaEntry } from "../../data/doa";
import { FONT_SIZE_SPECS, type DoaFontSize } from "../../hooks/useDoaFontSize";

interface DoaCardProps {
  doa: DoaEntry;
  index: number;
  isRead?: boolean;
  onToggleRead?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  fontSize?: DoaFontSize;
}

export function DoaCard({
  doa,
  index,
  isRead = false,
  onToggleRead,
  isFavorite = false,
  onToggleFavorite,
  fontSize = "medium",
}: DoaCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const spec = FONT_SIZE_SPECS[fontSize];

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = [
      doa.judul,
      "",
      doa.arab,
      "",
      doa.latin,
      "",
      "Artinya: " + doa.arti,
      doa.sumber ? "\n(" + doa.sumber + ")" : "",
      doa.dalil ? "Dalil keutamaan: " + doa.dalil : "",
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

  const isQuran = doa.sumber?.startsWith("Al-Quran") ?? false;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden transition-all duration-200">
      <div className="w-full flex items-center gap-2 px-4 py-3.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead?.();
          }}
          disabled={!onToggleRead}
          aria-label={isRead ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
          title={isRead ? "Sudah dibaca, klik untuk batalkan" : "Tandai sudah dibaca"}
          className={
            "w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0 tabular-nums transition-all duration-200 active:scale-[0.92] " +
            (isRead
              ? "bg-success-soft text-success hover:bg-success/20"
              : "bg-accent-soft text-accent hover:bg-accent/20")
          }
        >
          {isRead ? <Check size={15} strokeWidth={3} /> : index + 1}
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 min-w-0 text-left transition-colors duration-200"
        >
          <p className="text-ios-body font-medium text-surface-text truncate">
            {doa.judul}
          </p>
          {(doa.catatan || doa.sumber) && (
            <p className="text-ios-caption text-surface-muted truncate">
              {[doa.catatan, doa.sumber].filter(Boolean).join(" · ")}
            </p>
          )}
        </button>

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={
              isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"
            }
            title={isFavorite ? "Favorit" : "Tandai favorit"}
            className={
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 active:scale-[0.92] " +
              (isFavorite
                ? "text-warning hover:bg-warning-soft"
                : "text-surface-muted hover:bg-surface-card2")
            }
          >
            <Star
              size={17}
              strokeWidth={2.2}
              className={isFavorite ? "fill-warning" : ""}
            />
          </button>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup" : "Buka"}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-surface-muted transition-colors duration-200 hover:bg-surface-card2"
        >
          <ChevronDown
            size={18}
            className={
              "transition-transform duration-200 " + (open ? "rotate-180" : "")
            }
          />
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-border space-y-3">
          <div
            className="border-r-2 border-accent/30 pr-4 py-2 text-surface-text"
            style={{
              fontFamily: isQuran
                ? '"Noto Naskh Arabic", "Amiri Quran", "Scheherazade New", serif'
                : '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
              fontSize: spec.arab + "px",
              fontWeight: 400,
              lineHeight: spec.arabLineHeight,
              wordSpacing: "0.1em",
              direction: "rtl",
              textAlign: "right",
              overflowWrap: "break-word",
            }}
          >
            {doa.arab}
          </div>

          <p
            className="text-ios-footnote italic text-surface-muted leading-relaxed"
            style={{ fontSize: spec.body + "px", lineHeight: spec.bodyLineHeight }}
          >
            {doa.latin}
          </p>

          <div className="rounded-xl bg-accent-soft/50 border border-accent/10 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/80 mb-1">
              Artinya
            </p>
            <p
              className="text-ios-footnote text-surface-text leading-relaxed"
              style={{ fontSize: spec.body + "px", lineHeight: spec.bodyLineHeight }}
            >
              {doa.arti}
            </p>
          </div>

          {doa.keutamaan && (
            <div className="rounded-xl bg-success-soft border border-success/20 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-success mb-1">
                Keutamaan
              </p>
              <p
                className="text-ios-caption text-success/90 leading-relaxed"
                style={{
                  fontSize: spec.body - 1 + "px",
                  lineHeight: spec.bodyLineHeight,
                }}
              >
                {doa.keutamaan}
              </p>
            </div>
          )}

          {doa.dalil && (
            <p className="text-ios-caption text-surface-muted">
              <span className="font-medium">Dalil keutamaan:</span> {doa.dalil}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {onToggleRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead();
                }}
                className={
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-ios-caption font-medium transition-colors duration-200 active:scale-[0.97] " +
                  (isRead
                    ? "text-success hover:bg-success-soft"
                    : "text-surface-muted hover:bg-surface-card2")
                }
              >
                <Check size={12} />
                {isRead ? "Sudah dibaca" : "Tandai sudah dibaca"}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-ios-caption font-medium text-accent transition-colors duration-200 hover:bg-accent-soft active:scale-[0.97]"
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
