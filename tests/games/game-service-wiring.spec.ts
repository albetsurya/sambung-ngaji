import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/tilawati-editor/published?**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { published: null } }) }));
  await page.route("https://everyayah.com/**", (route) => route.fulfill({ path: "public/audio/tilawati/jilid_6/hal1/hal1-AnNas-ayat1.ogg", contentType: "audio/ogg" }));
});

async function observeAudio(page: Page) {
  await page.evaluate(async () => {
    const path = "/src/features/ngaji-ceria/services/soundManager.ts";
    const { soundManager } = await import(/* @vite-ignore */ path);
    const calls = { sfx: [] as string[], speech: [] as string[] };
    (window as any).audioCalls = calls;
    const playSfx = soundManager.playSfx.bind(soundManager);
    soundManager.playSfx = (name: string, volume: number) => { calls.sfx.push(name); playSfx(name, volume); };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.src.includes("/audio/tilawati/") || this.src.includes("/integration/")) calls.speech.push(this.src);
      return play.call(this);
    };
  });
}

test("game kuis memainkan klip cloud sesuai soal dan menghentikannya saat pause", async ({ page }) => {
  await page.goto("/member/ngaji-ceria/games");
  const fixture = await page.evaluate(async () => {
    const questionsPath = "/src/features/ngaji-ceria/pages/games/juz-amma-speedrun/data/juz-amma-questions.ts";
    const recitationPath = "/src/features/ngaji-ceria/pages/games/_shared/recitation.ts";
    const { shuffleQuestions } = await import(/* @vite-ignore */ questionsPath);
    const { verseRecitation } = await import(/* @vite-ignore */ recitationPath);
    const original = Math.random;
    try {
      for (let seed = 0; seed < 1; seed += 0.05) {
        Math.random = () => seed;
        const question = shuffleQuestions()[0];
        const request = verseRecitation(question);
        if (request?.pageNumber > 0) return { seed, arabic: question.promptArabic };
      }
      throw new Error("No local Tilawati verse found for fixture");
    } finally { Math.random = original; }
  });
  await page.addInitScript((seed) => { Math.random = () => seed; }, fixture.seed);
  await page.route("**/api/v1/tilawati-editor/published?**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { published: {
    revision: "test", timeline: { version: 2,
      clips: [{ id: "precise", label: "precise", kind: "isi", segments: [], trimStart: 0, trimEnd: 1, outputUrl: "/integration/precise.ogg" }],
      texts: [{ id: "verse", arabic: fixture.arabic, transliterationParts: [], options: [], hintTone: "Rost", clipId: "precise" }],
    },
  } } }) }));
  await page.route("**/integration/precise.ogg", (route) => route.fulfill({ path: "public/audio/ngaji-ceria/bgm/menu.ogg", contentType: "audio/ogg" }));
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await observeAudio(page);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).audioCalls.speech)).toContainEqual(expect.stringContaining("/integration/precise.ogg"));
  await expect(page.getByRole("button", { name: "Hentikan bacaan" })).toBeVisible();
  await page.getByRole("button", { name: "Jeda permainan" }).click();
  await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Hentikan bacaan" })).toHaveCount(0);
});

test("game loop mengirim correct/wrong/defeat serta satu event skor dengan retry offline", async ({ page }) => {
  const calls: any[] = [];
  await page.route("**/api/v1/ngaji-ceria/leaderboard", async (route) => {
    const event = route.request().postDataJSON();
    calls.push(event);
    if (calls.length === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, message: "offline" }) });
      return;
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { progress: {
      xp: Math.max(event.baseXp, Math.floor(event.score / 10)), totalScore: event.score, gamesPlayed: 1, coins: 5,
      currentStreak: 1, dailyDate: new Date().toISOString().slice(0, 10), dailyGamesPlayed: 1, dailyTotalScore: event.score,
      dailyClaimedMissions: [], achievements: event.achievementIds,
    } } }) });
  });
  await page.goto("/member/ngaji-ceria/games/verse-quest");
  await observeAudio(page);
  await page.evaluate(() => { document.cookie = "pengajian_token=test-wiring; path=/; SameSite=Strict"; });
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.locator('[data-option-correct="true"]').click();
  await page.waitForTimeout(1250);
  for (let index = 0; index < 3; index++) {
    await page.locator('[data-option-correct="false"]').first().click();
    await page.waitForTimeout(1250);
  }
  await expect(page.getByTestId("xp-gained")).toContainText("XP");
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0]).toMatchObject({ gameId: "juz-amma-speedrun", achievementIds: ["first-game"] });
  expect(calls[0].score).toBeGreaterThan(0);
  const sfx = await page.evaluate(() => (window as any).audioCalls.sfx as string[]);
  expect(sfx.filter((name) => name === "correct")).toHaveLength(1);
  expect(sfx.filter((name) => name === "wrong")).toHaveLength(3);
  expect(sfx.filter((name) => name === "defeat")).toHaveLength(1);
  expect(sfx).not.toContain("victory");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress-events:v1")!).length)).toBe(1);
  await page.evaluate(() => { window.dispatchEvent(new Event("online")); });
  await expect.poll(() => calls.length).toBe(2);
  expect(calls[1]).toEqual(calls[0]);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress-events:v1")!).length)).toBe(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress:v1")!).gamesPlayed)).toBe(1);
});

