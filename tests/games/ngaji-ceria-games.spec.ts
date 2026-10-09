import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/tilawati-editor/published?**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { published: null } }) }));
  await page.route("https://everyayah.com/**", (route) => route.fulfill({ path: "public/audio/tilawati/jilid_6/hal1/hal1-AnNas-ayat1.ogg", contentType: "audio/ogg" }));
});

const games = [
  { id: "juz-amma-speedrun", title: "Juz Amma Speedrun" },
  { id: "ayat-scramble", title: "Ayat Scramble" },
  { id: "ayat-hunter", title: "Ayat Hunter" },
  { id: "doa-dungeon", title: "Doa Dungeon" },
  { id: "nabi-chronicles", title: "Nabi Chronicles" },
  { id: "malaikat-mission", title: "Malaikat Mission" },
  { id: "hijaiyah-match-arena", title: "Hijaiyah Match Arena" },
  { id: "hijaiyah-pop", title: "Hijaiyah Pop!" },
  { id: "harakat-rush", title: "Harakat Rush" },
  { id: "hijaiyah-rush", title: "Hijaiyah Rush" },
  { id: "arabic-wordle", title: "Arabic Wordle" },
  { id: "hijaiyah-2048", title: "Hijaiyah 2048" },
  { id: "quran-quiz-royale", title: "Quran Quiz Royale" },
  { id: "wudhu-flow", title: "Wudhu Flow" },
  { id: "santri-idle", title: "Santri Idle" },
  { id: "sholat-hero", title: "Sholat Hero" },
  { id: "adab-rpg", title: "Jejak Santri" },
  { id: "tajwid-arena", title: "Tajwid Arena" },
  { id: "nur-battle", title: "Nur Battle" },
  { id: "makhraj-master", title: "Makhraj Master" },
  { id: "hijaiyah-beats", title: "Hijaiyah Beats" },
  { id: "tajwid-defense", title: "Tajwid Defense" },
  { id: "tajwid-tetris", title: "Tajwid Tetris" },
] as const;

async function watchForRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") errors.push(`${message.type()}: ${message.text()}`);
  });
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

/** Route game yang dikunci untuk member/umum — hanya super admin yang bisa membuka. */
const LOCKED_GAME_IDS = new Set([
  "tajwid-lab", "tajwid-arena", "tajwid-defense", "tajwid-tetris",
  "santri-idle", "adab-rpg", "doa-dungeon", "nabi-chronicles",
  "malaikat-mission", "wudhu-flow", "sholat-hero", "hijaiyah-rush",
  "hijaiyah-match-arena", "hijaiyah-match",
]);

/** Seed sesi super admin: cookie token + cached user + mock validasi sesi backend. */
async function seedSuperAdmin(page: Page) {
  await seedSession(page, "SUPER_ADMIN");
}

/** Seed sesi member (sudah login, bukan super admin). */
async function seedMember(page: Page) {
  await seedSession(page, "MEMBER");
}

async function seedSession(page: Page, role: string) {
  const user = {
    user_id: `test-${role.toLowerCase()}`,
    username: role === "SUPER_ADMIN" ? "superadmin" : "member",
    name: role === "SUPER_ADMIN" ? "Super Admin" : "Member",
    role,
  };
  await page.addInitScript((seeded) => {
    document.cookie = "pengajian_token=test-token; path=/; SameSite=Strict";
    localStorage.setItem("sambung_ngaji_cached_user", JSON.stringify(seeded));
  }, user);
  await page.route("**/api/v1/auth/validate-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { user }, message: "ok" }),
    });
  });
  await page.route("**/api/v1/ngaji-ceria/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/progress")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { xp: 0, totalScore: 0, gamesPlayed: 0, coins: 0, currentStreak: 0, dailyDate: new Date().toISOString().slice(0, 10), dailyGamesPlayed: 0, dailyTotalScore: 0, dailyClaimedMissions: [], achievements: [] }, message: "ok" }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { entries: [] }, message: "ok" }) });
  });
}

async function dismissTutorial(page: Page) {
  const skip = page.getByRole("button", { name: "Lewati", exact: true });
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await skip.isVisible().catch(() => false)) { await skip.click(); return; }
    await page.waitForTimeout(100);
  }
}

