// src/types/gift-card.type.ts

export type ISODate = string; // e.g. "2025-09-24T13:58:48.123Z"
export type UUID = string;
export type DecimalString = string; // server may return/accept decimals as strings

export interface BaseMeta {
  id: number;
  uuid: UUID;
  slug: string;
  created_at: ISODate;
  updated_at: ISODate;
  deleted_at: ISODate | null;
  is_deleted: boolean;
  remarks: string | null;
  version: number;
  metadata: Record<string, unknown> | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}

export interface GiftCardPackage extends Omit<BaseMeta, "uuid"> {
  uuid: UUID;
  name: string;
  description: string | null;
  price: DecimalString | number;
  image: string | null;
  is_active: boolean;
}

export interface GiftCardAddOn extends BaseMeta {
  name: string;
  price: DecimalString | number;
  image: string | null;
  is_active: boolean;
}

export type GiftCardStatus =
  | "pending"
  | "active"
  | "used"
  | "expired"
  | "blocked";
export type GiftCardType = "digital" | "physical";

export interface GiftCard extends BaseMeta {
  package: GiftCardPackage | null;
  add_ons: GiftCardAddOn[];
  number: string;
  amount: DecimalString | number;
  balance: string;
  message: string | null;
  type: GiftCardType;
  recipient_email: string | null;
  status: GiftCardStatus;
  order_date: ISODate | null;
  used_at: ISODate | null;
  used_by_restaurant: number | null;
  is_active: boolean;
  is_expired: boolean;
  image?: string;
  giftcard_back_image?: string;
  giftcard_front_image?: string;
  expires_at: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type GiftCardsResponse = PaginatedResponse<GiftCard>;
export type GiftCardResponse = GiftCard;

export interface GiftCardQueryParams {
  // Pagination
  page?: number;
  page_size?: number;
  all?: boolean; // if true, disable pagination

  // Filters
  number?: string;
  status?: GiftCardStatus;
  type?: GiftCardType;
  is_mobile?: boolean;
  used_by_restaurant?: number;

  // Amount range (server expects decimal strings; numbers OK too)
  amount_min?: DecimalString | number;
  amount_max?: DecimalString | number;

  // Date range (YYYY-MM-DD for *_after/before per spec)
  order_date_after?: string;
  order_date_before?: string;

  // Ordering (e.g., "-created_at", "amount")
  ordering?: string;
}

// Payload for create/update
export interface GiftCardFormValues {
  // Minimal fields usually required by backend for creation
  number: string;
  amount: DecimalString | number;
  type: GiftCardType;
  message?: string | null;
  recipient_email?: string | null;
  status?: GiftCardStatus; // often defaulted server-side to "pending"
  used_at?: ISODate | null;
  used_by_restaurant?: number | null;

  // Optional flags/metadata if your backend allows them on write
  is_deleted?: boolean;
  is_active?: boolean;
  remarks?: string | null;
  version?: number;
  metadata?: Record<string, unknown> | null;
}

export type RedeemGiftCardPayload = {
  card_number: string;
  restaurant_id?: number | null;
  used_at?: string | null; // ISO datetime
  amount?: string | number;
  message?: string | null;
  type?: "digital" | "physical";
  recipient_email?: string | null;
  status?: "pending" | "active" | "used";
  is_active?: boolean;
  remarks?: string | null;
  metadata?: Record<string, unknown> | null;
};
