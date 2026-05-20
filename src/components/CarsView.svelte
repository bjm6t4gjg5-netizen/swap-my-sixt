<script lang="ts">
  import {
    CAR_CLASSES,
    CAR_CLASS_BY_ID,
    CAR_MODELS,
    modelsInClass,
    searchCars,
    carPhotoSearchUrl
  } from "../lib/cars";
  import { carColor } from "../lib/carVisuals";
  import { target, type Target } from "../lib/store";
  import type { CarClassId, CarModel } from "../lib/types";
  import CarArt from "./CarArt.svelte";
  import AcrissGuide from "./AcrissGuide.svelte";

  let query = "";
  let openClass: CarClassId | null = null;
  let showAcriss = false;

  // car classes grouped into sensible sections
  const CLASS_GROUPS: { title: string; ids: CarClassId[] }[] = [
    { title: "Small & compact", ids: ["mini", "economy", "compact", "midsize"] },
    { title: "Sedans", ids: ["intermediate", "premium", "premiumPlus", "luxury"] },
    { title: "SUVs", ids: ["suvSmall", "suvMid", "suvPremium", "suvLuxury"] },
    { title: "Performance & open-top", ids: ["sport", "sportPlus", "convertible"] },
    { title: "Electric", ids: ["electric"] },
    { title: "Vans & transport", ids: ["van", "transporter"] }
  ];

  $: results = query.trim() ? searchCars(query) : [];
  $: detail = openClass ? CAR_CLASS_BY_ID[openClass] : null;

  function setClassTarget(id: CarClassId) {
    target.set({ kind: "class", classId: id });
  }
  function setModelTarget(m: CarModel) {
    target.set({
      kind: "model",
      classId: m.classId,
      brand: m.brand,
      model: m.model,
      body: m.body
    });
  }
  function isClassTarget(t: Target, id: CarClassId): boolean {
    return t.kind !== "any" && t.classId === id;
  }
  function isModelTarget(t: Target, m: CarModel): boolean {
    return t.kind === "model" && t.brand === m.brand && t.model === m.model;
  }
  /** soft tinted background from the class colour */
  function tint(id: CarClassId, alphaHex: string) {
    return carColor(id) + alphaHex;
  }
  function openPhotos(m: CarModel) {
    window.open(carPhotoSearchUrl(m.brand, m.model), "_blank", "noopener");
  }
</script>

