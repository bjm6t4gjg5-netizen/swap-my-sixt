// Offline "Lucas" — a rule-based fallback assistant that works with no API
// key. Witty, opinionated, and genuinely useful for the rental-swap domain.
// When an Anthropic key is connected, the full Claude-powered Lucas takes over.

export interface OfflineContext {
  booking?: string;
  target?: string;
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GREETINGS = [
  "Moin! Lucas here — your rental analyst. What are we plotting today: a swap, a negotiation, or just dodging Blitzer on the Autobahn?",
  "Hey! Lucas, at your service. Ask me about car classes, the counter game, or how to read that cryptic ACRISS code.",
  "Servus. I'm Lucas. Booked one car, want another? That's literally my whole personality. Fire away."
];

const SPEED = [
  "Autobahn rule #1: the unrestricted stretches are a gift — the Blitzer near every Baustelle and Ausfahrt is the catch. When the trucks suddenly drive like saints, lift off. They know something.",
  "German speed cameras are like exes: they appear when you least expect it, and the photo is never flattering. Keep it sensible through towns and roadworks and you'll never meet one.",
  "Top tip from your analyst: a fast car is wasted if you collect a 'Bußgeld' souvenir. The free stretches are free — the 80 zones are extremely not. Watch the signs, enjoy the rest.",
  "There's no trophy for being first into a 100 zone. The Blitzer always wins that drag race, and it sends the photo to your address. Cruise the open bits, behave in the limits.",
  "Pro move: in Germany the left lane is for overtaking, not living. Flash-happy BMWs behind you aren't Blitzer — but the grey box on the gantry might be."
];

const NEGOTIATE = [
  "Counter game 101: never accept the first car they wave at you. Glance at the lot, name the better car you can see, and mention it's just sitting there. An idle car is easier to give away than a discount.",
  "At the desk: be friendly, be specific. 'I see an X3 on the lot — any chance of that instead?' beats a vague 'got anything nicer?' every time. Specific requests get specific yeses.",
  "Leverage you actually have: off-peak pickups, a long rental, loyalty status, and an empty class of your booked car. If they can't give you what you booked, a free upgrade is the polite fix — ask for it plainly.",
  "If they offer a downgrade, don't take it quietly — you're entitled to at least your booked class. 'I booked a Premium, this is a Compact — can you honour the booking or upgrade me?' Said with a smile, it works."
];

const ACRISS = [
  "ACRISS / SIPP codes are 4 letters: size · body · gearbox · fuel. Example: PDAR = Premium, 4-5 Door, Automatic, A/C. The Cars tab has a full guide with a live decoder — tap 'New to ACRISS codes?'.",
  "That 4-letter code on your confirmation isn't random: letter 1 is size, 2 is body shape, 3 is gearbox/drive, 4 is fuel + air-con. Decode it in the Cars tab — there's a guide built in."
];

const STATION = [
  "Plan a route on the Navigate tab and I'll — well, the app will — show every Sixt branch along it with a swap-probability. Airports and big-city branches turn fleet over fastest, so your odds are best there.",
  "Where to swap? Favour airport and Hauptbahnhof branches — huge fleets, constant churn. A small rural branch on a Sunday is a long shot. The Navigate tab colour-codes all of this for you.",
  "Rule of thumb: the bigger and busier the branch, the better your swap odds. A 5-minute detour to an airport branch usually beats a 'maybe' at a tiny town office."
];

const FUEL = [
  "For Autobahn cruising, diesels are the efficiency champs — a 520d or A6 40 TDI will happily do 1,000 km on a tank at speed. Petrols are thirstier when you actually use the power.",
  "Electric on the Autobahn: range drops hard above 130 km/h. Glorious in the city, plan your charging stops if you're really pressing on. Diesel still rules the long-haul-at-speed game.",
  "Efficiency tip: the Cars tab and the negotiation tool now show consumption per variant. A 530i sips more than a 520d — worth knowing before a 3-week, 1,000-km-plus trip."
];

const JOKES = [
  "Why did the rental car go to therapy? Too many issues with commitment — three days here, a week there, never the same driver twice.",
  "I asked a Compact and a Luxury sedan who was faster. The Luxury won. The Compact said it was 'about the journey'. It was not about the journey.",
  "A diesel, a petrol and an EV walk into a Raststätte. The diesel orders a coffee, the petrol orders two, and the EV is still in the car park, charging.",
  "My favourite German road sign is 'Ausfahrt'. Biggest city in the country — there's an exit for it everywhere."
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
    test: /acriss|sipp| code\b|what does .* mean|decode/i,
    reply: () => pick(ACRISS)
  },
  {
    test: /negotiat|counter|haggl|offer|\bdeal\b|ask for|upgrade|downgrade/i,
    reply: (ctx) =>
      pick(NEGOTIATE) +
      (ctx.target ? `\n\nYou're hunting a ${ctx.target} — name it specifically at the desk.` : "")
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
        ? `Here's what I've got on file: ${ctx.booking}. If the counter hands you something else, log it in the negotiation helper and I'll tell you whether to switch or push back.`
        : "I don't see a booking saved yet — add it on the Booking tab (reference, pick-up, ACRISS code) and I can give you sharper advice."
  },
  {
    test: /joke|funny|make me laugh|cheer me|lol|haha/i,
    reply: () => pick(JOKES)
  },
  {
    test: /horsepower|\bhp\b|\bps\b|power|engine|530i|540i|\bm3\b|variant/i,
    reply: () =>
      "Engine talk is my favourite. Use the negotiation helper — search the exact variant (530i, 540i xDrive, whatever they offer) and it shows horsepower, top speed, 0–100 and drivetrain so you can compare like-for-like."
  },
  {
    test: /thank|thx|danke|cheers|appreciate/i,
    reply: () =>
      pick([
        "Anytime. Now go get the better car — and mind the Blitzer.",
        "That's what I'm here for. Drive smart, swap smarter.",
        "Gern geschehen. May your upgrades be free and your speed cameras absent."
      ])
  },
  {
    test: /help|what can you|who are you|what do you do/i,
    reply: () =>
      "I'm Lucas, your rental analyst. I can talk swap strategy, decode ACRISS codes, coach you through the counter negotiation, compare car variants by the numbers, and crack the occasional Autobahn joke. Connect an Anthropic API key (in the header) and I get a lot smarter — but offline I'm still decent company."
  }
];

const FALLBACKS = [
  "Good question — and a touch beyond my offline brain. Connect an Anthropic API key via the 'Key' button up top and I'll answer properly. Meanwhile: ask me about swaps, negotiation, ACRISS codes, fuel, or Blitzer.",
  "I'm running keyless right now, so my range is swap strategy, car specs, negotiation, and Autobahn wisdom. For anything deeper, add an API key in the header. What else can I help with?",
  "That one needs the full-powered me — add an Anthropic key (header, top-right of this panel) to unlock it. Offline, I'm best on rentals, negotiation and speed-trap survival."
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
