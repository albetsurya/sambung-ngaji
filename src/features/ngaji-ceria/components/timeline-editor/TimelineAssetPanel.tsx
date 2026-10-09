import React from "react";
import type { TimelineText } from "../../utils/pageTimeline";
import type { DragData } from "./types";

interface Props {
  assets: { audioUrl: string; filename: string; type: string; duration: number }[];
  unlinkedTexts: TimelineText[];
  hasLinkedTexts: boolean;
  saving: boolean;
  selectionId: string | null;
  selectionType: "audio" | "text" | null;
  seconds: (value: number) => string;
  onPreviewAsset: (asset: { audioUrl: string; filename: string; type: string; duration: number }) => void;
  onAddAsset: (asset: { audioUrl: string; filename: string; type: string; duration: number }) => void;
  onAddText: () => void;
  onStartDrag: (event: React.DragEvent, data: DragData) => void;
  onBeginTouch: (event: React.PointerEvent, data: DragData) => void;
  onEndDrag: (event: React.DragEvent) => void;
  onDropUnlinked: (event: React.DragEvent) => void;
  onTextClick: (text: TimelineText) => void;
  onCloseMobile: () => void;
}

export const TimelineAssetPanel: React.FC<Props> = ({
  assets, unlinkedTexts, hasLinkedTexts, saving, selectionId, selectionType,
  seconds, onPreviewAsset, onAddAsset, onAddText,
  onStartDrag, onBeginTouch, onEndDrag, onDropUnlinked, onTextClick, onCloseMobile,
}) => (
  <aside className="te-assets" aria-label="Daftar aset audio dan teks">
    <h2><span>1. Aset halaman</span><button className="te-mobile-close" onClick={onCloseMobile} aria-label="Tutup panel aset">×</button></h2>
    <p className="te-help">Tarik aset ke timeline atau klik +. Sumber tetap tersedia setelah trim/gunting.</p>
    <h3>Audio sumber ({assets.length})</h3>
    <div className="te-asset-list">
      {assets.map((asset) => (
        <div key={asset.audioUrl} className="te-asset" draggable
          onPointerDown={(event) => onBeginTouch(event, { type: "asset", id: asset.audioUrl })}
          onDragStart={(event) => onStartDrag(event, { type: "asset", id: asset.audioUrl })}
          onDragEnd={onEndDrag}>
          <strong title={asset.filename}>{asset.filename}</strong><small>{asset.type} · {seconds(asset.duration)}</small>
          <div><button className="te-btn" aria-label={`Preview ${asset.filename}`} onClick={() => onPreviewAsset(asset)}>▶</button>
            <button className="te-btn" aria-label={`Tambah ${asset.filename}`} onClick={() => onAddAsset(asset)}>+ Timeline</button></div>
        </div>
      ))}
    </div>
    <h3>Teks belum dipasangkan</h3><button className="te-btn" onClick={onAddText}>+ Tambah teks</button>
    <div className="te-unlinked" onDragOver={(event) => event.preventDefault()} onDrop={onDropUnlinked}>
      {unlinkedTexts.map((text) => (
        <button key={String(text.id)} data-text-id={String(text.id)}
          className={`te-text ${selectionType === "text" && selectionId === String(text.id) ? "is-selected" : ""}`}
          draggable={!saving}
          onDragStart={(event) => onStartDrag(event, { type: "text", id: String(text.id) })}
          onPointerDown={(event) => onBeginTouch(event, { type: "text", id: String(text.id) })}
          onDragEnd={onEndDrag} onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); event.stopPropagation(); }}
          onClick={() => onTextClick(text)}>
          <span className="te-arabic" dir="rtl">{text.arabic}</span>
        </button>
      ))}
      {hasLinkedTexts && <p className="te-help">Semua teks sudah terhubung. Drop teks di sini untuk melepas pasangan.</p>}
    </div>
  </aside>
);