test("daftar game menampilkan hub mode yang tidak redundan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games");
  await expect(page.getByText("Ritme Ngaji", { exact: true })).toBeVisible();
  await expect(page.getByText("Quiz Ngaji", { exact: true })).toBeVisible();
  await expect(page.getByText("Puzzle Huruf", { exact: true })).toBeVisible();
  await expect(page.getByText("Tajwid Lab", { exact: true })).toBeVisible();
  await expect(page.getByText("Pesantren Life", { exact: true })).toBeVisible();
  await expect(page.getByText("Jejak Santri", { exact: true })).toBeVisible();
  await expect(page.getByText("Doa Dungeon", { exact: true })).toBeVisible();
  await expect(page.getByText("Nabi Chronicles", { exact: true })).toBeVisible();
  await expect(page.getByText("Malaikat Mission", { exact: true })).toBeVisible();
  await expect(page.getByText("Balon Hijaiyah", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Pasang Huruf", { exact: true })).toHaveCount(0);
  noErrors();
});

test("papan skor menampilkan progres game baru", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/leaderboard");
  await expect(page.getByText("Papan Skor", { exact: true })).toBeVisible();
  await expect(page.getByText("Ayat Hunter", { exact: true })).toBeVisible();
  await expect(page.getByText("Doa Dungeon", { exact: true })).toBeVisible();
  await expect(page.getByText("Nabi Chronicles", { exact: true })).toBeVisible();
  await expect(page.getByText("Malaikat Mission", { exact: true })).toBeVisible();
  await expect(page.getByText("Tajwid Tetris", { exact: true })).toBeVisible();
  noErrors();
});

test("misi harian menampilkan reward XP", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria");
  await expect(page.getByText("Misi Harian", { exact: true })).toBeVisible();
  await expect(page.getByText("+50 XP", { exact: false })).toBeVisible();
  noErrors();
});

const hubs = [
  { id: "ritme-ngaji", title: "Ritme Ngaji", modes: ["Harakat Rush", "Makhraj Master", "Hijaiyah Beats"] },
  { id: "quiz-ngaji", title: "Quiz Ngaji", modes: ["Juz Amma Speedrun", "Quran Quiz Royale", "Nur Battle"] },
  { id: "puzzle-huruf", title: "Puzzle Huruf", modes: ["Arabic Wordle", "Ayat Scramble", "Hijaiyah 2048", "Ayat Hunter"] },
  { id: "tajwid-lab", title: "Tajwid Lab", modes: ["Tajwid Arena", "Tajwid Defense", "Tajwid Tetris"] },
] as const;

for (const hub of hubs) {
  test(`${hub.title} menampilkan mode terkait`, async ({ page }) => {
    const noErrors = await watchForRuntimeErrors(page);
    if (LOCKED_GAME_IDS.has(hub.id)) await seedSuperAdmin(page);
    await page.goto(`/member/ngaji-ceria/games/${hub.id}`);
    await expect(page.getByRole("heading", { name: hub.title })).toBeVisible();
    for (const mode of hub.modes) await expect(page.getByText(mode, { exact: true })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    noErrors();
  });
}

for (const game of games) {
  test(`${game.title} dapat dimulai di mobile tanpa overflow`, async ({ page }) => {
    const noErrors = await watchForRuntimeErrors(page);
    if (LOCKED_GAME_IDS.has(game.id)) await seedSuperAdmin(page);
    await page.goto(`/member/ngaji-ceria/games/${game.id}`);
    if (game.id === "santri-idle") {
      await expect(page.getByText("Kas pesantren", { exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: game.title })).toBeVisible();
      if (["harakat-rush", "hijaiyah-pop", "wudhu-flow"].includes(game.id)) await dismissTutorial(page);
      await page.getByRole("button", { name: "Mulai", exact: true }).click();
    }
    await page.waitForTimeout(game.id === "harakat-rush" ? 1800 : 500);
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    noErrors();
  });
}

test("Juz Amma menjawab soal dan menampilkan feedback", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.locator('[data-option-index="0"]').click();
  await expect(page.locator("[aria-live]")).toContainText(/Tepat|Belum tepat/);
  noErrors();
});

test("permainan bisa dijeda dan dilanjutkan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.getByRole("button", { name: "Jeda permainan" }).click();
  await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Lagi Jeda" })).toBeVisible();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  noErrors();
});

