import React, {
  useMemo,
  useState,
  useRef,
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
  box-sizing: border-box;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
[data-print-root="true"] * {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}
[data-print-root="true"] th,
[data-print-root="true"] td {
  vertical-align: middle !important;
  box-sizing: border-box;
  /* Keep a visible breathing space below every value in the preview and PDF. */
  padding-bottom: 0.5rem !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] {
  padding: 2mm 6mm !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] th,
[data-print-root="true"][data-print-profile="shodaqoh"] td {
  padding: 0.08em 0.35em 0.28em !important;
  line-height: 1 !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-table {
  table-layout: fixed;
  font-size: 0.84em !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-table thead th {
  padding-top: 0.12em !important;
  padding-bottom: 1.2mm !important;
  line-height: 1.1 !important;
  vertical-align: middle !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-table tbody td {
  padding-top: 0.4mm !important;
  padding-bottom: 1.6mm !important;
  line-height: 1.05 !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-total-row td {
  padding-top: 2mm !important;
  padding-bottom: 2.5mm !important;
  line-height: 1.2 !important;
  vertical-align: middle !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-header-label {
  display: block;
  position: relative;
  z-index: 1;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-merged-header {
  background-color: rgb(241, 245, 249) !important;
  color: rgb(15, 23, 42) !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-table thead tr:first-child {
  height: 6mm;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-table thead tr:nth-child(2) {
  height: 5mm;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-header {
  padding-bottom: 1mm !important;
  margin-bottom: 2mm !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-header h1,
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-header p {
  line-height: 1 !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-header h1 {
  font-size: 1.15em !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-header p {
  font-size: 0.85em !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-signature {
  margin-top: 2mm !important;
  padding-top: 1mm !important;
  font-size: 0.8em !important;
  line-height: 1.1 !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-signature p {
  margin-bottom: 0 !important;
}
[data-print-root="true"][data-print-profile="shodaqoh"] .print-shodaqoh-signature > div > p:first-child {
  margin-bottom: 12mm !important;
}
[data-print-root="true"] tbody td:not([class~="text-center"]):not([class~="text-right"]) {
  text-align: left !important;
}
[data-print-root="true"] td[class~="text-right"],
[data-print-root="true"] th[class~="text-right"] {
  text-align: right !important;
}
[data-print-root="true"] thead {
  display: table-header-group;
}
[data-print-root="true"] tr {
  break-inside: avoid;
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
@media print {
  body.printing-finance {
    visibility: hidden !important;
  }
  body.printing-finance [data-print-root="true"] {
    visibility: visible !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    margin: 0 !important;
    transform: none !important;
    box-shadow: none !important;
  }
}
`;
export interface UnifiedPrintPreviewProps {
  filename: string;
  children: React.ReactNode;
  onClose: () => void;
  showExport?: boolean;
  exportFilename?: string;
  className?: string;
  printProfile?: "default" | "shodaqoh";
  defaultOrientation?: PrintOrientation;
  defaultFontSize?: PrintFontSize;
}
export const UnifiedPrintPreview: React.FC<UnifiedPrintPreviewProps> = ({
  filename,
  children,
  onClose,
  showExport = true,
  exportFilename,
  className = "",
  printProfile = "default",
  defaultOrientation = "portrait",
  defaultFontSize = "7",
}) => {
  const [fontSize, setFontSize] = useState<PrintFontSize>(defaultFontSize);
  const [orientation, setOrientation] =
    useState<PrintOrientation>(defaultOrientation);
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
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-finance-print-page", "true");
    styleEl.textContent = `@page { size: A4 ${orientation}; margin: 0; }`;
    document.head.appendChild(styleEl);

    const startPrint = () => document.body.classList.add("printing-finance");
    const endPrint = () => document.body.classList.remove("printing-finance");
    window.addEventListener("beforeprint", startPrint);
    window.addEventListener("afterprint", endPrint);

    return () => {
      window.removeEventListener("beforeprint", startPrint);
      window.removeEventListener("afterprint", endPrint);
      document.body.classList.remove("printing-finance");
      styleEl.remove();
    };
  }, [orientation]);
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
  const sheetSizeMm = useMemo(() => {
    const sizes: Record<PrintOrientation, { w: number; h: number }> = {
      portrait: { w: 210, h: 297 },
      landscape: { w: 297, h: 210 },
    };
    return sizes[orientation];
  }, [orientation]);
  // Tinggi satu lembar dalam px layout (tanpa zoom) untuk navigasi swipe.
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageHpx = (baseSize.w * sheetSizeMm.h) / sheetSizeMm.w;
  const pageCount = Math.max(1, Math.ceil(baseSize.h / pageHpx));
  useLayoutEffect(() => {
    if (sheetIdx > pageCount - 1) setSheetIdx(pageCount - 1);
  }, [pageCount, sheetIdx]);
  const syncPageFromScroll = () => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const current = Math.round((scrollTop + 16) / (pageHpx * zoom));
    setSheetIdx(Math.max(0, Math.min(pageCount - 1, current)));
  };
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startY = touchStartY.current;
    touchStartY.current = null;
    if (startY === null) return;
    const endY = event.changedTouches[0]?.clientY;
    if (endY === undefined) return;
    const deltaY = startY - endY;
    if (Math.abs(deltaY) < 40) return;
    const currentPage = Math.round(
      ((scrollRef.current?.scrollTop ?? 0) + 16) / (pageHpx * zoom),
    );
    gotoPage(currentPage + (deltaY > 0 ? 1 : -1));
  };
  const gotoPage = (idx: number) => {
    const clamped = Math.max(0, Math.min(pageCount - 1, idx));
    setSheetIdx(clamped);
    scrollRef.current?.scrollTo({
      top: Math.max(0, clamped * pageHpx * zoom - 16),
      behavior: "smooth",
    });
  };
  return (
    <div className="px-4 space-y-3 pb-8">
      <style>{PRINT_STYLE_OVERRIDES}</style>
      <section className="rounded-2xl border border-surface-border bg-surface-card p-3 space-y-2.5">
        {showExport && (
          <FinancePrintActions
            exportRef={printRef}
            filename={exportFilename || filename}
            orientation={orientation}
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
      <div
        ref={scrollRef}
        onScroll={syncPageFromScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="overflow-auto rounded-xl border border-surface-border bg-slate-100 p-4"
        style={{
          height: `${pageHpx * zoom + 32}px`,
          maxHeight: "75vh",
          overscrollBehavior: "contain",
        }}
      >
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
              data-print-profile={printProfile}
              className={`bg-white text-slate-900 p-8 ${className}`}
              style={
                {
                  fontSize: `${fontSize}pt`,
                  width: `${sheetSizeMm.w}mm`,
                  minWidth: `${sheetSizeMm.w}mm`,
                  minHeight: `${sheetSizeMm.h}mm`,
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
          onClick={() => gotoPage(sheetIdx - 1)}
          aria-label="Lembar sebelumnya"
          className="border border-surface-border bg-surface-card"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="text-ios-footnote font-medium text-surface-text tabular-nums">
          Lembar {sheetIdx + 1} / {pageCount}
        </p>
        <Button
          variant="ghost"
          size="xs"
          iconOnly
          disabled={sheetIdx >= pageCount - 1}
          onClick={() => gotoPage(sheetIdx + 1)}
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
