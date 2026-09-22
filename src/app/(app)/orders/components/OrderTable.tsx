"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { OrderDetails } from "./OrderDetails";
import { OrderForm } from "./OrderForm";
import OrderFilter from "./OrderFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteOrder, getOrders } from "@/services/order.service";
import { Order, OrderFilterType } from "@/types/order.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Avatar from "@/components/ui/Avatar/Avatar";
import {
  ExportColumn,
  ExportMeta,
  exportToExcel,
  exportToPdf,
} from "@/utils/report-export";
import { formatDateNL } from "@/utils/dateFormatter";
import { useModulePermissions } from "@/utils/permissions";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const EXPORT_COLUMNS: ExportColumn<Order>[] = [
  {
    header: "Order Number",
    value: (o) => o.order_number,
    xlsxWidth: 22,
    pdfWidth: 80,
  },
  {
    header: "PO Number",
    value: (o) => o.po_number || "",
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "Client",
    value: (o) => o.client_details?.name ?? "Unknown",
    xlsxWidth: 24,
    pdfWidth: 90,
  },
  {
    header: "Description",
    value: (o) => o.description || "",
    xlsxWidth: 30,
    pdfWidth: 110,
  },
  {
    header: "Quantity",
    value: (o) => (o.quantity ?? null) as number | null,
    xlsxWidth: 12,
    pdfWidth: 45,
    pdfAlign: "right",
  },
  { header: "Unit", value: (o) => o.unit || "", xlsxWidth: 12, pdfWidth: 45 },
  {
    header: "Status",
    value: (o) => STATUS_LABELS[o.status] ?? o.status,
    xlsxWidth: 20,
    pdfWidth: 70,
  },
  {
    header: "Created",
    value: (o) => formatDateNL(o.creation_date ?? o.created_at),
    xlsxWidth: 16,
    pdfWidth: 60,
  },
];

export const OrderTable = () => {
  const queryClient = useQueryClient();
  const { canAdd, canView, canChange, canDelete } =
    useModulePermissions("orders");
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<Order>("orders", deleteOrder, {
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
    queryKey: ["orders", params],
    queryFn: () =>
      getOrders({
        search: params.search,
        ordering: params.ordering,
        status: state.filters.status as string | undefined,
        client: state.filters.client as string | undefined,
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

  const handleExcelExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Orders",
      fileBaseName: "orders",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToExcel(rows, EXPORT_COLUMNS, meta, { sheetName: "Orders" });
  }, [rows, state.globalFilter]);

  const handlePdfExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Orders",
      fileBaseName: "orders",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToPdf(rows, EXPORT_COLUMNS, meta, { useColumnWidths: true });
  }, [rows, state.globalFilter]);

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      { header: "Order Number", accessorKey: "order_number" },
      {
        header: "PO Number",
        cell: (cell: CellContext<Order, unknown>) =>
          cell.row.original.po_number || <span className="text-muted">—</span>,
      },
      {
        header: "Client",
        cell: (cell: CellContext<Order, unknown>) => {
          const name = cell.row.original.client_details?.name ?? "Unknown";
          return (
            <span className="d-flex align-items-center gap-2">
              <Avatar name={name} size={28} />
              {name}
            </span>
          );
        },
      },
      {
        header: "Quantity",
        cell: (cell: CellContext<Order, unknown>) => {
          const o = cell.row.original;
          if (o.quantity == null) return <span className="text-muted">—</span>;
          return (
            <span className="d-flex align-items-center gap-2">
              <span className="fw-semibold">{o.quantity.toLocaleString()}</span>
              {o.unit && (
                <span className="badge bg-light text-dark border fw-normal text-lowercase">
                  {o.unit}
                </span>
              )}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<Order, unknown>) => {
          const status = cell.getValue<string>();
          return <StatusBadge status={STATUS_LABELS[status] ?? status} />;
        },
      },
      {
        header: "Created",
        cell: (cell: CellContext<Order, unknown>) =>
          formatDateNL(
            cell.row.original.creation_date ?? cell.row.original.created_at,
          ),
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: OrderFilterType = {};

  return (
    <>
      <CRUDTable<Order, OrderFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<Order, OrderFilterType>}
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
          entityName: "Order",
          tableHeader: "All Orders",
          filterOptions: { initialFilters, filterComponent: OrderFilter },
        }}
        isPdfExport={rows.length > 0}
        isExcelExport={rows.length > 0}
        onPdfExport={handlePdfExport}
        onExcelExport={handleExcelExport}
      />

      <DetailsModal<Order>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["orders"] })
        }
        viewComponent={({ item }) => <OrderDetails order={item} />}
        formComponent={OrderForm}
        entityName="Order"
      />
    </>
  );
};

export default OrderTable;
