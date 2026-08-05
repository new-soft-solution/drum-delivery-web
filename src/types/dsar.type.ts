import { BaseResponse } from "@/types/global.type";
import { BaseFilter } from "./crud.type";

export type DSARRequestType =
  | "access"
  | "portability"
  | "erasure"
  | "rectification"
  | "restriction"
  | "objection";

export type DSARStatus =
  | "open"
  | "in_review"
  | "fulfilled"
  | "rejected"
  | "partial"
  | "cancelled";

export type DSARVerificationStatus = "pending" | "verified" | "failed";

export type DSARDecisionStatus = Exclude<DSARStatus, "open">;

export interface DSARUser {
  id: number;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  phone_number?: string | null;
}

export interface DSARCase {
  id: number;
  user: DSARUser | number | null;
  request_type: DSARRequestType;
  status: DSARStatus;
  verification_status: DSARVerificationStatus;

  requested_at: string;
  due_at?: string | null;
  reviewed_at?: string | null;
  decided_at?: string | null;
  fulfilled_at?: string | null;
  closed_at?: string | null;

  export_request_id?: number | null;
  decision_notes?: string | null;
  legal_basis_tags?: string[] | null;
  retention_outcome?: string | Record<string, unknown> | null;

  requested_by_ip?: string | null;
  requested_user_agent?: string | null;
  is_closed?: boolean;
}

export interface DSARQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  request_type?: string;
  status?: string;
  verification_status?: string;
}

export interface DSARFilterType extends BaseFilter {
  request_type: string | null;
  dsar_status: string | null;
  verification_status: string | null;
}

export interface DSARDecidePayload {
  status: DSARDecisionStatus;
  decision_notes?: string;
  legal_basis_tags?: string[];
}

export interface PaginatedDSAR {
  count: number;
  next: string | null;
  previous: string | null;
  results: DSARCase[];
}

export type DSARListResponse = BaseResponse<PaginatedDSAR>;
export type DSARSingleResponse = BaseResponse<DSARCase>;
