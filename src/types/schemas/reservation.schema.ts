import { z } from "zod";
import { Restaurant } from "../restaurant.type";

/** ---------------------------
 *  Option Sets (typed)
 *  -------------------------- */
export const RESERVATION_STATUS = [
  { value: "pending_confirmation", label: "Pending Confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled_by_user", label: "Cancelled by User" },
  { value: "cancelled_by_restaurant", label: "Cancelled by Restaurant" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" },
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[number]["value"];

export const RESERVATION_SOURCE = [
  { value: "platform", label: "Platform" },
  { value: "phone", label: "Phone" },
  { value: "walk_in", label: "Walk-in" }, // default
  { value: "other", label: "Other" },
] as const;

export type ReservationSource = (typeof RESERVATION_SOURCE)[number]["value"];

/** helpful arrays for z.enum */
const STATUS_VALUES = RESERVATION_STATUS.map((o) => o.value) as [
  ReservationStatus,
  ...ReservationStatus[],
];
const SOURCE_VALUES = RESERVATION_SOURCE.map((o) => o.value) as [
  ReservationSource,
  ...ReservationSource[],
];

export type GetMonthlyReservationsCalendarViewParams = {
  /** format: YYYY-MM (e.g., "2025-09") */
  month: string;
};

export type GetReservationsForServiceParams = {
  /** format: YYYY-MM-DD (e.g., "2025-09-01") */
  date: string;
  /** Options: "service" | "none" (default: "service") */
  grouped_by?: "service" | "none";
  /** Optional filter: "breakfast" | "lunch" | "dinner" */
  service?: "breakfast" | "lunch" | "dinner";
};

/** ---------------------------
 *  API Types
 *  -------------------------- */
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  restaurant: Restaurant;
  user?: User;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
  status: ReservationStatus;
  status_display: string;
  source: ReservationSource;
  source_display: string;
  newsletter_opt_in_restaurant: boolean;
  newsletter_opt_in_platform: boolean;
  tc_accepted: boolean;
  reserved_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reservation[];
  data: Reservation[];
}

export interface ReservationResponse {
  data: Reservation;
}

export interface ReservationQueryParams {
  all?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  party_size_max?: number;
  party_size_min?: number;
  reservation_date_after?: string;
  reservation_date_before?: string;
  reservation_time_after?: string;
  reservation_time_before?: string;
  reserved_at_after?: string;
  reserved_at_before?: string;
  restaurant?: number;
  search?: string;
  source?: ReservationSource;
  status?: ReservationStatus;
  user?: number;
}

/** ---------------------------
 *  Form Schemas
 *  -------------------------- */
export const reservationFormSchema = z.object({
  restaurant_id: z.number().min(1, "Restaurant is required!"),
  user_id: z.number().optional(),
  guest_name: z.string().min(1, "Guest name is required!"),
  guest_email: z.string().email("Valid email is required!"),
  guest_phone: z.string().optional(),
  reservation_date: z.string().min(1, "Reservation date is required!"),
  reservation_time: z.string().min(1, "Reservation time is required!"),
  party_size: z.number().min(1, "Party size must be at least 1!"),
  special_requests: z.string().optional(),

  // enums from our value arrays
  status: z.enum(STATUS_VALUES).default("pending_confirmation"),
  source: z.enum(SOURCE_VALUES).default("walk_in"),

  newsletter_opt_in_restaurant: z.boolean().default(false),
  newsletter_opt_in_platform: z.boolean().default(false),
  // tc_accepted: z.boolean().refine((val) => val === true, {
  //   message: "You must accept the terms and conditions!",
  // }),
});

export const reservationIdSchema = z.object({
  reservation_ids: z
    .array(z.number())
    .min(1, "Select at least one reservation"),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;
export type ReservationIdFormValues = z.infer<typeof reservationIdSchema>;

export interface IPartySizeAPIResponse {
  party_sizes: { size: number; discount: string }[] | null;
}

export const STEP = {
  DATE: 1,
  TIME: 2,
  GUEST: 3,
  REVIEW: 4,
} as const;
