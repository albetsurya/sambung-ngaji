import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
import path from "path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const audioRoot = path.resolve(frontendRoot, "public/audio/tilawati");
const quizEditsPath = path.resolve(
  frontendRoot,
  "src/features/ngaji-ceria/data/tilawatiQuizEdits.json",
);
const timelineEditsPath = path.resolve(
  frontendRoot,
  "src/features/ngaji-ceria/data/tilawatiTimelineEdits.json",
);

function sendEditorJson(res: any, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readEditorBody(req: any): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString();
      if (raw.length > 2 * 1024 * 1024) reject(new Error("Payload editor terlalu besar"));
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Payload JSON editor tidak valid"));
      }
    });
    req.on("error", reject);
  });
}

function audioUrlToFile(audioUrl: unknown): string {
  if (typeof audioUrl !== "string" || !audioUrl.startsWith("/audio/tilawati/")) {
    throw new Error("Audio harus menggunakan URL /audio/tilawati/...");
  }
  const file = path.resolve(audioRoot, audioUrl.slice("/audio/tilawati/".length));
  if (file !== audioRoot && !file.startsWith(`${audioRoot}${path.sep}`)) {
    throw new Error("Path audio tidak valid");
  }
  return file;
}

function outputAudioFile(audioUrl: unknown): string {
  const file = audioUrlToFile(audioUrl);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}

function runFfmpeg(args: string[]): void {
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
      stdio: "pipe",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`FFmpeg gagal: ${message}`);
  }
}

function audioDuration(file: string): number {
  try {
    const output = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file],
      { stdio: ["ignore", "pipe", "ignore"] },
    ).toString().trim();
    const duration = Number(output);
    return Number.isFinite(duration) ? Number(duration.toFixed(3)) : 0;
  } catch {
    return 0;
  }
}

