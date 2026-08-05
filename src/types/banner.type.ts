import { BaseResponse } from "@/types/global.type";
import { DisplayLocation } from "./schemas/banner.schema";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  call_to_action_link?: string;
  call_to_action_text?: string;
  show_call_to_action: boolean;
  description?: string;
  status: "Active" | "Inactive" | "Expired";
  display_order: number;
  start_date: string;
  end_date: string;
  display_location: DisplayLocation;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface BannerQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
  all?: boolean;
  display_location?: DisplayLocation;
  display_order?: number;
  end_date?: string;
  end_date_range?: "month" | "today" | "week" | "year" | "yesterday";
  show_call_to_action?: boolean;
  start_date?: string;
  start_date_range?: "month" | "today" | "week" | "year" | "yesterday";
  status?: "Active" | "Inactive" | "Expired";
}

export type BannerResponse = BaseResponse<Banner>;
export type BannersResponse = BaseResponse<Banner[]>;
