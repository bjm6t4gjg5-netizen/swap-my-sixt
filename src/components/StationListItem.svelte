<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import type { ScoredStation } from "../lib/types";
  import { formatKm } from "../lib/geo";

  export let station: ScoredStation;
  /** "detour" shows +min detour; "distance" shows straight-line distance. */
  export let mode: "detour" | "distance" = "detour";

  const dispatch = createEventDispatcher<{ select: ScoredStation }>();
  $: typeLabel = station.type[0].toUpperCase() + station.type.slice(1);
</script>

<button class="item" on:click={() => dispatch("select", station)}>
  <ProbabilityBadge score={station.score} size="sm" />
  <div class="info">
    <div class="name">{station.name}</div>
    <div class="meta">{typeLabel} · fleet {station.fleet} · {station.hours}</div>
  </div>
  <div class="right">
    {#if mode === "detour"}
      <div class="num">+{station.detourMin}'</div>
      <div class="sub">detour</div>
    {:else}
      <div class="num">{formatKm(station.fromRouteKm * 1000)}</div>
      <div class="sub">away</div>
    {/if}
  </div>
</button>

<style>
  .item {
    width: 100%;
    display: grid;
    grid-template-columns: 34px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .item:active { background: var(--surface-2); }

  .info { min-width: 0; }
  .name {
    font-size: 15px;
    font-weight: 600;
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
  .right { text-align: right; flex-shrink: 0; }
  .num { font-size: 14px; font-weight: 600; color: var(--text); }
  .sub { font-size: 11px; color: var(--muted); }
</style>
