"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { ClientDetails } from "./ClientDetails";
import { ClientForm } from "./ClientForm";
import ClientFilter from "./ClientFilter";
import ClientOrdersModal from "./ClientOrdersModal";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteClient, getClients } from "@/services/client.service";
import { Client, ClientFilterType } from "@/types/client.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import Link from "next/link";
import { CRUDTableState } from "@/types/crud.type";
import Avatar from "@/components/ui/Avatar/Avatar";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  ExportColumn,
  ExportMeta,
  exportToExcel,
  exportToPdf,
} from "@/utils/report-export";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button } from "react-bootstrap";
import { useModulePermissions } from "@/utils/permissions";

const EXPORT_COLUMNS: ExportColumn<Client>[] = [
  {
    header: "Client ID",
    value: (c) => c.client_id,
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  { header: "Client Name", value: (c) => c.name, xlsxWidth: 24, pdfWidth: 90 },
  {
    header: "Contact Person",
    value: (c) => c.contact_person,
    xlsxWidth: 22,
    pdfWidth: 80,
  },
  { header: "Email", value: (c) => c.email, xlsxWidth: 28, pdfWidth: 100 },
  { header: "Phone", value: (c) => c.phone || "", xlsxWidth: 16, pdfWidth: 70 },
  {
    header: "Address",
    value: (c) => c.address || "",
    xlsxWidth: 26,
    pdfWidth: 90,
  },
  { header: "City", value: (c) => c.city || "", xlsxWidth: 16, pdfWidth: 60 },
  { header: "State", value: (c) => c.state || "", xlsxWidth: 16, pdfWidth: 60 },
  {
    header: "Country",
    value: (c) => c.country || "",
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  {
    header: "Postal Code",
    value: (c) => c.postal_code || "",
    xlsxWidth: 14,
    pdfWidth: 55,
  },
  {
    header: "Status",
    value: (c) => (c.is_active ? "Active" : "Inactive"),
    xlsxWidth: 12,
    pdfWidth: 50,
  },
];

export const ClientTable = () => {
  const queryClient = useQueryClient();
  const [viewOrdersClient, setViewOrdersClient] = useState<Client | null>(null);
  const { canAdd, canView, canChange, canDelete } =
    useModulePermissions("clients");
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
    handleDelete,
    handleEdit,
    handleViewDetails,
  } = useCRUDTable<Client>("clients", deleteClient, {
    isEdit: canChange,
    isView: canView,
    isDelete: canDelete,
    showCheckBox: canDelete,
  });

  const params = {
    ...buildQueryParams(),
    search: state.globalFilter || undefined,
    ...state.filters,
    ordering: state.sorting?.length
      ? `${state.sorting[0].desc ? "-" : ""}${state.sorting[0].id}`
      : undefined,
  };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["clients", params],
    queryFn: () =>
      getClients({
        search: params.search,
        ordering: params.ordering,
        city: state.filters.city as string | undefined,
        country: state.filters.country as string | undefined,
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

  // NOTE: exports cover whatever page is currently loaded, not the full
  // dataset — /api/clients/ is paginated and there's no "give me
  // everything" endpoint to export against instead.
  const filtersLine = [
    state.globalFilter ? `Search: ${state.globalFilter}` : null,
    state.filters.city ? `City: ${state.filters.city}` : null,
    state.filters.country ? `Country: ${state.filters.country}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const handleExcelExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Clients",
      fileBaseName: "clients",
      generatedAt: new Date(),
      filtersLine: filtersLine || undefined,
    };
    await exportToExcel(rows, EXPORT_COLUMNS, meta, { sheetName: "Clients" });
  }, [rows, filtersLine]);

  const handlePdfExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Clients",
      fileBaseName: "clients",
      generatedAt: new Date(),
      filtersLine: filtersLine || undefined,
    };
    await exportToPdf(rows, EXPORT_COLUMNS, meta, { useColumnWidths: true });
  }, [rows, filtersLine]);

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      {
        header: "Client Name",
        accessorKey: "name",
        cell: (cell: CellContext<Client, unknown>) => (
          <Link
            href="#"
            className="fw-bold text-decoration-none d-flex align-items-center gap-2 text-dark"
          >
            <Avatar name={cell.getValue<string>()} size={30} />
            {cell.getValue<string>()}
          </Link>
        ),
      },
      { header: "Contact Person", accessorKey: "contact_person" },
      { header: "Email", accessorKey: "email" },
      {
        header: "Location",
        cell: (cell: CellContext<Client, unknown>) => {
          const c = cell.row.original;
          return (
            <span className="text-muted">
              {[c.city, c.country].filter(Boolean).join(", ") || "—"}
            </span>
          );
        },
      },
      {
        header: "Status",
        cell: (cell: CellContext<Client, unknown>) => (
          <StatusBadge
            status={cell.row.original.is_active ? "Active" : "Inactive"}
          />
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: { row: { original: Client } }) => {
          return (
            <div className="d-flex align-items-center gap-2">
              {canView && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleViewDetails(row.original)}
                >
                  <IconifyIcon icon="mdi:eye-outline" />
                </Button>
              )}
              {canChange && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleEdit(row.original)}
                >
                  <IconifyIcon icon="mdi:pencil-outline" />
                </Button>
              )}
              {canView && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setViewOrdersClient(row.original)}
                  title="View this client's orders"
                >
                  <IconifyIcon icon="ri:clipboard-line" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger"
                  onClick={() => handleDelete(row.original)}
                >
                  <IconifyIcon icon="mdi:trash-can-outline" />
                </Button>
              )}
            </div>
          );
        },
      },
      // ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: ClientFilterType = {};

  return (
    <>
      <CRUDTable<Client, ClientFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<Client, ClientFilterType>}
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
          entityName: "Client",
          tableHeader: "All Clients",
          filterOptions: { initialFilters, filterComponent: ClientFilter },
        }}
        isPdfExport={rows.length > 0}
        isExcelExport={rows.length > 0}
        onPdfExport={handlePdfExport}
        onExcelExport={handleExcelExport}
      />

      <DetailsModal<Client>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["clients"] })
        }
        viewComponent={({ item }) => <ClientDetails client={item} />}
        formComponent={ClientForm}
        entityName="Client"
      />
      <ClientOrdersModal
        show={!!viewOrdersClient}
        onHide={() => setViewOrdersClient(null)}
        client={viewOrdersClient}
      />
    </>
  );
};

export default ClientTable;
