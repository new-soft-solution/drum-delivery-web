import { BaseResponse } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Amenity {
  id: number;
  uuid?: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface AmenityQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  is_active?: boolean;
}
export interface AmenityFilterType extends BaseFilter {
  deleted: string | null;
  is_active?: string | null;
}
export type AmenityResponse = BaseResponse<Amenity>;
export type AmenitysResponse = BaseResponse<Amenity[]>;
