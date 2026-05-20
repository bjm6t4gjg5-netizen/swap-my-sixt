// Sixt contact helpers.
//
// Sixt does not publish per-branch direct phone lines — confirmed by checking
// Gelbe Seiten / Das Telefonbuch listings for individual German branches,
// which all show the same central reservation number. So the best the app can
// honestly offer is the verified central line plus a live Maps lookup.

/** Verified central reservation numbers, by country (E.164, no spaces). */
const SIXT_PHONE: Record<string, string> = {
  DE: "+498966060060", // Sixt Germany reservations — verified via Das Telefonbuch
  US: "+18887498227" // 1-888-SIXT-CAR — verified via Sixt help centre
};

export function sixtPhone(country: string): string | null {
  return SIXT_PHONE[country] ?? null;
}

/** Pretty-printed version of the central number for display. */
export function sixtPhoneDisplay(country: string): string | null {
  const raw = SIXT_PHONE[country];
  if (!raw) return null;
  if (country === "DE") return "+49 89 6606 0060";
  if (country === "US") return "+1 888 749 8227";
  return raw;
}

/** Sixt website for live availability checks (the user books there). */
export function sixtSiteUrl(country: string): string {
  return country === "DE" ? "https://www.sixt.de/" : "https://www.sixt.com/";
}
