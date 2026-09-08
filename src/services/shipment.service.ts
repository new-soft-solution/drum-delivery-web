import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type {
  Shipment,
  ShipmentListParams,
  ShipmentListResponse,
} from "@/types/shipment.type";
import type { ShipmentFormValues } from "@/types/schemas/shipment.schema";

export const getShipments = async (
  params: ShipmentListParams = {},
): Promise<ShipmentListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/shipments/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getShipment = async (id: string): Promise<Shipment> => {
  try {
    const response = await authApi.get(`/api/shipments/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createShipment = async (
  data: ShipmentFormValues,
): Promise<Shipment> => {
  try {
    const payload = {
      ...data,
      expected_arrival_date: data.expected_arrival_date || undefined,
    };
    const response = await authApi.post("/api/shipments/", payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateShipment = async (
  id: string,
  data: Partial<ShipmentFormValues>,
): Promise<Shipment> => {
  try {
    const payload = {
      ...data,
      expected_arrival_date: data.expected_arrival_date || undefined,
    };
    const response = await authApi.patch(`/api/shipments/${id}/`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteShipment = async ({
  id,
  ids,
}: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/shipments/${id}/`);
      return;
    }
    if (ids && ids.length) {
      // NOTE: like clients/orders/drums/sites, /api/shipments/bulk_delete/'s
      // documented request-body schema is a drf-spectacular artifact
      // (echoes the full Shipment shape). {ids: [...]} is the standard DRF
      // convention — the one call site to fix if the backend expects
      // something else.
      await authApi.post("/api/shipments/bulk_delete/", { ids });
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * The real Shipment object carries `drums`/`orders` directly as arrays of
 * UUIDs — confirmed via schema.yaml — so "assigning" a drum or order to a
 * shipment is just a PATCH of that array, not a separate link/unlink
 * endpoint like the old mock API had.
 */
export const setShipmentDrums = (
  id: string,
  drumIds: string[],
): Promise<Shipment> => updateShipmentArrayField(id, "drums", drumIds);

export const setShipmentOrders = (
  id: string,
  orderIds: string[],
): Promise<Shipment> => updateShipmentArrayField(id, "orders", orderIds);

async function updateShipmentArrayField(
  id: string,
  field: "drums" | "orders",
  ids: string[],
): Promise<Shipment> {
  try {
    const response = await authApi.patch(`/api/shipments/${id}/`, {
      [field]: ids,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
