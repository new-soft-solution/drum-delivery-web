import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export type PaymentStatus =
  | "paid"
  | "unpaid"
  | "refunded"
  | "partial_refund"
  | "pending";

export interface OrderRestaurant {
  id: number;
  name: string;
  street_name?: string;
  house_number?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  map_link?: string;
}

export interface OrderBridge {
  id: number;
  sync_status: string;
  retry_count: number;
  last_sync_attempt_at: string | null;
  last_synced_at: string | null;
  pos_order_id: number | null;
  pos_order_number: string | null;
  last_error_code: string;
  last_error: string;
}

export interface OrderReceipt {
  id: number;
  uuid: string;
  receipt_number: string;
  stripe_receipt_url: string | null;
  status: string;
  generation_attempts: number;
  issued_at: string | null;
  emailed_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_guest: boolean;
}

export interface OnlineOrder {
  id: number;
  order_number: string;
  uuid: string;
  restaurant?: OrderRestaurant;
  customer?: OrderCustomer | null;
  order_type: string;
  order_type_display?: string;
  payment_method: string | null;
  payment_method_display?: string;
  payment_status: PaymentStatus;
  payment_status_display?: string;
  status: string;
  status_display?: string;
  subtotal: string;
  discount: string;
  tax_amount: string;
  delivery_fee: string;
  service_fee: string;
  tip_amount: string;
  total_amount: string;
  delivery_address_display: string;
  pickup_time?: string | null;
  estimated_delivery_time?: string | null;
  original_pickup_time?: string | null;
  original_estimated_delivery_time?: string | null;
  pickup_time_change_reason?: string | null;
  delivery_time_change_reason?: string | null;
  paid_at?: string | null;
  accepted_at?: string | null;
  preparing_at?: string | null;
  ready_at?: string | null;
  out_for_delivery_at?: string | null;
  picked_up_at?: string | null;
  estimated_ready_at?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  failed_at?: string | null;
  cancelled_by_role?: string | null;
  cancelled_by_role_display?: string | null;
  special_request?: string | null;
  items?: ItemsEntity[];
  order_bridge?: OrderBridge;
  receipt?: OrderReceipt;
  contains_alcohol?: boolean;
  age_verification_confirmed?: boolean;
  age_verification_confirmed_at?: string | null;
  age_verification_prompt_version?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemMetadataPricing {
  tax_type: string;
  tax_source: string;
  unit_total: string;
  addons_total: string;
  discount_scope: string;
  line_tax_total: string;
  tax_percentage: string;
  variants_total: string;
  base_unit_price: string;
  discount_percentage: string;
  line_discount_total: string;
  unit_discount_on_base: string;
  line_subtotal_before_discount: string;
  unit_subtotal_before_discount: string;
}

export interface ItemAddonEntity {
  id: number;
  name: string;
  price: string;
  quantity: number;
  line_quantity: number;
}

export interface ItemVariantOptionEntity {
  id: number;
  name: string;
  group: string;
  price?: string;
}

export interface ItemsEntity {
  id: number;
  item_name: string;
  item_price: string;
  quantity: number;
  line_total: string;
  special_request?: string;
  is_age_restricted?: boolean;
  metadata?: {
    addons: ItemAddonEntity[];
    pricing: ItemMetadataPricing;
    variant_options: ItemVariantOptionEntity[];
  };
}

// ── Refund types ──────────────────────────────────────────────────────────────

export interface RefundItemRequest {
  order_item_id: number;
  quantity: number;
}

export interface RefundPreviewBreakdown {
  subtotal: string;
  service_fee: string;
  delivery_fee: string;
  tip_amount: string;
  tax_amount: string;
  total: string;
}

export interface RefundPreviewItem {
  order_item_id: number;
  name: string;
  quantity: number;
  amount: string;
}

export interface RefundPreviewResponse {
  amount: string;
  currency: string;
  breakdown: RefundPreviewBreakdown;
  items: RefundPreviewItem[];
}

export type RefundStatus = "pending" | "succeeded" | "failed" | "canceled";

export interface RefundResponseItem {
  id: number;
  order_item_id: number;
  item_name: string;
  quantity: number;
  amount: string;
}

export interface RefundResponse {
  id: number;
  order: number;
  amount: string;
  currency: string;
  reason: string;
  status: RefundStatus;
  status_display: string;
  stripe_refund_id: string | null;
  failure_reason: string | null;
  failure_message: string | null;
  processed_at: string | null;
  breakdown: RefundPreviewBreakdown;
  items: RefundResponseItem[];
  created_at: string;
  updated_at: string;
}

// ── Query / filter / response types ───────────────────────────────────────────

export interface OnlineOrderQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  restaurant?: number;
}
export interface OnlineOrderFilterType extends BaseFilter {
  restaurant: number | null;
}
export type OnlineOrderResponse = BaseResponse<OnlineOrder>;
export type OnlineOrdersResponse = BaseResponse<OnlineOrder[]>;
export type OnlineOrdersResponseAll = BaseResponseAll<OnlineOrder[]>;

// ── Refund list types ─────────────────────────────────────────────────────────

export interface RefundListItem {
  id: number;
  order: number;
  order_number?: string;
  amount: string;
  currency: string;
  reason: string;
  status: RefundStatus;
  status_display: string;
  stripe_refund_id: string | null;
  failure_reason: string | null;
  failure_message: string | null;
  processed_at: string | null;
  items: RefundResponseItem[];
  created_at: string;
  updated_at: string;
  breakdown?: {
    total: string;
    subtotal: string;
    tax_amount: string;
    tip_amount: string;
    service_fee: string;
    delivery_fee: string;
  } | null;
}

export interface RefundQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  order?: number;
  stripe_refund_id?: string;
  created_at_after?: string;
  created_at_before?: string;
  updated_at_after?: string;
  updated_at_before?: string;
  processed_at_after?: string;
  processed_at_before?: string;
  payment_intent_id?: string;
}

export interface RefundFilterType extends BaseFilter {
  status?: string;
}

export type RefundListResponse = BaseResponse<RefundListItem[]>;
export type RefundDetailResponse = BaseResponse<RefundListItem>;
