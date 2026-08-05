import { BaseFilter } from "../crud.type";

export type Customer = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  is_active?: boolean;
  role?: "customer" | string;
  created_at?: string;
  updated_at?: string;
  avatar?: string | null;
};

/** -------- Types from API -------- */
export type CustomerAnalyticsStatus = {
  status: string;
  count: number;
};

export type CustomerAnalyticsSource = {
  source: string;
  count: number;
};

export type CustomerAnalyticsMostBooked = {
  restaurant_id: number;
  restaurant_name: string;
};

export type CustomerAnalyticsWalletSummary = {
  total_earned: number;
  total_redeemed: number;
  current_balance: number;
  available_credit: number;
};

export type CustomerAnalyticsLoyaltyTransactionSummary = {
  // e.g. { earned: 10, voucher: 2, redeemed: 1 }
  count_by_type: Record<string, number>;
};

export type CustomerAnalyticsRow = {
  id: number;
  user: {
    id: number;
    uuid?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
  } | null;

  wallet_summary: CustomerAnalyticsWalletSummary;
  loyalty_transaction_summary: CustomerAnalyticsLoyaltyTransactionSummary;

  has_reserved_once: boolean;
  total_reservations: number;
  total_guests: number;
  status_summary: CustomerAnalyticsStatus[];
  source_summary: CustomerAnalyticsSource[];
  guest_reservations: number;
  non_guest_reservations: number;
  most_booked_restaurant: CustomerAnalyticsMostBooked | null;
};

export type PaginatedCustomerAnalytics = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerAnalyticsRow[];
};

/** -------- Query params -------- */
export type CustomerAnalyticsParams = {
  start_date?: string; // e.g. "2025-10-01"
  end_date?: string; // e.g. "2025-10-31"
  restaurant_id?: string; // string per API spec
  status?: string; // e.g. "completed,cancelled" if API supports multiple
  source?: string; // e.g. "web,app"
  has_reserved_once?: boolean;
  search?: string; // name/email/phone/restaurant search
  ordering?: string; // e.g. "-total_reservations"
  page?: number;
  page_size?: number;
};

/** Build params and normalize booleans for the API */
export const buildParams = (p?: CustomerAnalyticsParams) => {
  if (!p) return undefined;
  const out: Record<string, string | number> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (typeof v === "boolean") {
      out[k] = v ? "true" : "false";
    } else {
      out[k] = v;
    }
  });
  return out;
};

export interface CustomerFilterType extends BaseFilter {
  restaurant: number | null;
  // Add more filter fields as needed
  // date?: Date;
  // dateRange?: { start: Date; end: Date };
  // etc...
}
