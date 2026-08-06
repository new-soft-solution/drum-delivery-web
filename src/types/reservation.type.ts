import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Reservation {
  id: number;
  restaurant: Restaurant;
  user?: User | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string | null;
  discount?: string | null;
  status: string;
  status_display: string;
  source: string;
  source_display: string;
  newsletter_opt_in_restaurant: boolean;
  newsletter_opt_in_platform: boolean;
  tc_accepted: boolean;
  reserved_at: string;
  is_ratable: boolean;
  is_editable: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  uuid: string;
  is_active: boolean;
}

export interface ReservationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  restaurant?: number;
}
export interface Restaurant {
  id: number;
  name: string;
  owner: Owner;
  email: string;
  phone_number: string;
  website: string;
  contact_email: string;
  house_number: string;
  street_name: string;
  total_capacity: number;
  map_link?: string | null;
  primary_images?: PrimaryImagesEntity[] | null;
  slug: string;
  created_at: string;
  updated_at: string;
  uuid: string;
  is_active: boolean;
}
export interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string | null;
}
export interface PrimaryImagesEntity {
  id: number;
  image: string;
  alt_text: string;
  slug: string;
  created_at: string;
  updated_at: string;
  uuid: string;
  is_active: boolean;
}
export interface User {
  id: number;
  user_consents?: null[] | null;
  first_name: string;
  last_name: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  role: string;
  avatar?: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  uuid: string;
  is_active: boolean;
}
export interface ReservationFilterType extends BaseFilter {
  restaurant: number | null;
}
export type ReservationResponse = BaseResponse<Reservation>;
export type ReservationsResponse = BaseResponse<Reservation[]>;
export type ReservationsResponseAll = BaseResponseAll<Reservation[]>;
