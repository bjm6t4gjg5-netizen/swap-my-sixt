<script lang="ts">
  import { STATIONS, COUNTRY_NAMES } from "../lib/stations";
  import { computeScore } from "../lib/heuristic";
  import { haversineKm } from "../lib/geo";
  import { carClass, myLocation, requestNavigation } from "../lib/store";
  import { CAR_CLASS_BY_ID } from "../lib/cars";
  import type { ScoredStation } from "../lib/types";
  import ClassPicker from "./ClassPicker.svelte";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import StationDetail from "./StationDetail.svelte";

  let query = "";
  let country = "ALL";
  let sort: "odds" | "az" | "near" = "odds";
  let selected: ScoredStation | null = null;

  // counts per country, for the filter chips
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
        s.name.toLowerCase().includes(q) ||
        s.addr.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "near") return a.fromRouteKm - b.fromRouteKm;
      return b.score - a.score;
    });

  $: targetLabel = CAR_CLASS_BY_ID[$carClass].label;

  function planFromStation(s: ScoredStation) {
    requestNavigation({
      origin: { lat: s.lat, lng: s.lng, label: s.name },
      carClass: $carClass
    });
  }
</script>

<div class="view">
  <div class="intro">
    <h2>All Sixt stations</h2>
    <p>
      {STATIONS.length} branches worldwide, each scored live for your target
      class — currently <strong>{targetLabel}</strong>.
    </p>
  </div>

  <div class="sticky">
    <ClassPicker label="" />

    <div class="searchbar">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input type="text" placeholder="Search station or city" bind:value={query} />
      {#if query}
        <button class="clear" on:click={() => (query = "")} aria-label="Clear">×</button>
      {/if}
    </div>

    <div class="chips">
      <button class="chip" class:on={country === "ALL"} on:click={() => (country = "ALL")}>
        All · {STATIONS.length}
      </button>
      {#each countries as c}
        <button class="chip" class:on={country === c} on:click={() => (country = c)}>
          {COUNTRY_NAMES[c] ?? c} · {countryCounts[c]}
        </button>
      {/each}
    </div>

    <div class="sortrow">
      <span class="sr-label">{filtered.length} shown</span>
      <div class="sort-toggle">
        <button class:on={sort === "odds"} on:click={() => (sort = "odds")}>Best odds</button>
        <button class:on={sort === "az"} on:click={() => (sort = "az")}>A–Z</button>
        <button
          class:on={sort === "near"}
          class:disabled={!$myLocation}
          on:click={() => $myLocation && (sort = "near")}
        >Nearest</button>
      </div>
    </div>
  </div>

  <div class="list">
    {#each filtered as s (s.id)}
      <button class="row" on:click={() => (selected = s)}>
        <ProbabilityBadge score={s.score} size="sm" />
        <div class="info">
          <div class="name">{s.name}</div>
          <div class="meta">
            {s.addr}
          </div>
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
</div>

{#if selected}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="modal-scrim"
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
  .view { padding: 14px 0 60px; max-width: 720px; margin: 0 auto; }

  .intro { padding: 0 16px; }
  .intro h2 { margin: 4px 0; font-size: 21px; font-weight: 800; }
  .intro p { margin: 0 0 12px; font-size: 13.5px; color: var(--text-2); line-height: 1.5; }
  .intro strong { color: var(--orange-dark); }

  .sticky {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--bg);
    padding: 8px 0 6px;
    border-bottom: 1px solid var(--line-soft);
  }

  .searchbar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border-radius: 11px;
    padding: 9px 12px;
    box-shadow: var(--shadow-1);
    color: var(--muted);
    margin: 8px 12px;
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

  .chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 2px 12px 6px;
    scrollbar-width: none;
  }
  .chips::-webkit-scrollbar { display: none; }
  .chip {
    flex-shrink: 0;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text-2);
    padding: 6px 11px;
    border-radius: 14px;
    font-size: 12.5px;
    white-space: nowrap;
  }
  .chip.on { background: var(--blue); color: white; border-color: var(--blue); }

  .sortrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 14px 0;
  }
  .sr-label { font-size: 12px; color: var(--muted); }
  .sort-toggle {
    display: flex;
    background: var(--surface-3);
    border-radius: 8px;
    padding: 2px;
  }
  .sort-toggle button {
    border: none;
    background: transparent;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);
    padding: 5px 9px;
    border-radius: 6px;
  }
  .sort-toggle button.on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-1); }
  .sort-toggle button.disabled { opacity: 0.4; }

  .list {
    background: var(--surface);
    margin: 10px 12px 0;
    border-radius: 14px;
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

  .modal-scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 12px;
  }
  .modal {
    background: var(--surface);
    border-radius: 16px;
    box-shadow: var(--shadow-2);
    width: 100%;
    max-width: 460px;
    max-height: 86vh;
    overflow-y: auto;
  }
  @media (min-width: 560px) {
    .modal-scrim { align-items: center; }
  }
</style>
