import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/games",
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:5177", trace: "retain-on-failure" },
  projects: [
    { name: "mobile-360", use: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "mobile-428", use: { viewport: { width: 428, height: 926 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: "npm run dev -- --host 127.0.0.1 --port 5177 --strictPort", url: "http://127.0.0.1:5177", reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
