<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { geocode, type Place } from "../lib/geocoding";
  import type { LatLng } from "../lib/types";
  import type { NamedPoint, RecentPlace } from "../lib/store";

  export let origin: NamedPoint | null = null;
  export let dest: NamedPoint | null = null;
  /** Custom intermediate stops — `point` is null until the user fills it in. */
  export let stops: { id: string; point: NamedPoint | null }[] = [];
  export let myLocation: LatLng | null = null;
  export let recents: RecentPlace[] = [];
  export let busy = false;
  export let maxStops = 4;

  // `field` is "origin", "dest", or a stop id.
  const dispatch = createEventDispatcher<{
    pick: { field: string; point: NamedPoint };
    locate: void;
    swap: void;
    clear: { field: string };
    addStop: void;
    removeStop: { id: string };
  }>();

  let editing: string | null = null;
  let editText = "";
  let suggestions: Place[] = [];
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let searching = false;

  function labelFor(field: string): string {
    if (field === "origin") return origin?.label ?? "";
    if (field === "dest") return dest?.label ?? "";
    return stops.find((s) => s.id === field)?.point?.label ?? "";
  }

  function onInput(value: string) {
    editText = value;
    clearTimeout(searchTimer);
    if (value.trim().length < 2) {
      suggestions = [];
      return;
    }
    searching = true;
    searchTimer = setTimeout(async () => {
      try {
        suggestions = await geocode(value, myLocation);
      } catch {
        suggestions = [];
      } finally {
        searching = false;
      }
    }, 280);
  }

  function focusField(field: string, ev: FocusEvent) {
    editing = field;
    suggestions = [];
    // prefill with the current value so the field never looks empty,
    // and select it so typing replaces it
    editText = labelFor(field);
    const el = ev.currentTarget as HTMLInputElement | null;
    if (el) requestAnimationFrame(() => el.select());
  }

  function onBlur() {
    // delay so a click/tap on a suggestion still registers first
    setTimeout(() => {
      editing = null;
      suggestions = [];
    }, 200);
  }

  function pickPlace(p: Place) {
    if (!editing) return;
    dispatch("pick", {
      field: editing,
      point: { lat: p.lat, lng: p.lng, label: p.shortName }
    });
    finishEditing();
  }

  function pickRecent(r: RecentPlace) {
    if (!editing) return;
    dispatch("pick", {
      field: editing,
      point: { lat: r.lat, lng: r.lng, label: r.label }
    });
    finishEditing();
  }

  function useCurrentLocation() {
    dispatch("locate");
    finishEditing();
  }

  function finishEditing() {
    editing = null;
    suggestions = [];
    editText = "";
  }
</script>

