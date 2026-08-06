// @/types/restaurant.type.ts
import { restaurantStatusArray } from "@/constant/restaurant.constant";
import { BaseResponse } from "./global.type";
import { BaseFilter } from "./crud.type";
import { Tag } from "@/types/tag.type";
import { CreatedBy } from "@/types/customer-analytical.type";
import { Actor } from "@/types/employee.type";

export interface SocialMediaLinks {
  [key: string]: string | undefined;
}

export interface OpeningHours {
  [key: string]: string | undefined;
}

export interface VerificationDocument {
  created_at: string;
  file: string;
  file_type: string;
  id: number;
  updated_at: string;
}

export type RestaurantStatus = (typeof restaurantStatusArray)[number];

export interface Owner {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar?: string | null;
  address?: string | null;
}

export interface ActivePlanChangeRequest {
  id: number;
  uuid?: string;
  request_type: string;
  effective_date: string;
  status: string;
  target_plan: Plan;
  requested_at: string;
}

export interface ActiveSubscriptionsEntity {
  id: number;
  plan: Plan;
  start_datetime: string;
  expired_date?: string | null;
  status: string;
  cancelled_at_datetime?: string | null;
  created_at: string;
  updated_at: string;
  slug: string;
  uuid: string;
  is_active: boolean;
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  base_price: string;
  level: number;
}

export interface StripeConnectStatus {
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_completed: boolean;
  requirements: unknown | null;
  requirements_ui: unknown | null;
  onboarding_notified_at: string | null;
}

export interface Restaurant {
  id: number;
  uuid?: string;
  slug?: string;

  name: string;
  email: string;
  phone_number: string;

  owner?: Owner;
  profile_completion_percentage?: number;
  is_profile_complete?: boolean;

  description?: string | null;
  story?: string | null;
  ambiance?: string | null;

  // status / flags
  status: RestaurantStatus;
  is_active: boolean;
  is_open?: boolean;
  is_featured?: boolean;
  discount_enabled?: boolean;
  is_wishlisted?: boolean;
  has_accepted_agreements?: boolean;
  agreement_reacceptance_required?: boolean;

  // media / links
  logo?: string | null;
  website?: string | null;
  website_link?: string | null;
  contact_email?: string | null;
  map_link?: string | null;
  manual_booking_approval: boolean;
  min_booking_notice_hours?: number;
  max_booking_notice_days?: number;
  cancellation_policy_hours?: number;
  dress_code?: string;
  // address
  house_number?: string | null;
  street_name?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  country?: string | null;

  latitude?: string | null;
  longitude?: string | null;

  // pricing (new/updated)
  price_min?: number | null;
  price_max?: number | null;
  average_price?: number | null;
  average_rating?: number | null;
  review_count?: number | null;
  remark?: string;
  price_range: string;
  // capacity
  total_capacity?: number | null;

  // business
  kvk_number?: string | null;
  btw?: string | null;
  iban?: string | null;
  legal_entity_name?: string | null;
  missing_billing_fields?: string[] | null;
  // scheduling / closures
  temporary_closure_start?: string | Date | null;
  temporary_closure_end?: string | Date | null;
  temporary_closure_reason?: string | null;

  // collections
  cuisines: Cuisine[];
  tags: Tag[];
  categories?: unknown[];
  amenities: Amenity[];
  dietary_options: DietaryOption[];
  features: Feature[];
  accepted_payment_methods: PaymentMethod[];
  social_media_links?: SocialMediaLinks;
  opening_hours?: OpeningHours | unknown[];
  primary_images?: unknown[];

  // docs
  verification_document_files?: VerificationDocument[];

  // meta
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string;
  created_by?: CreatedBy;
  assigned_salesperson?: Actor | null;

  // billing/subscription
  active_subscriptions: ActiveSubscriptionsEntity[];
  active_plan_change_request?: ActivePlanChangeRequest | null;
  stripe_connect_status?: StripeConnectStatus;

  // misc (present in API but optional to keep typing flexible)
  location?: string | null;
  online_order_settings?: unknown | null;
  active_plan_change_request_id?: number | null;
  allows_walk_ins: boolean;
  // agreement
  agreement?: Agreement | null;
}
export interface Agreement {
  id: number;
  agreement_version: string;
  accepted_at: string;
  pdf_url: string;
  created_at: string;
}

export type RestaurantResponse = BaseResponse<Restaurant>;

export interface RestaurantQueryParams {
  all?: boolean;
  dropdown?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;

  // common filters used in UI
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;

  // new filter
  is_profile_complete?: boolean;
  deleted?: string;

  // ids/relations
  cuisines?: number[] | string;
  amenities?: number[];
  dietary_options?: number[];
  features?: number[];
  accepted_payment_methods?: number[];
  tags?: string;

  // address filters
  city?: string;
  country?: string;
  postal_code?: string;
  neighborhood?: string;

  // date filters
  created_at_after?: string;
  created_at_before?: string;
  updated_at_after?: string;
  updated_at_before?: string;

  // misc (kept for compatibility with backend)
  id?: number;
  slug?: string;
}

export interface RestaurantFilterType extends BaseFilter {
  status?: string;
  tags?: string;
  cuisines?: string;
  plan?: number;

  // new
  is_profile_complete?: boolean;
  deleted: string | null;
}

export type RestaurantTableConfig = {
  enableSelection?: boolean;
  enableStatusChange?: boolean;
  enableDetailsView?: boolean;
  enableDelete?: boolean;
};

export interface Cuisine {
  id: number;
  name: string;
  description: string;
  image: string;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DietaryOption {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type MyRestaurantSection = "basic" | "contact" | "address";
