import React from "react";
import type { AudioAsset, TimelineAudioClip, TimelineText } from "../../utils/pageTimeline";
import { newTimelineId } from "../../utils/pageTimeline";
import { NGAJI_CERIA_ASSETS } from "@/features/ngaji-ceria/data/assets";
import { arabicToLatinParts, latinToArabic } from "../../utils/translit";

interface Props {
  assets: AudioAsset[];
  clips: TimelineAudioClip[];
  texts: TimelineText[];
  selection: { type: "audio" | "text"; id: string } | null;
  selectedClip: TimelineAudioClip | undefined;
  selectedText: TimelineText | undefined;
  selectedPosition: { start: number } | undefined;
  playhead: number;
  cutAt: number;
  mobilePanel: "inspector" | null;
  kinds: readonly string[];
  seconds: (v: number) => string;
  clipDuration: (clip: TimelineAudioClip) => number;
  segmentDuration: (segs: TimelineAudioClip["segments"]) => number;
  onCloseMobile: () => void;
  onAssignSource: (url: string) => void;
  onEditClip: (patch: Partial<TimelineAudioClip>) => void;
  onEditText: (patch: Partial<TimelineText>) => void;
  onCutAtChange: (v: number) => void;
  onPreviewClip: () => void;
  onCut: () => void;
  onDuplicateClip: () => void;
  onPairText: (textId: string) => void;
  onRemoveClip: () => void;
  onRemoveText: () => void;
  onPairClipForText: (clipId: string | null) => void;
  onChangePairText: (checked: boolean) => void;
}

