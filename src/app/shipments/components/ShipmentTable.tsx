"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ShipmentDetails } from "./ShipmentDetails";
import { ShipmentForm } from "./ShipmentForm";
import ShipmentFilter from "./ShipmentFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteShipment, getShipments } from "@/services/drum-tracer/shipment.service";
import { DTShipment, DTShipmentFilterType } from "@/types/drum-tracer/shipment.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import Link from "next/link";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export const ShipmentTable = () => {
  const queryClient = useQueryClient();
  const { state, setState, buildQueryParams, handleAddItem, handleBulkDelete, closeModal, getDefaultColumns } =
    useCRUDTable<DTShipment>("dt-shipments", deleteShipment, {
      isEdit: true,
      isView: true,
      isDelete: true,
      showCheckBox: true,
    });

  const params = { ...buildQueryParams(), search: state.globalFilter || undefined, ...state.filters };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-shipments", params],
    queryFn: () =>
      getShipments({
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
      { header: "Shipment Number", accessorKey: "shipment_number", cell: (cell: CellContext<DTShipment, unknown>) => (
        <Link href={`/shipments/${cell.row.original.id}`} className="fw-bold text-decoration-none d-flex align-items-center gap-2 text-dark">
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#e7f5f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconifyIcon icon="ri:ship-line" width={15} height={15} style={{ color: "#0f7a63" }} />
          </span>
          {cell.getValue<string>()}
        </Link>
      ) },
      { header: "Destination", accessorKey: "destination_site_name" },
      {
        header: "Expected Arrival",
        accessorKey: "expected_arrival",
        cell: (cell: CellContext<DTShipment, unknown>) =>
          new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<DTShipment, unknown>) => <StatusBadge status={cell.getValue<string>()} />,
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: DTShipmentFilterType = {};

  return (
    <>
      <CRUDTable<DTShipment, DTShipmentFilterType>
        data={data?.results || []}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<DTShipment, DTShipmentFilterType>}
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
          entityName: "Shipment",
          tableHeader: "All Shipments",
          filterOptions: { initialFilters, filterComponent: ShipmentFilter },
        }}
      />

      <DetailsModal<DTShipment>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["dt-shipments"] })}
        viewComponent={({ item }) => <ShipmentDetails shipment={item} />}
        formComponent={ShipmentForm}
        entityName="Shipment"
      />
    </>
  );
};

export default ShipmentTable;
