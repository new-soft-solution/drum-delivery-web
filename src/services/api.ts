import { useSessionStore } from "@/store/useSessionStore";
import { NormalizedError } from "@/types/error.type";
import { getValueByPath } from "@/utils/getValueByPath";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { isJwtExpired } from "@/lib/jwt";

// This backend (drum-delivery-api.onrender.com, confirmed from its
// schema.yaml) namespaces every route directly under `/api/...` — no
// `/api/v1` version prefix. Every service call below therefore includes
// the leading `/api/...` itself; this just strips a trailing slash from
// whatever's configured.
const normalizeBaseURL = (rawBaseURL: string): string => (rawBaseURL || "").trim().replace(/\/+$/, "");

// NOTE: this must be NEXT_PUBLIC_* — axios runs in the browser here, calling
// the real backend directly (CORS), not through a Next.js API route.
const baseURL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_BASE_URL || "");
// const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// Public instance — no auth header. Used for login, refresh, forgot/reset
// password, register: anything that must work without a session.
const api: AxiosInstance = axios.create({
  baseURL,
  // headers: {
  //   "X-API-KEY": API_KEY,
  // },
});

// Authenticated instance — every other call goes through this one.
const authApi: AxiosInstance = axios.create({
  baseURL,
  // headers: {
  //   // "X-API-KEY": API_KEY,
  // },
});

if (typeof window !== "undefined") {
  // ──────────────────────────────────────────────────────────────────────
  // Request interceptor
  //  1. Attach the current access token.
  //  2. Proactively refresh first if it's already expired (or about to be)
  //     rather than waiting for the backend to say so with a 401 — there's
  //     no NextAuth `jwt()` callback doing this for us anymore, so it has
  //     to happen here.
  // ──────────────────────────────────────────────────────────────────────
  authApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const { session } = useSessionStore.getState();
    if (session?.accessToken && isJwtExpired(session.accessToken)) {
      await refreshTokens();
    }
    const latest = useSessionStore.getState().session;
    if (latest?.accessToken) {
      config.headers.Authorization = `Bearer ${latest.accessToken}`;
    }
    return config;
  });

  // ──────────────────────────────────────────────────────────────────────
  // Response interceptor — reactive refresh on 401 as a fallback (covers a
  // token that expires mid-flight, or a backend clock skew the proactive
  // check didn't catch).
  //
  //  - Concurrent 401s share a single in-flight refresh promise.
  //  - `_retried` prevents infinite loops.
  //  - On failure, clear the session and hard-redirect to /login.
  // ──────────────────────────────────────────────────────────────────────
  let isLoggingOut = false;

  const performLogoutAndRedirect = () => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    useSessionStore.getState().clearSession();
    if (!window.location.pathname.startsWith("/login")) {
      // A hard redirect (not next/navigation's router) is intentional here:
      // this runs inside an axios interceptor, outside any React component,
      // so there's no router instance available — and a full reload is
      // exactly what we want anyway to guarantee every in-memory bit of
      // stale session state is gone.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  };

  authApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retried?: boolean })
        | undefined;
      const status = error.response?.status;

      if (status !== 401 || !originalRequest || originalRequest._retried) {
        return Promise.reject(error);
      }
      originalRequest._retried = true;

      const newAccessToken = await refreshTokens();
      if (newAccessToken) {
        const replay: AxiosRequestConfig = {
          ...originalRequest,
          headers: { ...originalRequest.headers, Authorization: `Bearer ${newAccessToken}` },
        };
        return authApi(replay);
      }

      performLogoutAndRedirect();
      return Promise.reject(error);
    },
  );
}

// Shared in-flight refresh promise so concurrent 401s / expiry checks never
// spend the same (rotating) refresh token twice.
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const { session, setSession, clearSession } = useSessionStore.getState();
  if (!session?.refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        // Lazy import to avoid a require cycle (auth.service imports `api`
        // from this file).
        const { refreshAccessToken } = await import("./auth/auth.service");
        const result = await refreshAccessToken(session.refreshToken);
        const access = result.access;
        const refresh = result.refresh ?? session.refreshToken;
        if (!access) throw new Error("No access token in refresh response");

        setSession({ ...session, accessToken: access, refreshToken: refresh });
        return access;
      } catch (err) {
        console.warn("Token refresh failed:", err);
        clearSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// Reusable error normalizer
// Known non-field keys that show up at the response root alongside (or
// instead of) real per-field errors — never treated as a field name.
const RESPONSE_META_KEYS = new Set([
  "message",
  "detail",
  "status",
  "success",
  "code",
  "statusCode",
  "non_field_errors",
  "__all__",
]);

/**
 * DRF's *default* validation-error response has no wrapper at all — it's
 * just `{ field_name: ["message"], other_field: ["message"] }` directly at
 * the response root. Some backends additionally (or instead) nest that
 * under an `errors` key. This backend's actual 400-response shape isn't
 * confirmed by its schema.yaml (that only documents success responses), so
 * both conventions are checked here rather than assuming one.
 */
function extractFieldErrors(data: unknown): Record<string, unknown> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const obj = data as Record<string, unknown>;

  if (obj.errors && typeof obj.errors === "object") {
    return obj.errors as Record<string, unknown>;
  }

  const candidateEntries = Object.entries(obj).filter(
    ([key, value]) => !RESPONSE_META_KEYS.has(key) && (Array.isArray(value) || typeof value === "string"),
  );
  if (candidateEntries.length > 0) {
    return Object.fromEntries(candidateEntries);
  }

  return undefined;
}

const handleApiError = (error: unknown, special?: string): NormalizedError => {
  const err = error as AxiosError<{
    message?: string | string[];
    detail?: string;
    errors?: Record<string, string[]>;
  }>;

  if (!err.response) {
    return {
      message: err.message || "Network request failed",
      status: 0,
      isClientError: true,
    };
  }

  const { status, data } = err.response;
  const fieldErrors = extractFieldErrors(data);
  let message = "An unexpected error occurred";

  if (typeof data?.message === "string") message = data.message;
  else if (Array.isArray(data?.message)) message = data.message[0];
  else if (typeof data?.detail === "string") message = data.detail;
  else if (fieldErrors) {
    const firstValue = Object.values(fieldErrors)[0];
    message = Array.isArray(firstValue) ? String(firstValue[0]) : String(firstValue ?? message);
  } else if (err.response.statusText) message = err.response.statusText;

  return {
    message: message.trim(),
    special: special ? getValueByPath(data, special) : "",
    status,
    isClientError: status >= 400 && status < 500,
    errors: fieldErrors,
  };
};

export { api, authApi, handleApiError };
