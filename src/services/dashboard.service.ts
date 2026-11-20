import { authApi, handleApiError } from "./api";
import type { DashboardData } from "@/types/dashboard.type";

export const getDashboard = async (): Promise<DashboardData> => {
  try {
    const response = await authApi.get("/api/dashboard/");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
