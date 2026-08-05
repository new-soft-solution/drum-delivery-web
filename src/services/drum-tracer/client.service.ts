import { dtApi } from "./client";
import type { DeleteProps } from "@/types/global.type";
import type {
  DTClient,
  DTClientListResponse,
  DTClientQueryParams,
} from "@/types/drum-tracer/client.type";
import type { DTClientFormValues } from "@/types/schemas/dt-client.schema";

export const getClients = async (
  params: DTClientQueryParams = {},
): Promise<DTClientListResponse> => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();
  return dtApi.get<DTClientListResponse>(`clients?${qs}`);
};

export const createClient = (data: DTClientFormValues) =>
  dtApi.post<DTClient>("clients", data);

export const updateClient = (id: number, data: Partial<DTClientFormValues>) =>
  dtApi.put<DTClient>(`clients/${id}`, data);

export const deleteClient = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("clients/bulk-delete", { id, ids });
