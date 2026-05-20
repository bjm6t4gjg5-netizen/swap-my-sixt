# Sixt Swap

A web-based navigation app that shows you Sixt rental stations along your route and how likely each one is to have the car class you want. Designed to be used while you're driving a rental you'd like to swap.

Built as a static PWA — no build step, no backend, no API keys. Install to your iPhone or iPad home screen and it behaves like a native app.

## What it does

- Asks for your location and lets you search any destination worldwide.
- Computes the fastest driving route via the public OSRM server.
- Filters Sixt stations within ~2–8 km of the corridor (width scales with route length).
- Scores each station 0–100% for the car class you select (Economy → Compact → SUV → Premium → Luxury → Sport → Convertible → Electric → Van).
- Lets you re-route through any station with one tap.
- "Open in Maps" hands off to Apple Maps (iOS) or Google Maps (other).
- Navigation mode tracks your location live and keeps the screen awake.

## How the "likelihood" works

Sixt has no public availability API. The probability is a **heuristic**, not a reservation. It combines:

- **Branch type** (airport > major train station > city > suburb > rural)
- **Fleet tier** (XL/L/M/S — based on what's known about each branch)
- **Car-class fit** (premium/sport biased toward airports + big cities; electric biased toward Nordics, German hubs, west coast US)
- **Time of day & day of week** (closed Mon–Fri branches drop sharply on weekends; off-hours penalty)

Score thresholds:
- 🟢 ≥ 65% — recommended
- 🟡 35–64% — possible, phone ahead
- 🔴 < 35% — long shot, skip unless confirmed

Always call the branch before detouring more than ~20 minutes.

## Deploy on GitHub Pages (5 minutes)

1. Create a new repository on GitHub (e.g. `sixt-swap`).
2. Copy every file from this folder into the repo root:
   ```
   index.html
   app.js
   stations.js
   manifest.json
   sw.js
   icon-192.png
   icon-512.png
   icon-maskable-512.png
   README.md
   ```
3. Commit and push to `main`.
4. In the repo, go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: main / (root)**, click **Save**.
6. Wait ~30 seconds. Your site is live at `https://bjm6t4gjg5-netizen.github.io/swap-my-sixt/`.

## Add to iPhone / iPad home screen

1. Open the URL above in **Safari** (not Chrome — Chrome on iOS can't install PWAs).
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**.

The app now lives on your home screen with its own icon, no Safari URL bar, full-screen — like a native nav app.

## Add to Android home screen

1. Open the URL in **Chrome**.
2. Tap the three-dot menu → **Install app** (or "Add to Home screen").

## Privacy

- Your location stays on your device. It's only sent to:
  - **OSRM** (`router.project-osrm.org`) — for routing, as two coordinate pairs.
  - **Nominatim** (`nominatim.openstreetmap.org`) — for search queries you type.
  - **CARTO** (`basemaps.cartocdn.com`) — for map tiles at your current view.
- Nothing is stored on any server. Settings (preferred car class) are saved in your browser's `localStorage`.

## Limits to know about

- **OSRM demo server is rate-limited.** If routing fails repeatedly, wait a minute. For heavy use, host your own OSRM (Docker image is available) and change `OSRM` in `app.js`.
- **Nominatim has a 1-request-per-second policy** — fine for personal use, but again you can self-host or swap to another geocoder if you ever publish this widely.
- **Station dataset is curated and approximate.** ~150 stations covering Germany densely plus major hubs worldwide. Add/edit entries in `stations.js`.

## Customising

- **More stations?** Append to `stations.js`. Each needs `lat`, `lng`, `fleet` (XL/L/M/S), `premium` (0–1), `electric` (0–1), `type` (airport/train/city/suburb/rural), `hours`.
- **Different map style?** Swap the tile URL in `app.js` (`initMap` method). CARTO has Voyager, Positron, dark variants; Stadia, Stamen, and OSM-default also work.
- **Different scoring?** All weights are in the `computeScore` function in `app.js`.

## Stack

- Vue 3 (CDN, no build)
- Leaflet 1.9.4
- CARTO Voyager tiles
- OSRM public routing API
- Nominatim public geocoding API
- Plain CSS with CSS variables (Apple Maps light palette)

No npm, no bundler, no transpilation. Just three files and some PNGs.
