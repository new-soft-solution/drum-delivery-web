// src/types/gift-card-order.type.ts

import type { DecimalString, GiftCard, GiftCardType, ISODate, PaginatedResponse } from "@/types/gift-card.type";
import { BaseFilter } from "@/types/crud.type";

// ───────────────────────────────────────────────────────────────────────────────
// User & permissions (mirrors your example payload)
// ───────────────────────────────────────────────────────────────────────────────

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
}

export interface Group {
  name: string;
  permissions: Permission[];
}

export interface ConsentUser {
  first_name: string;
  last_name: string;
  email: string;
  role: string; // e.g. "superadmin"
  is_active: boolean;
  phone_number: string | null;
}

export interface UserConsent {
  user: ConsentUser;
  consent_type: string; // e.g. "terms"
  accepted: boolean;
  accepted_at: ISODate;
  created_at: ISODate;
  updated_at: ISODate;
  is_active: boolean;
}

export interface OrderUser {
  id: number;
  first_name: string;
  last_name: string;
  groups: Group[];
  phone_number: string | null;
  email: string;
  user_consents: UserConsent[];
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  role: string; // e.g. "superadmin"
  provider: string; // e.g. "email"
  avatar: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

// ───────────────────────────────────────────────────────────────────────────────
// Order core
// ───────────────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "paid"
  | "pending"
  | "failed"
  | "refunded"
  | "unpaid"
  | "no_payment_required"
  | string; // keep flexible unless backend enum is strict

export interface GiftCardOrder {
  id: number;

  user: OrderUser | null;
  gift_cards: GiftCard[];

  // money-like fields often returned as strings from DRF
  total_amount: DecimalString | number;
  discount_amount: DecimalString | number;
  tax_amount: DecimalString | number;
  grand_total: DecimalString | number;

  payment_status: PaymentStatus;
  payment_method: string | null;
  transaction_id: string | null;
  payment_date: ISODate | Date | null;

  // delivery
  delivery_date: string | null; // "YYYY-MM-DD"
  street_name: string | null;
  house_number: string | null;
  house_number_suffix: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;

  // recipient
  recipient_name: string | null;
  recipient_email: string | null;

  // order status / meta
  status: string; // e.g., "pending"
  delivery_notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
  deleted_at: string;
  order_number: string | null;

  // sender
  sender_full_name: string | null;
  sender_email: string | null;
  sender_phone: string | null;
}

export type GiftCardOrdersResponse = PaginatedResponse<GiftCardOrder>;
export type GiftCardOrderResponse = GiftCardOrder;

// ───────────────────────────────────────────────────────────────────────────────
// Create / Update payloads (aligned with Insomnia example you provided)
// ───────────────────────────────────────────────────────────────────────────────

/**
 * A single line in the order `gift_cards` array.
 * Matches the POST example:
 * {
 *   "package": 1,
 *   "add_ons": [1,2],
 *   "type": "physical",
 *   "message": "",
 *   "amount": 105.48,
 *   "recipient_email": "foo@bar.com",
 *   "quantity": 2
 * }
 */
export interface GiftCardOrderLineInput {
  package?: number;
  add_ons: number[];
  type: GiftCardType; // "digital" | "physical"
  message?: string;
  amount: number | DecimalString; // per-line amount (already accounts for quantity)
  recipient_email: string;
  quantity: number;
}

/**
 * Full create payload for /api/v1/giftcard/orders/ (POST)
 * Mirrors your Insomnia request body.
 */
export interface GiftCardOrderCreatePayload {
  // lines
  gift_cards: GiftCardOrderLineInput[];

  // totals
  discount_amount?: DecimalString | number;
  total_amount: DecimalString | number;
  tax_amount?: DecimalString | number;
  grand_total: DecimalString | number;

  // delivery
  delivery_date: string | null; // "YYYY-MM-DD"

  // address (required for physical shipments)
  street_name?: string;
  house_number?: string;
  house_number_suffix?: string;
  postal_code?: string;
  city?: string;
  country?: string;

  // recipient (header-level)
  recipient_name?: string;
  recipient_email?: string;

  // notes
  delivery_notes?: string;

  // sender
  sender_full_name: string;
  sender_email: string;
  sender_phone: string;

  // payment (server may allow sending these pre-marked)
  payment_status?: PaymentStatus;
  payment_method?: string;
  transaction_id?: string | null;
  payment_date?: ISODate | null;

  // optional association
  user?: number | null;

  // optional order status
  status?: string;
}

/**
 * Update payload – allow partial updates of the same shape.
 * You can PATCH any subset (including changing gift_cards).
 */
export type GiftCardOrderUpdatePayload = Partial<GiftCardOrderCreatePayload>;

/** Some backends return a minimal response on create; keep union flexible */
export type GiftCardOrderCreateResult =
  | {
      id?: number;
      sender_full_name: string;
      sender_email: string;
      sender_phone: string;
    }
  | GiftCardOrderResponse;

// ───────────────────────────────────────────────────────────────────────────────
// Query params (keep flexible; only defined keys will be sent)
// ───────────────────────────────────────────────────────────────────────────────

export interface GiftCardOrderQueryParams {
  page?: number;
  page_size?: number;
  ordering?: string; // e.g. "-created_at", "payment_date"
  search?: string; // e.g. "-created_at", "payment_date"
  all?: boolean; // if API supports disabling pagination

  // useful filters (server may ignore those it doesn't support)
  status?: string;
  deleted?: string;
  payment_status?: PaymentStatus;
  payment_method?: string;
  order_number?: string;
  transaction_id?: string;
  sender_email?: string;
  recipient_email?: string;

  // date filters (commonly supported by DRF + django-filters)
  payment_date_after?: string; // "YYYY-MM-DD"
  payment_date_before?: string; // "YYYY-MM-DD"
  delivery_date_after?: string; // "YYYY-MM-DD"
  delivery_date_before?: string; // "YYYY-MM-DD"
}
export interface GiftCardOrderFilterType extends BaseFilter {
  deleted: string | null;
}
