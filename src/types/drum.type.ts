// src/types/drum.type.ts
import type { PaginatedResponse } from "./global.type";

// Matches the real backend's Drum schema exactly
// (drum-delivery-api.onrender.com — /api/drums/), confirmed from schema.yaml.

export type DrumStatus =
  | "AVAILABLE"
  | "IN_ORDER"
  | "IN_SHIPMENT"
  | "DELIVERED"
  | "MISSING"
  | "DAMAGED";

export const DRUM_STATUS_OPTIONS: DrumStatus[] = [
  "AVAILABLE",
  "IN_ORDER",
  "IN_SHIPMENT",
  "DELIVERED",
  "MISSING",
  "DAMAGED",
];

export const DRUM_STATUS_LABELS: Record<DrumStatus, string> = {
  AVAILABLE: "Available",
  IN_ORDER: "In Order",
  IN_SHIPMENT: "In Shipment",
  DELIVERED: "Delivered",
  MISSING: "Missing",
  DAMAGED: "Damaged",
};

export interface Drum {
  id: string; // uuid, read-only
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  drum_number: string;
  // NOTE: these three are DRF DecimalFields, serialized as STRINGS
  // (e.g. "1.736"), not JSON numbers — confirmed by the schema's
  // `format: decimal` + regex pattern. Keep them as strings end-to-end
  // (form inputs, display) rather than coercing to number, so precision
  // isn't silently lost and the exact string round-trips back to the API.
  length_kms: string;
  net_weight_mt: string;
  gross_weight_mt: string;
  status: DrumStatus;
  container_no?: string | null;
  notes?: string | null;
}

export interface DrumListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export type DrumListResponse = PaginatedResponse<Drum>;

export interface DrumFilterType {
  status?: string;
  [key: string]: unknown;
}
