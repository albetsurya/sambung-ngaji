import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { latinToArabic } from "../utils/translit";
import { TILAWATI_PAGE_DATASETS } from "../data/tilawatiPageDatasets";
import { getQuestionAudioUrl } from "../data/tilawatiAudioQuestionMap";
import {
  AudioAsset,
  AudioSegment,
  PageTimeline,
  TimelineAudioClip,
  TimelineText,
  clipDuration,
  clipFromAsset,
  initialTimeline,
  mergeTimelineClips,
  newTimelineId,
  pairTimelineText,
  removeTimelineClips,
  reorderTimelineClip,
  segmentDuration,
  splitTimelineClip,
  duplicateTimelineClip,
  visibleSegments,
} from "../utils/pageTimeline";
import "./TilawatiTimelineEditor.css";
import {
  restoreTimelineDraft,
  tilawatiEditorApi,
} from "../services/tilawatiEditorApi";
import { useTimelineDraftSave } from "../hooks/useTimelineDraftSave";

type Selection = { type: "audio" | "text"; id: string } | null;
type DragData = { type: "asset" | "audio" | "text"; id: string };
type TouchDrag = {
  data: DragData;
  startX: number;
  startY: number;
  moved: boolean;
  ghost: HTMLDivElement;
};
const clone = (project: PageTimeline) =>
  JSON.parse(JSON.stringify(project)) as PageTimeline;
const seconds = (value: number) => `${value.toFixed(3)}s`;
const kinds = ["header", "demo", "baris", "isi", "footer"] as const;

import { SNAP_PX } from "../components/timeline-editor/types";

import { ClipWaveform } from "../components/timeline-editor/ClipWaveform";
import {
  buildDragGhost,
  flashDroppedClip,
  followPointerWithGhost,
  placeGhostOnPoint,
  purgeStrayGhosts,
  startTouchEdgeScroll,
  transparentDragPixel,
  type GhostInfo,
} from "../components/timeline-editor/dragGhost";

export default function TilawatiCloudTimelineEditorPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const jilid = Math.min(5, Math.max(1, Number(params.get("jilid")) || 1));
  const hal = Math.min(44, Math.max(1, Number(params.get("hal")) || 1));
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [draft, setDraft] = useState<PageTimeline | null>(null);
  const [baseline, setBaseline] = useState("");
  const [revision, setRevision] = useState("");
  const [loadedPage, setLoadedPage] = useState("");
  const [selection, setSelection] = useState<Selection>(null);
  const [mergeIds, setMergeIds] = useState<string[]>([]);
  const [history, setHistory] = useState<PageTimeline[]>([]);
  const [future, setFuture] = useState<PageTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(32);
  const [cutAt, setCutAt] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  function snapPlayhead(raw: number): {
    value: number;
    snapped: string | null;
  } {
    const threshold = SNAP_PX / zoom;
    let value = raw;
    let snapped: string | null = null;
    let bestDist = threshold;

    for (const position of positions) {
      const dStart = Math.abs(raw - position.start);
      if (dStart < bestDist) {
        bestDist = dStart;
        value = position.start;
        snapped = "boundary";
      }
      const dEnd = Math.abs(raw - position.end);
      if (dEnd < bestDist) {
        bestDist = dEnd;
        value = position.end;
        snapped = "boundary";
      }
    }
    return { value, snapped };
  }

  const [playing, setPlaying] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"inspector" | null>(null);
  const dragData = useRef<DragData | null>(null);
  const touchDrag = useRef<TouchDrag | null>(null);
  const dragCleanup = useRef<(() => void) | null>(null);
  const context = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<string, Promise<AudioBuffer>>());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeSources = useRef<AudioBufferSourceNode[]>([]);
  const frame = useRef(0);
  const playToken = useRef(0);
  const dirty = draft !== null && JSON.stringify(draft) !== baseline;
  const draftSave = useTimelineDraftSave(
    jilid,
    hal,
    draft,
    revision,
    !loading && loadedPage === `${jilid}:${hal}`,
  );

  function stopPreview() {
    playToken.current += 1;
    cancelAnimationFrame(frame.current);
    for (const node of activeSources.current) {
      try {
        node.stop();
      } catch {
        /* already ended */
      }
    }
    activeSources.current = [];
    setPlaying(false);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setMessage("");
    stopPreview();
    tilawatiEditorApi
      .list(jilid, hal, controller.signal)
      .then(async (data) => {
        const restored = await restoreTimelineDraft(
          jilid,
          hal,
          data.revision,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        const page = TILAWATI_PAGE_DATASETS[jilid][hal];
        const questions = page.questions.map((question, index) => ({
          ...question,
          audioUrl: getQuestionAudioUrl(
            question,
            jilid,
            hal,
            index,
            Boolean(page.questions[0]?.isOpening),
          ),
        }));
        const base =
          data.published?.timeline ?? initialTimeline(data.clips, questions);
        const project = restored.draft?.timeline ?? base;
        setAssets(data.clips);
        setDraft(clone(project));
        setBaseline(JSON.stringify(base));
        setRevision(data.revision);
        setLoadedPage(`${jilid}:${hal}`);
        if (restored.draft)
          setMessage("Draft terbaru dipulihkan dari penyimpanan lokal/cloud.");
        if (!data.clips.length)
          setMessage(
            "Aset master halaman belum tersedia di server. Pastikan direktori frontend/public/audio terpasang pada backend.",
          );
        setHistory([]);
        setFuture([]);
        setMergeIds([]);
        setPlayhead(0);
        const focus = params.get("text");
        setSelection(
          focus && project.texts.some((text) => String(text.id) === focus)
            ? { type: "text", id: focus }
            : null,
        );
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [jilid, hal]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(
    () => () => {
      playToken.current += 1;
      cancelAnimationFrame(frame.current);
      activeSources.current.forEach((source) => {
        try {
          source.stop();
        } catch {
          /* ended */
        }
      });
      dragCleanup.current?.();
      touchDrag.current?.ghost.remove();
      touchDrag.current = null;
      const ctx = context.current;
      context.current = null;
      void ctx?.close();
    },
    [],
  );

  const clips = draft?.clips ?? [];
  const texts = draft?.texts ?? [];
  const selectedText =
    selection?.type === "text"
      ? texts.find((text) => String(text.id) === selection.id)
      : undefined;
  const selectedClip =
    selection?.type === "audio"
      ? clips.find((clip) => clip.id === selection.id)
      : clips.find((clip) => clip.id === selectedText?.clipId);
  let offset = 0;
  const positions = clips.map((clip) => {
    const start = offset;
    offset += clipDuration(clip);
    return { clip, start, end: offset };
  });
  const total = offset;
  const selectedPosition = positions.find(
    (item) => item.clip.id === selectedClip?.id,
  );
  const timelineWidth = Math.max(600, total * zoom + 80);

  useEffect(() => {
    setPlayhead((current) => Math.min(current, total));
  }, [total]);

  function setPlayheadFromClientX(clientX: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    setPlayhead(Math.max(0, Math.min(total, (clientX - rect.left) / zoom)));
  }

  function beginSeek(event: React.PointerEvent, element: HTMLElement) {
    event.preventDefault();
    event.stopPropagation();
    dragCleanup.current?.();
    stopPreview();
    const move = (pointer: PointerEvent) =>
      setPlayheadFromClientX(pointer.clientX, element);
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
      if (dragCleanup.current === cleanup) dragCleanup.current = null;
    };
    dragCleanup.current = cleanup;
    setPlayheadFromClientX(event.clientX, element);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup, { once: true });
  }

  function beginRulerInteraction(event: React.PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragCleanup.current?.();
    const element = event.currentTarget as HTMLElement;
    const initialX = event.clientX;
    const initialZoom = zoom;
    let moved = false;
    const move = (pointer: PointerEvent) => {
      if (Math.abs(pointer.clientX - initialX) > 4) moved = true;
      if (moved) {
        setZoom(
          Math.max(
            8,
            Math.min(100, initialZoom + (pointer.clientX - initialX) * 0.35),
          ),
        );
      }
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      if (dragCleanup.current === cleanup) dragCleanup.current = null;
    };
    const finish = (pointer: PointerEvent) => {
      if (!moved) {
        stopPreview();
        setPlayheadFromClientX(pointer.clientX, element);
      }
      cleanup();
    };
    dragCleanup.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  }

  function change(next: PageTimeline) {
    if (!draft || saving) return;
    stopPreview();
    setHistory((current) => [...current.slice(-59), clone(draft)]);
    setFuture([]);
    setDraft(next);
    setMessage("");
    setError("");
  }
  function undo() {
    if (!draft || !history.length) return;
    stopPreview();
    setFuture((current) => [clone(draft), ...current]);
    setDraft(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }
  function redo() {
    if (!draft || !future.length) return;
    stopPreview();
    setHistory((current) => [...current, clone(draft)]);
    setDraft(future[0]);
    setFuture(future.slice(1));
  }
  function selectClip(
    clip: TimelineAudioClip,
    localTime = clipDuration(clip) / 2,
  ) {
    setSelection({ type: "audio", id: clip.id });
    setCutAt(Math.max(0, Math.min(clipDuration(clip), localTime)));
    setMobilePanel("inspector");
  }
  function editClip(update: Partial<TimelineAudioClip>) {
    if (!draft || !selectedClip) return;
    change({
      ...draft,
      clips: clips.map((clip) =>
        clip.id === selectedClip.id ? { ...clip, ...update } : clip,
      ),
    });
  }
  function editText(update: Partial<TimelineText>) {
    if (!draft || !selectedText) return;
    change({
      ...draft,
      texts: texts.map((text) =>
        text.id === selectedText.id ? { ...text, ...update } : text,
      ),
    });
  }
  function addText() {
    if (!draft) return;
    const id = `text-${crypto.randomUUID()}`;
    change({
      ...draft,
      texts: [
        ...texts,
        {
          id,
          arabic: "Teks baru",
          transliterationParts: [],
          options: [],
          hintTone: "Rost: Baris",
          clipId: null,
        },
      ],
    });
    setSelection({ type: "text", id });
    setMobilePanel("inspector");
  }
  function addAsset(asset: AudioAsset, beforeId: string | null = null) {
    if (!draft || !asset.duration) return;
    const clip = clipFromAsset(asset);
    const next = { ...draft, clips: [...clips, clip] };
    change(reorderTimelineClip(next, clip.id, beforeId));
    selectClip(clip);
  }
  function assignSource(url: string) {
    if (!draft) return;
    const asset = assets.find((item) => item.audioUrl === url);
    if (!asset) return;
    const clip = clipFromAsset(asset, selectedClip?.id || newTimelineId());
    change({
      ...draft,
      clips: selectedClip
        ? clips.map((item) => (item.id === clip.id ? clip : item))
        : [...clips, clip],
      texts: selectedText
        ? texts.map((text) =>
            text.id === selectedText.id ? { ...text, clipId: clip.id } : text,
          )
        : texts,
    });
    setCutAt(clipDuration(clip) / 2);
  }
  function dropOnClip(clipId: string | null) {
    if (!draft || !dragData.current) return;
    const drag = dragData.current;
    if (drag.type === "text") change(pairTimelineText(draft, drag.id, clipId));
    else if (drag.type === "audio")
      change(reorderTimelineClip(draft, drag.id, clipId));
    else {
      const asset = assets.find((item) => item.audioUrl === drag.id);
      if (asset) addAsset(asset, clipId);
    }
    if (drag.type !== "asset")
      flashDroppedClip(drag.type === "audio" ? drag.id : clipId);
    dragData.current = null;
  }
  function dropOnText(textId: string) {
    if (!draft || !dragData.current) return;
    const drag = dragData.current;
    if (drag.type === "audio") change(pairTimelineText(draft, textId, drag.id));
    if (drag.type === "asset") {
      const asset = assets.find((item) => item.audioUrl === drag.id);
      if (asset) {
        const clip = clipFromAsset(asset);
        change(
          pairTimelineText(
            { ...draft, clips: [...clips, clip] },
            textId,
            clip.id,
          ),
        );
      }
    }
    dragData.current = null;
  }
  function describeDrag(data: DragData): GhostInfo {
    if (data.type === "audio") {
      const clip = clips.find((item) => item.id === data.id);
      return {
        variant: "clip",
        title: clip?.label || "Klip audio",
        sub: clip ? `${clip.kind} · ${seconds(clipDuration(clip))}` : undefined,
        toneClass: clip ? `te-kind-${clip.kind}` : undefined,
      };
    }
    if (data.type === "asset") {
      const asset = assets.find((item) => item.audioUrl === data.id);
      return {
        variant: "asset",
        title: asset?.filename || data.id.split("/").pop() || "Audio",
        sub: asset ? `${asset.type} · ${seconds(asset.duration)}` : undefined,
        toneClass: asset ? `te-kind-${asset.type}` : undefined,
      };
    }
    const text = texts.find((item) => String(item.id) === data.id);
    return {
      variant: "text",
      title: text ? text.arabic.slice(0, 32) : "Teks",
      sub: "Teks quiz",
    };
  }
  function startDrag(event: React.DragEvent, data: DragData) {
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
    dragData.current = data;
    (event.currentTarget as HTMLElement).classList.add("te-native-dragging");
    purgeStrayGhosts();
    const dragImage = buildDragGhost(describeDrag(data));
    document.body.appendChild(dragImage);
    // Gambar drag bawaan OS disembunyikan (hotspot-nya meleset di sebagian
    // Chromium desktop); ghost mini digerakkan manual agar tepat di kursor.
    event.dataTransfer.setDragImage(transparentDragPixel(), 0, 0);
    followPointerWithGhost(dragImage, event.clientX, event.clientY);
  }
  function endDrag(event: React.DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove("te-native-dragging");
    dragData.current = null;
  }
  function clearTouchDropTarget() {
    document
      .querySelectorAll<HTMLElement>(".te-touch-drop")
      .forEach((element) => element.classList.remove("te-touch-drop"));
  }
  function finishTouchDrop(data: DragData, clientX: number, clientY: number) {
    const target = document.elementFromPoint(
      clientX,
      clientY,
    ) as HTMLElement | null;
    const textTarget = target?.closest<HTMLElement>("[data-text-id]");
    const clipTarget = target?.closest<HTMLElement>("[data-clip-id]");
    const audioTrack = target?.closest<HTMLElement>(".te-track-audio");
    const unlinked = target?.closest<HTMLElement>(".te-unlinked");
    dragData.current = data;
    if (textTarget?.dataset.textId) dropOnText(textTarget.dataset.textId);
    else if (clipTarget?.dataset.clipId) dropOnClip(clipTarget.dataset.clipId);
    else if (audioTrack) dropOnClip(null);
    else if (unlinked && data.type === "text") {
      change(pairTimelineText(draft!, data.id, null));
      dragData.current = null;
    } else {
      dragData.current = null;
    }
  }
  function beginTouchDrag(event: React.PointerEvent, data: DragData) {
    if (event.pointerType !== "touch" || saving) return;
    const target = event.target as HTMLElement;
    if (data.type !== "text" && target.closest("button,input,select,textarea"))
      return;
    touchDrag.current?.ghost.remove();
    purgeStrayGhosts();
    const ghost = buildDragGhost(describeDrag(data));
    ghost.classList.add("is-touch");
    // Sembunyi sampai benar-benar bergerak (tap untuk seleksi tidak berkedip).
    ghost.style.visibility = "hidden";
    document.body.appendChild(ghost);
    placeGhostOnPoint(ghost, event.clientX, event.clientY);
    let lastX = event.clientX;
    // Scroll papan hanya saat jari ditempelkan di tepi kiri/kanan.
    const stopEdge = startTouchEdgeScroll(scrollRef.current, () =>
      touchDrag.current ? lastX : null,
    );
    const current: TouchDrag = {
      data,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      ghost,
    };
    touchDrag.current = current;
    dragData.current = data;
    const move = (pointer: PointerEvent) => {
      if (!touchDrag.current) return;
      lastX = pointer.clientX;
      const distance = Math.hypot(
        pointer.clientX - current.startX,
        pointer.clientY - current.startY,
      );
      if (distance > 8) {
        current.moved = true;
        ghost.style.visibility = "visible";
      }
      if (!current.moved) return;
      pointer.preventDefault();
      placeGhostOnPoint(ghost, pointer.clientX, pointer.clientY);
      clearTouchDropTarget();
      const hit = document.elementFromPoint(
        pointer.clientX,
        pointer.clientY,
      ) as HTMLElement | null;
      const dropTarget = hit?.closest<HTMLElement>(
        "[data-text-id], [data-clip-id], .te-track-audio, .te-unlinked",
      );
      dropTarget?.classList.add("te-touch-drop");
    };
    const cleanup = (pointer?: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("dragstart", abortForNative);
      stopEdge();
      clearTouchDropTarget();
      ghost.remove();
      touchDrag.current = null;
      if (pointer && current.moved)
        finishTouchDrop(data, pointer.clientX, pointer.clientY);
      else dragData.current = null;
    };
    const finish = (pointer: PointerEvent) => cleanup(pointer);
    const cancel = () => cleanup();
    // Long-press di sebagian browser memicu drag native HTML5: serahkan sesi
    // ke sana agar tidak muncul dua ghost (sentuh + native) sekaligus.
    const abortForNative = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("dragstart", abortForNative);
      stopEdge();
      clearTouchDropTarget();
      ghost.remove();
      if (touchDrag.current === current) touchDrag.current = null;
      // dragData.current sengaja dibiarkan: sesi drag native yang mengambil alih.
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
    window.addEventListener("dragstart", abortForNative);
  }
  function handlePointer(
    event: React.PointerEvent,
    clip: TimelineAudioClip,
    action: "left" | "right" | "cut",
  ) {
    if (!draft || saving) return;
    event.preventDefault();
    event.stopPropagation();
    dragCleanup.current?.();
    stopPreview();
    const initialX = event.clientX;
    const initialCut = cutAt;
    const original = clone(draft);
    if (action !== "cut") {
      setHistory((current) => [...current.slice(-59), original]);
      setFuture([]);
    }
    const move = (pointer: PointerEvent) => {
      const delta = (pointer.clientX - initialX) / zoom;
      if (action === "cut") {
        setCutAt(Math.min(clipDuration(clip), Math.max(0, initialCut + delta)));
      } else {
        const update =
          action === "left"
            ? {
                trimStart: Math.max(
                  0,
                  Math.min(clip.trimEnd - 0.02, clip.trimStart + delta),
                ),
              }
            : {
                trimEnd: Math.max(
                  clip.trimStart + 0.02,
                  Math.min(
                    segmentDuration(clip.segments),
                    clip.trimEnd + delta,
                  ),
                ),
              };
        setDraft({
          ...original,
          clips: original.clips.map((item) =>
            item.id === clip.id ? { ...item, ...update } : item,
          ),
        });
        setCutAt((current) =>
          Math.min(
            current,
            update.trimEnd
              ? update.trimEnd - clip.trimStart
              : clip.trimEnd - update.trimStart!,
          ),
        );
      }
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
      dragCleanup.current = null;
    };
    dragCleanup.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup, { once: true });
  }

  async function preview(
    playClips: TimelineAudioClip[],
    startAt = 0,
    displayOffset = 0,
  ) {
    stopPreview();
    setError("");
    const token = playToken.current;
    try {
      // Konteks yang sudah tertutup (mis. setelah unmount/cleanup) tidak
      // boleh dipakai lagi: resume()/decode di atasnya melempar
      // "Cannot resume a closed AudioContext".
      if (!context.current || context.current.state === "closed") {
        context.current = new AudioContext();
      }
      const ctx = context.current;
      await ctx.resume();
      // Dibatalkan saat menunggu (navigasi/unmount): berhenti diam-diam.
      if (
        token !== playToken.current ||
        context.current !== ctx ||
        ctx.state === "closed"
      )
        return;
      const scheduledSegments: Array<{
        segment: AudioSegment;
        duration: number;
      }> = [];
      let cursor = 0;
      for (const segment of playClips.flatMap(visibleSegments)) {
        const length = segment.end - segment.start;
        const visibleStart = Math.max(0, startAt - cursor);
        const visibleEnd = Math.min(
          length,
          Math.max(0, startAt + total - cursor),
        );
        if (visibleEnd > visibleStart) {
          scheduledSegments.push({
            segment: {
              ...segment,
              start: segment.start + visibleStart,
              end: segment.start + visibleEnd,
            },
            duration: visibleEnd - visibleStart,
          });
        }
        cursor += length;
      }
      const audioBuffers = await Promise.all(
        scheduledSegments.map(({ segment }) => {
          if (!buffers.current.has(segment.sourceUrl)) {
            const promise = fetch(segment.sourceUrl).then(async (response) => {
              if (!response.ok)
                throw new Error("Audio sumber tidak ditemukan.");
              return ctx.decodeAudioData(await response.arrayBuffer());
            });
            buffers.current.set(segment.sourceUrl, promise);
            promise.catch(() => buffers.current.delete(segment.sourceUrl));
          }
          return buffers.current.get(segment.sourceUrl)!;
        }),
      );
      if (token !== playToken.current) return;
      let elapsed = 0;
      const startTime = ctx.currentTime + 0.04;
      scheduledSegments.forEach(({ segment, duration }, index) => {
        const buffer = audioBuffers[index];
        const bufferDuration = buffer.duration;
        // Jepit offset/durasi ke dalam buffer: sisa noise float negatif atau
        // offset di ujung file membuat start() melempar RangeError.
        const safeOffset = Math.min(
          Math.max(0, segment.start),
          Math.max(0, bufferDuration - 1e-6),
        );
        const safeDuration = Math.min(
          Math.max(0, duration),
          Math.max(0, bufferDuration - safeOffset),
        );
        if (safeDuration > 1e-6) {
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(startTime + elapsed, safeOffset, safeDuration);
          activeSources.current.push(source);
        }
        elapsed += duration;
      });
      setPlaying(true);
      setPlayhead(displayOffset + startAt);
      const tick = () => {
        if (token !== playToken.current) return;
        const progress = Math.max(0, ctx.currentTime - startTime);
        setPlayhead(displayOffset + startAt + Math.min(progress, elapsed));
        if (progress >= elapsed) {
          setPlaying(false);
          activeSources.current = [];
          return;
        }
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch (err) {
      // Preview yang keburu dibatalkan (token basi) tidak perlu menampilkan error.
      if (token !== playToken.current) return;
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function saveFinal() {
    if (!draft || saving) return;
    stopPreview();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!(await draftSave.save(true)))
        throw new Error(
          "Draft cloud belum tersinkron. Periksa status draft sebelum publish.",
        );
      const data = await tilawatiEditorApi.publish(jilid, hal, draft, revision);
      if (!data.published)
        throw new Error("Respons publish tidak memiliki timeline hasil.");
      setDraft(clone(data.published.timeline));
      setBaseline(JSON.stringify(data.published.timeline));
      setRevision(data.published.revision);
      setAssets(data.clips);
      setHistory([]);
      setFuture([]);
      setMessage(
        "Hasil akhir tersimpan permanen. Audio, teks, pasangan, dan urutan halaman telah diperbarui.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function leave(url: string) {
    if (saving) return;
    if (
      dirty &&
      !window.confirm("Perubahan belum disimpan. Keluar dan buang draft?")
    )
      return;
    stopPreview();
    navigate(url);
  }
  function switchPage(nextJilid: number, nextHal: number) {
    if (
      dirty &&
      !window.confirm(
        "Perubahan belum disimpan. Pindah halaman dan buang draft?",
      )
    )
      return;
    setParams({ jilid: String(nextJilid), hal: String(nextHal) });
  }

  const textButton = (text: TimelineText) => (
    <button
      key={String(text.id)}
      data-text-id={String(text.id)}
      className={`te-text ${selection?.type === "text" && selection.id === String(text.id) ? "is-selected" : ""}`}
      draggable={!saving}
      onDragStart={(event) =>
        startDrag(event, { type: "text", id: String(text.id) })
      }
      onPointerDown={(event) =>
        beginTouchDrag(event, { type: "text", id: String(text.id) })
      }
      onDragEnd={endDrag}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dropOnText(String(text.id));
      }}
      onClick={() => {
        setSelection({ type: "text", id: String(text.id) });
        setMobilePanel("inspector");
      }}
    >
      <span className="te-arabic" dir="rtl">
        {text.arabic}
      </span>
    </button>
  );

  return (
    <div className="timeline-editor">
      <header className="te-header">
        <button
          className="te-btn"
          onClick={() =>
            leave(`/member/ngaji-ceria/cek-audio?jilid=${jilid}&hal=${hal}`)
          }
        >
          ← Cek Audio Manual
        </button>
        <div>
          <h1>Cloud Timeline Editor</h1>
          <p>
            Jilid {jilid} · Halaman {hal} ·{" "}
            {dirty ? "Draft belum disimpan" : "Sesuai hasil tersimpan"}
          </p>
        </div>
        <div className="te-page-select">
          <select
            aria-label="Jilid"
            value={jilid}
            disabled={saving}
            onChange={(event) => switchPage(Number(event.target.value), hal)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                Jilid {value}
              </option>
            ))}
          </select>
          <select
            aria-label="Halaman"
            value={hal}
            disabled={saving}
            onChange={(event) => switchPage(jilid, Number(event.target.value))}
          >
            {Array.from({ length: 44 }, (_, index) => (
              <option key={index} value={index + 1}>
                Hal {index + 1}
              </option>
            ))}
          </select>
        </div>
        <button
          className="te-btn"
          disabled={loading || saving || !draft}
          onClick={() => void draftSave.save()}
        >
          Simpan Draft
        </button>
        <button
          className="te-btn te-primary"
          disabled={loading || saving || !draft}
          onClick={saveFinal}
        >
          {saving ? "Merender & menyimpan…" : "Publish ke Cloud"}
        </button>
      </header>
      <div className="te-status" aria-live="polite">
        {[error, message, draftSave.status].filter(Boolean).join(" · ") ||
          "Draft tersimpan otomatis; publish merender klip audio final."}
      </div>
      {loading ? (
        <div className="te-empty">Membaca aset halaman…</div>
      ) : (
        draft && (
          <fieldset className="te-workspace" disabled={saving}>
            <aside
              className="te-assets"
              aria-label="Daftar aset audio dan teks"
            >
              <h2>
                <span>1. Aset halaman</span>
                <button
                  className="te-mobile-close"
                  onClick={() => setMobilePanel(null)}
                  aria-label="Tutup panel aset"
                >
                  ×
                </button>
              </h2>
              <p className="te-help">
                Tarik aset ke timeline atau klik +. Sumber tetap tersedia
                setelah trim/gunting.
              </p>
              <h3>Audio sumber ({assets.length})</h3>
              <div className="te-asset-list">
                {assets.map((asset) => (
                  <div
                    key={asset.audioUrl}
                    className="te-asset"
                    draggable
                    onPointerDown={(event) =>
                      beginTouchDrag(event, {
                        type: "asset",
                        id: asset.audioUrl,
                      })
                    }
                    onDragStart={(event) =>
                      startDrag(event, { type: "asset", id: asset.audioUrl })
                    }
                    onDragEnd={endDrag}
                  >
                    <strong title={asset.filename}>{asset.filename}</strong>
                    <small>
                      {asset.type} · {seconds(asset.duration)}
                    </small>
                    <div>
                      <button
                        className="te-btn"
                        aria-label={`Preview ${asset.filename}`}
                        onClick={() => preview([clipFromAsset(asset)], 0)}
                      >
                        ▶
                      </button>
                      <button
                        className="te-btn"
                        aria-label={`Tambah ${asset.filename}`}
                        onClick={() => addAsset(asset)}
                      >
                        + Timeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <h3>Teks belum dipasangkan</h3>
              <button className="te-btn" onClick={addText}>
                + Tambah teks
              </button>
              <div
                className="te-unlinked"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragData.current?.type === "text") {
                    change(pairTimelineText(draft, dragData.current.id, null));
                    dragData.current = null;
                  }
                }}
              >
                {texts.filter((text) => !text.clipId).map(textButton)}
                {!texts.some((text) => !text.clipId) && (
                  <p className="te-help">
                    Semua teks sudah terhubung. Drop teks di sini untuk melepas
                    pasangan.
                  </p>
                )}
              </div>
            </aside>

            <section className="te-board" aria-label="Timeline audio dan teks">
              <h2>2. Timeline halaman</h2>
              <div className="te-toolbar">
                <button
                  className="te-btn te-action-btn"
                  aria-label="Undo"
                  title="Undo"
                  onClick={undo}
                  disabled={!history.length}
                >
                  <span className="te-action-icon">↶</span>
                  <span className="te-action-label">Undo</span>
                </button>
                <button
                  className="te-btn te-action-btn"
                  aria-label="Redo"
                  title="Redo"
                  onClick={redo}
                  disabled={!future.length}
                >
                  <span className="te-action-icon">↷</span>
                  <span className="te-action-label">Redo</span>
                </button>
                <button
                  className="te-btn te-action-btn te-action-preview"
                  aria-label={
                    playing ? "Stop preview" : "Preview dari garis merah"
                  }
                  title={playing ? "Stop preview" : "Preview dari garis merah"}
                  onClick={() =>
                    playing ? stopPreview() : preview(clips, playhead)
                  }
                  disabled={!clips.length}
                >
                  <span className="te-action-icon">{playing ? "■" : "▶"}</span>
                  <span className="te-action-label">
                    {playing ? "Stop" : "Preview"}
                  </span>
                </button>
                <button
                  className="te-btn te-action-btn te-action-cut"
                  disabled={!selectedClip}
                  onClick={() => {
                    if (!selectedClip) return;
                    change(splitTimelineClip(draft, selectedClip.id, cutAt));
                    setCutAt(0);
                  }}
                  aria-label="Gunting"
                  title="Gunting"
                >
                  <span className="te-action-icon">✂</span>
                  <span className="te-action-label">Gunting</span>
                </button>
                <button
                  className="te-btn te-action-btn te-action-merge"
                  aria-label="Gabung klip terpilih"
                  title="Gabung klip terpilih"
                  disabled={
                    mergeIds.filter((id) =>
                      clips.some((clip) => clip.id === id),
                    ).length < 2
                  }
                  onClick={() => {
                    const next = mergeTimelineClips(draft, mergeIds);
                    change(next);
                    setMergeIds([]);
                    setSelection(null);
                  }}
                >
                  <span className="te-action-icon">⊕</span>
                  <span className="te-action-label">
                    Gabung {mergeIds.length}
                  </span>
                </button>
                <label className="te-zoom">
                  Zoom{" "}
                  <input
                    aria-label="Zoom timeline"
                    type="range"
                    min="8"
                    max="100"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                  />
                </label>
              </div>
              <p className="te-help">
                Tarik penggaris atas untuk zoom. Tarik penggaris bawah untuk
                memindahkan garis merah dan menentukan awal preview. Tarik tepi
                klip untuk trim.
              </p>
              <div className="te-scroll" ref={scrollRef}>
                <div className="te-tracks" style={{ width: timelineWidth }}>
                  <div
                    className="te-ruler"
                    onPointerDown={beginRulerInteraction}
                    aria-label="Penggaris zoom timeline"
                  >
                    {Array.from(
                      { length: Math.ceil(total / 5) + 1 },
                      (_, index) => (
                        <span key={index} style={{ left: index * 5 * zoom }}>
                          {index * 5}s
                        </span>
                      ),
                    )}
                  </div>
                  <div
                    className="te-track-audio"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      dropOnClip(null);
                    }}
                  >
                    {positions.map(({ clip, start }) => (
                      <div
                        key={clip.id}
                        data-clip-id={clip.id}
                        className={`te-clip te-kind-${clip.kind} ${selectedClip?.id === clip.id ? "is-selected" : ""}`}
                        style={{
                          left: start * zoom,
                          width: clipDuration(clip) * zoom,
                        }}
                        onPointerDown={(event) =>
                          beginTouchDrag(event, { type: "audio", id: clip.id })
                        }
                        onClick={(event) =>
                          selectClip(
                            clip,
                            (event.clientX -
                              event.currentTarget.getBoundingClientRect()
                                .left) /
                              zoom,
                          )
                        }
                        draggable
                        onDragStart={(event) =>
                          startDrag(event, { type: "audio", id: clip.id })
                        }
                        onDragEnd={endDrag}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          dropOnClip(clip.id);
                        }}
                      >
                        <span className="te-clip-title">{clip.label}</span>
                        <small>
                          {clip.kind} · {seconds(clipDuration(clip))}
                        </small>
                        <ClipWaveform clip={clip} />
                        <label
                          className="te-merge-select"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={mergeIds.includes(clip.id)}
                            aria-label={`Pilih gabung ${clip.label}`}
                            onChange={(event) =>
                              setMergeIds((ids) =>
                                event.target.checked
                                  ? [...ids, clip.id]
                                  : ids.filter((id) => id !== clip.id),
                              )
                            }
                          />{" "}
                          Gabung
                        </label>
                        {selectedClip?.id === clip.id && (
                          <>
                            <button
                              aria-label="Tarik awal audio"
                              className="te-handle te-left"
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) =>
                                handlePointer(event, clip, "left")
                              }
                            />
                            <button
                              aria-label="Tarik akhir audio"
                              className="te-handle te-right"
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) =>
                                handlePointer(event, clip, "right")
                              }
                            />
                            <button
                              aria-label="Geser garis gunting"
                              className="te-cut-line"
                              style={{
                                left:
                                  Math.min(cutAt, clipDuration(clip)) * zoom,
                              }}
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) =>
                                handlePointer(event, clip, "cut")
                              }
                            >
                              <span>✂</span>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    <div
                      className="te-drop-end"
                      style={{ left: total * zoom }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        dropOnClip(null);
                      }}
                    >
                      + Drop
                    </div>
                  </div>
                  <div className="te-track-text">
                    {positions.map(({ clip, start }) => (
                      <div
                        className="te-linked-texts"
                        key={clip.id}
                        style={{
                          left: start * zoom,
                          width: clipDuration(clip) * zoom,
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (dragData.current?.type === "text")
                            dropOnClip(clip.id);
                        }}
                      >
                        {texts
                          .filter((text) => text.clipId === clip.id)
                          .map(textButton)}
                        {!texts.some((text) => text.clipId === clip.id) && (
                          <span className="te-help">Drop teks</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    className="te-playhead"
                    style={{ left: playhead * zoom }}
                    role="slider"
                    aria-label="Posisi preview"
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={playhead}
                    onPointerDown={(event) =>
                      beginSeek(
                        event,
                        event.currentTarget.parentElement as HTMLElement,
                      )
                    }
                  >
                    <span>▼</span>
                  </div>
                </div>
                <div
                  className="te-bottom-ruler"
                  style={{ width: timelineWidth }}
                  onPointerDown={(event) =>
                    beginSeek(event, event.currentTarget)
                  }
                  aria-label="Penggaris posisi preview"
                >
                  {Array.from(
                    { length: Math.ceil(total / 5) + 1 },
                    (_, index) => (
                      <span key={index} style={{ left: index * 5 * zoom }}>
                        {index * 5}s
                      </span>
                    ),
                  )}
                  <div
                    className="te-bottom-playhead"
                    style={{ left: playhead * zoom }}
                  >
                    <span>●</span>
                  </div>
                </div>
              </div>
              <div className="te-time-readout">
                Playhead {seconds(playhead)} / {seconds(total)} · {clips.length}{" "}
                klip · {texts.length} teks
              </div>
              <div className="te-mobile-assets" aria-label="Asset audio mobile">
                <h3>Asset audio</h3>
                <div className="te-mobile-asset-strip">
                  {assets.map((asset) => (
                    <div
                      key={asset.audioUrl}
                      className="te-mobile-asset-card"
                      draggable
                      onPointerDown={(event) =>
                        beginTouchDrag(event, {
                          type: "asset",
                          id: asset.audioUrl,
                        })
                      }
                      onDragStart={(event) =>
                        startDrag(event, { type: "asset", id: asset.audioUrl })
                      }
                      onDragEnd={endDrag}
                    >
                      <strong title={asset.filename}>{asset.filename}</strong>
                      <small>
                        {asset.type} · {seconds(asset.duration)}
                      </small>
                      <div>
                        <button
                          className="te-btn"
                          aria-label={`Preview ${asset.filename}`}
                          onClick={() => preview([clipFromAsset(asset)], 0)}
                        >
                          ▶
                        </button>
                        <button
                          className="te-btn"
                          aria-label={`Tambah ${asset.filename}`}
                          onClick={() => addAsset(asset)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="te-page-list">
                <h3>Daftar item draft</h3>
                {texts.map((text, index) => (
                  <button
                    key={String(text.id)}
                    data-text-id={String(text.id)}
                    className="te-list-row"
                    draggable
                    onDragStart={(event) =>
                      startDrag(event, { type: "text", id: String(text.id) })
                    }
                    onDragEnd={endDrag}
                    onPointerDown={(event) =>
                      beginTouchDrag(event, {
                        type: "text",
                        id: String(text.id),
                      })
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dropOnText(String(text.id));
                    }}
                    onClick={() => {
                      setSelection({ type: "text", id: String(text.id) });
                      setMobilePanel("inspector");
                    }}
                  >
                    <span>
                      {index + 1}.{" "}
                      <span dir="rtl" className="te-arabic">
                        {text.arabic}
                      </span>
                    </span>
                    <small>
                      {clips.find((clip) => clip.id === text.clipId)?.label ||
                        "Belum ada audio"}{" "}
                      · Edit
                    </small>
                  </button>
                ))}
              </div>
            </section>

            <aside
              className={`te-inspector ${mobilePanel === "inspector" ? "is-mobile-open" : ""}`}
              aria-label="Pengaturan klip dan teks"
            >
              <h2>
                <span>3. Pengaturan</span>
                <button
                  className="te-mobile-close"
                  onClick={() => setMobilePanel(null)}
                  aria-label="Tutup panel pengaturan"
                >
                  ×
                </button>
              </h2>
              {!selection && (
                <p className="te-help">
                  Pilih audio atau teks melalui timeline / daftar item untuk
                  mengeditnya.
                </p>
              )}
              {(selectedClip || selectedText) && (
                <label>
                  Sumber audio halaman
                  <select
                    aria-label="Sumber audio"
                    value={
                      selectedClip?.segments.length === 1
                        ? selectedClip.segments[0].sourceUrl
                        : ""
                    }
                    onChange={(event) => assignSource(event.target.value)}
                  >
                    <option value="">
                      {selectedClip?.segments.length &&
                      selectedClip.segments.length > 1
                        ? "Gabungan beberapa sumber"
                        : "Pilih sumber audio…"}
                    </option>
                    {assets.map((asset) => (
                      <option key={asset.audioUrl} value={asset.audioUrl}>
                        {asset.filename} · {seconds(asset.duration)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {selectedClip && (
                <>
                  <label>
                    Nama klip
                    <input
                      value={selectedClip.label}
                      onChange={(event) =>
                        editClip({ label: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Jenis klip
                    <select
                      value={selectedClip.kind}
                      onChange={(event) =>
                        editClip({
                          kind: event.target.value as TimelineAudioClip["kind"],
                        })
                      }
                    >
                      {kinds.map((kind) => (
                        <option key={kind}>{kind}</option>
                      ))}
                    </select>
                  </label>
                  <div className="te-time-fields">
                    <label>
                      Mulai sumber (s)
                      <input
                        aria-label="Mulai sumber"
                        type="number"
                        min="0"
                        max={selectedClip.trimEnd - 0.02}
                        step="0.001"
                        value={Number(selectedClip.trimStart.toFixed(3))}
                        onChange={(event) =>
                          editClip({
                            trimStart: Math.max(
                              0,
                              Math.min(
                                selectedClip.trimEnd - 0.02,
                                Number(event.target.value),
                              ),
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Selesai sumber (s)
                      <input
                        aria-label="Selesai sumber"
                        type="number"
                        min={selectedClip.trimStart + 0.02}
                        max={segmentDuration(selectedClip.segments)}
                        step="0.001"
                        value={Number(selectedClip.trimEnd.toFixed(3))}
                        onChange={(event) =>
                          editClip({
                            trimEnd: Math.max(
                              selectedClip.trimStart + 0.02,
                              Math.min(
                                segmentDuration(selectedClip.segments),
                                Number(event.target.value),
                              ),
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Garis gunting (dalam klip, s)
                    <input
                      aria-label="Posisi gunting"
                      type="number"
                      min="0"
                      max={clipDuration(selectedClip)}
                      step="0.001"
                      value={Number(
                        Math.min(cutAt, clipDuration(selectedClip)).toFixed(3),
                      )}
                      onChange={(event) =>
                        setCutAt(
                          Math.max(
                            0,
                            Math.min(
                              clipDuration(selectedClip),
                              Number(event.target.value),
                            ),
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="te-detail-bar">
                    <div
                      className="te-detail-cut"
                      style={{
                        left: `${Math.min(cutAt / clipDuration(selectedClip), 1) * 100}%`,
                      }}
                    >
                      ✂
                    </div>
                    <div
                      className="te-detail-play"
                      style={{
                        left: `${Math.max(0, Math.min(1, (playhead - (selectedPosition?.start || 0)) / clipDuration(selectedClip))) * 100}%`,
                      }}
                    />
                  </div>
                  <input
                    aria-label="Slider gunting"
                    type="range"
                    min="0"
                    max={clipDuration(selectedClip)}
                    step="0.001"
                    value={Math.min(cutAt, clipDuration(selectedClip))}
                    onChange={(event) => setCutAt(Number(event.target.value))}
                  />
                  <div className="te-actions">
                    <button
                      className="te-btn"
                      onClick={() =>
                        preview([selectedClip], 0, selectedPosition?.start || 0)
                      }
                    >
                      ▶ Preview klip
                    </button>
                    <button
                      className="te-btn"
                      disabled={
                        cutAt <= 0 || cutAt >= clipDuration(selectedClip)
                      }
                      onClick={() => {
                        change(
                          splitTimelineClip(draft, selectedClip.id, cutAt),
                        );
                        setCutAt(0);
                      }}
                    >
                      ✂ Gunting
                    </button>
                    <button
                      className="te-btn"
                      onClick={() => {
                        change(duplicateTimelineClip(draft, selectedClip.id));
                      }}
                    >
                      ⧉ Duplikat
                    </button>
                  </div>
                  <p className="te-help">
                    Potongan A dan B tetap di timeline. Teks awal mengikuti A;
                    pasangkan atau tambah teks B sesuai bacaan.
                  </p>
                  <label>
                    Pasangkan teks
                    <select
                      value=""
                      onChange={(event) => {
                        if (event.target.value)
                          change(
                            pairTimelineText(
                              draft,
                              event.target.value,
                              selectedClip.id,
                            ),
                          );
                      }}
                    >
                      <option value="">Pilih teks tersedia…</option>
                      {texts.map((text) => (
                        <option key={String(text.id)} value={String(text.id)}>
                          {text.arabic}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="te-btn te-danger"
                    onClick={() => {
                      change(removeTimelineClips(draft, [selectedClip.id]));
                      setSelection(null);
                      setMergeIds((ids) =>
                        ids.filter((id) => id !== selectedClip.id),
                      );
                    }}
                  >
                    Hapus klip dari hasil akhir
                  </button>
                </>
              )}
              {selectedText && (
                <>
                  <h3>Edit teks</h3>
                  <label>
                    Teks Arab
                    <textarea
                      aria-label="Teks Arab"
                      dir="rtl"
                      className="te-arabic"
                      rows={3}
                      value={selectedText.arabic}
                      onChange={(event) =>
                        editText({ arabic: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Transliterasi (satu token per baris, auto-generate Arab)
                    <textarea
                      rows={3}
                      value={selectedText.transliterationParts.join("\n")}
                      onChange={(event) => {
                        const val = event.target.value;
                        const parts = val.split("\n");
                        const autoArabic = parts
                          .map((p) => latinToArabic(p.trim()))
                          .filter(Boolean)
                          .join(" ");
                        editText({
                          transliterationParts: parts,
                          arabic: autoArabic || selectedText.arabic,
                        });
                      }}
                    />
                  </label>
                  <label>
                    Nada / keterangan
                    <input
                      value={selectedText.hintTone}
                      onChange={(event) =>
                        editText({ hintTone: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Pasangan klip
                    <select
                      value={selectedText.clipId || ""}
                      onChange={(event) =>
                        change(
                          pairTimelineText(
                            draft,
                            String(selectedText.id),
                            event.target.value || null,
                          ),
                        )
                      }
                    >
                      <option value="">Tanpa audio</option>
                      {clips.map((clip) => (
                        <option key={clip.id} value={clip.id}>
                          {clip.label} · {seconds(clipDuration(clip))}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="te-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedText.isListenOnly)}
                      onChange={(event) =>
                        editText({
                          isListenOnly: event.target.checked,
                          isOpening: event.target.checked,
                        })
                      }
                    />{" "}
                    Contoh / demo (dengarkan saja)
                  </label>
                  <button
                    className="te-btn te-danger"
                    onClick={() => {
                      change({
                        ...draft,
                        texts: texts.filter(
                          (text) => text.id !== selectedText.id,
                        ),
                      });
                      setSelection(null);
                    }}
                  >
                    Hapus teks dari hasil akhir
                  </button>
                </>
              )}
            </aside>
            {mobilePanel && (
              <button
                className="te-mobile-scrim"
                onClick={() => setMobilePanel(null)}
                aria-label="Tutup panel pengaturan"
              />
            )}
            <nav
              className="te-mobile-toolbar"
              aria-label="Toolbar mobile timeline"
            >
              <button
                aria-label="Pengaturan"
                onClick={() => setMobilePanel("inspector")}
                title="Pengaturan"
              >
                <span>⚙</span>Pengaturan
              </button>
              <button
                aria-label={playing ? "Stop preview" : "Preview dari playhead"}
                className="te-mobile-play"
                onClick={() =>
                  playing ? stopPreview() : preview(clips, playhead)
                }
                disabled={!clips.length}
              >
                <span>{playing ? "■" : "▶"}</span>
                {playing ? "Stop" : "Preview"}
              </button>
              <button
                aria-label="Tambah teks"
                onClick={addText}
                title="Tambah teks"
              >
                <span>文</span>Teks
              </button>
              <button
                aria-label="Tambah zoom"
                onClick={() => setZoom((value) => Math.min(100, value + 8))}
                title="Tambah zoom"
              >
                <span>＋</span>Zoom
              </button>
            </nav>
          </fieldset>
        )
      )}
    </div>
  );
}
