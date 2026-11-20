import { PaginatedResponse } from "@/types/global.type";

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
}

export interface Group {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone_number?: null;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  role: string;
  avatar: string;
  email_verified: boolean;
  slug: string;
  created_at: string;
  uuid: string;
  updated_at: string;
  need_verification: boolean;
  access: string;
  refresh: string;
  need_password_change: boolean;
  date_joined: string;
  username: string;
}
export interface LoginResponse {
  status: number;
  success: boolean;
  message: string;
  data: User;
}

export interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
}

export type ChangePasswordValues = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type UserRole = "customer" | "other" | "restaurant_admin" | "superadmin";

export interface GetUsersParams {
  /** If true, disables pagination (API expects "true"/"false" string). */
  all?: boolean;
  /** Filter by email */
  email?: string;
  /** Filter by first name */
  first_name?: string;
  /** Filter by last name */
  last_name?: string;
  /** Filter by active status */
  is_active?: boolean;
  /** Filter for mobile platform users */
  is_mobile?: boolean;
  /** Ordering field, e.g. "first_name", "-created_at" */
  ordering?: string;
  /** Page number (when pagination enabled) */
  page?: number;
  /** Page size (when pagination enabled) */
  page_size?: number;
  /** User role filter */
  role?: UserRole;
  /** Free-text search */
  search?: string;
  id?: string | number;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface UserListParams {
  page?: number;
  page_size?: number;
  role?: string;
}

export type UserListResponse = PaginatedResponse<User>;

export interface UserFilterType {
  role?: string;
  [key: string]: unknown;
}
