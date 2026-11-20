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

export interface ShipmentSite {
  site: string; // real Site UUID
  site_name?: string; // read-only, resolved by the API
  drums?: string[]; // real Drum UUIDs delivered to this site
}

export interface Shipment {
  id: string; // uuid, read-only
  sites: ShipmentSite[]; // destination sites, each with its own drums
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
}

/** All drum ids across every site of a shipment (de-duplicated). */
export const getShipmentDrumIds = (
  shipment?: Pick<Shipment, "sites"> | null,
): string[] =>
  Array.from(new Set((shipment?.sites ?? []).flatMap((s) => s.drums ?? [])));

/** All destination site ids of a shipment (de-duplicated). */
export const getShipmentSiteIds = (
  shipment?: Pick<Shipment, "sites"> | null,
): string[] =>
  Array.from(
    new Set((shipment?.sites ?? []).map((s) => s.site).filter(Boolean)),
  );

/** Display names of every destination site (from the API, no extra lookups). */
export const getShipmentSiteNames = (
  shipment?: Pick<Shipment, "sites"> | null,
): string[] =>
  Array.from(
    new Set((shipment?.sites ?? []).map((s) => s.site_name).filter(Boolean)),
  ) as string[];

export interface ShipmentListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  bl_no?: string;
  invoice_no?: string;
  shipment_number?: string;
  status?: string;
  site?: string;
  expected_arrival_date_after?: string;
  expected_arrival_date_before?: string;
}

export type ShipmentListResponse = PaginatedResponse<Shipment>;

export interface ShipmentFilterType {
  status?: string;
  site?: string;
  expected_arrival_date_after?: string;
  expected_arrival_date_before?: string;
  [key: string]: unknown;
}
