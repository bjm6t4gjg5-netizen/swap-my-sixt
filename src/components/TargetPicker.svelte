<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { CAR_CLASSES, CAR_CLASS_BY_ID, searchCars } from "../lib/cars";
  import { carColor } from "../lib/carVisuals";
  import { target } from "../lib/store";
  import type { CarClassId, CarModel } from "../lib/types";
  import CarArt from "./CarArt.svelte";

  const dispatch = createEventDispatcher<{ close: void }>();

  let query = "";
  $: results = query.trim() ? searchCars(query).slice(0, 10) : [];

  function pickAny() {
    target.set({ kind: "any" });
    dispatch("close");
  }
  function pickClass(id: CarClassId) {
    target.set({ kind: "class", classId: id });
    dispatch("close");
  }
  function pickModel(m: CarModel) {
    target.set({
      kind: "model",
      classId: m.classId,
      brand: m.brand,
      model: m.model,
      body: m.body
    });
    dispatch("close");
  }
  function tint(id: CarClassId) {
    return carColor(id) + "1f";
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="scrim"
  on:click={(e) => e.target === e.currentTarget && dispatch("close")}
>
  <div class="sheet" role="dialog" aria-modal="true">
    <div class="grab"></div>
    <div class="head">
      <h3>What are you hunting for?</h3>
      <button class="x" on:click={() => dispatch("close")} aria-label="Close">×</button>
    </div>

    <div class="searchbar">
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Search a specific car — BMW M3, Golf…"
        bind:value={query}
        autocomplete="off"
      />
      {#if query}
        <button class="clr" on:click={() => (query = "")} aria-label="Clear">×</button>
      {/if}
    </div>

    <div class="body">
      {#if results.length}
        <div class="reslist">
          {#each results as m}
            <button class="resrow" on:click={() => pickModel(m)}>
              <div class="resart" style="background:{tint(m.classId)}">
                <CarArt classId={m.classId} body={m.body} compact />
              </div>
              <div class="resinfo">
                <div class="resname">{m.brand} {m.model}</div>
                <div class="ressub">{CAR_CLASS_BY_ID[m.classId].label}</div>
              </div>
              <span class="pick">Pick</span>
            </button>
          {/each}
        </div>
      {:else if query.trim()}
        <div class="none">No car matches “{query.trim()}”.</div>
      {:else}
        <!-- reset / any -->
        <button class="any-row" on:click={pickAny}>
          <div class="any-ico">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M5 11l1.6-4.8A2 2 0 0 1 8.5 4.8h7A2 2 0 0 1 17.4 6.2L19 11M5 11h14M5 11v6M19 11v6M7 17h2M15 17h2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="any-txt">
            <b>Any car</b>
            <small>Reset — score stations by overall fleet</small>
          </div>
          {#if $target.kind === "any"}<span class="cur">Current</span>{/if}
        </button>

        <div class="grouplabel">Vehicle classes</div>
        <div class="grid">
          {#each CAR_CLASSES as c}
            <button
              class="ccard"
              class:on={$target.kind !== "any" && $target.classId === c.id}
              on:click={() => pickClass(c.id)}
            >
              <div class="cart" style="background:{tint(c.id)}">
                <CarArt classId={c.id} />
              </div>
              <div class="clabel">{c.label}</div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.42);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .sheet {
    background: var(--surface);
    width: 100%;
    max-width: 520px;
    max-height: 86vh;
    border-radius: 22px 22px 0 0;
    display: flex;
    flex-direction: column;
    padding-bottom: var(--safe-bottom);
    animation: slideup 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  }
  @keyframes slideup {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .grab {
    width: 36px;
    height: 5px;
    background: var(--line);
    border-radius: 3px;
    margin: 8px auto 2px;
    flex-shrink: 0;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px 8px;
    flex-shrink: 0;
  }
  .head h3 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
  .x {
    border: none;
    background: var(--surface-2);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: var(--muted);
    font-size: 18px;
    line-height: 1;
  }

  .searchbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 14px 6px;
    background: var(--surface-2);
    border-radius: 11px;
    padding: 10px 12px;
    color: var(--muted);
    flex-shrink: 0;
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
  .clr {
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 14px;
  }

  .body {
    overflow-y: auto;
    padding: 4px 14px 18px;
    -webkit-overflow-scrolling: touch;
  }

  /* any / reset */
  .any-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--surface-2);
    border: none;
    border-radius: 14px;
    text-align: left;
    margin-bottom: 14px;
  }
  .any-row:active { transform: scale(0.99); }
  .any-ico {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    background: var(--surface);
    display: grid;
    place-items: center;
    color: var(--text-2);
    flex-shrink: 0;
  }
  .any-txt { flex: 1; min-width: 0; }
  .any-txt b { font-size: 15px; }
  .any-txt small { display: block; font-size: 12px; color: var(--muted); margin-top: 1px; }
  .cur {
    font-size: 11px;
    font-weight: 700;
    color: var(--blue);
    background: var(--blue-soft);
    padding: 3px 8px;
    border-radius: 7px;
    flex-shrink: 0;
  }

  .grouplabel {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin: 0 2px 8px;
    font-weight: 600;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 9px;
  }
  .ccard {
    border: 1.5px solid transparent;
    background: var(--surface);
    box-shadow: var(--shadow-1);
    border-radius: 14px;
    overflow: hidden;
    padding: 0;
    text-align: left;
  }
  .ccard:active { transform: scale(0.97); }
  .ccard.on { border-color: var(--blue); }
  .cart { padding: 10px 10px 4px; }
  .clabel { padding: 4px 11px 10px; font-size: 13.5px; font-weight: 700; }

  /* search results */
  .reslist {
    background: var(--surface);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: var(--shadow-1);
  }
  .resrow {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 12px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .resrow:last-child { border-bottom: none; }
  .resrow:active { background: var(--surface-2); }
  .resart {
    width: 76px;
    flex-shrink: 0;
    border-radius: 10px;
    padding: 7px 6px 3px;
  }
  .resinfo { flex: 1; min-width: 0; }
  .resname { font-size: 14.5px; font-weight: 600; }
  .ressub { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .pick {
    flex-shrink: 0;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--blue);
    background: var(--blue-soft);
    padding: 6px 11px;
    border-radius: 9px;
  }
  .none { padding: 28px; text-align: center; color: var(--muted); font-size: 14px; }
</style>
