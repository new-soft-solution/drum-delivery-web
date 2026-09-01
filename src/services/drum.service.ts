// src/services/drum.service.ts
import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { Drum, DrumListParams, DrumListResponse } from "@/types/drum.type";
import type { DrumFormValues } from "@/types/schemas/drum.schema";

export const getDrums = async (
  params: DrumListParams = {},
): Promise<DrumListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/drums/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getDrum = async (id: string): Promise<Drum> => {
  try {
    const response = await authApi.get(`/api/drums/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// The schema documents create/update as multipart/form-data (not JSON) —
// sent as FormData here to match exactly, since a DRF view restricted to
// MultiPartParser would 415 on a JSON body.
function toFormData(data: Partial<DrumFormValues>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, typeof value === "boolean" ? String(value) : value);
  });
  return formData;
}

export const createDrum = async (data: DrumFormValues): Promise<Drum> => {
  try {
    const response = await authApi.post("/api/drums/", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateDrum = async (
  id: string,
  data: Partial<DrumFormValues>,
): Promise<Drum> => {
  try {
    const response = await authApi.patch(
      `/api/drums/${id}/`,
      toFormData(data),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteDrum = async ({ id, ids }: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/drums/${id}/`);
      return;
    }
    if (ids && ids.length) {
      // NOTE: like clients/orders, /api/drums/bulk_delete/'s documented
      // request-body schema is a drf-spectacular artifact (echoes the full
      // Drum shape). {ids: [...]} is the standard DRF convention — the one
      // call site to fix if the backend expects something else.
      await authApi.post("/api/drums/bulk_delete/", { ids });
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

export interface BulkImportResult {
  created?: number;
  failed?: number;
  errors?: unknown[];
  [key: string]: unknown;
}

/**
 * NOTE: /api/drums/bulk_import/'s documented request/response shapes are
 * both drf-spectacular artifacts too (request shows a single `Drum` object
 * under multipart/form-data; response shows a single `Drum`) — neither
 * makes sense for an endpoint literally named "bulk_import". Given the
 * `multipart/form-data` content-type (not `application/json`), the
 * near-certain real design is a **file upload** (CSV/Excel), matching the
 * "Bulk Import" UI pattern this app already uses elsewhere. `file` is the
 * conventional DRF field name for this and is what's sent — if the
 * backend expects a different field name, this is the one call site to
 * fix. The response is typed loosely and handled defensively in the UI
 * for the same reason.
 */
export const bulkImportDrums = async (
  file: File,
): Promise<BulkImportResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await authApi.post("/api/drums/bulk_import/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
