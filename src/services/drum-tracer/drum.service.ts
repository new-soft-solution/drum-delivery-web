import { dtApi } from "./client";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { DTDrum, DTDrumListResponse, DTDrumQueryParams } from "@/types/drum-tracer/drum.type";
import type { DTDrumFormValues } from "@/types/schemas/dt-drum.schema";

export const getDrums = async (params: DTDrumQueryParams = {}): Promise<DTDrumListResponse> => {
  const qs = buildQueryParams(params).toString();
  return dtApi.get<DTDrumListResponse>(`drums?${qs}`);
};

export const createDrum = (data: DTDrumFormValues) => dtApi.post<DTDrum>("drums", data);

export const updateDrum = (id: number, data: Partial<DTDrumFormValues>) =>
  dtApi.put<DTDrum>(`drums/${id}`, data);

export const deleteDrum = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("drums/bulk-delete", { id, ids });
