/**
 * Shared validators for Dutch-specific field formats.
 * Source of truth: docs "00 — Common Formats & Conventions", §3.4 / §3.5 / §3.8.
 */

/** Strip whitespace and upper-case, the normalized form IBANs/BTW are compared/sent in. */
export const stripSpacesUpper = (val: string) =>
  (val || "").replace(/\s+/g, "").toUpperCase();

/**
 * Dutch IBAN format check: `NL` + 2 check digits + 4 bank letters + 10 digits.
 * Length must be exactly 18 once spaces are stripped (spec §3.5).
 */
export const isDutchIbanFormat = (val: string): boolean => {
  const raw = stripSpacesUpper(val);
  return raw.length === 18 && /^NL\d{2}[A-Z]{4}\d{10}$/.test(raw);
};

/**
 * Mod-97 checksum required by spec §3.5 ("Invalid Dutch IBAN checksum.").
 * Standard ISO 7064 IBAN check: move the first 4 chars to the end, convert
 * letters to numbers (A=10 ... Z=35), then the whole number mod 97 must be 1.
 */
export const isValidIbanChecksum = (val: string): boolean => {
  const raw = stripSpacesUpper(val);
  if (raw.length < 4) return false;
  const rearranged = raw.slice(4) + raw.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) =>
    String(ch.charCodeAt(0) - 55),
  );
  // mod 97 over a potentially very long numeric string, done in chunks to
  // avoid overflowing JS number precision.
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(`${remainder}${numeric.substr(i, 7)}`) % 97;
  }
  return remainder === 1;
};

/** Dutch phone number — accepts `+31…`, `0031…`, or national `0…` (spec §3.4). */
export const dutchPhoneRegex =
  /^(\+31[1-9][0-9]{8}|0031[1-9][0-9]{8}|0[1-9][0-9]{8})$/;

export const isValidDutchPhone = (val: string): boolean =>
  dutchPhoneRegex.test((val || "").replace(/[\s\-()]/g, ""));

/** Spec §3.8 — staff date of birth must be at least 18 years old. */
export const isAtLeast18 = (dateOfBirth: string): boolean => {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};
