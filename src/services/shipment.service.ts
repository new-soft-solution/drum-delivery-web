import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type {
  Shipment,
  ShipmentSite,
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
 * A Shipment carries `sites: [{ site, drums }]` and `orders` (UUID array) —
 * confirmed via schema.yaml — so "assigning" a drum or order is just a PATCH
 * of that field, not a separate link/unlink endpoint.
 */
export const setShipmentSites = async (
  id: string,
  sites: ShipmentSite[],
): Promise<Shipment> => {
  try {
    const response = await authApi.patch(`/api/shipments/${id}/`, { sites });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Adds drums to the given site (defaults to the shipment's first site, used by
 * flows without a site picker).
 */
export const addShipmentDrums = (
  id: string,
  sites: ShipmentSite[],
  drumIds: string[],
  siteId?: string,
): Promise<Shipment> => {
  if (sites.length === 0) {
    return Promise.reject(new Error("Shipment has no destination site."));
  }
  const targetId = siteId ?? sites[0].site;
  const exists = sites.some((s) => s.site === targetId);
  const merged = exists
    ? sites
    : [...sites, { site: targetId, drums: [] as string[] }];
  return setShipmentSites(
    id,
    merged.map((s) =>
      s.site === targetId
        ? {
            site: s.site,
            drums: Array.from(new Set([...(s.drums ?? []), ...drumIds])),
          }
        : s,
    ),
  );
};

/** Replaces the drums of a single site, leaving the other sites untouched. */
export const setShipmentSiteDrums = (
  id: string,
  sites: ShipmentSite[],
  siteId: string,
  drumIds: string[],
): Promise<Shipment> =>
  setShipmentSites(
    id,
    sites.map((s) =>
      s.site === siteId ? { site: s.site, drums: drumIds } : s,
    ),
  );

export const removeShipmentDrum = (
  id: string,
  sites: ShipmentSite[],
  drumId: string,
): Promise<Shipment> =>
  setShipmentSites(
    id,
    sites.map((s) => ({
      site: s.site,
      drums: (s.drums ?? []).filter((d) => d !== drumId),
    })),
  );

export const setShipmentOrders = (
  id: string,
  orderIds: string[],
): Promise<Shipment> => updateShipmentArrayField(id, "orders", orderIds);

async function updateShipmentArrayField(
  id: string,
  field: "orders",
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
