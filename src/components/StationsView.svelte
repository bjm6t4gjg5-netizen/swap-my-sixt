<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import L from "leaflet";
  import { STATIONS, COUNTRY_NAMES } from "../lib/stations";
  import { computeScore, verdict } from "../lib/heuristic";
  import { haversineKm } from "../lib/geo";
  import { carClass, myLocation, requestNavigation } from "../lib/store";
  import { CAR_CLASS_BY_ID } from "../lib/cars";
  import type { ScoredStation } from "../lib/types";
  import ClassPicker from "./ClassPicker.svelte";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import StationDetail from "./StationDetail.svelte";

  export let active = false;

  let query = "";
  let country = "ALL";
  let sort: "odds" | "az" | "near" = "odds";
  let view: "list" | "map" = "list";
  let selected: ScoredStation | null = null;

  // Leaflet
  let mapEl: HTMLDivElement | undefined;
  let map: L.Map | undefined;
  let markerLayer: L.LayerGroup | undefined;
  let needFit = true;

  const countryCounts = STATIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s.country] = (acc[s.country] ?? 0) + 1;
    return acc;
  }, {});
  const countries = Object.keys(countryCounts).sort(
    (a, b) => countryCounts[b] - countryCounts[a]
  );

  $: scored = STATIONS.map((s): ScoredStation => {
    const dist = $myLocation ? haversineKm($myLocation, s) : 0;
    return {
      ...s,
      fromRouteKm: dist,
      distFromStartKm: dist,
      detourMin: 0,
      score: computeScore(s, $carClass)
    };
  });

  $: filtered = scored
    .filter((s) => country === "ALL" || s.country === country)
    .filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) || s.addr.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "near") return a.fromRouteKm - b.fromRouteKm;
      return b.score - a.score;
    });

  $: targetLabel = CAR_CLASS_BY_ID[$carClass].label;

  // --- map lifecycle ---
  async function ensureMap() {
    await tick();
    if (!mapEl || map) return;
    map = L.map(mapEl, { zoomControl: false, attributionControl: true }).setView(
      [48, 10],
      4
    );
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
    markerLayer = L.layerGroup().addTo(map);
    refreshMarkers(filtered);
  }

  function refreshMarkers(list: ScoredStation[]) {
    if (!map || !markerLayer) return;
    markerLayer.clearLayers();
    for (const s of list) {
      const v = verdict(s.score);
      const icon = L.divIcon({
        className: "",
        html: `<div class="station-pin ${v}"><span class="lbl">${Math.round(
          s.score * 100
        )}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(markerLayer);
      m.on("click", () => (selected = s));
    }
    if (needFit && list.length) {
      map.fitBounds(L.latLngBounds(list.map((s) => [s.lat, s.lng])).pad(0.15));
      needFit = false;
    }
  }

  // enter map mode → build map
  $: if (view === "map") ensureMap();
  // markers follow the filter
  $: if (map && view === "map") refreshMarkers(filtered);
  // fix sizing when the tab or view becomes visible
  $: if (active && map && view === "map") tick().then(() => map?.invalidateSize());

  onDestroy(() => map?.remove());

  function selectCountry(c: string) {
    country = c;
    needFit = true; // re-frame the map on the new selection
  }

  function planFromStation(s: ScoredStation) {
    requestNavigation({
      origin: { lat: s.lat, lng: s.lng, label: s.name },
      carClass: $carClass
    });
  }
</script>

<div class="view" class:mapmode={view === "map"}>
  <div class="controls">
    <header class="vhead">
      <h2>Sixt stations</h2>
      <p>
        {STATIONS.length} branches worldwide, scored live for
        <strong>{targetLabel}</strong>.
      </p>
    </header>

    <ClassPicker label="" />

    <div class="row2">
      <div class="searchbar">
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input type="text" placeholder="Search station or city" bind:value={query} />
        {#if query}
          <button class="clear" on:click={() => (query = "")} aria-label="Clear">×</button>
        {/if}
      </div>
      <div class="seg">
        <button class:on={view === "list"} on:click={() => (view = "list")}>List</button>
        <button class:on={view === "map"} on:click={() => (view = "map")}>Map</button>
      </div>
    </div>

    <div class="chips">
      <button class="chip" class:on={country === "ALL"} on:click={() => selectCountry("ALL")}>
        All · {STATIONS.length}
      </button>
      {#each countries as c}
        <button class="chip" class:on={country === c} on:click={() => selectCountry(c)}>
          {COUNTRY_NAMES[c] ?? c} · {countryCounts[c]}
        </button>
      {/each}
    </div>

    {#if view === "list"}
      <div class="sortrow">
        <span class="sr-label">{filtered.length} shown</span>
        <div class="seg small">
          <button class:on={sort === "odds"} on:click={() => (sort = "odds")}>Best odds</button>
          <button class:on={sort === "az"} on:click={() => (sort = "az")}>A–Z</button>
          <button
            class:on={sort === "near"}
            class:dim={!$myLocation}
            on:click={() => $myLocation && (sort = "near")}
          >Nearest</button>
        </div>
      </div>
    {/if}
  </div>

  {#if view === "list"}
    <div class="list">
      {#each filtered as s (s.id)}
        <button class="row" on:click={() => (selected = s)}>
          <ProbabilityBadge score={s.score} size="sm" />
          <div class="info">
            <div class="name">{s.name}</div>
            <div class="meta">{s.addr}</div>
          </div>
          <div class="right">
            {#if $myLocation && s.fromRouteKm > 0}
              <div class="num">{Math.round(s.fromRouteKm)} km</div>
              <div class="sub">away</div>
            {:else}
              <div class="num cap">{s.fleet}</div>
              <div class="sub">fleet</div>
            {/if}
          </div>
        </button>
      {:else}
        <div class="empty">No stations match those filters.</div>
      {/each}
    </div>
  {:else}
    <div class="map-wrap">
      <div class="map" bind:this={mapEl}></div>
      <div class="map-legend">
        <span><i class="lg ok"></i>Likely</span>
        <span><i class="lg mid"></i>Maybe</span>
        <span><i class="lg no"></i>Unlikely</span>
      </div>
    </div>
  {/if}
</div>

{#if selected}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="scrim"
    on:click={(e) => e.target === e.currentTarget && (selected = null)}
  >
    <div class="modal" role="dialog" aria-modal="true">
      <StationDetail
        station={selected}
        classId={$carClass}
        mode="browse"
        showPlanRoute={true}
        on:close={() => (selected = null)}
        on:planRoute={(e) => planFromStation(e.detail)}
      />
    </div>
  </div>
{/if}

<style>
  .view { max-width: 760px; margin: 0 auto; }
  .view.mapmode {
    max-width: none;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .controls {
    padding: 14px 0 8px;
    flex-shrink: 0;
  }
  .vhead { padding: 0 16px; }
  .vhead h2 { margin: 2px 0 3px; font-size: 23px; font-weight: 800; letter-spacing: -0.02em; }
  .vhead p { margin: 0 0 12px; font-size: 13.5px; color: var(--text-2); line-height: 1.5; }
  .vhead strong { color: var(--orange-dark); }

  .row2 { display: flex; gap: 8px; padding: 8px 14px 0; }
  .searchbar {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border-radius: 11px;
    padding: 9px 12px;
    box-shadow: var(--shadow-1);
    color: var(--muted);
    min-width: 0;
  }
  .searchbar input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    color: var(--text);
  }
  .clear {
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 15px;
  }

  .seg {
    display: flex;
    background: var(--surface-3);
    border-radius: 10px;
    padding: 2px;
    flex-shrink: 0;
  }
  .seg button {
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
    padding: 7px 13px;
    border-radius: 8px;
  }
  .seg.small button { font-size: 12px; padding: 5px 9px; }
  .seg button.on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-1); }
  .seg button.dim { opacity: 0.4; }

  .chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 10px 14px 4px;
    scrollbar-width: none;
  }
  .chips::-webkit-scrollbar { display: none; }
  .chip {
    flex-shrink: 0;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text-2);
    padding: 6px 11px;
    border-radius: 100px;
    font-size: 12.5px;
    white-space: nowrap;
  }
  .chip.on { background: var(--blue); color: white; border-color: var(--blue); }

  .sortrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px 0;
  }
  .sr-label { font-size: 12px; color: var(--muted); }

  .list {
    background: var(--surface);
    margin: 10px 14px 70px;
    border-radius: 16px;
    box-shadow: var(--shadow-1);
    overflow: hidden;
  }
  .row {
    width: 100%;
    display: grid;
    grid-template-columns: 34px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .row:last-child { border-bottom: none; }
  .row:active { background: var(--surface-2); }
  .info { min-width: 0; }
  .name {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .right { text-align: right; flex-shrink: 0; }
  .num { font-size: 14px; font-weight: 700; }
  .num.cap { text-transform: uppercase; }
  .sub { font-size: 11px; color: var(--muted); }
  .empty { padding: 30px; text-align: center; color: var(--muted); font-size: 14px; }

  /* map mode */
  .map-wrap { flex: 1; position: relative; min-height: 0; }
  .map { position: absolute; inset: 0; z-index: 0; background: #e6e4e0; }
  .map-legend {
    position: absolute;
    left: 12px;
    bottom: 12px;
    z-index: 5;
    background: var(--surface);
    border-radius: 11px;
    box-shadow: var(--shadow-2);
    padding: 8px 11px;
    display: flex;
    gap: 12px;
    font-size: 11.5px;
    color: var(--text-2);
  }
  .map-legend span { display: flex; align-items: center; gap: 5px; }
  .lg { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .lg.ok { background: var(--green); }
  .lg.mid { background: var(--yellow); }
  .lg.no { background: var(--red); }

  /* modal */
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.42);
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 12px;
  }
  .modal {
    background: var(--surface);
    border-radius: 18px;
    box-shadow: var(--shadow-2);
    width: 100%;
    max-width: 460px;
    max-height: 86vh;
    overflow-y: auto;
  }
  @media (min-width: 560px) {
    .scrim { align-items: center; }
  }
</style>
