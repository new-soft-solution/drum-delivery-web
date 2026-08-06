import { BaseResponse, BaseResponseAll } from "@/types/global.type";

export interface Feature {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by: number;
  uuid: string;
  slug: string;
  is_active: boolean;
}

export interface FeatureQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
}

export type FeatureResponse = BaseResponse<Feature>;
export type FeaturesResponse = BaseResponse<Feature[]>;
export type FeaturesResponseAll = BaseResponseAll<Feature[]>;
