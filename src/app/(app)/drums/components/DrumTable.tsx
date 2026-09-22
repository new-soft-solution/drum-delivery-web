"use client";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DrumDetails } from "./DrumDetails";
import { DrumForm } from "./DrumForm";
import { BulkImportDrumsModal } from "./BulkImportDrumsModal";
import DrumFilter from "./DrumFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteDrum, getDrums } from "@/services/drum.service";
import { Drum, DRUM_STATUS_LABELS, DrumFilterType } from "@/types/drum.type";
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
import { useModulePermissions } from "@/utils/permissions";

const EXPORT_COLUMNS: ExportColumn<Drum>[] = [
  {
    header: "Drum Number",
    value: (d) => d.drum_number,
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  {
    header: "Length (KMs)",
    value: (d) => Number(d.length_kms),
    isNumber: true,
    xlsxWidth: 14,
    pdfWidth: 55,
  },
  {
    header: "Net Weight (MT)",
    value: (d) => Number(d.net_weight_mt),
    isNumber: true,
    xlsxWidth: 16,
    pdfWidth: 55,
  },
  {
    header: "Gross Weight (MT)",
    value: (d) => Number(d.gross_weight_mt),
    isNumber: true,
    xlsxWidth: 16,
    pdfWidth: 55,
  },
  {
    header: "Status",
    value: (d) => DRUM_STATUS_LABELS[d.status] ?? d.status,
    xlsxWidth: 16,
    pdfWidth: 60,
  },
  {
    header: "Container",
    value: (d) => d.container_no || "",
    xlsxWidth: 18,
    pdfWidth: 70,
  },
  { header: "Notes", value: (d) => d.notes || "", xlsxWidth: 26, pdfWidth: 90 },
];

export const DrumTable = () => {
  const queryClient = useQueryClient();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const { canAdd, canView, canChange, canDelete } =
    useModulePermissions("drums");
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<Drum>("drums", deleteDrum, {
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
    queryKey: ["drums", params],
    queryFn: () =>
      getDrums({
        search: params.search,
        ordering: params.ordering,
        status: state.filters.status as string | undefined,
        drum_number: state.filters.drum_number as string | undefined,
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
  // dataset — /api/drums/ is paginated and there's no "give me everything"
  // endpoint to export against instead.
  const handleExcelExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Drums",
      fileBaseName: "drums",
      generatedAt: new Date(),
      filtersLine: state.globalFilter
        ? `Search: ${state.globalFilter}`
        : undefined,
    };
    await exportToExcel(rows, EXPORT_COLUMNS, meta, { sheetName: "Drums" });
  }, [rows, state.globalFilter]);

  const handlePdfExport = useCallback(async () => {
    const meta: ExportMeta = {
      title: "Drums",
      fileBaseName: "drums",
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
      { header: "Drum Number", accessorKey: "drum_number" },
      {
        header: "Specifications",
        cell: (cell: CellContext<Drum, unknown>) => {
          const d = cell.row.original;
          return (
            <span className="small">
              {d.length_kms} KMs
              <br />
              <span className="text-muted">
                Net: {d.net_weight_mt} MT | Gross: {d.gross_weight_mt} MT
              </span>
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<Drum, unknown>) => {
          const status = cell.getValue<string>();
          return (
            <StatusBadge
              status={
                DRUM_STATUS_LABELS[status as keyof typeof DRUM_STATUS_LABELS] ??
                status
              }
            />
          );
        },
      },
      { header: "Container", accessorKey: "container_no" },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: DrumFilterType = {};

  return (
    <>
      <CRUDTable<Drum, DrumFilterType>
        data={rows}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<Drum, DrumFilterType>}
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
          entityName: "Drum",
          tableHeader: "All Drums",
          filterOptions: { initialFilters, filterComponent: DrumFilter },
        }}
        isImport={true}
        onImport={() => setShowBulkImport(true)}
        isPdfExport={rows.length > 0}
        isExcelExport={rows.length > 0}
        onPdfExport={handlePdfExport}
        onExcelExport={handleExcelExport}
      />

      <DetailsModal<Drum>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["drums"] })}
        viewComponent={({ item }) => <DrumDetails drum={item} />}
        formComponent={DrumForm}
        entityName="Drum"
      />

      <BulkImportDrumsModal
        show={showBulkImport}
        onHide={() => setShowBulkImport(false)}
      />
    </>
  );
};

export default DrumTable;
