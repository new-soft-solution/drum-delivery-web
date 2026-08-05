import { FieldType } from "@/types/settings.type";

export function labelize(s: string) {
  return s
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function guessTypeFromKeyValue(key: string, value: unknown): FieldType {
  const lower = key.toLowerCase();

  // File-like keys
  if (/(logo|image|icon|banner|picture|photo)$/.test(lower)) return "file";

  // URL-like keys
  if (/(url|link|href)$/.test(lower)) return "url";

  // Email-like keys
  if (/email$/.test(lower)) return "email";

  // Boolean-ish values
  if (
    typeof value === "boolean" ||
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "false"
  )
    return "switch";

  // Numeric-ish values
  if (!Number.isNaN(Number(value)) && value !== "" && value !== null)
    return "number";

  return "text";
}
