import { BaseResponse } from "@/types/global.type";

export interface Contract {
  id: number;
  full_name: string;
  email: string;
  name?: string;
  phone: string;
  message: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ContractQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  deleted?: string;
}

export type ContractResponse = BaseResponse<Contract>;
export type ContractsResponse = BaseResponse<Contract[]>;
