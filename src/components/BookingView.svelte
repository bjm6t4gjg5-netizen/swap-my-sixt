<script lang="ts">
  import { STATION_BY_ID, STATIONS } from "../lib/stations";
  import { CAR_CLASSES, CAR_CLASS_BY_ID, searchCars } from "../lib/cars";
  import { decodeAcriss, ACRISS_EXAMPLES } from "../lib/acriss";
  import { computeScore } from "../lib/heuristic";
  import { haversineKm } from "../lib/geo";
  import { booking, myLocation, requestNavigation } from "../lib/store";
  import type {
    Booking,
    CarModel,
    NegCar,
    ScoredStation
  } from "../lib/types";
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
      pickupTime: "",
      returnStationId: "",
      returnDate: "",
      returnTime: "",
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
  $: returnStation = current?.returnStationId
    ? STATION_BY_ID[current.returnStationId]
    : undefined;

  function fmtDateTime(date?: string, time?: string): string {
    if (!date) return "—";
    let s = date;
    try {
      s = new Date(date + "T00:00").toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
    } catch {
      /* keep raw string */
    }
    return time ? `${s} · ${time}` : s;
  }
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
      // nearest-first so close branches always show, even low-scoring ones
      list = list
        .filter((s) => s.fromRouteKm <= 220 && s.id !== current!.pickupStationId)
        .sort((a, b) => a.fromRouteKm - b.fromRouteKm);
    } else {
      list = list.sort((a, b) => b.score - a.score);
    }
    return list.slice(0, 14);
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
      target: { kind: "class", classId: current.expectedClassId }
    });
  }
  function planSwapOpen() {
    if (!current) return;
    requestNavigation({
      origin: originPoint(),
      target: { kind: "class", classId: current.expectedClassId }
    });
  }

  /* ---------- negotiation mode ---------- */
  let offeredQuery = "";
  let spottedQuery = "";
  $: offeredMatches = offeredQuery.trim()
    ? searchCars(offeredQuery).slice(0, 5)
    : [];
  $: spottedMatches = spottedQuery.trim()
    ? searchCars(spottedQuery).slice(0, 5)
    : [];

  $: neg = current?.negotiation ?? { offered: [], spotted: [] };
  $: bookedTier = expectedClass ? expectedClass.tier : 0;

  function carTier(c: NegCar): number {
    return CAR_CLASS_BY_ID[c.classId].tier;
  }
  function carClassLabel(c: NegCar): string {
    return CAR_CLASS_BY_ID[c.classId].label;
  }
  function bestOf(list: NegCar[]): NegCar | null {
    if (!list.length) return null;
    return list.reduce((a, b) => (carTier(b) > carTier(a) ? b : a));
  }

  function addNegCar(which: "offered" | "spotted", m: CarModel) {
    if (!current) return;
    const base = current.negotiation ?? { offered: [], spotted: [] };
    const next = { offered: [...base.offered], spotted: [...base.spotted] };
    next[which] = [
      ...next[which],
      { brand: m.brand, model: m.model, classId: m.classId }
    ];
    booking.set({ ...current, negotiation: next });
    if (which === "offered") offeredQuery = "";
    else spottedQuery = "";
  }
  function removeNegCar(which: "offered" | "spotted", idx: number) {
    if (!current) return;
    const base = current.negotiation ?? { offered: [], spotted: [] };
    const next = { offered: [...base.offered], spotted: [...base.spotted] };
    next[which].splice(idx, 1);
    booking.set({ ...current, negotiation: next });
  }

  type NegTone = "good" | "warn" | "bad" | "info";
  $: negVerdict = ((): { tone: NegTone; text: string } => {
    if (!current || !expectedClass) return { tone: "info", text: "" };
    const bt = expectedClass.tier;
    const bestO = bestOf(neg.offered);
    const bestS = bestOf(neg.spotted);

    if (!bestO && !bestS) {
      return {
        tone: "info",
        text: "Log what the desk offers you, plus anything you can see parked on the lot. I'll tell you whether to switch or hold out."
      };
    }
    if (
      bestS &&
      carTier(bestS) > bt &&
      (!bestO || carTier(bestS) > carTier(bestO))
    ) {
      const overWhat = bestO
        ? `their best offer (${bestO.brand} ${bestO.model})`
        : `your booked ${expectedClass.label}`;
      const gap = carTier(bestS) - (bestO ? carTier(bestO) : bt);
      return {
        tone: "good",
        text: `Negotiate hard: the ${bestS.brand} ${bestS.model} on the lot is ${gap} tier${gap > 1 ? "s" : ""} above ${overWhat}. Ask for it by name and mention you can see it's available — an idle car is easier to give away than a discount.`
      };
    }
    if (bestO) {
      const d = carTier(bestO) - bt;
      if (d > 0) {
        return {
          tone: "good",
          text: `Take it. Their best offer — ${bestO.brand} ${bestO.model} — is a ${d}-tier upgrade on your booked ${expectedClass.label}. No reason to hold out unless you've spotted something better.`
        };
      }
      if (d === 0) {
        return {
          tone: "warn",
          text: `${bestO.brand} ${bestO.model} matches your booked ${expectedClass.label} — fair, but no upgrade. Scan the lot first; if something better is sitting idle, ask for it.`
        };
      }
      return {
        tone: "bad",
        text: `Push back. Everything offered is below your booked ${expectedClass.label} — you're entitled to at least that class. Decline the downgrade and ask them to honour the booking or upgrade you.`
      };
    }
    return {
      tone: "info",
      text: `No offer logged yet. Best on the lot is the ${bestS!.brand} ${bestS!.model} — when the desk makes an offer, compare it against that.`
    };
  })();

  function tierDelta(c: NegCar): { sym: string; cls: string; txt: string } {
    const d = carTier(c) - bookedTier;
    if (d > 0) return { sym: "▲", cls: "up", txt: `+${d}` };
    if (d < 0) return { sym: "▼", cls: "down", txt: `${d}` };
    return { sym: "=", cls: "same", txt: "same" };
  }

  /** Plain-language reason for a car's tier position vs the booking. */
  function tierReason(c: NegCar): string {
    const label = carClassLabel(c);
    if (!expectedClass) return label;
    const d = carTier(c) - expectedClass.tier;
    if (d > 0) {
      return `${label} — ${d} tier${d > 1 ? "s" : ""} above your booked ${expectedClass.label}, so it's an upgrade`;
    }
    if (d < 0) {
      return `${label} — ${-d} tier${-d > 1 ? "s" : ""} below your booked ${expectedClass.label}, so it's a downgrade`;
    }
    return `${label} — same tier as your booked ${expectedClass.label}`;
  }
