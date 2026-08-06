import {BaseResponse, BaseResponseAll} from "@/types/global.type";

export interface Scope {
    id: number;
    name: string;
    permissions?: (PermissionsEntity)[] | [];
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
export interface PermissionsEntity {
    id: number;
    name: string;
    codename: string;
    description: string;
    content_type: string;
    content_type_display: string;
    is_active: boolean;
}
export interface ScopeQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    is_popular?: boolean;
    is_active?: boolean;
    all?: boolean;
}

export type ScopeResponse = BaseResponse<Scope>;
export type ScopesResponse = BaseResponse<Scope[]>;
export type ScopesResponseAll = BaseResponseAll<Scope[]>;

