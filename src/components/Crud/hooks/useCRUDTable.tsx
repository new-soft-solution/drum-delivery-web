"use client";
import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteConfirmationContext } from "@/components/wrappers/DeleteConfirmationProvider";
import type { CRUDQueryParams, CRUDTableState } from "@/types/crud.type";
import type { VisibilityState } from "@tanstack/react-table";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button } from "react-bootstrap";
import { DeleteProps } from "@/types/global.type";
import { handleApiError } from "@/services/handleApiError";
import { useNotificationContext } from "@/context/useNotificationContext";

interface CrudOptions {
  isEdit?: boolean;
  isDelete?: boolean;
  isView?: boolean;
  showCheckBox?: boolean;
}
export interface RestoreProps {
  id?: number;
  ids?: number[];
  cascade?: boolean;
}
export interface BulkRestoreResponse {
  success: boolean;
  message: string;
  restored_count: number;
  restored_ids: number[];
  conflict_ids: number[];
  missing_ids: number[];
}
export const useCRUDTable = <T extends { id: number; deleted_at?: string }>(
  entityName: string,
  deleteMutation?: ({ id, ids }: DeleteProps) => Promise<void>,
  options: CrudOptions = {
    isEdit: true,
    isView: true,
    isDelete: true,
    showCheckBox: true,
  },
  initialColumnVisibility: VisibilityState = {},
  restoreMutation?: (
    props: RestoreProps,
  ) => Promise<void | BulkRestoreResponse>,
) => {
  const queryClient = useQueryClient();
  const confirm = useDeleteConfirmationContext();
  const { showNotification } = useNotificationContext();
  const [state, setState] = useState<CRUDTableState<T>>({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [],
    globalFilter: "",
    rowSelection: {},
    filters: {},
    columnVisibility: initialColumnVisibility,
    modalState: {
      showViewEditModal: false,
      mode: "view",
      selectedItem: null,
    },
  });

  const buildQueryParams = useCallback(
    (additionalParams: Record<string, unknown> = {}): CRUDQueryParams => ({
      page: state.pagination.pageIndex + 1,
      page_size: state.pagination.pageSize,
      search: state.globalFilter || undefined,
      ordering: state.sorting[0]?.id
        ? `${state.sorting[0]?.desc ? "-" : ""}${state.sorting[0]?.id}`
        : undefined,
      ...additionalParams,
    }),
    [state.pagination, state.globalFilter, state.sorting],
  );

  const updateModalState = useCallback(
    (updates: Partial<CRUDTableState<T>["modalState"]>) => {
      setState((prev) => ({
        ...prev,
        modalState: { ...prev.modalState, ...updates },
      }));
    },
    [],
  );

  const handleAddItem = useCallback(() => {
    updateModalState({
      showViewEditModal: true,
      mode: "create",
      selectedItem: null,
    });
  }, [updateModalState]);

  const handleViewDetails = useCallback(
    (item: T) => {
      updateModalState({
        showViewEditModal: true,
        mode: "view",
        selectedItem: item,
      });
    },
    [updateModalState],
  );

  const handleEdit = useCallback(
    (item: T) => {
      updateModalState({
        showViewEditModal: true,
        mode: "edit",
        selectedItem: item,
      });
    },
    [updateModalState],
  );

  const handleDelete = useCallback(
    async (item: T) => {
      const { accepted, control } = await confirm({
        title: `Delete ${entityName}`,
        message: `Are you sure you want to delete "${(item as { name?: string }).name || entityName}"?`,
        confirmText: "Delete",
        confirmVariant: "danger",
        icon: "mdi:trash-can-outline",
      });

      if (!accepted) return;
      try {
        control.setLoading(true);
        if (deleteMutation) await deleteMutation({ id: item.id });
        queryClient.invalidateQueries({ queryKey: [entityName] });
        control.close();
        showNotification({
          message: `${(item as { name?: string }).name || entityName} deleted successfully.`,
          variant: "success",
        });
      } catch (error) {
        const er = handleApiError(error);
        showNotification({
          message: er.message || "Something went wrong!",
          variant: "danger",
        });
        control.setLoading(false);
      }
    },
    [confirm, entityName, queryClient, deleteMutation],
  );

  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      const { accepted, control } = await confirm({
        title: "Delete Selected",
        message: `Are you sure you want to delete ${ids.length} ${entityName}s?`,
        confirmText: "Delete",
        confirmVariant: "danger",
        icon: "mdi:trash-can-outline",
      });

      if (!accepted) return;
      try {
        control.setLoading(true);
        if (deleteMutation) await deleteMutation({ ids: ids });
        setState((prev) => ({ ...prev, rowSelection: {} }));
        queryClient.invalidateQueries({ queryKey: [entityName] });
        control.close();
        showNotification({
          message: `${ids.length} ${entityName}${ids.length !== 1 ? "s" : ""} deleted successfully.`,
          variant: "success",
        });
      } catch (error) {
        const er = handleApiError(error);
        showNotification({
          message: er.message || "Something went wrong!",
          variant: "danger",
        });
        control.setLoading(false);
      }
    },
    [confirm, entityName, queryClient, deleteMutation],
  );
  const handleRestore = useCallback(
    async (item: T) => {
      const { accepted, control } = await confirm({
        title: `Restore ${entityName}`,
        message: `Are you sure you want to restore "${(item as { name?: string }).name || entityName}"?`,
        confirmText: "Restore",
        confirmVariant: "success",
        icon: "mdi:restore",
      });

      if (!accepted) return;
      try {
        control.setLoading(true);
        if (restoreMutation) await restoreMutation({ id: item.id });
        queryClient.invalidateQueries({ queryKey: [entityName] });
        control.close();
        showNotification({
          message: `${(item as { name?: string }).name || entityName} restored successfully.`,
          variant: "success",
        });
      } catch (error) {
        const er = handleApiError(error);
        showNotification({
          message: er.message || "Something went wrong!",
          variant: "danger",
        });
        control.setLoading(false);
      }
    },
    [confirm, entityName, queryClient, restoreMutation],
  );

  const handleBulkRestore = useCallback(
    async (ids: number[]) => {
      const { accepted, control } = await confirm({
        title: "Restore Selected",
        message: `Are you sure you want to restore ${ids.length} selected ${entityName}${ids.length !== 1 ? "s" : ""}?`,
        confirmText: "Restore",
        confirmVariant: "success",
        icon: "mdi:restore",
      });

      if (!accepted) return;
      try {
        control.setLoading(true);
        if (restoreMutation) {
          const result = await restoreMutation({ ids });
          const bulk = result as BulkRestoreResponse | undefined;
          console.log("Bulk restore result:", bulk);
          if (bulk) {
            // partial success — some restored, some conflicted
            if (bulk.restored_count > 0 && bulk.conflict_ids?.length > 0) {
              showNotification({
                message: `${bulk.restored_count} restored. ${bulk.conflict_ids.length} skipped — a record with the same name already exists (ID${bulk.conflict_ids.length > 1 ? "s" : ""}: ${bulk.conflict_ids.join(", ")}).`,
                variant: "danger",
              });
            } else if (bulk.restored_count > 0) {
              showNotification({
                message: `${bulk.restored_count} ${entityName}${bulk.restored_count !== 1 ? "s" : ""} restored successfully.`,
                variant: "success",
              });
            } else if (bulk.conflict_ids?.length > 0) {
              // nothing restored — all conflicted
              showNotification({
                message: `Could not restore: a record with the same name already exists (ID${bulk.conflict_ids.length > 1 ? "s" : ""}: ${bulk.conflict_ids.join(", ")}).`,
                variant: "danger",
              });
            }
          } else {
            showNotification({
              message: `${ids.length} ${entityName}${ids.length !== 1 ? "s" : ""} restored successfully.`,
              variant: "success",
            });
          }
        }
        setState((prev) => ({ ...prev, rowSelection: {} }));
        queryClient.invalidateQueries({ queryKey: [entityName] });
        control.close();
      } catch (error) {
        const er = handleApiError(error);
        showNotification({
          message: er.message || "Something went wrong!",
          variant: "danger",
        });
        control.setLoading(false);
      }
    },
    [confirm, entityName, queryClient, restoreMutation],
  );
  const closeModal = useCallback(() => {
    updateModalState({ showViewEditModal: false });
  }, [updateModalState]);

  const getDefaultColumns = useMemo(() => {
    // Build columns dynamically
    const cols = [];

    // Include the "select" column only if not explicitly disabled
    if (options?.showCheckBox !== false) {
      cols.push({
        id: "select",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        header: ({ table }: { table: any }) => (
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input fat-checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              ref={(el) =>
                el && (el.indeterminate = table.getIsSomeRowsSelected())
              }
            />
          </div>
        ),
        cell: ({
          row,
        }: {
          row: {
            getIsSelected: () => boolean;
            getToggleSelectedHandler: () => (
              event: React.ChangeEvent<HTMLInputElement>,
            ) => void;
          };
        }) => (
          <input
            type="checkbox"
            className="form-check-input fat-checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
      });
    }

    // Always include Actions (respect isView/isEdit/isDelete flags)
    cols.push({
      header: "Actions",
      cell: ({ row }: { row: { original: T } }) => {
        const item = row.original;
        if (item.deleted_at) {
          return (
            <div className="d-flex gap-2">
              {options?.isView && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleViewDetails(row.original)}
                >
                  <IconifyIcon icon="mdi:eye-outline" />
                </Button>
              )}
              {restoreMutation && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-success"
                  title="Restore"
                  onClick={() => handleRestore(item)}
                >
                  <IconifyIcon icon="mdi:restore" />
                </Button>
              )}
            </div>
          );
        }
        return (
          <div className="d-flex gap-2">
            {options?.isView && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleViewDetails(row.original)}
              >
                <IconifyIcon icon="mdi:eye-outline" />
              </Button>
            )}

            {options?.isEdit && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleEdit(row.original)}
              >
                <IconifyIcon icon="mdi:pencil-outline" />
              </Button>
            )}

            {options?.isDelete && (
              <Button
                variant="link"
                size="sm"
                className="text-danger"
                onClick={() => handleDelete(row.original)}
              >
                <IconifyIcon icon="mdi:trash-can-outline" />
              </Button>
            )}
          </div>
        );
      },
    });

    return cols;
  }, [
    handleViewDetails,
    handleEdit,
    handleDelete,
    handleRestore,
    restoreMutation,
    options?.showCheckBox,
    options?.isView,
    options?.isEdit,
    options?.isDelete,
  ]);

  const handleColumnVisibilityChange = useCallback(
    (visibility: VisibilityState) => {
      setState((prev) => ({ ...prev, columnVisibility: visibility }));
    },
    [],
  );

  const isColumnVisible = useCallback(
    (columnId: string) => state.columnVisibility[columnId] !== false,
    [state.columnVisibility],
  );

  return {
    state,
    setState,
    buildQueryParams,
    handleAddItem,
    handleBulkDelete,
    handleBulkRestore,
    handleRestore,
    closeModal,
    getDefaultColumns,
    handleViewDetails,
    handleEdit,
    handleDelete,
    handleColumnVisibilityChange,
    isColumnVisible,
  };
};
