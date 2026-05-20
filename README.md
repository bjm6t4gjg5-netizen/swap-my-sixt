# Swap my Sixt — v3.10

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
it. "Add a stop" lets you build a **multi-stop road trip** — up to four
intermediate stops, each a numbered pin on the map — and every Sixt station
along the whole chain is still scored.

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
car you can see on the lot, by exact engine variant (530i, 540i xDrive…).
A 131-strong variant database means each car carries real specs — horsepower,
top speed, 0–100, drivetrain, fuel, consumption — and the tool spells out the
concrete difference vs your booked car ("+88 hp, AWD vs RWD"). It factors in
your Sixt loyalty status, flags what counts as a good deal, and tells you
whether to accept, hold out, or point at a specific better car. Set the branch
and it also suggests **specific cars worth asking for** — realistic upgrades
within reach of that branch type and your status, filterable by brand, fuel,
body, drivetrain and minimum top speed, so you can hand the agent a concrete
name instead of a vague "something nicer". When your ACRISS code is an "Elite"
category, a plain same-class car is flagged as a notch short — not a match.

**Ask the analyst — offline too.** Lucas now works with **no API key** out of
the box: a witty rule-based mode covering swaps, negotiation, ACRISS codes and
Autobahn/Blitzer humour. Add an Anthropic key for the full Claude-powered
Lucas.

**Strategy one-pager** — once a route is planned, print a clean PDF: route
summary, your target, recommended swap stops and a full ranked table of every
Sixt station along the way. A paper reference for the drive.

**Route A / B / C** — the planner always offers up to three routes. Route A is
the fastest; B and C are deliberate **Sixt-aware detours** that swing through
station-dense areas the fastest route misses. Each chip shows distance, drive
time and how many Sixt stations it passes — so a small extra drive can unlock
more swap options.

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

The site is live at `https://swap-my-sixt.deich-dynamics.com/` — a custom
domain configured in **Settings → Pages**. The `public/CNAME` file keeps that
domain attached on every deploy.

> Because of the custom domain the site is served from the **root**, so the
> Vite `base` is `/` in `vite.config.ts`. If you ever drop the custom domain
> and use the plain `https://<user>.github.io/swap-my-sixt/` URL instead, set
> `base` back to `/swap-my-sixt/` (and remove `public/CNAME`).

### Local development

```bash
npm install
npm run dev      # https://localhost:5173/  + a Network URL
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run check    # type-check the whole project
```

Requires Node 18+ (the CI uses Node 20).

**Testing on an iPhone / iPad:** `npm run dev` prints two URLs — a `Local`
one and a `Network` one like `https://192.168.x.x:5173/`. Open
the **Network** URL on any device on the same Wi-Fi. The dev server runs over
**HTTPS** (self-signed) so geolocation works on iOS — Safari will show a
one-time "not private" warning; tap **Show details → visit this website** to
proceed. The certificate warning is expected for a local self-signed cert.

## Troubleshooting

**Deployed site shows a blank white page.** The `index.html` loads but the
JavaScript and CSS 404, so nothing renders. The cause is a mismatch between the
Vite `base` and where the site is actually served:

- **With the custom domain** (`swap-my-sixt.deich-dynamics.com`) the site is
  served from the root, so `base` must be `/`. If `base` is `/swap-my-sixt/`,
  every asset is requested at `/swap-my-sixt/assets/…` which doesn't exist.
- **On the plain `<user>.github.io/swap-my-sixt/` URL** the opposite is true —
  `base` must be `/swap-my-sixt/`.

Pick one and keep `base` (in `vite.config.ts`) consistent with it. Other checks:

1. **Settings → Pages → Build and deployment → Source** must be
   **GitHub Actions** — *not* "Deploy from a branch".
2. Open the **Actions** tab. The latest "Deploy to GitHub Pages" run must be
   **green**. If it's red, open it and read the failing step.
3. If you previously opened the site, your browser may be holding an old
   **service worker**. Hard-refresh (desktop: Cmd/Ctrl+Shift+R) or, on iOS,
   close the tab and reopen — or clear the site data once.

The build and `.gitignore` are correct: `dist/` is intentionally git-ignored
because GitHub Actions rebuilds it on every push — never commit `dist/`.

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