<div class="view">
  <header class="vhead">
    <h2>Car catalogue</h2>
    <p>
      Every Sixt class and the models inside it. Search a brand or model, or
      tap a class to make it your <em>target</em> — the app then scores
      stations for that choice.
    </p>
  </header>

  <button class="acriss-link" on:click={() => (showAcriss = true)}>
    <span class="al-ico">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M12 11v5M12 7.5v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    </span>
    <span class="al-text">
      New to <b>ACRISS / SIPP codes</b>? Learn what PDAR, EDMR… mean
    </span>
    <span class="al-go">›</span>
  </button>

  <div class="searchbar">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <input
      type="text"
      placeholder="Search — BMW M3, Avant, Cabrio…"
      bind:value={query}
    />
    {#if query}
      <button class="clear" on:click={() => (query = "")} aria-label="Clear">×</button>
    {/if}
  </div>

  {#if query.trim()}
    <div class="res-head">
      {results.length} {results.length === 1 ? "match" : "matches"}
    </div>
    <div class="res-list">
      {#each results as m}
        <div
          class="res-row"
          role="button"
          tabindex="0"
          on:click={() => (openClass = m.classId)}
          on:keydown={(e) =>
            (e.key === "Enter" || e.key === " ") && (openClass = m.classId)}
        >
          <div class="res-art" style="background:{tint(m.classId, '14')}">
            <CarArt classId={m.classId} body={m.body} brand={m.brand} compact />
          </div>
          <div class="res-info">
            <div class="res-name">{m.brand} {m.model}</div>
            <div class="res-tags">
              <span class="tag">{CAR_CLASS_BY_ID[m.classId].label}</span>
              {#if m.ev}<span class="tag ev">Electric</span>{/if}
              {#if m.awd}<span class="tag">AWD</span>{/if}
              {#if m.performance}<span class="tag perf">Performance</span>{/if}
              {#if m.cabrio}<span class="tag">Convertible</span>{/if}
            </div>
          </div>
          <button
            class="mini-target"
            class:on={isModelTarget($target, m)}
            on:click|stopPropagation={() => setModelTarget(m)}
          >
            {isModelTarget($target, m) ? "✓" : "Target"}
          </button>
        </div>
      {:else}
        <div class="none">No models match “{query.trim()}”.</div>
      {/each}
    </div>
  {:else}
    {#each CLASS_GROUPS as g}
      <div class="group-title">{g.title}</div>
      <div class="grid">
        {#each g.ids as id}
          {@const c = CAR_CLASS_BY_ID[id]}
          {@const count = modelsInClass(id).length}
          <button
            class="card"
            class:target={isClassTarget($target, id)}
            on:click={() => (openClass = id)}
          >
            <div class="card-art" style="background:{tint(id, '1f')}">
              <CarArt classId={id} />
              {#if isClassTarget($target, id)}
                <span class="tgt-badge">Target</span>
              {/if}
            </div>
            <div class="card-foot">
              <div class="card-title">{c.label}</div>
              <div class="card-sub">{count} models</div>
            </div>
          </button>
        {/each}
      </div>
    {/each}

    <p class="foot">
      {CAR_MODELS.length} representative models · {CAR_CLASSES.length} classes.
      Sixt's real fleet rotates constantly — treat this as a guide.
    </p>
  {/if}
</div>

{#if showAcriss}
  <AcrissGuide on:close={() => (showAcriss = false)} />
{/if}

<!-- ============ CLASS DETAIL MODAL ============ -->
{#if detail}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="scrim"
    on:click={(e) => e.target === e.currentTarget && (openClass = null)}
  >
    <div class="modal" role="dialog" aria-modal="true">
      <div class="m-art" style="background:{tint(detail.id, '24')}">
        <button class="m-close" on:click={() => (openClass = null)} aria-label="Close">×</button>
        <CarArt classId={detail.id} />
      </div>
      <div class="m-body">
        <div class="m-titlerow">
          <h3>{detail.label}</h3>
          <span class="m-acriss">{detail.acriss}</span>
        </div>
        <p class="m-desc">{detail.description}</p>

        <div class="m-modlabel">Models in this class</div>
        <div class="m-modelgrid">
          {#each modelsInClass(detail.id) as m}
            <button class="modelcard" on:click={() => openPhotos(m)}>
              <div class="mc-art" style="background:{tint(detail.id, '14')}">
                <CarArt classId={m.classId} body={m.body} brand={m.brand} />
              </div>
              <div class="mc-name">{m.brand} {m.model}</div>
              <div class="mc-photos">View photos ↗</div>
            </button>
          {/each}
        </div>

        <button
          class="m-target"
          class:on={isClassTarget($target, detail.id)}
          on:click={() => setClassTarget(detail.id)}
        >
          {isClassTarget($target, detail.id)
            ? "✓ This is your target"
            : `Hunt for a ${detail.label}`}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .view { padding: 16px 14px 70px; max-width: 880px; margin: 0 auto; }

  .vhead h2 { margin: 2px 2px 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
  .vhead p { margin: 0 2px 16px; font-size: 14px; color: var(--text-2); line-height: 1.5; }
  .vhead em { color: var(--orange-dark); font-style: normal; font-weight: 600; }

  .acriss-link {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: var(--blue-soft);
    border: none;
    border-radius: 13px;
    padding: 11px 13px;
    margin-bottom: 10px;
    color: var(--blue);
  }
  .acriss-link:active { transform: scale(0.99); }
  .al-ico { flex-shrink: 0; display: grid; place-items: center; }
  .al-text { flex: 1; font-size: 13px; color: var(--text-2); line-height: 1.4; }
  .al-text b { color: var(--text); }
  .al-go { font-size: 18px; color: var(--blue); flex-shrink: 0; }

  .searchbar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border-radius: 13px;
    padding: 11px 13px;
    box-shadow: var(--shadow-1);
    color: var(--muted);
    margin-bottom: 16px;
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

  /* ---- card grid ---- */
  .group-title {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin: 18px 4px 9px;
  }
  .group-title:first-child { margin-top: 4px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 11px;
  }
  .card {
    border: none;
    background: var(--surface);
    border-radius: 18px;
    box-shadow: var(--shadow-1);
    overflow: hidden;
    padding: 0;
    text-align: left;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }
  .card:active { transform: scale(0.97); }
  .card.target { box-shadow: 0 0 0 2px var(--blue), var(--shadow-1); }
  .card-art {
    padding: 16px 14px 8px;
    position: relative;
  }
  .tgt-badge {
    position: absolute;
    top: 9px;
    left: 9px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    background: var(--blue);
    padding: 3px 7px;
    border-radius: 7px;
  }
  .card-foot { padding: 8px 14px 13px; }
  .card-title { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
  .card-sub { font-size: 12px; color: var(--muted); margin-top: 1px; }

  .foot {
    margin: 18px 6px 0;
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
  }

  /* ---- search results ---- */
  .res-head { font-size: 12px; color: var(--muted); margin: 0 4px 8px; }
  .res-list {
    background: var(--surface);
    border-radius: 16px;
    box-shadow: var(--shadow-1);
    overflow: hidden;
  }
  .res-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .res-row:last-child { border-bottom: none; }
  .res-row:active { background: var(--surface-2); }
  .res-art {
    width: 84px;
    flex-shrink: 0;
    border-radius: 11px;
    padding: 8px 7px 4px;
    display: flex;
    align-items: center;
  }
  .res-info { flex: 1; min-width: 0; }
  .res-name { font-size: 14.5px; font-weight: 600; }
  .res-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
  .tag {
    font-size: 10.5px;
    background: var(--surface-2);
    color: var(--text-2);
    border-radius: 6px;
    padding: 2px 7px;
  }
  .tag.ev { background: rgba(52,199,89,0.16); color: #1f8a3b; }
  .tag.perf { background: rgba(255,59,48,0.13); color: #c5362c; }
  .mini-target {
    flex-shrink: 0;
    border: 1px solid var(--blue);
    background: var(--surface);
    color: var(--blue);
    font-size: 12px;
    font-weight: 700;
    padding: 7px 10px;
    border-radius: 9px;
    min-width: 40px;
  }
  .mini-target.on { background: var(--blue); color: white; }
  .none { padding: 24px; text-align: center; color: var(--muted); font-size: 14px; }

  /* ---- modal ---- */
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
    border-radius: 22px;
    box-shadow: var(--shadow-2);
    width: 100%;
    max-width: 440px;
    max-height: 88vh;
    overflow-y: auto;
  }
  .m-art { padding: 22px 24px 14px; position: relative; }
  .m-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.7);
    color: var(--text-2);
    font-size: 18px;
    line-height: 1;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .m-body { padding: 4px 18px 20px; }
  .m-titlerow {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }
  .m-titlerow h3 { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.02em; }
  .m-acriss {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--surface-2);
    padding: 3px 8px;
    border-radius: 7px;
  }
  .m-desc { font-size: 13.5px; color: var(--text-2); line-height: 1.5; margin: 8px 0 14px; }
  .m-modlabel {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .m-modelgrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 9px;
    margin-bottom: 16px;
  }
  .modelcard {
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 13px;
    overflow: hidden;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
  .modelcard:active { transform: scale(0.98); }
  .mc-art { padding: 10px 10px 4px; }
  .mc-name {
    padding: 4px 11px 1px;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text);
  }
  .mc-photos {
    padding: 0 11px 9px;
    font-size: 11px;
    font-weight: 600;
    color: var(--blue);
  }
  .m-target {
    width: 100%;
    border: none;
    background: var(--surface-2);
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
    padding: 13px;
    border-radius: 13px;
  }
  .m-target.on { background: var(--blue); color: white; }
  .m-target:active { transform: scale(0.98); }

  @media (min-width: 600px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 860px) {
    .grid { grid-template-columns: repeat(4, 1fr); }
  }
  @media (min-width: 560px) {
    .scrim { align-items: center; }
  }
</style>
