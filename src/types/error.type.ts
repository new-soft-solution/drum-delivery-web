export interface ServerError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
  success: boolean;
}

import { AxiosError } from "axios";

export type ApiErrorResponse = {
  message?: string | string[];
  errors?: Record<string, string[]>;
  statusCode?: number;
};

export type NormalizedError = {
  message: string;
  special?: string | undefined | unknown;
  status: number;
  isClientError: boolean;
  /** DRF-style per-field validation errors. Values are typically:
   *   - `string[]` for scalar fields, e.g.
   *     `{ amenities_ids: ["Maximum amenities allowed is 5."] }`
   *   - `Array<Record<string, string[]>>` for nested writes (one entry per
   *     submitted row), e.g.
   *     `{ menu_addons: [{ price: ["This field may not be null."] }, {}] }`
   * Generic non-field entries arrive under `__all__` / `non_field_errors` /
   * `detail` and should be promoted to a form-level message by the caller. */
  errors?: Record<string, unknown>;
};

export type ApiResponseError = AxiosError<ApiErrorResponse>;
