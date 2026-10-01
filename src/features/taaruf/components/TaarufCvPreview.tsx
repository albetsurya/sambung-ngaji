import { forwardRef, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Member } from "../../../types";
import {
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Minus,
  Plus,
} from "../../../components/ui/FontAwesomeIcons";
import { resolveTaarufValues, TAARUF_FIELDS } from "./taarufFields";
import { TAARUF_THEMES, type TaarufThemeKey } from "./taarufThemes";


export interface TaarufPhotoState {
  scale: number;
  x: number;
  y: number;
}

export type TaarufSectionKey = "biodata" | "pendidikan";
export type TaarufRegionKey = "kop" | "foto" | TaarufSectionKey;
export type TaarufFontSize = "S" | "M" | "L";

export interface TaarufPrintOptions {
  hidden: Record<string, boolean>;
  overrides: Record<string, string>;
  showPhoto: boolean;
  showBiodata: boolean;
  showEducation: boolean;
  theme: TaarufThemeKey;
  photoSide: "right" | "left";
  sectionOrder: TaarufSectionKey[];
  photo: TaarufPhotoState;
  fontSize: Record<"kop" | TaarufSectionKey, TaarufFontSize>;
}

export const DEFAULT_PRINT_OPTIONS: TaarufPrintOptions = {
  hidden: {},
  overrides: {},
  showPhoto: true,
  showBiodata: true,
  showEducation: true,
  theme: "emerald",
  photoSide: "right",
  sectionOrder: ["biodata", "pendidikan"],
  photo: { scale: 1, x: 0, y: 0 },
  fontSize: { kop: "M", biodata: "M", pendidikan: "M" },
};

const ORDER_KEYS: TaarufSectionKey[] = ["biodata", "pendidikan"];
const FONT_MULT: Record<TaarufFontSize, number> = { S: 0.85, M: 1, L: 1.18 };
const FONT_ORDER: TaarufFontSize[] = ["S", "M", "L"];

function px(base: number, size: TaarufFontSize): string {
  return `${Math.max(9, Math.round(base * FONT_MULT[size]))}px`;
}

