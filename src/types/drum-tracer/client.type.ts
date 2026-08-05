import { BaseResponse } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface DTClient {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country: string;
  created_at: string;
}

export interface DTClientQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface DTClientFilterType extends BaseFilter {
  country?: string;
}

export type DTClientResponse = BaseResponse<DTClient>;
export type DTClientListResponse = { results: DTClient[]; count: number };
