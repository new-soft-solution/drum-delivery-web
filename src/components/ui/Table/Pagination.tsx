import clsx from "clsx";
import IconifyIcon from "../../wrappers/IconifyIcon";
import { Col, Row } from "react-bootstrap";
import { ReactTablePaginationProps } from "@/types/component-props.type";
import { useMemo } from "react";

const getVisiblePages = (totalPages: number, currentPage: number): number[] => {
  const tp = Math.max(1, totalPages || 1);
  const cp = Math.min(Math.max(1, currentPage || 1), tp);

  if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1);
  if (cp <= 3) return [1, 2, 3, 4, 5];
  if (cp >= tp - 2) return [tp - 4, tp - 3, tp - 2, tp - 1, tp];
  return [cp - 2, cp - 1, cp, cp + 1, cp + 2];
};

const Pagination = <RowType,>({
  table,
  count = 0,
  rowsPerPageList = [10, 25, 50, 100],
  currentPage,
  totalPages,
}: ReactTablePaginationProps<RowType>) => {
  // NEW: compute from props every render; avoids transient empty state
  const pageIndex = table.getState().pagination.pageIndex; // 0-based
  const pageSize = table.getState().pagination.pageSize;
  const visiblePages = useMemo(
    () => getVisiblePages(totalPages, currentPage),
    [totalPages, currentPage],
  );

  const safeTotalPages = Math.max(1, totalPages || 1);
  // ✅ RECORD RANGE CALCULATION
  const hasData = table.getRowModel().rows.length > 0;

  const startRecord = hasData ? pageIndex * pageSize + 1 : 0;

  const endRecord = hasData ? Math.min((pageIndex + 1) * pageSize, count) : 0;
  return (
    <Row className="align-items-center justify-content-between g-0 text-center text-sm-start py-3 border-top">
      <Col sm>
        <div
          className="d-flex align-items-center justify-content-between
        justify-content-sm-start gap-1 flex-wrap"
        >
          <div className="text-muted text-nowrap showing-count">
            Showing <span className="fw-semibold">{startRecord}</span> -{" "}
            <span className="fw-semibold">{endRecord}</span> of{" "}
            <span className="fw-semibold">{count}</span> records
          </div>
          <div className="d-flex align-items-center gap-1 showing-count">
            <label htmlFor="page-size-select">Show: </label>
            <select
              id="page-size-select"
              className="form-select w-auto page-size-select"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {rowsPerPageList.map((pageSize: number) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Col>
      <Col sm="auto" className="mt-3 mt-sm-0">
        <ul className="pagination pagination-rounded m-0 overflow-x-auto">
          <li className="page-item">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className={clsx("page-link", {
                disabled: !table.getCanPreviousPage(),
              })}
              aria-label="First"
            >
              <IconifyIcon
                icon="fa-solid:angle-double-left"
                height={10}
                width={10}
              />
            </button>
          </li>
          <li className="page-item">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={clsx("page-link", {
                disabled: !table.getCanPreviousPage(),
              })}
              aria-label="Previous"
            >
              <IconifyIcon
                icon="fa-solid:chevron-left"
                height={10}
                width={10}
              />
            </button>
          </li>

          {visiblePages[0] > 1 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {visiblePages.map((page) => (
            <li
              key={page}
              className={clsx("page-item", { active: page === currentPage })}
            >
              <button
                onClick={() => table.setPageIndex(page - 1)}
                className="page-link"
              >
                {page}
              </button>
            </li>
          ))}

          {visiblePages[visiblePages.length - 1] < safeTotalPages && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          <li className="page-item">
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={clsx("page-link", {
                disabled: !table.getCanNextPage(),
              })}
              aria-label="Next"
            >
              <IconifyIcon
                icon="fa-solid:chevron-right"
                height={10}
                width={10}
              />
            </button>
          </li>
          <li className="page-item">
            <button
              onClick={() => table.setPageIndex(safeTotalPages - 1)}
              disabled={!table.getCanNextPage()}
              className={clsx("page-link", {
                disabled: !table.getCanNextPage(),
              })}
              aria-label="Last"
            >
              <IconifyIcon
                icon="fa-solid:angle-double-right"
                height={10}
                width={10}
              />
            </button>
          </li>
        </ul>
      </Col>
    </Row>
  );
};

export default Pagination;
