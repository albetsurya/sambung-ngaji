import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "../../../components/ui/FontAwesomeIcons";
import { Button } from "../../../components/ui";
import { FinancePrintActions } from "./FinancePrintActions";

export type PrintOrientation = "portrait" | "landscape";
export type PrintFontSize = "7" | "9" | "11";

const PRINT_STYLE_OVERRIDES = `
[data-print-root="true"] {
  font-size: var(--print-fs, 9pt);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

[data-print-root="true"] th,
[data-print-root="true"] td {
  vertical-align: middle !important;
}

[data-print-root="true"] tbody td:not(.font-mono):not([class*="text-center"]):not([class*="text-right"]) {
  text-align: left !important;
}

[data-print-root="true"] td.font-mono,
[data-print-root="true"] th.font-mono {
  text-align: right !important;
}

[data-print-root="true"] [class~="text-[9px]"],
[data-print-root="true"] [class~="text-[10px]"] {
  font-size: calc(var(--print-fs) * 0.833) !important;
}
[data-print-root="true"] [class~="text-[11px]"] {
  font-size: calc(var(--print-fs) * 0.917) !important;
}
[data-print-root="true"] [class~="text-[12px]"],
[data-print-root="true"] [class~="text-xs"] {
  font-size: var(--print-fs) !important;
}
[data-print-root="true"] [class~="text-[13px]"] {
  font-size: calc(var(--print-fs) * 1.083) !important;
}
[data-print-root="true"] [class~="text-[14px]"],
[data-print-root="true"] [class~="text-sm"] {
  font-size: calc(var(--print-fs) * 1.167) !important;
}
[data-print-root="true"] [class~="text-[15px]"] {
  font-size: calc(var(--print-fs) * 1.25) !important;
}
[data-print-root="true"] [class~="text-base"] {
  font-size: calc(var(--print-fs) * 1.333) !important;
}
[data-print-root="true"] [class~="text-lg"] {
  font-size: calc(var(--print-fs) * 1.5) !important;
}
[data-print-root="true"] [class~="text-xl"] {
  font-size: calc(var(--print-fs) * 1.667) !important;
}
`;

export interface UnifiedPrintPreviewProps {
  filename: string;
  children: React.ReactNode;
  onClose: () => void;
  showExport?: boolean;
  exportFilename?: string;
  className?: string;
}

export const UnifiedPrintPreview: React.FC<UnifiedPrintPreviewProps> = ({
  filename,
  children,
  onClose,
  showExport = true,
  exportFilename,
  className = "",
}) => {
  const [fontSize, setFontSize] = useState<PrintFontSize>("7");
  const [orientation, setOrientation] = useState<PrintOrientation>("portrait");
  const [sheetIdx, setSheetIdx] = useState(0);
  const [zoom, setZoom] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches
      ? 1
      : 0.5,
  );

  const printRef = useRef<HTMLDivElement>(null);
  const [baseSize, setBaseSize] = useState({ w: 794, h: 1123 });

  useLayoutEffect(() => {
    const el = printRef.current;
    if (!el) return;
    const update = () => {
      setBaseSize({ w: el.offsetWidth, h: el.offsetHeight });
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fontSize, orientation, children]);

  const printArea = useCallback(() => {
    const area = printRef.current;
    if (!area) {
      window.print();
      return;
    }

    document.body.classList.add("printing-finance");

    const prevTransform = area.style.transform;
    const prevOrigin = area.style.transformOrigin;

    const restore = () => {
      document.body.classList.remove("printing-finance");
      area.style.display = "";
      area.style.position = "";
      area.style.left = "";
      area.style.top = "";
      area.style.zIndex = "";
      area.style.background = "";
      area.style.width = "";
      area.style.height = "";
      area.style.transform = prevTransform;
      area.style.transformOrigin = prevOrigin;
    };

    area.style.display = "block";
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    area.style.zIndex = "999998";
    area.style.background = "white";
    area.style.width = "100%";
    area.style.height = "100%";
    area.style.transform = "none";

    void area.offsetHeight;

    window.addEventListener("afterprint", restore, { once: true });
    window.print();

    setTimeout(restore, 2000);
  }, []);

  const sheetWidthMm = useMemo(() => {
    const widths: Record<PrintOrientation, number> = {
      portrait: 210,
      landscape: 297,
    };
    return widths[orientation];
  }, [orientation]);

  return (
    <div className="px-4 space-y-3 pb-8">
      <style>{PRINT_STYLE_OVERRIDES}</style>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-3 space-y-2.5">
        {showExport && (
          <FinancePrintActions
            exportRef={printRef}
            filename={exportFilename || filename}
          />
        )}
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-1 px-0.5">
              Font
            </p>
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value as PrintFontSize);
                setSheetIdx(0);
              }}
              className="w-full px-3 py-2 text-ios-body border border-surface-border rounded-xl bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="7">Kecil</option>
              <option value="9">Sedang</option>
              <option value="11">Besar</option>
            </select>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-1 px-0.5">
              Orientasi
            </p>
            <select
              value={orientation}
              onChange={(e) => {
                setOrientation(e.target.value as PrintOrientation);
                setSheetIdx(0);
              }}
              className="w-full px-3 py-2 text-ios-body border border-surface-border rounded-xl bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="portrait">Potret</option>
              <option value="landscape">Lanskap</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted px-0.5">
            Zoom
          </p>
          <div className="flex items-center gap-1 flex-1">
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              disabled={zoom <= 0.3}
              onClick={() =>
                setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)))
              }
              aria-label="Perkecil"
              className="border border-surface-border bg-surface-card"
            >
              <Minus size={14} />
            </Button>
            <p className="text-ios-footnote font-medium text-surface-text tabular-nums w-11 text-center">
              {Math.round(zoom * 100)}%
            </p>
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              disabled={zoom >= 1.5}
              onClick={() =>
                setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))
              }
              aria-label="Perbesar"
              className="border border-surface-border bg-surface-card"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
      </section>

      <div className="overflow-auto rounded-xl border border-surface-border bg-slate-100 p-4">
        <div className="flex min-h-[70vh] min-w-max items-center justify-center">
          <div
            className="flex-shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-md"
            style={{
              width: baseSize.w * zoom,
              height: baseSize.h * zoom,
            }}
          >
            <div
              ref={printRef}
              data-print-root="true"
              className={`bg-white text-slate-900 p-8 ${className}`}
              style={
                {
                  fontSize: `${fontSize}pt`,
                  width: `${sheetWidthMm}mm`,
                  minWidth: `${sheetWidthMm}mm`,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  border: "none",
                  boxShadow: "none",
                  borderRadius: 0,
                  "--print-fs": `${fontSize}pt`,
                } as React.CSSProperties
              }
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="xs"
          iconOnly
          disabled={sheetIdx <= 0}
          onClick={() => setSheetIdx((idx) => idx - 1)}
          aria-label="Lembar sebelumnya"
          className="border border-surface-border bg-surface-card"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="text-ios-footnote font-medium text-surface-text tabular-nums">
          Lembar {sheetIdx + 1}
        </p>
        <Button
          variant="ghost"
          size="xs"
          iconOnly
          onClick={() => setSheetIdx((idx) => idx + 1)}
          aria-label="Lembar berikutnya"
          className="border border-surface-border bg-surface-card"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default UnifiedPrintPreview;
