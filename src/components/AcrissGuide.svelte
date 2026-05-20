<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { decodeAcriss } from "../lib/acriss";
  import { CAR_CLASS_BY_ID } from "../lib/cars";

  const dispatch = createEventDispatcher<{ close: void }>();

  let code = "PDAR";
  $: decoded = decodeAcriss(code);

  const positions = [
    {
      n: 1,
      title: "Category — the size",
      rows: [
        ["M", "Mini"],
        ["E", "Economy"],
        ["C", "Compact"],
        ["I", "Intermediate"],
        ["S", "Standard"],
        ["F", "Fullsize"],
        ["P", "Premium"],
        ["L", "Luxury"],
        ["X", "Special"]
      ],
      note: "Letters like N, H, D, J, R, G, U, W are “Elite” — one notch nicer than the base size."
    },
    {
      n: 2,
      title: "Type — the body",
      rows: [
        ["B", "2–3 door"],
        ["D", "4–5 door"],
        ["W", "Estate / Wagon"],
        ["L", "Limousine"],
        ["S", "Sport"],
        ["E", "Coupe"],
        ["T", "Convertible"],
        ["F", "SUV"],
        ["V", "Passenger van"],
        ["P", "Pickup"]
      ],
      note: ""
    },
    {
      n: 3,
      title: "Transmission & drive",
      rows: [
        ["M", "Manual"],
        ["A", "Automatic"],
        ["N", "Manual · 4WD"],
        ["C", "Manual · AWD"],
        ["B", "Automatic · 4WD"],
        ["D", "Automatic · AWD"]
      ],
      note: ""
    },
    {
      n: 4,
      title: "Fuel & air conditioning",
      rows: [
        ["R", "A/C · fuel unspecified"],
        ["N", "No A/C"],
        ["V", "Petrol · A/C"],
        ["D", "Diesel · A/C"],
        ["H", "Hybrid · A/C"],
        ["E", "Electric · A/C"],
        ["C", "Electric · A/C"]
      ],
      note: ""
    }
  ];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="scrim"
  on:click={(e) => e.target === e.currentTarget && dispatch("close")}
