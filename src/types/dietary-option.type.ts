import { BaseResponse } from "./global.type";
import { BaseFilter } from "@/types/crud.type";

export interface DietaryOption {
  id: number;
  uuid?: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DietaryOptionQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  deleted?: string;
  sort_by?: string;
  is_active?: boolean;
  sort_order?: "asc" | "desc";
}
export interface DietaryOptionFilterType extends BaseFilter {
  deleted: string | null;
  is_active: string | null;
}
export type DietaryOptionResponse = BaseResponse<DietaryOption>;
export type DietaryOptionsResponse = BaseResponse<DietaryOption[]>;
