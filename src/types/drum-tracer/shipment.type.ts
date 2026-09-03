// src/types/drum-tracer/shipment.type.ts
import { BaseFilter } from "@/types/crud.type";

export type ShipmentStatus = "Created" | "In Transit" | "Arrived" | "Delivered";

export interface DTShipment {
  id: number;
  shipment_number: string;
  invoice_number?: string;
  bl_number?: string;
  container_number?: string;
  destination_site_id: number;
  destination_site_name?: string;
  expected_arrival: string;
  status: ShipmentStatus;
  order_ids: string[];
  drum_ids: string[];
  created_at: string;
}

export interface DTShipmentQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
}

export interface DTShipmentFilterType extends BaseFilter {
  status?: string;
}

export type DTShipmentListResponse = { results: DTShipment[]; count: number };