>
  <div class="sheet" role="dialog" aria-modal="true">
    <div class="grab"></div>
    <div class="head">
      <h3>Reading an ACRISS code</h3>
      <button class="x" on:click={() => dispatch("close")} aria-label="Close">×</button>
    </div>

    <div class="body">
      <p class="lead">
        Every rental confirmation quotes a <b>4-letter ACRISS / SIPP code</b>
        (Sixt included). Each letter describes one thing about the car — read
        left to right: <b>size · body · gearbox · fuel</b>.
      </p>

      <!-- live decoder -->
      <div class="try">
        <div class="try-label">Try one — type a code</div>
        <input
          type="text"
          maxlength="4"
          bind:value={code}
          autocapitalize="characters"
          autocomplete="off"
          spellcheck="false"
        />
        {#if decoded.valid}
          <div class="try-out ok">
            <div class="to-letters">
              {#each decoded.code.split("") as ch, i}
                <span class="ltr">{ch}<small>{i + 1}</small></span>
              {/each}
            </div>
            <div class="to-summary">{decoded.summary}</div>
          </div>
        {:else}
          <div class="try-out bad">Type a valid 4-letter code, e.g. PDAR.</div>
        {/if}
      </div>

      {#each positions as p}
        <div class="pos">
          <div class="pos-head">
            <span class="pos-n">{p.n}</span>
            <span class="pos-title">{p.title}</span>
          </div>
          <div class="pos-rows">
            {#each p.rows as [letter, meaning]}
              <div class="pr">
                <span class="pr-l">{letter}</span>
                <span class="pr-m">{meaning}</span>
              </div>
            {/each}
          </div>
          {#if p.note}<div class="pos-note">{p.note}</div>{/if}
        </div>
      {/each}

      {#if decoded.valid}
        <div class="example">
          <div class="ex-title">Worked example — {decoded.code}</div>
          <div class="ex-row"><b>{decoded.code[0]}</b> <span>{decoded.category}</span></div>
          <div class="ex-row"><b>{decoded.code[1]}</b> <span>{decoded.bodyType}</span></div>
          <div class="ex-row">
            <b>{decoded.code[2]}</b>
            <span>{decoded.gearbox}{decoded.drive ? " · " + decoded.drive : ""}</span>
          </div>
          <div class="ex-row">
            <b>{decoded.code[3]}</b>
            <span>
              {decoded.fuel || "unspecified fuel"}{decoded.ac ? " · with A/C" : " · no A/C"}
            </span>
          </div>
          <div class="ex-foot">
            In this app that counts as a
            <b>{CAR_CLASS_BY_ID[decoded.classId].label}</b>.
          </div>
        </div>
      {:else}
        <div class="example muted">
          Type a valid 4-letter code above and it will be worked through here.
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
    max-width: 540px;
    max-height: 88vh;
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
    width: 36px; height: 5px;
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
    width: 30px; height: 30px;
    border-radius: 50%;
    color: var(--muted);
    font-size: 18px;
  }

  .body { overflow-y: auto; padding: 4px 16px 20px; -webkit-overflow-scrolling: touch; }
  .lead { font-size: 13.5px; line-height: 1.55; color: var(--text-2); margin: 0 0 14px; }

  .try {
    background: var(--surface-2);
    border-radius: 14px;
    padding: 12px;
    margin-bottom: 16px;
  }
  .try-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    font-weight: 700;
    margin-bottom: 7px;
  }
  .try input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px 12px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    background: var(--surface);
    color: var(--text);
    outline: none;
  }
  .try input:focus { border-color: var(--blue); }
  .try-out { margin-top: 9px; }
  .try-out.bad { font-size: 12.5px; color: #9a6206; }
  .to-letters { display: flex; gap: 6px; margin-bottom: 6px; }
  .ltr {
    flex: 1;
    background: var(--blue);
    color: white;
    border-radius: 8px;
    text-align: center;
    padding: 6px 0 3px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 18px;
    font-weight: 700;
    position: relative;
  }
  .ltr small {
    display: block;
    font-size: 8px;
    opacity: 0.7;
    font-weight: 600;
  }
  .to-summary { font-size: 13px; font-weight: 600; color: var(--text); }

  .pos {
    border: 1px solid var(--line-soft);
    border-radius: 13px;
    padding: 11px 13px;
    margin-bottom: 10px;
  }
  .pos-head { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
  .pos-n {
    width: 22px; height: 22px;
    background: var(--orange);
    color: white;
    border-radius: 6px;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
  }
  .pos-title { font-size: 14px; font-weight: 700; }
  .pos-rows {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 14px;
  }
  .pr { display: flex; align-items: baseline; gap: 8px; }
  .pr-l {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-weight: 800;
    font-size: 13px;
    color: var(--orange-dark);
    width: 16px;
    flex-shrink: 0;
  }
  .pr-m { font-size: 12.5px; color: var(--text-2); }
  .pos-note {
    font-size: 11.5px;
    color: var(--muted);
    margin-top: 8px;
    line-height: 1.45;
  }

  .example {
    background: var(--blue-soft);
    border-radius: 12px;
    padding: 11px 13px;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--text-2);
  }
  .example.muted { color: var(--muted); text-align: center; }
  .ex-title { font-weight: 800; color: var(--text); margin-bottom: 6px; }
  .ex-row { display: flex; gap: 9px; align-items: baseline; margin-bottom: 2px; }
  .ex-row b {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 13px;
    color: var(--blue);
    width: 14px;
    flex-shrink: 0;
  }
  .ex-foot {
    margin-top: 7px;
    padding-top: 7px;
    border-top: 1px solid rgba(0, 122, 255, 0.18);
  }
  .ex-foot b { color: var(--text); }

  @media (min-width: 560px) {
    .scrim { align-items: center; }
    .sheet { border-radius: 22px; }
  }
</style>
