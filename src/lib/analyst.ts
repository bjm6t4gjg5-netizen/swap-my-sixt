// "Ask the analyst" — a small Claude-powered chat assistant (persona: Lucas).
//
// SECURITY: this is a static, backend-less app, so the Anthropic API key is
// NEVER bundled or committed. It is entered by the user at runtime and kept
// only in this browser's localStorage. Treat any key pasted elsewhere as
// compromised and rotate it at console.anthropic.com.

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const KEY_STORAGE = "sixt.anthropicKey";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}
export function setApiKey(k: string): void {
  try {
    localStorage.setItem(KEY_STORAGE, k.trim());
  } catch {
    /* private mode */
  }
}
export function clearApiKey(): void {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
}
export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

/** Builds Lucas's system prompt, folding in live app context. */
export function buildSystemPrompt(ctx: {
  booking?: string;
  target?: string;
}): string {
  return [
    `You are Lucas — a friendly, sharp car-rental analyst and the in-app assistant for "Swap my Sixt".`,
    `Swap my Sixt is a web app that plans a driving route, shows every Sixt rental station along it with an availability probability, and helps the user swap their rental into the car class they actually want.`,
    ``,
    `You are German, and it shows lightly: a natural German lilt and the occasional German turn of phrase. Use German words very sparingly — at most one now and then, never in every sentence, and avoid filler like "ja" or "genau". Authentic, never a caricature.`,
    `Your style: warm, witty, concise, practical. Short paragraphs, plain language, no corporate fluff. You enjoy dry, observational humour and have a bottomless supply of jokes — about the Autobahn, speed cameras, German driving culture, rental counters, EV charging, car brands and the absurdity of booking one car and hoping for another. When the user wants jokes, deliver a fresh one each time and never repeat yourself. But keep advice genuinely useful, and never encourage dangerous or illegal driving: your speed-trap talk is humour plus sensible "mind the limits, watch the roadworks" advice.`,
    `You know about: Sixt car classes, ACRISS/SIPP codes, car engine variants and specs, rental-counter negotiation tactics, route planning, and how this app works.`,
    ctx.booking ? `\nThe user's current booking: ${ctx.booking}` : "",
    ctx.target ? `The user is currently hunting for: ${ctx.target}` : "",
    ``,
    `If asked something you genuinely can't know (live car availability, exact prices), say so honestly and suggest how to find out. Keep answers focused, friendly and fun.`
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** Sends the conversation to Claude and returns Lucas's reply text. */
export async function askLucas(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error("No API key set.");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })
  });

  if (!res.ok) {
    let detail = `Request failed (HTTP ${res.status}).`;
    try {
      const err = await res.json();
      if (err?.error?.message) detail = err.error.message;
    } catch {
      /* keep generic */
    }
    if (res.status === 401) {
      detail = "That API key was rejected. Check it and re-connect.";
    }
    throw new Error(detail);
  }

  const data = await res.json();
  const text = ((data.content ?? []) as any[])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return text || "(Lucas had nothing to add.)";
}