test("Juz Amma mencapai game over dan menyimpan skor terbaik", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/juz-amma-speedrun");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.locator('[data-option-correct="true"]').click();
  await page.waitForTimeout(1250);
  for (let answer = 0; answer < 3; answer++) {
    await page.locator('[data-option-correct="false"]').first().click();
    await page.waitForTimeout(1250);
  }
  await expect(page.getByRole("dialog", { name: "Sesi Selesai" })).toBeVisible();
  await expect(page.getByTestId("game-over-score")).not.toHaveText("0");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ngajiceria:best:juz-amma-speedrun"))).not.toBeNull();
  await page.getByRole("button", { name: "Main Lagi", exact: true }).click();
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  noErrors();
});

test("Match Arena membalik dua kartu", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/hijaiyah-match-arena");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const cards = page.locator("button[data-card-id]");
  await cards.nth(0).click();
  await cards.nth(1).click();
  await expect(cards.nth(0)).toHaveAttribute("aria-label", /Kartu|, cocok/);
  noErrors();
});

test("Match Arena menyelesaikan papan dan bisa mengulang", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/hijaiyah-match-arena");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const pairIds = await page.locator("button[data-card-id]").evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute("data-card-id")?.split(":")[0]).filter((value): value is string => Boolean(value)))]);
  for (const pairId of pairIds) {
    await page.locator(`[data-card-id="${pairId}:arabic"]`).click();
    await page.locator(`[data-card-id="${pairId}:latin"]`).click();
    await page.waitForTimeout(900);
  }
  await expect(page.getByRole("dialog", { name: "Papan Selesai!" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ngajiceria:best:hijaiyah-match-arena:solo"))).not.toBeNull();
  await page.getByRole("button", { name: "Main Lagi", exact: true }).click();
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  noErrors();
});

test("Match Arena battle memberikan giliran kepada AI", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/hijaiyah-match-arena");
  await page.getByRole("button", { name: "Lawan AI", exact: true }).click();
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const cards = page.locator("button[data-card-id]");
  await cards.nth(0).click();
  await cards.nth(1).click();
  await expect(page.getByText("AI · giliran", { exact: true })).toBeVisible();
  noErrors();
});

test("Hijaiyah Pop memberi skor saat target disentuh", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/hijaiyah-pop");
  await dismissTutorial(page);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.waitForTimeout(700);
  await page.locator('button[data-balloon-target="true"]').first().dispatchEvent("pointerdown", { pointerType: "touch", button: 0 });
  await expect(page.getByTestId("score")).not.toHaveText("0");
  noErrors();
});

test("Harakat Rush merespons kontrol tiga lane", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/harakat-rush");
  await dismissTutorial(page);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.getByRole("button", { name: "Kiri" })).toBeEnabled();
  await page.getByRole("button", { name: "Kiri" }).click();
  await expect(page.getByRole("button", { name: "Kiri" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Kanan" }).click();
  await expect(page.getByRole("button", { name: "Kanan" })).toHaveAttribute("aria-pressed", "true");
  noErrors();
});

test("Arabic Wordle menerima lima huruf Arab dan tebakan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/arabic-wordle");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  for (const letter of ["م", "د", "ر", "س", "ة"]) await page.getByRole("button", { name: letter, exact: true }).click();
  await page.getByRole("button", { name: "Tebak", exact: true }).click();
  await expect(page.locator("[aria-label='Papan Arabic Wordle']")).toBeVisible();
  await expect(page.locator("[aria-label='Papan Arabic Wordle']").first()).toContainText("مدرسة");
  noErrors();
});

test("Hijaiyah 2048 merespons gerakan papan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/hijaiyah-2048");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const board = page.locator('[aria-label="Papan Hijaiyah 2048"]');
  const box = await board.boundingBox();
  if (!box) throw new Error("Papan 2048 tidak memiliki ukuran");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 24, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  // Dua tile awal acak; arah pertama bisa no-op bila keduanya sudah di tepi.
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText(/Gerakan [1-9]/)).toBeVisible();
  await expect(board).toBeVisible();
  noErrors();
});

