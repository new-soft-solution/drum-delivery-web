import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface WeeklyPayout {
  id: number;
  payout_number: string;
  week_start: string;
  week_end: string;
  order_count: number;
  total_amount: string;
  service_charge_total: string;
  net_payout_amount: string;
  currency: string;
  pdf_url: string;
  payout_status: string;
  email_sent_at: string;
  created_at: string;
  restaurant: Restaurant;
}
export interface Restaurant {
  id: number;
  name: string;
  logo?: string | null;
  email: string;
  phone_number: string;
}

export interface WeeklyPayoutQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  restaurant?: number;
  week?: string;
}
export interface WeeklyPayoutFilterType extends BaseFilter {
  // is_paid: boolean | null;
  restaurant: number | null;
  week: string | null;
}
export type WeeklyPayoutResponse = BaseResponse<WeeklyPayout>;
export type WeeklyPayoutsResponse = BaseResponse<WeeklyPayout[]>;
export type WeeklyPayoutsResponseAll = BaseResponseAll<WeeklyPayout[]>;
