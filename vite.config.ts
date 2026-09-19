import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Increase max file size to cache (pdf chunk 483KB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