test("ritme melafalkan hit sukses berulang untuk huruf yang sama", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install({ time: new Date("2026-10-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-09T12:00:01Z"));
  await page.goto("/member/ngaji-ceria/games/makhraj-master");
  await observeAudio(page);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.clock.runFor(1850);
  await page.getByRole("button", { name: "1", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).audioCalls.speech.length)).toBe(1);
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "1", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).audioCalls.speech.length)).toBe(2);
  const spoken = await page.evaluate(() => (window as any).audioCalls.speech);
  expect(spoken[1]).toBe(spoken[0]);
});

test("pemetaan huruf dan harakat menjaga vokal dengan unit audio yang tersedia", async ({ page, request }) => {
  await page.goto("/member/ngaji-ceria/games");
  const mappings = await page.evaluate(async () => {
    const recitationPath = "/src/features/ngaji-ceria/pages/games/_shared/recitation.ts";
    const listPath = "/src/features/ngaji-ceria/pages/games/harakat-rush/data/harakat-list.ts";
    const lettersPath = "/src/features/ngaji-ceria/data/hijaiyah.ts";
    const { letterRecitation } = await import(/* @vite-ignore */ recitationPath);
    const { HARAKAT_LIST } = await import(/* @vite-ignore */ listPath);
    const { HIJAIYAH_LIST } = await import(/* @vite-ignore */ lettersPath);
    return [...HARAKAT_LIST.map((item: any) => item.symbol), ...HIJAIYAH_LIST.map((item: any) => item.arabic)]
      .map((symbol: string) => ({ symbol, request: letterRecitation(symbol) }));
  });
  expect(mappings[0].request).toBeDefined();
  for (const mapping of mappings) {
    if (!mapping.request) continue;
    if (/[\u064b-\u065f]/.test(mapping.symbol)) expect(mapping.request.question.arabic).toContain(mapping.symbol);
    expect(mapping.request.allowPageFallback).toBe(false);
    const response = await request.get(mapping.request.audioUrl);
    expect(response.ok()).toBeTruthy();
    expect((await response.body()).subarray(0, 4).toString()).toBe("OggS");
  }
});

test("Harakat Rush mempertahankan kombo tertinggi setelah benturan salah", async ({ page }) => {
  await page.goto("/member/ngaji-ceria/games");
  const snapshot = await page.evaluate(async () => {
    const scenePath = "/src/features/ngaji-ceria/pages/games/harakat-rush/phaser/HarakatRushScene.ts";
    const { HarakatRushScene } = await import(/* @vite-ignore */ scenePath);
    let snapshot: any;
    const scene = new HarakatRushScene({ emit: (event: string, value: any) => { if (event === "state") snapshot = value; } });
    // Headless scene: effects do not change the collision/reward rules.
    scene.particles = { explode: () => {} };
    scene.player = { feedback: () => {} };
    scene.cameras = { main: { flash: () => {} } };
    scene.scale = { height: 400 };
    for (let index = 0; index < 5; index++) scene.collect({ harakat: scene.state.target, collected: false });
    scene.collect({ harakat: "not-target", collected: false });
    return snapshot;
  });
  expect(snapshot.combo).toBe(0);
  expect(snapshot.maxCombo).toBe(5);
  expect(snapshot.lives).toBe(2);
});

test("Match Arena mempertahankan bonus kombo ketika sesi berakhir setelah pasangan salah", async ({ page }) => {
  const user = { user_id: "test-member", username: "member", name: "Member", role: "MEMBER" };
  await page.addInitScript((user) => {
    document.cookie = "pengajian_token=member-wiring; path=/; SameSite=Strict";
    sessionStorage.setItem("sambung_ngaji_cached_user", JSON.stringify(user));
  }, user);
  await page.route("**/api/v1/auth/validate-session", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { user } }) }));
  await page.route("**/api/v1/ngaji-ceria/**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: {} }) }));
  const calls: any[] = [];
  await page.route("**/api/v1/ngaji-ceria/leaderboard", (route) => {
    calls.push(route.request().postDataJSON());
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { progress: { xp: 35, gamesPlayed: 1 } } }) });
  });
  await page.clock.install({ time: new Date("2026-10-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-09T12:00:01Z"));
  await page.goto("/member/ngaji-ceria/games/hijaiyah-match-arena");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const ids = await page.locator("[data-card-id]").evaluateAll((cards) => cards.map((card) => card.getAttribute("data-card-id")!));
  const pairs = ids.filter((id) => id.endsWith(":arabic")).map((id) => id.split(":")[0]);
  for (const pair of pairs.slice(0, 5)) {
    await page.locator(`[data-card-id="${pair}:arabic"]`).click();
    await page.locator(`[data-card-id="${pair}:latin"]`).click();
    await page.clock.runFor(1000);
  }
  await page.locator(`[data-card-id="${pairs[5]}:arabic"]`).click();
  await page.locator(`[data-card-id="${pairs[6]}:latin"]`).click();
  await page.clock.runFor(1000);
  await page.clock.fastForward(90_000);
  await expect(page.getByTestId("xp-gained")).toBeVisible();
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0].baseXp).toBe(35);
  expect(calls[0].achievementIds).toContain("qari-cepat");
});

