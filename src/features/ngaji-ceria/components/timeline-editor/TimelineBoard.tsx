import React from "react";
import type { AudioAsset, TimelineAudioClip, TimelineText } from "../../utils/pageTimeline";
import { ClipWaveform } from "./ClipWaveform";
import { NGAJI_CERIA_ASSETS } from "@/features/ngaji-ceria/data/assets";

type ClipPosition = { clip: TimelineAudioClip; start: number; end: number };

interface Props {
  assets: AudioAsset[];
  clips: TimelineAudioClip[];
  texts: TimelineText[];
  positions: ClipPosition[];
  total: number;
  playhead: number;
  zoom: number;
  cutAt?: number;  timelineWidth: number;
  historyLen: number;
  futureLen: number;
  playing: boolean;
  selectedClip: TimelineAudioClip | undefined;
  selectedPosition: ClipPosition | undefined;
  mergeIds: string[];
  seconds: (v: number) => string;
  clipDuration: (clip: TimelineAudioClip) => number;
  onUndo: () => void;
  onRedo: () => void;
  onPreviewToggle: () => void;
  onCut: () => void;
  onMerge: () => void;
  onZoomChange: (v: number) => void;
  onRulerPointerDown: (e: React.PointerEvent) => void;
  onBottomRulerPointerDown: (e: React.PointerEvent, el: HTMLElement) => void;
  onPlayheadPointerDown: (e: React.PointerEvent, el: HTMLElement) => void;
  onSelectClip: (clip: TimelineAudioClip, localTime?: number) => void;
  onDropText?: (id: string) => void;  onStartDrag: (e: React.DragEvent, data: { type: string; id: string }) => void;
  onBeginTouch: (e: React.PointerEvent, data: { type: string; id: string }) => void;
  onEndDrag: (e: React.DragEvent) => void;
  onDropClip: (id: string | null) => void;
  onHandlePointer: (e: React.PointerEvent, clip: TimelineAudioClip, action: "left" | "right" | "cut") => void;
  onMergeToggle: (id: string, checked: boolean) => void;
  onPreviewAsset: (asset: AudioAsset) => void;
  onAddAsset: (asset: AudioAsset) => void;
  onSelectText: (id: string) => void;
}

