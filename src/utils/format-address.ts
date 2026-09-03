type MaybeString = string | null | undefined;

export type NLAddressInput = {
  street_name?: MaybeString;
  house_number?: MaybeString;
  postal_code?: MaybeString;
  city?: MaybeString;
  country?: MaybeString;
  neighborhood?: MaybeString;
};

/** Uppercase + insert space between 4 digits and 2 letters (NL style) */
export function formatPostalCodeNL(input?: MaybeString): string {
  if (!input) return "";
  const raw = String(input).replace(/\s+/g, "");
  const m = raw.match(/^(\d{4})([A-Za-z]{2})$/);
  if (m) return `${m[1]} ${m[2].toUpperCase()}`;
  return input; // if already formatted or non-NL, leave as-is
}

/** Normalize "Netherlands" country variants so we can optionally hide it */
export function normalizeNetherlands(country?: MaybeString): string {
  if (!country) return "";
  const c = String(country).trim().toLowerCase();
  if (["undefined"].includes(c)) {
    return "Netherlands";
  }
  return String(country);
}

/**
 * Gracefully render a one-line NL address:
 *  - "Street Name 12A, 1234 AB City[, Country if not Netherlands]"
 *  - If street_name is missing, falls back to house_number as a free-form line
 *  - Postal code is formatted as "1234 AB" when possible
 */
export function formatRestaurantAddressNL(
  a: NLAddressInput,
  opts?: { includeCountryIfForeign?: boolean }
): string {
  const includeCountryIfForeign = opts?.includeCountryIfForeign ?? true;

  const street = (a.street_name ?? "").trim();
  const house = (a.house_number ?? "").trim();
  const city = (a.city ?? "").trim();
  const postal = formatPostalCodeNL(a.postal_code);
  const country = normalizeNetherlands(a.country);

  // Line 1
  let line1 = "";
  if (street && house) line1 = `${street} ${house}`;
  else if (street) line1 = street;
  else if (house) line1 = house; // fallback: some backends put full free-form here

  // Line 2 (postal + city)
  const line2 = [postal, city].filter(Boolean).join(" ");

  // Compose
  const core = [line1, line2].filter(Boolean).join(", ");

  // Only add country if it's not Netherlands (or if unknown and we want to show it)
  const shouldAppendCountry =
    includeCountryIfForeign &&
    country &&
    country.toLowerCase() !== "netherlands";

  const withCountry = shouldAppendCountry ? `${core}, ${country}` : core;

  return withCountry || "—";
}
