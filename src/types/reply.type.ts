import { BaseResponse, BaseResponseAll } from "@/types/global.type";

export interface Reply {
  id: number;
  reply_text: string;
  replied_at: string;
  created_by_name: string;
  created_at: string;
  is_active: boolean;
}

export interface ReplyQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
  is_active?: boolean;
  all?: boolean;
}
export type ReplyResponse = BaseResponse<Reply>;
export type RepliesResponse = BaseResponse<Reply[]>;
export type RepliesResponseAll = BaseResponseAll<Reply[]>;
