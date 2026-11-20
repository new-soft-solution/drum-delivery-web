"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { TruckDeliveryDetails } from "./TruckDeliveryDetails";
import { TruckDeliveryForm } from "./TruckDeliveryForm";
import TruckDeliveryFilter from "./TruckDeliveryFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import {
  deleteTruckDelivery,
  getTruckDeliveries,
} from "@/services/truck-delivery.service";
import {
  TRUCK_DELIVERY_STATUS_LABELS,
  TruckDelivery,
  TruckDeliveryFilterType,
} from "@/types/truck-delivery.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  ExportColumn,
  ExportMeta,
  exportToExcel,
  exportToPdf,
} from "@/utils/report-export";
import { formatDateNLAMPMSS } from "@/utils/dateFormatter";
import { useModulePermissions } from "@/utils/permissions";

const EXPORT_COLUMNS: ExportColumn<TruckDelivery>[] = [
  {
    header: "Truck Number",
    value: (t) => t.truck_number,
    xlsxWidth: 18,
    pdfWidth: 65,
  },
  {
    header: "License Plate",
    value: (t) => t.license_plate || "",
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  {
    header: "Shipment",
    value: (t) => t.shipment_number || "",
    xlsxWidth: 18,
    pdfWidth: 65,
  },
  {
    header: "Driver",
    value: (t) => t.driver_name || "",
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "Driver Phone",
    value: (t) => t.driver_phone || "",
    xlsxWidth: 16,
    pdfWidth: 65,
  },
  {
    header: "Scheduled",
    value: (t) =>
      t.scheduled_date ? formatDateNLAMPMSS(t.scheduled_date) : "",
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "Status",
    value: (t) => TRUCK_DELIVERY_STATUS_LABELS[t.status] ?? t.status,
    xlsxWidth: 14,
    pdfWidth: 55,
  },
  { header: "Notes", value: (t) => t.notes || "", xlsxWidth: 26, pdfWidth: 90 },
];

export const TruckDeliveryTable = () => {
  const queryClient = useQueryClient();
  const { canAdd, canView, canChange, canDelete } =
    useModulePermissions("truckDeliveries");
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<TruckDelivery>("truck-deliveries", deleteTruckDelivery, {
    isEdit: canChange,
    isView: canView,
    isDelete: canDelete,
    showCheckBox: canDelete,
  });

  const params = {
    ...buildQueryParams(),
    search: state.globalFilter || undefined,
    ordering: state.sorting?.length
      ? `${state.sorting[0].desc ? "-" : ""}${state.sorting[0].id}`
      : undefined,
    ...state.filters,
  };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["truck-deliveries", params],
    queryFn: () =>
      getTruckDeliveries({
        search: params.search,
        ordering: params.ordering,
        status: state.filters.status as string | undefined,
        shipment: state.filters.shipment as string | undefined,
        scheduled_date__gte: state.filters.scheduled_date__gte as
          string | undefined,
        scheduled_date__lte: state.filters.scheduled_date__lte as
          string | undefined,
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
      title: "Truck Deliveries",
      fileBaseName: "truck-deliveries",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToExcel(rows, EXPORT_COLUMNS, meta, {
      sheetName: "Truck Deliveries",
    });
  }, [rows, state.globalFilter]);

  const handlePdfExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Truck Deliveries",
      fileBaseName: "truck-deliveries",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToPdf(rows, EXPORT_COLUMNS, meta, {
      useColumnWidths: true,
    });
  }, [rows, state.globalFilter]);

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      { header: "Truck Number", accessorKey: "truck_number" },
      {
        header: "Shipment",
        accessorKey: "shipment_number",
        cell: (cell: CellContext<TruckDelivery, unknown>) => {
          const v = cell.getValue<string | null>();
          return v ? v : "—";
        },
      },
      { header: "Driver", accessorKey: "driver_name" },
      {
        header: "Scheduled",
        accessorKey: "scheduled_date",
        cell: (cell: CellContext<TruckDelivery, unknown>) => {
          const v = cell.getValue<string | null>();
          return v ? formatDateNLAMPMSS(v) : "—";
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<TruckDelivery, unknown>) => {
          const status = cell.getValue<string>();
          return (
            <StatusBadge
              status={
                TRUCK_DELIVERY_STATUS_LABELS[
                  status as keyof typeof TRUCK_DELIVERY_STATUS_LABELS
                ] ?? status
              }
            />
          );
        },
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: TruckDeliveryFilterType = {};

  return (
    <>
      <CRUDTable<TruckDelivery, TruckDeliveryFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<TruckDelivery, TruckDeliveryFilterType>}
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
          entityName: "Truck Delivery",
          tableHeader: "All Truck Deliveries",
          filterOptions: {
            initialFilters,
            filterComponent: TruckDeliveryFilter,
          },
        }}
        isPdfExport={rows.length > 0}
        isExcelExport={rows.length > 0}
        onPdfExport={handlePdfExport}
        onExcelExport={handleExcelExport}
      />

      <DetailsModal<TruckDelivery>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["truck-deliveries"] })
        }
        viewComponent={({ item }) => <TruckDeliveryDetails delivery={item} />}
        formComponent={TruckDeliveryForm}
        entityName="Truck Delivery"
      />
    </>
  );
};

export default TruckDeliveryTable;
