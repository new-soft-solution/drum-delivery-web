import { BaseFilter } from "@/types/crud.type";

export interface DTSite {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  state?: string;
  country: string;
  contact_person?: string;
  contact_phone?: string;
  created_at: string;
}

export interface DTSiteQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface DTSiteFilterType extends BaseFilter {
  country?: string;
}

export type DTSiteListResponse = { results: DTSite[]; count: number };