</script>

<div class="view">
  {#if mode === "view" && current}
    <!-- ===================== BOOKING CARD ===================== -->
    <header class="vhead">
      <div class="vhead-row">
        <h2>Your booking</h2>
        <button class="edit-btn" on:click={startEdit}>
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Edit
        </button>
      </div>
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
          <span class="tg-sub">{fmtDateTime(current.pickupDate, current.pickupTime)}</span>
        </div>
        <div class="tg">
          <span class="t-cap">Return</span>
          <span class="tg-v">
            {returnStation
              ? returnStation.name
              : pickupStation
                ? pickupStation.name
                : "Not set"}
          </span>
          <span class="tg-sub">{fmtDateTime(current.returnDate, current.returnTime)}</span>
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

    <!-- ===================== NEGOTIATION ===================== -->
    <div class="neg">
      <div class="neg-top">
        <h3>Negotiation helper</h3>
        <p>
          At the counter — log what they offer you and any cars you can see on
          the lot. Everything is ranked against your booked
          <b>{expectedClass?.label}</b>.
        </p>
      </div>

      <div class="neg-grid">
        <div class="neg-col">
          <div class="nc-head offered">Offered to me</div>
          {#each neg.offered as c, i}
            {@const d = tierDelta(c)}
            <div class="ncar">
              <div class="ncar-info">
                <span class="ncar-name">{c.brand} {c.model}</span>
                <span class="ncar-class">{tierReason(c)}</span>
              </div>
              <span class="delta {d.cls}">{d.sym} {d.txt}</span>
              <button
                class="ncar-x"
                on:click={() => removeNegCar("offered", i)}
                aria-label="Remove">×</button>
            </div>
          {/each}
          <div class="addbox">
            <input
              type="text"
              placeholder="Add a car they offered…"
              bind:value={offeredQuery}
              autocomplete="off"
            />
            {#if offeredMatches.length}
              <div class="adddrop">
                {#each offeredMatches as m}
                  <button on:click={() => addNegCar("offered", m)}>
                    <b>{m.brand} {m.model}</b>
                    <small>{CAR_CLASS_BY_ID[m.classId].label}</small>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <div class="neg-col">
          <div class="nc-head spotted">Spotted on the lot</div>
          {#each neg.spotted as c, i}
            {@const d = tierDelta(c)}
            <div class="ncar">
              <div class="ncar-info">
                <span class="ncar-name">{c.brand} {c.model}</span>
                <span class="ncar-class">{tierReason(c)}</span>
              </div>
              <span class="delta {d.cls}">{d.sym} {d.txt}</span>
              <button
                class="ncar-x"
                on:click={() => removeNegCar("spotted", i)}
                aria-label="Remove">×</button>
            </div>
          {/each}
          <div class="addbox">
            <input
              type="text"
              placeholder="Add a car you can see…"
              bind:value={spottedQuery}
              autocomplete="off"
            />
            {#if spottedMatches.length}
              <div class="adddrop">
                {#each spottedMatches as m}
                  <button on:click={() => addNegCar("spotted", m)}>
                    <b>{m.brand} {m.model}</b>
                    <small>{CAR_CLASS_BY_ID[m.classId].label}</small>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="neg-verdict {negVerdict.tone}">
        <span class="nv-tag">Strategy</span>
        <span class="nv-text">{negVerdict.text}</span>
      </div>
    </div>

    <!-- ===================== SWAP FINDER ===================== -->
    {#if status !== "match"}
      <div class="sec-head">
        <h3>Swap for a {expectedClass?.label}</h3>
        <button class="link" on:click={planSwapOpen}>Plan route ›</button>
      </div>
      <p class="sec-sub">
        {anchor
          ? `Nearest branches to ${pickupStation ? pickupStation.name : "you"}, closest first — with the odds for each.`
          : "Set a pick-up station to rank these by distance."}
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
      <button class="btn ghost" on:click={startEdit}>Edit booking</button>
      <button class="btn danger" on:click={remove}>Delete</button>
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
        <label class="field grow2">
          <span class="f-lab">Pick-up date</span>
          <input class="ipt" type="date" bind:value={draft.pickupDate} />
        </label>
        <label class="field">
          <span class="f-lab">Time</span>
          <input class="ipt" type="time" bind:value={draft.pickupTime} />
        </label>
      </div>

      <div class="field">
        <span class="f-lab">Return station</span>
        <StationSearchField
          stationId={draft.returnStationId ?? ""}
          placeholder="Same as pick-up, or search…"
          on:select={(e) => (draft.returnStationId = e.detail)}
        />
      </div>

      <div class="frow">
        <label class="field grow2">
          <span class="f-lab">Return date</span>
          <input class="ipt" type="date" bind:value={draft.returnDate} />
        </label>
        <label class="field">
          <span class="f-lab">Time</span>
          <input class="ipt" type="time" bind:value={draft.returnTime} />
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
  .vhead-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .edit-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--blue);
    color: white;
    border: none;
    border-radius: 100px;
    padding: 8px 15px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0,122,255,0.28);
  }
  .edit-btn:active { transform: scale(0.96); }

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
  .tg { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tg-v { font-size: 14px; font-weight: 600; }
  .tg-sub { font-size: 11.5px; color: var(--muted); }

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

  /* ---------- negotiation ---------- */
  .neg {
    margin-top: 18px;
    background: var(--surface);
    border-radius: 18px;
    box-shadow: var(--shadow-1);
    padding: 15px;
  }
  .neg-top h3 { margin: 0 0 3px; font-size: 17px; font-weight: 800; }
  .neg-top p {
    margin: 0 0 13px;
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
  }
  .neg-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .neg-col {
    background: var(--surface-2);
    border-radius: 13px;
    padding: 10px;
  }
  .nc-head {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 4px 8px;
  }
  .nc-head.offered { color: var(--blue); }
  .nc-head.spotted { color: var(--orange-dark); }

  .ncar {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: var(--surface);
    border-radius: 10px;
    padding: 9px 10px;
    margin-bottom: 6px;
  }
  .ncar-info { flex: 1; min-width: 0; }
  .ncar-name { font-size: 13.5px; font-weight: 700; display: block; }
  .ncar-class {
    font-size: 11.5px;
    color: var(--muted);
    line-height: 1.4;
    margin-top: 1px;
    display: block;
  }
  .delta {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 800;
    padding: 3px 7px;
    border-radius: 7px;
  }
  .delta.up { background: rgba(52,199,89,0.16); color: #1f8a3b; }
  .delta.down { background: rgba(255,59,48,0.14); color: #c5362c; }
  .delta.same { background: var(--surface-3); color: var(--muted); }
  .ncar-x {
    flex-shrink: 0;
    border: none;
    background: var(--surface-3);
    color: var(--muted);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 14px;
  }

  .addbox { position: relative; }
  .addbox input {
    width: 100%;
    border: 1px dashed var(--line);
    border-radius: 10px;
    padding: 9px 11px;
    font-size: 13.5px;
    background: var(--surface);
    color: var(--text);
    outline: none;
  }
  .addbox input:focus { border-style: solid; border-color: var(--blue); }
  .adddrop {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 4px);
    z-index: 10;
    background: var(--surface);
    border-radius: 10px;
    box-shadow: var(--shadow-2);
    overflow: hidden;
  }
  .adddrop button {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line-soft);
    padding: 9px 11px;
  }
  .adddrop button:last-child { border-bottom: none; }
  .adddrop button:active { background: var(--surface-2); }
  .adddrop b { font-size: 13.5px; }
  .adddrop small { color: var(--muted); font-size: 11.5px; margin-left: 6px; }

  .neg-verdict {
    margin-top: 12px;
    border-radius: 12px;
    padding: 11px 13px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-2);
  }
  .neg-verdict.good { background: rgba(52,199,89,0.13); }
  .neg-verdict.warn { background: rgba(255,159,10,0.15); }
  .neg-verdict.bad { background: rgba(255,59,48,0.12); }
  .neg-verdict.info { background: var(--blue-soft); }
  .nv-tag {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text);
    margin-right: 6px;
  }

  @media (min-width: 540px) {
    .neg-grid { grid-template-columns: 1fr 1fr; }
  }

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
  .frow .field.grow2 { flex: 2; }
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
  .btn.danger {
    background: var(--surface-2);
    color: var(--red);
    border: 1px solid var(--line);
  }
  .btn:active { transform: scale(0.98); }
</style>
