import { API_BASE_URL } from "../../../constants";
import { getToken } from "../../../services/api";
import type { AudioAsset, PageTimeline, PublishedTimeline } from "../utils/pageTimeline";
import { timelineQuestions } from "../utils/pageTimeline";
import { isNgajiCeriaServerAvailable } from "./ngajiCeriaApi";

const root = API_BASE_URL.replace(/\/$/, "").replace(/\/api$/, "");
export interface TimelineDraft { timeline: PageTimeline; updatedAt: number; revision: string }
export interface EditorPage { clips: AudioAsset[]; published?: PublishedTimeline; revision: string }

async function request<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const token = getToken();
  const response = await fetch(`${root}/api/v1/tilawati-editor/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store", signal,
    headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(token && !path.startsWith("published?") ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("API editor belum tersedia.");
  const result = await response.json();
  if (!response.ok || result.success === false || result.ok === false) {
    throw new Error(result.message || (response.status === 401 ? "Sesi berakhir. Masuk kembali untuk sinkronisasi." : "Gagal menyimpan timeline."));
  }
  return (result.data ?? result) as T;
}

const published = new Map<string, { value: PublishedTimeline | null; at: number }>();
const pending = new Map<string, Promise<PublishedTimeline | null>>();
export function invalidatePublishedTimeline(jilid: number, page: number) {
  published.delete(`${jilid}:${page}`);
  window.dispatchEvent(new CustomEvent("ngajiceria:timeline-published", { detail: { jilid, page } }));
}

export async function getPublishedTimeline(jilid: number, page: number): Promise<PublishedTimeline | null> {
  if (!isNgajiCeriaServerAvailable()) return null;
  const key = `${jilid}:${page}`;
  const cached = published.get(key);
  if (cached && Date.now() - cached.at < 60_000) return cached.value;
  if (pending.has(key)) return pending.get(key)!;
  const job = request<{ published: PublishedTimeline | null }>(`published?jilid=${jilid}&hal=${page}`)
    .then(({ published: value }) => {
      if (value) value.questions = timelineQuestions(value.timeline);
      published.set(key, { value, at: Date.now() });
      return value;
    }).finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}

export const tilawatiEditorApi = {
  list: (jilid: number, page: number, signal?: AbortSignal) => request<EditorPage>(`list?jilid=${jilid}&hal=${page}`, undefined, signal),
  getDraft: (jilid: number, page: number, signal?: AbortSignal) => request<{ draft: TimelineDraft | null }>(`draft?jilid=${jilid}&hal=${page}`, undefined, signal),
  saveDraft: (jilid: number, page: number, draft: TimelineDraft, signal?: AbortSignal) => request<{ draft: TimelineDraft }>("draft-save", { jilid, page, ...draft }, signal),
  publish: async (jilid: number, page: number, timeline: PageTimeline, expectedRevision: string) => {
    const result = await request<EditorPage>("publish", { jilid, page, timeline, expectedRevision });
    invalidatePublishedTimeline(jilid, page);
    return result;
  },
};

function draftKey(jilid: number, page: number) {
  let user = "guest";
  try { user = JSON.parse(sessionStorage.getItem("sambung_ngaji_cached_user") ?? "null")?.user_id ?? user; } catch { /* Guest draft. */ }
  return `ngajiceria:timeline-draft:${user}:${jilid}:${page}`;
}
export function readLocalDraft(jilid: number, page: number): TimelineDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey(jilid, page)) ?? "null");
    return value?.timeline?.version === 2 && Array.isArray(value.timeline.clips) && Array.isArray(value.timeline.texts) ? value : null;
  } catch { return null; }
}
export function writeLocalDraft(jilid: number, page: number, draft: TimelineDraft | null) {
  if (draft) localStorage.setItem(draftKey(jilid, page), JSON.stringify(draft));
  else localStorage.removeItem(draftKey(jilid, page));
}
export async function restoreTimelineDraft(jilid: number, page: number, revision: string, signal?: AbortSignal) {
  const local = readLocalDraft(jilid, page);
  let remote: TimelineDraft | null = null;
  let syncError = "";
  if (isNgajiCeriaServerAvailable() && getToken()) {
    try { remote = (await tilawatiEditorApi.getDraft(jilid, page, signal)).draft; }
    catch (error) { syncError = error instanceof Error ? error.message : String(error); }
  }
  const candidates = [local, remote].filter((value): value is TimelineDraft => Boolean(value && value.revision === revision));
  const draft = candidates.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
  return { draft, syncError };
}