export const TimelineBoard: React.FC<Props> = ({
  assets, clips, texts, positions, total, playhead, zoom, cutAt = 0, timelineWidth,
  historyLen, futureLen, playing, selectedClip, mergeIds,
  seconds, clipDuration,
  onUndo, onRedo, onPreviewToggle, onCut, onMerge, onZoomChange,
  onRulerPointerDown, onBottomRulerPointerDown, onPlayheadPointerDown,
  onSelectClip, onStartDrag, onBeginTouch, onEndDrag, onDropClip, onHandlePointer, onMergeToggle,
  onPreviewAsset, onAddAsset, onSelectText, onDropText,
}) => {
  const textButton = (text: TimelineText) => (
    <button key={String(text.id)} data-text-id={String(text.id)} className="te-text"
      draggable onDragStart={(e) => onStartDrag(e, { type: "text", id: String(text.id) })}
      onPointerDown={(e) => onBeginTouch(e, { type: "text", id: String(text.id) })}
      onDragEnd={onEndDrag} onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onClick={() => onSelectText(String(text.id))}>
      <span className="te-arabic" dir="rtl">{text.arabic}</span>
    </button>
  );

  return (
    <section className="te-board" aria-label="Timeline audio dan teks">
      <h2>2. Timeline halaman</h2>
      <div className="te-toolbar">
        <button className="te-btn te-action-btn" aria-label="Undo" title="Undo" onClick={onUndo} disabled={!historyLen}><img src={NGAJI_CERIA_ASSETS.iconUndo} alt="Undo" className="h-4 w-4 object-contain inline-block" /><span className="te-action-label">Undo</span></button>
        <button className="te-btn te-action-btn" aria-label="Redo" title="Redo" onClick={onRedo} disabled={!futureLen}><img src={NGAJI_CERIA_ASSETS.iconRedo} alt="Redo" className="h-4 w-4 object-contain inline-block" /><span className="te-action-label">Redo</span></button>
        <button className="te-btn te-action-btn te-action-preview" aria-label={playing ? "Stop preview" : "Preview dari garis merah"} title={playing ? "Stop preview" : "Preview dari garis merah"} onClick={onPreviewToggle} disabled={!clips.length}><img src={playing ? NGAJI_CERIA_ASSETS.iconStop : NGAJI_CERIA_ASSETS.iconPlay} alt="Play/Stop" className="h-4 w-4 object-contain inline-block" /><span className="te-action-label">{playing ? "Stop" : "Preview"}</span></button>
        <button className="te-btn te-action-btn te-action-cut" disabled={!selectedClip} onClick={onCut} aria-label="Gunting" title="Gunting"><img src={NGAJI_CERIA_ASSETS.iconScissors} alt="Gunting" className="h-4 w-4 object-contain inline-block" /><span className="te-action-label">Gunting</span></button>
        <button className="te-btn te-action-btn te-action-merge" aria-label="Gabung klip terpilih" title="Gabung klip terpilih" disabled={mergeIds.filter((id) => clips.some((clip) => clip.id === id)).length < 2} onClick={onMerge}><img src={NGAJI_CERIA_ASSETS.iconMergeClips} alt="Gabung" className="h-4 w-4 object-contain inline-block" /><span className="te-action-label">Gabung {mergeIds.length}</span></button>
        <label className="te-zoom">Zoom <input aria-label="Zoom timeline" type="range" min="8" max="100" value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} /></label>
      </div>
      <p className="te-help">Tarik penggaris atas untuk zoom. Tarik penggaris bawah untuk memindahkan garis merah dan menentukan awal preview. Tarik tepi klip untuk trim.</p>
      <div className="te-scroll">
        <div className="te-tracks" style={{ width: timelineWidth }}>
          <div className="te-ruler" onPointerDown={onRulerPointerDown} aria-label="Penggaris zoom timeline">
            {Array.from({ length: Math.ceil(total / 5) + 1 }, (_, i) => <span key={i} style={{ left: i * 5 * zoom }}>{i * 5}s</span>)}
          </div>
          <div className="te-track-audio" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDropClip(null); }}>
            {positions.map(({ clip, start }) => (
              <div key={clip.id} data-clip-id={clip.id} className={`te-clip te-kind-${clip.kind} ${selectedClip?.id === clip.id ? "is-selected" : ""}`}
                style={{ left: start * zoom, width: clipDuration(clip) * zoom }}
                onPointerDown={(e) => onBeginTouch(e, { type: "audio", id: clip.id })}
                onClick={(e) => onSelectClip(clip, (e.clientX - e.currentTarget.getBoundingClientRect().left) / zoom)}
                draggable onDragStart={(e) => onStartDrag(e, { type: "audio", id: clip.id })} onDragEnd={onEndDrag}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropClip(clip.id); }}>
                <span className="te-clip-title">{clip.label}</span><small>{clip.kind} · {seconds(clipDuration(clip))}</small>
                <ClipWaveform clip={clip} />
                <label className="te-merge-select" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={mergeIds.includes(clip.id)} aria-label={`Pilih gabung ${clip.label}`}
                  onChange={(e) => onMergeToggle(clip.id, e.target.checked)} /> Gabung</label>
                {selectedClip?.id === clip.id && <>
                  <button aria-label="Tarik awal audio" className="te-handle te-left" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => onHandlePointer(e, clip, "left")} />
                  <button aria-label="Tarik akhir audio" className="te-handle te-right" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => onHandlePointer(e, clip, "right")} />
                  <button aria-label="Geser garis gunting" className="te-cut-line" style={{ left: Math.min(cutAt, clipDuration(clip)) * zoom }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => onHandlePointer(e, clip, "cut")}><img src={NGAJI_CERIA_ASSETS.iconScissors} alt="Cut" className="h-4 w-4" /></button>
                </>}
              </div>
            ))}
            <div className="te-drop-end" style={{ left: total * zoom }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDropClip(null); }}>+ Drop</div>
          </div>
          <div className="te-track-text">
            {positions.map(({ clip, start }) => <div className="te-linked-texts" key={clip.id} style={{ left: start * zoom, width: clipDuration(clip) * zoom }}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              {texts.filter((text) => text.clipId === clip.id).map(textButton)}
              {!texts.some((text) => text.clipId === clip.id) && <span className="te-help">Drop teks</span>}
            </div>)}
          </div>
          <div className="te-playhead" style={{ left: playhead * zoom }} role="slider" aria-label="Posisi preview" aria-valuemin={0} aria-valuemax={total} aria-valuenow={playhead}
            onPointerDown={(e) => onPlayheadPointerDown(e, e.currentTarget.parentElement as HTMLElement)}><img src={NGAJI_CERIA_ASSETS.iconPlayHeadMarker} alt="Marker" className="h-4 w-4" /></div>
        </div>
        <div className="te-bottom-ruler" style={{ width: timelineWidth }} onPointerDown={(e) => onBottomRulerPointerDown(e, e.currentTarget)} aria-label="Penggaris posisi preview">
          {Array.from({ length: Math.ceil(total / 5) + 1 }, (_, i) => <span key={i} style={{ left: i * 5 * zoom }}>{i * 5}s</span>)}
          <div className="te-bottom-playhead" style={{ left: playhead * zoom }}><div className="h-2 w-2 rounded-full bg-red-500" /></div>
        </div>
      </div>
      <div className="te-time-readout">Playhead {seconds(playhead)} / {seconds(total)} · {clips.length} klip · {texts.length} teks</div>
      <div className="te-mobile-assets" aria-label="Asset audio mobile">
        <h3>Asset audio</h3>
        <div className="te-mobile-asset-strip">
          {assets.map((asset) => (
            <div key={asset.audioUrl} className="te-mobile-asset-card" draggable onPointerDown={(e) => onBeginTouch(e, { type: "asset", id: asset.audioUrl })} onDragStart={(e) => onStartDrag(e, { type: "asset", id: asset.audioUrl })} onDragEnd={onEndDrag}>
              <strong title={asset.filename}>{asset.filename}</strong>
              <small>{asset.type} · {seconds(asset.duration)}</small>
              <div><button className="te-btn" aria-label={`Preview ${asset.filename}`} onClick={() => onPreviewAsset(asset)}><img src={NGAJI_CERIA_ASSETS.iconPlay} alt="Play" className="h-3 w-3" /></button>
                <button className="te-btn" aria-label={`Tambah ${asset.filename}`} onClick={() => onAddAsset(asset)}>+</button></div>
            </div>
          ))}
        </div>
      </div>
      <div className="te-page-list"><h3>Daftar item draft</h3>
        {texts.map((text, index) => <button key={String(text.id)} data-text-id={String(text.id)} className="te-list-row"
          draggable onDragStart={(e) => onStartDrag(e, { type: "text", id: String(text.id) })} onDragEnd={onEndDrag}
          onPointerDown={(e) => onBeginTouch(e, { type: "text", id: String(text.id) })}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropText?.(String(text.id)); }}
          onClick={() => onSelectText(String(text.id))}>
          <span>{index + 1}. <span dir="rtl" className="te-arabic">{text.arabic}</span></span><small>{clips.find((clip) => clip.id === text.clipId)?.label || "Belum ada audio"} · Edit</small>
        </button>)}
      </div>
    </section>
  );
};
