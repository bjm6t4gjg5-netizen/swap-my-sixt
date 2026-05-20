<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import type { ScoredStation } from "../lib/types";
  import { verdictLabel } from "../lib/heuristic";
  import { CAR_CLASS_BY_ID, modelsInClass } from "../lib/cars";
  import { COUNTRY_NAMES } from "../lib/stations";
  import { formatKm } from "../lib/geo";
  import { targetClassId, type Target } from "../lib/store";
  import { sixtPhone, sixtPhoneDisplay, sixtSiteUrl } from "../lib/sixt";
  import MapsMenu from "./MapsMenu.svelte";

  let showMaps = false;

  export let station: ScoredStation;
  export let target: Target;
  export let showRouteVia = false;
  /** "route" shows detour stats; "browse" shows straight-line distance. */
  export let mode: "route" | "browse" = "route";
  export let showPlanRoute = false;

  const dispatch = createEventDispatcher<{
    close: void;
    routeVia: ScoredStation;
    planRoute: ScoredStation;
  }>();

  $: classId = targetClassId(target);
  $: className = classId ? CAR_CLASS_BY_ID[classId].label : "";
  $: pct = Math.round(station.score * 100);
  $: models = classId ? modelsInClass(classId) : [];
  $: wanted =
    target.kind === "any"
      ? "a car"
      : target.kind === "model"
        ? `a ${target.brand} ${target.model}`
        : `a ${CAR_CLASS_BY_ID[target.classId].label}`;

  function verdictText(): string {
    const detour =
      mode === "route" ? ` the ${station.detourMin}-minute detour` : " a detour";
    if (station.score >= 0.65) {
      return `Strong odds of ${wanted} here — a large fleet and a fast-turnover branch. Worth${detour}.`;
    }
    if (station.score >= 0.35) {
      return `This branch may not keep ${wanted} on hand. Phone ahead before committing to${detour}.`;
    }
    return `A small or off-hours branch — ${wanted} is unlikely to be sitting ready. Skip unless you have called and confirmed.`;
  }

  $: centralPhone = sixtPhone(station.country);
  $: centralPhoneLabel = sixtPhoneDisplay(station.country);

  function callSixt() {
    if (centralPhone) {
      window.location.href = `tel:${centralPhone}`;
    } else {
      // No verified central line for this country — surface the Maps listing.
      const q = encodeURIComponent(`${station.name} ${station.addr}`);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${q}`,
        "_blank",
        "noopener"
      );
    }
  }

  function checkLive() {
    window.open(sixtSiteUrl(station.country), "_blank", "noopener");
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
    {verdictLabel(station.score)} · ~{pct}% chance of {wanted}
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

  {#if classId}
    <div class="models">
      <div class="m-label">{className} cars Sixt may keep here</div>
      <div class="m-list">
        {#each models as m}
          <span
            class="m-chip"
            class:hi={target.kind === "model" &&
              m.brand === target.brand &&
              m.model === target.model}
          >{m.brand} {m.model}</span>
        {/each}
      </div>
    </div>
  {/if}

  <div class="actions">
    <button class="btn ghost" on:click={() => (showMaps = true)}>Send to Maps</button>
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

  <div class="contact-row">
    <button class="contact-link" on:click={callSixt}>
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          d="M6.6 10.8a13 13 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1z"
          fill="currentColor"
        />
      </svg>
      {centralPhone ? `Call Sixt · ${centralPhoneLabel}` : "Find phone number"}
    </button>
    <button class="contact-link" on:click={checkLive}>
      Check live on Sixt ↗
    </button>
  </div>

  <p class="phone-note">
    {#if centralPhone}
      That's Sixt's central reservation line — branches have no public direct
      numbers. For a branch's Maps listing, use “Send to Maps”. Live car
      availability can only be confirmed on sixt.com or by phone.
    {:else}
      Sixt routes most branches through a central line. Live availability can
      only be confirmed on sixt.com or by phone.
    {/if}
  </p>
</div>

{#if showMaps}
  <MapsMenu
    targets={[{ label: station.name, lat: station.lat, lng: station.lng }]}
    on:close={() => (showMaps = false)}
  />
{/if}

<style>
  .detail { padding: 14px 16px 14px; }

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
  .m-chip.hi {
    background: var(--blue);
    border-color: var(--blue);
    color: white;
    font-weight: 600;
  }

  .actions { display: flex; gap: 8px; }
  .btn {
    flex: 1;
    padding: 11px 8px;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .btn.ghost { background: var(--surface-2); color: var(--text); }
  .btn.primary { background: var(--blue); color: white; flex: 1.5; }
  .btn:active { transform: scale(0.97); }

  .contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 9px;
  }
  .contact-link {
    flex: 1;
    min-width: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: var(--surface-2);
    border: 1px solid var(--line-soft);
    border-radius: 9px;
    padding: 9px 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--blue);
  }
  .contact-link:active { transform: scale(0.98); }

  .phone-note {
    margin: 9px 2px 0;
    font-size: 11px;
    color: var(--muted);
    line-height: 1.45;
  }
</style>
