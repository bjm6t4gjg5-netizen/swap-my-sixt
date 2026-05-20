<script lang="ts">
  import { STATION_BY_ID, STATIONS } from "../lib/stations";
  import { CAR_CLASSES, CAR_CLASS_BY_ID, searchCars } from "../lib/cars";
  import {
    CAR_VARIANTS,
    VARIANT_BY_ID,
    searchVariants,
    variantLabel,
    consumptionLabel
  } from "../lib/carVariants";
  import { decodeAcriss, ACRISS_EXAMPLES } from "../lib/acriss";
  import { computeScore } from "../lib/heuristic";
  import { haversineKm } from "../lib/geo";
  import { booking, myLocation, requestNavigation } from "../lib/store";
  import type {
    Booking,
    CarModel,
    CarVariant,
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
      bookedVariantId: undefined,
      sixtStatus: "none",
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
  // the booked engine variant (if picked) — its class wins for scoring
  $: draftBookedVariant = draft.bookedVariantId
    ? VARIANT_BY_ID[draft.bookedVariantId]
    : undefined;
  // class we'll store: variant wins, else decoded ACRISS, else manual pick
  $: resolvedClassId = draftBookedVariant
    ? draftBookedVariant.classId
    : draftDecoded.valid
      ? draftDecoded.classId
      : manualClass;

  // --- booked-car variant picker ---
  let bookedCarQuery = "";
  $: bookedCarMatches = bookedCarQuery.trim()
    ? searchVariants(bookedCarQuery)
    : [];
  function pickBookedVariant(v: CarVariant) {
    draft.bookedVariantId = v.id;
    draft.bookedExample = variantLabel(v);
    bookedCarQuery = "";
  }
  function clearBookedVariant() {
    draft.bookedVariantId = undefined;
    draft.bookedExample = "";
  }

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

  /* ---------- negotiation mode (variant-level) ---------- */
  let offeredQuery = "";
  let spottedQuery = "";
  $: offeredMatches = offeredQuery.trim() ? searchVariants(offeredQuery) : [];
  $: spottedMatches = spottedQuery.trim() ? searchVariants(spottedQuery) : [];

  $: neg = current?.negotiation ?? { offered: [], spotted: [] };
  $: bookedTier = expectedClass ? expectedClass.tier : 0;
  // ACRISS "Elite" category letter — booked car is a notch above the base size
  $: bookedElite = !!(bookedDecoded?.valid && bookedDecoded.elite);
  $: bookedVariant = current?.bookedVariantId
    ? VARIANT_BY_ID[current.bookedVariantId]
    : undefined;
  $: sixtStatus = current?.sixtStatus ?? "none";

  function carTier(c: NegCar): number {
    return CAR_CLASS_BY_ID[c.classId].tier;
  }
  function negVariant(c: NegCar): CarVariant | undefined {
    return c.variantId ? VARIANT_BY_ID[c.variantId] : undefined;
  }
  function bestOf(list: NegCar[]): NegCar | null {
    if (!list.length) return null;
    return list.reduce((a, b) => (carTier(b) > carTier(a) ? b : a));
  }

  function addNegCar(which: "offered" | "spotted", v: CarVariant) {
    if (!current) return;
    const base = current.negotiation ?? { offered: [], spotted: [] };
    const next = { offered: [...base.offered], spotted: [...base.spotted] };
    next[which] = [
      ...next[which],
      {
        brand: v.brand,
        model: `${v.family} ${v.trim}`,
        classId: v.classId,
        variantId: v.id
      }
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

  // which branch the negotiation is at (defaults to the pick-up station)
  $: negStationId =
    current?.negotiation?.stationId || current?.pickupStationId || "";
  $: negStation = negStationId ? STATION_BY_ID[negStationId] : undefined;

  function setNegStation(id: string) {
    if (!current) return;
    const base = current.negotiation ?? { offered: [], spotted: [] };
    booking.set({
      ...current,
      negotiation: { ...base, stationId: id }
    });
  }

  /** How branch size/type shapes your counter leverage. */
  $: branchLeverage = (() => {
    const st = negStation;
    if (!st) return "";
    const name = st.name.replace("SIXT ", "");
    if (st.type === "airport" || st.fleet === "XL") {
      return `${name} is a high-turnover branch — a big lot and constant churn mean real room to upgrade you. Push confidently.`;
    }
    if (st.fleet === "L" || st.type === "train") {
      return `${name} is a mid-sized branch — a decent shot at an upgrade if you ask for something specific.`;
    }
    return `${name} is a smaller branch — the lot may be thin, so be realistic, and phone ahead if you can.`;
  })();

  /** How much weight the user's Sixt loyalty status gives at the counter. */
  function statusLeverage(s: string): string {
    if (s === "diamond")
      return "As Sixt Diamond, a free upgrade should be the default — push firmly.";
    if (s === "platinum")
      return "Sixt Platinum gives real standing — mention it and expect a better car.";
    if (s === "gold")
      return "Sixt Gold helps — drop it in; it nudges the agent toward goodwill.";
    return "No loyalty status — an upgrade is goodwill, not a right. Be friendly and specific.";
  }
  $: statusBump = { none: 1, gold: 2, platinum: 2, diamond: 3 }[sixtStatus] ?? 1;

  /** What counts as a good deal for this booking + status. */
  $: goodDeal = expectedClass
    ? `A good deal is anything from your booked ${expectedClass.label} upward. ` +
      (bookedElite
        ? `Note your code ${bookedDecoded?.code} is an "Elite" category — already a notch above the base ${expectedClass.label}, so a true upgrade must clear that, not merely match the class. `
        : "") +
      `${statusLeverage(sixtStatus)} Realistically aim about ${statusBump} tier${statusBump > 1 ? "s" : ""} up.`
    : "";

  /* ---------- car recommendations (what to ask for) ---------- */
  // How many tiers above the booking the branch realistically supports.
  $: branchReach = (() => {
    const st = negStation;
    if (!st) return 2;
    if (st.type === "airport" || st.fleet === "XL") return 3;
    if (st.fleet === "L" || st.type === "train") return 2;
    return 1;
  })();
  // Total realistic reach = branch room + loyalty-status room (capped).
  $: reachTiers = Math.min(5, branchReach + (statusBump - 1));

  // Variant ids already logged as offered/spotted — don't re-recommend them.
  $: usedVariantIds = new Set(
    [...neg.offered, ...neg.spotted].map((c) => c.variantId).filter(Boolean)
  );

  // Every variant that is a genuine upgrade and within reach at this branch.
  $: recoPool = ((): CarVariant[] => {
    if (!expectedClass) return [];
    const lo = bookedTier + 1;
    const hi = bookedTier + reachTiers;
    return CAR_VARIANTS.filter((v) => {
      if (usedVariantIds.has(v.id)) return false;
      const t = CAR_CLASS_BY_ID[v.classId].tier;
      return t >= lo && t <= hi;
    });
  })();

  // Filter options — only values that actually exist in the reachable pool.
  $: recoBrands = Array.from(new Set(recoPool.map((v) => v.brand))).sort();
  $: recoFuels = Array.from(new Set(recoPool.map((v) => v.fuel as string))).sort();
  $: recoBodies = Array.from(new Set(recoPool.map((v) => v.body as string))).sort();
  $: recoDrives = Array.from(new Set(recoPool.map((v) => v.drivetrain as string))).sort();

  let recoBrand = "All";
  let recoFuel = "Any";
  let recoBody = "Any";
  let recoDrive = "Any";
  let recoMinSpeed = 0;

  // Drop any filter back to its default if its value is no longer offered.
  $: if (recoBrand !== "All" && !recoBrands.includes(recoBrand)) recoBrand = "All";
  $: if (recoFuel !== "Any" && !recoFuels.includes(recoFuel)) recoFuel = "Any";
  $: if (recoBody !== "Any" && !recoBodies.includes(recoBody)) recoBody = "Any";
  $: if (recoDrive !== "Any" && !recoDrives.includes(recoDrive)) recoDrive = "Any";

  $: recoFiltered =
    recoBrand !== "All" ||
    recoFuel !== "Any" ||
    recoBody !== "Any" ||
    recoDrive !== "Any" ||
    recoMinSpeed > 0;

  function clearRecoFilters() {
    recoBrand = "All";
    recoFuel = "Any";
    recoBody = "Any";
    recoDrive = "Any";
    recoMinSpeed = 0;
  }

  /** Tidy a body-shape id for display. */
  function bodyLabel(b: string): string {
    return b === "suv" ? "SUV" : b.charAt(0).toUpperCase() + b.slice(1);
  }

  // Final list: filters applied, one variant per family, easiest first, max 6.
  $: recommendations = ((): CarVariant[] => {
    let pool = recoPool;
    if (recoBrand !== "All") pool = pool.filter((v) => v.brand === recoBrand);
    if (recoFuel !== "Any") pool = pool.filter((v) => v.fuel === recoFuel);
    if (recoBody !== "Any") pool = pool.filter((v) => v.body === recoBody);
    if (recoDrive !== "Any") pool = pool.filter((v) => v.drivetrain === recoDrive);
    if (recoMinSpeed > 0) pool = pool.filter((v) => v.topSpeed >= recoMinSpeed);
    const byFamily = new Map<string, CarVariant>();
    for (const v of pool) {
      const key = `${v.brand} ${v.family}`;
      const cur = byFamily.get(key);
      if (!cur || v.hp > cur.hp) byFamily.set(key, v);
    }
    return Array.from(byFamily.values())
      .sort((a, b) => {
        const dt =
          CAR_CLASS_BY_ID[a.classId].tier - CAR_CLASS_BY_ID[b.classId].tier;
        return dt !== 0 ? dt : b.hp - a.hp;
      })
      .slice(0, 6);
  })();

  /** A short, concrete reason to ask the agent for this car. */
  function recoReason(v: CarVariant): string {
    const cls = CAR_CLASS_BY_ID[v.classId];
    const d = cls.tier - bookedTier;
    const step =
      d <= 1 ? "an easy ask" : d <= 3 ? "a solid step up" : "ambitious — worth a try";
    const bits = [cls.label, step];
    if (bookedVariant) {
      const hpD = v.hp - bookedVariant.hp;
      if (hpD >= 30) bits.push(`+${hpD} hp`);
      if (v.drivetrain === "AWD" && bookedVariant.drivetrain !== "AWD")
        bits.push("AWD grip");
    }
    return bits.join(" · ");
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
        text:
          "Log what the desk offers you, plus anything you can see parked on the lot — search the exact engine (530i, 540i…) so I can compare specs. " +
          statusLeverage(sixtStatus)
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
        text: `Negotiate hard: the ${bestS.brand} ${bestS.model} on the lot is ${gap} tier${gap > 1 ? "s" : ""} above ${overWhat}. Ask for it by name — an idle car is easy to give away. ${statusLeverage(sixtStatus)}`
      };
    }
    if (bestO) {
      const d = carTier(bestO) - bt;
      if (d > 0) {
        return {
          tone: "good",
          text: `Take it. ${bestO.brand} ${bestO.model} is a ${d}-tier upgrade on your booked ${expectedClass.label} — hold out only if you've spotted something even better.`
        };
      }
      if (d === 0) {
        return {
          tone: "warn",
          text:
            `${bestO.brand} ${bestO.model} only matches your booked ${expectedClass.label}` +
            (bookedElite
              ? " — and your code is the Elite trim, so this arguably falls a touch short. "
              : ". ") +
            `Scan the lot — with your status you can fairly ask for a step up. ${statusLeverage(sixtStatus)}`
        };
      }
      return {
        tone: "bad",
        text: `Push back. Everything offered is below your booked ${expectedClass.label} — you're entitled to at least that. Decline the downgrade and ask them to honour the booking or upgrade you.`
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
    // same base class — but an Elite booking (e.g. GEAR) sits a notch higher,
    // so a plain same-class car is a hair short, not a true match.
    if (bookedElite) return { sym: "≈", cls: "warn", txt: "base" };
    return { sym: "=", cls: "same", txt: "same" };
  }

  /** Concrete, spec-level reason a car is up or down vs the booking. */
  function tierReason(c: NegCar): string {
    const cls = CAR_CLASS_BY_ID[c.classId];
    if (!expectedClass) return cls.label;
    const d = cls.tier - expectedClass.tier;
    let base: string;
    if (d === 0 && bookedElite) {
      // Elite booking: a plain same-class car is a notch short, not a match
      base =
        `${cls.label} — matches the base ${expectedClass.label}, but your code ` +
        `${bookedDecoded?.code ?? ""} is an Elite trim, so this is a notch below your booking`;
    } else {
      const dir =
        d > 0
          ? `${d} tier${d > 1 ? "s" : ""} above`
          : d < 0
            ? `${-d} tier${-d > 1 ? "s" : ""} below`
            : "same tier as";
      base = `${cls.label} — ${dir} your ${expectedClass.label}`;
    }
    const v = negVariant(c);
    if (v && bookedVariant) {
      const diffs: string[] = [];
      const hpD = v.hp - bookedVariant.hp;
      if (Math.abs(hpD) >= 10)
        diffs.push(`${hpD > 0 ? "+" : ""}${hpD} hp (${v.hp} vs ${bookedVariant.hp})`);
      if (v.drivetrain !== bookedVariant.drivetrain)
        diffs.push(`${v.drivetrain} vs ${bookedVariant.drivetrain}`);
      if (v.fuel !== bookedVariant.fuel)
        diffs.push(`${v.fuel.toLowerCase()} vs ${bookedVariant.fuel.toLowerCase()}`);
      const spD = v.topSpeed - bookedVariant.topSpeed;
      if (Math.abs(spD) >= 10)
        diffs.push(`${spD > 0 ? "+" : ""}${spD} km/h top speed`);
      // fuel-efficiency comparison (only meaningful between like fuels)
      if (v.fuel !== "Electric" && bookedVariant.fuel !== "Electric") {
        const cD = v.consumption - bookedVariant.consumption;
        if (Math.abs(cD) >= 0.4)
          diffs.push(
            `${cD > 0 ? "+" : ""}${cD.toFixed(1)} l/100km (${
              cD > 0 ? "thirstier" : "more efficient"
            })`
          );
      }
      if (diffs.length) base += ` · ${diffs.join(", ")}`;
    } else if (v) {
      base += ` · ${v.hp} hp, ${v.topSpeed} km/h, ${v.drivetrain}, ${consumptionLabel(v)}`;
    }
    return base;
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
          <CarArt
            classId={current.expectedClassId}
            body={bookedVariant?.body}
            brand={bookedVariant?.brand}
          />
        </div>
        <div class="v-info">
          <div class="t-cap">You booked</div>
          <div class="v-name">
            {current.bookedExample?.trim()
              ? current.bookedExample
              : expectedClass?.label}
            <span class="orsim">or similar</span>
          </div>
          {#if bookedVariant}
            <div class="v-decode">
              {bookedVariant.hp} hp · {bookedVariant.topSpeed} km/h ·
              {bookedVariant.accel}s · {bookedVariant.drivetrain} ·
              {consumptionLabel(bookedVariant)}
            </div>
          {:else if bookedDecoded?.valid}
            <div class="v-decode">{bookedDecoded.summary}</div>
          {/if}
          <div class="v-class">
            {expectedClass?.label} class
            {#if bookedDecoded?.valid}<span class="v-code">{bookedDecoded.code}</span>{/if}
            {#if current.sixtStatus && current.sixtStatus !== "none"}
              <span class="v-status">Sixt {current.sixtStatus}</span>
            {/if}
          </div>
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
          At the counter — search the exact engine (530i, 540i xDrive…) for
          every car offered or spotted. Specs are compared against your booked
          <b>{bookedVariant ? variantLabel(bookedVariant) : expectedClass?.label}</b>.
        </p>

        <div class="neg-station">
          <span class="ns-label">Negotiating at which branch?</span>
          <StationSearchField
            stationId={negStationId}
            placeholder="Pick the branch…"
            on:select={(e) => setNegStation(e.detail)}
          />
          {#if branchLeverage}
            <div class="ns-note">{branchLeverage}</div>
          {/if}
        </div>

        {#if goodDeal}
          <div class="good-deal">
            <span class="gd-tag">Good deal?</span>
            {goodDeal}
          </div>
        {/if}
      </div>

      {#if negStation}
        <div class="reco">
          <div class="reco-head">
            <span class="reco-title">Cars worth asking for</span>
            <span class="reco-sub">
              Realistic upgrades at {negStation.name.replace("SIXT ", "")} —
              hand the agent a specific name. Tap one you spot on the lot to log it.
            </span>
          </div>

          {#if recoBrands.length > 1}
            <div class="reco-brands">
              <button
                class="rb"
                class:on={recoBrand === "All"}
                on:click={() => (recoBrand = "All")}
              >All brands</button>
              {#each recoBrands as b}
                <button
                  class="rb"
                  class:on={recoBrand === b}
                  on:click={() => (recoBrand = b)}
                >{b}</button>
              {/each}
            </div>
          {/if}

          {#if recoPool.length > 0}
            <div class="reco-filters">
              <select class="rf" bind:value={recoFuel} aria-label="Fuel type">
                <option value="Any">Any fuel</option>
                {#each recoFuels as f}<option value={f}>{f}</option>{/each}
              </select>
              <select class="rf" bind:value={recoBody} aria-label="Body type">
                <option value="Any">Any body</option>
                {#each recoBodies as b}<option value={b}>{bodyLabel(b)}</option>{/each}
              </select>
              <select class="rf" bind:value={recoDrive} aria-label="Drivetrain">
                <option value="Any">Any drive</option>
                {#each recoDrives as d}<option value={d}>{d}</option>{/each}
              </select>
              <select class="rf" bind:value={recoMinSpeed} aria-label="Minimum top speed">
                <option value={0}>Any speed</option>
                <option value={200}>200+ km/h</option>
                <option value={220}>220+ km/h</option>
                <option value={240}>240+ km/h</option>
                <option value={250}>250 km/h only</option>
              </select>
            </div>
            {#if recoFiltered}
              <button class="reco-clear" on:click={clearRecoFilters}>↺ Clear filters</button>
            {/if}
          {/if}

          {#if recommendations.length}
            <div class="reco-list">
              {#each recommendations as v (v.id)}
                {@const d = CAR_CLASS_BY_ID[v.classId].tier - bookedTier}
                <button class="reco-card" on:click={() => addNegCar("spotted", v)}>
                  <div class="reco-art">
                    <CarArt classId={v.classId} body={v.body} brand={v.brand} compact />
                  </div>
                  <div class="reco-info">
                    <div class="reco-name">{v.brand} {v.family} {v.trim}</div>
                    <div class="reco-specs">{v.hp} hp · {v.drivetrain} · {v.fuel}</div>
                    <div class="reco-why">{recoReason(v)}</div>
                  </div>
                  <span class="delta up reco-delta">▲ +{d}</span>
                </button>
              {/each}
            </div>
          {:else}
            <div class="reco-empty">
              {#if recoFiltered}
                No cars match these filters at this branch — loosen one, or
                <button class="reco-clear inline" on:click={clearRecoFilters}>clear filters</button>.
              {:else}
                Your booked class is already near the top — focus on getting at
                least what you booked.
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      <div class="neg-grid">
        <div class="neg-col">
          <div class="nc-head offered">Offered to me</div>
          {#each neg.offered as c, i}
            {@const d = tierDelta(c)}
            {@const v = negVariant(c)}
            <div class="ncar">
              <div class="ncar-info">
                <div class="ncar-top">
                  <span class="ncar-name">{c.brand} {c.model}</span>
                  <span class="delta {d.cls}">{d.sym} {d.txt}</span>
                </div>
                {#if v}
                  <div class="ncar-specs">
                    <span>{v.hp} hp</span>
                    <span>{v.topSpeed} km/h</span>
                    <span>{v.accel}s 0–100</span>
                    <span>{v.drivetrain}</span>
                    <span>{v.fuel}</span>
                    <span>{consumptionLabel(v)}</span>
                  </div>
                {/if}
                <span class="ncar-class">{tierReason(c)}</span>
              </div>
              <button
                class="ncar-x"
                on:click={() => removeNegCar("offered", i)}
                aria-label="Remove">×</button>
            </div>
          {/each}
          <div class="addbox">
            <input
              type="text"
              placeholder="Search engine — e.g. 530i…"
              bind:value={offeredQuery}
              autocomplete="off"
            />
            {#if offeredMatches.length}
              <div class="adddrop">
                {#each offeredMatches as v}
                  <button on:click={() => addNegCar("offered", v)}>
                    <b>{v.brand} {v.family} {v.trim}</b>
                    <small>{v.hp} hp · {v.topSpeed} km/h · {v.fuel}</small>
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
            {@const v = negVariant(c)}
            <div class="ncar">
              <div class="ncar-info">
                <div class="ncar-top">
                  <span class="ncar-name">{c.brand} {c.model}</span>
                  <span class="delta {d.cls}">{d.sym} {d.txt}</span>
                </div>
                {#if v}
                  <div class="ncar-specs">
                    <span>{v.hp} hp</span>
                    <span>{v.topSpeed} km/h</span>
                    <span>{v.accel}s 0–100</span>
                    <span>{v.drivetrain}</span>
                    <span>{v.fuel}</span>
                    <span>{consumptionLabel(v)}</span>
                  </div>
                {/if}
                <span class="ncar-class">{tierReason(c)}</span>
              </div>
              <button
                class="ncar-x"
                on:click={() => removeNegCar("spotted", i)}
                aria-label="Remove">×</button>
            </div>
          {/each}
          <div class="addbox">
            <input
              type="text"
              placeholder="Search engine — e.g. X3 xDrive30d…"
              bind:value={spottedQuery}
              autocomplete="off"
            />
            {#if spottedMatches.length}
              <div class="adddrop">
                {#each spottedMatches as v}
                  <button on:click={() => addNegCar("spotted", v)}>
                    <b>{v.brand} {v.family} {v.trim}</b>
                    <small>{v.hp} hp · {v.topSpeed} km/h · {v.fuel}</small>
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

      <div class="field">
        <span class="f-lab">Your booked car <em>(exact engine — for spec comparison)</em></span>
        {#if draftBookedVariant}
          <div class="picked">
            <div>
              <b>{draftBookedVariant.brand} {draftBookedVariant.family} {draftBookedVariant.trim}</b>
              <small>
                {draftBookedVariant.hp} hp · {draftBookedVariant.topSpeed} km/h ·
                {draftBookedVariant.drivetrain} · {draftBookedVariant.fuel}
              </small>
            </div>
            <button class="clr" on:click={clearBookedVariant} aria-label="Clear">×</button>
          </div>
        {:else}
          <input
            class="ipt"
            type="text"
            placeholder="Search — e.g. BMW 4 Series 430i"
            bind:value={bookedCarQuery}
            autocomplete="off"
          />
          {#if bookedCarMatches.length}
            <div class="ac">
              {#each bookedCarMatches as v}
                <button class="ac-row" on:click={() => pickBookedVariant(v)}>
                  <b>{v.brand} {v.family} {v.trim}</b>
                  <small>{v.hp} hp · {v.topSpeed} km/h · {v.fuel}</small>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>

      <label class="field">
        <span class="f-lab">Your Sixt status</span>
        <select class="ipt" bind:value={draft.sixtStatus}>
          <option value="none">No loyalty status</option>
          <option value="gold">Sixt Gold</option>
          <option value="platinum">Sixt Platinum</option>
          <option value="diamond">Sixt Diamond</option>
        </select>
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
  .v-status {
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
    background: rgba(255, 95, 0, 0.14);
    color: var(--orange-dark);
    padding: 1px 7px;
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
    margin: 0 0 10px;
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
  }
  .neg-station { margin-bottom: 12px; }
  .ns-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 5px;
  }
  .ns-note {
    margin-top: 7px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-2);
    background: var(--surface-2);
    border-radius: 10px;
    padding: 8px 11px;
  }

  .good-deal {
    background: rgba(52, 199, 89, 0.12);
    border-radius: 11px;
    padding: 9px 11px;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--text-2);
    margin-bottom: 13px;
  }
  .gd-tag {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1f8a3b;
    margin-right: 5px;
  }

  /* ---------- recommendations ---------- */
  .reco {
    background: var(--surface-2);
    border-radius: 14px;
    padding: 12px;
    margin-bottom: 13px;
  }
  .reco-head { display: flex; flex-direction: column; gap: 3px; margin-bottom: 10px; }
  .reco-title { font-size: 14px; font-weight: 800; }
  .reco-sub { font-size: 11.5px; color: var(--muted); line-height: 1.45; }
  .reco-brands {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .rb {
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text-2);
    font-size: 12px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 100px;
  }
  .rb.on {
    background: var(--blue);
    border-color: var(--blue);
    color: white;
  }
  .rb:active { transform: scale(0.95); }

  .reco-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 8px;
  }
  .rf {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    min-height: 34px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background-color: var(--surface);
    color: var(--text);
    font-size: 12.5px;
    font-weight: 600;
    font-family: inherit;
    padding: 0 26px 0 9px;
    outline: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>");
    background-repeat: no-repeat;
    background-position: right 8px center;
  }
  .rf:focus { border-color: var(--blue); }
  .reco-clear {
    border: none;
    background: transparent;
    color: var(--blue);
    font-size: 12px;
    font-weight: 700;
    padding: 0 2px 8px;
  }
  .reco-clear.inline { padding: 0; font-size: inherit; font-weight: 600; }
  @media (min-width: 540px) {
    .reco-filters { grid-template-columns: repeat(4, 1fr); }
  }

  .reco-list { display: flex; flex-direction: column; gap: 7px; }
  .reco-card {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 11px;
    padding: 8px 10px;
  }
  .reco-card:active { transform: scale(0.99); background: var(--surface-2); }
  .reco-art { width: 60px; flex-shrink: 0; }
  .reco-info { flex: 1; min-width: 0; }
  .reco-name { font-size: 13.5px; font-weight: 700; }
  .reco-specs { font-size: 11px; color: var(--text-2); margin-top: 2px; }
  .reco-why { font-size: 11px; color: var(--muted); margin-top: 3px; line-height: 1.4; }
  .reco-delta { flex-shrink: 0; align-self: center; }
  .reco-empty {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    padding: 4px 2px;
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
  .ncar-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .ncar-name { font-size: 13.5px; font-weight: 700; }
  .ncar-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 5px;
  }
  .ncar-specs span {
    font-size: 10.5px;
    font-weight: 600;
    background: var(--surface-2);
    color: var(--text-2);
    border-radius: 5px;
    padding: 2px 6px;
  }
  .ncar-class {
    font-size: 11.5px;
    color: var(--muted);
    line-height: 1.45;
    margin-top: 6px;
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
  .delta.warn { background: rgba(255,159,10,0.18); color: #b9710a; }
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
    box-sizing: border-box;
    width: 100%;
    /* normalise iOS rendering so date / time / select all match height */
    -webkit-appearance: none;
    appearance: none;
    min-height: 44px;
    border: 1px solid var(--line);
    border-radius: 11px;
    padding: 0 12px;
    font-size: 15px;
    line-height: 1.2;
    background: var(--surface);
    color: var(--text);
    outline: none;
    font-family: inherit;
  }
  /* selects need room for a custom chevron */
  select.ipt {
    padding-right: 34px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>");
    background-repeat: no-repeat;
    background-position: right 11px center;
  }
  /* date / time inputs: keep the value left-aligned and vertically centred */
  input[type="date"].ipt,
  input[type="time"].ipt {
    padding: 0 12px;
    text-align: left;
  }
  textarea.ipt {
    -webkit-appearance: none;
    appearance: none;
    min-height: 64px;
    padding: 10px 12px;
    line-height: 1.45;
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
