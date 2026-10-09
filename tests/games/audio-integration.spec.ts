import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/tilawati-editor/published?**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { published: null } }) }));
  await page.route("https://everyayah.com/**", (route) => route.fulfill({ path: "public/audio/tilawati/jilid_6/hal1/hal1-AnNas-ayat1.ogg", contentType: "audio/ogg" }));
});

test("Ayat Hunter mempertahankan kontrol di dalam viewport mobile", async ({ page }) => {
  await page.goto("/member/ngaji-ceria/games/ayat-hunter");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const controls = await page.getByTestId("hunter-controls").boundingBox();
  const scene = await page.getByTestId("hunter-scene").boundingBox();
  const collect = await page.getByRole("button", { name: /Ambil kata/ }).boundingBox();
  expect(controls).not.toBeNull();
  expect(scene!.height).toBeGreaterThan(100);
  expect(controls!.y + controls!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(collect!.height).toBeGreaterThanOrEqual(56);
  await expect(page.getByRole("button", { name: "Keluar permainan" })).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(0);
});

test("resolusi memilih pasangan klip presisi dan fallback slicing setelah asset cloud hilang", async ({ page }) => {
  await page.goto("/member/ngaji-ceria/games");
  const result = await page.evaluate(async () => {
    const path = "/src/features/ngaji-ceria/services/tilawatiAudio.ts";
    const { resolveTilawatiAudio } = await import(/* @vite-ignore */ path);
    const source = "/audio/tilawati/jilid_1/hal1/hal1_isi_full.ogg";
    const clip = (id: string, start: number) => ({ id, label: id, kind: "isi", segments: [{ sourceUrl: source, start: 0, end: 10 }], trimStart: start, trimEnd: start + 1, outputUrl: `/cloud/${id}.ogg` });
    const cloud = { timeline: { version: 2, clips: [clip("asset-A", 1), clip("asset-B", 3)], texts: [{ id: 1, arabic: "بَ", clipId: "asset-A" }, { id: 2, arabic: "تَ", clipId: "asset-B" }] } };
    const result = resolveTilawatiAudio({ jilid: 1, pageNumber: 1, questionIndex: 1, arabic: "تَ", audioUrl: source }, cloud);
    return { ...result, practiceUrl: resolveTilawatiAudio({ jilid: 1, pageNumber: 1, questionIndex: 1, audioUrl: source }, cloud).url };
  });
  expect(result.url).toBe("/cloud/asset-B.ogg");
  expect(result.practiceUrl).toBe("/cloud/asset-A.ogg");
  expect(result.candidates[1].segments).toEqual([{ sourceUrl: "/audio/tilawati/jilid_1/hal1/hal1_isi_full.ogg", start: 3, end: 4 }]);
});

test("BGM nyata tersedia dan ducking/mute kembali konsisten", async ({ page, request }) => {
  for (const track of ["menu", "quiz", "battle"]) {
    const response = await request.get(`/audio/ngaji-ceria/bgm/${track}.ogg`);
    expect(response.ok()).toBeTruthy();
    expect((await response.body()).subarray(0, 4).toString()).toBe("OggS");
  }
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const volume = await page.evaluate(async () => {
    const path = "/src/features/ngaji-ceria/services/soundManager.ts";
    const { soundManager } = await import(/* @vite-ignore */ path);
    soundManager.duckBgm(true);
    const ducked = soundManager.bgmAudio.volume;
    soundManager.duckBgm(false);
    const normal = soundManager.bgmAudio.volume;
    soundManager.setMuted(true);
    const muted = soundManager.bgmAudio.muted;
    soundManager.setMuted(false);
    return { ducked, normal, muted };
  });
  expect(volume.ducked).toBeCloseTo(volume.normal * 0.1, 3);
  expect(volume.muted).toBe(true);
});

test("XP dan leaderboard dikomit satu kali ketika game over", async ({ page }) => {
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  for (let answer = 0; answer < 3; answer++) {
    await page.locator('[data-option-correct="false"]').first().click();
    await page.waitForTimeout(1250);
  }
  await expect(page.getByTestId("xp-gained")).toContainText("XP");
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress:v1")!));
  expect(progress.gamesPlayed).toBe(1);
  expect(progress.xp).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Matikan suara" }).click({ force: true });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress:v1")!).gamesPlayed)).toBe(1);
});

