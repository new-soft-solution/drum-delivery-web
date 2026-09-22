import { api, authApi, handleApiError } from "../api";
import type { SessionUser } from "@/types/session.type";

export interface LoginResponse {
  access: string;
  refresh: string;
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

export const refreshAccessToken = async (
  refresh: string,
): Promise<{ access: string; refresh: string }> => {
  const response = await api.post("/api/auth/refresh/", { refresh });
  return response.data;
};

export const logoutUser = async (refresh: string): Promise<void> => {
  try {
    await authApi.post("/api/auth/logout/", { refresh });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getMe = async (): Promise<SessionUser> => {
  try {
    const response = await authApi.get("/api/auth/me/");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
