import type { PaginatedResponse } from "./global.type";

export interface Attachment {
  id: string; // uuid, read-only
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  file: string; // absolute file URL
  file_name: string; // read-only
  file_type: string; // read-only
  file_size: number; // bytes, read-only
  shipment?: string | null;
  truck_delivery?: string | null;
  uploaded_by?: number | null;
}

/** An attachment belongs to exactly one parent. */
export type AttachmentOwner =
  | { shipment: string; truck_delivery?: never }
  | { truck_delivery: string; shipment?: never };

export interface AttachmentListParams {
  page?: number;
  page_size?: number;
  search?: string;
  file_type?: string;
  shipment?: string;
  truck_delivery?: string;
}

export type AttachmentListResponse = PaginatedResponse<Attachment>;
