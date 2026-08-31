import { dtApi } from "./client";
import { buildQueryParams } from "@/utils/build-query-params";
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
  const qs = buildQueryParams(params).toString();
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

// Order linking: a Shipment here only stores real Order UUIDs
// (`order_ids: string[]`) — the actual Order records themselves now live on
// the real backend (see src/services/order.service.ts), not in this mock
// store. These two calls only manage the local link; fetching the linked
// orders' real details and keeping their `status` in sync happens
// client-side in ShipmentOrdersTab / AssignOrdersModal, which already have
// access to the real order.service.ts functions.
export const getShipmentOrderIds = (id: number) =>
  dtApi.get<{ results: string[]; count: number }>(`shipments/${id}/orders`);
export const assignOrdersToShipment = (id: number, orderIds: string[]) =>
  dtApi.post(`shipments/${id}/orders`, { order_ids: orderIds });
export const unassignOrderFromShipment = (id: number, orderId: string) =>
  dtApi.delete(`shipments/${id}/orders?orderId=${orderId}`);
