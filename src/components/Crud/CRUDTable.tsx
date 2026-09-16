"use client";
import { Button, Dropdown, Modal } from "react-bootstrap";
import { Plus } from "lucide-react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SearchInput from "@/components/SearchInput/SearchInput";
import ReactTable from "@/components/ui/Table";
import { BaseFilter, CRUDTableProps } from "@/types/crud.type";
import TableFilter from "../ui/Table/TableFilter";
import ColumnSelector, { ColumnOption } from "../ui/Table/ColumnSelector";
import React, { useMemo, useState } from "react";

export const CRUDTable = <
  T extends { id: number | string; deleted_at?: string | null },
  TFilters extends BaseFilter = BaseFilter,
>({
  data,
  count = 0,
  isLoading,
  error,
  columns,
  state,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  onRowSelectionChange,
  onFilterChange,
  onColumnVisibilityChange,
  onAddItem,
  onBulkDelete,
  onBulkRestore,
  getRowClassName,
  selectedActions: SelectedActions,
  options = {},
  isPdfExport = false,
  isExcelExport = false,
  excelExportLoading = false,
  onPdfExport,
  onExcelExport,
  isImport = false,
  onImport,
  isCustomElement = false,
  customElements,
  enableDragDrop,
  onDragEnd,
  isDragDisabled,
  showPagination = true,
  tableMaxHeight,
  onRowClick,
  activeRowId,
}: CRUDTableProps<T, TFilters>) => {
  const selectedCount = Object.keys(state.rowSelection).length;

  // ── confirm-popup state for mixed selections ────────────────────────────
  const [pendingAction, setPendingAction] = useState<
    "delete" | "restore" | null
  >(null);

  // ── work out what kind of rows are selected ─────────────────────────────
  // rowSelection is keyed by String(row.id) (see ui/Table's getRowId), so
  // ids must be compared as strings here — numeric coercion (the old
  // `.map(Number)`) silently produced NaN for any UUID-style id.
  const selectedRowIds = Object.keys(state.rowSelection);
  const selectedRowIdSet = new Set(selectedRowIds);
  const selectedRows = data.filter((row) =>
    selectedRowIdSet.has(String(row.id)),
  );
  const deletedSelectedIds = selectedRows
    .filter((r) => r.deleted_at !== null && r.deleted_at !== undefined)
    .map((r) => r.id);
  const activeSelectedIds = selectedRows
    .filter((r) => r.deleted_at === null || r.deleted_at === undefined)
    .map((r) => r.id);

  const allSelectedAreDeleted =
    selectedRows.length > 0 &&
    deletedSelectedIds.length === selectedRows.length;
  const allSelectedAreActive =
    selectedRows.length > 0 && activeSelectedIds.length === selectedRows.length;
  const isMixedSelection =
    selectedRows.length > 0 && !allSelectedAreDeleted && !allSelectedAreActive;

  // Build column options for the selector (exclude "select" and "Actions")
  const columnOptions: ColumnOption[] = useMemo(() => {
    return columns
      .filter((col) => {
        const id =
          (col as { accessorKey?: string }).accessorKey ||
          (col as { id?: string }).id ||
          "";
        return id !== "select" && id !== "";
      })
      .filter((col) => {
        const header = col.header;
        return typeof header === "string" && header !== "Actions";
      })
      .map((col) => ({
        id:
          (col as { accessorKey?: string }).accessorKey ||
          (col as { id?: string }).id ||
          "",
        header: col.header as string,
      }));
  }, [columns]);

  // ── click handlers ───────────────────────────────────────────────────────
  const runBulkDelete = () => onBulkDelete?.(activeSelectedIds);
  const runBulkRestore = () => onBulkRestore?.(deletedSelectedIds);

  const handleDeleteClick = () => {
    if (isMixedSelection) {
      setPendingAction("delete");
      return;
    }
    runBulkDelete();
  };

  const handleRestoreClick = () => {
    if (isMixedSelection) {
      setPendingAction("restore");
      return;
    }
    runBulkRestore();
  };

  const handleConfirmPendingAction = () => {
    if (pendingAction === "delete") runBulkDelete();
    if (pendingAction === "restore") runBulkRestore();
    setPendingAction(null);
  };

  // ── bulk-action bar ──────────────────────────────────────────────────────
  const renderBulkActions = () => {
    if (SelectedActions) return SelectedActions;

    const items: React.ReactNode[] = [];

    if ((allSelectedAreDeleted || isMixedSelection) && onBulkRestore) {
      items.push(
        <Dropdown.Item
          key="restore"
          onClick={handleRestoreClick}
          className="d-flex align-items-center gap-2 py-2 text-success"
        >
          <IconifyIcon icon="mdi:restore" />
          Restore Selected
        </Dropdown.Item>,
      );
    }

    if ((allSelectedAreActive || isMixedSelection) && onBulkDelete) {
      items.push(
        <Dropdown.Item
          key="delete"
          onClick={handleDeleteClick}
          className="d-flex align-items-center gap-2 py-2 text-danger"
        >
          <IconifyIcon icon="mdi:delete-outline" />
          Delete Selected
        </Dropdown.Item>,
      );
    }

    if (items.length === 0) return null;

    return (
      <Dropdown>
        <Dropdown.Toggle
          variant="primary"
          className="d-flex xs-btn align-items-center gap-1"
        >
          <IconifyIcon icon="mdi:dots-horizontal" />
          Actions
        </Dropdown.Toggle>
        <Dropdown.Menu align="end" className="border-0 shadow-sm py-2">
          {items}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <>
      <div
        className={`d-flex justify-content-between align-items-center gap-3 flex-wrap ${options.headerClass || "py-3"}`}
      >
        {selectedCount > 0 ? (
          <div className="d-flex flex-column flex-md-row px-2 py-1 justify-content-left align-items-center gap-3 flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary-subtle text-primary">
                {selectedCount} selected
              </span>
              <span className="text-muted small">
                {selectedCount === 1
                  ? "1 record selected"
                  : `${selectedCount} records selected`}
              </span>
            </div>
            {renderBulkActions()}
          </div>
        ) : options.tableHeader ? (
          <h5 className="mb-0">{options.tableHeader}</h5>
        ) : (
          <h5 className="mb-0">{`All ${options.entityName || "Items"}${options.entityName ? "s" : ""}`}</h5>
        )}

        <div className="d-flex align-items-center justify-content-end gap-1 flex-grow-1 flex-wrap">
          {options && !options.searchDisable && (
            <SearchInput
              value={state.globalFilter}
              onChange={onGlobalFilterChange}
              placeholder={`Search ${options.entityName || "items"}...`}
            />
          )}

          {options.filterOptions && (
            <TableFilter<TFilters>
              initialFilters={options.filterOptions.initialFilters}
              currentFilters={state.filters}
              onFilterChange={onFilterChange ? onFilterChange : () => {}}
              renderTrigger={({ onClick, activeFilterCount }) => (
                <Button
                  variant="link"
                  className="btn bg-primary-subtle text-primary d-flex align-items-center arrow-none position-relative"
                  onClick={onClick}
                >
                  <IconifyIcon icon="iconoir:filter-alt" className="me-1" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              )}
            >
              {({ tempFilters, onTempFilterChange }) =>
                options.filterOptions && (
                  <options.filterOptions.filterComponent
                    tempFilters={tempFilters}
                    onTempFilterChange={onTempFilterChange}
                  />
                )
              }
            </TableFilter>
          )}

          {options.isColumnSelector && onColumnVisibilityChange && (
            <ColumnSelector
              columns={columnOptions}
              columnVisibility={state.columnVisibility}
              onColumnVisibilityChange={onColumnVisibilityChange}
            />
          )}

          {onAddItem && (
            <Button onClick={onAddItem} variant="primary" size="sm">
              {options.customAddIcon ? (
                options.customAddIcon
              ) : (
                <Plus size={18} className="me-1" />
              )}
              {!options.onlyEntityAdd && "Add"} {options.entityName || "Item"}
            </Button>
          )}

          {isImport && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={onImport}
              className="px-1"
            >
              <IconifyIcon icon="solar:upload-bold" width={20} />
            </Button>
          )}

          {isPdfExport && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onPdfExport}
              className="px-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <g fill="none">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7.792 21.25h8.416a3.5 3.5 0 0 0 3.5-3.5v-5.53a3.5 3.5 0 0 0-1.024-2.475l-5.969-5.97A3.5 3.5 0 0 0 10.24 2.75H7.792a3.5 3.5 0 0 0-3.5 3.5v11.5a3.5 3.5 0 0 0 3.5 3.5"
                  ></path>
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M10.437 7.141c-.239.078-.392.236-.436.411c-.09.352 0 .73.253 1.203c.126.234.28.471.45.725l.092.137l.145.215l.019-.068l.086-.306q.148-.503.23-1.02c.089-.642-.011-1.018-.309-1.26c-.08-.065-.278-.119-.53-.037m.055 4.152l-.27-.362l-.032-.048c-.115-.19-.243-.38-.382-.585l-.1-.149a10 10 0 0 1-.512-.828c-.31-.578-.558-1.286-.358-2.067c.17-.664.698-1.081 1.227-1.254c.517-.168 1.174-.147 1.66.247c.792.644.848 1.573.739 2.357a9 9 0 0 1-.261 1.174l-.096.34q-.112.382-.208.769l-.067.194l1.392 1.864c.65-.078 1.364-.125 2.03-.077c.769.054 1.595.242 2.158.776a1.56 1.56 0 0 1 .395 1.441c-.117.48-.454.88-.919 1.123c-.985.515-1.902.105-2.583-.416c-.533-.407-1.045-.975-1.476-1.453l-.104-.114c-.37.057-.72.121-1.004.175c-.305.057-.684.128-1.096.22l-.151.443q-.125.288-.238.58l-.122.303a8 8 0 0 1-.427.91c-.33.578-.857 1.192-1.741 1.241c-1.184.066-1.986-.985-1.756-2.108l.006-.027c.2-.791.894-1.31 1.565-1.653c.597-.306 1.294-.532 1.941-.701zm.87 1.165l-.287.843l.421-.08l.004-.001l.38-.07zm2.84 1.604c.274.29.547.56.831.777c.55.42.94.493 1.299.305c.2-.105.284-.241.309-.342a.35.35 0 0 0-.08-.309c-.257-.228-.722-.38-1.392-.428a8 8 0 0 0-.967-.003m-5.005.947c-.318.109-.62.23-.89.368c-.587.3-.87.604-.944.867c-.078.415.192.673.516.655c.27-.015.506-.184.766-.639q.204-.372.358-.767l.107-.266z"
                    clipRule="evenodd"
                  ></path>
                </g>
              </svg>
            </Button>
          )}
          {isExcelExport && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onExcelExport}
              className="px-1 d-inline-flex align-items-center gap-1"
              disabled={excelExportLoading}
              aria-busy={excelExportLoading || undefined}
              title={
                excelExportLoading
                  ? "Preparing your Excel file…"
                  : "Export to Excel"
              }
            >
              {excelExportLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="small fw-medium">Preparing…</span>
                </>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2m-7-9l4 5m-4 0l4-5"></path>
                  </g>
                </svg>
              )}
            </Button>
          )}
          {isCustomElement &&
            customElements?.map((el, index) => (
              <React.Fragment key={index}>{el}</React.Fragment>
            ))}
        </div>
      </div>

      <div
        style={
          tableMaxHeight
            ? { maxHeight: tableMaxHeight, overflowY: "auto" }
            : undefined
        }
      >
        <ReactTable<T>
          columns={columns}
          data={data}
          count={count}
          pagination={state.pagination}
          onPaginationChange={onPaginationChange}
          sorting={state.sorting}
          onSortingChange={onSortingChange}
          isFetching={isLoading}
          error={error ?? undefined}
          rowSelection={state.rowSelection}
          onRowSelectionChange={onRowSelectionChange}
          columnVisibility={state.columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          rowsPerPageList={[10, 25, 50, 100]}
          tableClass={`mb-0 checkbox-all border-collapse-separate${tableMaxHeight ? " table-sticky-header" : ""}`}
          theadClass="table-light"
          showPagination={showPagination}
          options={{
            pageCount: Math.ceil(count / state.pagination.pageSize),
            manualPagination: true,
          }}
          enableDragDrop={enableDragDrop}
          onDragEnd={onDragEnd}
          isDragDisabled={isDragDisabled}
          onRowClick={onRowClick}
          activeRowId={activeRowId}
          getRowClassName={getRowClassName}
        />
      </div>

      {/* ── confirm popup for mixed-selection bulk actions ─────────────────── */}
      <Modal
        show={pendingAction !== null}
        onHide={() => setPendingAction(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {pendingAction === "delete"
              ? "Delete Selected"
              : "Restore Selected"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingAction === "delete" ? (
            <p className="mb-0">
              Your selection includes{" "}
              <strong>{deletedSelectedIds.length}</strong> already-deleted
              record{deletedSelectedIds.length !== 1 ? "s" : ""}. Only the{" "}
              <strong>{activeSelectedIds.length}</strong> active record
              {activeSelectedIds.length !== 1 ? "s" : ""} will be deleted;
              deleted records will be skipped.
            </p>
          ) : (
            <p className="mb-0">
              Your selection includes{" "}
              <strong>{activeSelectedIds.length}</strong> active record
              {activeSelectedIds.length !== 1 ? "s" : ""}. Only the{" "}
              <strong>{deletedSelectedIds.length}</strong> deleted record
              {deletedSelectedIds.length !== 1 ? "s" : ""} will be restored;
              active records will be skipped.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setPendingAction(null)}>
            Cancel
          </Button>
          <Button variant={"success"} onClick={handleConfirmPendingAction}>
            Okay
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
