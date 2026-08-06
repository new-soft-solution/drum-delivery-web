import { dtApi } from "./client";
import type { DeleteProps } from "@/types/global.type";
import type { DTOrder, DTOrderListResponse, DTOrderQueryParams } from "@/types/drum-tracer/order.type";
import type { DTOrderFormValues } from "@/types/schemas/dt-order.schema";

export const getOrders = async (params: DTOrderQueryParams = {}): Promise<DTOrderListResponse> => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();
  return dtApi.get<DTOrderListResponse>(`orders?${qs}`);
};

export const createOrder = (data: DTOrderFormValues) => dtApi.post<DTOrder>("orders", data);

export const updateOrder = (id: number, data: Partial<DTOrderFormValues>) =>
  dtApi.put<DTOrder>(`orders/${id}`, data);

export const deleteOrder = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("orders/bulk-delete", { id, ids });
