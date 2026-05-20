// Offline "Lucas" — a rule-based fallback assistant that works with no API
// key. Witty, opinionated, German, and genuinely useful for the rental-swap
// domain. With an Anthropic key connected, the full Claude-powered Lucas
// takes over.

export interface OfflineContext {
  booking?: string;
  target?: string;
}

/** Clickable starter questions shown in the chat. */
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
  "Moin! Lucas here — your rental analyst. So, what are we plotting: a swap, a clever negotiation, or just dodging the Blitzer on the Autobahn?",
  "Servus! Lucas at your service, ja. Ask me about car classes, the counter game, or that cryptic ACRISS code on your booking.",
  "Na, hallo! I'm Lucas. You booked one car and want a better one — Mensch, that is literally my whole job. Fire away."
];

const SPEED = [
  "Autobahn-Regel number one: the unrestricted stretches are a gift — the Blitzer near every Baustelle and Ausfahrt is the catch. When the trucks suddenly behave like angels, lift off. They know something, ja.",
  "Ach, German speed cameras — like an ex: they appear when you least expect it, and the photo is never flattering. Behave through the towns and the roadworks and you'll never meet one.",
  "A fast car is wasted if you collect a 'Bußgeld' souvenir, genau. The free stretches are free — the 80 zones are very much not. Watch the signs, then enjoy the rest properly.",
  "There is no Pokal for being first into a 100 zone — the Blitzer always wins that little race, and it posts the photo to your address. Cruise the open bits, behave in the limits.",
  "Also: in Germany the left lane is for overtaking, not for living. The flashing BMW behind you is not a Blitzer — but the grey box on the gantry up ahead, that one might be."
];

const NEGOTIATE = [
  "Counter game, lesson one: never take the first car they wave at you. Glance at the lot, name the better car you can see, mention it's just standing there. An idle car is easier to give away than a discount, ja.",
  "At the desk: friendly, but specific. 'I see an X3 on the lot — any chance of that one?' beats a vague 'got anything nicer?' every time. Genau — specific requests get specific yeses.",
  "Real Hebel you have: off-peak pick-up, a long rental, loyalty status, and an empty class of your booked car. If they can't give you what you booked, a free upgrade is the polite fix — ask for it plainly.",
  "If they offer you a downgrade, do not take it quietly — you are entitled to at least your booked class. 'I booked a Premium, this is a Compact — can you honour it or upgrade me?' Said with a smile, it works, Mensch."
];

const ACRISS = [
  "Ach, the ACRISS code — four letters: size · body · gearbox · fuel. PDAR = Premium, 4–5 Door, Automatic, A/C. The Cars tab has a proper guide with a live decoder — tap 'New to ACRISS codes?'. Your booking code is decoded there too.",
  "That four-letter code is not random, genau: letter one is size, two is body shape, three is gearbox and drive, four is fuel plus air-con. Decode yours in the Cars tab — there's a built-in guide."
];

const STATION = [
  "Plan a route on the Navigate tab and the app shows every Sixt branch along it with a swap-probability. Airports and big Hauptbahnhof branches turn their fleet over fastest — that's where your odds are best, ja.",
  "Where to swap? Favour airport and city-centre branches — huge fleets, constant Wechsel. A small rural office on a Sunday is a long shot. The Navigate tab colour-codes all of this for you.",
  "Faustregel: the bigger and busier the branch, the better your swap odds. A five-minute detour to an airport branch usually beats a hopeful 'maybe' at a tiny Dorf office."
];

const FUEL = [
  "For Autobahn cruising the Diesel is the efficiency king — a 520d or A6 40 TDI will happily do 1,000 km on one tank, even at speed. Petrols get thirsty when you actually use the power, ja.",
  "Electric on the Autobahn: the range drops hard above 130 km/h. Wonderful in the city — but plan your charging stops if you really press on. For long-haul-at-speed, Diesel still rules.",
  "Effizienz-Tipp: the negotiation helper now shows consumption for every engine variant. A 530i drinks more than a 520d — good to know before a three-week, thousand-kilometre Tour."
];

