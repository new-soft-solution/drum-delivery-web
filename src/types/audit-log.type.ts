import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "./crud.type";

export interface AuditLog {
  id: number;
  event: string;
  status: string;
  actor: number;
  actor_email: string;
  actor_object: ActorObject;
  tenant: number;
  tenant_email: string;
  tenant_object: TenantObject;
  target_type: string;
  target_object_id: string;
  target_repr: string;
  ip_address: string;
  user_agent: string;
  metadata: Metadata;
  created_at: string;
}
export interface ActorObject {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_superuser: boolean;
  avatar: string;
}
export interface TenantObject {
  id: number;
  name?: null;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_superuser: boolean;
}
export interface Metadata {
  has_accepted_agreements?: boolean | null;
  new_status?: string | null;
  old_status?: string | null;
  rejection_reason?: null;
}
export interface AuditLogQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
  created_at_before?: string;
  created_at_after?: string;
  event?: string;
  status?: string;
  employee?: number;
}
export interface AuditLogFilterType extends BaseFilter {
  created_at_before: string | null;
  created_at_after: string | null;
  event: string | null;
  audit_status: string | null;
  employee: number | null;
}
export type AuditLogResponse = BaseResponse<AuditLog>;
export type AuditLogsResponse = BaseResponse<AuditLog[]>;
export type AuditLogsResponseAll = BaseResponseAll<AuditLog[]>;
export type eventsDropdownResponseAll = {
  status: number;
  success: boolean;
  message: string;
  data: Data;
};
export interface Data {
  events: EventsEntity[] | [];
}
export interface EventsEntity {
  value: string;
  label: string;
}
