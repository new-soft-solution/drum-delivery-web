import {BaseResponse, BaseResponseAll} from "@/types/global.type";

export interface Permission {
    id: number;
    name: string;
    codename: string;
    description: string;
    content_type: string;
    content_type_display: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PermissionQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    is_popular?: boolean;
    is_active?: boolean;
    all?: boolean;
}

export type PermissionResponse = BaseResponse<Permission>;
export type PermissionsResponse = BaseResponse<Permission[]>;
export type PermissionsResponseAll = BaseResponseAll<Permission[]>;
