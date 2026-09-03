import { api, authApi, handleApiError } from "../api";
import type { SessionUser } from "@/types/session.type";

// Every path here is confirmed directly against the real backend's
// schema.yaml (drum-delivery-api.onrender.com/api/docs/) — no guessing.
// Endpoints NOT present in that schema (forgot-password, reset-password,
// register, verify-email, change-password, update-profile) have been
// intentionally removed rather than left calling nonexistent routes — see
// README.md "Authentication" for what that means for the Login/Profile UI.

export interface LoginResponse {
  access: string;
  refresh: string;
  // The schema's documented response for this endpoint is malformed (it
  // echoes the request's own {email, password} shape — a known
  // drf-spectacular quirk with SimpleJWT-style views that don't declare an
  // explicit response serializer). `access`/`refresh` are near-certain
  // given /api/auth/refresh/'s confirmed response shape is identical; a
  // `user` object is NOT confirmed to be included, so callers should treat
  // it as optional and fall back to GET /api/auth/me/.
  user?: SessionUser;
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/api/auth/login/", { email, password });
    if (!response.data?.access || !response.data?.refresh) {
      throw new Error(
        "Login succeeded but the response didn't include an access/refresh token pair.",
      );
    }
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Exchange a valid refresh token for a new access token. Uses the public
 * `api` instance (not `authApi`) so this never gets caught by the 401
 * interceptor — that would create an infinite refresh loop.
 */
export const refreshAccessToken = async (
  refresh: string,
): Promise<{ access: string; refresh: string }> => {
  const response = await api.post("/api/auth/refresh/", { refresh });
  return response.data;
};

export const logoutUser = async (refresh: string): Promise<void> => {
  try {
    // The schema documents no request body for this endpoint (unlike a
    // typical SimpleJWT-blacklist logout, which usually expects
    // {refresh: token}). Sent as-is; if the backend actually expects the
    // refresh token to blacklist it, this call site is where to add it.
    await authApi.post("/api/auth/logout/", { refresh });
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * The schema documents this endpoint with no response body (another
 * drf-spectacular gap), but functionally it must return the current
 * user — that's the entire point of a `/me/` endpoint. Typed loosely and
 * treated defensively by callers.
 */
export const getMe = async (): Promise<SessionUser> => {
  try {
    const response = await authApi.get("/api/auth/me/");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
