// src/types/analytical.type.ts

/* ---------------------- Shared / Base Types ---------------------- */

import { BaseResponse } from "@/types/global.type";
import { Amenity, RestaurantStatus, VerificationDocument } from "@/types/restaurant.type";

export interface ApiBaseResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

/* GET /restaurant/registered-by-me/status-summary/ */
export interface RegisteredByMeStatusSummary {
  total: number;
  counts: {
    pending_approval: number;
    approved: number;
    published: number;
    rejected: number;
    suspended: number;
  };
  total_onboarded_restaurants: number;
}

/* =================================================================
 * RESTAURANT ADMIN ANALYTICS
 * Endpoint: GET report/restaurant-admin/all/
 * ================================================================= */
export interface RestaurantDataEntity {
  id: number;
  name: string;
  slug: string;
  owner: Owner;
  primary_images?: null[] | null;
  city: string;
  neighborhood?: null;
  total_capacity: number;
  is_open: boolean;
  price_min?: null;
  price_max?: null;
  average_rating: number;
  average_price: number;
  review_count: number;
  total_reservations_today: number;
  cuisines?: null[] | null;
  map_link?: null;
  discount: string;
  house_number: string;
  street_name: string;
  postal_code: string;
  country: string;
  latitude?: null;
  longitude?: null;
  phone_number: string;
  website?: string | null;
  kvk_number?: string;
  btw?: string;
  iban?: string | null;
  legal_entity_name?: string | null;
  email: string;
  description: string;
  verification_document_files?: VerificationDocument[];
  story?: string;
  ambiance?: string;
  logo: string;
  website_link?: string;
  contact_email: string;
  price_range: string;
  cuisines_ids?: number[];
  amenities_ids?: number[];
  dietary_options_ids?: number[];
  features_ids?: number[];
  accepted_payment_methods_ids?: number[];
  dress_code?: string;
  temporary_closure_start?: string | Date;
  temporary_closure_end?: string | Date;
  temporary_closure_reason?: string;
  status: RestaurantStatus;
  // Onboarding pipeline state — see Restaurant model:
  // registered | agreement_sent | agreement_signed | profile_drafting |
  // awaiting_owner_review | live | suspended | rejected
  onboarding_state?: string;
  is_featured: boolean;
  allows_walk_ins: boolean;
  has_accepted_agreements: boolean;
  manual_booking_approval: boolean;
  min_booking_notice_hours?: number;
  max_booking_notice_days?: number;
  cancellation_policy_hours?: number;
  amenities: Amenity[];
  created_at?: Date;
  created_by?: CreatedBy;
  updated_at?: Date;
  remark?: string;
}

export interface Owner {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar?: string;
  address?: string;
}

export interface CreatedBy {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_superuser: boolean;
  avatar?: null;
}

/* Typed response for super admin analytics */
export type CustomerAnalyticsResponse = BaseResponse<RestaurantDataEntity[]>;
export type CustomerAnalyticsResponseAll = ApiBaseResponse<
  RestaurantDataEntity[]
>;
