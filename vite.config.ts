import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "prompt": user diberi tahu + tombol muat ulang saat versi baru ada.
      // Jangan autoUpdate: user perlu sadar kapan UI berubah.
      registerType: "prompt",
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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-excel": ["exceljs"],
          "vendor-pdf": ["jspdf", "jspdf-autotable"],
        },
      },
    },
  },
});
