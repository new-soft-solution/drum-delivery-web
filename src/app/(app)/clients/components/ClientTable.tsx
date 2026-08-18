"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ClientDetails } from "./ClientDetails";
import { ClientForm } from "./ClientForm";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteClient, getClients } from "@/services/drum-tracer/client.service";
import { DTClient } from "@/types/drum-tracer/client.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CellContext } from "@tanstack/react-table";
import Link from "next/link";
import { CRUDTableState } from "@/types/crud.type";
import Avatar from "@/components/ui/Avatar/Avatar";

export const ClientTable = () => {
  const queryClient = useQueryClient();
  const {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    closeModal,
    getDefaultColumns,
  } = useCRUDTable<DTClient>("dt-clients", deleteClient, {
    isEdit: true,
    isView: true,
    isDelete: true,
    showCheckBox: true,
  });

  const params = { ...buildQueryParams(), search: state.globalFilter || undefined };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-clients", params],
    queryFn: () =>
      getClients({
        search: params.search,
        ordering: params.ordering,
        page: typeof state.pagination?.pageIndex === "number" ? state.pagination.pageIndex + 1 : 1,
        page_size: typeof state.pagination?.pageSize === "number" ? state.pagination.pageSize : 10,
      }),
    staleTime: 1000 * 60,
  });

  const columns = useMemo(
    () => [
      ...getDefaultColumns.slice(0, -1),
      {
        header: "Client Name",
        accessorKey: "name",
        cell: (cell: CellContext<DTClient, unknown>) => (
          <Link href="#" className="fw-bold text-decoration-none d-flex align-items-center gap-2 text-dark">
            <Avatar name={cell.getValue<string>()} size={30} />
            {cell.getValue<string>()}
          </Link>
        ),
      },
      { header: "Contact Person", accessorKey: "contact_person" },
      { header: "Email", accessorKey: "email" },
      {
        header: "Location",
        cell: (cell: CellContext<DTClient, unknown>) => {
          const c = cell.row.original;
          return (
            <span className="text-muted">
              {c.city ? `${c.city}, ` : ""}
              {c.country}
            </span>
          );
        },
      },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  return (
    <>
      <CRUDTable<DTClient>
        data={data?.results || []}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<DTClient>}
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
        onAddItem={handleAddItem}
        onBulkDelete={(ids) => handleBulkDelete(ids)}
        options={{ entityName: "Client", tableHeader: "All Clients" }}
      />

      <DetailsModal<DTClient>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["dt-clients"] })}
        viewComponent={({ item }) => <ClientDetails client={item} />}
        formComponent={ClientForm}
        entityName="Client"
      />
    </>
  );
};

export default ClientTable;
