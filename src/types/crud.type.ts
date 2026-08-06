import {
  ColumnDef,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { NormalizedError } from "./error.type";
import type { ComponentType, JSX, ReactElement } from "react";

// Base filter interface that all filters should extend
export interface BaseFilter {
  status?: string;
  [key: string]: unknown;
}

export type CURDModalMode = "view" | "edit" | "create";

// Consolidated CRUDTableState with all necessary properties
export interface CRUDTableState<T, TFilters extends BaseFilter = BaseFilter> {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  rowSelection: RowSelectionState;
  filters: TFilters;
  columnVisibility: VisibilityState;
  modalState: {
    showViewEditModal: boolean;
    mode: CURDModalMode;
    selectedItem: T | null;
  };
}

// CRUDTableOptions with proper filter typing
export interface CRUDTableOptions<TFilters extends BaseFilter = BaseFilter> {
  entityName?: string;
  onlyEntityAdd?: boolean;
  customAddIcon?: ReactElement;
  tableHeader?: string;
  headerClass?: string;
  searchDisable?: boolean;
  isColumnSelector?: boolean;
  filterOptions?: {
    initialFilters: TFilters;
    filterComponent: ComponentType<{
      tempFilters: TFilters;
      onTempFilterChange: (filters: TFilters) => void;
    }>;
  };
}

// Query parameters for API calls
export interface CRUDQueryParams<TFilters extends BaseFilter = BaseFilter> {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  filters?: TFilters;
}

// Main CRUDTable props interface
export interface CRUDTableProps<T, TFilters extends BaseFilter = BaseFilter> {
  data: T[];
  count?: number;
  isLoading: boolean;
  error: NormalizedError | null;
  columns: ColumnDef<T>[];
  state: CRUDTableState<T, TFilters>;
  onPaginationChange: (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState),
  ) => void;
  onSortingChange: (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState),
  ) => void;
  onGlobalFilterChange: (filter: string) => void;
  onRowSelectionChange: (
    updaterOrValue:
      | RowSelectionState
      | ((old: RowSelectionState) => RowSelectionState),
  ) => void;
  onFilterChange?: (filters: TFilters) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onAddItem?: () => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkRestore?: (ids: number[]) => void;
  getRowClassName?: (row: Row<T>) => string;
  selectedActions?: JSX.Element;
  options?: CRUDTableOptions<TFilters>;
  isPdfExport?: boolean;
  isExcelExport?: boolean;
  excelExportLoading?: boolean;
  isCustomElement?: boolean;
  customElements?: React.ReactNode[];
  onPdfExport?: () => void;
  onExcelExport?: () => void;
  isImport?: boolean;
  onImport?: () => void;
  enableDragDrop?: boolean;
  onDragEnd?: (sourceIndex: number, destinationIndex: number) => void;
  isDragDisabled?: boolean;
  showPagination?: boolean;
  tableMaxHeight?: string;
  onRowClick?: (row: T) => void;
  activeRowId?: string | number | null;
}
