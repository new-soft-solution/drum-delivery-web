import { BaseResponse, BaseResponseAll } from "@/types/global.type";
import { BaseFilter } from "@/types/crud.type";

export interface Rating {
  id: number;
  uuid: string;
  restaurant: Restaurant;
  reservation: Reservation;
  rating_remarks: string;
  rated_at: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  replies?: RepliesEntity[] | [];
  replies_count: number;
  likes_count: number;
  parameter_ratings?: ParameterRatingsEntity[] | [];
  is_liked: boolean;
  average_rating: string;
  updated_at: string;
  slug: string;
  is_active: boolean;
  images?: ImagesEntity[] | [];
  moderation_status: string;
  rejection_reason?: string;
}
export interface Restaurant {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  house_number: string;
  street_name: string;
}
export interface Reservation {
  id: number;
  reservation_date: string;
  reservation_time: string;
}
export interface RepliesEntity {
  id: number;
  uuid: string;
  reply_text: string;
  replied_at: string;
  created_by: number;
  created_by_name: string;
}
export interface ParameterRatingsEntity {
  id: number;
  parameter: string;
  value: number;
}
export interface ImagesEntity {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  created_by_type: string;
  updated_at: string;
  created_at: string;
  slug: string;
  uuid: string;
  is_active: boolean;
}
export interface RatingQueryParams {
  page?: number;
  page_size?: number;
  restaurant?: number;
  search?: string;
  moderation_status?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
}
export interface RatingFilterType extends BaseFilter {
  restaurant: number | null;
  moderation_status: string | null;
}
export type RatingResponse = BaseResponse<Rating>;
export type RatingsResponse = BaseResponse<Rating[]>;
export type RatingsResponseAll = BaseResponseAll<Rating[]>;
