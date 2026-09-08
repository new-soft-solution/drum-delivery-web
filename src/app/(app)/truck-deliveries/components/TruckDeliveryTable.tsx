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
} from "@/services/drum-tracer/truck-delivery.service";
import {
  DTTruckDelivery,
  DTTruckDeliveryFilterType,
} from "@/types/drum-tracer/truck-delivery.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { getShipment } from "@/services/shipment.service";
import { ShipmentNumber } from "@/components/ui/ShipmentNumber/ShipmentNumber";
import {
  ExportColumn,
  ExportMeta,
  exportToExcel,
  exportToPdf,
} from "@/utils/report-export";

const EXPORT_COLUMNS = (
  shipmentNumbers: Map<string, string>,
): ExportColumn<DTTruckDelivery>[] => [
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
    value: (t) => shipmentNumbers.get(t.shipment_id) || t.shipment_id || "",
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
    value: (t) => new Date(t.scheduled_at).toLocaleString(),
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  { header: "Status", value: (t) => t.status, xlsxWidth: 14, pdfWidth: 55 },
  { header: "Notes", value: (t) => t.notes || "", xlsxWidth: 26, pdfWidth: 90 },
];

export const TruckDeliveryTable = () => {
  const queryClient = useQueryClient();
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<DTTruckDelivery>(
    "dt-truck-deliveries",
    deleteTruckDelivery,
    {
      isEdit: true,
      isView: true,
      isDelete: true,
      showCheckBox: true,
    },
  );

  const params = {
    ...buildQueryParams(),
    search: state.globalFilter || undefined,
    ...state.filters,
  };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-truck-deliveries", params],
    queryFn: () =>
      getTruckDeliveries({
        search: params.search,
        ordering: params.ordering,
        status: state.filters.status as string,
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

  // Truck Deliveries only store a real Shipment UUID, not its number —
  // resolve every unique shipment referenced in the currently-loaded rows
  // before exporting, since ExportColumn.value must be synchronous.
  const resolveShipmentNumbers = useCallback(async (): Promise<
    Map<string, string>
  > => {
    const ids = Array.from(
      new Set(rows.map((t) => t.shipment_id).filter(Boolean)),
    );
    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          const shipment = await getShipment(id);
          return [id, shipment.shipment_number] as const;
        } catch {
          return [id, id] as const;
        }
      }),
    );
    return new Map(entries);
  }, [rows]);

  const handleExcelExport = useCallback(async () => {
    const shipmentNumbers = await resolveShipmentNumbers();
    const meta: ExportMeta = {
      title: "Truck Deliveries",
      fileBaseName: "truck-deliveries",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToExcel(rows, EXPORT_COLUMNS(shipmentNumbers), meta, {
      sheetName: "Truck Deliveries",
    });
  }, [rows, state.globalFilter, resolveShipmentNumbers]);

  const handlePdfExport = useCallback(async () => {
    const shipmentNumbers = await resolveShipmentNumbers();
    const meta: ExportMeta = {
      title: "Truck Deliveries",
      fileBaseName: "truck-deliveries",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToPdf(rows, EXPORT_COLUMNS(shipmentNumbers), meta, {
      useColumnWidths: true,
    });
  }, [rows, state.globalFilter, resolveShipmentNumbers]);

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      { header: "Truck Number", accessorKey: "truck_number" },
      {
        header: "Shipment",
        accessorKey: "shipment_id",
        cell: (cell: CellContext<DTTruckDelivery, unknown>) => (
          <ShipmentNumber shipmentId={cell.row.original.shipment_id} />
        ),
      },
      { header: "Driver", accessorKey: "driver_name" },
      {
        header: "Scheduled",
        accessorKey: "scheduled_at",
        cell: (cell: CellContext<DTTruckDelivery, unknown>) =>
          new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<DTTruckDelivery, unknown>) => (
          <StatusBadge status={cell.getValue<string>()} />
        ),
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: DTTruckDeliveryFilterType = {};

  return (
    <>
      <CRUDTable<DTTruckDelivery, DTTruckDeliveryFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={
          state as CRUDTableState<DTTruckDelivery, DTTruckDeliveryFilterType>
        }
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
        onAddItem={handleAddItem}
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

      <DetailsModal<DTTruckDelivery>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["dt-truck-deliveries"] })
        }
        viewComponent={({ item }) => <TruckDeliveryDetails delivery={item} />}
        formComponent={TruckDeliveryForm}
        entityName="Truck Delivery"
      />
    </>
  );
};

export default TruckDeliveryTable;
