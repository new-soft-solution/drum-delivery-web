/**
 * Shared helpers for turning a DRF-style server error response into a form
 * every screen can render. Kept generic and framework-agnostic so both the
 * admin `useUpdateRestaurant` hook and the salesperson Add Restaurant form
 * can drive the same UX (inline field feedback + top-level alert + scroll
 * to the first thing the user needs to fix).
 */

export type TopLevelServerError = { field: string; messages: string[] };

/**
 * Walk a DRF-style error tree into `[dottedPath, message[]]` pairs. Handles:
 *  - scalar field:        { field: ["msg"] }                        → field
 *  - nested object:       { owner: { first_name: ["msg"] } }        → owner.first_name
 *  - nested write list:   { items: [{ price: ["msg"] }, {}] }       → items.0.price
 *  - single string value: { field: "msg" }                          → field
 *
 * Empty arrays are dropped. Anything that's neither string nor object is
 * ignored so a malformed server response can't crash the mapping step.
 */
export const flattenServerErrors = (
  errors: Record<string, unknown>,
  prefix = "",
): Array<[string, string[]]> => {
  const out: Array<[string, string[]]> = [];
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      if (value.every((v) => typeof v === "string")) {
        out.push([path, value as string[]]);
      } else {
        value.forEach((row, idx) => {
          if (row && typeof row === "object" && !Array.isArray(row)) {
            out.push(
              ...flattenServerErrors(
                row as Record<string, unknown>,
                `${path}.${idx}`,
              ),
            );
          } else if (typeof row === "string") {
            out.push([`${path}.${idx}`, [row]]);
          }
        });
      }
    } else if (typeof value === "string") {
      out.push([path, [value]]);
    } else if (value && typeof value === "object") {
      out.push(...flattenServerErrors(value as Record<string, unknown>, path));
    }
  }
  return out;
};
