import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  TableOptions,
  VisibilityState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { NormalizedError } from "./error.type";

export type ChildrenType = Readonly<{ children: ReactNode }>;

export type BootstrapVariantType =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark"
  | "light";

export type ComponentContainerProps = {
  title: string;
  children: ReactNode;
  className?: string;
  handleMode?: () => void;
};

export type ReactTableProps<RowType> = {
  options?: Partial<TableOptions<RowType>>;
  columns: ColumnDef<RowType>[];
  data: RowType[];
  count?: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  showPagination?: boolean;
  rowsPerPageList?: number[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  tableClass?: string;
  theadClass?: string;
  isFetching?: boolean;
  error?: NormalizedError;
  renderTopToolbar?: (table: Table<RowType>) => React.ReactNode;
  renderBottomToolbar?: (table: Table<RowType>) => React.ReactNode;
  getRowClassName?: (
    row: import("@tanstack/react-table").Row<RowType>,
  ) => string;
  enableDragDrop?: boolean;
  onDragEnd?: (sourceIndex: number, destinationIndex: number) => void;
  isDragDisabled?: boolean;
  // Optional row-click handler. The table wires it on <tr> but guards against
  // descendants that already carry their own click behavior (buttons, links,
  // form controls, menus) so checkboxes, action icons and inline dropdowns
  // continue to work without interference.
  onRowClick?: (row: RowType) => void;
  // When provided, the matching row gets a `row-active` class — used by the
  // reservations table to highlight the row whose side drawer is currently
  // open.
  activeRowId?: string | number | null;
};

export type ReactTablePaginationProps<RowType> = {
  table: Table<RowType>;
  rowsPerPageList?: number[];
  currentPage: number;
  totalPages: number;
  pagination: PaginationState;
  count?: number;
};

export type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  id?: string;
  containerClassName?: string;
  label?: string | ReactNode;
  placeholder?: string;
  noValidate?: boolean;
  labelClassName?: string;
};
