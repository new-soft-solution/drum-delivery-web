import type { PaginatedResponse } from "./global.type";

export type ShipmentStatus =
  "CREATED" | "IN_TRANSIT" | "ARRIVED" | "DELIVERED" | "CANCELLED";

export const SHIPMENT_STATUS_OPTIONS: ShipmentStatus[] = [
  "CREATED",
  "IN_TRANSIT",
  "ARRIVED",
  "DELIVERED",
  "CANCELLED",
];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  IN_TRANSIT: "In Transit",
  ARRIVED: "Arrived",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export interface Shipment {
  id: string; // uuid, read-only
  drums: string[]; // real Drum UUIDs, read/write directly on the shipment
  orders: string[]; // real Order UUIDs, read/write directly on the shipment
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  shipment_number: string; // read-only, auto-generated
  invoice_no: string;
  bl_no: string;
  expected_arrival_date?: string | null;
  status: ShipmentStatus;
  destination_site: string; // real Site UUID
}

export interface ShipmentListParams {
  page?: number;
  ordering?: string;
  search?: string;
  bl_no?: string;
  invoice_no?: string;
  shipment_number?: string;
  status?: string;
  destination_site?: string;
  expected_arrival_date_after?: string;
  expected_arrival_date_before?: string;
}

export type ShipmentListResponse = PaginatedResponse<Shipment>;

export interface ShipmentFilterType {
  status?: string;
  destination_site?: string;
  expected_arrival_date_after?: string;
  expected_arrival_date_before?: string;
  [key: string]: unknown;
}
