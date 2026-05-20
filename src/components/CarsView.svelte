<script lang="ts">
  import {
    CAR_CLASSES,
    CAR_MODELS,
    modelsInClass,
    searchCars
  } from "../lib/cars";
  import { carClass } from "../lib/store";
  import type { CarClassId, CarModel } from "../lib/types";

  let query = "";
  let expanded: CarClassId | null = $carClass;

  $: results = query.trim() ? searchCars(query) : [];
  $: classOf = (id: CarClassId) =>
    CAR_CLASSES.find((c) => c.id === id)!;

  function toggle(id: CarClassId) {
    expanded = expanded === id ? null : id;
  }

  function setTarget(id: CarClassId) {
    carClass.set(id);
  }

  function modelClassLabel(m: CarModel): string {
    return classOf(m.classId).label;
  }
</script>

<div class="view">
  <div class="intro">
    <h2>Car catalogue</h2>
    <p>
      Browse every Sixt class, see which models sit inside each, or search by
      brand and model. Pick a class as your <em>target</em> — the rest of the
      app then scores stations for that choice.
    </p>
  </div>

  <div class="searchbar">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <input
      type="text"
      placeholder="Search brand or model — e.g. BMW M3, Tesla, Golf"
      bind:value={query}
    />
    {#if query}
      <button class="clear" on:click={() => (query = "")} aria-label="Clear">×</button>
    {/if}
  </div>

  {#if query.trim()}
    <div class="results-head">
      {results.length}
      {results.length === 1 ? "match" : "matches"} for "{query.trim()}"
    </div>
    <div class="card list">
      {#each results as m}
        <div class="model-row">
          <div class="m-main">
            <div class="m-name">{m.brand} {m.model}</div>
            <div class="m-tags">
              <span class="tag">{modelClassLabel(m)}</span>
              {#if m.ev}<span class="tag ev">Electric</span>{/if}
              {#if m.awd}<span class="tag">AWD</span>{/if}
              {#if m.performance}<span class="tag perf">Performance</span>{/if}
              {#if m.cabrio}<span class="tag">Convertible</span>{/if}
            </div>
          </div>
          <button
            class="target-btn"
            class:on={$carClass === m.classId}
            on:click={() => setTarget(m.classId)}
          >
            {$carClass === m.classId ? "Target ✓" : "Set target"}
          </button>
        </div>
      {:else}
        <div class="nores">No models match that search.</div>
      {/each}
    </div>
  {:else}
    <div class="class-grid">
      {#each CAR_CLASSES as c}
        {@const models = modelsInClass(c.id)}
        <div class="class-card" class:target={$carClass === c.id}>
          <button class="class-head" on:click={() => toggle(c.id)}>
            <div class="ch-left">
              <div class="ch-title">
                {c.label}
                {#if $carClass === c.id}<span class="dot-target">●</span>{/if}
              </div>
              <div class="ch-desc">{c.description}</div>
            </div>
            <div class="ch-right">
              <span class="count">{models.length}</span>
              <svg
                class="chev"
                class:open={expanded === c.id}
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </button>

          {#if expanded === c.id}
            <div class="class-body">
              <div class="acriss">ACRISS ≈ {c.acriss}</div>
              <div class="model-chips">
                {#each models as m}
                  <span class="model-chip">{m.brand} {m.model}</span>
                {/each}
              </div>
              <button
                class="hunt-btn"
                class:on={$carClass === c.id}
                on:click={() => setTarget(c.id)}
              >
                {$carClass === c.id ? "This is your target ✓" : `Hunt for a ${c.label}`}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="footnote">
      {CAR_MODELS.length} representative models across {CAR_CLASSES.length}
      classes. Sixt's real fleet rotates constantly — treat this as a guide.
    </div>
  {/if}
</div>

<style>
  .view { padding: 14px 12px 60px; max-width: 720px; margin: 0 auto; }

  .intro h2 { margin: 4px 4px 4px; font-size: 21px; font-weight: 800; }
  .intro p {
    margin: 0 4px 14px;
    font-size: 13.5px;
    color: var(--text-2);
    line-height: 1.5;
  }
  .intro em { color: var(--orange-dark); font-style: normal; font-weight: 600; }

  .searchbar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border-radius: 12px;
    padding: 10px 12px;
    box-shadow: var(--shadow-1);
    color: var(--muted);
    margin-bottom: 14px;
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

  .results-head {
    font-size: 12px;
    color: var(--muted);
    margin: 0 4px 8px;
  }

  .card {
    background: var(--surface);
    border-radius: 14px;
    box-shadow: var(--shadow-1);
    overflow: hidden;
  }
  .model-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--line-soft);
  }
  .model-row:last-child { border-bottom: none; }
  .m-main { flex: 1; min-width: 0; }
  .m-name { font-size: 15px; font-weight: 600; }
  .m-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
  .tag {
    font-size: 11px;
    background: var(--surface-2);
    color: var(--text-2);
    border-radius: 6px;
    padding: 2px 7px;
  }
  .tag.ev { background: rgba(52,199,89,0.16); color: #1f8a3b; }
  .tag.perf { background: rgba(255,59,48,0.13); color: #c5362c; }

  .target-btn {
    flex-shrink: 0;
    border: 1px solid var(--blue);
    background: var(--surface);
    color: var(--blue);
    font-size: 12.5px;
    font-weight: 600;
    padding: 7px 11px;
    border-radius: 9px;
  }
  .target-btn.on { background: var(--blue); color: white; }

  .nores { padding: 22px; text-align: center; color: var(--muted); font-size: 14px; }

  .class-grid { display: flex; flex-direction: column; gap: 9px; }
  .class-card {
    background: var(--surface);
    border-radius: 14px;
    box-shadow: var(--shadow-1);
    overflow: hidden;
    border: 1.5px solid transparent;
  }
  .class-card.target { border-color: var(--blue); }

  .class-head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    background: transparent;
    border: none;
    text-align: left;
  }
  .ch-left { flex: 1; min-width: 0; }
  .ch-title {
    font-size: 15.5px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dot-target { color: var(--blue); font-size: 10px; }
  .ch-desc { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
  .ch-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .count {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
    background: var(--surface-2);
    border-radius: 9px;
    padding: 3px 8px;
  }
  .chev { color: var(--muted); transition: transform 0.18s ease; }
  .chev.open { transform: rotate(180deg); }

  .class-body { padding: 0 14px 14px; }
  .acriss {
    font-size: 11px;
    color: var(--muted);
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    margin-bottom: 8px;
  }
  .model-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
  .model-chip {
    font-size: 12px;
    background: var(--surface-2);
    border: 1px solid var(--line-soft);
    border-radius: 12px;
    padding: 4px 9px;
    color: var(--text-2);
  }
  .hunt-btn {
    width: 100%;
    border: none;
    background: var(--surface-2);
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    padding: 11px;
    border-radius: 10px;
  }
  .hunt-btn.on { background: var(--blue); color: white; }

  .footnote {
    margin: 16px 6px 0;
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
  }
</style>
