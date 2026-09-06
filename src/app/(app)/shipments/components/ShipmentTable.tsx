"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { ShipmentDetails } from "./ShipmentDetails";
import { ShipmentForm } from "./ShipmentForm";
import ShipmentFilter from "./ShipmentFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteShipment, getShipments } from "@/services/drum-tracer/shipment.service";
import { getSite } from "@/services/site.service";
import { SiteName } from "@/components/ui/SiteName/SiteName";
import { DTShipment, DTShipmentFilterType } from "@/types/drum-tracer/shipment.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import Link from "next/link";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { ExportColumn, ExportMeta, exportToExcel, exportToPdf } from "@/utils/report-export";

const EXPORT_COLUMNS = (
  siteNames: Map<string, string>,
): ExportColumn<DTShipment>[] => [
  {
    header: "Shipment Number",
    value: (s) => s.shipment_number,
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "Invoice Number",
    value: (s) => s.invoice_number || "",
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "BL Number",
    value: (s) => s.bl_number || "",
    xlsxWidth: 18,
    pdfWidth: 70,
  },
  {
    header: "Container Number",
    value: (s) => s.container_number || "",
    xlsxWidth: 18,
    pdfWidth: 70,
  },
  {
    header: "Destination",
    value: (s) =>
      siteNames.get(s.destination_site_id) || s.destination_site_id || "",
    xlsxWidth: 24,
    pdfWidth: 90,
  },
  {
    header: "Expected Arrival",
    value: (s) => new Date(s.expected_arrival).toLocaleDateString(),
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  { header: "Status", value: (s) => s.status, xlsxWidth: 14, pdfWidth: 55 },
];

export const ShipmentTable = () => {
  const queryClient = useQueryClient();
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<DTShipment>("dt-shipments", deleteShipment, {
    isEdit: true,
    isView: true,
    isDelete: true,
    showCheckBox: true,
  });

  const params = {
    ...buildQueryParams(),
    search: state.globalFilter || undefined,
    ...state.filters,
  };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-shipments", params],
    queryFn: () =>
      getShipments({
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

  // Shipments only store a real Site UUID, not its name — resolve every
  // unique destination site referenced in the currently-loaded rows before
  // exporting, since ExportColumn.value must be synchronous.
  const resolveSiteNames = useCallback(async (): Promise<
    Map<string, string>
  > => {
    const ids = Array.from(
      new Set(rows.map((s) => s.destination_site_id).filter(Boolean)),
    );
    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          const site = await getSite(id);
          return [id, site.name] as const;
        } catch {
          return [id, id] as const;
        }
      }),
    );
    return new Map(entries);
  }, [rows]);

  const handleExcelExport = useCallback(async () => {
    const siteNames = await resolveSiteNames();
    const meta: ExportMeta = {
      title: "Shipments",
      fileBaseName: "shipments",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToExcel(rows, EXPORT_COLUMNS(siteNames), meta, {
      sheetName: "Shipments",
    });
  }, [rows, state.globalFilter, resolveSiteNames]);

  const handlePdfExport = useCallback(async () => {
    const siteNames = await resolveSiteNames();
    const meta: ExportMeta = {
      title: "Shipments",
      fileBaseName: "shipments",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToPdf(rows, EXPORT_COLUMNS(siteNames), meta, {
      useColumnWidths: true,
    });
  }, [rows, state.globalFilter, resolveSiteNames]);

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      {
        header: "Shipment Number",
        accessorKey: "shipment_number",
        cell: (cell: CellContext<DTShipment, unknown>) => (
          <Link
            href={`/shipments/${cell.row.original.id}`}
            className="fw-bold text-decoration-none d-flex align-items-center gap-2 text-dark"
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "#2039754D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconifyIcon
                icon="ri:ship-line"
                width={15}
                height={15}
                style={{ color: "#203975" }}
              />
            </span>
            {cell.getValue<string>()}
          </Link>
        ),
      },
      {
        header: "Destination",
        accessorKey: "destination_site_id",
        cell: (cell: CellContext<DTShipment, unknown>) => (
          <SiteName siteId={cell.row.original.destination_site_id} />
        ),
      },
      {
        header: "Expected Arrival",
        accessorKey: "expected_arrival",
        cell: (cell: CellContext<DTShipment, unknown>) =>
          new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<DTShipment, unknown>) => (
          <StatusBadge status={cell.getValue<string>()} />
        ),
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: DTShipmentFilterType = {};

  return (
    <>
      <CRUDTable<DTShipment, DTShipmentFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<DTShipment, DTShipmentFilterType>}
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
          entityName: "Shipment",
          tableHeader: "All Shipments",
          filterOptions: { initialFilters, filterComponent: ShipmentFilter },
        }}
        isPdfExport={rows.length > 0}
        isExcelExport={rows.length > 0}
        onPdfExport={handlePdfExport}
        onExcelExport={handleExcelExport}
      />

      <DetailsModal<DTShipment>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["dt-shipments"] })
        }
        viewComponent={({ item }) => <ShipmentDetails shipment={item} />}
        formComponent={ShipmentForm}
        entityName="Shipment"
      />
    </>
  );
};

export default ShipmentTable;
