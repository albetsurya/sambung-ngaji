import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { latinToArabic } from "../utils/translit";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import {
  TILAWATI_JILID_1_PAGES,
  TILAWATI_JILID_2_PAGES,
  TILAWATI_JILID_3_PAGES,
  TILAWATI_JILID_4_PAGES,
  TILAWATI_JILID_5_PAGES,
} from "../data/tilawatiQuizData";
import type { PageQuizData, QuizQuestion } from "../data/tilawatiQuizTypes";
import { getQuestionAudioUrl } from "../data/tilawatiAudioQuestionMap";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "../../../components/ui/FontAwesomeIcons";

const QUIZ_DATASETS: Record<number, Record<number, PageQuizData>> = {
  1: TILAWATI_JILID_1_PAGES,
  2: TILAWATI_JILID_2_PAGES,
  3: TILAWATI_JILID_3_PAGES,
  4: TILAWATI_JILID_4_PAGES,
  5: TILAWATI_JILID_5_PAGES,
};
const AUDIO_TEST_STORAGE_KEY = "ngaji-ceria:tilawati-audio-tested:v1";

type EditorSegment = {
  sourceAudioUrl: string;
  start: string;
  end: string;
};

type EditorDraft = {
  arabic: string;
  transliteration: string;
  hintTone: string;
  sourceAudioUrl: string;
  outputAudioUrl: string;
  start: string;
  end: string;
};

type EditingQuestion = {
  questionIndex: number;
  question: QuizQuestion;
  audioUrl: string;
};

type TimelineClip = {
  sequence: number;
  filename: string;
  type: "header" | "demo" | "footer" | "baris" | "isi";
  duration: number;
  audioUrl: string;
};

