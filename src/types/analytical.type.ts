// src/types/analytical.type.ts

/* ---------------------- Shared / Base Types ---------------------- */

export interface ApiBaseResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

/* =================================================================
 * RESTAURANT ADMIN ANALYTICS
 * Endpoint: GET report/restaurant-admin/all/
 * ================================================================= */

export interface BookingHour {
  reservation_time: string; // "10:30", "11:30", etc.
  count: number;
}

export interface GuestVisitUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface GuestVisitFrequencyItem {
  visits: number;
  user: GuestVisitUser;
}

export interface CancelledNoShowRate {
  cancelled_rate: string; // e.g. "4.35"
  no_show_rate: string; // e.g. "0.00"
}

export interface ReservationTrendItem {
  period_date: string; // ISO date: "2025-09-19"
  total_reservations: number;
}

export interface UpcomingReservation {
  // Adjust fields if your API adds more later
  id?: number;
  reservation_time?: string;
  reservation_date?: string;
  guest_name?: string;
  party_size?: number;
  [key: string]: unknown;
}

/* Customer analytics for restaurant admin */
export interface TopLoyalCustomerUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TopLoyalCustomer {
  user: TopLoyalCustomerUser;
  count: number; // number of visits
}

export interface CustomerAnalytics {
  top_loyal_customers: TopLoyalCustomer[];
}

/* Reservation analytics for restaurant admin */
export interface ReservationAnalytics {
  average_party_size: string; // "3.91"
  guest_visit_frequency: GuestVisitFrequencyItem[];
  cancelled_no_show_rate: CancelledNoShowRate;
  best_booking_hours: BookingHour[];
  upcoming_reservations: UpcomingReservation[];
  daily_trend: ReservationTrendItem[];
  weekly_trend: ReservationTrendItem[];
  monthly_trend: ReservationTrendItem[];
}

/* Root restaurant admin analytics object */
export interface RestaurantAdminAnalytics {
  reservation: ReservationAnalytics;
  customer: CustomerAnalytics;
}

/* Typed response for restaurant admin analytics */
export type RestaurantAdminAnalyticsResponse =
  ApiBaseResponse<RestaurantAdminAnalytics>;

/* =================================================================
 * SUPER ADMIN ANALYTICS
 * Endpoint: GET report/superadmin/all/
 * ================================================================= */

/* ---------- Customer analytics (super admin) ---------- */

export interface SuperAdminCustomerMonthActivity {
  month_code: string; // "Jan", "Feb", ...
  month_name: string; // "January", "February", ...
  count: number;
}

export interface SuperAdminCustomerAnalytics {
  active_customers_by_month: SuperAdminCustomerMonthActivity[];
  current_month_active_customers: SuperAdminCustomerMonthActivity;
}

/* ---------- Restaurant analytics (super admin) ---------- */

export interface SuperAdminActiveInactiveRestaurants {
  active: number;
  inactive: number;
}

export interface SuperAdminRestaurantOwner {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface SuperAdminRestaurantImage {
  id: number;
  image: string;
  alt_text: string;
}

export interface SuperAdminMostBookedRestaurant {
  id: number;
  name: string;
  owner: SuperAdminRestaurantOwner;
  email: string;
  phone_number: string | null;
  house_number: string;
  street_name: string | null;
  primary_images: SuperAdminRestaurantImage[];
}

export interface SuperAdminRestaurantAnalytics {
  new_restaurants_this_month: number;
  active_inactive_restaurants: SuperAdminActiveInactiveRestaurants;
  most_booked_restaurants: SuperAdminMostBookedRestaurant[];
}

/* ---------- Reservation analytics (super admin) ----------
   Same trend shape as restaurant admin, plus total_reservations.
*/

export interface SuperAdminReservationAnalytics {
  total_reservations: number;
  daily_trend: ReservationTrendItem[];
  weekly_trend: ReservationTrendItem[];
  monthly_trend: ReservationTrendItem[];
}

/* ---------- Cuisine analytics (super admin) ---------- */

export interface SuperAdminCuisineItem {
  id: number;
  name: string;
  image: string;
  count: number; // number of restaurants / bookings using this cuisine
}

export interface SuperAdminCuisineAnalytics {
  most_popular_cuisines: SuperAdminCuisineItem[];
}

/* ---------- Root super admin analytics object ---------- */

export interface SuperAdminAnalytics {
  customer: SuperAdminCustomerAnalytics;
  restaurant: SuperAdminRestaurantAnalytics;
  reservation: SuperAdminReservationAnalytics;
  cuisine: SuperAdminCuisineAnalytics;
}

/* Typed response for super admin analytics */
export type SuperAdminAnalyticsResponse = ApiBaseResponse<SuperAdminAnalytics>;
