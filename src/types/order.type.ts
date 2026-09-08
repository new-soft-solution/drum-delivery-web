import type { Client } from "./client.type";
import type { PaginatedResponse } from "./global.type";

export type OrderStatus =
  "CREATED" | "ASSIGNED_TO_SHIPMENT" | "COMPLETED" | "CANCELLED";

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "CREATED",
  "ASSIGNED_TO_SHIPMENT",
  "COMPLETED",
  "CANCELLED",
];

export interface Order {
  id: string; // uuid, read-only
  client: string; // uuid FK, write
  client_details: Client; // read-only nested
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  order_number: string; // read-only, server-generated
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  creation_date: string; // read-only
  status: OrderStatus;
}

export interface OrderListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  status?: string;
  client?: string;
  order_number?: string;
}

export type OrderListResponse = PaginatedResponse<Order>;

export interface OrderFilterType {
  status?: string;
  client?: string;
  [key: string]: unknown;
}
