<script lang="ts">
  import { target, targetLabel, targetSubLabel } from "../lib/store";
  import { carColor } from "../lib/carVisuals";
  import CarArt from "./CarArt.svelte";
  import TargetPicker from "./TargetPicker.svelte";

  let open = false;

  $: thumbTint =
    $target.kind === "any" ? "var(--surface-3)" : carColor($target.classId) + "22";

  function reset() {
    target.set({ kind: "any" });
  }
</script>

<div class="bar">
  <button class="main" on:click={() => (open = true)}>
    <div class="thumb" style="background:{thumbTint}">
      {#if $target.kind === "any"}
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M5 11l1.6-4.8A2 2 0 0 1 8.5 4.8h7A2 2 0 0 1 17.4 6.2L19 11M4.5 11h15M5 11v5.5M19 11v5.5M7 16.5h2M15 16.5h2"
            fill="none"
            stroke="var(--muted)"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {:else}
        <CarArt classId={$target.classId} compact />
      {/if}
    </div>
    <div class="txt">
      <div class="lab">
        <span class="kicker">Hunting</span>
        {targetLabel($target)}
      </div>
      <div class="sub">{targetSubLabel($target)}</div>
    </div>
    <svg class="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="m8 9 4 4 4-4 M8 15l4-4 4 4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>

  {#if $target.kind !== "any"}
    <button class="reset" on:click={reset} aria-label="Reset target">
      <svg viewBox="0 0 24 24" width="15" height="15">
        <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor"
              stroke-width="2.2" stroke-linecap="round" />
      </svg>
      Reset
    </button>
  {/if}
</div>

{#if open}
  <TargetPicker on:close={() => (open = false)} />
{/if}

<style>
  .bar {
    display: flex;
    align-items: stretch;
    gap: 8px;
  }
  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 11px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 13px;
    padding: 8px 10px;
    text-align: left;
  }
  .main:active { transform: scale(0.99); }
  .thumb {
    width: 52px;
    height: 38px;
    border-radius: 9px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 5px;
  }
  .txt { flex: 1; min-width: 0; }
  .lab {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .kicker {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin-right: 5px;
  }
  .sub {
    font-size: 12px;
    color: var(--muted);
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chev { color: var(--muted); flex-shrink: 0; }

  .reset {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 13px;
    padding: 0 12px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-2);
  }
  .reset:active { transform: scale(0.96); }
</style>
