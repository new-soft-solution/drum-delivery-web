import {BaseResponse, BaseResponseAll} from "@/types/global.type";
import {BaseFilter} from "@/types/crud.type";

export interface Table {
    id: number;
    uuid: string;
    slug: string;
    name: string;
    capacity: number;
    status: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface TableQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    is_active?: boolean;
    all?: boolean;
}

export interface TableFilterType extends BaseFilter {
    status?: string;
}

export type TableResponse = BaseResponse<Table>;
export type TablesResponse = BaseResponse<Table[]>;
export type TablesResponseAll = BaseResponseAll<Table[]>;
