import { FieldConfig, FieldType } from "@/types/settings.type";

// ---- Small helpers for numeric/time fields ----
const isTimeUnitType = (t: FieldType) =>
  t === "hour" || t === "minute" || t === "second";

export const isNumericType = (t: FieldType) =>
  t === "number" || isTimeUnitType(t);

/**
 * Compute numeric bounds for a field.
 * - For hour: default 0–23 (unless min/max are explicitly provided)
 * - For minute/second: default 0–59 (unless min/max are explicitly provided)
 * - For generic number: just use f.min/f.max if present
 */
export const getNumericBounds = (f: FieldConfig) => {
  let minBound: number | undefined = undefined;
  let maxBound: number | undefined = undefined;

  if (isTimeUnitType(f.type as FieldType)) {
    // Default bounds for time units
    if (typeof f.min === "number") {
      minBound = f.min;
    } else {
      minBound = 0;
    }

    if (typeof f.max === "number") {
      maxBound = f.max;
    } else {
      if (f.type === "hour") maxBound = 23;
      else maxBound = 59;
    }
  } else if (f.type === "number") {
    if (typeof f.min === "number") minBound = f.min;
    if (typeof f.max === "number") maxBound = f.max;
  }

  return { minBound, maxBound };
};
