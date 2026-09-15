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
          "apple-touch-icon.png",
          "apple-touch-icon-dev.png",
          "favicon-32x32.png",
          "favicon-32x32-dev.png",
          "favicon-16x16.png",
          "pwa-192x192.png",
          "pwa-512x512.png",
        ],
        manifest: {
          name: isDev ? "Sambung Ngaji (DEV)" : "Sambung Ngaji",
          short_name: isDev ? "Sambung Ngaji DEV" : "Sambung Ngaji",
          description:
            "Absensi, database, dan pengajian Latukan dalam satu aplikasi.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          theme_color: isDev ? "#DC2626" : "#E7ECE8",
          background_color: "#E7ECE8",
          icons: isDev
            ? [
                {
                  src: "apple-touch-icon-dev.png",
                  sizes: "180x180",
                  type: "image/png",
                },
                {
                  src: "favicon-32x32-dev.png",
                  sizes: "32x32",
                  type: "image/png",
                },
                {
                  src: "favicon-dev.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                },
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
              ]
            : [
                {
                  src: "apple-touch-icon.png",
                  sizes: "180x180",
                  type: "image/png",
                },
                {
                  src: "favicon-32x32.png",
                  sizes: "32x32",
                  type: "image/png",
                },
                {
                  src: "favicon.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                },
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
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
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
