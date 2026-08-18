"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { DrumDetails } from "./DrumDetails";
import { DrumForm } from "./DrumForm";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteDrum, getDrums } from "@/services/drum-tracer/drum.service";
import { DTDrum } from "@/types/drum-tracer/drum.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import DrumFilter from "./DrumFilter";
import { DTDrumFilterType } from "@/types/drum-tracer/drum.type";

export const DrumTable = () => {
  const queryClient = useQueryClient();
  const { state, setState, buildQueryParams, handleAddItem, handleBulkDelete, closeModal, getDefaultColumns } =
    useCRUDTable<DTDrum>("dt-drums", deleteDrum, {
      isEdit: true,
      isView: true,
      isDelete: true,
      showCheckBox: true,
    });

  const params = { ...buildQueryParams(), search: state.globalFilter || undefined, ...state.filters };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-drums", params],
    queryFn: () =>
      getDrums({
        search: params.search,
        ordering: params.ordering,
        status: state.filters.status as string,
        page: typeof state.pagination?.pageIndex === "number" ? state.pagination.pageIndex + 1 : 1,
        page_size: typeof state.pagination?.pageSize === "number" ? state.pagination.pageSize : 10,
      }),
    staleTime: 1000 * 60,
  });

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      { header: "Drum Number", accessorKey: "drum_number" },
      {
        header: "Specifications",
        cell: (cell: CellContext<DTDrum, unknown>) => {
          const d = cell.row.original;
          return (
            <span className="small">
              {d.length_km} KMs
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
        cell: (cell: CellContext<DTDrum, unknown>) => <StatusBadge status={cell.getValue<string>()} />,
      },
      { header: "Container", accessorKey: "container_number" },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: DTDrumFilterType = {};

  return (
    <>
      <CRUDTable<DTDrum, DTDrumFilterType>
        data={data?.results || []}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<DTDrum, DTDrumFilterType>}
        onPaginationChange={(pagination) =>
          setState((prev) => ({
            ...prev,
            pagination: typeof pagination === "function" ? pagination(prev.pagination) : pagination,
          }))
        }
        onSortingChange={(sorting) =>
          setState((prev) => ({
            ...prev,
            sorting: typeof sorting === "function" ? sorting(prev.sorting) : sorting,
          }))
        }
        onGlobalFilterChange={(filter) => setState((prev) => ({ ...prev, globalFilter: filter }))}
        onRowSelectionChange={(selection) =>
          setState((prev) => ({
            ...prev,
            rowSelection: typeof selection === "function" ? selection(prev.rowSelection) : selection,
          }))
        }
        onFilterChange={(filters) => setState((prev) => ({ ...prev, filters }))}
        onAddItem={handleAddItem}
        onBulkDelete={(ids) => handleBulkDelete(ids)}
        options={{
          entityName: "Drum",
          tableHeader: "All Drums",
          filterOptions: { initialFilters, filterComponent: DrumFilter },
        }}
      />

      <DetailsModal<DTDrum>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["dt-drums"] })}
        viewComponent={({ item }) => <DrumDetails drum={item} />}
        formComponent={DrumForm}
        entityName="Drum"
      />
    </>
  );
};

export default DrumTable;
