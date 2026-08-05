import { z } from "zod";
import { BaseFilter } from "@/types/crud.type";

export interface GiftCardPackage {
  id: number;
  uuid: string;
  slug: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted: boolean;
  remarks: string;
  version: number;
  metadata: Record<string, unknown>;
  name: string;
  description: string;
  price: string;
  image: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface GiftCardPackageResponse {
  data: GiftCardPackage;
}

export interface GiftCardPackagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GiftCardPackage[];
}

export interface GiftCardPackageQueryParams {
  all?: boolean;
  is_active?: boolean;
  is_mobile?: boolean;
  name?: string;
  search?: string;
  ordering?: string;
  deleted?: string;
  page?: number;
  page_size?: number;
  price_max?: string;
  price_min?: string;
}
export interface GiftCardPackageFilterType extends BaseFilter {
  deleted: string | null;
}
export const giftCardPackageFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .or(z.number().min(0, "Price must be positive")),
  image: z.any().optional(),
  is_active: z.boolean().default(true),
  remarks: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type GiftCardPackageFormValues = z.infer<
  typeof giftCardPackageFormSchema
>;