test("Ayat Hunter menampilkan target dan arena pencarian", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/ayat-hunter");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.getByTestId("hunter-target")).toBeVisible();
  await expect(page.locator('[aria-label="Peta Ayat Hunter"]')).toBeVisible();
  await expect(page.getByTestId("hunter-3d")).toBeVisible();
  const collectButton = page.getByRole("button", { name: "Ambil kata" });
  await expect(collectButton).toBeVisible();
  await expect(collectButton).toBeDisabled();
  const collectButtonInViewport = await collectButton.evaluate((button) => {
    const rect = button.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });
  expect(collectButtonInViewport).toBe(true);
  await expect(page.locator("header")).toHaveCount(0);
  const originalViewport = page.viewportSize()!;
  for (const height of [568, 480]) {
    await page.setViewportSize({ width: originalViewport.width, height });
    await expect.poll(() => collectButton.evaluate((button) => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return rect.top >= 0 && rect.bottom <= window.innerHeight && button.contains(hit);
    })).toBe(true);
  }
  await page.setViewportSize(originalViewport);
  const map = page.getByTestId("hunter-3d");
  const currentCell = await map.getAttribute("data-hunter-cell");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => map.getAttribute("data-hunter-cell")).not.toBe(currentCell);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => map.getAttribute("data-hunter-cell")).toBe(currentCell);
  noErrors();
});

test("Doa Dungeon menampilkan peta lantai dan pilihan doa", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Peta Doa Dungeon"]')).toBeVisible();
  await expect(page.getByText(/Monster ·/)).toBeVisible();
  await expect(page.locator("button[data-option-correct]").first()).toBeVisible();
  noErrors();
});

test("Doa Dungeon mengurangi HP monster dan pemain sesuai jawaban", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.locator('[data-option-correct="true"]').click();
  await expect(page.getByTestId("battle-monster-hp")).toHaveText(/75 \/ 100 HP/);
  await page.waitForTimeout(1000);
  await page.locator('[data-option-correct="false"]').first().click();
  await expect(page.getByTestId("battle-player-hp")).toHaveText(/80 \/ 100 HP/);
  noErrors();
});

test("Doa Dungeon menghasilkan defeat saat HP pemain habis", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  for (let hit = 0; hit < 5; hit += 1) {
    await page.locator('[data-option-correct="false"]').first().click();
    if (hit < 4) await page.waitForTimeout(1000);
  }
  await expect(page.getByRole("dialog", { name: "Jangan Menyerah!" })).toBeVisible();
  await page.getByRole("button", { name: "Lewati dulu", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Defeat" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("HP pemain habis", { exact: false })).toBeVisible();
  noErrors();
});

test("Nabi Chronicles berpindah chapter setelah pilihan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/nabi-chronicles");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.getByRole("article").getByRole("heading", { name: "Kapal Kesabaran" })).toBeVisible();
  await page.locator("button").filter({ hasText: "Tetap sabar" }).click();
  await expect(page.getByText("Chapter 2/5", { exact: true })).toBeVisible();
  noErrors();
});

test("Malaikat Mission memberi feedback jawaban", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/malaikat-mission");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Jalur Pos Langit"]')).toBeVisible();
  await expect(page.getByText("Mission Brief", { exact: false })).toBeVisible();
  await page.locator('[data-option-index="0"]').click();
  await expect(page.locator("[aria-live]")).toContainText(/Benar|Belum tepat|Waktu/);
  noErrors();
});

test("Malaikat Mission mengubah stamina dan cahaya saat paket diantar", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/malaikat-mission");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.locator('[data-option-correct="true"]').click();
  await expect(page.getByTestId("battle-monster-hp")).toHaveText(/75 \/ 100 Cahaya/);
  await page.waitForTimeout(1000);
  await page.locator('[data-option-correct="false"]').first().click();
  await expect(page.getByTestId("battle-player-hp")).toHaveText(/80 \/ 100 Stamina/);
  noErrors();
});

test("Malaikat Mission mencapai victory setelah semua paket terkirim", async ({ page }) => {
  test.setTimeout(120_000);
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/malaikat-mission");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  for (let mission = 0; mission < 9; mission += 1) {
    for (let hit = 0; hit < 4; hit += 1) {
      await page.locator('[data-option-correct="true"]').click();
      await page.waitForTimeout(1000);
    }
  }
  await expect(page.getByRole("dialog", { name: "Victory!" })).toBeVisible();
  noErrors();
});

test("Quran Quiz Royale memulai ronde melawan bot lokal", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/quran-quiz-royale");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Saf Podium Masjid"]')).toBeVisible();
  await expect(page.getByText("Pemain tersisa", { exact: true })).toBeVisible();
  await page.locator('[data-option-index="0"]').click();
  await expect(page.locator("[aria-live]")).toContainText(/Tepat|salah|eliminasi/);
  noErrors();
});

