// Matches the real backend's Client schema exactly
// (drum-delivery-api.onrender.com — /api/clients/), confirmed from schema.yaml.

import type { PaginatedResponse } from "./global.type";

export interface Client {
  id: string; // uuid, read-only
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  client_id: string; // read-only, server-generated
  has_account: string | boolean; // read-only; whether the client can log in
  name: string;
  email: string;
  contact_person: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

/** `has_account` is typed as a string in the schema but may arrive as a boolean. */
export const clientHasAccount = (c: Pick<Client, "has_account">): boolean => {
  const v = c.has_account;
  if (typeof v === "boolean") return v;
  return ["true", "yes", "1"].includes(String(v ?? "").trim().toLowerCase());
};

export interface ClientListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  city?: string;
  country?: string;
  email?: string;
  name?: string;
  phone?: string;
}

export type ClientListResponse = PaginatedResponse<Client>;

export interface ClientFilterType {
  status?: string;
  city?: string;
  country?: string;
  [key: string]: unknown;
}
