"use client";
import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserDetails } from "./UserDetails";
import { UserForm } from "./UserForm";
import UserFilter from "./UserFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteUser, getUsers } from "@/services/user.service";
import { User, UserFilterType } from "@/types/user.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CRUDTableState } from "@/types/crud.type";
import { CellContext } from "@tanstack/react-table";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Avatar from "@/components/ui/Avatar/Avatar";
import { formatDateNL } from "@/utils/dateFormatter";
import {
  ExportColumn,
  ExportMeta,
  exportToExcel,
  exportToPdf,
} from "@/utils/report-export";
import { useModulePermissions } from "@/utils/permissions";

const EXPORT_COLUMNS: ExportColumn<User>[] = [
  {
    header: "Full Name",
    value: (u) => [u.first_name, u.last_name].filter(Boolean).join(" "),
    xlsxWidth: 24,
    pdfWidth: 90,
  },
  { header: "Email", value: (u) => u.email, xlsxWidth: 28, pdfWidth: 100 },
  { header: "Username", value: (u) => u.username, xlsxWidth: 20, pdfWidth: 75 },
  { header: "Role", value: (u) => u.role || "", xlsxWidth: 16, pdfWidth: 60 },
  {
    header: "Status",
    value: (u) => (u.is_active ? "Active" : "Inactive"),
    xlsxWidth: 12,
    pdfWidth: 50,
  },
  {
    header: "Staff",
    value: (u) => (u.is_staff ? "Yes" : "No"),
    xlsxWidth: 10,
    pdfWidth: 40,
  },
  {
    header: "Joined",
    value: (u) => formatDateNL(u.date_joined),
    xlsxWidth: 16,
    pdfWidth: 60,
  },
];

export const UserTable = () => {
  const queryClient = useQueryClient();
  const { canAdd, canView, canChange, canDelete } =
    useModulePermissions("users");
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<User>("users", deleteUser, {
    isEdit: canChange,
    isView: canView,
    isDelete: canDelete,
    showCheckBox: canDelete,
  });

  const params = { ...buildQueryParams(), ...state.filters };
  // /api/users/ (confirmed) only supports page, page_size, and role as
  // query params — no generic `search` or `ordering` like the other
  // entities, so the table's search box is disabled below (searchDisable)
  // rather than pretending to filter server-side with a param that
  // doesn't exist.
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["users", params],
    queryFn: () =>
      getUsers({
        role: state.filters.role as string | undefined,
        page:
          typeof state.pagination?.pageIndex === "number"
            ? state.pagination.pageIndex + 1
            : 1,
        page_size:
          typeof state.pagination?.pageSize === "number"
            ? state.pagination.pageSize
            : 10,
      }),
    staleTime: 1000 * 60,
  });

  const rows = data?.results || [];

  const filtersLine = state.filters.role
    ? `Role: ${state.filters.role}`
    : undefined;

  const handleExcelExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Users",
      fileBaseName: "users",
      generatedAt: new Date(),
      filtersLine,
    };
    await exportToExcel(rows, EXPORT_COLUMNS, meta, { sheetName: "Users" });
  }, [rows, filtersLine]);

  const handlePdfExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Users",
      fileBaseName: "users",
      generatedAt: new Date(),
      filtersLine,
    };
    await exportToPdf(rows, EXPORT_COLUMNS, meta, { useColumnWidths: true });
  }, [rows, filtersLine]);

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      {
        header: "User",
        cell: (cell: CellContext<User, unknown>) => {
          const u = cell.row.original;
          const fullName =
            [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
          return (
            <span className="d-flex align-items-center gap-2">
              <Avatar name={fullName} size={30} />
              <span>
                <span className="fw-bold d-block">{fullName}</span>
                <span className="text-muted small">{u.email}</span>
              </span>
            </span>
          );
        },
      },
      { header: "Username", accessorKey: "username" },
      {
        header: "Role",
        cell: (cell: CellContext<User, unknown>) =>
          cell.row.original.role || <span className="text-muted">—</span>,
      },
      {
        header: "Status",
        cell: (cell: CellContext<User, unknown>) => (
          <StatusBadge
            status={cell.row.original.is_active ? "Active" : "Inactive"}
          />
        ),
      },
      {
        header: "Joined",
        cell: (cell: CellContext<User, unknown>) =>
          formatDateNL(cell.row.original.date_joined),
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: UserFilterType = {};

  return (
    <>
      <CRUDTable<User, UserFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<User, UserFilterType>}
        onPaginationChange={(pagination) =>
          setState((prev) => ({
            ...prev,
            pagination:
              typeof pagination === "function"
                ? pagination(prev.pagination)
                : pagination,
          }))
        }
        onSortingChange={(sorting) =>
          setState((prev) => ({
            ...prev,
            sorting:
              typeof sorting === "function" ? sorting(prev.sorting) : sorting,
          }))
        }
        onGlobalFilterChange={(filter) =>
          setState((prev) => ({ ...prev, globalFilter: filter }))
        }
        onRowSelectionChange={(selection) =>
          setState((prev) => ({
            ...prev,
            rowSelection:
              typeof selection === "function"
                ? selection(prev.rowSelection)
                : selection,
          }))
        }
        onFilterChange={(filters) => setState((prev) => ({ ...prev, filters }))}
        onAddItem={canAdd ? handleAddItem : undefined}
        onBulkDelete={(ids) => handleBulkDelete(ids)}
        options={{
          entityName: "User",
          tableHeader: "All Users",
          searchDisable: true,
          filterOptions: { initialFilters, filterComponent: UserFilter },
        }}
        isPdfExport={rows.length > 0}
        isExcelExport={rows.length > 0}
        onPdfExport={handlePdfExport}
        onExcelExport={handleExcelExport}
      />

      <DetailsModal<User>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
        viewComponent={({ item }) => <UserDetails user={item} />}
        formComponent={UserForm}
        entityName="User"
      />
    </>
  );
};

export default UserTable;