test("Wudhu Flow menerima langkah pertama sesuai urutan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/wudhu-flow");
  await dismissTutorial(page);
  await page.getByRole("button", { name: "Ritme", exact: true }).click();
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.getByText("0/10 langkah", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Langkah 1: Niat", exact: true }).click();
  await expect(page.getByText("1/10 langkah", { exact: true })).toBeVisible();
  noErrors();
});

test("Santri Idle bisa membeli bangunan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/santri-idle");
  await expect(page.getByText("Santri Idle", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Bangun/ }).first().click();
  await expect(page.getByText("Lv.1", { exact: true })).toBeVisible();
  noErrors();
});

test("Sholat Hero memulai simulasi waktu", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/sholat-hero");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.getByText("04:00", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sholat", exact: true }).first()).toBeDisabled();
  noErrors();
});

test("Adab RPG mengubah scene setelah memilih pilihan", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/adab-rpg");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const firstChoice = page.locator("button").filter({ hasText: "Menyapu area masjid" });
  await firstChoice.click();
  await expect(page.getByText("Kelas pertama", { exact: true })).toBeVisible();
  noErrors();
});

test("Tajwid Arena menampilkan soal dan hand kartu", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/tajwid-arena");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Meja Majelis Tajwid"]')).toBeVisible();
  await expect(page.getByText("Soal tajwid", { exact: true })).toBeVisible();
  await page.locator("button").filter({ hasText: /Iqlab|Idgham|Izhar|Ikhfa/ }).first().click();
  await expect(page.getByText(/Hand kamu/)).toBeVisible();
  noErrors();
});

test("Nur Battle practice menampilkan pemain dan soal", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/nur-battle");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Menara Lentera Nur"]')).toBeVisible();
  await expect(page.getByText("Pemain tersisa", { exact: true })).toBeVisible();
  await expect(page.getByText(/Ronde 1 · 1\/10/)).toBeVisible();
  await page.locator('[data-option-index="0"]').click();
  noErrors();
});

test("Nur Battle menyediakan fallback multiplayer offline", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/nur-battle");
  await expect(page.getByText("Mode multiplayer opsional", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cari room online", exact: true }).click();
  await expect(page.getByText("Offline fallback aktif.", { exact: true })).toBeVisible();
  noErrors();
});

test("Makhraj Master dan Hijaiyah Beats menerima kontrol lane", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/makhraj-master");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.goto("/member/ngaji-ceria/games/hijaiyah-beats");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  noErrors();
});

test("Tajwid Defense menampilkan slot tower dan gold", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/tajwid-defense");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.getByText("50g", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "إ 50g" }).click();
  await page.getByRole("button", { name: "+" }).first().click();
  noErrors();
});

test("Tajwid Tetris menerima kontrol papan dan menampilkan pelajaran", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/tajwid-tetris");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Papan Tajwid Tetris"]')).toBeVisible();
  await expect(page.getByText("Pelajaran blok aktif", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Putar blok" }).click();
  await page.getByRole("button", { name: "Jatuhkan blok" }).click();
  await expect(page.getByTestId("score")).toBeVisible();
  noErrors();
});

test("Ayat Scramble tap memindahkan kata dan hint mengunci posisi", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/ayat-scramble");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  const words = page.locator('button[aria-label*="pindahkan kata"]');
  await words.first().click();
  await expect(page.getByText("Hint (2)", { exact: true })).toBeVisible();
  await page.getByText("Hint (2)", { exact: true }).click();
  await expect(page.getByText("Hint (1)", { exact: true })).toBeVisible();
  noErrors();
});

test("Hanya Doa Dungeon yang memakai arena 3D fight", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Arena Quiz Battle"]')).toBeVisible();
  for (const id of ["tajwid-arena", "malaikat-mission", "nur-battle", "quran-quiz-royale", "hijaiyah-match-arena"]) {
    await page.goto(`/member/ngaji-ceria/games/${id}`);
    await page.getByRole("button", { name: "Mulai", exact: true }).click();
    await expect(page.locator('[aria-label="Arena Quiz Battle"]')).toHaveCount(0);
  }
  noErrors();
});

