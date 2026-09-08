import type { PaginatedResponse } from "./global.type";

export interface Site {
  id: string; // uuid, read-only
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  site_id: string; // read-only, server-generated
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
}

export interface SiteListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  city?: string;
  country?: string;
  name?: string;
}

export type SiteListResponse = PaginatedResponse<Site>;

export interface SiteFilterType {
  city?: string;
  country?: string;
  [key: string]: unknown;
}
