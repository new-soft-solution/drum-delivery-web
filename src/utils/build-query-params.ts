// Keep these helpers if you like, but you don't need to export them.
type Primitive = string | number | boolean | null | undefined | Date;

const toStringVal = (v: Primitive): string => {
  if (v instanceof Date) return v.toISOString();
  return String(v);
};

/**
 * Build URLSearchParams from any plain object.
 * - Skips null/undefined/"".
 * - Appends array values as repeated keys.
 * - Converts Date to ISO, number/boolean to string.
 */
export const buildQueryParams = <T extends object>(params: T): URLSearchParams => {
  const query = new URLSearchParams();

  // TS sees entries as [string, unknown][]
  for (const [key, raw] of Object.entries(params) as [string, unknown][]) {
    if (raw === undefined || raw === null || raw === "") continue;

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item === undefined || item === null || item === "") continue;
        query.append(key, toStringVal(item as Primitive));
      }
      continue;
    }

    // primitive-ish
    query.set(key, toStringVal(raw as Primitive));
  }

  return query;
};
