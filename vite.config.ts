import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Manajemen Pengajian",
        short_name: "Pengajian",
        description: "Kelola jamaah, absensi, dan pembinaan dalam satu tempat.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/manajemen-pengajian-five\.vercel\.app\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "app-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 hari
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // agar bisa dites saat `npm run dev`
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
