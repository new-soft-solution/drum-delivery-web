"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { OrderDetails } from "./OrderDetails";
import { OrderForm } from "./OrderForm";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteOrder, getOrders } from "@/services/order.service";
import { Order } from "@/types/order.type";
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
    value: (o) =>
      o.quantity != null ? `${o.quantity} ${o.unit ?? ""}`.trim() : "",
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  {
    header: "Status",
    value: (o) => STATUS_LABELS[o.status] ?? o.status,
    xlsxWidth: 20,
    pdfWidth: 70,
  },
  {
    header: "Created",
    value: (o) =>
      new Date(o.creation_date ?? o.created_at).toLocaleDateString(),
    xlsxWidth: 16,
    pdfWidth: 60,
  },
];

export const OrderTable = () => {
  const queryClient = useQueryClient();
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<Order>("orders", deleteOrder, {
    isEdit: true,
    isView: true,
    isDelete: true,
    showCheckBox: true,
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
        page:
          typeof state.pagination?.pageIndex === "number"
            ? state.pagination.pageIndex + 1
            : 1,
        // NOTE: /api/orders/ doesn't document a page_size param (confirmed
        // via schema.yaml — only ordering/page/search) so it isn't sent;
        // OrderListParams doesn't include it for the same reason.
      }),
    staleTime: 1000 * 60,
  });

  const rows = data?.results || [];

  // NOTE: exports cover whatever page is currently loaded, not the full
  // dataset — /api/orders/ is paginated and there's no "give me
  // everything" endpoint to export against instead.
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
          return o.quantity != null
            ? `${o.quantity} ${o.unit ?? ""}`.trim()
            : "—";
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
          new Date(
            cell.row.original.creation_date ?? cell.row.original.created_at,
          ).toLocaleDateString(),
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  return (
    <>
      <CRUDTable<Order>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<Order>}
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
        onAddItem={handleAddItem}
        onBulkDelete={(ids) => handleBulkDelete(ids)}
        options={{ entityName: "Order", tableHeader: "All Orders" }}
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
