import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { latinToArabic } from "../utils/translit";
import { TILAWATI_PAGE_DATASETS } from "../data/tilawatiPageDatasets";
import { getQuestionAudioUrl } from "../data/tilawatiAudioQuestionMap";
import {
  AudioAsset,
  AudioSegment,
  PageTimeline,
  PublishedTimeline,
  TimelineAudioClip,
  TimelineText,
  clipDuration,
  clipFromAsset,
  initialTimeline,
  mergeTimelineClips,
  newTimelineId,
  duplicateTimelineClip,
  pairTimelineText,
  removeTimelineClips,
  reorderTimelineClip,
  segmentDuration,
  splitTimelineClip,
  visibleSegments,
} from "../utils/pageTimeline";
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
import "./TilawatiTimelineEditor.css";
import { getPublishedTimeline, restoreTimelineDraft, tilawatiEditorApi } from "../services/tilawatiEditorApi";
import { useTimelineDraftSave } from "../hooks/useTimelineDraftSave";
import { isNgajiCeriaServerAvailable } from "../services/ngajiCeriaApi";
import { getToken } from "../../../services/api";

type Selection = { type: "audio" | "text"; id: string } | null;
type DragData = { type: "asset" | "audio" | "text"; id: string };
type TouchDrag = {
  data: DragData;
  startX: number;
  startY: number;
  moved: boolean;
  ghost: HTMLDivElement;
};
type PageResponse = {
  ok: boolean;
  message?: string;
  clips: AudioAsset[];
  published?: PublishedTimeline;
  revision: string;
};
const clone = (project: PageTimeline) =>
  JSON.parse(JSON.stringify(project)) as PageTimeline;
const seconds = (value: number) => `${value.toFixed(3)}s`;
const kinds = ["header", "demo", "baris", "isi", "footer"] as const;
const isDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1024px)").matches;

const PAN_SKIP_SELECTOR = [
  ".te-clip",
  ".te-text",
  ".te-ruler",
  ".te-bottom-ruler",
  ".te-playhead",
  ".te-bottom-playhead",
  ".te-cut-line",
  ".te-handle",
  ".te-drop-end",
  ".te-merge-select",
  "[data-clip-id]",
  "[data-text-id]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "a",
].join(", ");

const EDGE_ZONE = 64;
const EDGE_MAX_SPEED = 22;
const EDGE_MIN_SPEED = 3;
const SNAP_PX = 14;
const SNAP_EPSILON = 0.001;

export default function TilawatiTimelineEditorPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const jilid = Math.min(5, Math.max(1, Number(params.get("jilid")) || 1));
  const hal = Math.min(44, Math.max(1, Number(params.get("hal")) || 1));
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [draft, setDraft] = useState<PageTimeline | null>(null);
  const [baseline, setBaseline] = useState("");
  const [revision, setRevision] = useState("");
  const [cloudRevision, setCloudRevision] = useState("");
  const [loadedPage, setLoadedPage] = useState("");
  const [selection, setSelection] = useState<Selection>(null);
  const [mergeIds, setMergeIds] = useState<string[]>([]);
  const [history, setHistory] = useState<PageTimeline[]>([]);
  const [future, setFuture] = useState<PageTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(32);
  const [cutAt, setCutAt] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [snapHint, setSnapHint] = useState<"cut" | "play" | "boundary" | null>(
    null,
  );
  const [mobilePanel, setMobilePanel] = useState<"inspector" | null>(null);
  const [assetsOpen, setAssetsOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [panning, setPanning] = useState(false);
  const dragData = useRef<DragData | null>(null);
  const touchDrag = useRef<TouchDrag | null>(null);
  const dragCleanup = useRef<(() => void) | null>(null);
  const snapHintTimer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<string, Promise<AudioBuffer>>());
  const activeSources = useRef<AudioBufferSourceNode[]>([]);
  const frame = useRef(0);
  const playToken = useRef(0);
  const dirty = draft !== null && JSON.stringify(draft) !== baseline;
  const draftSave = useTimelineDraftSave(jilid, hal, draft, cloudRevision, !loading && loadedPage === `${jilid}:${hal}`);

  function flashSnap(kind: "cut" | "play" | "boundary") {
    setSnapHint(kind);
    if (snapHintTimer.current) window.clearTimeout(snapHintTimer.current);
    snapHintTimer.current = window.setTimeout(() => setSnapHint(null), 480);
  }

  function stopPreview() {
    playToken.current += 1;
    cancelAnimationFrame(frame.current);
    for (const node of activeSources.current) {
      try {
        node.stop();
      } catch {
        void 0;
      }
    }
    activeSources.current = [];
    setPlaying(false);
    setPreviewingId(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setMessage("");
    stopPreview();
    fetch(`/api/tilawati-editor?action=list&jilid=${jilid}&hal=${hal}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (
          !response.headers.get("content-type")?.includes("application/json")
        ) {
          throw new Error(
            "Editor file lokal memerlukan npm run dev. Restart Vite bila endpoint belum tersedia.",
          );
        }
        const data = (await response.json()) as PageResponse;
        if (!response.ok || !data.ok)
          throw new Error(data.message || "Gagal membaca halaman.");
        return data;
      })
      .then(async (data) => {
        const cloud = await getPublishedTimeline(jilid, hal).catch(() => null);
        const restored = await restoreTimelineDraft(jilid, hal, cloud?.revision ?? "", controller.signal);
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
        const base = cloud?.timeline ?? data.published?.timeline ?? initialTimeline(data.clips, questions);
        const project = restored.draft?.timeline ?? base;
        setAssets(data.clips);
        setDraft(clone(project));
        setBaseline(JSON.stringify(base));
        setRevision(data.revision);
        setCloudRevision(cloud?.revision ?? "");
        setLoadedPage(`${jilid}:${hal}`);
        if (restored.draft) setMessage("Draft terbaru dipulihkan. Perubahan siap dilanjutkan.");
        if (restored.syncError) setMessage(`Draft lokal dipakai · ${restored.syncError}`);
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
          void 0;
        }
      });
      dragCleanup.current?.();
      touchDrag.current?.ghost.remove();
      touchDrag.current = null;
      if (snapHintTimer.current) window.clearTimeout(snapHintTimer.current);
      const ctx = context.current;
      context.current = null;
      void ctx?.close();
    },
    [],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isDesktop()) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]"))
        return;
      if (event.key === "[") {
        event.preventDefault();
        setAssetsOpen((value) => !value);
      }
      if (event.key === "]") {
        event.preventDefault();
        setInspectorOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const selectedCutAbsolute =
    selectedPosition && selectedClip
      ? selectedPosition.start + Math.min(cutAt, clipDuration(selectedClip))
      : null;
  const selectedLocalCut =
    selectedClip && selectedPosition
      ? Math.max(0, Math.min(clipDuration(selectedClip), cutAt))
      : 0;
  const selectedLocalPlay =
    selectedClip && selectedPosition
      ? Math.max(
          0,
          Math.min(
            clipDuration(selectedClip),
            playhead - selectedPosition.start,
          ),
        )
      : 0;
  const selectedDelta = selectedLocalPlay - selectedLocalCut;
  const selectedAligned = Math.abs(selectedDelta) < SNAP_EPSILON;

  useEffect(() => {
    setPlayhead((current) => Math.min(current, total));
  }, [total]);

  function snapPlayhead(raw: number): {
    value: number;
    snapped: string | null;
  } {
    const threshold = SNAP_PX / zoom;
    let value = raw;
    let snapped: string | null = null;
    let bestDist = threshold;

    if (selectedCutAbsolute !== null) {
      const dist = Math.abs(raw - selectedCutAbsolute);
      if (dist < bestDist) {
        bestDist = dist;
        value = selectedCutAbsolute;
        snapped = "cut";
      }
    }

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

  function setPlayheadFromClientX(clientX: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const raw = Math.max(0, Math.min(total, (clientX - rect.left) / zoom));
    const { value, snapped } = snapPlayhead(raw);
    if (snapped) flashSnap(snapped === "cut" ? "play" : "boundary");
    setPlayhead(value);
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
      if (moved)
        setZoom(
          Math.max(
            8,
            Math.min(100, initialZoom + (pointer.clientX - initialX) * 0.35),
          ),
        );
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

  function handleTimelineWheel(event: React.WheelEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (event.shiftKey) return;
    if (element.scrollWidth <= element.clientWidth + 1) return;
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (!delta) return;
    element.scrollLeft += delta;
    event.preventDefault();
  }

  function beginMiddlePan(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 1) return;
    event.preventDefault();
    const element = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const initialLeft = element.scrollLeft;
    const initialTop = element.scrollTop;
    setPanning(true);
    const move = (pointer: PointerEvent) => {
      element.scrollLeft = initialLeft - (pointer.clientX - startX);
      element.scrollTop = initialTop - (pointer.clientY - startY);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
      setPanning(false);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup, { once: true });
  }

  function beginEmptyDragPan(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest(PAN_SKIP_SELECTOR)) return;
    const scroller = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const initialLeft = scroller.scrollLeft;
    const initialTop = scroller.scrollTop;
    let moved = false;
    const move = (pointer: PointerEvent) => {
      const dx = pointer.clientX - startX;
      const dy = pointer.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 3) {
        moved = true;
        setPanning(true);
        document.body.style.userSelect = "none";
      }
      if (!moved) return;
      scroller.scrollLeft = initialLeft - dx;
      scroller.scrollTop = initialTop - dy;
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
      if (moved) {
        setPanning(false);
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup, { once: true });
  }

  function onScrollPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Pan seret khusus mouse. Di sentuh, scroll diserahkan ke scroll native
    // agar tidak berebut dengan sesi touch-drag (ghost).
    if (event.pointerType !== "mouse") return;
    if (event.button === 1) {
      beginMiddlePan(event);
      return;
    }
    if (event.button === 0) beginEmptyDragPan(event);
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
    const scroller = scrollRef.current;
    const initialScrollLeft = scroller?.scrollLeft ?? 0;
    let lastClientX = event.clientX;

    const clipStart = positions.find((p) => p.clip.id === clip.id)?.start ?? 0;
    const localPlayheadAtStart = playhead - clipStart;

    if (action !== "cut") {
      setHistory((current) => [...current.slice(-59), original]);
      setFuture([]);
    }

    const applyFromDelta = () => {
      const scrollDelta = (scroller?.scrollLeft ?? 0) - initialScrollLeft;
      const delta = (lastClientX - initialX + scrollDelta) / zoom;

      if (action === "cut") {
        const dur = clipDuration(clip);
        const raw = Math.min(dur, Math.max(0, initialCut + delta));
        const threshold = SNAP_PX / zoom;
        const inClip = localPlayheadAtStart >= 0 && localPlayheadAtStart <= dur;
        if (inClip && Math.abs(raw - localPlayheadAtStart) < threshold) {
          flashSnap("cut");
          setCutAt(localPlayheadAtStart);
        } else {
          setCutAt(raw);
        }
        return;
      }

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
                Math.min(segmentDuration(clip.segments), clip.trimEnd + delta),
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
    };

    let rafId = 0;
    const tickEdgeScroll = () => {
      if (!scroller) return;
      const rect = scroller.getBoundingClientRect();
      const distFromLeft = lastClientX - rect.left;
      const distFromRight = rect.right - lastClientX;

      let speed = 0;
      if (distFromLeft >= 0 && distFromLeft < EDGE_ZONE) {
        const t = (EDGE_ZONE - distFromLeft) / EDGE_ZONE;
        speed = -(EDGE_MIN_SPEED + t * (EDGE_MAX_SPEED - EDGE_MIN_SPEED));
      } else if (distFromRight >= 0 && distFromRight < EDGE_ZONE) {
        const t = (EDGE_ZONE - distFromRight) / EDGE_ZONE;
        speed = EDGE_MIN_SPEED + t * (EDGE_MAX_SPEED - EDGE_MIN_SPEED);
      }

      if (speed !== 0) {
        const before = scroller.scrollLeft;
        scroller.scrollLeft = before + speed;
        if (scroller.scrollLeft !== before) applyFromDelta();
      }
      rafId = requestAnimationFrame(tickEdgeScroll);
    };
    rafId = requestAnimationFrame(tickEdgeScroll);

    const move = (pointer: PointerEvent) => {
      lastClientX = pointer.clientX;
      applyFromDelta();
    };

    const cleanup = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
      if (dragCleanup.current === cleanup) dragCleanup.current = null;
    };

    dragCleanup.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup, { once: true });
  }

  async function preview(
    playClips: TimelineAudioClip[],
    startAt = 0,
    displayOffset = 0,
    previewId: string = "timeline",
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
      if (token !== playToken.current || context.current !== ctx || ctx.state === "closed") return;
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
        const safeOffset = Math.min(Math.max(0, segment.start), Math.max(0, bufferDuration - 1e-6));
        const safeDuration = Math.min(Math.max(0, duration), Math.max(0, bufferDuration - safeOffset));
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
      setPreviewingId(previewId);
      setPlayhead(displayOffset + startAt);
      const tick = () => {
        if (token !== playToken.current) return;
        const progress = Math.max(0, ctx.currentTime - startTime);
        setPlayhead(displayOffset + startAt + Math.min(progress, elapsed));
        if (progress >= elapsed) {
          setPlaying(false);
          setPreviewingId(null);
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
      setPreviewingId(null);
    }
  }

  async function saveFinal() {
    if (!draft || saving) return;
    stopPreview();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await draftSave.save();
      const response = await fetch("/api/tilawati-editor?action=publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jilid,
          page: hal,
          timeline: draft,
          expectedRevision: revision,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        published: PublishedTimeline;
        clips: AudioAsset[];
      };
      if (!response.ok || !data.ok)
        throw new Error(data.message || "Gagal menyimpan hasil akhir.");
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

  async function finishPage() {
    if (!draft || saving || finishing || dirty) return;
    if (
      !window.confirm(
        `Tandai Jilid ${jilid} Halaman ${hal} sebagai selesai dan kirim audionya ke Tartila?`,
      )
    )
      return;
    setFinishing(true);
    setError("");
    try {
      const response = await fetch("/api/tilawati-editor?action=finish-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jilid, page: hal }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        copiedFiles?: number;
      };
      if (!response.ok || !data.ok)
        throw new Error(data.message || "Gagal menyelesaikan halaman.");
      setMessage(
        `Halaman ${hal} ditandai selesai. ${data.copiedFiles ?? 0} file audio dikirim ke Tartila.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setFinishing(false);
    }
  }

  async function publishCloud() {
    if (!draft || saving) return;
    stopPreview(); setSaving(true); setError("");
    try {
      if (!(await draftSave.save(true))) throw new Error("Draft cloud belum tersinkron. Periksa status draft sebelum publish.");
      const data = await tilawatiEditorApi.publish(jilid, hal, draft, cloudRevision);
      if (!data.published) throw new Error("Timeline publish tidak tersedia.");
      setDraft(clone(data.published.timeline));
      setBaseline(JSON.stringify(data.published.timeline));
      setCloudRevision(data.published.revision);
      setHistory([]); setFuture([]);
      setMessage("Publish cloud selesai. Semua game memakai klip presisi dari cloud.");
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setSaving(false); }
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

  function alignCutToPlayhead() {
    if (!selectedClip || !selectedPosition) return;
    const local = Math.max(
      0,
      Math.min(clipDuration(selectedClip), playhead - selectedPosition.start),
    );
    setCutAt(local);
  }
  function alignPlayheadToCut() {
    if (!selectedClip || !selectedPosition) return;
    const local = Math.max(0, Math.min(clipDuration(selectedClip), cutAt));
    setPlayhead(selectedPosition.start + local);
  }

  function clearSelectionIfOutside(target: HTMLElement) {
    if (target.closest(".te-clip")) return;
    if (target.closest(".te-text")) return;
    if (target.closest(".te-page-list")) return;
    if (target.closest(".te-inspector")) return;
    if (target.closest(".te-assets")) return;
    if (target.closest("button, input, select, textarea, label, [role=slider]"))
      return;
    setSelection(null);
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

  const workspaceClass = [
    "te-workspace",
    !assetsOpen ? "is-assets-hidden" : "",
    !inspectorOpen ? "is-inspector-hidden" : "",
    panning ? "is-panning" : "",
    snapHint ? `is-snapping-${snapHint}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="timeline-editor">
      <style>{`
  @keyframes te-fade-up {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes te-pop-in {
    0%   { opacity: 0; transform: scale(0.94); }
    60%  { opacity: 1; transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes te-glow-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.45), 0 0 0 0 rgba(59,130,246,0.25); }
    50%      { box-shadow: 0 0 0 4px rgba(59,130,246,0.20), 0 0 18px 4px rgba(59,130,246,0.18); }
  }
  @keyframes te-drop-pulse {
    0%, 100% { box-shadow: inset 0 0 0 2px rgba(59,130,246,0.55), 0 0 14px rgba(59,130,246,0.25); }
    50%      { box-shadow: inset 0 0 0 3px rgba(59,130,246,0.85), 0 0 26px rgba(59,130,246,0.45); }
  }
  @keyframes te-playhead-pulse {
    0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 0 4px rgba(239,68,68,0.55)); }
    50%      { transform: translateX(-50%) scale(1.12); filter: drop-shadow(0 0 12px rgba(239,68,68,0.9)); }
  }
  @keyframes te-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes te-ripple {
    to { transform: scale(2.4); opacity: 0; }
  }
  @keyframes te-slide-up       { from { transform: translateY(12%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes te-status-in {
    0%   { opacity: 0; transform: translateY(-6px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes te-snap-flash {
    0%   { background-color: rgba(250,204,21,0.42); }
    100% { background-color: transparent; }
  }

  .te-desktop-only-toggle { display: none; }

  .timeline-editor * { -webkit-tap-highlight-color: transparent; }
  .timeline-editor button,
  .timeline-editor .te-clip,
  .timeline-editor .te-text,
  .timeline-editor .te-asset,
  .timeline-editor .te-list-row {
    transition:
      transform 160ms cubic-bezier(.2,.7,.3,1.2),
      box-shadow 200ms ease,
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease,
      opacity 160ms ease;
  }

  .te-header-tools {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-left: auto;
  }
  .te-tool-toggle {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border, rgba(128,128,128,0.3));
    background: var(--panel-bg, transparent);
    color: inherit;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .te-tool-toggle:hover {
    transform: translateY(-1px);
    background: rgba(128,128,128,0.14);
    box-shadow: 0 6px 18px -8px rgba(0,0,0,0.4);
  }
  .te-tool-toggle:active { transform: translateY(0) scale(0.97); }
  .te-tool-toggle[aria-pressed="true"] {
    border-color: var(--accent, #3b82f6);
    color: var(--accent, #3b82f6);
    background: rgba(59,130,246,0.10);
    box-shadow: inset 0 0 0 1px rgba(59,130,246,0.25);
  }
  .te-tool-toggle[aria-pressed="false"] { opacity: 0.7; }
  .te-tool-icon {
    font-size: 14px;
    line-height: 1;
    display: inline-flex;
    transition: transform 300ms cubic-bezier(.2,.8,.3,1.4);
  }
  .te-tool-toggle:hover .te-tool-icon { transform: rotate(-8deg) scale(1.12); }
  .te-tool-toggle[aria-pressed="true"] .te-tool-icon { transform: scale(1.15); }

  .te-action-btn {
    position: relative;
    overflow: hidden;
    transition:
      transform 160ms cubic-bezier(.2,.7,.3,1.2),
      box-shadow 200ms ease,
      background-color 160ms ease,
      color 160ms ease;
  }
  .te-action-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px -10px rgba(59,130,246,0.7);
  }
  .te-action-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.94);
  }
  .te-action-preview:hover:not(:disabled) {
    box-shadow: 0 8px 22px -10px rgba(34,197,94,0.8);
  }
  .te-action-cut:hover:not(:disabled) {
    box-shadow: 0 8px 22px -10px rgba(239,68,68,0.8);
  }
  .te-action-merge:hover:not(:disabled) {
    box-shadow: 0 8px 22px -10px rgba(168,85,247,0.8);
  }

  .te-edge-tab {
    display: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 72px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--border, rgba(128,128,128,0.35));
    background: var(--panel-bg, #0f172a);
    color: inherit;
    cursor: pointer;
    z-index: 12;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    transition:
      left 220ms ease, right 220ms ease,
      background 200ms ease, color 200ms ease,
      width 200ms ease, box-shadow 200ms ease;
  }
  .te-edge-tab span { transition: transform 260ms cubic-bezier(.2,.8,.3,1.4); }
  .te-edge-tab:hover {
    background: rgba(59,130,246,0.22);
    color: var(--accent, #3b82f6);
    width: 30px;
    box-shadow: 0 0 22px -4px rgba(59,130,246,0.55);
  }
  .te-edge-tab:hover span { transform: scale(1.25); }
  .te-edge-tab:active { transform: translateY(-50%) scale(0.94); }
  .te-edge-tab:focus-visible {
    outline: 2px solid var(--accent, #3b82f6);
    outline-offset: 2px;
  }

  .te-asset {
    transition:
      transform 160ms cubic-bezier(.2,.7,.3,1.2),
      box-shadow 200ms ease,
      background-color 160ms ease,
      border-color 160ms ease;
    border-radius: 10px;
  }
  .te-asset:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 26px -16px rgba(0,0,0,0.55);
    border-color: rgba(59,130,246,0.5);
  }
  .te-asset:active { transform: translateY(0) scale(0.985); }
  .te-asset[draggable="true"]:hover { cursor: grab; }
  .te-asset.te-native-dragging {
    opacity: 0.35;
    transform: scale(0.96);
    cursor: grabbing;
  }

  .te-text {
    position: relative;
    transition:
      transform 160ms cubic-bezier(.2,.7,.3,1.2),
      box-shadow 220ms ease,
      background-color 160ms ease,
      border-color 160ms ease;
  }
  .te-text:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 6px 18px -10px rgba(0,0,0,0.5);
    border-color: rgba(59,130,246,0.5);
  }
  .te-text:active { transform: translateY(0) scale(0.97); }
  .te-text.is-selected {
    animation: te-pop-in 260ms ease-out;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.55), 0 0 20px -2px rgba(59,130,246,0.45);
  }

  .te-clip {
    transition:
      transform 180ms cubic-bezier(.2,.7,.3,1.2),
      box-shadow 240ms ease,
      filter 220ms ease,
      opacity 180ms ease;
    will-change: transform, box-shadow;
    border-radius: 8px;
  }
  .te-clip:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px -18px rgba(0,0,0,0.7);
    filter: brightness(1.06);
    z-index: 3;
  }
  .te-clip:active { transform: translateY(0) scale(0.99); }
  .te-clip.is-selected {
    animation: te-pop-in 260ms ease-out, te-glow-pulse 2400ms ease-in-out infinite;
    z-index: 4;
  }
  .te-clip.te-native-dragging {
    opacity: 0.4;
    transform: scale(0.97) rotate(-0.5deg);
    filter: saturate(0.7);
    cursor: grabbing;
  }
  .te-clip[draggable="true"]:hover { cursor: grab; }

  .te-clip.te-touch-drop,
  .te-linked-texts.te-touch-drop,
  .te-track-audio.te-touch-drop,
  .te-unlinked.te-touch-drop,
  .te-text.te-touch-drop {
    animation: te-drop-pulse 900ms ease-in-out infinite;
    border-radius: 8px;
  }

  .te-handle {
    transition: transform 140ms ease, background-color 140ms ease, box-shadow 200ms ease;
  }
  .te-handle:hover {
    transform: scale(1.15);
    box-shadow: 0 0 12px rgba(59,130,246,0.7);
  }
  .te-handle:active { transform: scale(1.02); }
  .te-cut-line {
    transition: transform 140ms ease, filter 200ms ease, background-color 200ms ease;
  }
  .te-cut-line:hover { transform: scale(1.18); filter: drop-shadow(0 0 8px rgba(239,68,68,0.75)); }
  .te-cut-line:active { transform: scale(1.05); }

  .te-playhead { transition: filter 240ms ease; }
  .te-playhead span {
    display: inline-block;
    animation: te-playhead-pulse 1800ms ease-in-out infinite;
  }
  .te-playhead:hover { filter: brightness(1.2); }

  .te-workspace.is-snapping-cut .te-cut-line,
  .te-workspace.is-snapping-play .te-cut-line,
  .te-workspace.is-snapping-boundary .te-cut-line {
    animation: te-snap-flash 480ms ease-out;
  }

  .te-list-row {
    transition:
      transform 160ms cubic-bezier(.2,.7,.3,1.2),
      background-color 160ms ease,
      box-shadow 200ms ease;
    border-radius: 8px;
  }
  .te-list-row:hover {
    transform: translateX(3px);
    background: rgba(59,130,246,0.08);
    box-shadow: -3px 0 0 0 var(--accent, #3b82f6);
  }
  .te-list-row:active { transform: translateX(1px) scale(0.99); }

  .te-status { animation: te-status-in 260ms ease-out; }

  .te-inspector.is-mobile-open { animation: te-slide-up 260ms cubic-bezier(.2,.8,.3,1.1); }
  .te-mobile-toolbar button { transition: transform 140ms ease, background-color 160ms ease, color 160ms ease; }
  .te-mobile-toolbar button:active { transform: scale(0.94); }
  .te-mobile-scrim { animation: te-fade-up 180ms ease-out; }

  @media (min-width: 1024px) {
    .te-desktop-only-toggle { display: inline-flex; }

    .te-workspace {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr) 320px;
      height: calc(100vh - 140px);
      overflow: hidden;
      position: relative;
      transition: grid-template-columns 260ms cubic-bezier(.2,.7,.3,1.05);
    }
    .te-workspace.is-assets-hidden   { grid-template-columns: 0 minmax(0, 1fr) 320px; }
    .te-workspace.is-inspector-hidden{ grid-template-columns: 280px minmax(0, 1fr) 0; }
    .te-workspace.is-assets-hidden.is-inspector-hidden { grid-template-columns: 0 minmax(0, 1fr) 0; }

    .te-workspace.is-assets-hidden .te-assets {
      overflow: hidden;
      padding: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
    }
    .te-workspace.is-inspector-hidden .te-inspector {
      overflow: hidden;
      padding: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
    }
    .te-assets, .te-inspector {
      overflow-y: auto;
      min-height: 0;
      transition: opacity 220ms ease;
    }

    .te-workspace > .te-board {
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    .te-workspace > .te-board > .te-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
      touch-action: pan-x pan-y;
      padding-bottom: 48px;
      cursor: grab;
      scroll-behavior: smooth;
    }
    .te-workspace > .te-board > .te-scroll.is-panning,
    .te-workspace.is-panning .te-scroll {
      cursor: grabbing;
      scroll-behavior: auto;
    }
    .te-scroll .te-clip,
    .te-scroll .te-text,
    .te-scroll .te-ruler,
    .te-scroll .te-bottom-ruler,
    .te-scroll .te-playhead,
    .te-scroll .te-bottom-playhead,
    .te-scroll .te-handle,
    .te-scroll .te-cut-line,
    .te-scroll button,
    .te-scroll input,
    .te-scroll select,
    .te-scroll label { cursor: revert; }
    .te-scroll .te-clip { cursor: pointer; }
    .te-scroll .te-handle { cursor: ew-resize; }
    .te-scroll .te-cut-line { cursor: ew-resize; }
    .te-scroll .te-ruler,
    .te-scroll .te-bottom-ruler { cursor: ew-resize; }

    .te-pan-strip {
      display: block;
      height: 48px;
      margin-top: 4px;
      width: 100%;
      background:
        repeating-linear-gradient(
          45deg,
          rgba(128,128,128,0.06) 0 6px,
          rgba(128,128,128,0.00) 6px 12px
        );
    }
    .te-pan-strip:hover {
      background:
        repeating-linear-gradient(
          45deg,
          rgba(59,130,246,0.10) 0 6px,
          rgba(59,130,246,0.00) 6px 12px
        );
    }

    .te-workspace > .te-board > .te-page-list {
      flex: 0 0 auto;
      max-height: 30vh;
      overflow-y: auto;
      border-top: 1px solid var(--border, rgba(128,128,128,0.25));
      padding: 0;
      margin-top: 12px;
      background: var(--panel-bg, var(--surface, #0f172a));
      isolation: isolate;
      scrollbar-width: thin;
    }
    .te-workspace > .te-board > .te-page-list > h3 {
      position: sticky;
      top: 0;
      z-index: 3;
      margin: 0 0 6px;
      padding: 8px 0;
      background: var(--panel-bg, var(--surface, #0f172a));
      box-shadow:
        0 1px 0 var(--border, rgba(128,128,128,0.35)),
        0 6px 10px -8px rgba(0,0,0,0.45);
    }
    .te-workspace > .te-board > .te-page-list .te-list-row {
      position: relative;
      z-index: 1;
      background: transparent;
    }
    .te-workspace > .te-board > .te-page-list .te-list-row:first-of-type { margin-top: 0; }

    .te-ruler, .te-bottom-ruler, .te-playhead, .te-cut-line, .te-handle {
      touch-action: none;
    }

    .te-edge-tab { display: inline-flex; }
    .te-edge-tab-left {
      border-radius: 0 8px 8px 0;
      border-left: none;
      left: 280px;
    }
    .te-workspace.is-assets-hidden .te-edge-tab-left { left: 0; }
    .te-edge-tab-right {
      border-radius: 8px 0 0 8px;
      border-right: none;
      right: 320px;
    }
    .te-workspace.is-inspector-hidden .te-edge-tab-right { right: 0; }
  }

  .te-workspace[aria-busy="true"] {
    pointer-events: none;
    opacity: 0.65;
    filter: saturate(0.85);
  }
  .te-workspace[aria-busy="true"] .te-board::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59,130,246,0.08) 40%,
      rgba(59,130,246,0.18) 50%,
      rgba(59,130,246,0.08) 60%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: te-shimmer 1400ms linear infinite;
    pointer-events: none;
  }

  .te-scroll::-webkit-scrollbar { height: 10px; width: 10px; }
  .te-scroll::-webkit-scrollbar-thumb {
    background: rgba(128,128,128,0.4);
    border-radius: 6px;
  }
  .te-scroll::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.65); }

  @media (prefers-reduced-motion: reduce) {
    .timeline-editor *,
    .timeline-editor *::before,
    .timeline-editor *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }

  .te-detail-bar {
    position: relative;
    height: 34px;
    margin: 8px 0;
    background: rgba(128,128,128,0.12);
    border-radius: 6px;
    overflow: hidden;
  }
  .te-detail-cut {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #f59e0b;
  }
  .te-detail-play {
    width: 2px;
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239,68,68,0.7);
  }
  .te-detail-delta {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(128,128,128,0.08);
    margin: 4px 0 8px;
  }
  .te-detail-delta.is-aligned {
    background: rgba(34,197,94,0.18);
    color: #16a34a;
    font-weight: 700;
  }
  .te-align-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin: 6px 0;
  }
  .te-align-actions .te-btn {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
    font-size: 12px;
  }
`}</style>

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
          <h1>Page Timeline Editor</h1>
          <p>
            Jilid {jilid} · Halaman {hal} ·{" "}
            {dirty ? "Draft belum disimpan" : "Sesuai hasil tersimpan"}
          </p>
        </div>
        <div className="te-header-tools">
          <button
            type="button"
            className="te-tool-toggle te-desktop-only-toggle"
            onClick={() => setAssetsOpen((value) => !value)}
            aria-pressed={assetsOpen}
            aria-label={
              assetsOpen ? "Sembunyikan panel aset" : "Tampilkan panel aset"
            }
            title={`${assetsOpen ? "Sembunyikan" : "Tampilkan"} panel aset ( [ )`}
          >
            <span className="te-tool-icon" aria-hidden="true">
              ▤
            </span>
            <span className="te-tool-label">Aset</span>
          </button>
          <button
            type="button"
            className="te-tool-toggle te-desktop-only-toggle"
            onClick={() => setInspectorOpen((value) => !value)}
            aria-pressed={inspectorOpen}
            aria-label={
              inspectorOpen
                ? "Sembunyikan panel pengaturan"
                : "Tampilkan panel pengaturan"
            }
            title={`${inspectorOpen ? "Sembunyikan" : "Tampilkan"} panel pengaturan ( ] )`}
          >
            <span className="te-tool-icon" aria-hidden="true">
              ⚙
            </span>
            <span className="te-tool-label">Pengaturan</span>
          </button>
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
              onChange={(event) =>
                switchPage(jilid, Number(event.target.value))
              }
            >
              {Array.from({ length: 44 }, (_, index) => (
                <option key={index} value={index + 1}>
                  Hal {index + 1}
                </option>
              ))}
            </select>
          </div>
          <button className="te-btn" disabled={loading || saving || !draft} onClick={() => void draftSave.save()}>Simpan Draft</button>
          {isNgajiCeriaServerAvailable() && <button className="te-btn te-primary" disabled={loading || saving || !draft || !getToken()} onClick={publishCloud}>Publish ke Cloud</button>}
          <button
            className="te-btn te-primary"
            disabled={loading || saving || !draft || dirty}
            onClick={saveFinal}
          >
            {saving ? "Merender & menyimpan…" : "Simpan Hasil Akhir"}
          </button>
          <button
            className="te-btn te-secondary"
            disabled={loading || saving || finishing || !draft || dirty}
            onClick={() => void finishPage()}
          >
            {finishing ? "Mengirim ke Tartila…" : "Selesai Halaman"}
          </button>
        </div>
      </header>
      <div className="te-status" aria-live="polite">
        {[error, message, draftSave.status].filter(Boolean).join(" · ") || "Draft tersimpan otomatis; publish merender klip audio final."}
      </div>

      {loading ? (
        <div className="te-empty">Membaca aset halaman…</div>
      ) : (
        draft && (
          <div
            className={workspaceClass}
            role="group"
            aria-busy={saving}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              if (!isDesktop()) return;
              clearSelectionIfOutside(event.target as HTMLElement);
            }}
          >
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
                        onClick={() =>
                          previewingId === asset.audioUrl
                            ? stopPreview()
                            : preview(
                                [clipFromAsset(asset)],
                                0,
                                0,
                                asset.audioUrl,
                              )
                        }
                      >
                        {previewingId === asset.audioUrl ? "■" : "▶"}
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
                    playing
                      ? stopPreview()
                      : preview(clips, playhead, 0, "timeline")
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
                  className="te-btn te-action-btn te-action-duplicate"
                  disabled={!selectedClip}
                  onClick={() => {
                    if (!selectedClip) return;
                    change(duplicateTimelineClip(draft, selectedClip.id));
                  }}
                  aria-label="Duplikat"
                  title="Duplikat klip terpilih"
                >
                  <span className="te-action-icon">⧉</span>
                  <span className="te-action-label">Duplikat</span>
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
                Tarik penggaris atas untuk zoom · Tarik penggaris bawah untuk
                pindahkan garis merah ·<strong> Pan timeline</strong>: roda
                mouse / trackpad · middle-mouse drag · drag area kosong.
                <br />
                <strong>Snap</strong>: garis merah & gunting akan menempel ke
                tepi klip atau satu sama lain saat berdekatan.
              </p>
              <div
                className="te-scroll"
                ref={scrollRef}
                onWheel={handleTimelineWheel}
                onPointerDown={onScrollPointerDown}
              >
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

                <div
                  className="te-pan-strip"
                  aria-hidden="true"
                  style={{ width: timelineWidth }}
                />
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
                          onClick={() =>
                            previewingId === asset.audioUrl
                              ? stopPreview()
                              : preview(
                                  [clipFromAsset(asset)],
                                  0,
                                  0,
                                  asset.audioUrl,
                                )
                          }
                        >
                          {previewingId === asset.audioUrl ? "■" : "▶"}
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
                        left: `${(selectedLocalCut / clipDuration(selectedClip)) * 100}%`,
                      }}
                    >
                      ✂
                    </div>
                    <div
                      className="te-detail-play"
                      style={{
                        left: `${(selectedLocalPlay / clipDuration(selectedClip)) * 100}%`,
                      }}
                    />
                  </div>
                  <div
                    className={`te-detail-delta ${selectedAligned ? "is-aligned" : ""}`}
                  >
                    <span>✂ {seconds(selectedLocalCut)}</span>
                    <span>▶ {seconds(selectedLocalPlay)}</span>
                    <span>
                      Δ {seconds(Math.abs(selectedDelta))}
                      {selectedAligned ? " · Sejajar" : ""}
                    </span>
                  </div>
                  <div className="te-align-actions">
                    <button
                      className="te-btn"
                      onClick={alignCutToPlayhead}
                      title="Pindahkan garis gunting ke posisi playhead"
                    >
                      ✂ = ▶
                    </button>
                    <button
                      className="te-btn"
                      onClick={alignPlayheadToCut}
                      title="Pindahkan playhead ke posisi garis gunting"
                    >
                      ▶ = ✂
                    </button>
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
                        previewingId === "clip"
                          ? stopPreview()
                          : preview(
                              [selectedClip],
                              0,
                              selectedPosition?.start || 0,
                              "clip",
                            )
                      }
                    >
                      {previewingId === "clip" ? "■ Stop" : "▶ Preview klip"}
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
                        const autoArabic = parts.map((p) => latinToArabic(p.trim())).filter(Boolean).join(" ");
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

            <button
              type="button"
              className="te-edge-tab te-edge-tab-left"
              onClick={() => setAssetsOpen((value) => !value)}
              aria-label={
                assetsOpen ? "Sembunyikan panel aset" : "Tampilkan panel aset"
              }
              aria-pressed={assetsOpen}
              title={`${assetsOpen ? "Sembunyikan" : "Tampilkan"} panel aset ( [ )`}
            >
              <span aria-hidden="true">{assetsOpen ? "‹" : "›"}</span>
            </button>
            <button
              type="button"
              className="te-edge-tab te-edge-tab-right"
              onClick={() => setInspectorOpen((value) => !value)}
              aria-label={
                inspectorOpen
                  ? "Sembunyikan panel pengaturan"
                  : "Tampilkan panel pengaturan"
              }
              aria-pressed={inspectorOpen}
              title={`${inspectorOpen ? "Sembunyikan" : "Tampilkan"} panel pengaturan ( ] )`}
            >
              <span aria-hidden="true">{inspectorOpen ? "›" : "‹"}</span>
            </button>

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
                  playing
                    ? stopPreview()
                    : preview(clips, playhead, 0, "timeline")
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
          </div>
        )
      )}
    </div>
  );
}
