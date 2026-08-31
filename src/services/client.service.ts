import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { Client, ClientListParams, ClientListResponse } from "@/types/client.type";
import type { ClientFormValues } from "@/types/schemas/client.schema";

export const getClients = async (params: ClientListParams = {}): Promise<ClientListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/clients/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getClient = async (id: string): Promise<Client> => {
  try {
    const response = await authApi.get(`/api/clients/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createClient = async (data: ClientFormValues): Promise<Client> => {
  try {
    const response = await authApi.post("/api/clients/", data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateClient = async (id: string, data: Partial<ClientFormValues>): Promise<Client> => {
  try {
    const response = await authApi.patch(`/api/clients/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteClient = async ({ id, ids }: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/clients/${id}/`);
      return;
    }
    if (ids && ids.length) {
      // NOTE: /api/clients/bulk_delete/ exists on the real backend, but its
      // documented request-body schema is auto-generated incorrectly by
      // drf-spectacular (it echoes the full Client object shape instead of
      // an actual bulk-delete payload). {ids: [...]} is the standard DRF
      // convention for this action and is what we send — if the backend
      // expects a different key, this is the one call site to fix.
      await authApi.post("/api/clients/bulk_delete/", { ids });
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
