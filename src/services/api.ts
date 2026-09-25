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

const normalizeBaseURL = (rawBaseURL: string): string =>
  (rawBaseURL || "").trim().replace(/\/+$/, "");
const baseURL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_BASE_URL || "");

const api: AxiosInstance = axios.create({ baseURL });
const authApi: AxiosInstance = axios.create({ baseURL });

if (typeof window !== "undefined") {
  authApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const { session } = useSessionStore.getState();
      if (session?.accessToken && isJwtExpired(session.accessToken)) {
        await refreshTokens();
      }
      const latest = useSessionStore.getState().session;
      if (latest?.accessToken) {
        config.headers.Authorization = `Bearer ${latest.accessToken}`;
      }
      return config;
    },
  );

  let isLoggingOut = false;

  const performLogoutAndRedirect = () => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    useSessionStore.getState().clearSession();
    if (!window.location.pathname.startsWith("/login")) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  };

  authApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
      const status = error.response?.status;

      if (status !== 401 || !originalRequest || originalRequest._retried) {
        return Promise.reject(error);
      }
      originalRequest._retried = true;

      const newAccessToken = await refreshTokens();
      if (newAccessToken) {
        const replay: AxiosRequestConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };
        return authApi(replay);
      }

      performLogoutAndRedirect();
      return Promise.reject(error);
    },
  );
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const { session, setSession, clearSession } = useSessionStore.getState();
  if (!session?.refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
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

function extractFieldErrors(
  data: unknown,
): Record<string, unknown> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const obj = data as Record<string, unknown>;

  if (obj.errors && typeof obj.errors === "object") {
    return obj.errors as Record<string, unknown>;
  }

  const candidateEntries = Object.entries(obj).filter(
    ([key, value]) =>
      !RESPONSE_META_KEYS.has(key) &&
      (Array.isArray(value) || typeof value === "string"),
  );
  if (candidateEntries.length > 0) {
    return Object.fromEntries(candidateEntries);
  }

  return undefined;
}

/**
 * `non_field_errors` (and its older DRF alias `__all__`) is how DRF reports
 * a validation error that isn't tied to any single field — e.g. a
 * cross-field check like "gross weight must be >= net weight". It's
 * deliberately excluded from extractFieldErrors above (it isn't a real
 * field name), but that means it was never being surfaced as a message
 * anywhere — every such error silently fell through to the generic
 * "An unexpected error occurred" fallback. This picks it up as a message
 * source in its own right.
 */
function extractNonFieldError(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const obj = data as Record<string, unknown>;
  const candidate = obj.non_field_errors ?? obj.__all__;
  if (Array.isArray(candidate) && candidate.length > 0)
    return String(candidate[0]);
  if (typeof candidate === "string") return candidate;
  return undefined;
}

const handleApiError = (error: unknown, special?: string): NormalizedError => {
  const err = error as AxiosError<{
    message?: string | string[];
    detail?: string;
    errors?: Record<string, string[]>;
    non_field_errors?: string[];
    __all__?: string[];
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
  const nonFieldError = extractNonFieldError(data);
  let message = "An unexpected error occurred";

  if (typeof data?.message === "string") message = data.message;
  else if (Array.isArray(data?.message)) message = data.message[0];
  else if (typeof data?.detail === "string") message = data.detail;
  else if (nonFieldError) message = nonFieldError;
  else if (fieldErrors) {
    const firstValue = Object.values(fieldErrors)[0];
    message = Array.isArray(firstValue)
      ? String(firstValue[0])
      : String(firstValue ?? message);
  } else if (status === 403)
    message = "You are not authorized to access this action.";
  else if (err.response.statusText) message = err.response.statusText;

  return {
    message: message.trim(),
    special: special ? getValueByPath(data, special) : "",
    status,
    isClientError: status >= 400 && status < 500,
    errors: fieldErrors,
  };
};

export { api, authApi, handleApiError };
