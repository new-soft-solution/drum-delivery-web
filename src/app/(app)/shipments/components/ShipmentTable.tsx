"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { ShipmentDetails } from "./ShipmentDetails";
import { ShipmentForm } from "./ShipmentForm";
import ShipmentFilter from "./ShipmentFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteShipment, getShipments } from "@/services/shipment.service";
import { getSite } from "@/services/site.service";
import { SiteName } from "@/components/ui/SiteName/SiteName";
import {
  Shipment,
  SHIPMENT_STATUS_LABELS,
  ShipmentFilterType,
} from "@/types/shipment.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import Link from "next/link";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  ExportColumn,
  ExportMeta,
  exportToExcel,
  exportToPdf,
} from "@/utils/report-export";
import { formatDateNL } from "@/utils/dateFormatter";

const EXPORT_COLUMNS = (
  siteNames: Map<string, string>,
): ExportColumn<Shipment>[] => [
  {
    header: "Shipment Number",
    value: (s) => s.shipment_number,
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "Invoice Number",
    value: (s) => s.invoice_no || "",
    xlsxWidth: 20,
    pdfWidth: 75,
  },
  {
    header: "BL Number",
    value: (s) => s.bl_no || "",
    xlsxWidth: 18,
    pdfWidth: 70,
  },
  {
    header: "Destination",
    value: (s) => siteNames.get(s.destination_site) || s.destination_site || "",
    xlsxWidth: 24,
    pdfWidth: 90,
  },
  {
    header: "Expected Arrival",
    value: (s) =>
      s.expected_arrival_date ? formatDateNL(s.expected_arrival_date) : "",
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  {
    header: "Status",
    value: (s) => SHIPMENT_STATUS_LABELS[s.status] ?? s.status,
    xlsxWidth: 14,
    pdfWidth: 55,
  },
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
  } = useCRUDTable<Shipment>("shipments", deleteShipment, {
    isEdit: true,
    isView: true,
    isDelete: true,
    showCheckBox: true,
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
    queryKey: ["shipments", params],
    queryFn: () =>
      getShipments({
        search: params.search,
        ordering: params.ordering,
        status: state.filters.status as string | undefined,
        destination_site: state.filters.destination_site as string | undefined,
        expected_arrival_date_after: state.filters
          .expected_arrival_date_after as string | undefined,
        expected_arrival_date_before: state.filters
          .expected_arrival_date_before as string | undefined,
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

  const resolveSiteNames = useCallback(async (): Promise<
    Map<string, string>
  > => {
    const ids = Array.from(
      new Set(rows.map((s) => s.destination_site).filter(Boolean)),
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
        cell: (cell: CellContext<Shipment, unknown>) => (
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
        accessorKey: "destination_site",
        cell: (cell: CellContext<Shipment, unknown>) => (
          <SiteName siteId={cell.row.original.destination_site} />
        ),
      },
      {
        header: "Expected Arrival",
        accessorKey: "expected_arrival_date",
        cell: (cell: CellContext<Shipment, unknown>) => {
          const v = cell.getValue<string | null>();
          return v ? formatDateNL(v) : "—";
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<Shipment, unknown>) => {
          const status = cell.getValue<string>();
          return (
            <StatusBadge
              status={
                SHIPMENT_STATUS_LABELS[
                  status as keyof typeof SHIPMENT_STATUS_LABELS
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

  const initialFilters: ShipmentFilterType = {};

  return (
    <>
      <CRUDTable<Shipment, ShipmentFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<Shipment, ShipmentFilterType>}
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

      <DetailsModal<Shipment>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["shipments"] })
        }
        viewComponent={({ item }) => <ShipmentDetails shipment={item} />}
        formComponent={ShipmentForm}
        entityName="Shipment"
      />
    </>
  );
};

export default ShipmentTable;
