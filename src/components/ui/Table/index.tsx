import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Table } from "react-bootstrap";
import Pagination from "./Pagination";
import type { ReactTableProps } from "@/types/component-props.type";
import Spinner from "@/components/Spinner";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";

const ReactTable = <RowType extends { id: string | number }>({
  options,
  columns,
  data,
  count = 0,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  showPagination = true,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowsPerPageList = [10, 25, 50, 100],
  tableClass,
  theadClass,
  isFetching = false,
  error,
  renderTopToolbar,
  renderBottomToolbar,
  getRowClassName,
  enableDragDrop = false,
  onDragEnd: onDragEndProp,
  isDragDisabled = false,
  onRowClick,
  activeRowId,
}: ReactTableProps<RowType>) => {
  const isRowActive = (row: RowType): boolean =>
    activeRowId != null && String(row.id) === String(activeRowId);
  // Selector for elements that already handle their own click — when the
  // user clicks these, we skip the row-level callback so checkboxes,
  // dropdowns and action buttons keep working as expected.
  const INTERACTIVE_SELECTOR =
    'button, a, input, select, textarea, label, [role="menu"], [role="menuitem"], [role="button"]';

  const handleRowActivate = (
    e: React.MouseEvent<HTMLTableRowElement>,
    row: RowType,
  ) => {
    if (!onRowClick) return;
    if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    onRowClick(row);
  };

  const handleRowKey = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    row: RowType,
  ) => {
    if (!onRowClick) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    e.preventDefault();
    onRowClick(row);
  };
  const table = useReactTable({
    ...options,
    data,
    columns,
    pageCount: options?.pageCount,
    state: {
      pagination,
      sorting,
      rowSelection,
      columnVisibility,
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange: onRowSelectionChange,
    onColumnVisibilityChange: onColumnVisibilityChange
      ? (updater) => {
          const newVisibility =
            typeof updater === "function"
              ? updater(columnVisibility ?? {})
              : updater;
          onColumnVisibilityChange(newVisibility);
        }
      : undefined,
    getRowId: (row) => String(row.id),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const currentPage = pagination.pageIndex + 1;

  // NEW: keep the last non-zero pageCount to avoid flicker when it briefly becomes 0
  const rawTotalPages = options?.pageCount ?? table.getPageCount();
  const [displayTotalPages, setDisplayTotalPages] = useState<number>(
    Math.max(1, rawTotalPages || 1),
  );
  useEffect(() => {
    if (rawTotalPages > 0) {
      setDisplayTotalPages(rawTotalPages);
    }
    // If rawTotalPages is 0, keep previous displayTotalPages
  }, [rawTotalPages]);

  return (
    <div className="react-table-wrapper">
      {/* Top Toolbar */}
      {renderTopToolbar && (
        <div className="react-table-toolbar">{renderTopToolbar(table)}</div>
      )}

      {/* Table */}
      <div className="react-table-container">
        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (
              !enableDragDrop ||
              !onDragEndProp ||
              !result.destination ||
              result.source.index === result.destination.index
            )
              return;
            onDragEndProp(result.source.index, result.destination.index);
          }}
        >
          <Table hover responsive className={`${tableClass} overflow-visible`}>
            <thead className={theadClass}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {enableDragDrop && <th style={{ width: 40 }} />}
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      <div className="d-flex align-items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <button
                            className="btn btn-link p-0 ms-1 border-0 bg-transparent"
                            onClick={() => header.column.toggleSorting()}
                            aria-label={`Sort by ${header.column.id}`}
                          >
                            {!header.column.getIsSorted() ? (
                              <ArrowUpDown size={14} />
                            ) : header.column.getIsSorted() === "asc" ? (
                              <ArrowUp size={14} className="text-primary" />
                            ) : (
                              <ArrowDown size={14} className="text-primary" />
                            )}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <Droppable
              droppableId="table-body"
              isDropDisabled={!enableDragDrop}
            >
              {(droppableProvided, droppableSnapshot) => (
                <tbody
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={droppableSnapshot.isDraggingOver ? "bg-light" : ""}
                >
                  {isFetching && (
                    <tr>
                      <td
                        colSpan={columns.length + (enableDragDrop ? 1 : 0)}
                        className="text-center"
                      >
                        <Spinner wrapperClass="d-flex vh-50 align-items-center justify-content-center" />
                      </td>
                    </tr>
                  )}
                  {!isFetching &&
                    table.getRowModel().rows.map((row, index) =>
                      enableDragDrop ? (
                        <Draggable
                          key={row.id}
                          draggableId={row.id}
                          index={index}
                          isDragDisabled={isDragDisabled}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={[
                                snapshot.isDragging ? "shadow-sm bg-white" : "",
                                onRowClick ? "row-clickable" : "",
                                isRowActive(row.original) ? "row-active" : "",
                                getRowClassName ? getRowClassName(row) : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={{
                                ...provided.draggableProps.style,
                                ...(snapshot.isDragging
                                  ? {
                                      opacity: 0.95,
                                      outline: "2px solid var(--bs-primary)",
                                      borderRadius: 4,
                                    }
                                  : {}),
                                ...(onRowClick ? { cursor: "pointer" } : {}),
                              }}
                              onClick={(e) =>
                                handleRowActivate(e, row.original)
                              }
                              onKeyDown={(e) => handleRowKey(e, row.original)}
                              tabIndex={onRowClick ? 0 : undefined}
                            >
                              <td
                                {...provided.dragHandleProps}
                                style={{
                                  width: 40,
                                  cursor: isDragDisabled
                                    ? "not-allowed"
                                    : "grab",
                                  verticalAlign: "middle",
                                }}
                                className="text-center"
                              >
                                <IconifyIcon
                                  icon="mdi:drag"
                                  className={
                                    isDragDisabled
                                      ? "text-muted"
                                      : "text-secondary"
                                  }
                                  width={20}
                                  height={20}
                                />
                              </td>
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}
                        </Draggable>
                      ) : (
                        <tr
                          key={`${row.id}_${index}`}
                          className={
                            [
                              onRowClick ? "row-clickable" : "",
                              isRowActive(row.original) ? "row-active" : "",
                              getRowClassName ? getRowClassName(row) : "",
                            ]
                              .filter(Boolean)
                              .join(" ") || undefined
                          }
                          style={onRowClick ? { cursor: "pointer" } : undefined}
                          onClick={(e) => handleRowActivate(e, row.original)}
                          onKeyDown={(e) => handleRowKey(e, row.original)}
                          tabIndex={onRowClick ? 0 : undefined}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ),
                    )}
                  {enableDragDrop && droppableProvided.placeholder}
                  {!error &&
                    table.getRowModel().rows.length === 0 &&
                    !isFetching && (
                      <tr>
                        <td colSpan={columns.length + (enableDragDrop ? 1 : 0)}>
                          <div className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="bg-light rounded-circle p-4">
                              <IconifyIcon
                                icon="lucide:database-zap"
                                className="text-muted"
                                width={48}
                                height={48}
                              />
                            </div>
                            <h5 className="text-muted mb-2">
                              No Data Available
                            </h5>
                            <p className="text-muted mb-3">
                              We couldn&apos;t find any records matching your
                              criteria
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  {error && table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length + (enableDragDrop ? 1 : 0)}
                        className="text-center"
                      >
                        <ErrorMessage
                          message={
                            error.message ||
                            "Error Fetching Data! Please try again."
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </div>

      {/* Bottom Toolbar */}
      {renderBottomToolbar ? (
        <div className="react-table-toolbar mt-3">
          {renderBottomToolbar(table)}
        </div>
      ) : (
        showPagination && (
          <Pagination
            table={table}
            currentPage={currentPage}
            totalPages={displayTotalPages}
            rowsPerPageList={rowsPerPageList}
            pagination={pagination}
            count={count}
          />
        )
      )}
    </div>
  );
};

export default ReactTable;
