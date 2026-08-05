import { BaseResponse, BaseResponseAll } from "@/types/global.type";

export interface PublishRule {
  id: number;
  key: string;
  label: string;
  description: string;
  countable: boolean;
  is_required: boolean;
  min_count: number;
  order: number;
  url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublishRuleQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;

  // API filters
  all?: boolean; // disables pagination
  dropdown?: boolean;
  is_active?: boolean;
  is_mobile?: boolean;
  is_required?: boolean;
  countable?: boolean;

  key?: string;
  min_count?: number;

  // date filters (string($date) in swagger)
  created_at_after?: string;
  created_at_before?: string;
  updated_at_after?: string;
  updated_at_before?: string;
}

export type PublishRuleResponse = BaseResponse<PublishRule>;
export type PublishRulesResponse = BaseResponse<PublishRule[]>;
export type PublishRulesResponseAll = BaseResponseAll<PublishRule[]>;
