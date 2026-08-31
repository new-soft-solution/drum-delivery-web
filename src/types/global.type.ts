import { CURDModalMode } from "./crud.type";

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

/**
 * Standard Django REST Framework pagination envelope — no `success`/`data`
 * wrapper, just `{count, next, previous, results}` directly at the
 * response root. This is the *confirmed* shape (via schema.yaml) of every
 * list endpoint on drum-delivery-api.onrender.com (Clients, Orders). It's
 * intentionally a separate type from `BaseResponse<T>` above rather than
 * reusing it: `BaseResponse` models a different backend's `{success,
 * message, data}` envelope convention, and forcing that shape onto this
 * backend's actual (flatter) responses would silently break parsing.
 */
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
};

export type DeleteProps = {
  id?: number | string;
  ids?: (number | string)[];
};
