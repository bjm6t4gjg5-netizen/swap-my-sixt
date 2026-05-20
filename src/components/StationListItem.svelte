<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import type { ScoredStation } from "../lib/types";
  import { formatKm } from "../lib/geo";
  import { verdict } from "../lib/heuristic";

  export let station: ScoredStation;
  /** "detour" shows +min detour; "distance" shows straight-line distance. */
  export let mode: "detour" | "distance" = "detour";

  const dispatch = createEventDispatcher<{ select: ScoredStation }>();

  $: typeLabel = station.type[0].toUpperCase() + station.type.slice(1);
  $: v = verdict(station.score);
  $: offRoute = station.fromRouteKm > 0.4;
</script>

<button class="item {v}" on:click={() => dispatch("select", station)}>
  <span class="accent" aria-hidden="true"></span>
  <ProbabilityBadge score={station.score} size="md" />
  <div class="mid">
    <div class="name">{station.name}</div>
    <div class="meta">
      <span class="type">{typeLabel}</span>
      {#if mode === "detour"}
        <span class="sep">·</span>
        <span>{formatKm(station.distFromStartKm * 1000)} in</span>
        {#if offRoute}
          <span class="sep">·</span>
          <span class="off">{formatKm(station.fromRouteKm * 1000)} off route</span>
        {/if}
      {:else}
        <span class="sep">·</span>
        <span>fleet {station.fleet}</span>
      {/if}
    </div>
  </div>
  <div class="trail">
    {#if mode === "detour"}
      <div class="pill">+{station.detourMin}<span class="u">min</span></div>
      <div class="trail-sub">detour</div>
    {:else}
      <div class="pill">{Math.round(station.fromRouteKm)}<span class="u">km</span></div>
      <div class="trail-sub">away</div>
    {/if}
  </div>
</button>

<style>
  .item {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 40px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px 14px 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .item:last-child { border-bottom: none; }
  .item:active { background: var(--surface-2); }

  .accent {
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 4px;
    border-radius: 0 3px 3px 0;
  }
  .item.ok .accent { background: var(--green); }
  .item.mid .accent { background: var(--yellow); }
  .item.no .accent { background: var(--red); }

  .mid { min-width: 0; }
  .name {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
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
  .type { color: var(--text-2); font-weight: 600; }
  .sep { margin: 0 5px; opacity: 0.6; }
  .off { color: var(--orange-dark); }

  .trail {
    text-align: right;
    flex-shrink: 0;
  }
  .pill {
    font-size: 15px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .pill .u {
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
    margin-left: 2px;
  }
  .trail-sub {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-top: 1px;
  }
</style>
