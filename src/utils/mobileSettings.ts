// Python dict string → JS object
export function parsePythonDict(value?: unknown): Record<string, unknown> {
  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const normalized = value
      .replace(/'/g, '"')
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null");

    return JSON.parse(normalized);
  } catch (e) {
    console.log(e);
    console.error("Failed to parse mobile app settings", value);
    return {};
  }
}
