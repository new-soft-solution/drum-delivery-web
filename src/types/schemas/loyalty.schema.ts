// src/schema/loyalty.schema.ts

import { BaseFilter } from "../crud.type";
import { Restaurant } from "../restaurant.type";

/**
 * Shared pagination shape
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoyaltyUser {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  avatar: string | null;
}

export interface LoyaltyRestaurant {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  contact_email: string;
  primary_images: string;
  is_active: boolean;
}

/**
 * Loyalty transaction model
 *
 * Covers both:
 * - /api/v1/loyalty-transaction/
 * - transaction object inside voucher response
 */
export interface LoyaltyTransaction {
  id: number;
  user: LoyaltyUser;
  restaurant?: LoyaltyRestaurant; // not shown in the plain transaction example, but present in voucher.transaction
  type: string; // e.g. "earned"
  action: string; // e.g. "account_signup"
  source_table: string; // e.g. "reservations"
  source_table_display?: string;
  reference_id?: number;
  points: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

/**
 * Voucher model from /api/v1/loyalty-transaction/voucher/
 */
export interface LoyaltyVoucher {
  id: number;
  points: number;
  amount: number;
  expires_at: string;
  is_used: boolean;
  is_expired: boolean;
  transaction: LoyaltyTransaction;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  code: string;
}

/**
 * Typed paginated responses
 */
export type LoyaltyTransactionListResponse =
  PaginatedResponse<LoyaltyTransaction>;

/**
 * Query params for /api/v1/loyalty-transaction/
 */
export interface LoyaltyTransactionQueryParams {
  action?: string;
  all?: boolean | "true" | "false";
  created_at?: string;
  created_at_after?: string;
  created_at_before?: string;
  is_mobile?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  points?: number;
  points_max?: number;
  points_min?: number;
  reference_id?: number;
  restaurant?: number;
  search?: string;
  source_table?: string;
  type?: string;
  user?: number;
}

/**
 * Query params for /api/v1/loyalty-transaction/voucher/
 */
export interface LoyaltyVoucherQueryParams {
  all?: boolean | "true" | "false";
  amount_max?: number;
  amount_min?: number;
  expires_at_after?: string;
  expires_at_before?: string;
  is_expired?: boolean;
  is_mobile?: boolean;
  is_used?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  points_max?: number;
  points_min?: number;
  search?: string;
  user?: number;
}

/**
 * Optional: known constant lists if you want to use them in filters/forms.
 * (These are non-exhaustive and purely for UI usage.)
 */
export const LOYALTY_KNOWN_TRANSACTION_TYPES = ["earned", "redeemed"] as const;

export const LOYALTY_KNOWN_ACTIONS = [
  "account_signup",
  "reservation_completed",
  "order_completed",
] as const;

export type LoyaltyTransactionType =
  (typeof LOYALTY_KNOWN_TRANSACTION_TYPES)[number];

export type LoyaltyAction = (typeof LOYALTY_KNOWN_ACTIONS)[number];

export interface LoyaltyTransactionRow {
  id: number;
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: string;
    avatar: string | null;
  };
  type: string; // e.g. "earned", "voucher"
  action: string; // e.g. "account_signup", "voucher_used"
  source_table: string; // e.g. "reservations"
  points: number;
  restaurant?: Restaurant;
  notes: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// --- Voucher row from /api/v1/loyalty-transaction/voucher/ ---

export interface LoyaltyVoucherRow {
  id: number;
  points: number;
  amount: number;
  expires_at: string;
  is_used: boolean;
  is_expired: boolean;
  transaction: LoyaltyTransactionRow;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  code: string;
}

// Paginated response
export interface LoyaltyVoucherListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LoyaltyVoucherRow[];
}

export interface LoyaltyVoucherFilterType extends BaseFilter {
  is_used?: boolean | null;
  is_expired?: boolean | null;
}

export interface LoyaltyTransactionFormValues {
  user: number;
  type: string;
  action: string;
  source_table: string;
  reference_id?: number | null;
  points: number;
  notes?: string | null;
  is_mobile?: boolean;
  restaurant?: number | null;
  is_active?: boolean;
}

// Filters used by the UI
export interface LoyaltyTransactionFilterType extends BaseFilter {
  user?: number | null;
  restaurant?: number | null;
  type?: string | null;
  action?: string | null;
}
