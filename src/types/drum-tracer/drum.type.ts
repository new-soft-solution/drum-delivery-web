import { BaseFilter } from "@/types/crud.type";

export type DrumStatus = "Available" | "In Transit" | "Missing";

export interface DTDrum {
  id: number;
  drum_number: string;
  container_number: string;
  length_km: number;
  net_weight_mt: number;
  gross_weight_mt: number;
  status: DrumStatus;
  shipment_id?: number | null;
  notes?: string;
  last_updated: string;
}

export interface DTDrumQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  assignment?: string;
}

export interface DTDrumFilterType extends BaseFilter {
  status?: string;
}

export type DTDrumListResponse = { results: DTDrum[]; count: number };