function listPageAudio(jilidValue: unknown, pageValue: unknown) {
  const jilid = Number(jilidValue);
  const page = Number(pageValue);
  if (!Number.isInteger(jilid) || jilid < 1 || jilid > 5) throw new Error("Jilid tidak valid");
  if (!Number.isInteger(page) || page < 1 || page > 44) throw new Error("Halaman tidak valid");

  const directory = path.resolve(audioRoot, `jilid_${jilid}`, `hal${page}`);
  if (!directory.startsWith(`${audioRoot}${path.sep}`)) throw new Error("Folder audio tidak valid");
  if (!fs.existsSync(directory)) return [];

  const clips = fs.readdirSync(directory)
    .filter((filename) => filename.toLowerCase().endsWith(".ogg") && !filename.startsWith("editor_"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((filename, index) => {
      const lower = filename.toLowerCase();
      const type = lower.includes("header")
        ? "header"
        : lower.includes("demo")
          ? "demo"
          : lower.includes("footer")
            ? "footer"
            : lower.includes("baris")
              ? "baris"
              : "isi";
      return {
        sequence: index + 1,
        filename,
        type,
        duration: audioDuration(path.join(directory, filename)),
        audioUrl: `/audio/tilawati/jilid_${jilid}/hal${page}/${filename}`,
      };
    });
  const layout = readTimelineEdits()[`${jilid}:${page}`];
  const audioOrder = Array.isArray(layout?.audioOrder) ? layout.audioOrder as string[] : [];
  const ranks = new Map(audioOrder.map((audioUrl, index) => [audioUrl, index]));
  return clips
    .sort((left, right) =>
      (ranks.get(left.audioUrl) ?? Number.MAX_SAFE_INTEGER) -
      (ranks.get(right.audioUrl) ?? Number.MAX_SAFE_INTEGER),
    )
    .map((clip, index) => ({ ...clip, sequence: index + 1 }));
}

function readQuizEdits(): Record<string, Record<string, unknown>> {
  if (!fs.existsSync(quizEditsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(quizEditsPath, "utf8"));
  } catch {
    throw new Error("tilawatiQuizEdits.json tidak berisi JSON yang valid");
  }
}

function saveQuizEdit(key: unknown, edit: Record<string, unknown>): void {
  if (typeof key !== "string" || !/^\d+:[^:]+:.+$/.test(key)) {
    throw new Error("Kunci pertanyaan audio tidak valid");
  }
  const edits = readQuizEdits();
  edits[key] = { ...(edits[key] || {}), ...edit };
  fs.mkdirSync(path.dirname(quizEditsPath), { recursive: true });
  fs.writeFileSync(quizEditsPath, `${JSON.stringify(edits, null, 2)}\n`, "utf8");
}

function readTimelineEdits(): Record<string, Record<string, unknown>> {
  if (!fs.existsSync(timelineEditsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(timelineEditsPath, "utf8"));
  } catch {
    throw new Error("tilawatiTimelineEdits.json tidak berisi JSON yang valid");
  }
}

function saveTimelineEdit(jilid: unknown, page: unknown, edit: Record<string, unknown>): void {
  const key = `${Number(jilid)}:${Number(page)}`;
  if (!/^([1-5]):([1-9]|[1-3][0-9]|4[0-4])$/.test(key)) throw new Error("Kunci timeline tidak valid");
  const edits = readTimelineEdits();
  edits[key] = { ...(edits[key] || {}), ...edit };
  fs.mkdirSync(path.dirname(timelineEditsPath), { recursive: true });
  fs.writeFileSync(timelineEditsPath, `${JSON.stringify(edits, null, 2)}\n`, "utf8");
}

function numberValue(value: unknown, label: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} tidak valid`);
  return number;
}

function createCut(body: Record<string, unknown>): string {
  const source = audioUrlToFile(body.sourceAudioUrl);
  const outputUrl = body.outputAudioUrl;
  const output = outputAudioFile(outputUrl);
  const start = numberValue(body.start, "Waktu mulai");
  const end = numberValue(body.end, "Waktu selesai");
  if (end <= start) throw new Error("Waktu selesai harus lebih besar dari waktu mulai");
  const actualOutput = path.resolve(source) === path.resolve(output)
    ? `${output}.editor-temp.ogg`
    : output;
  runFfmpeg([
    "-ss", String(start),
    "-i", source,
    "-t", String(end - start),
    "-vn",
    "-c:a", "libvorbis",
    "-q:a", "5",
    actualOutput,
  ]);
  if (actualOutput !== output) fs.renameSync(actualOutput, output);
  return String(outputUrl);
}

function createMerge(body: Record<string, unknown>): string {
  const outputUrl = body.outputAudioUrl;
  const output = outputAudioFile(outputUrl);
  const segments = Array.isArray(body.segments) ? body.segments : [];
  if (segments.length === 0) throw new Error("Minimal satu segmen diperlukan untuk gabung audio");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tilawati-editor-"));
  try {
    const clipFiles: string[] = [];
    segments.forEach((rawSegment, index) => {
      const segment = rawSegment as Record<string, unknown>;
      const source = audioUrlToFile(segment.sourceAudioUrl);
      const start = numberValue(segment.start, `Segmen ${index + 1} mulai`);
      const end = numberValue(segment.end, `Segmen ${index + 1} selesai`);
      if (end <= start) throw new Error(`Segmen ${index + 1} memiliki durasi tidak valid`);
      const clip = path.join(tempDir, `clip-${index}.ogg`);
      runFfmpeg([
        "-ss", String(start),
        "-i", source,
        "-t", String(end - start),
        "-vn",
        "-c:a", "libvorbis",
        "-q:a", "5",
        clip,
      ]);
      clipFiles.push(clip);
    });

    const concatList = path.join(tempDir, "concat.txt");
    fs.writeFileSync(
      concatList,
      clipFiles.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n"),
      "utf8",
    );
    runFfmpeg(["-f", "concat", "-safe", "0", "-i", concatList, "-c:a", "libvorbis", "-q:a", "5", output]);
    return String(outputUrl);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function splitAudio(body: Record<string, unknown>) {
  const source = audioUrlToFile(body.audioUrl);
  const cutAt = numberValue(body.cutAt, "Posisi gunting");
  const duration = audioDuration(source);
  if (!duration || cutAt <= 0 || cutAt >= duration) {
    throw new Error("Posisi gunting harus berada di tengah durasi audio");
  }

  const parsed = path.parse(source);
  const firstFile = path.join(parsed.dir, `${parsed.name}_part01.ogg`);
  const secondFile = path.join(parsed.dir, `${parsed.name}_part02.ogg`);
  runFfmpeg([
    "-ss", "0",
    "-i", source,
    "-t", String(cutAt),
    "-vn",
    "-c:a", "libvorbis",
    "-q:a", "5",
    firstFile,
  ]);
  runFfmpeg([
    "-ss", String(cutAt),
    "-i", source,
    "-t", String(duration - cutAt),
    "-vn",
    "-c:a", "libvorbis",
    "-q:a", "5",
    secondFile,
  ]);
  fs.rmSync(source);

  const relative = path.relative(audioRoot, parsed.dir).split(path.sep).join("/");
  const prefix = relative ? `/audio/tilawati/${relative}/` : "/audio/tilawati/";
  return [
    `${prefix}${path.basename(firstFile)}`,
    `${prefix}${path.basename(secondFile)}`,
  ];
}

function flattenTimelineSegments(clip: Record<string, any>) {
  const trimStart = Number(clip.trimStart) || 0;
  const trimEnd = Number(clip.trimEnd) || 0;
  let offset = 0;
  const output: Record<string, unknown>[] = [];
  for (const rawSegment of Array.isArray(clip.segments) ? clip.segments : []) {
    const segment = rawSegment as Record<string, any>;
    const start = Number(segment.start);
    const end = Number(segment.end);
    const length = end - start;
    const visibleStart = Math.max(trimStart, offset);
    const visibleEnd = Math.min(trimEnd, offset + length);
    if (visibleEnd > visibleStart) {
      output.push({
        sourceAudioUrl: segment.sourceUrl,
        start: start + visibleStart - offset,
        end: start + visibleEnd - offset,
      });
    }
    offset += length;
  }
  return output;
}

function publishTimeline(body: Record<string, unknown>) {
  const jilid = Number(body.jilid);
  const page = Number(body.page);
  const timeline = body.timeline as Record<string, any>;
  if (!timeline || !Array.isArray(timeline.clips) || !Array.isArray(timeline.texts)) {
    throw new Error("Draft timeline tidak valid");
  }
  const pageDirectory = path.resolve(audioRoot, `jilid_${jilid}`, `hal${page}`);
  if (!pageDirectory.startsWith(`${audioRoot}${path.sep}`)) throw new Error("Folder publish tidak valid");
  fs.mkdirSync(pageDirectory, { recursive: true });
  const revision = String(Date.now());
  const outputByClip = new Map<string, string>();
  for (const rawClip of timeline.clips) {
    const clip = rawClip as Record<string, any>;
    const segments = flattenTimelineSegments(clip);
    if (!segments.length) continue;
    const safeId = String(clip.id).replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputAudioUrl = `/audio/tilawati/jilid_${jilid}/hal${page}/editor_${revision}_${safeId}.ogg`;
    createMerge({ outputAudioUrl, segments });
    outputByClip.set(String(clip.id), outputAudioUrl);
  }

  const questions = [];
  for (const rawClip of timeline.clips) {
    const clip = rawClip as Record<string, any>;
    const linkedTexts = timeline.texts.filter((text: Record<string, any>) => String(text.clipId || "") === String(clip.id));
    if (!linkedTexts.length) continue;
    const first = linkedTexts[0];
    const parts = linkedTexts.flatMap((text: Record<string, any>) => Array.isArray(text.transliterationParts) ? text.transliterationParts : []);
    const options = linkedTexts.flatMap((text: Record<string, any>) => Array.isArray(text.options) ? text.options : []);
    questions.push({
      ...first,
      id: first.id,
      arabic: linkedTexts.map((text: Record<string, any>) => String(text.arabic || "").replace(/\s+/g, " ").trim()).join("   "),
      transliterationParts: parts,
      options: [...parts, ...options.filter((option: string) => !parts.includes(option)).slice(0, Math.max(8, parts.length))],
      audioUrl: outputByClip.get(String(clip.id)) || "",
      audioMappingComplete: true,
      clipId: undefined,
    });
  }
  for (const text of timeline.texts.filter((item: Record<string, any>) => !item.clipId)) {
    const { clipId: _clipId, ...question } = text;
    questions.push({ ...question, audioUrl: "", audioMappingComplete: true });
  }

  const publishedTimeline = {
    ...timeline,
    clips: timeline.clips.map((clip: Record<string, any>) => ({
      ...clip,
      outputUrl: outputByClip.get(String(clip.id)),
    })),
  };
  const published = { timeline: publishedTimeline, questions, revision };
  saveTimelineEdit(jilid, page, { published });
  return { published, clips: listPageAudio(jilid, page) };
}

function tilawatiEditorPlugin() {
  return {
    name: "tilawati-editor-local-files",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith("/api/tilawati-editor")) {
          next();
          return;
        }

        if (req.method === "OPTIONS") {
          sendEditorJson(res, 204, null);
          return;
        }

        try {
          const action = new URL(req.url, "http://localhost").searchParams.get("action") ||
            req.url.split("?")[0].replace("/api/tilawati-editor/", "");
          if (req.method === "GET" && action === "status") {
            let ffmpeg = true;
            try {
              execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
            } catch {
              ffmpeg = false;
            }
            sendEditorJson(res, 200, { ok: true, ffmpeg, storage: "project-files" });
            return;
          }
          if (req.method === "GET" && action === "list") {
            const url = new URL(req.url, "http://localhost");
            const jilid = url.searchParams.get("jilid");
            const page = url.searchParams.get("hal") || url.searchParams.get("page");
            const clips = listPageAudio(
              jilid,
              page,
            );
            const layout = readTimelineEdits()[`${Number(jilid)}:${Number(page)}`] || {};
            sendEditorJson(res, 200, {
              ok: true,
              clips,
              published: layout.published || null,
              revision: (layout.published as Record<string, unknown> | undefined)?.revision || "",
              textLinks: layout.textLinks || {},
              textAdditions: layout.textAdditions || [],
            });
            return;
          }
          if (req.method !== "POST") {
            sendEditorJson(res, 405, { ok: false, message: "Method tidak didukung" });
            return;
          }

          const body = await readEditorBody(req);
          if (action === "cut") {
            const outputAudioUrl = createCut(body);
            saveQuizEdit(body.key, { audioUrl: outputAudioUrl, audioMappingComplete: true });
            sendEditorJson(res, 200, { ok: true, audioUrl: outputAudioUrl });
            return;
          }
          if (action === "merge") {
            const outputAudioUrl = createMerge(body);
            saveQuizEdit(body.key, { audioUrl: outputAudioUrl, audioMappingComplete: true });
            sendEditorJson(res, 200, { ok: true, audioUrl: outputAudioUrl });
            return;
          }
          if (action === "split") {
            const audioUrls = splitAudio(body);
            sendEditorJson(res, 200, { ok: true, audioUrls });
            return;
          }
          if (action === "save-layout") {
            saveTimelineEdit(body.jilid, body.page, {
              audioOrder: body.audioOrder,
              textLinks: body.textLinks,
              textAdditions: body.textAdditions,
            });
            sendEditorJson(res, 200, { ok: true, saved: true });
            return;
          }
          if (action === "publish") {
            const result = publishTimeline(body);
            sendEditorJson(res, 200, { ok: true, ...result });
            return;
          }
          if (action === "delete-clip") {
            const file = audioUrlToFile(body.audioUrl);
            if (fs.existsSync(file)) fs.rmSync(file);
            sendEditorJson(res, 200, { ok: true, deleted: true });
            return;
          }
          if (action === "delete-audio") {
            const file = audioUrlToFile(body.audioUrl);
            if (fs.existsSync(file)) fs.rmSync(file);
            saveQuizEdit(body.key, { audioUrl: "", audioMappingComplete: true });
            sendEditorJson(res, 200, { ok: true, deleted: true });
            return;
          }
          if (action === "delete-item") {
            if (body.audioUrl) {
              const file = audioUrlToFile(body.audioUrl);
              if (fs.existsSync(file)) fs.rmSync(file);
            }
            saveQuizEdit(body.key, { deleted: true, audioUrl: "", audioMappingComplete: true });
            sendEditorJson(res, 200, { ok: true, deleted: true });
            return;
          }
          if (action === "save-text") {
            const edit: Record<string, unknown> = {};
            for (const field of ["arabic", "transliterationParts", "options", "hintTone"]) {
              if (field in body) edit[field] = body[field];
            }
            saveQuizEdit(body.key, edit);
            sendEditorJson(res, 200, { ok: true, saved: true });
            return;
          }
          sendEditorJson(res, 404, { ok: false, message: "Aksi editor tidak dikenal" });
        } catch (error) {
          sendEditorJson(res, 400, {
            ok: false,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(frontendRoot, "./src"),
    },
  },
  plugins: [
    react(),
    tilawatiEditorPlugin(),
    VitePWA({
      // "autoUpdate": SW baru langsung skipWaiting + claim, halaman reload
      // otomatis via PwaUpdatePrompt. User tetap dapat versi terbaru
      // tanpa harus klik banner manual.
      registerType: "autoUpdate",
      manifest: false,
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "favicon-dev.svg",
        "favicon-staging.svg",
        "apple-touch-icon-180x180.png",
        "favicon-dev-180x180.png",
        "favicon-staging-180x180.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-192x192-dev.png",
        "pwa-512x512-dev.png",
        "pwa-192x192-staging.png",
        "pwa-512x512-staging.png",
        "manifest.webmanifest",
        "manifest-dev.webmanifest",
        "manifest-staging.webmanifest",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,glb,woff2,webmanifest}"],
        // Game engines, 3D models, and spreadsheet/PDF vendors are loaded on
        // demand. Precaching them makes the first PWA install unnecessarily
        // large and slows updates for users who only use the member module.
        globIgnores: [
          "**/*.glb",
          "**/HarakatRushPage-*.js",
          "**/BattleScene-*.js",
          "**/vendor-excel-*.js",
          "**/vendor-pdf-*.js",
          "**/tilawatiQuizData-*.js",
          "**/tilawatiQuizJilid1-*.js",
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        // Auto-update: SW baru langsung aktif + kuasai halaman terbuka.
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      devOptions: {
        // MATI di dev: SW dev menyajikan CSS/JS basi dan menyulitkan
        // verifikasi perubahan tema. Aktifkan hanya bila menguji offline.
        enabled: false,
        type: "module",
      },
    }),
  ],
  // Hapus console.* & debugger dari production build (dev tetap ada).
  esbuild: {
    drop: ["console", "debugger"],
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/public/audio/tilawati/**"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          "vendor-excel": ["exceljs"],
          "vendor-pdf": ["jspdf", "jspdf-autotable"],
          "vendor-ui": ["html2canvas"],
        },
      },
    },
  },
});
