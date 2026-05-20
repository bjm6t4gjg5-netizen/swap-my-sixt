<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import type { ScoredStation, CarClassId } from "../lib/types";
  import { verdictLabel } from "../lib/heuristic";
  import { CAR_CLASS_BY_ID, modelsInClass } from "../lib/cars";
  import { COUNTRY_NAMES } from "../lib/stations";
  import { formatKm } from "../lib/geo";

  export let station: ScoredStation;
  export let classId: CarClassId;
  export let showRouteVia = false;
  /** "route" shows detour stats; "browse" shows straight-line distance. */
  export let mode: "route" | "browse" = "route";
  export let showPlanRoute = false;

  const dispatch = createEventDispatcher<{
    close: void;
    routeVia: ScoredStation;
    planRoute: ScoredStation;
  }>();

  $: cls = CAR_CLASS_BY_ID[classId];
  $: pct = Math.round(station.score * 100);
  $: models = modelsInClass(classId);

  function verdictText(): string {
    const detour =
      mode === "route" ? ` the ${station.detourMin}-minute detour` : " a detour";
    if (station.score >= 0.65) {
      return `Strong odds of a ${cls.label} here — a large fleet and a fast-turnover branch. Worth${detour}.`;
    }
    if (station.score >= 0.35) {
      return `This branch may not keep a ${cls.label} on hand. Phone ahead before committing to${detour}.`;
    }
    return `A small or off-hours branch — a ${cls.label} is unlikely to be sitting ready. Skip unless you have called and confirmed.`;
  }

  function openInMaps() {
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    const url = isApple
      ? `https://maps.apple.com/?daddr=${station.lat},${station.lng}&q=${encodeURIComponent(station.name)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(url, "_blank", "noopener");
  }
</script>

<div class="detail">
  <div class="head">
    <ProbabilityBadge score={station.score} size="lg" />
    <div class="title">
      <h3>{station.name}</h3>
      <p>{station.addr}</p>
    </div>
    <button class="close" on:click={() => dispatch("close")} aria-label="Close">×</button>
  </div>

  <div class="verdict-tag {station.score >= 0.65 ? 'ok' : station.score >= 0.35 ? 'mid' : 'no'}">
    {verdictLabel(station.score)} · ~{pct}% chance of a {cls.label}
  </div>

  <div class="stats">
    {#if mode === "route"}
      <div class="cell">
        <div class="v">{station.detourMin}'</div>
        <div class="l">detour</div>
      </div>
      <div class="cell">
        <div class="v">{formatKm(station.fromRouteKm * 1000)}</div>
        <div class="l">off route</div>
      </div>
    {:else}
      <div class="cell">
        <div class="v">
          {station.fromRouteKm > 0 ? formatKm(station.fromRouteKm * 1000) : "—"}
        </div>
        <div class="l">from you</div>
      </div>
      <div class="cell">
        <div class="v cap">{station.type}</div>
        <div class="l">branch</div>
      </div>
    {/if}
    <div class="cell">
      <div class="v">{station.fleet}</div>
      <div class="l">fleet</div>
    </div>
  </div>

  <p class="explain">{verdictText()}</p>

  <div class="info-row">
    <span>🕑 {station.hours}</span>
    <span>📍 {COUNTRY_NAMES[station.country] ?? station.country}</span>
  </div>

  <div class="models">
    <div class="m-label">{cls.label} cars Sixt may keep here</div>
    <div class="m-list">
      {#each models as m}
        <span class="m-chip">{m.brand} {m.model}</span>
      {/each}
    </div>
  </div>

  <div class="actions">
    <button class="btn ghost" on:click={openInMaps}>Open in Maps</button>
    {#if showRouteVia}
      <button class="btn primary" on:click={() => dispatch("routeVia", station)}>
        Route via here
      </button>
    {/if}
    {#if showPlanRoute}
      <button class="btn primary" on:click={() => dispatch("planRoute", station)}>
        Plan route here
      </button>
    {/if}
  </div>
</div>

<style>
  .detail { padding: 14px 16px 16px; }

  .head { display: flex; gap: 12px; align-items: flex-start; }
  .title { flex: 1; min-width: 0; }
  .title h3 { margin: 0; font-size: 17px; font-weight: 700; }
  .title p { margin: 3px 0 0; font-size: 13px; color: var(--muted); }
  .close {
    border: none;
    background: var(--surface-2);
    width: 28px; height: 28px;
    border-radius: 50%;
    color: var(--muted);
    font-size: 17px;
    line-height: 1;
    flex-shrink: 0;
  }

  .verdict-tag {
    margin: 12px 0 10px;
    padding: 7px 12px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
  }
  .verdict-tag.ok  { background: rgba(52,199,89,0.14);  color: #1f8a3b; }
  .verdict-tag.mid { background: rgba(255,159,10,0.16); color: #b9710a; }
  .verdict-tag.no  { background: rgba(255,59,48,0.13);  color: #c5362c; }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .cell {
    background: var(--surface-2);
    border-radius: 10px;
    padding: 9px 6px;
    text-align: center;
  }
  .cell .v { font-size: 16px; font-weight: 700; }
  .cell .v.cap { text-transform: capitalize; }
  .cell .l {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-top: 2px;
  }

  .explain {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-2);
    margin: 11px 0 8px;
  }

  .info-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 10px;
  }

  .models {
    background: var(--surface-2);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }
  .m-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-bottom: 7px;
  }
  .m-list { display: flex; flex-wrap: wrap; gap: 5px; }
  .m-chip {
    font-size: 12px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 3px 9px;
    color: var(--text-2);
  }

  .actions { display: flex; gap: 8px; }
  .btn {
    flex: 1;
    padding: 11px 8px;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    font-weight: 600;
  }
  .btn.ghost { background: var(--surface-2); color: var(--text); }
  .btn.primary { background: var(--blue); color: white; flex: 1.4; }
  .btn:active { transform: scale(0.97); }
</style>
