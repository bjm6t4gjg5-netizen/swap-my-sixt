import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

// The site is served from the root of the custom domain
// (swap-my-sixt.deich-dynamics.com), so the base path is "/".
// If you ever remove the custom domain and use the plain
// https://<user>.github.io/swap-my-sixt/ URL, set this back to "/swap-my-sixt/".
const BASE = "/";

export default defineConfig({
  base: BASE,
  // host:true exposes the dev server on your LAN; basicSsl serves it over
  // HTTPS so geolocation works when you open it on an iPhone / iPad.
  server: {
    host: true
  },
  plugins: [
    basicSsl(),
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
        "favicon.ico",
        "favicon-16.png",
        "favicon-32.png",
        "favicon.png",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "Swap my Sixt",
        short_name: "Sixt Swap",
        description: "Find the best Sixt station to swap your rental along your route.",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        orientation: "any",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles",
              expiration: { maxEntries: 800, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: "es2020",
    sourcemap: false
  }
});
