import { dtApi } from "./client";
import type { DeleteProps } from "@/types/global.type";
import type {
  DTShipment,
  DTShipmentListResponse,
  DTShipmentQueryParams,
} from "@/types/drum-tracer/shipment.type";
import type { DTShipmentFormValues } from "@/types/schemas/dt-shipment.schema";

export const getShipments = async (
  params: DTShipmentQueryParams = {},
): Promise<DTShipmentListResponse> => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();
  return dtApi.get<DTShipmentListResponse>(`shipments?${qs}`);
};

export const createShipment = (data: DTShipmentFormValues) =>
  dtApi.post<DTShipment>("shipments", data);

export const updateShipment = (id: number, data: Partial<DTShipmentFormValues>) =>
  dtApi.put<DTShipment>(`shipments/${id}`, data);

export const deleteShipment = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("shipments/bulk-delete", { id, ids });

export const getShipmentById = (id: number) => dtApi.get<DTShipment>(`shipments/${id}`);

export const getShipmentDrums = (id: number) =>
  dtApi.get<{ results: import("@/types/drum-tracer/drum.type").DTDrum[]; count: number }>(
    `shipments/${id}/drums`,
  );
export const assignDrumsToShipment = (id: number, drumIds: number[]) =>
  dtApi.post(`shipments/${id}/drums`, { drum_ids: drumIds });
export const unassignDrumFromShipment = (id: number, drumId: number) =>
  dtApi.delete(`shipments/${id}/drums?drumId=${drumId}`);

export const getShipmentOrders = (id: number) =>
  dtApi.get<{
    results: (import("@/types/drum-tracer/order.type").DTOrder & { client_name?: string })[];
    count: number;
  }>(`shipments/${id}/orders`);
export const assignOrdersToShipment = (id: number, orderIds: number[]) =>
  dtApi.post(`shipments/${id}/orders`, { order_ids: orderIds });
export const unassignOrderFromShipment = (id: number, orderId: number) =>
  dtApi.delete(`shipments/${id}/orders?orderId=${orderId}`);
