import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "favicon.svg",
          "favicon-dev.svg",
          "apple-touch-icon-180x180.png",
          "pwa-192x192.png",
          "pwa-512x512.png",
          "favicon-dev-192x192.png",
          "favicon-dev-512x512.png",
          "maskable-icon-512x512.png",
        ],
        manifest: {
          name: isDev ? "Sambung Ngaji (DEV)" : "Sambung Ngaji",
          short_name: isDev ? "Ngaji DEV" : "Sambung Ngaji",
          description:
            "Absensi, database, dan pengajian Latukan dalam satu aplikasi.",
          id: "/",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          theme_color: isDev ? "#DC2626" : "#E7ECE8",
          background_color: "#E7ECE8",
          icons: isDev
            ? [
                {
                  src: "favicon-dev-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "favicon-dev-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
                {
                  src: "favicon-dev.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                },
              ]
            : [
                {
                  src: "pwa-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
                {
                  src: "maskable-icon-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
                {
                  src: "favicon.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                },
              ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
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
  };
});
