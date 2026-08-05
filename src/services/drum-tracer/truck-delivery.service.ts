import { dtApi } from "./client";
import type { DeleteProps } from "@/types/global.type";
import type {
  DTTruckDelivery,
  DTTruckDeliveryListResponse,
  DTTruckDeliveryQueryParams,
} from "@/types/drum-tracer/truck-delivery.type";
import type { DTTruckDeliveryFormValues } from "@/types/schemas/dt-truck-delivery.schema";

export const getTruckDeliveries = async (
  params: DTTruckDeliveryQueryParams = {},
): Promise<DTTruckDeliveryListResponse> => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();
  return dtApi.get<DTTruckDeliveryListResponse>(`truck-deliveries?${qs}`);
};

export const createTruckDelivery = (data: DTTruckDeliveryFormValues) =>
  dtApi.post<DTTruckDelivery>("truck-deliveries", data);

export const updateTruckDelivery = (id: number, data: Partial<DTTruckDeliveryFormValues>) =>
  dtApi.put<DTTruckDelivery>(`truck-deliveries/${id}`, data);

export const deleteTruckDelivery = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("truck-deliveries/bulk-delete", { id, ids });
