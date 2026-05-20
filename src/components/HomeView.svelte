<script lang="ts">
  import { activeTab, type TabId } from "../lib/store";

  const ICON = import.meta.env.BASE_URL + "icon-192.png";

  const tabs: {
    id: TabId;
    name: string;
    desc: string;
    color: string;
    icon: string;
  }[] = [
    {
      id: "navigate",
      name: "Navigate",
      desc: "Plan a route and see every Sixt branch along it, colour-coded by how likely it has the car you want. Compare routes A / B / C.",
      color: "#007aff",
      icon: "M12 2 4.5 20.3l.7.7L12 17l6.8 4 .7-.7z"
    },
    {
      id: "booking",
      name: "Booking",
      desc: "Store your rental, decode its ACRISS code, and run the negotiation helper at the counter — specs, tiers and tactics.",
      color: "#ff5f00",
      icon: "M4 4h16v4H4zm0 6h16v10H4zm4 3h8v2H8z"
    },
    {
      id: "cars",
      name: "Cars",
      desc: "Every Sixt class and engine variant — horsepower, top speed, consumption — grouped so nothing gets confusing.",
      color: "#34c759",
      icon: "M5 11l1.5-4.5h11L19 11m-1 4h.01M6 15h.01M4 17v-5.2L6 6h12l2 5.8V17h-2v-2H6v2z"
    },
    {
      id: "stations",
      name: "Stations",
      desc: "All ~150 Sixt branches worldwide — searchable list or live map, scored for your target car.",
      color: "#7b3fd6",
      icon: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
    }
  ];
</script>

<div class="home">
  <section class="hero">
    <img class="app-icon" src={ICON} alt="Swap my Sixt" />
    <h1>Swap my Sixt</h1>
    <p class="tagline">Get the car you actually wanted.</p>
  </section>

  <section class="problem">
    <div class="p-tag">The problem</div>
    <p>
      You book a car <em>class</em> with Sixt — but at the counter you can be
      handed something worse, or you simply fancy a different car. Sixt won't
      tell you what's sitting on which lot, and once you're at the desk the
      clock is ticking.
    </p>
    <p>
      <b>This app is your edge.</b> It maps every Sixt branch along your drive,
      estimates how likely each has your car, decodes your booking, and coaches
      you through the swap — so you negotiate from knowledge, not hope.
    </p>
  </section>

  <section class="how">
    <div class="p-tag">Four tabs, one mission</div>
    <div class="cards">
      {#each tabs as t}
        <button class="tab-card" on:click={() => activeTab.set(t.id)}>
          <span class="tc-icon" style="background:{t.color}1f; color:{t.color}">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d={t.icon} fill="currentColor" />
            </svg>
          </span>
          <span class="tc-text">
            <span class="tc-name">{t.name}</span>
            <span class="tc-desc">{t.desc}</span>
          </span>
          <span class="tc-go">›</span>
        </button>
      {/each}
    </div>
  </section>

  <section class="lucas-note">
    <span class="ln-emoji">💬</span>
    <span>
      Stuck? Tap the chat bubble for <b>Lucas</b>, your in-app rental analyst.
      He works without an API key — swap advice, ACRISS decoding, and the odd
      Autobahn joke.
    </span>
  </section>

  <button class="cta" on:click={() => activeTab.set("navigate")}>
    Start planning a route →
  </button>

  <p class="foot">
    A research tool — swap probabilities are estimates, not Sixt data. Always
    confirm with the branch.
  </p>
</div>

<style>
  .home {
    max-width: 640px;
    margin: 0 auto;
    padding: 18px 16px 70px;
  }

  .hero { text-align: center; padding: 14px 0 22px; }
  .app-icon {
    width: 84px;
    height: 84px;
    border-radius: 20px;
    box-shadow: var(--shadow-2);
  }
  .hero h1 {
    margin: 14px 0 2px;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .tagline { margin: 0; font-size: 15px; color: var(--text-2); }

  .p-tag {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--orange-dark);
    margin-bottom: 8px;
  }

  .problem {
    background: var(--surface);
    border-radius: 18px;
    box-shadow: var(--shadow-1);
    padding: 16px;
    margin-bottom: 18px;
  }
  .problem p {
    margin: 0 0 10px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-2);
  }
  .problem p:last-child { margin-bottom: 0; }
  .problem em { font-style: italic; color: var(--text); }
  .problem b { color: var(--text); }

  .how { margin-bottom: 18px; }
  .cards { display: flex; flex-direction: column; gap: 9px; }
  .tab-card {
    display: flex;
    align-items: center;
    gap: 13px;
    background: var(--surface);
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-1);
    padding: 13px 14px;
    text-align: left;
  }
  .tab-card:active { transform: scale(0.99); }
  .tc-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .tc-text { flex: 1; min-width: 0; }
  .tc-name { font-size: 16px; font-weight: 700; display: block; }
  .tc-desc {
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
    display: block;
    margin-top: 2px;
  }
  .tc-go { font-size: 22px; color: var(--muted); flex-shrink: 0; }

  .lucas-note {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: var(--blue-soft);
    border-radius: 14px;
    padding: 13px 14px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-2);
    margin-bottom: 18px;
  }
  .ln-emoji { font-size: 20px; flex-shrink: 0; }
  .lucas-note b { color: var(--text); }

  .cta {
    width: 100%;
    border: none;
    background: var(--blue);
    color: white;
    font-size: 16px;
    font-weight: 700;
    padding: 15px;
    border-radius: 15px;
    box-shadow: 0 4px 14px rgba(0, 122, 255, 0.3);
  }
  .cta:active { transform: scale(0.99); }

  .foot {
    margin: 16px 6px 0;
    font-size: 11.5px;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
  }
</style>