test("ayat game memakai rekaman utuh dan tidak fallback ke bacaan halaman lain", async ({ page, request }) => {
  await page.goto("/member/ngaji-ceria/games");
  const verses = await page.evaluate(async () => {
    const recitationPath = "/src/features/ngaji-ceria/pages/games/_shared/recitation.ts";
    const dataPath = "/src/features/ngaji-ceria/pages/games/juz-amma-speedrun/data/juz-amma-questions.ts";
    const audioPath = "/src/features/ngaji-ceria/services/tilawatiAudio.ts";
    const { verseRecitation } = await import(/* @vite-ignore */ recitationPath);
    const { JUZ_AMMA_VERSES } = await import(/* @vite-ignore */ dataPath);
    const { resolveTilawatiAudio } = await import(/* @vite-ignore */ audioPath);
    return [...JUZ_AMMA_VERSES, { id: "109-4", surahName: "Al-Kafirun", ayahNumber: 4 }].map((verse: any) => {
      const audio = verseRecitation(verse);
      return { id: verse.id, audio, candidates: resolveTilawatiAudio(audio).candidates };
    });
  });
  expect(verses.find((verse: any) => verse.id === "109-4").audio.audioUrl).toContain("109004.mp3");
  for (const verse of verses) {
    expect(verse.audio.allowPageFallback).toBe(false);
    expect(verse.candidates).toEqual([{ url: verse.audio.audioUrl }]);
    if (!verse.audio.audioUrl.startsWith("/")) continue;
    const response = await request.get(verse.audio.audioUrl);
    expect(response.ok(), verse.audio.audioUrl).toBeTruthy();
    expect((await response.body()).subarray(0, 4).toString(), verse.audio.audioUrl).toBe("OggS");
  }
});

test("menuntaskan kuis memicu victory, bonus kombo dan badge satu kali", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-09T12:00:01Z"));
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await observeAudio(page);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  for (let index = 0; index < 10; index++) {
    await page.locator('[data-option-correct="true"]').click();
    await page.clock.runFor(1300);
  }
  await expect(page.getByTestId("xp-gained")).toBeVisible();
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress-events:v1")!));
  expect(events).toHaveLength(1);
  expect(events[0].baseXp).toBe(45);
  expect(events[0].achievementIds).toContain("qari-cepat");
  const sfx = await page.evaluate(() => (window as any).audioCalls.sfx as string[]);
  expect(sfx).toContain("streak");
  expect(sfx.filter((name) => name === "victory")).toHaveLength(1);
  expect(sfx).not.toContain("defeat");
  await page.getByRole("button", { name: "Matikan suara" }).click({ force: true });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress:v1")!).gamesPlayed)).toBe(1);
});

test("kesempatan kedua tidak mengirim reward sebelum sesi benar-benar selesai", async ({ page }) => {
  const calls: any[] = [];
  await page.route("**/api/v1/ngaji-ceria/leaderboard", async (route) => {
    calls.push(route.request().postDataJSON());
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { progress: { xp: 25, gamesPlayed: 1 } } }) });
  });
  await page.goto("/member/ngaji-ceria/games/nur-battle");
  await observeAudio(page);
  await page.evaluate(() => { document.cookie = "pengajian_token=test-revive; path=/; SameSite=Strict"; });
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  for (let index = 0; index < 3; index++) {
    await page.locator('[data-option-correct="false"]').first().click();
    await page.waitForTimeout(1200);
  }
  await expect(page.getByText("Kesempatan Kedua", { exact: true })).toBeVisible();
  expect(calls).toHaveLength(0);
  await expect(page.getByTestId("xp-gained")).toHaveCount(0);
  await page.getByRole("button", { name: "Bismillah", exact: true }).click();
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  expect(calls).toHaveLength(0);
  await page.locator('[data-option-correct="false"]').first().click();
  await expect(page.getByTestId("xp-gained")).toBeVisible();
  await expect.poll(() => calls.length).toBe(1);
  await page.getByRole("button", { name: "Matikan suara" }).click({ force: true });
  expect(calls).toHaveLength(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ngajiceria:progress:v1")!).gamesPlayed)).toBe(1);
});
