<script lang="ts">
  import { STATION_BY_ID, STATIONS } from "../lib/stations";
  import { CAR_CLASSES, CAR_CLASS_BY_ID, searchCars } from "../lib/cars";
  import { decodeAcriss, ACRISS_EXAMPLES } from "../lib/acriss";
  import { computeScore } from "../lib/heuristic";
  import { haversineKm } from "../lib/geo";
  import { booking, myLocation, requestNavigation } from "../lib/store";
  import type { Booking, CarModel, ScoredStation } from "../lib/types";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";
  import StationSearchField from "./StationSearchField.svelte";
  import CarArt from "./CarArt.svelte";

  type Mode = "view" | "edit";
  let mode: Mode = $booking ? "view" : "edit";

  function blankDraft(): Booking {
    return {
      ref: "",
      acrissCode: "",
      bookedExample: "",
      pickupStationId: "",
      pickupDate: "",
      returnDate: "",
      expectedClassId: "premium",
      actualBrand: "",
      actualModel: "",
      actualClassId: undefined,
      notes: ""
    };
  }

  let draft: Booking = $booking ? { ...$booking } : blankDraft();
  let manualClass = draft.expectedClassId;
  let showManual = false;

  // live ACRISS decode of the draft (read-only — avoids a reactive cycle)
  $: draftDecoded = decodeAcriss(draft.acrissCode ?? "");
  // the class we'll actually store: decoded code wins, else the manual pick
  $: resolvedClassId = draftDecoded.valid ? draftDecoded.classId : manualClass;

  // --- actual-car autocomplete ---
  let carQuery = "";
  $: carMatches = carQuery.trim() ? searchCars(carQuery).slice(0, 6) : [];

  function pickActualCar(m: CarModel) {
    draft.actualBrand = m.brand;
    draft.actualModel = m.model;
    draft.actualClassId = m.classId;
    carQuery = "";
  }
  function clearActualCar() {
    draft.actualBrand = "";
    draft.actualModel = "";
    draft.actualClassId = undefined;
  }

  function startEdit() {
    draft = $booking ? { ...$booking } : blankDraft();
    manualClass = draft.expectedClassId;
    showManual = !decodeAcriss(draft.acrissCode ?? "").valid && !!draft.acrissCode;
    carQuery = "";
    mode = "edit";
  }
  function cancelEdit() {
    if ($booking) mode = "view";
    else draft = blankDraft();
  }
  function save() {
    if (!draft.ref.trim()) draft.ref = "My Sixt rental";
    booking.set({ ...draft, expectedClassId: resolvedClassId });
    mode = "view";
  }
  function remove() {
    booking.set(null);
    draft = blankDraft();
    mode = "edit";
  }

  // --- derived view data ---
  $: current = $booking;
  $: pickupStation = current?.pickupStationId
    ? STATION_BY_ID[current.pickupStationId]
    : undefined;
  $: bookedDecoded = current ? decodeAcriss(current.acrissCode ?? "") : null;
  $: expectedClass = current ? CAR_CLASS_BY_ID[current.expectedClassId] : undefined;
  $: actualClass = current?.actualClassId
    ? CAR_CLASS_BY_ID[current.actualClassId]
    : undefined;

  type Status = "reserved" | "match" | "mismatch";
  $: status = ((): Status => {
    if (!current?.actualClassId) return "reserved";
    return current.actualClassId === current.expectedClassId
      ? "match"
      : "mismatch";
  })();

  $: anchor = pickupStation
    ? { lat: pickupStation.lat, lng: pickupStation.lng }
    : $myLocation;

  $: swapOptions = ((): ScoredStation[] => {
    if (!current) return [];
    const cls = current.expectedClassId;
    let list = STATIONS.map((s): ScoredStation => {
      const dist = anchor ? haversineKm(anchor, s) : 0;
      return {
        ...s,
        fromRouteKm: dist,
        distFromStartKm: dist,
        detourMin: 0,
        score: computeScore(s, cls)
      };
    });
    if (anchor) {
      list = list
        .filter((s) => s.fromRouteKm <= 180 && s.id !== current!.pickupStationId)
        .sort((a, b) => b.score - a.score);
    } else {
      list = list.sort((a, b) => b.score - a.score);
    }
    return list.slice(0, 8);
  })();

  function originPoint() {
    if (pickupStation) {
      return {
        lat: pickupStation.lat,
        lng: pickupStation.lng,
        label: pickupStation.name
      };
    }
    if ($myLocation) return { ...$myLocation, label: "Current location" };
    return undefined;
  }

  function planSwapTo(s: ScoredStation) {
    if (!current) return;
    requestNavigation({
      origin: originPoint(),
      dest: { lat: s.lat, lng: s.lng, label: s.name },
      carClass: current.expectedClassId
    });
  }
  function planSwapOpen() {
    if (!current) return;
    requestNavigation({
      origin: originPoint(),
      carClass: current.expectedClassId
    });
  }
