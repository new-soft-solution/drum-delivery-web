import { dtApi } from "./client";
import type { DeleteProps } from "@/types/global.type";
import type { DTDrum, DTDrumListResponse, DTDrumQueryParams } from "@/types/drum-tracer/drum.type";
import type { DTDrumFormValues } from "@/types/schemas/dt-drum.schema";

export const getDrums = async (params: DTDrumQueryParams = {}): Promise<DTDrumListResponse> => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();
  return dtApi.get<DTDrumListResponse>(`drums?${qs}`);
};

export const createDrum = (data: DTDrumFormValues) => dtApi.post<DTDrum>("drums", data);

export const updateDrum = (id: number, data: Partial<DTDrumFormValues>) =>
  dtApi.put<DTDrum>(`drums/${id}`, data);

export const deleteDrum = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("drums/bulk-delete", { id, ids });
