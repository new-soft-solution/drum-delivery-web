// Matches the real backend's Client schema exactly
// (drum-delivery-api.onrender.com — /api/clients/), confirmed from schema.yaml.

import type { PaginatedResponse } from "./global.type";

export interface Client {
  id: string; // uuid, read-only
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  client_id: string; // read-only, server-generated
  name: string;
  email: string;
  contact_person: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

export interface ClientListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  city?: string;
  country?: string;
  email?: string;
  name?: string;
  phone?: string;
}

export type ClientListResponse = PaginatedResponse<Client>;

export interface ClientFilterType {
  status?: string;
  [key: string]: unknown;
}