export function clampPhoto(p: TaarufPhotoState): TaarufPhotoState {
  const scale = Math.min(2.5, Math.max(1, p.scale));
  const maxX = (88 * (scale - 1)) / 2;
  const maxY = (104 * (scale - 1)) / 2;
  return {
    scale,
    x: Math.min(maxX, Math.max(-maxX, p.x)),
    y: Math.min(maxY, Math.max(-maxY, p.y)),
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

function SectionLabel({
  children,
  size,
  handle,
}: {
  children: string;
  size: TaarufFontSize;
  handle?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <p
        className="font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap"
        style={{ fontSize: px(11, size) }}
      >
        {children}
      </p>
      <div className="h-px flex-1 bg-slate-200" />
      {handle}
    </div>
  );
}

function Field({
  label,
  value,
  size,
}: {
  label: string;
  value?: string;
  size: TaarufFontSize;
}) {
  return (
    <div className="min-w-0">
      <p
        className="uppercase tracking-[0.08em] text-slate-400 mb-0.5"
        style={{ fontSize: px(11, size) }}
      >
        {label}
      </p>
      <p
        className="font-medium text-slate-900 leading-snug break-words"
        style={{ fontSize: px(14, size) }}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function MiniBtn({
  label,
  title,
  active,
  onClick,
  wide,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: (e: React.MouseEvent) => void;
  wide?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={typeof label === "string" ? label : title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`h-7 ${wide ? "px-2" : "w-7"} rounded-lg flex items-center justify-center text-[11px] font-bold transition-all active:scale-90 ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function InlineToolbar({
  size,
  onSize,
  hidden,
  onHide,
  hideTitle,
  onUp,
  onDown,
  onDone,
}: {
  size: TaarufFontSize;
  onSize: (s: TaarufFontSize) => void;
  hidden?: boolean;
  onHide?: () => void;
  hideTitle?: string;
  onUp?: () => void;
  onDown?: () => void;
  onDone: () => void;
}) {
  const EyeIcon = hidden ? EyeOff : Eye;
  return (
    <div
      className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-2 py-1.5 mb-3"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1">
        {FONT_ORDER.map((s) => (
          <MiniBtn
            key={s}
            label={s}
            title={`Ukuran font ${s}`}
            active={size === s}
            onClick={() => onSize(s)}
          />
        ))}
      </div>
      <div className="w-px h-5 bg-slate-200" />
      {onHide && (
        <MiniBtn
          label={<EyeIcon size={13} />}
          title={hideTitle || "Sembunyikan"}
          active={hidden}
          onClick={onHide}
        />
      )}
      {onUp && (
        <MiniBtn
          label="↑"
          title="Pindahkan ke atas"
          onClick={onUp}
        />
      )}
      {onDown && (
        <MiniBtn
          label="↓"
          title="Pindahkan ke bawah"
          onClick={onDown}
        />
      )}
      <div className="flex-1" />
      <MiniBtn
        label={<Check size={13} />}
        title="Selesai"
        active
        onClick={onDone}
      />
    </div>
  );
}

function HiddenPlaceholder({
  label,
  onShow,
}: {
  label: string;
  onShow: () => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onShow();
      }}
      className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <Eye size={14} className="text-slate-400 shrink-0" />
      <p className="flex-1 text-[12px] text-slate-500">{label} disembunyikan</p>
      <span className="text-[12px] font-bold text-slate-700 shrink-0">
        Tampilkan
      </span>
    </div>
  );
}

function HiddenPhotoPlaceholder({ onShow }: { onShow: () => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onShow();
      }}
      className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 flex items-center gap-2 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <Eye size={12} className="text-slate-400 shrink-0" />
      <p className="flex-1 text-[11px] text-slate-500">Foto disembunyikan</p>
      <span className="text-[11px] font-bold text-slate-700 shrink-0">
        Tampilkan
      </span>
    </div>
  );
}


function PhotoFrame({
  src,
  name,
  photo,
  themeKey,
  selected,
  onPhotoChange,
  onSelect,
  onZoom,
  onToggleSide,
  onHide,
  onDone,
}: {
  src?: string;
  name: string;
  photo: TaarufPhotoState;
  themeKey: TaarufThemeKey;
  selected?: boolean;
  onPhotoChange?: (p: TaarufPhotoState) => void;
  onSelect?: () => void;
  onZoom?: (d: number) => void;
  onToggleSide?: () => void;
  onHide?: () => void;
  onDone?: () => void;
}) {
  const theme = TAARUF_THEMES[themeKey];
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(
    null,
  );
  const editable = !!onPhotoChange;
  const [imgError, setImgError] = useState(false);
  useEffect(() => setImgError(false), [src]);
  const showPhoto = !!src && !imgError;

  return (
    <div
      className={`relative w-[88px] h-[104px] rounded-xl overflow-hidden border shrink-0 bg-slate-100 ${
        selected ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200"
      } ${editable && showPhoto ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (editable && showPhoto) {
          e.stopPropagation();
          onSelect?.();
        }
      }}
    >
      {showPhoto ? (
        <img
          src={src}
          alt={name}
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          onPointerDown={(e) => {
            onSelect?.();
            if (!onPhotoChange) return;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { sx: e.clientX, sy: e.clientY, ox: photo.x, oy: photo.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current || !onPhotoChange) return;
            onPhotoChange(
              clampPhoto({
                ...photo,
                x: drag.current.ox + (e.clientX - drag.current.sx),
                y: drag.current.oy + (e.clientY - drag.current.sy),
              }),
            );
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          className={`w-full h-full object-cover select-none ${
            editable ? "cursor-grab active:cursor-grabbing touch-none" : ""
          }`}
          style={{
            transform: `translate(${photo.x}px, ${photo.y}px) scale(${photo.scale})`,
            transformOrigin: "center",
          }}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${theme.softBg}`}
        >
          <span className={`text-[28px] font-bold ${theme.accentText}`}>
            {initials(name)}
          </span>
        </div>
      )}

      {/* Toolbar overlay, hanya saat foto dipilih */}
      {selected && showPhoto && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-1 bg-slate-900/25">
          <div className="flex items-center justify-between">
            <span className="pointer-events-auto flex gap-1">
              <MiniBtn label="⇄" title="Pindah kiri/kanan" onClick={() => onToggleSide?.()} />
            </span>
            <span className="pointer-events-auto flex gap-1">
              <MiniBtn
                label={<EyeOff size={12} />}
                title="Sembunyikan foto"
                onClick={() => onHide?.()}
              />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="pointer-events-auto flex gap-1">
              <MiniBtn
                label={<Minus size={12} />}
                title="Zoom out"
                onClick={() => onZoom?.(-0.15)}
              />
              <span className="h-7 px-1.5 rounded-lg bg-white/90 text-slate-900 text-[10px] font-bold flex items-center tabular-nums">
                {Math.round(photo.scale * 100)}%
              </span>
              <MiniBtn
                label={<Plus size={12} />}
                title="Zoom in"
                onClick={() => onZoom?.(0.15)}
              />
            </span>
            <span className="pointer-events-auto">
              <MiniBtn
                label={<Check size={12} />}
                title="Selesai"
                active
                onClick={() => onDone?.()}
              />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


export const TaarufCvPreview = forwardRef<
  HTMLDivElement,
  {
    member: Member;
    options?: TaarufPrintOptions;
    selection?: TaarufRegionKey | null;
    onSelect?: (r: TaarufRegionKey | null) => void;
    onPhotoChange?: (p: TaarufPhotoState) => void;
    onSectionOrderChange?: (order: TaarufSectionKey[]) => void;
    onMoveSection?: (key: TaarufSectionKey, dir: -1 | 1) => void;
    onFontSize?: (region: "kop" | TaarufSectionKey, s: TaarufFontSize) => void;
    onToggleSection?: (key: TaarufSectionKey) => void;
    onTogglePhotoSide?: () => void;
    onHidePhoto?: () => void;
    onRestoreSection?: (key: TaarufSectionKey) => void;
    onRestorePhoto?: () => void;
    hideConfidential?: boolean;
  }
>(function TaarufCvPreview(
  {
    member,
    options,
    selection,
    onSelect,
    onPhotoChange,
    onSectionOrderChange,
    onMoveSection,
    onFontSize,
    onToggleSection,
    onTogglePhotoSide,
    onHidePhoto,
    onRestoreSection,
    onRestorePhoto,
    hideConfidential,
  },
  ref,
) {
  const opts = options || DEFAULT_PRINT_OPTIONS;
  const theme = TAARUF_THEMES[opts.theme];
  const values = resolveTaarufValues(member, opts.overrides);
  const visibleFields = TAARUF_FIELDS.filter((f) => !opts.hidden[f.key]);
  const editable = !!onSelect;
  const generated = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const pendidikan = member.pendidikan || [];
  const fallbackEdu =
    !pendidikan.length &&
    (member.jenjang_pendidikan || member.sekolah || member.jurusan)
      ? [
          member.jenjang_pendidikan,
          member.sekolah,
          member.jurusan,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";

  const secRefs = useRef<
    Partial<Record<TaarufSectionKey, HTMLDivElement | null>>
  >({});
  const [drag, setDrag] = useState<{
    key: TaarufSectionKey;
    startY: number;
    dy: number;
    hSelf: number;
    hOther: number;
  } | null>(null);

  const biodataVisible = opts.showBiodata && visibleFields.length > 0;
  const visibleSectionCount =
    (biodataVisible ? 1 : 0) + (opts.showEducation ? 1 : 0);
  const reorderable = !!onSectionOrderChange && visibleSectionCount > 1;

  function isCrossed(d: NonNullable<typeof drag>): boolean {
    const dragIdx = opts.sectionOrder.indexOf(d.key);
    return dragIdx === 0 ? d.dy > d.hOther / 2 : d.dy < -d.hOther / 2;
  }

  function sectionStyle(key: TaarufSectionKey): CSSProperties | undefined {
    if (!drag) return undefined;
    const idx = opts.sectionOrder.indexOf(key);
    const dragIdx = opts.sectionOrder.indexOf(drag.key);
    if (idx === -1 || dragIdx === -1) return undefined;
    if (key === drag.key) {
      return {
        transform: `translateY(${drag.dy}px)`,
        position: "relative",
        zIndex: 10,
      };
    }
    if (!isCrossed(drag)) return undefined;
    return {
      transform: `translateY(${dragIdx === 0 ? -drag.hSelf : drag.hSelf}px)`,
      transition: "transform 150ms ease-out",
      position: "relative",
    };
  }

  function move(key: TaarufSectionKey, dir: -1 | 1) {
    if (onMoveSection) {
      onMoveSection(key, dir);
      return;
    }
    if (!onSectionOrderChange) return;
    const order = [...opts.sectionOrder];
    const i = order.indexOf(key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    onSectionOrderChange(order);
  }

  function dragHandle(key: TaarufSectionKey, label: string) {
    if (!reorderable) return undefined;
    const dragging = drag?.key === key;
    return (
      <span
        role="button"
        aria-label={`Seret untuk memindahkan ${label}`}
        title="Tahan & seret untuk memindahkan"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          const heights = ORDER_KEYS.map(
            (k) => secRefs.current[k]?.getBoundingClientRect().height || 0,
          );
          const i = ORDER_KEYS.indexOf(key);
          setDrag({
            key,
            startY: e.clientY,
            dy: 0,
            hSelf: heights[i] || 0,
            hOther: heights[1 - i] || 0,
          });
        }}
        onPointerMove={(e) => {
          setDrag((d) =>
            d && d.key === key ? { ...d, dy: e.clientY - d.startY } : d,
          );
        }}
        onPointerUp={() => {
          setDrag((d) => {
            if (d && d.key === key && isCrossed(d)) {
              const order = [...opts.sectionOrder];
              const i = order.indexOf(key);
              const j = i === 0 ? 1 : 0;
              [order[i], order[j]] = [order[j], order[i]];
              onSectionOrderChange?.(order);
            }
            return null;
          });
        }}
        onPointerCancel={() => setDrag(null)}
        className={`w-7 h-7 -mr-1 rounded-lg flex items-center justify-center shrink-0 touch-none select-none transition-colors active:bg-slate-200 ${
          dragging ? "bg-slate-200 text-slate-700" : "text-slate-300"
        }`}
      >
        <GripVertical size={14} />
      </span>
    );
  }

  function selectRegion(key: TaarufSectionKey) {
    if (!editable) return;
    onSelect?.(selection === key ? null : key);
  }

  const biodataSection = biodataVisible ? (
    <div key="biodata">
      <SectionLabel size={opts.fontSize.biodata} handle={dragHandle("biodata", "Data Pribadi")}>
        Data Pribadi
      </SectionLabel>
      {selection === "biodata" && (
        <InlineToolbar
          size={opts.fontSize.biodata}
          onSize={(s) => onFontSize?.("biodata", s)}
          hidden={false}
          onHide={() => onToggleSection?.("biodata")}
          hideTitle="Sembunyikan Data Pribadi"
          onUp={() => move("biodata", -1)}
          onDown={() => move("biodata", 1)}
          onDone={() => onSelect?.(null)}
        />
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {visibleFields.map((f, i) => (
          <div
            key={f.key}
            className={
              f.wide || (visibleFields.length % 2 === 1 && i === visibleFields.length - 1)
                ? "col-span-2"
                : undefined
            }
          >
            <Field label={f.label} value={values[f.key]} size={opts.fontSize.biodata} />
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const educationSection = opts.showEducation ? (
    <div key="pendidikan">
      <SectionLabel size={opts.fontSize.pendidikan} handle={dragHandle("pendidikan", "Pendidikan")}>
        Pendidikan
      </SectionLabel>
      {selection === "pendidikan" && (
        <InlineToolbar
          size={opts.fontSize.pendidikan}
          onSize={(s) => onFontSize?.("pendidikan", s)}
          hidden={false}
          onHide={() => onToggleSection?.("pendidikan")}
          hideTitle="Sembunyikan Pendidikan"
          onUp={() => move("pendidikan", -1)}
          onDown={() => move("pendidikan", 1)}
          onDone={() => onSelect?.(null)}
        />
      )}
      {pendidikan.length === 0 ? (
        <p className="text-slate-400" style={{ fontSize: px(13, opts.fontSize.pendidikan) }}>
          {fallbackEdu || "Belum ada riwayat pendidikan."}
        </p>
      ) : (
        <div className="space-y-3">
          {pendidikan.map((e) => (
            <div key={e.education_id} className="flex gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
              <div className="min-w-0 flex-1">
                <p
                  className="font-semibold leading-snug"
                  style={{ fontSize: px(14, opts.fontSize.pendidikan) }}
                >
                  {e.jenjang}
                  {e.kelas ? ` · Kelas ${e.kelas}` : ""}
                </p>
                <p
                  className="text-slate-500 leading-snug"
                  style={{ fontSize: px(13, opts.fontSize.pendidikan) }}
                >
                  {[e.sekolah, e.jurusan].filter(Boolean).join(" · ")}
                </p>
              </div>
              {(e.tahun_mulai || e.tahun_selesai) && (
                <p
                  className="text-slate-400 tabular-nums shrink-0"
                  style={{ fontSize: px(12, opts.fontSize.pendidikan) }}
                >
                  {[e.tahun_mulai, e.tahun_selesai].filter(Boolean).join("–")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  ) : null;

  const sections: Record<TaarufSectionKey, React.ReactNode> = {
    biodata:
      biodataSection ??
      (editable ? (
        <HiddenPlaceholder
          label="Data Pribadi"
          onShow={() => onRestoreSection?.("biodata")}
        />
      ) : null),
    pendidikan:
      educationSection ??
      (editable ? (
        <HiddenPlaceholder
          label="Pendidikan"
          onShow={() => onRestoreSection?.("pendidikan")}
        />
      ) : null),
  };

  return (
    <div
      ref={ref}
      className="bg-white text-slate-900 rounded-2xl border border-slate-200 overflow-hidden max-w-[560px] mx-auto"
    >
      
      <div className={`h-1.5 ${theme.bar}`} />

      <div className="p-6">
        
        <div
          className={editable ? "cursor-pointer" : undefined}
          onClick={() => {
            if (editable) onSelect?.(selection === "kop" ? null : "kop");
          }}
        >
          <div
            className={`flex items-start justify-between gap-4 rounded-xl -m-1 p-1 transition-colors ${
              opts.photoSide === "left" ? "flex-row-reverse" : ""
            } ${selection === "kop" ? "ring-2 ring-slate-900/30" : ""}`}
          >
            
            <div className="min-w-0 flex-1">
              <p
                className={`font-bold uppercase tracking-[0.22em] ${theme.accentText}`}
                style={{ fontSize: px(11, opts.fontSize.kop) }}
              >
                CV Taaruf
              </p>
              <h2
                className="leading-tight font-bold tracking-[-0.01em] mt-1 break-words"
                style={{ fontSize: px(22, opts.fontSize.kop) }}
              >
                {member.nama_lengkap}
              </h2>
              <p
                className="text-slate-500 mt-0.5"
                style={{ fontSize: px(13, opts.fontSize.kop) }}
              >
                {[
                  member.nama_panggilan
                    ? `Panggilan: ${member.nama_panggilan}`
                    : "",
                  member.is_nikah ? "Menikah" : "",
                ]
                  .filter(Boolean)
                  .join(" · ") || "\u00A0"}
              </p>
            </div>
            {opts.showPhoto ? (
              <PhotoFrame
                src={member.foto_url}
                name={member.nama_lengkap}
                photo={opts.photo}
                themeKey={opts.theme}
                selected={selection === "foto"}
                onPhotoChange={onPhotoChange}
                onSelect={editable ? () => onSelect?.("foto") : undefined}
                onZoom={
                  onPhotoChange
                    ? (d) =>
                        onPhotoChange(
                          clampPhoto({ ...opts.photo, scale: opts.photo.scale + d }),
                        )
                    : undefined
                }
                onToggleSide={onTogglePhotoSide}
                onHide={onHidePhoto}
                onDone={() => onSelect?.(null)}
              />
            ) : null}
          </div>
          {!opts.showPhoto && editable && (
            <HiddenPhotoPlaceholder onShow={() => onRestorePhoto?.()} />
          )}
          {selection === "kop" && (
            <InlineToolbar
              size={opts.fontSize.kop}
              onSize={(s) => onFontSize?.("kop", s)}
              onDone={() => onSelect?.(null)}
            />
          )}
        </div>

        {opts.sectionOrder.map((k) =>
          sections[k] ? (
            <div
              key={k}
              ref={(el) => {
                secRefs.current[k] = el;
              }}
              style={sectionStyle(k)}
              onClick={() => selectRegion(k)}
              className={`${editable ? "cursor-pointer" : ""} rounded-xl -m-1 p-1 transition-shadow ${
                drag?.key === k
                  ? "bg-white shadow-lg ring-1 ring-slate-200"
                  : selection === k
                    ? "ring-2 ring-slate-900/30"
                    : ""
              }`}
            >
              {sections[k]}
            </div>
          ) : null,
        )}

        
        <div className="mt-6 pt-4 border-t border-slate-200">
          {!hideConfidential && (
            <p className="text-[11px] leading-relaxed text-slate-400">
              Dokumen rahasia. Hanya untuk keperluan taaruf melalui tim PNKB.
              Dilarang menyebarluaskan tanpa izin pemilik data.
            </p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            Dibuat dari aplikasi Sambung Ngaji · {generated}
          </p>
        </div>
      </div>
    </div>
  );
});
