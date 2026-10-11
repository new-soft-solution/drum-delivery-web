export function formatDrumNumber(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  // Only strip a trailing ".0", ".00", … — never touch a genuinely
  // fractional value (e.g. "71.5"), which would lose information.
  if (/^-?\d+\.0+$/.test(trimmed)) {
    return trimmed.slice(0, trimmed.indexOf("."));
  }
  return trimmed;
}

export default formatDrumNumber;
