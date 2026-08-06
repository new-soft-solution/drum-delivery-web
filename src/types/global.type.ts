import { CURDModalMode } from "./crud.type";
import { Restaurant } from "./restaurant.type";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseResponse<T = any> = {
  success: boolean;
  message: string;
  count?: number;
  data?: T;
  results?: T;
  errors?: Record<string, string[]>;
};

export type BaseResponseAll<T> = {
    status: number;
    success: boolean;
    message: string;
    data: T;
};
export type PaginatedData<T> = {
  results: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ModalState = {
  showReject?: boolean;
  showDetails: boolean;
  detailsMode?: CURDModalMode;
  selectedRestaurant?: Restaurant | null;
};

export type DeleteProps = {
  id?: number;
  ids?: number[];
};
