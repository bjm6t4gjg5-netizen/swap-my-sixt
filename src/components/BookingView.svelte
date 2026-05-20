<script lang="ts">
  import { STATIONS, STATION_BY_ID } from "../lib/stations";
  import { CAR_CLASSES, CAR_CLASS_BY_ID, searchCars } from "../lib/cars";
  import { computeScore } from "../lib/heuristic";
  import { haversineKm } from "../lib/geo";
  import { booking, myLocation, requestNavigation } from "../lib/store";
  import type { Booking, CarClassId, CarModel, ScoredStation } from "../lib/types";
  import ProbabilityBadge from "./ProbabilityBadge.svelte";

  type Mode = "view" | "edit";
  let mode: Mode = $booking ? "view" : "edit";

  function blankDraft(): Booking {
    return {
      ref: "",
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

  // --- actual-car autocomplete ---
  let carQuery = "";
  let carMatches: CarModel[] = [];
  $: carMatches = carQuery.trim() ? searchCars(carQuery).slice(0, 6) : [];

  function pickActualCar(m: CarModel) {
    draft.actualBrand = m.brand;
    draft.actualModel = m.model;
    draft.actualClassId = m.classId;
    carQuery = "";
    carMatches = [];
  }
  function clearActualCar() {
    draft.actualBrand = "";
    draft.actualModel = "";
    draft.actualClassId = undefined;
  }

  function startEdit() {
    draft = $booking ? { ...$booking } : blankDraft();
    carQuery = "";
    mode = "edit";
  }
  function cancelEdit() {
    if ($booking) mode = "view";
    else draft = blankDraft();
  }
  function save() {
    if (!draft.ref.trim()) {
      draft.ref = "My Sixt rental";
    }
    booking.set({ ...draft });
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
  $: expectedClass = current ? CAR_CLASS_BY_ID[current.expectedClassId] : undefined;
  $: actualClass = current?.actualClassId
    ? CAR_CLASS_BY_ID[current.actualClassId]
    : undefined;

  type Status = "reserved" | "match" | "mismatch";
  $: status = ((): Status => {
    if (!current?.actualClassId) return "reserved";
    return current.actualClassId === current.expectedClassId ? "match" : "mismatch";
  })();

  // anchor for swap search: pickup station, else device location
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

  function planSwapTo(s: ScoredStation) {
    if (!current) return;
    const origin = pickupStation
      ? {
          lat: pickupStation.lat,
          lng: pickupStation.lng,
          label: pickupStation.name
        }
      : $myLocation
      ? { ...$myLocation, label: "Current location" }
      : undefined;
    requestNavigation({
      origin,
      dest: { lat: s.lat, lng: s.lng, label: s.name },
      carClass: current.expectedClassId
    });
  }

  function planSwapOpen() {
    if (!current) return;
    const origin = pickupStation
      ? {
          lat: pickupStation.lat,
          lng: pickupStation.lng,
          label: pickupStation.name
        }
      : $myLocation
      ? { ...$myLocation, label: "Current location" }
      : undefined;
    requestNavigation({ origin, carClass: current.expectedClassId });
  }

  // stations grouped for the <select>
  const stationOptions = [...STATIONS].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
</script>

<div class="view">
  {#if mode === "view" && current}
    <!-- ============ BOOKING CARD ============ -->
    <div class="intro">
      <h2>Your booking</h2>
      <p>What Sixt is holding for you — and your move if it's the wrong car.</p>
    </div>

    <div class="ticket">
      <div class="ticket-top">
        <div class="t-ref">
          <span class="t-label">Reference</span>
          <span class="t-val">{current.ref}</span>
        </div>
        <div class="status-pill {status}">
          {#if status === "reserved"}Reserved{/if}
          {#if status === "match"}Class matched{/if}
          {#if status === "mismatch"}Wrong class{/if}
        </div>
      </div>

      <div class="ticket-grid">
        <div class="tg-cell">
          <span class="tg-label">Pick-up</span>
          <span class="tg-val">{pickupStation ? pickupStation.name : "Not set"}</span>
        </div>
        <div class="tg-cell">
          <span class="tg-label">Dates</span>
          <span class="tg-val">
            {current.pickupDate || "—"}{current.returnDate ? " → " + current.returnDate : ""}
          </span>
        </div>
        <div class="tg-cell">
          <span class="tg-label">Booked class</span>
          <span class="tg-val">{expectedClass?.label}</span>
        </div>
        <div class="tg-cell">
          <span class="tg-label">Assigned car</span>
          <span class="tg-val">
            {#if current.actualBrand}
              {current.actualBrand} {current.actualModel}
            {:else}
              Not yet known
            {/if}
          </span>
        </div>
      </div>

      {#if current.notes}
        <div class="notes">“{current.notes}”</div>
      {/if}
    </div>

    <!-- ============ STATUS EXPLAINER ============ -->
    <div class="explainer {status}">
      {#if status === "reserved"}
        <strong>Awaiting pick-up.</strong>
        You've booked a <b>{expectedClass?.label}</b>. Once you're at the
        counter and see the actual car, add it below — if it's not what you
        want, the swap finder kicks in.
      {:else if status === "match"}
        <strong>You got your class.</strong>
        Sixt assigned a {current.actualBrand} {current.actualModel}, which is a
        <b>{actualClass?.label}</b> — exactly what you booked. Nothing to do.
      {:else}
        <strong>Mismatch.</strong>
        You booked a <b>{expectedClass?.label}</b> but were given a
        {current.actualBrand} {current.actualModel}
        (<b>{actualClass?.label}</b>). Below are the nearest stations most
        likely to have a {expectedClass?.label} so you can swap.
      {/if}
    </div>

    <!-- ============ SWAP FINDER ============ -->
    {#if status !== "match"}
      <div class="section-head">
        <h3>
          Where to swap for a {expectedClass?.label}
        </h3>
        <button class="link-btn" on:click={planSwapOpen}>Plan route ›</button>
      </div>
      <p class="section-sub">
        {anchor
          ? `Best odds within 180 km of ${pickupStation ? pickupStation.name : "you"}.`
          : "Set a pick-up station to rank these by distance."}
        Tap one to route there.
      </p>

      <div class="swap-list">
        {#each swapOptions as s (s.id)}
          <button class="swap-row" on:click={() => planSwapTo(s)}>
            <ProbabilityBadge score={s.score} size="sm" />
            <div class="sr-info">
              <div class="sr-name">{s.name}</div>
              <div class="sr-meta">
                {s.type} · fleet {s.fleet}{anchor && s.fromRouteKm > 0
                  ? " · " + Math.round(s.fromRouteKm) + " km away"
                  : ""}
              </div>
            </div>
            <svg class="sr-go" viewBox="0 0 24 24" width="18" height="18">
              <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        {/each}
      </div>
    {/if}

    <div class="card-actions">
      <button class="btn ghost" on:click={remove}>Delete</button>
      <button class="btn ghost" on:click={startEdit}>Edit booking</button>
    </div>

  {:else}
    <!-- ============ ENTRY FORM ============ -->
    <div class="intro">
      <h2>{$booking ? "Edit booking" : "Add your booking"}</h2>
      <p>
        Sixt has no public API, so enter your rental details once. The app
        keeps them on this device and uses them to plan swaps.
      </p>
    </div>

    <div class="form">
      <label class="field">
        <span class="f-label">Booking reference</span>
        <input
          type="text"
          placeholder="e.g. 9123456789"
          bind:value={draft.ref}
          autocapitalize="characters"
        />
      </label>

      <label class="field">
        <span class="f-label">Pick-up station</span>
        <select bind:value={draft.pickupStationId}>
          <option value="">— Select a station —</option>
          {#each stationOptions as s}
            <option value={s.id}>{s.name}</option>
          {/each}
        </select>
      </label>

      <div class="field-row">
        <label class="field">
          <span class="f-label">Pick-up date</span>
          <input type="date" bind:value={draft.pickupDate} />
        </label>
        <label class="field">
          <span class="f-label">Return date</span>
          <input type="date" bind:value={draft.returnDate} />
        </label>
      </div>

      <label class="field">
        <span class="f-label">Class you booked</span>
        <select bind:value={draft.expectedClassId}>
          {#each CAR_CLASSES as c}
            <option value={c.id}>{c.label}</option>
          {/each}
        </select>
      </label>

      <div class="field">
        <span class="f-label">Car you were actually given <em>(optional)</em></span>
        {#if draft.actualBrand}
          <div class="picked-car">
            <div>
              <b>{draft.actualBrand} {draft.actualModel}</b>
              <small>{draft.actualClassId
                ? CAR_CLASS_BY_ID[draft.actualClassId].label
                : ""}</small>
            </div>
            <button class="mini" on:click={clearActualCar} aria-label="Clear">×</button>
          </div>
        {:else}
          <input
            type="text"
            placeholder="Search — e.g. VW Golf, BMW X1"
            bind:value={carQuery}
            autocomplete="off"
          />
          {#if carMatches.length}
            <div class="ac-list">
              {#each carMatches as m}
                <button class="ac-item" on:click={() => pickActualCar(m)}>
                  <b>{m.brand} {m.model}</b>
                  <small>{CAR_CLASS_BY_ID[m.classId].label}</small>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>

      <label class="field">
        <span class="f-label">Notes <em>(optional)</em></span>
        <textarea
          rows="2"
          placeholder="Counter desk hours, agent name, anything useful…"
          bind:value={draft.notes}
        ></textarea>
      </label>

      <div class="form-actions">
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
  .view { padding: 14px 12px 60px; max-width: 640px; margin: 0 auto; }

  .intro h2 { margin: 4px 2px; font-size: 21px; font-weight: 800; }
  .intro p {
    margin: 0 2px 14px;
    font-size: 13.5px;
    color: var(--text-2);
    line-height: 1.5;
  }

  /* ---- ticket ---- */
  .ticket {
    background: linear-gradient(135deg, #ffffff 0%, #fff7f1 100%);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 14px;
    box-shadow: var(--shadow-1);
  }
  .ticket-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--line);
  }
  .t-ref { display: flex; flex-direction: column; }
  .t-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
  }
  .t-val {
    font-size: 18px;
    font-weight: 800;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    margin-top: 2px;
  }
  .status-pill {
    flex-shrink: 0;
    font-size: 11.5px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 8px;
    white-space: nowrap;
  }
  .status-pill.reserved { background: var(--blue-soft); color: var(--blue); }
  .status-pill.match { background: rgba(52,199,89,0.16); color: #1f8a3b; }
  .status-pill.mismatch { background: rgba(255,159,10,0.18); color: #b9710a; }

  .ticket-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding-top: 12px;
  }
  .tg-cell { display: flex; flex-direction: column; min-width: 0; }
  .tg-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }
  .tg-val { font-size: 14px; font-weight: 600; margin-top: 3px; }

  .notes {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed var(--line);
    font-size: 13px;
    color: var(--text-2);
    font-style: italic;
  }

  /* ---- explainer ---- */
  .explainer {
    margin-top: 12px;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-2);
  }
  .explainer strong { color: var(--text); }
  .explainer.reserved { background: var(--blue-soft); }
  .explainer.match { background: rgba(52,199,89,0.12); }
  .explainer.mismatch { background: rgba(255,159,10,0.14); }

  /* ---- swap finder ---- */
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 18px 2px 2px;
    gap: 10px;
  }
  .section-head h3 { margin: 0; font-size: 16px; font-weight: 700; }
  .link-btn {
    border: none;
    background: transparent;
    color: var(--blue);
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .section-sub {
    margin: 4px 2px 10px;
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.45;
  }

  .swap-list {
    background: var(--surface);
    border-radius: 14px;
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
  .sr-meta {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
    text-transform: capitalize;
  }
  .sr-go { color: var(--muted); flex-shrink: 0; }

  .card-actions {
    display: flex;
    gap: 8px;
    margin-top: 18px;
  }

  /* ---- form ---- */
  .form {
    background: var(--surface);
    border-radius: 16px;
    box-shadow: var(--shadow-1);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 13px;
  }
  .field { display: flex; flex-direction: column; gap: 5px; }
  .field-row { display: flex; gap: 10px; }
  .field-row .field { flex: 1; }
  .f-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);
  }
  .f-label em { color: var(--muted); font-weight: 400; font-style: normal; }

  input,
  select,
  textarea {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px 11px;
    font-size: 15px;
    background: var(--surface);
    color: var(--text);
    outline: none;
    width: 100%;
  }
  input:focus,
  select:focus,
  textarea:focus { border-color: var(--blue); }
  textarea { resize: vertical; font-family: inherit; }

  .picked-car {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 9px 11px;
    background: var(--surface-2);
  }
  .picked-car b { font-size: 14.5px; }
  .picked-car small { display: block; font-size: 12px; color: var(--muted); }
  .mini {
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 15px;
    flex-shrink: 0;
  }

  .ac-list {
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 4px;
  }
  .ac-item {
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: none;
    border-bottom: 1px solid var(--line-soft);
    padding: 9px 11px;
  }
  .ac-item:last-child { border-bottom: none; }
  .ac-item:active { background: var(--surface-2); }
  .ac-item b { font-size: 14px; }
  .ac-item small { color: var(--muted); font-size: 12px; margin-left: 6px; }

  .form-actions { display: flex; gap: 8px; margin-top: 4px; }

  .btn {
    flex: 1;
    border: none;
    border-radius: 11px;
    padding: 12px;
    font-size: 14.5px;
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
