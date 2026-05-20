<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Route, ScoredStation } from "../lib/types";
  import type { NamedPoint, Target } from "../lib/store";
  import { targetLabel } from "../lib/store";
  import { verdict, verdictLabel } from "../lib/heuristic";
  import { formatKm, formatDuration } from "../lib/geo";

  export let origin: NamedPoint;
  export let dest: NamedPoint;
  export let route: Route;
  export let stations: ScoredStation[];
  export let target: Target;
  export let viaStation: ScoredStation | null = null;

  const dispatch = createEventDispatcher<{ close: void }>();

  const generated = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  // ranked by odds for the recommendation callout
  $: ranked = [...stations].sort((a, b) => b.score - a.score);
  $: top = ranked.filter((s) => s.score >= 0.5).slice(0, 3);
  $: pct = (s: ScoredStation) => Math.round(s.score * 100);

  function doPrint() {
    window.print();
  }
</script>

<div class="overlay">
  <div class="toolbar no-print">
    <button class="t-close" on:click={() => dispatch("close")}>‹ Back</button>
    <span class="t-title">Strategy one-pager</span>
    <button class="t-print" on:click={doPrint}>Print / Save PDF</button>
  </div>

  <div class="paper print-root">
    <header class="doc-head">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="#ff5f00"/>
            <circle cx="12" cy="9" r="3" fill="#fff"/>
          </svg>
        </div>
        <div>
          <div class="doc-title">Sixt Swap Strategy</div>
          <div class="doc-sub">Generated {generated}</div>
        </div>
      </div>
    </header>

    <section class="route-band">
      <div class="rb-cell">
        <div class="rb-label">From</div>
        <div class="rb-val">{origin.label}</div>
      </div>
      <div class="rb-arrow">→</div>
      <div class="rb-cell">
        <div class="rb-label">To</div>
        <div class="rb-val">{dest.label}</div>
      </div>
      <div class="rb-stats">
        <div><b>{formatKm(route.distance)}</b><span>distance</span></div>
        <div><b>{formatDuration(route.duration)}</b><span>drive time</span></div>
        <div><b>{stations.length}</b><span>Sixt stops</span></div>
      </div>
    </section>

    <section class="hunting">
      <span class="h-label">Hunting for</span>
      <span class="h-val">{targetLabel(target)}</span>
      {#if viaStation}
        <span class="h-via">Route currently detours via {viaStation.name}</span>
      {/if}
    </section>

    {#if top.length}
      <section class="reco">
        <div class="reco-title">Recommended swap stops</div>
        <ol>
          {#each top as s}
            <li>
              <b>{s.name}</b> — ~{pct(s)}% chance, {s.detourMin} min detour,
              {Math.round(s.distFromStartKm)} km into the trip. {s.hours}.
            </li>
          {/each}
        </ol>
      </section>
    {:else}
      <section class="reco weak">
        <div class="reco-title">No strong swap stop on this route</div>
        <p>
          Nothing on this corridor scores above 50% for your target. Consider
          a different car class, or call ahead — the full list is below.
        </p>
      </section>
    {/if}

    <section class="table-wrap">
      <div class="tbl-title">All Sixt stations along the route</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Station</th>
            <th class="num">Into trip</th>
            <th class="num">Detour</th>
            <th class="num">Odds</th>
            <th>Verdict</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {#each stations as s, i}
            <tr>
              <td>{i + 1}</td>
              <td>
                <div class="st-name">{s.name}</div>
                <div class="st-addr">{s.addr}</div>
              </td>
              <td class="num">{Math.round(s.distFromStartKm)} km</td>
              <td class="num">+{s.detourMin}'</td>
              <td class="num">
                <span class="odds {verdict(s.score)}">{pct(s)}%</span>
              </td>
              <td>{verdictLabel(s.score)}</td>
              <td class="hours">{s.hours}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

    <footer class="doc-foot">
      Probabilities are a heuristic estimate based on branch type, fleet size,
      car class and opening hours — Sixt has no public availability feed. Always
      call the branch before a long detour. · Swap my Sixt
    </footer>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: #e9e9ee;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: calc(var(--safe-top) + 10px) 14px 10px;
    background: var(--material-2);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    box-shadow: var(--shadow-1);
  }
  .t-close,
  .t-print {
    border: none;
    font-size: 14px;
    font-weight: 600;
    border-radius: 100px;
    padding: 9px 16px;
  }
  .t-close { background: transparent; color: var(--blue); padding-left: 4px; }
  .t-print { background: var(--blue); color: white; }
  .t-title { font-size: 14px; font-weight: 700; }

  .paper {
    background: white;
    color: #16181d;
    max-width: 780px;
    margin: 16px auto;
    padding: 30px 34px 22px;
    box-shadow: var(--shadow-2);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
  }

  .doc-head {
    border-bottom: 2px solid #16181d;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo {
    width: 30px; height: 30px;
    background: #16181d;
    border-radius: 8px;
    display: grid;
    place-items: center;
  }
  .doc-title { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
  .doc-sub { font-size: 11px; color: #6b7280; }

  .route-band {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    background: #f5f5f7;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  .rb-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6b7280;
    font-weight: 700;
  }
  .rb-val { font-size: 14px; font-weight: 700; }
  .rb-arrow { font-size: 18px; color: #9aa0ab; }
  .rb-stats { display: flex; gap: 18px; margin-left: auto; }
  .rb-stats div { text-align: right; }
  .rb-stats b { font-size: 15px; display: block; }
  .rb-stats span { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }

  .hunting {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .h-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6b7280;
    font-weight: 700;
  }
  .h-val {
    font-size: 15px;
    font-weight: 800;
    color: #e05400;
  }
  .h-via { font-size: 11px; color: #6b7280; font-style: italic; }

  .reco {
    background: #eef7f0;
    border-left: 3px solid #34a853;
    border-radius: 0 8px 8px 0;
    padding: 11px 14px;
    margin-bottom: 16px;
  }
  .reco.weak { background: #fdf3e7; border-left-color: #e0900a; }
  .reco-title { font-weight: 800; font-size: 13px; margin-bottom: 5px; }
  .reco ol { margin: 0; padding-left: 18px; }
  .reco li { margin-bottom: 3px; }
  .reco p { margin: 0; }

  .tbl-title { font-weight: 800; font-size: 13px; margin-bottom: 7px; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    border-bottom: 1.5px solid #d1d5db;
    padding: 5px 6px;
  }
  th.num { text-align: right; }
  tbody td {
    padding: 7px 6px;
    border-bottom: 1px solid #e7e8ec;
    vertical-align: top;
  }
  td.num { text-align: right; white-space: nowrap; }
  .st-name { font-weight: 700; }
  .st-addr { font-size: 10px; color: #6b7280; }
  .hours { font-size: 11px; color: #4b5563; }
  .odds {
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 4px;
  }
  .odds.ok { background: #d8f0de; color: #1f7a37; }
  .odds.mid { background: #fceccf; color: #9a6206; }
  .odds.no { background: #f7d9d7; color: #b3322b; }

  .doc-foot {
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid #d1d5db;
    font-size: 10px;
    color: #6b7280;
    line-height: 1.5;
  }

  @media print {
    .paper {
      box-shadow: none;
      margin: 0;
      max-width: none;
      border-radius: 0;
      padding: 0;
    }
    .overlay { background: white; position: static; overflow: visible; }
  }
</style>