test("Tamu melihat layar kunci pada game khusus super admin", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await expect(page.getByTestId("game-locked")).toBeVisible();
  await expect(page.getByText("Masuk untuk Akses Penuh", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[aria-label="Arena Quiz Battle"]')).toHaveCount(0);
  await page.goto("/member/ngaji-ceria/games/tajwid-lab");
  await expect(page.getByTestId("game-locked")).toBeVisible();
  noErrors();
});

test("Tamu melihat badge kunci, super admin tidak", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games");
  for (const id of ["tajwid-lab", "santri-idle", "adab-rpg", "doa-dungeon", "nabi-chronicles", "malaikat-mission"]) {
    await expect(page.getByTestId(`game-lock-${id}`)).toBeVisible();
  }
  await expect(page.getByTestId("game-lock-ritme-ngaji")).toHaveCount(0);
  await expect(page.getByTestId("game-lock-quiz-ngaji")).toHaveCount(0);
  await expect(page.getByTestId("game-lock-puzzle-huruf")).toHaveCount(0);
  await expect(page.getByTestId("game-lock-hijaiyah-pop")).toHaveCount(0);
  noErrors();
});

test("Super admin membuka semua game tanpa badge kunci", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedSuperAdmin(page);
  await page.goto("/member/ngaji-ceria/games");
  await expect(page.locator('[data-testid^="game-lock-"]')).toHaveCount(0);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await expect(page.getByTestId("game-locked")).toHaveCount(0);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Peta Doa Dungeon"]')).toBeVisible();
  noErrors();
});

test("Member membuka game yang terkunci untuk tamu", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await seedMember(page);
  await page.goto("/member/ngaji-ceria/games/doa-dungeon");
  await expect(page.getByTestId("game-locked")).toHaveCount(0);
  await page.getByRole("button", { name: "Mulai", exact: true }).click();
  await expect(page.locator('[aria-label="Peta Doa Dungeon"]')).toBeVisible();
  await page.goto("/member/ngaji-ceria/games");
  await expect(page.locator('[data-testid^="game-lock-"]')).toHaveCount(0);
  noErrors();
});

test("Tamu mengetuk kartu terkunci melihat ajakan masuk", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games");
  await page.locator("button").filter({ hasText: "Doa Dungeon" }).first().click();
  await expect(page.getByRole("dialog", { name: "Konten Terkunci" })).toBeVisible();
  await expect(page.getByText("Masuk untuk Akses Penuh", { exact: true })).toBeVisible();
  noErrors();
});

test("Tamu melihat kunci per-mode di Puzzle Huruf", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/games/puzzle-huruf");
  await expect(page.getByTestId("hub-lock-ayat-scramble")).toBeVisible();
  await expect(page.getByTestId("hub-lock-hijaiyah-2048")).toBeVisible();
  await expect(page.getByTestId("hub-lock-ayat-hunter")).toBeVisible();
  await expect(page.getByTestId("hub-lock-arabic-wordle")).toHaveCount(0);
  await page.getByTestId("hub-lock-ayat-scramble").click();
  await expect(page.getByRole("dialog", { name: "Konten Terkunci" })).toBeVisible();
  noErrors();
});

test("Tamu melihat kunci Jilid 3+ dan Segera Hadir Jilid 6", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/path");
  await expect(page.getByText("Segera Hadir").first()).toBeVisible();
  await page.getByAltText("Jilid 3").click();
  await expect(page.getByRole("dialog", { name: "Konten Terkunci" })).toBeVisible();
  await page.goto("/member/ngaji-ceria/quiz");
  await page.getByAltText("Kitab Mad & Panjang Jilid 3").click();
  await expect(page.getByRole("dialog", { name: "Konten Terkunci" })).toBeVisible();
  noErrors();
});

test("Profil santri menampilkan lencana dan sesi", async ({ page }) => {
  const noErrors = await watchForRuntimeErrors(page);
  await page.goto("/member/ngaji-ceria/profile");
  await expect(page.locator('[aria-label="Kartu identitas santri"]')).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Progress menuju pangkat berikutnya" })).toBeVisible();
  await expect(page.getByText("Lemari Lencana", { exact: true })).toBeVisible();
  await expect(page.getByText("Masuk / Daftar", { exact: true })).toBeVisible();
  await seedMember(page);
  await page.goto("/member/ngaji-ceria/profile");
  await expect(page.getByText("Keluar Aplikasi", { exact: true })).toBeVisible();
  noErrors();
});
