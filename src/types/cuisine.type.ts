import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Cuisine {
  id: number;
  uuid?: string;
  name: string;
  description: string;
  image: string;
  is_popular: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CuisineQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
}
export interface CuisineFilterType extends BaseFilter {
  deleted: string | null;
  is_active?: string | null;
}
export type CuisineResponse = BaseResponse<Cuisine>;
export type CuisinesResponse = BaseResponse<Cuisine[]>;
export type CuisinesResponseAll = BaseResponseAll<Cuisine[]>;
