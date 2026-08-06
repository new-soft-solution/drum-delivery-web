import { BaseFilter } from "@/types/crud.type";

export type OrderStatus = "Created" | "Assigned" | "Completed";

export interface DTOrder {
  id: number;
  po_number: string;
  client_id: number;
  client_name?: string;
  description?: string;
  status: OrderStatus;
  created_at: string;
}

export interface DTOrderQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  assignment?: string;
}

export interface DTOrderFilterType extends BaseFilter {
  status?: string;
}

export type DTOrderListResponse = { results: DTOrder[]; count: number };