export default function CekAudioManualPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJilid = Math.min(5, Math.max(1, Number(searchParams.get("jilid")) || 1));
  const initialHal = Math.min(44, Math.max(1, Number(searchParams.get("hal")) || 1));
  const [jilid, setJilid] = useState(initialJilid);
  const [hal, setHal] = useState(initialHal);

  useEffect(() => {
    const paramJilid = Number(searchParams.get("jilid"));
    const paramHal = Number(searchParams.get("hal"));
    if (paramJilid && paramJilid !== jilid) setJilid(Math.min(5, Math.max(1, paramJilid)));
    if (paramHal && paramHal !== hal) setHal(Math.min(44, Math.max(1, paramHal)));
  }, [searchParams]);

  const updatePage = (newJilid: number, newHal: number) => {
    setJilid(newJilid);
    setHal(newHal);
    setSearchParams({ jilid: String(newJilid), hal: String(newHal) }, { replace: true });
  };
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [testedAudio, setTestedAudio] = useState<Record<string, boolean>>(
    () => {
      try {
        const stored = window.localStorage.getItem(AUDIO_TEST_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
  );
  const [editingQuestion, setEditingQuestion] =
    useState<EditingQuestion | null>(null);
  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null);
  const [editorSegments, setEditorSegments] = useState<EditorSegment[]>([]);
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineMessage, setTimelineMessage] = useState("");
  const [selectedTimelineUrl, setSelectedTimelineUrl] = useState("");
  const [timelineStart, setTimelineStart] = useState("0");
  const [timelineEnd, setTimelineEnd] = useState("");
  const [timelineCutPoint, setTimelineCutPoint] = useState("0");
  const [selectedMergeUrls, setSelectedMergeUrls] = useState<string[]>([]);
  const [draggingTimelineHandle, setDraggingTimelineHandle] = useState<
    "start" | "end" | "cut" | null
  >(null);
  const [draggingTimelineUrl, setDraggingTimelineUrl] = useState("");
  const [draggingTextId, setDraggingTextId] = useState("");
  const [timelineTextLinks, setTimelineTextLinks] = useState<
    Record<string, string>
  >({});
  const [timelineTextAdditions, setTimelineTextAdditions] = useState<
    QuizQuestion[]
  >([]);
  const selectedTimelineElement = useRef<HTMLButtonElement | null>(null);

  // Check if current page is kelipatan 6 (Latihan-latihan bacaan)
  const isKelipatanEnam = hal % 6 === 0;

  // Page dataset based on active jilid. Jilid 6 is intentionally not enabled yet.
  const pageData = QUIZ_DATASETS[jilid]?.[hal] ?? null;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [jilid, hal]);

  useEffect(() => {
    let cancelled = false;
    setTimelineLoading(true);
    setTimelineMessage("");
    fetch(`/api/tilawati-editor?action=list&jilid=${jilid}&hal=${hal}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.ok)
          throw new Error(result.message || "Gagal membaca timeline audio");
        return result as {
          clips: TimelineClip[];
          textLinks?: Record<string, string>;
          textAdditions?: QuizQuestion[];
        };
      })
      .then((result) => {
        if (!cancelled) {
          setTimelineClips(result.clips);
          setTimelineTextLinks(result.textLinks || {});
          setTimelineTextAdditions(result.textAdditions || []);
          setSelectedTimelineUrl("");
          setTimelineStart("0");
          setTimelineEnd("");
          setTimelineCutPoint("0");
          setSelectedMergeUrls([]);
        }
      })
      .catch((error) => {
        if (!cancelled)
          setTimelineMessage(
            error instanceof Error ? error.message : String(error),
          );
      })
      .finally(() => {
        if (!cancelled) setTimelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jilid, hal]);

  const playAudio = (id: number | string, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (!url) {
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch((e) => {
      console.warn("Direct slice play failed", e);
      setPlayingId(null);
    });
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const getQuestionKey = (questionIndex: number) =>
    questionIndex === -1 ? `${jilid}:${hal}:page` : `${jilid}:${hal}:${questionIndex}`;

  const setAudioTested = (questionIndex: number, tested: boolean) => {
    const key = getQuestionKey(questionIndex);
    setTestedAudio((current) => {
      const next = { ...current, [key]: tested };
      try {
        window.localStorage.setItem(
          AUDIO_TEST_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Persistensi lokal tidak boleh mengganggu pemutaran audio.
      }
      return next;
    });
  };

  const openEditor = (
    question: QuizQuestion,
    questionIndex: number,
    audioUrl: string,
  ) => {
    setEditingQuestion({ question, questionIndex, audioUrl });
    setEditorSegments([]);
    setEditorMessage("");
    setEditorDraft({
      arabic: question.arabic,
      transliteration: question.transliterationParts.join("\n"),
      hintTone: question.hintTone,
      sourceAudioUrl: audioUrl,
      outputAudioUrl: audioUrl,
      start: "0",
      end: "",
    });

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        setEditorDraft((current) =>
          current
            ? { ...current, end: String(audio.duration.toFixed(3)) }
            : current,
        );
      };
      audio.load();
    }
  };

  const selectedTimelineClip =
    timelineClips.find((clip) => clip.audioUrl === selectedTimelineUrl) || null;
  const timelineTotalDuration = timelineClips.reduce(
    (total, clip) => total + clip.duration,
    0,
  );

  const selectTimelineClip = (clip: TimelineClip) => {
    setSelectedTimelineUrl(clip.audioUrl);
    setTimelineStart("0");
    setTimelineEnd(String(clip.duration.toFixed(3)));
    setTimelineCutPoint(String((clip.duration / 2).toFixed(3)));
    if (editorDraft) {
      setEditorDraft({
        ...editorDraft,
        sourceAudioUrl: clip.audioUrl,
        start: "0",
        end: String(clip.duration.toFixed(3)),
      });
    }
  };

  const selectEditorSourceAudio = (audioUrl: string) => {
    const clip = timelineClips.find((item) => item.audioUrl === audioUrl);
    setSelectedTimelineUrl(audioUrl);
    if (!editorDraft) return;
    const duration = clip?.duration || 0;
    setEditorDraft({
      ...editorDraft,
      sourceAudioUrl: audioUrl,
      start: "0",
      end: duration ? String(duration.toFixed(3)) : editorDraft.end,
    });
    if (clip) {
      setTimelineStart("0");
      setTimelineEnd(String(duration.toFixed(3)));
      setTimelineCutPoint(String((duration / 2).toFixed(3)));
    }
  };

  useEffect(() => {
    if (!draggingTimelineHandle || !selectedTimelineClip) return;
    const handlePointerMove = (event: PointerEvent) => {
      const element = selectedTimelineElement.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      const value = ratio * selectedTimelineClip.duration;
      if (draggingTimelineHandle === "start") {
        const end = Number(timelineEnd) || selectedTimelineClip.duration;
        setTimelineStart(
          String(Math.min(value, Math.max(0, end - 0.001)).toFixed(3)),
        );
      } else if (draggingTimelineHandle === "end") {
        const start = Number(timelineStart) || 0;
        setTimelineEnd(
          String(
            Math.max(
              value,
              Math.min(selectedTimelineClip.duration, start + 0.001),
            ).toFixed(3),
          ),
        );
      } else {
        setTimelineCutPoint(String(value.toFixed(3)));
      }
    };
    const handlePointerUp = () => setDraggingTimelineHandle(null);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    draggingTimelineHandle,
    selectedTimelineClip,
    timelineEnd,
    timelineStart,
  ]);

  const useTimelineSelection = () => {
    if (!selectedTimelineClip || !editorDraft) return;
    setEditorDraft({
      ...editorDraft,
      sourceAudioUrl: selectedTimelineClip.audioUrl,
      start: timelineStart,
      end: timelineEnd || String(selectedTimelineClip.duration.toFixed(3)),
    });
    setEditorMessage(
      `Klip ${selectedTimelineClip.filename} dipakai sebagai sumber editor.`,
    );
  };

  const previewTimelineSelection = () => {
    if (!selectedTimelineClip) return;
    const audio = new Audio(selectedTimelineClip.audioUrl);
    audioRef.current?.pause();
    audioRef.current = audio;
    const start = Number(timelineStart) || 0;
    const end = Number(timelineEnd) || selectedTimelineClip.duration;
    audio.onloadedmetadata = () => {
      audio.currentTime = Math.min(start, audio.duration || start);
      void audio.play();
    };
    audio.ontimeupdate = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
    audio.load();
  };

  const closeEditor = () => {
    if (editorBusy) return;
    setEditingQuestion(null);
    setEditorDraft(null);
    setEditorSegments([]);
    setEditorMessage("");
  };

  const editorRequest = async (
    action: string,
    body: Record<string, unknown>,
  ) => {
    const response = await fetch(
      `/api/tilawati-editor?action=${encodeURIComponent(action)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    if (!response.ok || !result.ok)
      throw new Error(result.message || "Gagal menyimpan perubahan editor");
    return result;
  };

  const saveTimelineLayout = async (
    audioOrder: string[],
    textLinks = timelineTextLinks,
    textAdditions = timelineTextAdditions,
  ) => {
    await editorRequest("save-layout", {
      jilid,
      page: hal,
      audioOrder,
      textLinks,
      textAdditions,
    });
  };

  const reorderTimelineClip = async (targetAudioUrl: string) => {
    if (!draggingTimelineUrl || draggingTimelineUrl === targetAudioUrl) return;
    const currentOrder = timelineClips.map((clip) => clip.audioUrl);
    const fromIndex = currentOrder.indexOf(draggingTimelineUrl);
    const toIndex = currentOrder.indexOf(targetAudioUrl);
    if (fromIndex < 0 || toIndex < 0) return;
    currentOrder.splice(fromIndex, 1);
    currentOrder.splice(toIndex, 0, draggingTimelineUrl);
    setDraggingTimelineUrl("");
    try {
      await saveTimelineLayout(currentOrder);
      window.location.reload();
    } catch (error) {
      setTimelineMessage(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const linkTextToAudio = async (questionId: string, audioUrl: string) => {
    const nextLinks = { ...timelineTextLinks, [questionId]: audioUrl };
    setTimelineTextLinks(nextLinks);
    setDraggingTextId("");
    setDraggingTimelineUrl("");
    try {
      await saveTimelineLayout(
        timelineClips.map((clip) => clip.audioUrl),
        nextLinks,
      );
      window.location.reload();
    } catch (error) {
      setTimelineMessage(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const addTimelineText = async () => {
    const arabic = window.prompt("Masukkan teks Arab baru untuk halaman ini:");
    if (!arabic?.trim()) return;
    const transliteration =
      window.prompt("Masukkan transliterasi, pisahkan dengan koma:", "") || "";
    const parts = transliteration
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const addition: QuizQuestion = {
      id: `custom-${Date.now()}`,
      arabic: arabic.trim(),
      transliterationParts: parts,
      options: parts,
      hintTone: "Rost: Baris",
      audioUrl: "",
      audioMappingComplete: true,
    };
    const nextAdditions = [...timelineTextAdditions, addition];
    try {
      await saveTimelineLayout(
        timelineClips.map((clip) => clip.audioUrl),
        timelineTextLinks,
        nextAdditions,
      );
      window.location.reload();
    } catch (error) {
      setTimelineMessage(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const toggleMergeClip = (audioUrl: string) => {
    setSelectedMergeUrls((current) =>
      current.includes(audioUrl)
        ? current.filter((url) => url !== audioUrl)
        : [...current, audioUrl],
    );
  };

  const splitSelectedTimelineClip = async () => {
    if (!selectedTimelineClip) return;
    setTimelineMessage("Memotong audio...");
    try {
      await editorRequest("split", {
        audioUrl: selectedTimelineClip.audioUrl,
        cutAt: timelineCutPoint,
      });
      window.location.reload();
    } catch (error) {
      setTimelineMessage(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const deleteSelectedTimelineClip = async () => {
    if (!selectedTimelineClip) return;
    if (
      !window.confirm(
        `Hapus klip ${selectedTimelineClip.filename} dari project?`,
      )
    )
      return;
    setTimelineMessage("Menghapus klip...");
    try {
      await editorRequest("delete-clip", {
        audioUrl: selectedTimelineClip.audioUrl,
      });
      window.location.reload();
    } catch (error) {
      setTimelineMessage(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const mergeSelectedTimelineClips = async () => {
    if (!editorDraft || selectedMergeUrls.length < 2) return;
    const segments = selectedMergeUrls
      .map((url) => timelineClips.find((clip) => clip.audioUrl === url))
      .filter((clip): clip is TimelineClip => Boolean(clip))
      .map((clip) => ({
        sourceAudioUrl: clip.audioUrl,
        start: "0",
        end: String(clip.duration),
      }));
    if (!segments.length) return;
    setEditorBusy(true);
    setEditorMessage("");
    try {
      await editorRequest("merge", {
        key: editorKey,
        outputAudioUrl: editorDraft.outputAudioUrl,
        segments,
      });
      window.location.reload();
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setEditorBusy(false);
    }
  };

  const reloadAfterEditorSave = () => {
    window.location.reload();
  };

  const saveEditorText = async () => {
    if (!editingQuestion || !editorDraft) return;
    setEditorBusy(true);
    setEditorMessage("");
    try {
      await editorRequest("save-text", {
        key: editorKey,
        arabic: editorDraft.arabic,
        transliterationParts: editorDraft.transliteration
          .split(/[\n,]/)
          .map((part) => part.trim())
          .filter(Boolean),
        hintTone: editorDraft.hintTone,
      });
      reloadAfterEditorSave();
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setEditorBusy(false);
    }
  };

  const editorKey = editingQuestion
    ? `${jilid}:${hal}:${editingQuestion.question.id}`
    : "";

  const saveEditorAudio = async (action: "cut" | "merge") => {
    if (!editingQuestion || !editorDraft || !editorDraft.outputAudioUrl) return;
    setEditorBusy(true);
    setEditorMessage("");
    try {
      const segments =
        action === "merge"
          ? editorSegments
          : [
              {
                sourceAudioUrl: editorDraft.sourceAudioUrl,
                start: editorDraft.start,
                end: editorDraft.end,
              },
            ];
      await editorRequest(action, {
        key: editorKey,
        sourceAudioUrl: editorDraft.sourceAudioUrl,
        outputAudioUrl: editorDraft.outputAudioUrl,
        start: editorDraft.start,
        end: editorDraft.end,
        segments,
      });
      reloadAfterEditorSave();
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setEditorBusy(false);
    }
  };

  const deleteEditorAudio = async () => {
    if (!editingQuestion || !editingQuestion.audioUrl) return;
    if (!window.confirm("Hapus file audio ini dari project?")) return;
    setEditorBusy(true);
    setEditorMessage("");
    try {
      await editorRequest("delete-audio", {
        key: editorKey,
        audioUrl: editingQuestion.audioUrl,
      });
      reloadAfterEditorSave();
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setEditorBusy(false);
    }
  };

  const deleteEditorItem = async () => {
    if (!editingQuestion) return;
    if (!window.confirm("Hapus item teks dan pemetaan audio ini dari dataset?"))
      return;
    setEditorBusy(true);
    setEditorMessage("");
    try {
      await editorRequest("delete-item", {
        key: editorKey,
        audioUrl: editingQuestion.audioUrl,
      });
      reloadAfterEditorSave();
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setEditorBusy(false);
    }
  };

  const addEditorSegment = () => {
    if (!editorDraft?.sourceAudioUrl || !editorDraft.start || !editorDraft.end)
      return;
    setEditorSegments((segments) => [
      ...segments,
      {
        sourceAudioUrl: editorDraft.sourceAudioUrl,
        start: editorDraft.start,
        end: editorDraft.end,
      },
    ]);
  };

  const questionRows = pageData
    ? pageData.questions
        .map((q, questionIndex) => ({
          q,
          questionIndex,
          audioUrl:
            timelineTextLinks[String(q.id)] ||
            getQuestionAudioUrl(
              q,
              jilid,
              hal,
              questionIndex,
              Boolean(pageData.questions[0]?.isOpening),
            ),
        }))
        .filter(
          ({ questionIndex }) => !(isKelipatanEnam && questionIndex === 0),
        )
    : [];
  const testableQuestionRows = questionRows.filter(({ audioUrl }) =>
    Boolean(audioUrl),
  );
  const testedCount = testableQuestionRows.filter(
    ({ questionIndex }) => testedAudio[getQuestionKey(questionIndex)],
  ).length;

  return (
    <NgajiCeriaLayout title="Cek Audio Manual" showBack>
      <div className="p-4 max-w-md mx-auto min-h-screen bg-slate-50/50">
        {/* Jilid Selector Tabs (1 to 5) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
          {[1, 2, 3, 4, 5].map((j) => (
            <button
              key={j}
              onClick={() => {
                updatePage(j, 1);
                if (audioRef.current) audioRef.current.pause();
                setPlayingId(null);
              }}
              className={`flex-1 min-w-[54px] py-2 rounded-xl font-black text-xs transition-all active:scale-95 text-center ${
                jilid === j
                  ? "bg-[#00923F] text-white shadow-md shadow-[#00923F]/20 scale-100"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Jilid {j}
            </button>
          ))}
        </div>

        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => updatePage(jilid, Math.max(1, hal - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-black tracking-widest text-[#00923F] uppercase">
              TILAWATI JILID {jilid}
            </div>
            <div className="font-black text-xl text-slate-800">
              Halaman {hal}
            </div>
          </div>
          <button
            onClick={() => updatePage(jilid, Math.min(44, hal + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {pageData && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#00923F]/20 bg-[#00923F]/10 px-4 py-3">
            <div>
              <div className="text-xs font-black text-[#00662C]">
                Status uji halaman
              </div>
              <div className="text-[10px] text-[#00662C]/70">
                Tandai halaman ini jika seluruh audio dan teks sudah final.
              </div>
            </div>
            <label className="shrink-0 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[#00923F] shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(testedAudio[`${jilid}:${hal}:page`])}
                onChange={(event) => setAudioTested(-1, event.target.checked)}
                className="w-4 h-4 accent-[#00923F]"
              />
              Halaman Lolos
            </label>
          </div>
        )}

        <section className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#00923F]/20 bg-[#00923F]/10 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#00662C]">
              Timeline halaman
            </div>
            <h3 className="truncate text-sm font-black text-[#00662C]">
              Audio Hal {hal} · {timelineClips.length} klip
            </h3>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/member/ngaji-ceria/cek-audio/timeline?jilid=${jilid}&hal=${hal}`,
              )
            }
            className="shrink-0 rounded-lg bg-[#00923F] px-3 py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-[#007a34] active:scale-95"
          >
            Editor Lokal →
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/member/ngaji-ceria/cek-audio/cloud-editor?jilid=${jilid}&hal=${hal}`,
              )
            }
            className="shrink-0 rounded-lg bg-[#00662C] px-3 py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-[#004d21] active:scale-95"
          >
            Cloud Editor →
          </button>
        </section>

        {editingQuestion && editorDraft && (
          <section className="mb-4 rounded-2xl border-2 border-[#F58A3A]/30 bg-[#FFF8EE] p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#C4430E]">
                  Editor permanen
                </div>
                <h3 className="text-base font-black text-[#5A3A2A]">
                  Edit teks & audio item
                </h3>
                <p className="mt-1 text-[10px] leading-relaxed text-[#8C5A3A]">
                  Hasil simpan ditulis ke file project. Jalankan Vite dev server
                  agar endpoint editor tersedia.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={editorBusy}
                className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-slate-600 shadow-sm disabled:opacity-50"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-[#5A3A2A]">
                Teks Arab
                <textarea
                  value={editorDraft.arabic}
                  onChange={(event) =>
                    setEditorDraft({
                      ...editorDraft,
                      arabic: event.target.value,
                    })
                  }
                  rows={3}
                  dir="rtl"
                  className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-right font-arabic text-xl leading-relaxed outline-none focus:border-[#F58A3A]"
                />
              </label>
              <label className="block text-xs font-black text-[#5A3A2A]">
                Transliterasi — satu bagian per baris (Auto-generate teks Arab)
                <textarea
                  value={editorDraft.transliteration}
                  onChange={(event) => {
                    const val = event.target.value;
                    const parts = val.split("\n");
                    const autoArabic = parts.map((p) => latinToArabic(p.trim())).filter(Boolean).join(" ");
                    setEditorDraft({
                      ...editorDraft,
                      transliteration: val,
                      arabic: autoArabic || editorDraft.arabic,
                    });
                  }}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-sm outline-none focus:border-[#F58A3A]"
                />
              </label>
              <label className="block text-xs font-black text-[#5A3A2A]">
                Nada / keterangan
                <input
                  value={editorDraft.hintTone}
                  onChange={(event) =>
                    setEditorDraft({
                      ...editorDraft,
                      hintTone: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-sm outline-none focus:border-[#F58A3A]"
                />
              </label>

              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs font-black text-[#5A3A2A]">
                  Sumber audio dari halaman ini
                  <select
                    value={editorDraft.sourceAudioUrl}
                    onChange={(event) =>
                      selectEditorSourceAudio(event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-xs outline-none focus:border-[#F58A3A]"
                  >
                    <option value="">Pilih audio yang tersedia...</option>
                    {timelineClips.map((clip) => (
                      <option key={clip.audioUrl} value={clip.audioUrl}>
                        #{clip.sequence} · {clip.type} · {clip.filename} ·{" "}
                        {clip.duration.toFixed(2)} detik
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[10px] font-medium text-[#8C5A3A]">
                    Daftar diambil dari seluruh audio pada Jilid {jilid} Halaman{" "}
                    {hal}.
                  </span>
                </label>
                <label className="text-xs font-black text-[#5A3A2A]">
                  Simpan hasil ke URL audio
                  <input
                    value={editorDraft.outputAudioUrl}
                    onChange={(event) =>
                      setEditorDraft({
                        ...editorDraft,
                        outputAudioUrl: event.target.value,
                      })
                    }
                    placeholder="/audio/tilawati/..."
                    className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-xs outline-none focus:border-[#F58A3A]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-black text-[#5A3A2A]">
                  Mulai (detik)
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={editorDraft.start}
                    onChange={(event) =>
                      setEditorDraft({
                        ...editorDraft,
                        start: event.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-sm outline-none focus:border-[#F58A3A]"
                  />
                </label>
                <label className="text-xs font-black text-[#5A3A2A]">
                  Selesai (detik)
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={editorDraft.end}
                    onChange={(event) =>
                      setEditorDraft({
                        ...editorDraft,
                        end: event.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E2D4C0] bg-white p-3 text-sm outline-none focus:border-[#F58A3A]"
                  />
                </label>
              </div>

              {editorSegments.length > 0 && (
                <div className="rounded-xl border border-[#E2D4C0] bg-white p-3">
                  <div className="mb-2 text-xs font-black text-[#5A3A2A]">
                    Segmen gabungan
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-600">
                    {editorSegments.map((segment, index) => (
                      <div
                        key={`${segment.sourceAudioUrl}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {index + 1}. {segment.sourceAudioUrl} ({segment.start}
                          –{segment.end}s)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditorSegments((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          className="shrink-0 font-black text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                  {editorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={saveEditorText}
                  disabled={editorBusy}
                  className="rounded-xl bg-[#5A3A2A] px-3 py-2.5 text-xs font-black text-white disabled:opacity-50"
                >
                  Simpan teks
                </button>
                <button
                  type="button"
                  onClick={() => saveEditorAudio("cut")}
                  disabled={
                    editorBusy ||
                    !editorDraft.sourceAudioUrl ||
                    !editorDraft.outputAudioUrl
                  }
                  className="rounded-xl bg-[#00923F] px-3 py-2.5 text-xs font-black text-white disabled:opacity-50"
                >
                  Potong & simpan
                </button>
                <button
                  type="button"
                  onClick={addEditorSegment}
                  disabled={
                    editorBusy ||
                    !editorDraft.sourceAudioUrl ||
                    !editorDraft.end
                  }
                  className="rounded-xl border border-[#00923F]/30 bg-white px-3 py-2.5 text-xs font-black text-[#00662C] disabled:opacity-50"
                >
                  Tambah segmen
                </button>
                <button
                  type="button"
                  onClick={() => saveEditorAudio("merge")}
                  disabled={
                    editorBusy ||
                    editorSegments.length === 0 ||
                    !editorDraft.outputAudioUrl
                  }
                  className="rounded-xl border border-[#F58A3A]/40 bg-white px-3 py-2.5 text-xs font-black text-[#C4430E] disabled:opacity-50"
                >
                  Gabungkan segmen
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[#E2D4C0] pt-3">
                <button
                  type="button"
                  onClick={deleteEditorAudio}
                  disabled={editorBusy || !editingQuestion.audioUrl}
                  className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-black text-red-700 disabled:opacity-50"
                >
                  Hapus audio
                </button>
                <button
                  type="button"
                  onClick={deleteEditorItem}
                  disabled={editorBusy}
                  className="rounded-xl bg-red-700 px-3 py-2.5 text-xs font-black text-white disabled:opacity-50"
                >
                  Hapus item
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Content List */}
        {pageData ? (
          <div className="space-y-3 pb-24">
            {questionRows.map(({ q, questionIndex, audioUrl }) => {
              const questionKey = getQuestionKey(questionIndex);
              return (
                <div
                  key={q.id}
                  className={`flex flex-col bg-white rounded-[20px] p-4 border-2 shadow-sm transition-colors ${
                    playingId === q.id
                      ? "border-[#00923F] bg-[#F2FDF5]"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        {isKelipatanEnam
                          ? questionIndex === pageData.questions.length - 2
                            ? "Baris Bawah"
                            : `Baris ${questionIndex + 1}`
                          : questionIndex === 0
                            ? "Judul (3x Rost)"
                            : questionIndex === 1
                              ? "Judul (Evaluasi 1x)"
                              : questionIndex === pageData.questions.length - 1
                                ? "Baris Bawah"
                                : `Baris ${questionIndex - 1}`}
                      </div>
                      <div className="font-arabic text-3xl mb-1 leading-normal text-right pr-2 text-slate-800">
                        {q.arabic}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        [{q.transliterationParts.join(" - ")}]
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditor(q, questionIndex, audioUrl)}
                        className="rounded-xl border border-[#F58A3A]/30 bg-[#FFF8EE] px-2.5 py-2 text-[10px] font-black text-[#C4430E]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (playingId === q.id) {
                            audioRef.current?.pause();
                            setPlayingId(null);
                          } else {
                            playAudio(q.id, audioUrl);
                          }
                        }}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform active:scale-90 ${
                          playingId === q.id
                            ? "bg-red-500 shadow-md"
                            : "bg-[#00923F] shadow-md shadow-[#00923F]/20"
                        }`}
                      >
                        {playingId === q.id ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span
                      className="font-mono text-slate-400 truncate pr-4 max-w-[200px]"
                      title={audioUrl}
                    >
                      {audioUrl
                        ? audioUrl.split("/").pop()
                        : "Audio belum tersedia"}
                    </span>
                    <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                      {q.hintTone.includes("3x") ? "3x Rost" : "1x"}
                    </span>
                    <label
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 font-black transition-colors ${
                        audioUrl
                          ? "cursor-pointer text-[#00662C] hover:bg-[#E2F5E8]"
                          : "cursor-not-allowed text-slate-400"
                      }`}
                      title={
                        audioUrl
                          ? "Sudah ada audio"
                          : "Audio belum tersedia"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(audioUrl)}
                        readOnly
                        className="h-4 w-4 accent-[#00923F]"
                      />
                      <span>Ada Audio</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center shadow-sm pb-10">
            <div className="w-12 h-12 rounded-full bg-[#00923F]/10 text-[#00923F] flex items-center justify-center mx-auto mb-3 font-black text-lg">
              {jilid}
            </div>
            <h3 className="font-black text-base text-slate-800 mb-1">
              Tilawati Jilid {jilid} - Halaman {hal}
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
              Audio rekaman master per halaman siap diputar melalui tombol di
              atas untuk audit dan verifikasi makhraj & irama.
            </p>
          </div>
        )}
      </div>
    </NgajiCeriaLayout>
  );
}
