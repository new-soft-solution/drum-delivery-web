import { authApi, handleApiError } from "./api";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { User, UserListParams, UserListResponse } from "@/types/user.type";
import type { UserFormValues } from "@/types/schemas/user.schema";

export const getUsers = async (
  params: UserListParams = {},
): Promise<UserListResponse> => {
  try {
    const queryParams = buildQueryParams(params).toString();
    const response = await authApi.get(`/api/users/?${queryParams}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUser = async (id: number): Promise<User> => {
  try {
    const response = await authApi.get(`/api/users/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

const cleanPayload = (data: Partial<UserFormValues>) => {
  const { password, ...rest } = data;
  return { ...rest, ...(password ? { password } : {}) };
};

export const createUser = async (data: UserFormValues): Promise<User> => {
  try {
    const response = await authApi.post("/api/users/", cleanPayload(data));
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUser = async (
  id: number,
  data: Partial<UserFormValues>,
): Promise<User> => {
  try {
    const response = await authApi.patch(
      `/api/users/${id}/`,
      cleanPayload(data),
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteUser = async ({ id, ids }: DeleteProps): Promise<void> => {
  try {
    if (id) {
      await authApi.delete(`/api/users/${id}/`);
      return;
    }
    if (ids && ids.length) {
      await Promise.all(
        ids.map((userId) => authApi.delete(`/api/users/${userId}/`)),
      );
      return;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
