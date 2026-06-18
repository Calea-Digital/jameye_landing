// Best-effort country → flag emoji. Org `country` is free-text, so this maps
// ISO-2 codes directly (regional indicator letters) and a compact table of
// common country names; anything it can't resolve returns "" so callers fall
// back to plain text rather than a wrong flag.
// Ported verbatim from the app's `lib/country-flag.ts`.

/** Common country-name → ISO-3166-1 alpha-2. Lowercased keys, trimmed. */
const NAME_TO_ISO: Record<string, string> = {
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  uk: "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  iceland: "IS",
  spain: "ES",
  france: "FR",
  germany: "DE",
  italy: "IT",
  portugal: "PT",
  netherlands: "NL",
  belgium: "BE",
  switzerland: "CH",
  austria: "AT",
  ireland: "IE",
  poland: "PL",
  "czech republic": "CZ",
  czechia: "CZ",
  greece: "GR",
  turkey: "TR",
  turkiye: "TR",
  russia: "RU",
  ukraine: "UA",
  canada: "CA",
  mexico: "MX",
  brazil: "BR",
  argentina: "AR",
  chile: "CL",
  colombia: "CO",
  peru: "PE",
  uruguay: "UY",
  china: "CN",
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  india: "IN",
  indonesia: "ID",
  singapore: "SG",
  "hong kong": "HK",
  taiwan: "TW",
  thailand: "TH",
  vietnam: "VN",
  philippines: "PH",
  malaysia: "MY",
  australia: "AU",
  "new zealand": "NZ",
  "south africa": "ZA",
  nigeria: "NG",
  egypt: "EG",
  morocco: "MA",
  israel: "IL",
  "saudi arabia": "SA",
  "united arab emirates": "AE",
  uae: "AE",
  qatar: "QA",
};

/** ISO-2 code → regional-indicator flag emoji (🇸🇪, 🇺🇸, …). */
const isoToFlag = (iso: string): string =>
  iso
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

/** Resolve a free-text country to a flag emoji, or "" when unknown. */
export const countryToFlag = (country: string | null | undefined): string => {
  if (!country) return "";
  const raw = country.trim();
  if (/^[A-Za-z]{2}$/.test(raw)) return isoToFlag(raw);
  const iso = NAME_TO_ISO[raw.toLowerCase()];
  return iso ? isoToFlag(iso) : "";
};
