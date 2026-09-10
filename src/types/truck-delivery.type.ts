import type { PaginatedResponse } from "./global.type";

export type TruckDeliveryStatus =
  "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export const TRUCK_DELIVERY_STATUS_OPTIONS: TruckDeliveryStatus[] = [
  "SCHEDULED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export const TRUCK_DELIVERY_STATUS_LABELS: Record<TruckDeliveryStatus, string> =
  {
    SCHEDULED: "Scheduled",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

export interface TruckDelivery {
  id: string; // uuid, read-only
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  truck_delivery_id: string; // read-only, server-generated
  truck_number: string;
  driver_name?: string | null;
  driver_phone?: string | null;
  license_plate?: string | null;
  scheduled_date?: string | null;
  actual_departure_date?: string | null;
  actual_arrival_date?: string | null;
  status: TruckDeliveryStatus;
  notes?: string | null;
  shipment: string; // real Shipment UUID
}

export interface TruckDeliveryListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  shipment?: string;
  status?: string;
  scheduled_date__gte?: string;
  scheduled_date__lte?: string;
  actual_departure_date__gte?: string;
  actual_departure_date__lte?: string;
  actual_arrival_date__gte?: string;
  actual_arrival_date__lte?: string;
}

export type TruckDeliveryListResponse = PaginatedResponse<TruckDelivery>;

export interface TruckDeliveryFilterType {
  status?: string;
  shipment?: string;
  scheduled_date__gte?: string;
  scheduled_date__lte?: string;
  [key: string]: unknown;
}
