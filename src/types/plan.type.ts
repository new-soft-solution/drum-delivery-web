import { BaseResponse, BaseResponseAll } from "@/types/global.type";

export interface Plan {
  id: number;
  level: number;
  plan_type: FeaturesEntityOrPlanType;
  code: string;
  name: string;
  description: string;
  base_price: string;
  per_cover_charge: string;
  duration_months: number;
  max_devices: number;
  features: FeaturesEntityOrPlanType[] | [];
  tagline: string | null;
  cta_label: string | null;
  is_most_popular: boolean;
  yearly_discount_months: number;
  slug: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  is_active: boolean;
  uuid: string;
}

export interface FeaturesEntityOrPlanType {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface PlanQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
  dropdown?: boolean;
}

export type PlanResponse = BaseResponse<Plan>;
export type PlansResponse = BaseResponse<Plan[]>;
export type PlansResponseAll = BaseResponseAll<Plan[]>;