const JOKES = [
  "Why did the rental car go to therapy? Commitment issues, Mensch — three days here, a week there, never the same driver twice.",
  "I asked a Compact and a Luxury sedan who was faster. The Luxury won. The Compact said it was 'about the journey'. It was, ehrlich, not about the journey.",
  "A Diesel, a Petrol and an EV walk into a Raststätte. The Diesel orders one coffee, the Petrol orders two — and the EV is still out in the car park, charging.",
  "My favourite German road sign is still 'Ausfahrt'. Biggest city in the country — there is an exit for it absolutely everywhere."
];

const RULES: { test: RegExp; reply: (ctx: OfflineContext) => string }[] = [
  {
    test: /^(hi|hey|hello|hallo|servus|moin|yo|good (morning|day|evening))\b/i,
    reply: () => pick(GREETINGS)
  },
  {
    test: /blitz|radar|speed camera|\bcop\b|police|polizei|autobahn|how fast|top ?speed|ticket|fine|geblitzt|bußgeld|busgeld|fast|speeding/i,
    reply: () => pick(SPEED)
  },
  {
    test: /acriss|sipp| code\b|what does .* mean|decode|gear\b/i,
    reply: () => pick(ACRISS)
  },
  {
    test: /negotiat|counter|haggl|offer|\bdeal\b|ask for|upgrade|downgrade/i,
    reply: (ctx) =>
      pick(NEGOTIATE) +
      (ctx.target ? `\n\nYou're hunting a ${ctx.target} — name it exactly at the desk.` : "")
  },
  {
    test: /station|where|which sixt|nearest|branch|husum|berlin|swap/i,
    reply: () => pick(STATION)
  },
  {
    test: /fuel|consumption|efficien|economical|diesel|petrol|electric|\brange\b|mpg|l\/100|charg/i,
    reply: () => pick(FUEL)
  },
  {
    test: /my booking|my car|what car|what did i|booked|reservation|my rental/i,
    reply: (ctx) =>
      ctx.booking
        ? `So, here's what I have on file: ${ctx.booking}. If the counter hands you something else, log it in the negotiation helper and I'll tell you — switch, or push back.`
        : "I don't see a booking saved yet, Mensch — add it on the Booking tab (reference, pick-up, ACRISS code) and I can give you much sharper advice."
  },
  {
    test: /joke|funny|make me laugh|cheer|lol|haha/i,
    reply: () => pick(JOKES)
  },
  {
    test: /horsepower|\bhp\b|\bps\b|power|engine|530i|540i|\bm3\b|variant/i,
    reply: () =>
      "Ah, engine talk — my favourite, ja. Use the negotiation helper: search the exact variant (530i, 540i xDrive, whatever they offer) and it shows horsepower, top speed, 0–100 and drivetrain, so you compare like-for-like. Genau what you want before an Autobahn run."
  },
  {
    test: /thank|thx|danke|cheers|appreciate/i,
    reply: () =>
      pick([
        "Bitte schön. Now go and get the better car — and mind the Blitzer.",
        "Gern geschehen. Drive smart, swap smarter, ja.",
        "Ach, kein Problem. May your upgrades be free and your speed cameras absent."
      ])
  },
  {
    test: /help|what can you|who are you|what do you do/i,
    reply: () =>
      "I'm Lucas, your rental analyst — German, naturally. I talk swap strategy, decode ACRISS codes, coach you through the counter negotiation, compare car variants by the numbers, and crack the odd Autobahn joke. Connect an Anthropic API key (the 'Key' button up top) and I get a lot cleverer — but offline I'm still decent company."
  }
];

const FALLBACKS = [
  "Gute Frage — and a touch beyond my offline brain, ja. Connect an Anthropic API key via the '+ Key' button up top and I'll answer properly. Meanwhile: ask me about swaps, negotiation, ACRISS codes, fuel, or the Blitzer.",
  "I'm running keyless right now, so my Reichweite is swap strategy, car specs, negotiation and Autobahn wisdom. For anything deeper, add an API key in the header. What else can I do for you?",
  "Ach, that one needs the full-powered me — add an Anthropic key (header, top of this panel) to unlock it. Offline, I'm strongest on rentals, negotiation and surviving the speed traps."
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
