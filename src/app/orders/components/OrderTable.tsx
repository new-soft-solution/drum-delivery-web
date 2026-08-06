"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { OrderDetails } from "./OrderDetails";
import { OrderForm } from "./OrderForm";
import OrderFilter from "./OrderFilter";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteOrder, getOrders } from "@/services/drum-tracer/order.service";
import { DTOrder, DTOrderFilterType } from "@/types/drum-tracer/order.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import { CRUDTableState } from "@/types/crud.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Avatar from "@/components/ui/Avatar/Avatar";

export const OrderTable = () => {
  const queryClient = useQueryClient();
  const { state, setState, buildQueryParams, handleAddItem, handleBulkDelete, closeModal, getDefaultColumns } =
    useCRUDTable<DTOrder>("dt-orders", deleteOrder, {
      isEdit: true,
      isView: true,
      isDelete: true,
      showCheckBox: true,
    });

  const params = { ...buildQueryParams(), search: state.globalFilter || undefined, ...state.filters };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-orders", params],
    queryFn: () =>
      getOrders({
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
      { header: "P.O Number", accessorKey: "po_number" },
      {
        header: "Client",
        accessorKey: "client_name",
        cell: (cell: CellContext<DTOrder, unknown>) => (
          <span className="d-flex align-items-center gap-2">
            <Avatar name={cell.getValue<string>()} size={28} />
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: CellContext<DTOrder, unknown>) => <StatusBadge status={cell.getValue<string>()} />,
      },
      {
        header: "Order Date",
        accessorKey: "created_at",
        cell: (cell: CellContext<DTOrder, unknown>) =>
          new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  const initialFilters: DTOrderFilterType = {};

  return (
    <>
      <CRUDTable<DTOrder, DTOrderFilterType>
        data={data?.results || []}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<DTOrder, DTOrderFilterType>}
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
          entityName: "Order",
          tableHeader: "All Orders",
          filterOptions: { initialFilters, filterComponent: OrderFilter },
        }}
      />

      <DetailsModal<DTOrder>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["dt-orders"] })}
        viewComponent={({ item }) => <OrderDetails order={item} />}
        formComponent={OrderForm}
        entityName="Order"
      />
    </>
  );
};

export default OrderTable;
