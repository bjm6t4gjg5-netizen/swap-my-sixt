<script lang="ts">
  import { verdict } from "../lib/heuristic";
  export let score: number;
  export let size: "sm" | "md" | "lg" = "md";
  $: cls = verdict(score);
  $: pct = Math.round(score * 100);
</script>

<div class="badge {cls} {size}">{pct}<small>%</small></div>

<style>
  .badge {
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: white;
    font-weight: 700;
    flex-shrink: 0;
    line-height: 1;
  }
  .badge small { font-size: 0.6em; font-weight: 600; opacity: 0.85; }
  .sm { width: 34px; height: 34px; font-size: 13px; }
  .md { width: 40px; height: 40px; font-size: 14px; }
  .lg { width: 52px; height: 52px; font-size: 18px; }
  .ok  { background: var(--green); }
  .mid { background: var(--yellow); }
  .no  { background: var(--red); }
</style>
