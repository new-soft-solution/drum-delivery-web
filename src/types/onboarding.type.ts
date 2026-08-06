import { BaseResponse } from "@/types/global.type";

export type FieldInputKind =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "integer"
  | "decimal"
  | "boolean"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "multiselect"
  | "collection"
  | "integration"
  | "image"
  | "file"
  | string;

export type FieldOption = {
  value: string | number;
  label: string;
};

export interface OnboardingField {
  key: string;
  label: string;
  required_for_publish: boolean;
  can_skip: boolean;
  countable: boolean;
  min_count: number | null;
  current_count: number | null;
  is_completed: boolean;
  is_publish_blocker: boolean;
  input_kind: FieldInputKind;
  route_hint?: string | null;
  current_value?: unknown;
  options?: FieldOption[];
  help_text?: string | null;
  placeholder?: string | null;
}

export interface OnboardingStep {
  key: string;
  label: string;
  order: number;
  is_locked: boolean;
  required_total: number;
  required_completed: number;
  required_completion_percentage: number;
  total_fields: number;
  completed_fields: number;
  completion_percentage: number;
  missing_required_keys: string[];
  fields: OnboardingField[];
}

export interface OnboardingBlockerDetail {
  missing_required?: string[];
  [k: string]: unknown;
}

export interface OnboardingBlocker {
  code: string;
  message: string;
  details?: OnboardingBlockerDetail;
}

export interface OnboardingActor {
  id: number;
  email: string;
  role: string;
  full_name: string;
}

export interface OnboardingAgreement {
  accepted: boolean;
  details?: {
    id: number;
    agreement_version: string;
    accepted_at: string;
    pdf_url: string;
  } | null;
}

export interface OnboardingProgress {
  required_total: number;
  required_completed: number;
  required_completion_percentage: number;
  all_fields_total: number;
  all_fields_completed: number;
  all_fields_completion_percentage: number;
}

export interface OnboardingState {
  status: string;
  onboarding_state: string;
  onboarding_state_updated_at: string | null;
  onboarding_started_at: string | null;
  onboarding_completed_at: string | null;
  owner_review_requested_at: string | null;
  owner_review_completed_at: string | null;
  published_at: string | null;
  agreement: OnboardingAgreement;
  progress: OnboardingProgress;
  missing_required: string[];
  publish_blockers: OnboardingBlocker[];
  quality_score: number;
  owner_review_required: boolean;
  can_request_owner_review: boolean;
  can_publish_now: boolean;
  // Sales-side review/publish gating flags from the backend. The button is
  // enabled when either of these is true: `trigger` covers the initial send,
  // `resend` covers re-sending after an existing token is in flight.
  can_trigger_sales_review_and_publish?: boolean;
  can_resend_sales_review_and_publish?: boolean;
  can_current_actor_update_onboarding?: boolean;
  next_action: string;
  assigned_salesperson?: OnboardingActor | null;
}

export interface OnboardingActors {
  current_actor: OnboardingActor | null;
  registered_by?: OnboardingActor | null;
  last_updated_by?: OnboardingActor | null;
  current_actor_has_global_access?: boolean;
}

export interface OnboardingWorkflow {
  locked_until_agreement_accepted: boolean;
  can_edit_profile_on_behalf: boolean;
  next_required_step_key: string | null;
  assignment_locked_to_salesperson: boolean;
  owner_review_required_before_live: boolean;
  acceptance_channel?: {
    resolve_agreement_endpoint?: string;
    accept_agreement_endpoint?: string;
    owner_review_preview_endpoint?: string;
    owner_publish_endpoint?: string;
  };
}

export interface OnboardingGuidanceRule {
  code: string;
  description: string;
  active: boolean;
}

export interface OnboardingSchema {
  version: string;
  restaurant: {
    id: number;
    slug: string;
    name: string;
  };
  steps: OnboardingStep[];
  publish_rule_source?: {
    has_active_rules: boolean;
    rule_count: number;
  };
}

export interface OnboardingBlueprint {
  version: string;
  schema: OnboardingSchema;
  state: OnboardingState;
  actors: OnboardingActors;
  workflow: OnboardingWorkflow;
  guidance_rules: OnboardingGuidanceRule[];
}

export type OnboardingBlueprintResponse = BaseResponse<OnboardingBlueprint>;

export type OnboardingUpdatePayload = Record<string, unknown>;

export interface OnboardingUploadedImage {
  id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
}

export interface OnboardingUploadedMenuFile {
  id: number;
  title: string;
  file_url: string;
  is_primary: boolean;
}

export interface RequestOwnerReviewResponse {
  onboarding_state: string;
  owner_review_requested_at: string;
  token_expires_at: string;
}

export interface PublishOnboardingResult {
  restaurant_id: number;
  slug: string;
  status: string;
  onboarding_state: string;
  published_at: string;
}
