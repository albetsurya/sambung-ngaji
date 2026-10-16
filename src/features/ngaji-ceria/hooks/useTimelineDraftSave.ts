import { useEffect, useRef, useState } from "react";
import { getToken } from "../../../services/api";
import type { PageTimeline } from "../utils/pageTimeline";
import { isNgajiCeriaServerAvailable } from "../services/ngajiCeriaApi";
import { readLocalDraft, tilawatiEditorApi, writeLocalDraft } from "../services/tilawatiEditorApi";

export function useTimelineDraftSave(jilid: number, page: number, draft: PageTimeline | null, revision: string, ready: boolean) {
  const [status, setStatus] = useState("");
  const latest = useRef({ jilid, page, draft, revision, ready });
  latest.current = { jilid, page, draft, revision, ready };
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const chain = useRef(Promise.resolve(true));
  const saved = useRef("");

  function persist(force = false) {
    const value = latest.current;
    if (!value.ready || !value.draft) return Promise.resolve(false);
    const signature = `${value.jilid}:${value.page}:${value.revision}:${JSON.stringify(value.draft)}`;
    const existing = readLocalDraft(value.jilid, value.page);
    const record = { timeline: value.draft, revision: value.revision, updatedAt: existing && JSON.stringify(existing.timeline) === JSON.stringify(value.draft) ? existing.updatedAt : Date.now() };
    try { writeLocalDraft(value.jilid, value.page, record); }
    catch { setStatus("Penyimpanan browser penuh. Coba simpan ke cloud."); }
    if (!isNgajiCeriaServerAvailable() || !getToken()) { setStatus("Draft lokal tersimpan · masuk untuk sinkronisasi cloud."); return Promise.resolve(true); }
    if (!force && saved.current === signature) return chain.current;
    const job = chain.current.then(async () => {
      await tilawatiEditorApi.saveDraft(value.jilid, value.page, record);
      saved.current = signature;
      if (latest.current.jilid === value.jilid && latest.current.page === value.page) setStatus("Draft lokal & cloud tersinkron.");
      return true;
    });
    chain.current = job.catch((error) => { setStatus(`Draft lokal tersimpan · cloud: ${error instanceof Error ? error.message : String(error)}`); return false; });
    return chain.current;
  }

  useEffect(() => {
    if (!ready || !draft) return;
    const existing = readLocalDraft(jilid, page);
    try { writeLocalDraft(jilid, page, { timeline: draft, revision, updatedAt: existing && JSON.stringify(existing.timeline) === JSON.stringify(draft) ? existing.updatedAt : Date.now() }); }
    catch { setStatus("Penyimpanan browser penuh."); }
    timer.current = setTimeout(() => { void persist(); }, 900);
    return () => clearTimeout(timer.current);
  }, [jilid, page, draft, revision, ready]);
  useEffect(() => {
    const retry = () => { void persist(); };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);
  return { status, save: persist };
}
