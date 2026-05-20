// Offline "Lucas" — a rule-based fallback assistant that works with no API
// key. Witty, German, opinionated, and genuinely functional: he reads your
// booking and names real Sixt branches. With an Anthropic key connected, the
// full Claude-powered Lucas takes over.

import type { CarClassId } from "./types";
import { STATIONS } from "./stations";
import { nearestStations } from "./heuristic";

export interface OfflineContext {
  booking?: string;
  target?: string;
  pickup?: { id: string; name: string; lat: number; lng: number };
  classId?: CarClassId | null;
}

/** Clickable starter / follow-up questions shown in the chat. */
export const STARTER_QUESTIONS = [
  "Where should I swap?",
  "Decode my booking code",
  "Best car for the Autobahn?",
  "How do I negotiate an upgrade?",
  "Diamond status — what's it worth?",
  "Tell me a joke"
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GREETINGS = [
  "Moin! Lucas here — your rental analyst. So, what are we plotting today: a clever swap, a counter ambush, or just outwitting the Blitzer?",
  "Servus! Lucas, at your service, ja. Ask me about car classes, the negotiation game, or that mysterious code on your booking.",
  "Na, hallo! Lucas here. You booked one car and now you want a better one — Mensch, that is my entire reason for existing. Let's go."
];

const SPEED = [
  "Autobahn-Regel number one: the unrestricted stretches are a gift from God himself — the Blitzer near every Baustelle is the invoice. When the lorries suddenly drive like nuns, lift off. They always know first.",
  "Ach, German speed cameras — like an ex, ja: they appear exactly when you forgot about them, and the photo is never your good side. Behave through the towns, then enjoy the open road properly.",
  "A 540i is wasted if you bring home a 'Bußgeld' as a souvenir, genau. The free stretches are free; the 80 zones most certainly are not. Read the signs — then have your fun.",
  "There is no Pokal for being first into a 100 zone, my friend. The Blitzer wins that race every time, and it posts the result to your front door. Cruise the open bits, behave in the limits.",
  "Also, a classic: the left lane is for overtaking, not for living in. The flashing headlights behind you are not a Blitzer — but that quiet grey box on the gantry, that one, ja, that one bites."
];

const NEGOTIATE = [
  "Counter game, Lektion eins: never accept the first car they wave at you. Glance at the lot, name a better car you can actually see, mention it is simply standing there doing nothing. An idle car is far easier to give away than a discount.",
  "At the desk be friendly but be specific. 'I can see an X3 on the lot — any chance of that one?' beats a vague 'something nicer?' every single time. Genau — a specific wish gets a specific yes.",
  "Real Hebel you hold: an off-peak pickup, a long rental, loyalty status, and an empty bay where your booked class should be. If they cannot give you what you booked, the polite fix is a free upgrade — so ask for it, plainly and with a smile.",
  "If they try to hand you a downgrade — nein. You are entitled to at least your booked class. 'I booked Premium, this is a Compact. Honour the booking, or upgrade me.' Warm tone, firm spine. It works, Mensch."
];

const ACRISS = [
  "Ach, the ACRISS code — four little letters: size · body · gearbox · fuel. PDAR = Premium, 4–5 Door, Automatic, A/C. The Cars tab has a proper guide with a live decoder — and your own booking code is decoded right on the Booking tab.",
  "That four-letter code is not Hexerei, genau: letter one is size, two is body shape, three is gearbox and drive, four is fuel plus air-con. Tap 'New to ACRISS codes?' in the Cars tab and all is revealed."
];

const FUEL = [
  "For Autobahn cruising the Diesel is still the quiet king — a 520d or an A6 40 TDI will shrug off 1,000 km on one tank, even at a brisk pace. Petrols get thirsty the moment you actually use the power, ja.",
  "Electric on the Autobahn: lovely up to about 130 km/h, then the range melts like Eis in July. Wunderbar in the city — but plan your charging stops if you truly want to press on.",
  "Effizienz-Tipp, genau: the negotiation helper now compares consumption between any two engines. A 540i drinks noticeably more than a 520d — good to know before three weeks and a thousand-plus kilometres."
];

const JOKES = [
  "Why did the rental car go to therapy? Commitment issues, Mensch — three days here, a week there, never the same driver twice.",
  "I asked a Compact and a Luxury sedan who was faster. The Luxury won. The Compact insisted it was 'about the journey'. It was, ehrlich gesagt, not about the journey.",
  "A Diesel, a Petrol and an EV walk into a Raststätte. The Diesel orders one coffee, the Petrol orders two — and the EV is still out in the car park, charging, asking everyone to be patient.",
  "My favourite German road sign remains 'Ausfahrt'. The biggest city in the whole country — somehow there is an exit for it absolutely everywhere.",
  "What is a rental agent's favourite kind of music? Heavy upselling.",
  "I told a Sixt agent I wanted something with a bit of character. He gave me a car with 180,000 km and a mysterious smell. Technically, ja, character."
];

const STATUS = [
  "Diamond status, na also — that is the good cutlery. A free upgrade should be the default, not a Geschenk. Walk up confident: 'As a Diamond member, what have you got above my booking?' Then enjoy the silence while they look.",
  "Loyalty status is pure Hebel at the counter. Diamond especially — agents have real room to upgrade you and you are exactly the customer they are told to keep happy. Mention it early, mention it warmly.",
  "With Diamond, do not ask 'is an upgrade possible?' — ask 'which upgrade?' Small change of words, genau, big change of outcome."
];

/** Builds real, named station advice from the booking's pick-up point. */
function stationAdvice(ctx: OfflineContext): string {
  if (!ctx.pickup) {
    return "Plan a route on the Navigate tab and the app marks every Sixt branch along it with a swap-probability. Airports and big Hauptbahnhof branches turn their fleet over fastest — that's where the odds live. Add a pick-up station to your booking and I can name actual branches for you.";
  }
  const near = nearestStations(ctx.pickup, STATIONS, ctx.classId ?? null, 22)
    .filter((s) => s.id !== ctx.pickup!.id)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (!near.length) {
    return `From ${ctx.pickup.name} there's not much Sixt density nearby — plan a route on the Navigate tab and I'll catch the branches further along.`;
  }
  const lines = near
    .map(
      (s) =>
        `• ${s.name.replace("SIXT ", "")} — ~${Math.round(s.score * 100)}% odds, ${Math.round(s.fromRouteKm)} km away`
    )
    .join("\n");
  return `From ${ctx.pickup.name}, ja, your strongest swap bets are:\n${lines}\n\nBigger branch, better odds — an airport detour usually beats a hopeful 'maybe' at a small office. The Booking tab ranks the full list for you.`;
}

const RULES: { test: RegExp; reply: (ctx: OfflineContext) => string }[] = [
  {
    test: /^(hi|hey|hello|hallo|servus|moin|yo|good (morning|day|evening)|what'?s up)\b/i,
    reply: () => pick(GREETINGS)
  },
  {
    test: /blitz|radar|speed camera|\bcop\b|police|polizei|autobahn|how fast|top ?speed|ticket|fine|geblitzt|bußgeld|busgeld|speeding|limit/i,
    reply: () => pick(SPEED)
  },
  {
    test: /status|diamond|platinum|\bgold\b|loyalty|member/i,
    reply: () => pick(STATUS)
  },
  {
    test: /acriss|sipp| code\b|gear\b|what does .* mean|decode/i,
    reply: () => pick(ACRISS)
  },
  {
    test: /negotiat|counter|haggl|offer|\bdeal\b|ask for|upgrade|downgrade|desk/i,
    reply: (ctx) =>
      pick(NEGOTIATE) +
      (ctx.target ? `\n\nYou're hunting a ${ctx.target} — name it exactly at the desk, genau.` : "")
  },
  {
    test: /station|where|which sixt|nearest|branch|swap|husum|pick.?up/i,
    reply: stationAdvice
  },
  {
    test: /fuel|consumption|efficien|economical|diesel|petrol|electric|\brange\b|mpg|l\/100|charg|thirsty/i,
    reply: () => pick(FUEL)
  },
  {
    test: /my booking|my car|what car|what did i|booked|reservation|my rental/i,
    reply: (ctx) =>
      ctx.booking
        ? `So, here's what I have on file: ${ctx.booking}. If the counter hands you something else, log it in the negotiation helper and I'll tell you plainly — switch, or push back.`
        : "I don't see a booking saved yet, Mensch — add it on the Booking tab (reference, pick-up, ACRISS code) and my advice gets much sharper."
  },
  {
    test: /joke|funny|make me laugh|cheer|lol|haha|bored/i,
    reply: () => pick(JOKES)
  },
  {
    test: /horsepower|\bhp\b|\bps\b|power|engine|530i|540i|\bm3\b|variant|spec|compare/i,
    reply: () =>
      "Ah, engine talk — my favourite, ja. In the negotiation helper, search the exact variant they offer (530i, 540i xDrive, X3 xDrive30d…) and it lays out horsepower, top speed, 0–100, drivetrain and consumption — and compares it, number for number, against your booked car. Genau what you want before an Autobahn run."
  },
  {
    test: /thank|thx|danke|cheers|appreciate|nice|great|love/i,
    reply: () =>
      pick([
        "Bitte schön. Now go and claim the better car — and mind the Blitzer.",
        "Gern geschehen. Drive smart, swap smarter, ja.",
        "Ach, kein Problem at all. May your upgrades be free and your speed cameras switched off."
      ])
  },
  {
    test: /help|what can you|who are you|what do you do|options/i,
    reply: () =>
      "I'm Lucas — your rental analyst, German by birth and by temperament. I do swap strategy, decode ACRISS codes, coach you through the counter negotiation, compare car engines number-for-number, and supply Autobahn jokes at no extra charge. Connect an Anthropic API key (the '+ Key' button up top) and I get properly clever — but even keyless, I'm decent company. Try the buttons below."
  }
];

const FALLBACKS = [
  "Gute Frage — and just past my offline brain, ja. Connect an Anthropic API key via the '+ Key' button up top and I'll answer it properly. Meanwhile: ask me about swaps, negotiation, ACRISS codes, fuel, status, or the Blitzer — buttons below.",
  "Keyless right now, so my Reichweite is swap strategy, car specs, negotiation, loyalty status and Autobahn wisdom. For anything deeper, add an API key in the header. What else, my friend?",
  "Ach, that one wants the full-powered me — add an Anthropic key (header, top of this panel). Offline, I'm strongest on rentals, the counter game, and surviving the speed traps. Pick a button below, ja?"
];

/** Returns Lucas's offline (keyless) reply to a question. */
export function offlineReply(question: string, ctx: OfflineContext): string {
  const q = question.trim();
  if (!q) return pick(GREETINGS);
  for (const rule of RULES) {
    if (rule.test.test(q)) return rule.reply(ctx);
  }
  return pick(FALLBACKS);
}
