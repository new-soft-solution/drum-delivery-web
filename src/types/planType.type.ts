import {BaseResponse, BaseResponseAll} from "@/types/global.type";

export interface PlanType {
    id: number;
    slug: string;
    uuid: string;
    code: string;
    name: string;
    description: string;
    base_price: string;
    is_active: boolean;
    features?: (FeaturesEntity)[] | [];
    updated_at: string;
    created_at: string;
}

export interface PlanTypeQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    is_popular?: boolean;
    is_active?: boolean;
    all?: boolean;
}

export interface FeaturesEntity {
    id: number;
    name: string;
    code: string;
}

export type PlanTypeResponse = BaseResponse<PlanType>;
export type PlanTypesResponse = BaseResponse<PlanType[]>;
export type PlanTypesResponseAll = BaseResponseAll<PlanType[]>;