<div class="panel">
  <div class="fields">
    <div class="connector" aria-hidden="true"></div>

    <!-- FROM -->
    <div class="row">
      <span class="dot from" aria-hidden="true"></span>
      <input
        type="text"
        placeholder="Choose start…"
        value={editing === "origin" ? editText : origin?.label ?? ""}
        on:focus={(e) => focusField("origin", e)}
        on:blur={onBlur}
        on:input={(e) => onInput(e.currentTarget.value)}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
      {#if editing === "origin" && editText}
        <button class="mini" on:click={() => dispatch("clear", { field: "origin" })} aria-label="Clear">×</button>
      {:else if !editing && origin && dest}
        <button class="mini swap" on:click={() => dispatch("swap")} aria-label="Reverse the route">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M7 4v13M7 4 4 7m3-3 3 3M17 20V7m0 13-3-3m3 3 3-3"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      {/if}
    </div>

    <!-- STOPS -->
    {#each stops as s (s.id)}
      <div class="row">
        <span class="dot stop" aria-hidden="true"></span>
        <input
          type="text"
          placeholder="Add a stop…"
          value={editing === s.id ? editText : s.point?.label ?? ""}
          on:focus={(e) => focusField(s.id, e)}
          on:blur={onBlur}
          on:input={(e) => onInput(e.currentTarget.value)}
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <button class="mini" on:click={() => dispatch("removeStop", { id: s.id })} aria-label="Remove stop">×</button>
      </div>
    {/each}

    <!-- TO -->
    <div class="row">
      <span class="dot to" aria-hidden="true"></span>
      <input
        type="text"
        placeholder="Where to?"
        value={editing === "dest" ? editText : dest?.label ?? ""}
        on:focus={(e) => focusField("dest", e)}
        on:blur={onBlur}
        on:input={(e) => onInput(e.currentTarget.value)}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
      {#if editing === "dest" && editText}
        <button class="mini" on:click={() => dispatch("clear", { field: "dest" })} aria-label="Clear">×</button>
      {/if}
    </div>
  </div>

  {#if !editing && stops.length < maxStops}
    <button class="addstop" on:click={() => dispatch("addStop")}>
      <span class="as-ico" aria-hidden="true">+</span>
      Add a stop
      <span class="as-hint">— build a road trip</span>
    </button>
  {/if}

  {#if editing}
    <div class="results">
      {#if editing === "origin"}
        <button class="result locate" on:click={useCurrentLocation}>
          <span class="r-ico">
            <svg viewBox="0 0 24 24" width="17" height="17">
              <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="r-text"><b>Current location</b></span>
        </button>
      {/if}

      {#if searching}
        <div class="hint">Searching…</div>
      {/if}

      {#each suggestions as s (s.id)}
        <button class="result" on:click={() => pickPlace(s)}>
          <span class="r-ico pin">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"
                    fill="currentColor"/>
            </svg>
          </span>
          <span class="r-text">
            <b>{s.shortName}</b>
            <small>{s.fullName}</small>
          </span>
        </button>
      {/each}

      {#if !searching && suggestions.length === 0 && recents.length > 0}
        <div class="hint">Recent</div>
        {#each recents as r}
          <button class="result" on:click={() => pickRecent(r)}>
            <span class="r-ico">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7v5l3 2" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="r-text"><b>{r.label}</b></span>
          </button>
        {/each}
      {/if}
    </div>
  {/if}

  {#if busy}
    <div class="busy-bar"><span></span></div>
  {/if}
</div>

<style>
  .panel {
    background: var(--material);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border-radius: 16px;
    box-shadow: var(--shadow-2);
    overflow: hidden;
  }

  .fields { position: relative; padding: 4px 6px; }
  .connector {
    position: absolute;
    left: 21px; top: 26px; bottom: 26px;
    width: 2px;
    background: var(--line);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 4px 8px;
  }
  .row + .row { border-top: 1px solid var(--line-soft); }

  .dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    z-index: 1;
  }
  .dot.from { background: var(--surface); border: 3px solid var(--blue); }
  .dot.to   { background: var(--red); border: 3px solid var(--red);
              border-radius: 3px; }
  .dot.stop { background: var(--orange); border: 3px solid var(--orange); }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    color: var(--text);
    padding: 8px 0;
  }
  input::placeholder { color: var(--muted); }

  .mini {
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 22px; height: 22px;
    border-radius: 50%;
    font-size: 15px;
    line-height: 1;
    flex-shrink: 0;
  }
  .mini.swap {
    width: 30px; height: 30px;
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--blue);
    display: grid;
    place-items: center;
  }
  .mini.swap:active { transform: scale(0.92); }

  .addstop {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-top: 1px solid var(--line-soft);
    color: var(--blue);
    font-size: 14px;
    font-weight: 600;
    text-align: left;
  }
  .addstop:active { background: var(--surface-2); }
  .as-ico {
    width: 19px; height: 19px;
    border-radius: 50%;
    background: var(--blue-soft);
    color: var(--blue);
    display: grid;
    place-items: center;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    flex-shrink: 0;
  }
  .as-hint { color: var(--muted); font-weight: 400; }

  .results {
    border-top: 1px solid var(--line-soft);
    max-height: 46vh;
    overflow-y: auto;
  }
  .result {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .result:last-child { border-bottom: none; }
  .result:active { background: var(--surface-2); }

  .r-ico {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--surface-2);
    display: grid; place-items: center;
    color: var(--muted);
    flex-shrink: 0;
  }
  .result.locate .r-ico { background: var(--blue-soft); color: var(--blue); }
  .r-ico.pin { color: var(--red); }

  .r-text { min-width: 0; display: flex; flex-direction: column; }
  .r-text b {
    font-size: 14px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .r-text small {
    font-size: 12px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .hint {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    padding: 8px 14px 4px;
  }

  .busy-bar {
    height: 2px;
    background: var(--blue-soft);
    overflow: hidden;
  }
  .busy-bar span {
    display: block;
    height: 100%;
    width: 40%;
    background: var(--blue);
    animation: slide 1.1s ease-in-out infinite;
  }
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
</style>
