# Swap my Sixt — v3.4

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

**Target picker** — one shared control across the app for *what you're hunting
for*. Pick a whole class, search for a **specific car** (e.g. "BMW M3"), or
**reset to "Any car"** to score stations by overall fleet. Every tab's
percentages update to whatever you choose.

**Booking tab** — Enter your Sixt booking once. Instead of guessing a class,
you type the **ACRISS / SIPP code** from your confirmation (e.g. `PDAR`) and
the app decodes it — category, body, transmission, fuel — and shows what you
booked, with a car illustration. Add the "… or similar" example model, the
pick-up station (searchable), dates, and the car you were actually given. The
app shows the status — *Reserved*, *Class matched*, or *Wrong class* — and on
a mismatch ranks the nearest stations likely to have the class you booked.

**Negotiation mode** — at the counter, log every car they offer you plus any
car you can see sitting on the lot. Each is ranked by value tier against your
booked class (▲ upgrade / ▼ downgrade), and a live strategy line tells you
whether to accept, hold out, or point at a specific better car and ask for it.

**Strategy one-pager** — once a route is planned, print a clean PDF: route
summary, your target, recommended swap stops and a full ranked table of every
Sixt station along the way. A paper reference for the drive.

**Route alternatives** — like Apple Maps, the planner returns up to three
routes. Each shows its distance and drive time; tap to compare, and the Sixt
stations re-rank for whichever route you pick.

**Send to Maps** — the app doesn't try to be a navigator. The "Send to Maps"
button (and every station's detail) opens a chooser: Apple Maps, Google Maps,
or Share/AirDrop the next stop to a friend or a second device. Real driving
nav stays with the app that does it best.

**Ask the analyst** — a chat bubble (bottom-right) opens "Lucas", an
AI rental analyst powered by Claude. He sees your booking and target and
gives swap advice. The Anthropic API key is entered in-app and stored only in
your browser — never bundled or committed. Replace `public/lucas.jpg` with a
real photo for his avatar.

The **Cars** tab also has a built-in **ACRISS / SIPP code guide** with a live
decoder, and search understands body-type terms — "limousine", "avant",
"kombi", "cabrio" — alongside brand and model names.

**Cars tab** — The full Sixt class catalogue as a card grid, each class drawn
as its own car illustration. Tap a card for the models inside, the ACRISS
code, and a "set as target" button. Search by brand/model ("BMW M3", "Tesla",
"Golf"). Your *target* class drives scoring across the whole app.

**Stations tab** — All ~150 stations worldwide with a **List ↔ Map toggle**.
List mode is searchable, country-filterable, and sortable by best odds / A–Z /
nearest. Map mode drops colour-coded pins for every station in view. Tap any
station for details, a route, or **Phone** — which opens Maps with the
branch's current listed number (Sixt has no public branch-number dataset and
routes many branches through a central line, so a live Maps lookup is the
reliable way to get a real number).

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
npm run dev      # https://localhost:5173/swap-my-sixt/  + a Network URL
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run check    # type-check the whole project
```

Requires Node 18+ (the CI uses Node 20).

**Testing on an iPhone / iPad:** `npm run dev` prints two URLs — a `Local`
one and a `Network` one like `https://192.168.x.x:5173/swap-my-sixt/`. Open
the **Network** URL on any device on the same Wi-Fi. The dev server runs over
**HTTPS** (self-signed) so geolocation works on iOS — Safari will show a
one-time "not private" warning; tap **Show details → visit this website** to
proceed. The certificate warning is expected for a local self-signed cert.

## Troubleshooting

**Deployed site shows a blank white page.** This means GitHub Pages is serving
the raw repository source instead of the built `dist/` folder. Fix it:

1. Repo **Settings → Pages → Build and deployment → Source** → set to
   **GitHub Actions** (not "Deploy from a branch").
2. Open the **Actions** tab and confirm the latest "Deploy to GitHub Pages"
   run is green. If it never ran, push any commit to trigger it.
3. The workflow now also sets `enablement: true`, so a fresh push should
   self-correct the Pages configuration.

The site only works at the `/swap-my-sixt/` path — `https://<user>.github.io/`
without the repo name will 404. Use the full URL.

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
    carVisuals.ts         per-class body shape + colour palette
    acriss.ts             ACRISS / SIPP code decoder
    heuristic.ts          availability scoring (incl. "any car") + route filtering
    geo.ts                haversine, point-to-segment, formatters
    routing.ts            OSRM client
    geocoding.ts          Nominatim search + reverse geocode
    store.ts              Svelte stores (booking, prefs, cross-tab nav)
  components/
    Header.svelte         brand + tab bar
    MapView.svelte        the Navigate tab
    RoutePanel.svelte     from/to inputs with autocomplete
    BottomSheet.svelte    draggable sheet
    BookingView.svelte    the Booking tab (ACRISS decode)
    CarsView.svelte       the Cars tab (card grid)
    CarArt.svelte         SVG car illustrations
    StationsView.svelte   the Stations tab (list + map)
    StationSearchField.svelte   searchable station picker
    StationDetail.svelte  station detail card (+ phone lookup)
    TargetBar.svelte / TargetPicker.svelte   shared "hunting for" control
    StationListItem.svelte / ProbabilityBadge.svelte
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
