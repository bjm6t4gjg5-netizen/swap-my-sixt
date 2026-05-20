// Offline "Lucas" — a rule-based fallback assistant that works with no API
// key. German, dry, genuinely useful: he reads your booking and names real
// Sixt branches. With an Anthropic key connected, the full Claude-powered
// Lucas takes over.

import type { CarClassId } from "./types";
import { STATIONS } from "./stations";
import { nearestStations } from "./heuristic";

export interface OfflineContext {
  booking?: string;
  target?: string;
  pickup?: { id: string; name: string; lat: number; lng: number };
  classId?: CarClassId | null;
}

/** Default starter questions (shown before any conversation). */
export const STARTER_QUESTIONS = [
  "Where should I swap?",
  "Decode my booking code",
  "Best car for the Autobahn?",
  "How do I negotiate an upgrade?",
  "Tell me a joke"
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GREETINGS = [
  "Moin. Lucas here, your rental analyst. What are we working on — a swap, the counter negotiation, or that code on your booking?",
  "Hello! Lucas speaking. Ask me about car classes, the negotiation game, or how to read an ACRISS code.",
  "Servus. I'm Lucas. You booked one car and want a better one — that is precisely my job. Where shall we start?"
];

const SPEED = [
  "On the Autobahn, the unrestricted stretches are a gift — the speed cameras near every roadworks and exit are the catch. When the lorries suddenly behave, lift off. They always know first.",
  "German speed cameras are like an ex: they turn up when you forgot about them, and the photo is never your good side. Behave through the towns and you'll never meet one.",
  "A fast car is wasted if you bring home a fine as a souvenir. The free stretches are free; the 80 zones really aren't. Read the signs, then have your fun.",
  "Quick rule: the left lane is for overtaking, not for living in. The car flashing its lights behind you isn't a camera — but the grey box on the gantry ahead might be."
];

const NEGOTIATE = [
  "Counter game, lesson one: never accept the first car they wave at you. Glance at the lot, name a better car you can see, and mention it's just standing there. An idle car is easier to give away than a discount.",
  "At the desk, be friendly but specific. 'I can see an X3 on the lot — any chance of that?' beats a vague 'something nicer?' every time. A specific request gets a specific yes.",
  "Your real leverage: an off-peak pickup, a long rental, loyalty status, and an empty bay where your booked class should be. If they can't give you what you booked, the polite fix is a free upgrade — so ask, plainly.",
  "If they try to hand you a downgrade, don't take it quietly — you're entitled to at least your booked class. 'I booked Premium, this is a Compact — honour it, or upgrade me.' Warm tone, firm spine."
];

const ACRISS = [
  "An ACRISS code is four letters: size, body, gearbox, fuel. PDAR = Premium, 4–5 Door, Automatic, A/C. The Cars tab has a full guide with a live decoder — and your own booking code is decoded on the Booking tab.",
  "That four-letter code isn't a riddle: letter one is size, two is body shape, three is gearbox and drive, four is fuel plus air-con. The Cars tab walks through it letter by letter."
];

const FUEL = [
  "For Autobahn cruising the diesel is the quiet king — a 520d or A6 40 TDI shrugs off 1,000 km on one tank, even at a brisk pace. Petrols get thirsty the moment you use the power.",
  "Electric on the Autobahn: lovely up to about 130 km/h, then the range melts. Wonderful in the city — but plan your charging stops if you really want to press on.",
  "The negotiation helper compares consumption between any two engines. A 540i drinks noticeably more than a 520d — worth knowing before three weeks and a thousand kilometres."
];

const STATUS = [
  "Diamond status is the good cutlery. A free upgrade should be the default, not a favour. Walk up confident: 'As a Diamond member, what do you have above my booking?' — then enjoy the silence while they look.",
  "Loyalty status is real leverage. Diamond especially — agents have room to upgrade you, and you're exactly the customer they're told to keep. Mention it early, mention it warmly.",
  "With Diamond, don't ask 'is an upgrade possible?' — ask 'which upgrade?' Small change of words, big change of outcome."
];

// ── jokes, by topic ──────────────────────────────────────────────
const JOKES_GENERAL = [
  "Why did the rental car go to therapy? Commitment issues — three days here, a week there, never the same driver twice.",
  "I asked a Compact and a Luxury sedan who was faster. The Luxury won. The Compact insisted it was 'about the journey'. It was not about the journey.",
  "My favourite German road sign is still 'Ausfahrt'. Biggest city in the country — somehow there's an exit for it everywhere."
];
const JOKES_AUTOBAHN = [
  "On the Autobahn there are two kinds of driver: those who've been flashed by a speed camera, and those who are about to be.",
  "I love the Autobahn. It's the only place a rental Polo briefly believes it's a race car — for about four seconds, until a Passat erases that dream.",
  "Autobahn etiquette: the left lane is not a hotel. You may not check in."
];
const JOKES_COUNTER = [
  "What's a rental agent's favourite kind of music? Heavy upselling.",
  "I told the Sixt agent I wanted a car with character. He gave me one with 190,000 km and a mysterious smell. Technically, character.",
  "The rental counter asked if I wanted the insurance, the extra insurance, and the insurance for the extra insurance. I asked if the car came with a car."
];
const JOKES_EV = [
  "A diesel, a petrol and an EV walk into a services. The diesel orders a coffee, the petrol orders two — and the EV is still in the car park, charging, asking for patience.",
  "My EV and I have the same morning routine: we both need 40 minutes and a strong connection before we're any use.",
  "Range anxiety is just your car teaching you mindfulness, one nervous glance at the battery icon at a time."
];
const JOKES_BRAND = [
  "Why does a BMW driver never use the indicator? It would give away the element of surprise.",
  "An Audi, a BMW and a Mercedes argued over who's most premium. The minivan they were blocking quietly drove around all three.",
  "A Tesla doesn't have a key. It has a phone, an app, an account, a software update, and — occasionally — a strong opinion about it."
];

function jokeReply(q: string): string {
  if (/autobahn|speed|blitz|\bfast\b/.test(q)) return pick(JOKES_AUTOBAHN);
  if (/counter|agent|desk|upsell|rental/.test(q)) return pick(JOKES_COUNTER);
  if (/electric|\bev\b|tesla|charg|battery/.test(q)) return pick(JOKES_EV);
  if (/brand|bmw|audi|mercedes|porsche/.test(q)) return pick(JOKES_BRAND);
  return pick(JOKES_GENERAL);
}

/** Real, named station advice from the booking's pick-up point. */
function stationAdvice(ctx: OfflineContext): string {
  if (!ctx.pickup) {
    return "Plan a route on the Navigate tab and the app marks every Sixt branch along it with a swap-probability. Airports and big rail-station branches turn their fleet over fastest — that's where the odds are. Add a pick-up station to your booking and I can name actual branches.";
  }
  const near = nearestStations(ctx.pickup, STATIONS, ctx.classId ?? null, 22)
    .filter((s) => s.id !== ctx.pickup!.id)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (!near.length) {
    return `From ${ctx.pickup.name} there isn't much Sixt density nearby — plan a route on the Navigate tab and I'll catch the branches further along.`;
  }
  const lines = near
    .map(
      (s) =>
        `• ${s.name.replace("SIXT ", "")} — ~${Math.round(s.score * 100)}% odds, ${Math.round(s.fromRouteKm)} km away`
    )
    .join("\n");
  return `From ${ctx.pickup.name}, your strongest swap bets:\n${lines}\n\nBigger branch, better odds — an airport detour usually beats a hopeful 'maybe' at a small office. The Booking tab ranks the full list.`;
}

const RULES: { test: RegExp; reply: (ctx: OfflineContext, q: string) => string }[] = [
  {
    test: /^(hi|hey|hello|hallo|servus|moin|yo|good (morning|day|evening)|what'?s up)\b/i,
    reply: () => pick(GREETINGS)
  },
  {
    // jokes first, so "Autobahn joke" doesn't trip the speed-trap rule
    test: /joke|funny|make me laugh|haha|another one|cheer me/i,
    reply: (_c, q) => jokeReply(q)
  },
  {
    test: /blitz|radar|speed camera|\bcop\b|police|polizei|autobahn|how fast|top ?speed|ticket|\bfine\b|speeding/i,
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
      (ctx.target ? `\n\nYou're hunting a ${ctx.target} — name it exactly at the desk.` : "")
  },
  {
    test: /station|where|which sixt|nearest|branch|swap|pick.?up/i,
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
        ? `Here's what I have on file: ${ctx.booking}. If the counter hands you something else, log it in the negotiation helper and I'll tell you — switch, or push back.`
        : "I don't see a booking saved yet — add it on the Booking tab and my advice gets much sharper."
  },
  {
    test: /horsepower|\bhp\b|\bps\b|power|engine|530i|540i|\bm3\b|variant|spec|compare/i,
    reply: () =>
      "Engine talk — my favourite. In the negotiation helper, search the exact variant they offer (530i, 540i xDrive, X3 xDrive30d) and it lays out horsepower, top speed, 0–100, drivetrain and consumption, then compares it number-for-number against your booked car."
  },
  {
    test: /thank|thx|danke|cheers|appreciate|nice|great|love/i,
    reply: () =>
      pick([
        "Anytime. Now go and claim the better car — and mind the cameras.",
        "Glad to help. Drive smart, swap smarter.",
        "Bitte schön. May your upgrades be free and your speed cameras switched off."
      ])
  },
  {
    test: /help|what can you|who are you|what do you do/i,
    reply: () =>
      "I'm Lucas, your rental analyst — German, and reasonably good company. I cover swap strategy, ACRISS codes, the counter negotiation, car-engine comparisons, and the occasional joke. Connect an Anthropic API key (the '+ Key' button) and I get properly clever. Tap a button below to start."
  }
];

const FALLBACKS = [
  "Good question — just past my offline brain. Connect an Anthropic API key via the '+ Key' button up top and I'll answer it properly. Or pick a topic below.",
  "Keyless right now, so my range is swap strategy, car specs, negotiation, loyalty status and Autobahn wisdom. For anything deeper, add an API key. What else can I do?",
  "That one wants the full-powered me — add an Anthropic key (header, top of this panel). Offline, I'm strongest on rentals, the counter game and the speed traps."
];

/** Returns Lucas's offline (keyless) reply to a question. */
export function offlineReply(question: string, ctx: OfflineContext): string {
  const q = question.trim().toLowerCase();
  if (!q) return pick(GREETINGS);
  for (const rule of RULES) {
    if (rule.test.test(q)) return rule.reply(ctx, q);
  }
  return pick(FALLBACKS);
}

// ── conversational follow-up suggestions ─────────────────────────
const FOLLOWUPS: { test: RegExp; items: string[] }[] = [
  {
    test: /joke|funny|laugh|haha|another one/i,
    items: ["Another joke", "Autobahn joke", "Rental-counter joke", "EV joke", "Now something useful"]
  },
  {
    test: /blitz|radar|speed|autobahn|police|ticket/i,
    items: ["Best car for the Autobahn?", "Tell me an Autobahn joke", "Diesel or petrol for speed?"]
  },
  {
    test: /negotiat|counter|upgrade|offer|deal|downgrade|desk/i,
    items: [
      "What if they only offer downgrades?",
      "Does my Diamond status help?",
      "Which car should I push for?"
    ]
  },
  {
    test: /acriss|sipp|code|gear|decode/i,
    items: ["What does GEAR mean?", "Decode PDAR", "Is my class upgrade-friendly?"]
  },
  {
    test: /station|swap|where|branch|nearest|pick.?up/i,
    items: ["Airport vs city branch?", "How far should I detour?", "Best odds near me?"]
  },
  {
    test: /fuel|consumption|diesel|petrol|electric|efficien|charg/i,
    items: ["Most efficient long-trip car?", "Is electric worth it?", "Tell me an EV joke"]
  },
  {
    test: /status|diamond|loyalty|platinum|gold/i,
    items: ["How do I use Diamond at the desk?", "What upgrade can I expect?", "Negotiation tips"]
  },
  {
    test: /horsepower|\bhp\b|power|engine|variant|spec|compare/i,
    items: ["Compare a 530i and a 540i", "Best engine for the money?", "Diesel or petrol?"]
  }
];

/** Topic-aware follow-up chips, based on the user's last message. */
export function suggestionsFor(lastUserText: string): string[] {
  const q = lastUserText.trim().toLowerCase();
  if (!q) return STARTER_QUESTIONS;
  for (const f of FOLLOWUPS) {
    if (f.test.test(q)) return f.items;
  }
  return [
    "Where should I swap?",
    "How do I negotiate?",
    "Tell me a joke",
    "Best car for the Autobahn?"
  ];
}
