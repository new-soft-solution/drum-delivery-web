import { BaseFilter } from "@/types/crud.type";

export interface SoftDeleteFilterType extends BaseFilter {
  deleted: string | null;
}
