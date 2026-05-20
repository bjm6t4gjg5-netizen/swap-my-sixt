<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { STATIONS, STATION_BY_ID, COUNTRY_NAMES } from "../lib/stations";

  export let stationId = "";
  export let placeholder = "Search for a station…";

  const dispatch = createEventDispatcher<{ select: string }>();

  let editing = false;
  let text = "";

  $: selected = stationId ? STATION_BY_ID[stationId] : null;
  $: matches =
    editing && text.trim().length >= 1
      ? STATIONS.filter((s) => {
          const q = text.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.addr.toLowerCase().includes(q)
          );
        }).slice(0, 8)
      : [];

  function focus() {
    editing = true;
    text = "";
  }
  function blurSoon() {
    // delay so a click on a result still registers
    setTimeout(() => (editing = false), 160);
  }
  function pick(id: string) {
    dispatch("select", id);
    editing = false;
    text = "";
  }
  function clear() {
    dispatch("select", "");
    text = "";
  }
</script>

<div class="ssf">
  <div class="input-wrap">
    <svg class="lead" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"
        fill="currentColor"
      />
    </svg>
    <input
      type="text"
      {placeholder}
      value={editing ? text : selected ? selected.name : ""}
      on:focus={focus}
      on:blur={blurSoon}
      on:input={(e) => (text = e.currentTarget.value)}
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
    />
    {#if selected && !editing}
      <button class="clr" on:click={clear} aria-label="Clear">×</button>
    {/if}
  </div>

  {#if editing && matches.length}
    <div class="drop">
      {#each matches as s (s.id)}
        <button class="opt" on:mousedown|preventDefault={() => pick(s.id)}>
          <span class="o-name">{s.name}</span>
          <span class="o-sub">{COUNTRY_NAMES[s.country] ?? s.country}</span>
        </button>
      {/each}
    </div>
  {:else if editing && text.trim()}
    <div class="drop"><div class="none">No station matches “{text}”.</div></div>
  {/if}
</div>

<style>
  .ssf { position: relative; }
  .input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 0 10px;
    background: var(--surface);
  }
  .input-wrap:focus-within { border-color: var(--blue); }
  .lead { color: var(--red); flex-shrink: 0; }
  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    color: var(--text);
    padding: 10px 0;
  }
  .clr {
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 14px;
    flex-shrink: 0;
  }
  .drop {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 4px);
    z-index: 20;
    background: var(--surface);
    border-radius: 12px;
    box-shadow: var(--shadow-2);
    overflow: hidden;
    max-height: 260px;
    overflow-y: auto;
  }
  .opt {
    width: 100%;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .opt:last-child { border-bottom: none; }
  .opt:active { background: var(--surface-2); }
  .o-name { font-size: 14px; font-weight: 600; }
  .o-sub { font-size: 12px; color: var(--muted); flex-shrink: 0; }
  .none { padding: 14px; font-size: 13px; color: var(--muted); text-align: center; }
</style>