test("draft lokal dipulihkan dan data halaman lain tidak tertimpa", async ({ page }) => {
  await page.route("**/api/tilawati-editor?action=list**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, clips: [], revision: "local-revision" }) }));
  await page.addInitScript(() => {
    localStorage.setItem("ngajiceria:timeline-draft:guest:1:1", JSON.stringify({ updatedAt: Date.now(), revision: "", timeline: { version: 2, clips: [], texts: [{ id: "draft-text", arabic: "مسودة", transliterationParts: [], options: [], hintTone: "Rost", clipId: null }] } }));
  });
  await page.goto("/member/ngaji-ceria/cek-audio/timeline?jilid=1&hal=1");
  await expect(page.locator(".te-status")).toContainText("Draft terbaru dipulihkan");
  await expect(page.locator(".te-list-row")).toContainText("مسودة");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("combobox", { name: "Halaman", exact: true }).selectOption("2");
  await expect(page.locator(".te-header")).toContainText("Halaman 2");
  await page.waitForTimeout(1000);
  const other = await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:timeline-draft:guest:1:2")!));
  expect(other.timeline.texts.some((text: { id: string }) => text.id === "draft-text")).toBe(false);
});

test("fallback master memainkan hanya segmen yang diminta via Web Audio", async ({ page }) => {
  const attempts: string[] = [];
  await page.route("**/missing-unit.ogg", (route) => { attempts.push("unit"); return route.fulfill({ status: 404, body: "missing" }); });
  await page.route("**/hal1_isi_full.ogg", (route) => { attempts.push("master"); return route.fulfill({ path: "public/audio/ngaji-ceria/bgm/menu.ogg", contentType: "audio/ogg" }); });
  await page.goto("/member/ngaji-ceria/games");
  await page.evaluate(async () => {
    const audioPath = "/src/features/ngaji-ceria/services/tilawatiAudio.ts";
    const { useTilawatiAudio } = await import(/* @vite-ignore */ audioPath);
    const reactPath = "/node_modules/.vite/deps/react.js";
    const domPath = "/node_modules/.vite/deps/react-dom_client.js";
    const reactModule = await import(/* @vite-ignore */ reactPath);
    const domModule = await import(/* @vite-ignore */ domPath);
    const React = reactModule.default ?? reactModule;
    const { createRoot } = domModule.default ?? domModule;
    function Harness() {
      const audio = useTilawatiAudio({ jilid: 1, pageNumber: 1, questionIndex: 2, audioUrl: "/missing-unit.ogg", startAt: 1, duration: 0.3 });
      return React.createElement("div", null,
        React.createElement("button", { onClick: () => audio.play() }, "Slice audio"),
        React.createElement("p", { "data-testid": "slice-state" }, audio.isPlaying ? "playing" : "ready"),
        React.createElement("p", { "data-testid": "slice-error" }, audio.error));
    }
    const host = document.createElement("div");
    document.body.append(host);
    createRoot(host).render(React.createElement(Harness));
  });
  await page.getByRole("button", { name: "Slice audio" }).click();
  await expect(page.getByTestId("slice-state")).toHaveText("playing");
  await expect(page.getByTestId("slice-state")).toHaveText("ready", { timeout: 2000 });
  expect(attempts).toEqual(["unit", "master"]);
  await expect(page.getByTestId("slice-error")).toBeEmpty();
});

test("kontrak API draft dan leaderboard memakai rute backend dan token yang sama", async ({ page }) => {
  const calls: Array<{ path: string; body: any; authorization?: string }> = [];
  await page.route("**/api/v1/tilawati-editor/draft-save", async (route) => {
    const body = route.request().postDataJSON();
    calls.push({ path: new URL(route.request().url()).pathname, body, authorization: route.request().headers().authorization });
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { draft: body } }) });
  });
  await page.route("**/api/v1/ngaji-ceria/leaderboard", async (route) => {
    calls.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON(), authorization: route.request().headers().authorization });
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { progress: { xp: 25, gamesPlayed: 1 } } }) });
  });
  await page.goto("/member/ngaji-ceria/games");
  await page.evaluate(async () => {
    const editorPath = "/src/features/ngaji-ceria/services/tilawatiEditorApi.ts";
    document.cookie = "pengajian_token=integration-token; path=/; SameSite=Strict";
    const progressPath = "/src/features/ngaji-ceria/services/ngajiCeriaApi.ts";
    const { tilawatiEditorApi } = await import(/* @vite-ignore */ editorPath);
    const { ngajiCeriaApi } = await import(/* @vite-ignore */ progressPath);
    await tilawatiEditorApi.saveDraft(1, 3, { timeline: { version: 2, clips: [], texts: [] }, revision: "r1", updatedAt: 123 });
    await ngajiCeriaApi.submitLeaderboard({ eventId: "session-1", gameId: "ayat-hunter", score: 250, baseXp: 25, achievementIds: ["first-game"] });
  });
  expect(calls).toHaveLength(2);
  expect(calls[0].path).toBe("/api/v1/tilawati-editor/draft-save");
  expect(calls[0].body).toMatchObject({ jilid: 1, page: 3, revision: "r1", updatedAt: 123 });
  expect(calls[1].path).toBe("/api/v1/ngaji-ceria/leaderboard");
  expect(calls[1].body).toMatchObject({ eventId: "session-1", score: 250 });
  expect(calls.every((call) => call.authorization === "Bearer integration-token")).toBe(true);
});

test("publish ditahan ketika draft cloud lebih baru dan draft lokal tetap tersedia", async ({ page }) => {
  let publishCalls = 0;
  let draftCalls = 0;
  await page.route("**/api/tilawati-editor?action=list**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, clips: [], revision: "local-revision" }) }));
  await page.route("**/api/v1/tilawati-editor/draft-save", (route) => {
    draftCalls++;
    return draftCalls === 1 ? route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { draft: route.request().postDataJSON() } }) })
      : route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, message: "conflict: draft cloud lebih baru" }) });
  });
  await page.route("**/api/v1/tilawati-editor/publish", (route) => { publishCalls++; return route.fulfill({ status: 500, body: "unexpected publish" }); });
  await page.goto("/member/ngaji-ceria/cek-audio/timeline?jilid=1&hal=1");
  await expect(page.getByRole("button", { name: "Simpan Draft", exact: true })).toBeEnabled();
  test.skip(await page.getByRole("button", { name: "Publish ke Cloud", exact: true }).count() === 0, "Backend disabled for this dev server");
  await page.evaluate(() => { document.cookie = "pengajian_token=integration-token; path=/; SameSite=Strict"; });
  await page.getByRole("button", { name: "Simpan Draft", exact: true }).click();
  await expect(page.locator(".te-status")).toContainText("Draft lokal & cloud tersinkron");
  await page.getByRole("button", { name: "Publish ke Cloud", exact: true }).click();
  await expect(page.locator(".te-status")).toContainText("Draft cloud belum tersinkron");
  expect(publishCalls).toBe(0);
  expect(draftCalls).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(() => localStorage.getItem("ngajiceria:timeline-draft:guest:1:1"))).not.toBeNull();
});
