// src/types/notification.type.ts
export type NotificationCategory =
  | "amenity"
  | "customer"
  | "gift_card"
  | "loyalty"
  | "reservation"
  | "restaurant"
  | "review";

export type NotificationAction =
  | "customer_redeemed_points"
  | "customer_reservation_update"
  | "customer_review"
  | "customer_review_superadmin"
  | "gift_card_order"
  | "gift_card_redeemed"
  | "new_amenity_added"
  | "new_customer_registered"
  | "new_reservation"
  | "new_restaurant_registered";

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

export interface UserConsentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  phone_number: string;
}

export interface UserConsent {
  id: number;
  user: UserConsentUser;
  consent_type: string; // e.g. "terms"
  accepted: boolean;
  accepted_at: string; // ISO datetime
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface NotificationReceiver {
  id: number;
  first_name: string;
  last_name: string;
  groups: Group[];
  phone_number: string;
  email: string;
  user_consents: UserConsent[];
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  role: string; // e.g. "superadmin"
  provider: string; // e.g. "email"
  avatar: string | null;
  email_verified: boolean;
  my_referral_code: string | null;
  created_at: string;
  updated_at: string;

  // Allow extra fields without breaking typings if backend adds more
  [key: string]: unknown;
}

export type NotificationData = Record<string, unknown>;

export interface Notification {
  id: number;
  title: string;
  description: string;
  receiver: NotificationReceiver;
  category: NotificationCategory | string; // keep flexible in case backend adds more
  action: NotificationAction | string;
  data: NotificationData | null;
  redirect_url: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// ---- Pagination helpers ----

export interface PaginatedResponse<T> {
  count: number;
  unread_count?: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type NotificationListResponse = PaginatedResponse<Notification>;

// ---- Query param types ----

/**
 * Query params for GET /notification/
 */
export interface NotificationListParams {
  action?: string;
  all?: boolean; // disables pagination when true
  category?: string;
  created_at_after?: string; // ISO datetime string
  created_at_before?: string; // ISO datetime string
  is_mobile?: boolean;
  is_read?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  receiver?: number;
  search?: string;
}

/**
 * Query params for GET /notification/my-notifications/
 */
export interface MyNotificationListParams {
  action?: NotificationAction;
  category?: NotificationCategory;
  is_read?: boolean;
  page?: number;
  page_size?: number;
}

// ---- Payload types ----

export interface CreateNotificationPayload {
  title: string;
  description: string;
  receiver: number;
  category: NotificationCategory;
  action: NotificationAction;
  data?: NotificationData;
  redirect_url?: string | null;
  is_read?: boolean;
  is_active?: boolean;
}

export type UpdateNotificationPayload = Partial<CreateNotificationPayload>;

export interface BulkIdsPayload {
  ids: number[];
}
