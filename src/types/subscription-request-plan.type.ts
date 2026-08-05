import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface RequestPlan {
  id: number;
  request_type: string;
  status: string;
  effective_date: string;
  target_plan: Plan;
  requested_at: string;
  restaurant: Restaurant;
  current_subscription?: CurrentSubscription;
  special_request?: null;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  uuid?: string;
  is_active?: boolean;
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  base_price: string;
  level: number;
}
export interface Restaurant {
  id: number;
  name: string;
}
export interface CurrentSubscription {
  id: number;
  plan: PlanOrTargetPlan;
  status: string;
}
export interface PlanOrTargetPlan {
  id: number;
  name: string;
  code: string;
  level: number;
  base_price: string;
}

export interface RequestPlanQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
  restaurant?: number;
}
export interface RequestPlanFilterType extends BaseFilter {
  restaurant: number | null;
}
export type RequestPlanResponse = BaseResponse<RequestPlan>;
export type RequestPlansResponse = BaseResponse<RequestPlan[]>;
export type RequestPlansResponseAll = BaseResponseAll<RequestPlan[]>;
