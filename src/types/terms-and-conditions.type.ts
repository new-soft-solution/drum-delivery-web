import { BaseResponse } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface TermsAndConditions {
  id: number;
  title: string;
  description: string;
  scope?: "loyalty" | "gift_card" | "pos" | "subscription" | "general";
  audience?: "employee" | "customer" | "restaurant";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface TermsAndConditionsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  scope?: string;
  audience?: string;
  deleted?: string;
}
export interface TermsAndConditionsFilterType extends BaseFilter {
  scope: string | null;
  audience: string | null;
  deleted: string | null;
}
export type TermsAndConditionsResponse = BaseResponse<TermsAndConditions>;
export type TermsAndConditionsListResponse = BaseResponse<TermsAndConditions[]>;
