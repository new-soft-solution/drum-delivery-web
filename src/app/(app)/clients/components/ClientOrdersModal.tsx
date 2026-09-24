"use client";
import { useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { CellContext } from "@tanstack/react-table";
import { getOrders } from "@/services/order.service";
import type { Client } from "@/types/client.type";
import type { Order, OrderFilterType } from "@/types/order.type";
import type { NormalizedError } from "@/types/error.type";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { formatDateNL } from "@/utils/dateFormatter";
import { useCRUDTable } from "@/components/Crud/hooks/useCRUDTable";
import { CRUDTable } from "@/components/Crud/CRUDTable";
import { CRUDTableState } from "@/types/crud.type";
import { OrderDetails } from "@/app/(app)/orders/components/OrderDetails";

interface ClientOrdersModalProps {
  show: boolean;
  onHide: () => void;
  client: Client | null;
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ClientOrdersModal = ({
  show,
  onHide,
  client,
}: ClientOrdersModalProps) => {
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const { state, setState, buildQueryParams } = useCRUDTable<Order>(
    "client-orders-modal",
    async () => {},
    {
      isEdit: false,
      isView: false,
      isDelete: false,
      showCheckBox: false,
    },
  );
  const params = {
    ...buildQueryParams(),
    search: state.globalFilter || undefined,
    ordering: state.sorting?.length
      ? `${state.sorting[0].desc ? "-" : ""}${state.sorting[0].id}`
      : undefined,
    ...state.filters,
  };
  const { data, isFetching, error } = useQuery({
    queryKey: ["client-orders", params, client?.id],
    queryFn: () =>
      getOrders({
        search: params.search,
        ordering: params.ordering,
        client: client?.id,
        page:
          typeof state.pagination?.pageIndex === "number"
            ? state.pagination.pageIndex + 1
            : 1,
        page_size:
          typeof state.pagination?.pageSize === "number"
            ? state.pagination.pageSize
            : 10,
      }),
    enabled: show && !!client,
  });

  const rows = data?.results ?? [];

  const columns = useMemo(
    () => [
      {
        header: "Order Number",
        cell: (cell: CellContext<Order, unknown>) => (
          <Button
            variant="link"
            className="fw-bold p-0 text-decoration-none"
            onClick={() => setViewOrder(cell.row.original)}
          >
            {cell.row.original.order_number}
          </Button>
        ),
      },
      {
        header: "PO Number",
        cell: (cell: CellContext<Order, unknown>) =>
          cell.row.original.po_number || <span className="text-muted">—</span>,
      },
      {
        header: "Quantity",
        cell: (cell: CellContext<Order, unknown>) => {
          const o = cell.row.original;
          return o.quantity != null
            ? `${o.quantity.toLocaleString()} ${o.unit ?? ""}`.trim()
            : "—";
        },
      },
      {
        header: "Status",
        cell: (cell: CellContext<Order, unknown>) => (
          <StatusBadge
            status={
              STATUS_LABELS[cell.row.original.status] ??
              cell.row.original.status
            }
          />
        ),
      },
      {
        header: "Created",
        cell: (cell: CellContext<Order, unknown>) =>
          formatDateNL(
            cell.row.original.creation_date ?? cell.row.original.created_at,
          ),
      },
    ],
    [],
  );

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        size="xl"
        contentClassName="border border-2 rounded-3"
      >
        <ModalHeader closeButton>
          <div>
            <h5 className="modal-title mb-0">Orders for {client?.name}</h5>
            {data && (
              <p className="text-muted small mb-0">
                {data.count} order(s) total
              </p>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <CRUDTable<Order, OrderFilterType>
            data={rows}
            count={data?.count || 0}
            isLoading={isFetching}
            error={error as unknown as NormalizedError}
            columns={columns}
            state={state as CRUDTableState<Order, OrderFilterType>}
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
                  typeof sorting === "function"
                    ? sorting(prev.sorting)
                    : sorting,
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
            onFilterChange={(filters) =>
              setState((prev) => ({ ...prev, filters }))
            }
            options={{ entityName: "Order", tableHeader: "" }}
          />
        </ModalBody>
      </Modal>

      <Modal
        show={!!viewOrder}
        onHide={() => setViewOrder(null)}
        centered
        contentClassName="border border-2 rounded-3"
        size="lg"
      >
        <ModalHeader closeButton>
          <h5 className="modal-title mb-0">Order {viewOrder?.order_number}</h5>
        </ModalHeader>
        <ModalBody>{viewOrder && <OrderDetails order={viewOrder} />}</ModalBody>
      </Modal>
    </>
  );
};

export default ClientOrdersModal;
