import {BaseResponse, BaseResponseAll} from "@/types/global.type";

export interface Tag {
    id: number;
    name: string;
    color: string;
    slug: string;
    uuid: string;
    updated_at: string;
    created_at: string;
    is_active: boolean;
}

export interface TagQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    is_popular?: boolean;
    is_active?: boolean;
    all?: boolean;
}

export type TagResponse = BaseResponse<Tag>;
export type TagsResponse = BaseResponse<Tag[]>;
export type TagsResponseAll = BaseResponseAll<Tag[]>;
