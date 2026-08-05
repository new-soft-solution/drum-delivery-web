import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Group {
  id: number;
  name: string;
  permissions?: PermissionsEntity[] | null;
  department?: DepartmentEntity | null;
  uuid: string;
  slug: string;
  updated_at: string;
  created_at: string;
  deleted_at?: string;
  is_active: boolean;
}

export interface PermissionsEntity {
  id: number;
  name: string;
  codename: string;
  description: string;
  content_type: string;
  content_type_display: string;
  is_active: boolean;
}

export interface DepartmentEntity {
  id: number;
  name: string;
}

export interface GroupQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
  department_id?: number;
}
export interface GroupFilterType extends BaseFilter {
  deleted: string | null;
}
export type GroupResponse = BaseResponse<Group>;
export type GroupsResponse = BaseResponse<Group[]>;
export type GroupsResponseAll = BaseResponseAll<Group[]>;
