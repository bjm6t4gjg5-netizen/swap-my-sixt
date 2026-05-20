<script lang="ts">
  import { activeTab, type TabId } from "../lib/store";

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "navigate", label: "Navigate", icon: "M12 2 4.5 20.3l.7.7L12 17l6.8 4 .7-.7z" },
    { id: "booking",  label: "Booking",  icon: "M4 4h16v4H4zm0 6h16v10H4zm4 3h8v2H8z" },
    { id: "cars",     label: "Cars",     icon: "M5 11l1.5-4.5h11L19 11m-1 4h.01M6 15h.01M4 17v-5.2L6 6h12l2 5.8V17h-2v-2H6v2z" },
    { id: "stations", label: "Stations", icon: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" }
  ];
</script>

<header>
  <button class="brand" on:click={() => activeTab.set("home")} title="Home">
    <div class="logo">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="white"/>
        <circle cx="12" cy="9" r="3.1" fill="var(--orange)"/>
      </svg>
    </div>
    <div class="wordmark">
      <span class="w1">Swap my</span>
      <span class="w2">SIXT</span>
    </div>
  </button>

  <nav class="tabs">
    {#each tabs as t}
      <button
        class="tab"
        class:active={$activeTab === t.id}
        on:click={() => activeTab.set(t.id)}
      >
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
          <path d={t.icon} fill="currentColor" />
        </svg>
        <span>{t.label}</span>
      </button>
    {/each}
  </nav>
</header>

<style>
  header {
    height: calc(var(--header-h) + var(--safe-top));
    padding-top: var(--safe-top);
    background: linear-gradient(120deg, #ff7a1a 0%, var(--orange) 55%, var(--orange-dark) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 14px;
    padding-right: 6px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.12);
    position: relative;
    z-index: 50;
    flex-shrink: 0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    font: inherit;
    color: #fff;
    -webkit-tap-highlight-color: transparent;
  }
  .brand:active { transform: scale(0.96); }
  .logo {
    width: 32px; height: 32px;
    background: rgba(0,0,0,0.22);
    border-radius: 9px;
    display: grid; place-items: center;
  }
  .wordmark { display: flex; flex-direction: column; line-height: 1.02; }
  .wordmark .w1 {
    font-size: 10px; font-weight: 600;
    opacity: 0.85; letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .wordmark .w2 {
    font-size: 17px; font-weight: 800;
    letter-spacing: 0.06em;
  }

  .tabs { display: flex; gap: 2px; }
  .tab {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.78);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 5px 9px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 600;
    transition: background 0.12s ease, color 0.12s ease;
  }
  .tab span { letter-spacing: 0.01em; }
  .tab.active {
    color: white;
    background: rgba(255,255,255,0.22);
  }
  .tab:active { transform: scale(0.95); }

  @media (max-width: 360px) {
    .tab span { display: none; }
    .tab { padding: 8px; }
  }
</style>
