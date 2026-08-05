import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Department {
  id: number;
  name: string;
  scope: Scope;
  slug: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface Scope {
  id: number;
  name: string;
  slug: string;
}
export interface DepartmentQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
}
export interface DepartmentFilterType extends BaseFilter {
  deleted: string | null;
}

export type DepartmentResponse = BaseResponse<Department>;
export type DepartmentsResponse = BaseResponse<Department[]>;
export type DepartmentsResponseAll = BaseResponseAll<Department[]>;
