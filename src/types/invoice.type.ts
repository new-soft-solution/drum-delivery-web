import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Invoice {
  id: number;
  uuid: string;
  invoice_number: string;
  invoice_date: string;
  invoice_period: string;
  restaurant: Restaurant;
  subtotal_amount: string;
  vat_amount: string;
  total_amount: string;
  is_paid: boolean;
  paid_at: string;
  created_at: string;
}

export interface InvoiceQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  is_paid?: boolean;
  restaurant?: number;
  month?: string;
}
export interface Restaurant {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  street_name: string;
  primary_images?: PrimaryImagesEntity[] | null;
  updated_at: string;
  slug: string;
  uuid: string;
  created_at: string;
  is_active: boolean;
}
export interface PrimaryImagesEntity {
  id: number;
  image: string;
  alt_text: string;
  updated_at: string;
  slug: string;
  uuid: string;
  created_at: string;
  is_active: boolean;
}
export interface InvoiceFilterType extends BaseFilter {
  is_paid: boolean | null;
  restaurant: number | null;
  month?: string | null;
  // Add more filter fields as needed
  // date?: Date;
  // dateRange?: { start: Date; end: Date };
  // etc...
}
export type InvoiceResponse = BaseResponse<Invoice>;
export type InvoicesResponse = BaseResponse<Invoice[]>;
export type InvoicesResponseAll = BaseResponseAll<Invoice[]>;
