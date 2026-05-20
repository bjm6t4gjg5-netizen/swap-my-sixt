<script lang="ts">
  import { onMount, tick } from "svelte";
  import L from "leaflet";
  import RoutePanel from "./RoutePanel.svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import TargetBar from "./TargetBar.svelte";
  import StationListItem from "./StationListItem.svelte";
  import StationDetail from "./StationDetail.svelte";
  import StrategySheet from "./StrategySheet.svelte";
  import MapsMenu from "./MapsMenu.svelte";
  import { STATIONS } from "../lib/stations";
  import { fetchRoutes } from "../lib/routing";
  import { stationsAlongRoute, verdict } from "../lib/heuristic";
  import { formatKm, formatDuration } from "../lib/geo";
  import type { Route, ScoredStation } from "../lib/types";
  import {
    target,
    targetClassId,
    myLocation,
    navRequest,
    addRecent,
    recents,
    type NamedPoint
  } from "../lib/store";

  export let active = false;

  let mapEl: HTMLDivElement;
  let map: L.Map;

  let origin: NamedPoint | null = null;
  let dest: NamedPoint | null = null;
  /** All route alternatives from OSRM; index 0 is the fastest. */
  let routes: Route[] = [];
  let selectedRouteIndex = 0;
  $: route = routes.length ? routes[selectedRouteIndex] ?? routes[0] : null;
  let scored: ScoredStation[] = [];
  let selected: ScoredStation | null = null;

  let loading = "";
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let sheetState: "collapsed" | "mid" | "full" = "mid";
  /** Station the route currently detours through (set by "Route via here"). */
  let viaStation: ScoredStation | null = null;
  /** Controls the printable strategy one-pager. */
  let showStrategy = false;

  // Leaflet layers we manage by hand
  let routeLines: L.Polyline[] = [];
  let stationLayer: L.LayerGroup | null = null;
  let originMarker: L.Marker | null = null;
  let destMarker: L.Marker | null = null;
  let meMarker: L.Marker | null = null;

  $: bestId =
    scored.length > 0
      ? scored.reduce((a, b) => (b.score > a.score ? b : a)).id
      : null;

  // Re-score when the target changes
  $: if (route && $target) {
    scored = stationsAlongRoute(route, STATIONS, targetClassId($target));
    drawStations();
  }

  // Fix Leaflet sizing when this tab becomes visible
  $: if (active && map) {
    tick().then(() => map.invalidateSize());
  }

  // Consume a navigation request handed over from another tab
  $: if ($navRequest) {
    const req = $navRequest;
    navRequest.set(null);
    applyNavRequest(req);
  }

  onMount(() => {
    initMap();
    quickLocate();
    return () => {
      map?.remove();
    };
  });

  function initMap() {
    map = L.map(mapEl, {
      zoomControl: false,
      attributionControl: true
    }).setView([50.5, 9.5], 5);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
      }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    stationLayer = L.layerGroup().addTo(map);

    map.on("click", () => {
      selected = null;
    });

    // long-press to drop a destination pin
    let pressTimer: ReturnType<typeof setTimeout> | null = null;
    const startPress = (e: L.LeafletMouseEvent) => {
      pressTimer = setTimeout(() => {
        setPoint("dest", {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: "Dropped pin"
        });
        pressTimer = null;
      }, 600);
    };
    const cancelPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    map.on("mousedown", startPress);
    map.on("mouseup", cancelPress);
    map.on("mousemove", cancelPress);
    map.on("dragstart", cancelPress);
  }

  function toast(msg: string) {
    loading = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (loading === msg) loading = "";
    }, 3000);
  }

  /* ---------- geolocation ---------- */
  function quickLocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        myLocation.set(here);
        drawMe(here);
        map.setView([here.lat, here.lng], 12);
        if (!origin) {
          origin = { ...here, label: "Current location" };
          drawEndpoints();
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  function locateMe(thenSetOrigin = false) {
    if (!navigator.geolocation) {
      toast("Geolocation is not available in this browser.");
      return;
    }
    loading = "Finding your location…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loading = "";
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        myLocation.set(here);
        drawMe(here);
        if (thenSetOrigin) {
          setPoint("origin", { ...here, label: "Current location" });
        } else {
          map.setView([here.lat, here.lng], 14);
        }
      },
      (err) => {
        loading = "";
        toast("Could not get your location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  /* ---------- route building ---------- */
  function setPoint(field: "origin" | "dest", point: NamedPoint) {
    if (field === "origin") origin = point;
    else dest = point;
    drawEndpoints();
    if (origin && dest) planRoute();
    else {
      const p = field === "origin" ? origin! : dest!;
      map.setView([p.lat, p.lng], 13);
    }
  }

  function applyNavRequest(req: {
    origin?: NamedPoint;
    dest?: NamedPoint;
  }) {
    if (req.origin) origin = req.origin;
    if (req.dest) dest = req.dest;
    drawEndpoints();
    if (origin && dest) planRoute();
  }

  async function planRoute() {
    if (!origin || !dest) return;
    loading = "Calculating routes…";
    selected = null;
    viaStation = null;
    try {
      routes = await fetchRoutes([origin, dest]);
      selectedRouteIndex = 0;
      scoreSelected();
      drawRoutes();
      drawStations();
      fitToRoute();
      sheetState = "mid";
      addRecent({ label: dest.label, lat: dest.lat, lng: dest.lng });
    } catch (e) {
      toast((e as Error).message);
    } finally {
      loading = "";
    }
  }

  async function routeVia(station: ScoredStation) {
    if (!origin || !dest) return;
    loading = `Re-routing via ${station.name}…`;
    try {
      routes = await fetchRoutes([
        origin,
        { lat: station.lat, lng: station.lng, label: station.name },
        dest
      ]);
      selectedRouteIndex = 0;
      viaStation = station;
      scoreSelected();
      drawRoutes();
      drawStations();
      fitToRoute();
      selected = null;
      toast(`Route now passes through ${station.name}.`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      loading = "";
    }
  }

  /** Switch to a different route alternative. */
  function selectRoute(i: number) {
    if (i === selectedRouteIndex || i < 0 || i >= routes.length) return;
    selectedRouteIndex = i;
    selected = null;
    scoreSelected();
    drawRoutes();
    drawStations();
  }

  function scoreSelected() {
    scored = route
      ? stationsAlongRoute(route, STATIONS, targetClassId($target))
      : [];
  }

  function swapEnds() {
    if (!origin || !dest) return;
    [origin, dest] = [dest, origin];
    drawEndpoints();
    planRoute();
  }

  function clearField(field: "origin" | "dest") {
    if (field === "origin") origin = null;
    else dest = null;
    routes = [];
    selectedRouteIndex = 0;
    scored = [];
    selected = null;
    viaStation = null;
    routeLines.forEach((l) => l.remove());
    routeLines = [];
    stationLayer?.clearLayers();
    drawEndpoints();
  }

  /* ---------- drawing ---------- */
  function drawRoutes() {
    routeLines.forEach((l) => l.remove());
    routeLines = [];
    // draw non-selected first (underneath), then the selected one on top
    routes.forEach((r, i) => {
      if (i === selectedRouteIndex) return;
      const line = L.polyline(
        r.coordinates.map((c) => [c.lat, c.lng]),
        { color: "#9aa0ab", weight: 5, opacity: 0.55, lineCap: "round" }
      ).addTo(map);
      line.on("click", () => selectRoute(i));
      routeLines.push(line);
    });
    if (routes[selectedRouteIndex]) {
      const sel = L.polyline(
        routes[selectedRouteIndex].coordinates.map((c) => [c.lat, c.lng]),
        { color: "#007aff", weight: 6, opacity: 0.95, lineCap: "round" }
      ).addTo(map);
      routeLines.push(sel);
    }
  }

  function drawStations() {
    if (!stationLayer) return;
    stationLayer.clearLayers();
    for (const s of scored) {
      const v = verdict(s.score);
      const icon = L.divIcon({
        className: "",
        html: `<div class="station-pin ${v}"><span class="lbl">${Math.round(
          s.score * 100
        )}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(stationLayer);
      m.on("click", () => selectStation(s));
    }
  }

  function drawEndpoints() {
    if (origin) {
      originMarker?.remove();
      originMarker = L.marker([origin.lat, origin.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="endpoint-pin a">A</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        })
      }).addTo(map);
    } else {
      originMarker?.remove();
      originMarker = null;
    }
    if (dest) {
      destMarker?.remove();
      destMarker = L.marker([dest.lat, dest.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="endpoint-pin b">B</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        })
      }).addTo(map);
    } else {
      destMarker?.remove();
      destMarker = null;
    }
  }

  function drawMe(here: { lat: number; lng: number }) {
    meMarker?.remove();
    meMarker = L.marker([here.lat, here.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div class="me-marker"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      }),
      zIndexOffset: 1000,
      interactive: false
    }).addTo(map);
  }

  function fitToRoute() {
    if (!route) return;
    map.fitBounds(
      L.latLngBounds(route.coordinates.map((c) => [c.lat, c.lng])),
      { paddingTopLeft: [40, 150], paddingBottomRight: [40, 360] }
    );
  }

  function selectStation(s: ScoredStation) {
    selected = s;
    map.flyTo([s.lat, s.lng], 12, { duration: 0.5 });
  }

  /* ---------- send the next stop to a maps app ---------- */
  // The next stop is the chosen swap station if there is one, else the
  // destination. The MapsMenu offers Apple Maps, Google Maps or Share/AirDrop.
  let showMapsMenu = false;
  $: nextStopPoint = viaStation
    ? { lat: viaStation.lat, lng: viaStation.lng, label: viaStation.name }
    : dest;
</script>

<div class="mapview">
  <div class="map" bind:this={mapEl}></div>

  <!-- top route panel -->
  <div class="top">
    <RoutePanel
      {origin}
      {dest}
      myLocation={$myLocation}
      recents={$recents}
      busy={loading.startsWith("Calculating") || loading.startsWith("Re-routing")}
      on:pick={(e) => setPoint(e.detail.field, e.detail.point)}
      on:locate={() => locateMe(true)}
      on:swap={swapEnds}
      on:clear={(e) => clearField(e.detail.field)}
    />
  </div>

  <!-- locate FAB -->
  <button class="fab" on:click={() => locateMe(false)} aria-label="My location">
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="12" cy="12" r="3.4" fill="currentColor" />
      <path d="M12 2v3.4M12 18.6V22M2 12h3.4M18.6 12H22"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor"
              stroke-width="1.6" opacity="0.5" />
    </svg>
  </button>

  {#if loading}
    <div class="toast">{loading}</div>
  {/if}

  {#if selected}
    <div class="detail-card">
      <StationDetail
        station={selected}
        target={$target}
        showRouteVia={!!route}
        on:close={() => (selected = null)}
        on:routeVia={(e) => routeVia(e.detail)}
      />
    </div>
  {:else}
    <BottomSheet bind:state={sheetState}>
      <div slot="header" class="summary">
        <div class="s-text">
          {#if route && origin && dest}
            <div class="s-route">{origin.label} → {dest.label}</div>
            <div class="s-meta">
              {formatKm(route.distance)} · {formatDuration(route.duration)} ·
              {scored.length} swap {scored.length === 1 ? "option" : "options"}
            </div>
          {:else}
            <div class="s-route">Plan a swap route</div>
            <div class="s-meta">
              Set a start &amp; destination, or long-press the map.
            </div>
          {/if}
        </div>
        {#if route}
          <button class="go" on:click={() => (showMapsMenu = true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 11l18-8-8 18-2-8-8-2z" fill="currentColor" />
            </svg>
            Send to Maps
          </button>
        {/if}
      </div>

      {#if routes.length > 1}
        <div class="routes-row">
          {#each routes as r, i}
            <button
              class="route-chip"
              class:on={i === selectedRouteIndex}
              on:click={() => selectRoute(i)}
            >
              <div class="rc-time">{formatDuration(r.duration)}</div>
              <div class="rc-dist">
                {formatKm(r.distance)} · {i === 0 ? "Fastest" : "Alt " + i}
              </div>
            </button>
          {/each}
        </div>
      {/if}

      <div class="targetwrap">
        <TargetBar />
      </div>

      {#if route && scored.length}
        <button class="strategy-btn" on:click={() => (showStrategy = true)}>
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path
              d="M7 3h7l5 5v13H7zM14 3v5h5M9 13h7M9 17h7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Print swap strategy one-pager
        </button>
      {/if}

      <div class="list">
        {#if !route}
          <div class="empty">
            <strong>No route yet</strong>
            <p>
              Enter where you're starting and where you're headed. The app
              finds the fastest route, then shows every Sixt station along it
              with your odds of swapping into the car you want.
            </p>
          </div>
        {:else if scored.length === 0}
          <div class="empty">
            <strong>No Sixt stations on this corridor</strong>
            <p>
              Try a longer route. Coverage is densest in Germany and major
              European hubs.
            </p>
          </div>
        {:else}
          {#each scored as s (s.id)}
            <div class="row-wrap" class:best={s.id === bestId}>
              {#if s.id === bestId && s.score >= 0.5}
                <span class="best-tag">Best odds</span>
              {/if}
              <StationListItem
                station={s}
                mode="detour"
                on:select={(e) => selectStation(e.detail)}
              />
            </div>
          {/each}
        {/if}
      </div>
    </BottomSheet>
  {/if}

  {#if showStrategy && route && origin && dest}
    <StrategySheet
      {origin}
      {dest}
      {route}
      stations={scored}
      target={$target}
      {viaStation}
      on:close={() => (showStrategy = false)}
    />
  {/if}

  {#if showMapsMenu && nextStopPoint}
    <MapsMenu
      lat={nextStopPoint.lat}
      lng={nextStopPoint.lng}
      label={nextStopPoint.label}
      originLat={origin?.lat ?? null}
      originLng={origin?.lng ?? null}
      on:close={() => (showMapsMenu = false)}
    />
  {/if}
</div>

<style>
  .mapview { position: absolute; inset: 0; }
  /* z-index:0 gives the map its own stacking context so Leaflet's internal
     panes (z-index 200–700) stay contained and don't cover the UI. */
  .map { position: absolute; inset: 0; z-index: 0; background: #e6e4e0; }

  .top {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    z-index: 25;
  }

  .fab {
    position: absolute;
    right: 12px;
    bottom: 116px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--material-2);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border: none;
    box-shadow: var(--shadow-2);
    color: var(--blue);
    display: grid;
    place-items: center;
    z-index: 26;
  }
  .fab:active { transform: scale(0.93); }

  .toast {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 13px;
    padding: 9px 16px;
    border-radius: 18px;
    z-index: 40;
    box-shadow: var(--shadow-2);
    max-width: 80%;
    text-align: center;
  }

  .detail-card {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 10px;
    z-index: 35;
    background: var(--material-2);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border-radius: 20px;
    box-shadow: var(--shadow-2);
    max-height: 78%;
    overflow-y: auto;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 2px 16px 12px;
  }
  .s-text { flex: 1; min-width: 0; }
  .s-route {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .s-meta { font-size: 12.5px; color: var(--muted); margin-top: 2px; }

  .go {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--blue);
    color: white;
    border: none;
    border-radius: 22px;
    padding: 11px 20px;
    font-size: 15px;
    font-weight: 700;
    box-shadow: 0 3px 10px rgba(0, 122, 255, 0.32);
  }
  .go:active { transform: scale(0.96); }

  .routes-row {
    display: flex;
    gap: 7px;
    overflow-x: auto;
    padding: 2px 14px 10px;
    scrollbar-width: none;
  }
  .routes-row::-webkit-scrollbar { display: none; }
  .route-chip {
    flex: 1;
    min-width: 96px;
    border: 1.5px solid var(--line);
    background: var(--surface);
    border-radius: 11px;
    padding: 7px 10px;
    text-align: left;
  }
  .route-chip.on {
    border-color: var(--blue);
    background: var(--blue-soft);
  }
  .route-chip:active { transform: scale(0.98); }
  .rc-time { font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }
  .rc-dist { font-size: 11px; color: var(--muted); margin-top: 1px; }

  .targetwrap { padding: 2px 14px 10px; }

  .strategy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: calc(100% - 28px);
    margin: 0 14px 12px;
    padding: 11px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .strategy-btn:active { transform: scale(0.99); }
  .list { padding-bottom: 20px; border-top: 1px solid var(--line-soft); }

  .empty { padding: 26px 22px; text-align: center; }
  .empty strong { font-size: 15px; display: block; margin-bottom: 6px; }
  .empty p { font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0; }

  .row-wrap { position: relative; }
  .row-wrap.best { background: rgba(52, 199, 89, 0.06); }
  .best-tag {
    position: absolute;
    top: 6px;
    right: 14px;
    z-index: 1;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #1f8a3b;
    background: rgba(52, 199, 89, 0.16);
    padding: 2px 7px;
    border-radius: 7px;
  }

  @media (min-width: 760px) {
    .top { width: 388px; right: auto; }
    .fab { bottom: 24px; right: 24px; }
    .detail-card { left: 14px; right: auto; width: 388px; bottom: 14px; }
  }
</style>
