import type { NormalizedError } from "@/types/error.type";

/**
 * All Drum Tracer service calls (src/services/drum-tracer/client.ts) already
 * throw NormalizedError-shaped objects, so this is mostly a passthrough —
 * kept as a function (rather than removing the call sites in useCRUDTable)
 * so error handling stays consistent if a raw Error/unknown ever reaches it.
 */
export function handleApiError(error: unknown): NormalizedError {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    "isClientError" in error
  ) {
    return error as NormalizedError;
  }

  return {
    message: error instanceof Error ? error.message : "An unexpected error occurred",
    status: 0,
    isClientError: true,
  };
}
