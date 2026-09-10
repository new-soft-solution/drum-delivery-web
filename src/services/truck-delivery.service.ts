import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type {
  TruckDelivery,
  TruckDeliveryListParams,
  TruckDeliveryListResponse,
} from "@/types/truck-delivery.type";
import type { TruckDeliveryFormValues } from "@/types/schemas/truck-delivery.schema";

export const getTruckDeliveries = async (
  params: TruckDeliveryListParams = {},
): Promise<TruckDeliveryListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/truck-deliveries/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getTruckDelivery = async (id: string): Promise<TruckDelivery> => {
  try {
    const response = await authApi.get(`/api/truck-deliveries/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

const cleanPayload = (data: Partial<TruckDeliveryFormValues>) => ({
  ...data,
  driver_name: data.driver_name || undefined,
  driver_phone: data.driver_phone || undefined,
  license_plate: data.license_plate || undefined,
  scheduled_date: data.scheduled_date || undefined,
  actual_departure_date: data.actual_departure_date || undefined,
  actual_arrival_date: data.actual_arrival_date || undefined,
  notes: data.notes || undefined,
});

export const createTruckDelivery = async (
  data: TruckDeliveryFormValues,
): Promise<TruckDelivery> => {
  try {
    const response = await authApi.post(
      "/api/truck-deliveries/",
      cleanPayload(data),
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateTruckDelivery = async (
  id: string,
  data: Partial<TruckDeliveryFormValues>,
): Promise<TruckDelivery> => {
  try {
    const response = await authApi.patch(
      `/api/truck-deliveries/${id}/`,
      cleanPayload(data),
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteTruckDelivery = async ({
  id,
  ids,
}: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/truck-deliveries/${id}/`);
      return;
    }
    if (ids && ids.length) {

      await authApi.post("/api/truck-deliveries/bulk_delete/", { ids });
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
