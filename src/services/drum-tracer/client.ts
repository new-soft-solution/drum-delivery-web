import type { NormalizedError } from "@/types/error.type";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const json = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (!res.ok) {
    const error: NormalizedError = {
      message:
        (json as { message?: string; error?: string }).message ||
        (json as { error?: string }).error ||
        "Request failed",
      status: res.status,
      isClientError: res.status >= 400 && res.status < 500,
      errors: (json as { errors?: Record<string, unknown> }).errors,
    };
    throw error;
  }
  return json as T;
}

export const dtApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};
