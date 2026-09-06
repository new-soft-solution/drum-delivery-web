import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { Site, SiteListParams, SiteListResponse } from "@/types/site.type";
import type { SiteFormValues } from "@/types/schemas/site.schema";

export const getSites = async (
  params: SiteListParams = {},
): Promise<SiteListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/sites/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getSite = async (id: string): Promise<Site> => {
  try {
    const response = await authApi.get(`/api/sites/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createSite = async (data: SiteFormValues): Promise<Site> => {
  try {
    const response = await authApi.post("/api/sites/", data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateSite = async (
  id: string,
  data: Partial<SiteFormValues>,
): Promise<Site> => {
  try {
    const response = await authApi.patch(`/api/sites/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteSite = async ({ id, ids }: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/sites/${id}/`);
      return;
    }
    if (ids && ids.length) {
      // NOTE: like clients/orders/drums, /api/sites/bulk_delete/'s
      // documented request-body schema is a drf-spectacular artifact
      // (echoes the full Site shape). {ids: [...]} is the standard DRF
      // convention — the one call site to fix if the backend expects
      // something else.
      await authApi.post("/api/sites/bulk_delete/", { ids });
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