export const TimelineInspector: React.FC<Props> = ({
  assets, clips, texts, selection, selectedClip, selectedText, selectedPosition,
  playhead, cutAt, mobilePanel, kinds, seconds, clipDuration, segmentDuration,
  onCloseMobile, onAssignSource, onEditClip, onEditText, onCutAtChange,
  onPreviewClip, onCut, onDuplicateClip, onPairText, onRemoveClip, onRemoveText, onPairClipForText, onChangePairText,
}) => (
  <aside className={`te-inspector ${mobilePanel === "inspector" ? "is-mobile-open" : ""}`} aria-label="Pengaturan klip dan teks">
    <h2><span>3. Pengaturan</span><button className="te-mobile-close" onClick={onCloseMobile} aria-label="Tutup panel pengaturan">×</button></h2>
    {!selection && <p className="te-help">Pilih audio atau teks melalui timeline / daftar item untuk mengeditnya.</p>}
    {(selectedClip || selectedText) && <label>Sumber audio halaman
      <select aria-label="Sumber audio" value={selectedClip?.segments.length === 1 ? selectedClip.segments[0].sourceUrl : ""} onChange={(e) => onAssignSource(e.target.value)}>
        <option value="">{selectedClip?.segments.length && selectedClip.segments.length > 1 ? "Gabungan beberapa sumber" : "Pilih sumber audio…"}</option>
        {assets.map((a) => <option key={a.audioUrl} value={a.audioUrl}>{a.filename} · {seconds(a.duration)}</option>)}
      </select>
    </label>}
    {selectedClip && <>
      <label>Nama klip<input value={selectedClip.label} onChange={(e) => onEditClip({ label: e.target.value })} /></label>
      <label>Jenis klip<select value={selectedClip.kind} onChange={(e) => onEditClip({ kind: e.target.value as TimelineAudioClip["kind"] })}>{kinds.map((k) => <option key={k}>{k}</option>)}</select></label>
      <div className="te-time-fields">
        <label>Mulai sumber (s)<input aria-label="Mulai sumber" type="number" min="0" max={selectedClip.trimEnd - 0.02} step="0.001" value={Number(selectedClip.trimStart.toFixed(3))}
          onChange={(e) => onEditClip({ trimStart: Math.max(0, Math.min(selectedClip.trimEnd - 0.02, Number(e.target.value))) })} /></label>
        <label>Selesai sumber (s)<input aria-label="Selesai sumber" type="number" min={selectedClip.trimStart + 0.02} max={segmentDuration(selectedClip.segments)} step="0.001" value={Number(selectedClip.trimEnd.toFixed(3))}
          onChange={(e) => onEditClip({ trimEnd: Math.max(selectedClip.trimStart + 0.02, Math.min(segmentDuration(selectedClip.segments), Number(e.target.value))) })} /></label>
      </div>
      <label>Garis gunting (dalam klip, s)<input aria-label="Posisi gunting" type="number" min="0" max={clipDuration(selectedClip)} step="0.001" value={Number(Math.min(cutAt, clipDuration(selectedClip)).toFixed(3))}
        onChange={(e) => onCutAtChange(Math.max(0, Math.min(clipDuration(selectedClip), Number(e.target.value))))} /></label>
      <div className="te-detail-bar">
        <div className="te-detail-cut" style={{ left: `${Math.min(cutAt / clipDuration(selectedClip), 1) * 100}%` }}><img src={NGAJI_CERIA_ASSETS.iconScissors} alt="Cut" className="h-3 w-3" /></div>
        <div className="te-detail-play" style={{ left: `${Math.max(0, Math.min(1, (playhead - (selectedPosition?.start || 0)) / clipDuration(selectedClip))) * 100}%` }} />
      </div>
      <input aria-label="Slider gunting" type="range" min="0" max={clipDuration(selectedClip)} step="0.001" value={Math.min(cutAt, clipDuration(selectedClip))} onChange={(e) => onCutAtChange(Number(e.target.value))} />
      <div className="te-actions"><button className="te-btn" onClick={onPreviewClip}><img src={NGAJI_CERIA_ASSETS.iconPlay} alt="Play" className="h-3 w-3 inline-block" /> Preview klip</button>
        <button className="te-btn" disabled={cutAt <= 0 || cutAt >= clipDuration(selectedClip)} onClick={onCut}><img src={NGAJI_CERIA_ASSETS.iconScissors} alt="Cut" className="h-3 w-3 inline-block" /> Gunting</button>
        <button className="te-btn" onClick={onDuplicateClip}>Duplikat</button>
      </div>
      <p className="te-help">Potongan A dan B tetap di timeline. Teks awal mengikuti A; pasangkan atau tambah teks B sesuai bacaan.</p>
      <label>Pasangkan teks<select value="" onChange={(e) => { if (e.target.value) onPairText(e.target.value); }}><option value="">Pilih teks tersedia…</option>
        {texts.map((t) => <option key={String(t.id)} value={String(t.id)}>{t.arabic}</option>)}</select></label>
      <button className="te-btn te-danger" onClick={onRemoveClip}>Hapus klip dari hasil akhir</button>
    </>}
    {selectedText && <>
      <h3>Edit teks</h3>
      <label>Teks Arab (auto-generate Latin)<textarea aria-label="Teks Arab" dir="rtl" className="te-arabic" rows={3} value={selectedText.arabic} onChange={(e) => {
        const val = e.target.value;
        const autoParts = arabicToLatinParts(val);
        onEditText({ arabic: val, transliterationParts: autoParts.length > 0 ? autoParts : selectedText.transliterationParts });
      }} /></label>
      <label>Transliterasi (satu token per baris, auto-generate Arab)<textarea rows={3} value={selectedText.transliterationParts.join("\n")} onChange={(e) => {
        const val = e.target.value;
        const parts = val.split("\n");
        const autoArabic = parts.map((p) => latinToArabic(p.trim())).filter(Boolean).join(" ");
        onEditText({ transliterationParts: parts, arabic: autoArabic || selectedText.arabic });
      }} /></label>
      <button
        type="button"
        className="te-btn te-small"
        style={{ marginTop: "-4px", marginBottom: "8px" }}
        onClick={() => {
          const parts = arabicToLatinParts(selectedText.arabic);
          if (parts.length > 0) onEditText({ transliterationParts: parts });
        }}
      >
        Auto Perbaiki Latin dari Arab
      </button>
      <label>Nada / keterangan<input value={selectedText.hintTone} onChange={(e) => onEditText({ hintTone: e.target.value })} /></label>
      <label>Pasangan klip<select value={selectedText.clipId || ""} onChange={(e) => onPairClipForText(e.target.value || null)}><option value="">Tanpa audio</option>
        {clips.map((clip) => <option key={clip.id} value={clip.id}>{clip.label} · {seconds(clipDuration(clip))}</option>)}</select></label>
      <label className="te-checkbox"><input type="checkbox" checked={Boolean(selectedText.isListenOnly)} onChange={(e) => onChangePairText(e.target.checked)} /> Contoh / demo (dengarkan saja)</label>
      <button className="te-btn te-danger" onClick={onRemoveText}>Hapus teks dari hasil akhir</button>
    </>}
  </aside>
);
