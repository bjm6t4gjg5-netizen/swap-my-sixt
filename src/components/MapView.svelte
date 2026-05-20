<script lang="ts">
  import { onMount, tick } from "svelte";
  import L from "leaflet";
  import RoutePanel from "./RoutePanel.svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import ClassPicker from "./ClassPicker.svelte";
  import StationListItem from "./StationListItem.svelte";
  import StationDetail from "./StationDetail.svelte";
  import { STATIONS } from "../lib/stations";
  import { fetchRoute } from "../lib/routing";
  import { stationsAlongRoute, verdict } from "../lib/heuristic";
  import { formatKm, formatDuration } from "../lib/geo";
  import type { Route, ScoredStation } from "../lib/types";
  import {
    carClass,
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
  let route: Route | null = null;
  let scored: ScoredStation[] = [];
  let selected: ScoredStation | null = null;

  let loading = "";
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let navigating = false;
  let watchId: number | null = null;
  let wakeLock: any = null;
  let sheetState: "collapsed" | "mid" | "full" = "mid";

  // Leaflet layers we manage by hand
  let routeLine: L.Polyline | null = null;
  let stationLayer: L.LayerGroup | null = null;
  let originMarker: L.Marker | null = null;
  let destMarker: L.Marker | null = null;
  let meMarker: L.Marker | null = null;

  $: bestId =
    scored.length > 0
      ? scored.reduce((a, b) => (b.score > a.score ? b : a)).id
      : null;

  // Re-score when the car class changes
  $: if (route && $carClass) {
    scored = stationsAlongRoute(route, STATIONS, $carClass);
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
      stopNav();
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
    loading = "Calculating fastest route…";
    selected = null;
    try {
      route = await fetchRoute([origin, dest]);
      scored = stationsAlongRoute(route, STATIONS, $carClass);
      drawRoute();
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
      route = await fetchRoute([
        origin,
        { lat: station.lat, lng: station.lng, label: station.name },
        dest
      ]);
      scored = stationsAlongRoute(route, STATIONS, $carClass);
      drawRoute();
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

  function swapEnds() {
    if (!origin || !dest) return;
    [origin, dest] = [dest, origin];
    drawEndpoints();
    planRoute();
  }

  function clearField(field: "origin" | "dest") {
    if (field === "origin") origin = null;
    else dest = null;
    route = null;
    scored = [];
    selected = null;
    routeLine?.remove();
    routeLine = null;
    stationLayer?.clearLayers();
    drawEndpoints();
  }

  /* ---------- drawing ---------- */
  function drawRoute() {
    if (!route) return;
    routeLine?.remove();
    routeLine = L.polyline(
      route.coordinates.map((c) => [c.lat, c.lng]),
      { color: "#007aff", weight: 6, opacity: 0.9, lineCap: "round" }
    ).addTo(map);
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
    if (!routeLine) return;
    map.fitBounds(routeLine.getBounds(), {
      paddingTopLeft: [40, 150],
      paddingBottomRight: [40, 360]
    });
  }

  function selectStation(s: ScoredStation) {
    selected = s;
    map.flyTo([s.lat, s.lng], 12, { duration: 0.5 });
  }

  /* ---------- navigation mode ---------- */
  async function startNav() {
    if (!route) return;
    navigating = true;
    sheetState = "collapsed";
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          myLocation.set(here);
          drawMe(here);
          map.panTo([here.lat, here.lng], { animate: true });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
      );
    }
    const ml = $myLocation;
    if (ml) map.setView([ml.lat, ml.lng], 15);
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await (navigator as any).wakeLock.request("screen");
      }
    } catch {}
  }

  function stopNav() {
    navigating = false;
    sheetState = "mid";
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (wakeLock) {
      wakeLock.release?.();
      wakeLock = null;
    }
  }
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
        classId={$carClass}
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
          {#if navigating}
            <button class="go end" on:click={stopNav}>End</button>
          {:else}
            <button class="go" on:click={startNav}>GO</button>
          {/if}
        {/if}
      </div>

      <ClassPicker label="Hunting for" />

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
</div>

<style>
  .mapview { position: absolute; inset: 0; }
  .map { position: absolute; inset: 0; background: #e6e4e0; }

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
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--surface);
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
    background: var(--surface);
    border-radius: 16px;
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
    background: var(--blue);
    color: white;
    border: none;
    border-radius: 22px;
    padding: 11px 22px;
    font-size: 15px;
    font-weight: 700;
    box-shadow: 0 3px 10px rgba(0, 122, 255, 0.32);
  }
  .go.end {
    background: var(--red);
    box-shadow: 0 3px 10px rgba(255, 59, 48, 0.32);
  }
  .go:active { transform: scale(0.96); }

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

  @media (min-width: 900px) {
    .top { width: 388px; right: auto; }
    .fab { bottom: 24px; right: 24px; }
    .detail-card { left: 14px; right: auto; width: 388px; bottom: 14px; }
  }
</style>
