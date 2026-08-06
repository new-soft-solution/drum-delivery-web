const stripTrailingSlash = (s: string): string => s.replace(/\/+$/, "");

const apiOrigin = (() => {
  const raw = (process.env.NEXT_PUBLIC_BASE_API || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return stripTrailingSlash(raw.replace(/\/api\/v\d+\/?$/i, ""));
  }
})();

export function resolveMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  if (!apiOrigin) return trimmed;
  if (trimmed.startsWith("/")) return `${apiOrigin}${trimmed}`;
  return `${apiOrigin}/${trimmed}`;
}
