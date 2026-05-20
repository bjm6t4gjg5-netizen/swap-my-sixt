<script lang="ts">
  import { CAR_CLASSES } from "../lib/cars";
  import { carClass } from "../lib/store";

  export let label = "I'm looking for";
</script>

<div class="picker">
  {#if label}<div class="label">{label}</div>{/if}
  <div class="chips">
    {#each CAR_CLASSES as c}
      <button
        class="chip"
        class:active={$carClass === c.id}
        on:click={() => carClass.set(c.id)}
        title={c.description}
      >
        {c.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .picker { padding: 2px 0; }
  .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin: 0 16px 6px;
  }
  .chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 0 16px 4px;
    scrollbar-width: none;
  }
  .chips::-webkit-scrollbar { display: none; }
  .chip {
    flex-shrink: 0;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text-2);
    padding: 7px 13px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  .chip.active {
    background: var(--blue);
    color: white;
    border-color: var(--blue);
  }
  .chip:active { transform: scale(0.96); }
</style>
