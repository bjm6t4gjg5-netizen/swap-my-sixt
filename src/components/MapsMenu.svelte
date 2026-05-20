<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /** The place to send. */
  export let lat: number;
  export let lng: number;
  export let label: string;
  /** Optional start point — if given, the links open as driving directions. */
  export let originLat: number | null = null;
  export let originLng: number | null = null;

  const dispatch = createEventDispatcher<{ close: void }>();

  let shareNote = "";

  $: hasOrigin = originLat != null && originLng != null;

  function appleMaps() {
    let url = `https://maps.apple.com/?q=${encodeURIComponent(label)}&daddr=${lat},${lng}&dirflg=d`;
    if (hasOrigin) url += `&saddr=${originLat},${originLng}`;
    window.open(url, "_blank", "noopener");
    dispatch("close");
  }

  function googleMaps() {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    if (hasOrigin) url += `&origin=${originLat},${originLng}`;
    window.open(url, "_blank", "noopener");
    dispatch("close");
  }

  async function share() {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: label,
          text: `Next Sixt stop: ${label}`,
          url
        });
        dispatch("close");
        return;
      }
      await navigator.clipboard.writeText(url);
      shareNote = "Link copied to clipboard.";
    } catch {
      shareNote = "Could not open the share sheet.";
    }
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
      <div class="h-title">Send to Maps</div>
      <div class="h-sub">{label}</div>
    </div>

    <div class="options">
      <button class="opt" on:click={appleMaps}>
        <span class="o-ico apple">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M3 11l18-8-8 18-2-8-8-2z" fill="currentColor" />
          </svg>
        </span>
        <span class="o-txt">
          <b>Apple Maps</b>
          <small>{hasOrigin ? "Driving directions" : "Open location"}</small>
        </span>
        <span class="o-go">›</span>
      </button>

      <button class="opt" on:click={googleMaps}>
        <span class="o-ico google">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"
              fill="currentColor"
            />
            <circle cx="12" cy="9" r="2.6" fill="#fff" />
          </svg>
        </span>
        <span class="o-txt">
          <b>Google Maps</b>
          <small>{hasOrigin ? "Driving directions" : "Open location"}</small>
        </span>
        <span class="o-go">›</span>
      </button>

      <button class="opt" on:click={share}>
        <span class="o-ico share">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 3v12M12 3 8 7M12 3l4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="o-txt">
          <b>Share / AirDrop</b>
          <small>Send to a friend or your phone</small>
        </span>
        <span class="o-go">›</span>
      </button>
    </div>

    {#if shareNote}
      <div class="note">{shareNote}</div>
    {/if}

    <button class="cancel" on:click={() => dispatch("close")}>Cancel</button>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.42);
    z-index: 1100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .sheet {
    background: var(--surface);
    width: 100%;
    max-width: 460px;
    border-radius: 22px 22px 0 0;
    padding: 0 14px calc(14px + var(--safe-bottom));
    animation: slideup 0.26s cubic-bezier(0.32, 0.72, 0, 1);
  }
  @keyframes slideup {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .grab {
    width: 36px; height: 5px;
    background: var(--line);
    border-radius: 3px;
    margin: 8px auto 4px;
  }
  .head { text-align: center; padding: 6px 0 12px; }
  .h-title { font-size: 17px; font-weight: 800; }
  .h-sub {
    font-size: 12.5px;
    color: var(--muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface-2);
    border: none;
    border-radius: 14px;
    padding: 12px 13px;
    text-align: left;
  }
  .opt:active { transform: scale(0.99); background: var(--surface-3); }
  .o-ico {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: white;
    flex-shrink: 0;
  }
  .o-ico.apple { background: #1c1c1e; }
  .o-ico.google { background: #34a853; }
  .o-ico.share { background: var(--blue); }
  .o-txt { flex: 1; min-width: 0; }
  .o-txt b { font-size: 15px; }
  .o-txt small { display: block; font-size: 12px; color: var(--muted); margin-top: 1px; }
  .o-go { font-size: 19px; color: var(--muted); flex-shrink: 0; }

  .note {
    text-align: center;
    font-size: 12.5px;
    color: var(--muted);
    padding: 10px 0 2px;
  }

  .cancel {
    width: 100%;
    margin-top: 9px;
    background: var(--surface-2);
    border: none;
    border-radius: 14px;
    padding: 13px;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .cancel:active { transform: scale(0.99); }
</style>
