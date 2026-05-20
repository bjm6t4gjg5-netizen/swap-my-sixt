# Swap my Sixt — v2

A navigation web app that helps you swap a Sixt rental into the car you
actually want. Plan a route, see every Sixt station along it, and get a live
probability for each one having your target class — then research cars,
stations, and manage your current booking.

Built with **Svelte 4 + TypeScript + Vite**, deployed automatically to GitHub
Pages by GitHub Actions. Installs to iPhone / iPad / Android home screens as a
PWA.

## Features

**Navigate tab** — Apple-Maps-style route planning. Enter a start and
destination (type an address or tap "Current location"), the app finds the
fastest route via OSRM and overlays every Sixt station in the corridor,
colour-coded by how likely it has your car. Tap a station to re-route through
it. "GO" starts live location tracking.

**Booking tab** — Enter your Sixt booking once (reference, pick-up station,
dates, booked class, and the car you were actually given). The app shows the
status — *Reserved*, *Class matched*, or *Wrong class* — and if there's a
mismatch it ranks the nearest stations most likely to have the class you
booked, so you can drive over and swap.

**Cars tab** — The full Sixt class catalogue. Browse all 18 classes and the
models inside each, or search by brand/model ("BMW M3", "Tesla", "Golf"). Pick
a class as your *target* and the whole app scores against it.

**Stations tab** — All ~150 stations worldwide, searchable, filterable by
country, sortable by best odds / A–Z / nearest. Tap any station to plan a
route there.

## How the "likelihood" works

Sixt has no public availability API, so the percentage is a **heuristic**, not
a reservation. It combines branch type (airport > train > city > suburb >
rural), fleet-size tier, how well the car class fits that branch, and the time
of day / day of week (a Mon–Fri branch drops sharply on a Sunday). Buckets:

- 🟢 **≥ 65 %** — recommended
- 🟡 **35–64 %** — possible, phone ahead
- 🔴 **< 35 %** — long shot, skip unless confirmed

Always call the branch before a long detour.

## Deploy

This repo deploys itself. Once set up, every push to `main` triggers a build
and publish via `.github/workflows/deploy.yml`.

### One-time setup

1. Push the code to GitHub (commands below).
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. That's it. The next push builds and deploys automatically.

The site goes live at `https://bjm6t4gjg5-netizen.github.io/swap-my-sixt/`.

> The Vite `base` is set to `/swap-my-sixt/` in `vite.config.ts`. If you rename
> the repo, change that value to match.

### Local development

```bash
npm install
npm run dev      # http://localhost:5173/swap-my-sixt/
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run check    # type-check the whole project
```

Requires Node 18+ (the CI uses Node 20).

## Add to your home screen

**iPhone / iPad:** open the URL in **Safari** → Share button → **Add to Home
Screen**. Chrome on iOS cannot install PWAs.

**Android:** open in Chrome → menu → **Install app**.

It then runs full-screen with its own icon, like a native app.

## Project structure

```
src/
  main.ts                 entry, registers the service worker
  App.svelte              shell + tab switching
  app.css                 global tokens (Apple Maps light palette)
  lib/
    types.ts              shared TypeScript types
    stations.ts           ~150-station dataset
    cars.ts               18 classes + representative models
    heuristic.ts          availability scoring + route filtering
    geo.ts                haversine, point-to-segment, formatters
    routing.ts            OSRM client
    geocoding.ts          Nominatim search + reverse geocode
    store.ts              Svelte stores (booking, prefs, cross-tab nav)
  components/
    Header.svelte         brand + tab bar
    MapView.svelte        the Navigate tab
    RoutePanel.svelte     from/to inputs with autocomplete
    BottomSheet.svelte    draggable sheet
    BookingView.svelte    the Booking tab
    CarsView.svelte       the Cars tab
    StationsView.svelte   the Stations tab
    StationDetail.svelte  station detail card
    StationListItem.svelte / ProbabilityBadge.svelte / ClassPicker.svelte
.github/workflows/deploy.yml   build + deploy to Pages
```

## Tech & data sources

- **Svelte 4 + TypeScript + Vite 5** — static SPA, no backend.
- **Leaflet 1.9** with **CARTO Voyager** tiles — the light map.
- **OSRM** public demo server — fastest-route calculation.
- **Nominatim** (OpenStreetMap) — address search & reverse geocoding.
- **vite-plugin-pwa** — manifest + service worker, offline tile caching.

Everything stays on your device. Your booking and preferences live in
`localStorage`; coordinates are only sent to OSRM/Nominatim/CARTO to draw the
map and route.

## Limits to know

- The **OSRM and Nominatim demo servers are rate-limited** — fine for personal
  use; self-host if you publish this widely.
- The **station dataset is curated and approximate** (~150 branches, densest
  in Germany). Edit `src/lib/stations.ts` to add your own.
- **Availability is an estimate**, not a Sixt feed. Treat it as guidance.
