import type { QuizQuestion } from "../data/tilawatiQuizTypes";

export type ClipKind = "header" | "demo" | "baris" | "isi" | "footer";
export interface AudioAsset {
  audioUrl: string;
  filename: string;
  duration: number;
  type: ClipKind;
}
export interface AudioSegment {
  sourceUrl: string;
  start: number;
  end: number;
}
export interface TimelineAudioClip {
  id: string;
  label: string;
  kind: ClipKind;
  segments: AudioSegment[];
  trimStart: number;
  trimEnd: number;
  outputUrl?: string;
}
export interface TimelineText extends Omit<QuizQuestion, "audioUrl" | "audioMappingComplete"> {
  clipId: string | null;
}
export interface PageTimeline {
  version: 2;
  clips: TimelineAudioClip[];
  texts: TimelineText[];
}
export interface PublishedTimeline {
  timeline: PageTimeline;
  questions: QuizQuestion[];
  revision: string;
}

export const newTimelineId = () => `clip-${crypto.randomUUID()}`;
export const segmentDuration = (segments: AudioSegment[]) =>
  segments.reduce((sum, segment) => sum + segment.end - segment.start, 0);
export const clipDuration = (clip: TimelineAudioClip) => clip.trimEnd - clip.trimStart;

/** Flatten trimming into source ranges; no edits ever modify a source file. */
export function visibleSegments(clip: TimelineAudioClip): AudioSegment[] {
  let offset = 0;
  return clip.segments.flatMap((segment) => {
    const length = segment.end - segment.start;
    const start = Math.max(clip.trimStart, offset);
    const end = Math.min(clip.trimEnd, offset + length);
    offset += length;
    if (end <= start) return [];
    // Aritmetika float (terutama setelah gabung/gunting berulang) bisa
    // menghasilkan epsilon negatif seperti -2.2e-16 yang ditolak Web Audio
    // (offset < 0) dan ffmpeg (-ss negatif). Jepit ke rentang valid.
    const safeStart = Math.max(0, segment.start + start - (offset - length));
    const safeEnd = Math.max(safeStart, segment.start + end - (offset - length));
    return safeEnd > safeStart
      ? [{ sourceUrl: segment.sourceUrl, start: safeStart, end: safeEnd }]
      : [];
  });
}

export function clipFromAsset(asset: AudioAsset, id = newTimelineId()): TimelineAudioClip {
  return {
    id, label: asset.filename, kind: asset.type,
    segments: [{ sourceUrl: asset.audioUrl, start: 0, end: asset.duration }],
    trimStart: 0, trimEnd: asset.duration,
  };
}

export function initialTimeline(assets: AudioAsset[], questions: QuizQuestion[]): PageTimeline {
  const clips = assets.filter((asset) => asset.duration > 0).map((asset, index) => clipFromAsset(asset, `asset-${index}`));
  const texts = questions.map(({ audioUrl, audioMappingComplete: _complete, ...question }) => ({
    ...question,
    clipId: clips.find((clip) => clip.segments[0].sourceUrl === audioUrl)?.id ?? null,
  }));
  return { version: 2, clips, texts };
}

export function splitTimelineClip(project: PageTimeline, id: string, at: number, secondId = newTimelineId()): PageTimeline {
  const clip = project.clips.find((item) => item.id === id);
  if (!clip || at <= 0 || at >= clipDuration(clip)) return project;
  const boundary = clip.trimStart + at;
  return {
    ...project,
    clips: project.clips.flatMap((item) => item.id !== id ? [item] : [
      { ...item, label: `${item.label} · A`, trimEnd: boundary, outputUrl: undefined },
      { ...item, id: secondId, label: `${item.label} · B`, trimStart: boundary, outputUrl: undefined },
    ]),
  };
}

export function removeTimelineClips(project: PageTimeline, ids: string[]): PageTimeline {
  return {
    ...project,
    clips: project.clips.filter((clip) => !ids.includes(clip.id)),
    texts: project.texts.map((text) => text.clipId && ids.includes(text.clipId) ? { ...text, clipId: null } : text),
  };
}

export function duplicateTimelineClip(project: PageTimeline, id: string, newId = newTimelineId()): PageTimeline {
  const clip = project.clips.find((item) => item.id === id);
  if (!clip) return project;
  const newClip = { ...clip, id: newId, label: `${clip.label} (copy)` };
  return {
    ...project,
    clips: [...project.clips, newClip],
  };
}

export function pairTimelineText(project: PageTimeline, textId: string, clipId: string | null): PageTimeline {
  return { ...project, texts: project.texts.map((text) => String(text.id) === textId ? { ...text, clipId } : text) };
}

export function reorderTimelineClip(project: PageTimeline, id: string, beforeId: string | null): PageTimeline {
  const clip = project.clips.find((item) => item.id === id);
  if (!clip || id === beforeId) return project;
  const clips = project.clips.filter((item) => item.id !== id);
  const index = beforeId ? clips.findIndex((item) => item.id === beforeId) : clips.length;
  clips.splice(index < 0 ? clips.length : index, 0, clip);
  return { ...project, clips };
}

export function mergeTimelineClips(project: PageTimeline, ids: string[], mergedId = newTimelineId()): PageTimeline {
  const selected = project.clips.filter((clip) => ids.includes(clip.id));
  if (selected.length < 2) return project;
  const segments = selected.flatMap(visibleSegments);
  const merged: TimelineAudioClip = {
    id: mergedId, label: `Gabungan ${selected.length} klip`, kind: selected[0].kind,
    segments, trimStart: 0, trimEnd: segmentDuration(segments),
  };
  let inserted = false;
  return {
    ...project,
    clips: project.clips.flatMap((clip) => {
      if (!ids.includes(clip.id)) return [clip];
      if (inserted) return [];
      inserted = true;
      return [merged];
    }),
    texts: project.texts.map((text) => text.clipId && ids.includes(text.clipId) ? { ...text, clipId: mergedId } : text),
  };
}

/** A final quiz row contains all text associated with its rendered audio clip. */
export function timelineQuestions(project: PageTimeline): QuizQuestion[] {
  const rows: QuizQuestion[] = [];
  const makeRow = (texts: TimelineText[], url: string): QuizQuestion => {
    const { clipId: _clipId, ...first } = texts[0];
    const parts = texts.flatMap((text) => text.transliterationParts);
    const distractors = [...new Set(texts.flatMap((text) => text.options).filter((option) => !parts.includes(option)))];
    return {
      ...first,
      arabic: texts.map((text) => text.arabic.trim()).join("   "),
      transliterationParts: parts,
      options: [...parts, ...distractors],
      audioUrl: url,
      audioMappingComplete: true,
    };
  };
  for (const clip of project.clips) {
    const texts = project.texts.filter((text) => text.clipId === clip.id);
    if (texts.length) rows.push(makeRow(texts, clip.outputUrl || ""));
  }
  for (const text of project.texts.filter((text) => !text.clipId)) rows.push(makeRow([text], ""));
  return rows;
}
