import { BaseResponse, BaseResponseAll } from "@/types/global.type";

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  group: Group;
  date_of_birth: string;
  iban: string;
  id_document_front: string;
  id_document_back: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  is_active: boolean;
}

export interface Group {
  id: number;
  name: string;
  permissions?: PermissionsEntity[] | [];
  department: Department;
  updated_at: string;
  created_at: string;
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
export interface Department {
  id: number;
  name: string;
  scope: Scope;
  slug: string;
}
export interface Scope {
  id: number;
  name: string;
  slug: string;
}
export interface EmployeeQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  ordering?: string;
  deleted?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
  dropdown?: boolean;
}
export interface DropdownData {
  employees?: EmployeesEntity[] | null;
}
export interface EmployeesEntity {
  value: number;
  label: string;
  actor: Actor;
}
export interface Actor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar?: null;
}
export type EmployeeResponse = BaseResponse<Employee>;
export type EmployeesResponse = BaseResponse<Employee[]>;
export type EmployeesDropdownResponseAll = BaseResponseAll<DropdownData>;