</script>

<div class="view">
  {#if mode === "view" && current}
    <!-- ===================== BOOKING CARD ===================== -->
    <header class="vhead">
      <h2>Your booking</h2>
      <p>What Sixt is holding for you — and your move if it's the wrong car.</p>
    </header>

    <div class="ticket">
      <div class="t-row1">
        <div>
          <div class="t-cap">Reference</div>
          <div class="t-ref">{current.ref}</div>
        </div>
        <div class="status-pill {status}">
          {#if status === "reserved"}● Reserved{/if}
          {#if status === "match"}● Class matched{/if}
          {#if status === "mismatch"}● Wrong class{/if}
        </div>
      </div>

      <!-- decoded vehicle -->
      <div class="vehicle">
        <div class="v-art">
          <CarArt classId={current.expectedClassId} />
        </div>
        <div class="v-info">
          <div class="t-cap">You booked</div>
          <div class="v-name">
            {current.bookedExample?.trim()
              ? current.bookedExample
              : expectedClass?.label}
            <span class="orsim">or similar</span>
          </div>
          {#if bookedDecoded?.valid}
            <div class="v-decode">{bookedDecoded.summary}</div>
            <div class="v-class">
              {expectedClass?.label} class
              <span class="v-code">{bookedDecoded.code}</span>
            </div>
          {:else if current.acrissCode}
            <div class="v-class">{expectedClass?.label} class</div>
          {:else}
            <div class="v-class">{expectedClass?.label} class</div>
          {/if}
        </div>
      </div>

      <div class="t-grid">
        <div class="tg">
          <span class="t-cap">Pick-up</span>
          <span class="tg-v">{pickupStation ? pickupStation.name : "Not set"}</span>
        </div>
        <div class="tg">
          <span class="t-cap">Dates</span>
          <span class="tg-v">
            {current.pickupDate || "—"}{current.returnDate
              ? " → " + current.returnDate
              : ""}
          </span>
        </div>
        <div class="tg">
          <span class="t-cap">Assigned car</span>
          <span class="tg-v">
            {#if current.actualBrand}
              {current.actualBrand} {current.actualModel}
            {:else}
              Not yet known
            {/if}
          </span>
        </div>
        <div class="tg">
          <span class="t-cap">Assigned class</span>
          <span class="tg-v">{actualClass ? actualClass.label : "—"}</span>
        </div>
      </div>

      {#if current.notes}
        <div class="t-notes">“{current.notes}”</div>
      {/if}
    </div>

    <!-- ===================== STATUS ===================== -->
    <div class="explain {status}">
      {#if status === "reserved"}
        <strong>Awaiting pick-up.</strong>
        You've booked a <b>{expectedClass?.label}</b>
        ({current.bookedExample?.trim() || "category"} or similar). At the
        counter, add the actual car below — if it's not what you want, the swap
        finder kicks in.
      {:else if status === "match"}
        <strong>You got your class.</strong>
        The {current.actualBrand} {current.actualModel} is a
        <b>{actualClass?.label}</b> — exactly what you booked. Nothing to do.
      {:else}
        <strong>Mismatch.</strong>
        You booked a <b>{expectedClass?.label}</b> but were handed a
        {current.actualBrand} {current.actualModel}
        (<b>{actualClass?.label}</b>). Here's where to swap.
      {/if}
    </div>

    <!-- ===================== SWAP FINDER ===================== -->
    {#if status !== "match"}
      <div class="sec-head">
        <h3>Swap for a {expectedClass?.label}</h3>
        <button class="link" on:click={planSwapOpen}>Plan route ›</button>
      </div>
      <p class="sec-sub">
        {anchor
          ? `Best odds within 180 km of ${pickupStation ? pickupStation.name : "you"}.`
          : "Set a pick-up station to rank by distance."}
        Tap to route there.
      </p>

      <div class="swap-list">
        {#each swapOptions as s (s.id)}
          <button class="swap-row" on:click={() => planSwapTo(s)}>
            <ProbabilityBadge score={s.score} size="sm" />
            <div class="sr-info">
              <div class="sr-name">{s.name}</div>
              <div class="sr-meta">
                {s.type} · fleet {s.fleet}{anchor && s.fromRouteKm > 0
                  ? " · " + Math.round(s.fromRouteKm) + " km"
                  : ""}
              </div>
            </div>
            <svg class="sr-go" viewBox="0 0 24 24" width="17" height="17">
              <path
                d="m9 6 6 6-6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        {/each}
      </div>
    {/if}

    <div class="vactions">
      <button class="btn ghost" on:click={remove}>Delete</button>
      <button class="btn ghost" on:click={startEdit}>Edit booking</button>
    </div>

  {:else}
    <!-- ===================== FORM ===================== -->
    <header class="vhead">
      <h2>{$booking ? "Edit booking" : "Add your booking"}</h2>
      <p>
        Enter the details from your Sixt confirmation. They stay on this device
        — the app uses them to decode your car and plan swaps.
      </p>
    </header>

    <div class="form">
      <label class="field">
        <span class="f-lab">Booking reference</span>
        <input
          class="ipt"
          type="text"
          placeholder="e.g. 9123456789"
          bind:value={draft.ref}
          autocapitalize="characters"
        />
      </label>

      <!-- ACRISS -->
      <div class="field">
        <span class="f-lab">ACRISS / SIPP code</span>
        <input
          class="ipt code-ipt"
          type="text"
          placeholder="4 letters — e.g. PDAR"
          maxlength="4"
          bind:value={draft.acrissCode}
          autocapitalize="characters"
          autocomplete="off"
        />

        {#if (draft.acrissCode ?? "").length === 0}
          <div class="hint-chips">
            {#each ACRISS_EXAMPLES.slice(0, 5) as ex}
              <button
                type="button"
                class="hint-chip"
                on:click={() => (draft.acrissCode = ex.code)}
              >{ex.code}</button>
            {/each}
          </div>
          <div class="f-help">
            Found next to the car on your confirmation. No code? Pick a class
            below instead.
          </div>
        {:else if draftDecoded.valid}
          <div class="decode ok">
            <div class="d-art"><CarArt classId={draftDecoded.classId} compact /></div>
            <div class="d-text">
              <div class="d-summary">{draftDecoded.summary}</div>
              <div class="d-class">
                Counts as <b>{CAR_CLASS_BY_ID[draftDecoded.classId].label}</b>
              </div>
            </div>
          </div>
        {:else}
          <div class="decode bad">
            <span>“{draft.acrissCode}” isn't a standard 4-letter code. Check it, or pick a class below.</span>
          </div>
        {/if}

        {#if !draftDecoded.valid}
          {#if showManual}
            <select class="ipt" bind:value={manualClass}>
              {#each CAR_CLASSES as c}
                <option value={c.id}>{c.label}</option>
              {/each}
            </select>
          {:else}
            <button
              type="button"
              class="textlink"
              on:click={() => (showManual = true)}
            >Pick a class manually ›</button>
          {/if}
        {/if}
      </div>

      <label class="field">
        <span class="f-lab">Car shown <em>(the “… or similar” model)</em></span>
        <input
          class="ipt"
          type="text"
          placeholder="e.g. BMW 3 Series"
          bind:value={draft.bookedExample}
        />
      </label>

      <div class="field">
        <span class="f-lab">Pick-up station</span>
        <StationSearchField
          stationId={draft.pickupStationId ?? ""}
          on:select={(e) => (draft.pickupStationId = e.detail)}
        />
      </div>

      <div class="frow">
        <label class="field">
          <span class="f-lab">Pick-up date</span>
          <input class="ipt" type="date" bind:value={draft.pickupDate} />
        </label>
        <label class="field">
          <span class="f-lab">Return date</span>
          <input class="ipt" type="date" bind:value={draft.returnDate} />
        </label>
      </div>

      <div class="field">
        <span class="f-lab">Car you were actually given <em>(optional)</em></span>
        {#if draft.actualBrand}
          <div class="picked">
            <div>
              <b>{draft.actualBrand} {draft.actualModel}</b>
              <small>{draft.actualClassId
                ? CAR_CLASS_BY_ID[draft.actualClassId].label
                : ""}</small>
            </div>
            <button class="clr" on:click={clearActualCar} aria-label="Clear">×</button>
          </div>
        {:else}
          <input
            class="ipt"
            type="text"
            placeholder="Search — e.g. VW Golf, BMW X1"
            bind:value={carQuery}
            autocomplete="off"
          />
          {#if carMatches.length}
            <div class="ac">
              {#each carMatches as m}
                <button class="ac-row" on:click={() => pickActualCar(m)}>
                  <b>{m.brand} {m.model}</b>
                  <small>{CAR_CLASS_BY_ID[m.classId].label}</small>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>

      <label class="field">
        <span class="f-lab">Notes <em>(optional)</em></span>
        <textarea
          class="ipt"
          rows="2"
          placeholder="Counter hours, agent name, anything useful…"
          bind:value={draft.notes}
        ></textarea>
      </label>

      <div class="factions">
        {#if $booking}
          <button class="btn ghost" on:click={cancelEdit}>Cancel</button>
        {/if}
        <button class="btn primary" on:click={save}>
          {$booking ? "Save changes" : "Save booking"}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .view { padding: 16px 14px 70px; max-width: 640px; margin: 0 auto; }

  .vhead h2 { margin: 2px 2px 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
  .vhead p { margin: 0 2px 16px; font-size: 14px; color: var(--text-2); line-height: 1.5; }

  /* ---------- ticket ---------- */
  .ticket {
    background: var(--surface);
    border-radius: 20px;
    padding: 16px;
    box-shadow: var(--shadow-2);
  }
  .t-row1 {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .t-cap {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    font-weight: 600;
  }
  .t-ref {
    font-size: 19px;
    font-weight: 800;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    margin-top: 2px;
  }
  .status-pill {
    flex-shrink: 0;
    font-size: 11.5px;
    font-weight: 700;
    padding: 6px 11px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .status-pill.reserved { background: var(--blue-soft); color: var(--blue); }
  .status-pill.match { background: rgba(52,199,89,0.16); color: #1f8a3b; }
  .status-pill.mismatch { background: rgba(255,159,10,0.18); color: #b9710a; }

  .vehicle {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 14px 0;
    padding: 12px;
    background: linear-gradient(135deg, var(--surface-2), #eef1f6);
    border-radius: 16px;
  }
  .v-art { width: 116px; flex-shrink: 0; }
  .v-info { min-width: 0; }
  .v-name {
    font-size: 17px;
    font-weight: 700;
    margin-top: 2px;
    letter-spacing: -0.01em;
  }
  .orsim { font-size: 12px; font-weight: 500; color: var(--muted); }
  .v-decode { font-size: 12.5px; color: var(--text-2); margin-top: 3px; }
  .v-class {
    font-size: 12.5px;
    color: var(--muted);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .v-code {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 11px;
    font-weight: 700;
    background: var(--surface-3);
    color: var(--text-2);
    padding: 1px 6px;
    border-radius: 5px;
  }

  .t-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 13px;
    padding-top: 14px;
    border-top: 1px solid var(--line-soft);
  }
  .tg { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .tg-v { font-size: 14px; font-weight: 600; }

  .t-notes {
    margin-top: 13px;
    padding-top: 11px;
    border-top: 1px solid var(--line-soft);
    font-size: 13px;
    font-style: italic;
    color: var(--text-2);
  }

  /* ---------- explainer ---------- */
  .explain {
    margin-top: 12px;
    border-radius: 14px;
    padding: 13px 15px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-2);
  }
  .explain strong { color: var(--text); }
  .explain.reserved { background: var(--blue-soft); }
  .explain.match { background: rgba(52,199,89,0.12); }
  .explain.mismatch { background: rgba(255,159,10,0.14); }

  /* ---------- swap finder ---------- */
  .sec-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 20px 2px 2px;
    gap: 10px;
  }
  .sec-head h3 { margin: 0; font-size: 17px; font-weight: 700; }
  .link {
    border: none;
    background: transparent;
    color: var(--blue);
    font-size: 13.5px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .sec-sub { margin: 4px 2px 11px; font-size: 12.5px; color: var(--muted); line-height: 1.45; }

  .swap-list {
    background: var(--surface);
    border-radius: 16px;
    box-shadow: var(--shadow-1);
    overflow: hidden;
  }
  .swap-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    text-align: left;
  }
  .swap-row:last-child { border-bottom: none; }
  .swap-row:active { background: var(--surface-2); }
  .sr-info { flex: 1; min-width: 0; }
  .sr-name {
    font-size: 14.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sr-meta { font-size: 12px; color: var(--muted); margin-top: 2px; text-transform: capitalize; }
  .sr-go { color: var(--muted); flex-shrink: 0; }

  .vactions { display: flex; gap: 9px; margin-top: 20px; }

  /* ---------- form ---------- */
  .form {
    background: var(--surface);
    border-radius: 20px;
    box-shadow: var(--shadow-2);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .frow { display: flex; gap: 11px; }
  .frow .field { flex: 1; }
  .f-lab { font-size: 12.5px; font-weight: 600; color: var(--text-2); }
  .f-lab em { color: var(--muted); font-weight: 400; font-style: normal; }
  .f-help { font-size: 12px; color: var(--muted); line-height: 1.45; }

  .ipt {
    border: 1px solid var(--line);
    border-radius: 11px;
    padding: 11px 12px;
    font-size: 15px;
    background: var(--surface);
    color: var(--text);
    outline: none;
    width: 100%;
  }
  .ipt:focus { border-color: var(--blue); }
  textarea.ipt { resize: vertical; font-family: inherit; }
  .code-ipt {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .hint-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .hint-chip {
    border: 1px solid var(--line);
    background: var(--surface-2);
    color: var(--text-2);
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 9px;
    border-radius: 8px;
  }
  .hint-chip:active { transform: scale(0.95); }

  .decode {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 12px;
    padding: 10px 12px;
  }
  .decode.ok { background: rgba(52,199,89,0.12); }
  .decode.bad {
    background: rgba(255,159,10,0.14);
    font-size: 12.5px;
    color: #9a6206;
    line-height: 1.45;
  }
  .d-art { width: 72px; flex-shrink: 0; }
  .d-summary { font-size: 13.5px; font-weight: 600; }
  .d-class { font-size: 12.5px; color: var(--text-2); margin-top: 2px; }

  .textlink {
    align-self: flex-start;
    border: none;
    background: transparent;
    color: var(--blue);
    font-size: 13px;
    font-weight: 600;
    padding: 2px 0;
  }

  .picked {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--line);
    border-radius: 11px;
    padding: 10px 12px;
    background: var(--surface-2);
  }
  .picked b { font-size: 14.5px; }
  .picked small { display: block; font-size: 12px; color: var(--muted); }
  .clr {
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 15px;
    flex-shrink: 0;
  }

  .ac {
    border: 1px solid var(--line);
    border-radius: 11px;
    overflow: hidden;
  }
  .ac-row {
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: none;
    border-bottom: 1px solid var(--line-soft);
    padding: 10px 12px;
  }
  .ac-row:last-child { border-bottom: none; }
  .ac-row:active { background: var(--surface-2); }
  .ac-row b { font-size: 14px; }
  .ac-row small { color: var(--muted); font-size: 12px; margin-left: 6px; }

  .factions { display: flex; gap: 9px; margin-top: 4px; }

  .btn {
    flex: 1;
    border: none;
    border-radius: 13px;
    padding: 13px;
    font-size: 15px;
    font-weight: 700;
  }
  .btn.ghost {
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--line);
  }
  .btn.primary { background: var(--blue); color: white; }
  .btn:active { transform: scale(0.98); }
</style>
