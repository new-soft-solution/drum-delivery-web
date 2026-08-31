import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { NormalizedError } from "@/types/error.type";

/** Keys a backend commonly uses for a form-wide (non-field-specific) error,
 * rather than one tied to a particular input. These are never mapped onto
 * an input — they've already been folded into `error.message` by
 * `handleApiError` and are shown via the notification instead. */
const NON_FIELD_KEYS = new Set(["non_field_errors", "__all__", "detail", "message"]);

/**
 * Maps a NormalizedError's per-field `errors` (DRF-style
 * `{ field: string[] }`, or a single `string`) onto the matching
 * react-hook-form input via `setError`, so the field itself shows the
 * backend's exact validation message — not just a generic toast.
 *
 * Always call this from a form's mutation `onError` *in addition to*
 * showing a notification with `error.message`; this only handles the
 * field-level half of that.
 */
export function applyServerErrors<T extends FieldValues>(
  error: NormalizedError,
  setError: UseFormSetError<T>,
): void {
  if (!error.errors) return;

  for (const [field, value] of Object.entries(error.errors)) {
    if (NON_FIELD_KEYS.has(field)) continue;

    const message = Array.isArray(value) ? String(value[0]) : typeof value === "string" ? value : undefined;
    if (!message) continue;

    // Best-effort: only fields that exist on this particular form will
    // actually render the message (react-hook-form silently accepts
    // setError calls for unregistered field names), so it's safe to call
    // this the same way from every form regardless of which fields the
    // backend happens to complain about.
    setError(field as Path<T>, { type: "server", message });
  }
}
