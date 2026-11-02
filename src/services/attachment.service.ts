import type { AxiosProgressEvent } from "axios";
import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type {
  Attachment,
  AttachmentListParams,
  AttachmentListResponse,
  AttachmentOwner,
} from "@/types/attachment.type";

export const getAttachments = async (
  params: AttachmentListParams = {},
): Promise<AttachmentListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/attachments/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/** Uploads one file (multipart) and links it to a shipment or truck delivery. */
export const createAttachment = async (
  owner: AttachmentOwner,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<Attachment> => {
  try {
    const body = new FormData();
    body.append("file", file);
    if (owner.shipment) body.append("shipment", owner.shipment);
    if (owner.truck_delivery) {
      body.append("truck_delivery", owner.truck_delivery);
    }
    const response = await authApi.post("/api/attachments/", body, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteAttachment = async (id: string): Promise<void> => {
  try {
    await authApi.delete(`/api/attachments/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
};
