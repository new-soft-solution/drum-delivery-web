import { dtApi } from "./client";
import { buildQueryParams } from "@/utils/build-query-params";
import type { DeleteProps } from "@/types/global.type";
import type { DTSite, DTSiteListResponse, DTSiteQueryParams } from "@/types/drum-tracer/site.type";
import type { DTSiteFormValues } from "@/types/schemas/dt-site.schema";

export const getSites = async (params: DTSiteQueryParams = {}): Promise<DTSiteListResponse> => {
  const qs = buildQueryParams(params).toString();
  return dtApi.get<DTSiteListResponse>(`sites?${qs}`);
};

export const createSite = (data: DTSiteFormValues) => dtApi.post<DTSite>("sites", data);

export const updateSite = (id: number, data: Partial<DTSiteFormValues>) =>
  dtApi.put<DTSite>(`sites/${id}`, data);

export const deleteSite = ({ id, ids }: DeleteProps) =>
  dtApi.post<void>("sites/bulk-delete", { id, ids });
