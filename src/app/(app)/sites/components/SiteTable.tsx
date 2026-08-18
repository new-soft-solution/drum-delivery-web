"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteDetails } from "./SiteDetails";
import { SiteForm } from "./SiteForm";
import type { NormalizedError } from "@/types/error.type";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { deleteSite, getSites } from "@/services/drum-tracer/site.service";
import { DTSite } from "@/types/drum-tracer/site.type";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { DetailsModal } from "@/components/Crud/DetailsModal";
import { CRUDTableState } from "@/types/crud.type";
import { CellContext } from "@tanstack/react-table";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export const SiteTable = () => {
  const queryClient = useQueryClient();
  const { state, setState, buildQueryParams, handleAddItem, handleBulkDelete, closeModal, getDefaultColumns } =
    useCRUDTable<DTSite>("dt-sites", deleteSite, {
      isEdit: true,
      isView: true,
      isDelete: true,
      showCheckBox: true,
    });

  const params = { ...buildQueryParams(), search: state.globalFilter || undefined };
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ["dt-sites", params],
    queryFn: () =>
      getSites({
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
        header: "Site Name",
        accessorKey: "name",
        cell: (cell: CellContext<DTSite, unknown>) => (
          <span className="fw-bold d-flex align-items-center gap-2">
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "#eaf0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconifyIcon icon="ri:map-pin-line" width={15} height={15} style={{ color: "#3355c9" }} />
            </span>
            {cell.getValue<string>()}
          </span>
        ),
      },
      { header: "Address", accessorKey: "address" },
      { header: "City", accessorKey: "city" },
      { header: "Country", accessorKey: "country" },
      { header: "Contact Person", accessorKey: "contact_person" },
      ...getDefaultColumns.slice(-1),
    ],
    [getDefaultColumns],
  );

  return (
    <>
      <CRUDTable<DTSite>
        data={data?.results || []}
        count={data?.count || 0}
        isLoading={isFetching}
        error={error as unknown as NormalizedError}
        columns={columns}
        state={state as CRUDTableState<DTSite>}
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
        options={{ entityName: "Site", tableHeader: "All Sites" }}
      />

      <DetailsModal<DTSite>
        show={state.modalState.showViewEditModal}
        onHide={closeModal}
        item={state.modalState.selectedItem ?? undefined}
        mode={state.modalState.mode}
        isLoading={isLoading}
        error={error}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["dt-sites"] })}
        viewComponent={({ item }) => <SiteDetails site={item} />}
        formComponent={SiteForm}
        entityName="Site"
      />
    </>
  );
};

export default SiteTable;
