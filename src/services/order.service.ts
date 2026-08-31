import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { Order, OrderListParams, OrderListResponse } from "@/types/order.type";
import type { OrderFormValues } from "@/types/schemas/order.schema";

export const getOrders = async (params: OrderListParams = {}): Promise<OrderListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/orders/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getOrder = async (id: string): Promise<Order> => {
  try {
    const response = await authApi.get(`/api/orders/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createOrder = async (data: OrderFormValues): Promise<Order> => {
  try {
    const response = await authApi.post("/api/orders/", data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateOrder = async (id: string, data: Partial<OrderFormValues>): Promise<Order> => {
  try {
    const response = await authApi.patch(`/api/orders/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteOrder = async ({ id, ids }: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/orders/${id}/`);
      return;
    }
    if (ids && ids.length) {
      // Same caveat as clients' bulk_delete — see client.service.ts.
      await authApi.post("/api/orders/bulk_delete/", { ids });
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
