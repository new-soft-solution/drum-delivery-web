import { BaseFilter } from "@/types/crud.type";

export type TruckStatus = "Scheduled" | "In Transit" | "Delivered" | "Overdue";

export interface DTTruckDelivery {
  id: number;
  shipment_id: number;
  shipment_number?: string;
  truck_number: string;
  license_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  scheduled_at: string;
  status: TruckStatus;
  notes?: string;
  created_at: string;
}

export interface DTTruckDeliveryQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
}

export interface DTTruckDeliveryFilterType extends BaseFilter {
  status?: string;
}

export type DTTruckDeliveryListResponse = { results: DTTruckDelivery[]; count: number };
