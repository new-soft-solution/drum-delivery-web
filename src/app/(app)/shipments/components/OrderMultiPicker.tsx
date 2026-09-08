"use client";
import { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order.type";
import { QuickCreateOrderModal } from "./QuickCreateOrderModal";

type Option = { value: string; label: string };

interface OrderMultiPickerProps {
  value: string[];
  onChange: (orderIds: string[]) => void;
}

const selectMenuPortalTarget =
  typeof document !== "undefined" ? document.body : undefined;
const selectStyles = () => ({
  menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }),
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    borderRadius: 8,
    borderColor: state.isFocused ? "#203975 !important" : "#dee2e6",
    minHeight: 40,
    "&:hover": { borderColor: "#203975 !important" },
  }),
});

const mapOrderToOption = (o: Order): Option => ({
  value: o.id,
  label: `${o.order_number} · ${o.client_details?.name ?? "Unknown"}`,
});

/**
 * Orders (a Shipment can carry many) are a multi-select version of the
 * same ClientPicker/SitePicker pattern: react-select, infinite scroll for
 * pagination, no per-keystroke network call, and a separate "New Order"
 * button for creating one inline instead of an inline creatable option.
 * Only CREATED (not yet assigned) orders are offered — matches the
 * existing AssignOrdersModal convention on the Shipment detail page.
 */
export const OrderMultiPicker = ({
  value,
  onChange,
}: OrderMultiPickerProps) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["orders-picker"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getOrders({ page: pageParam, page_size: 20, status: "CREATED" }),
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce(
          (n, p) => n + (p?.results?.length ?? 0),
          0,
        );
        const total = lastPage?.count ?? 0;
        return loaded < total ? allPages.length + 1 : undefined;
      },
      staleTime: 60 * 1000,
    });

  const orders = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [data],
  );
  const options: Option[] = useMemo(
    () => orders.map(mapOrderToOption),
    [orders],
  );
  const selected = options.filter((o) => value.includes(o.value));

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Orders</Form.Label>
        <div className="d-flex align-items-start gap-2">
          <div className="flex-grow-1">
            <Select<Option, true>
              isMulti
              options={options}
              value={selected}
              onChange={(opts) => onChange(opts.map((o) => o.value))}
              isSearchable
              isLoading={isFetching && !isFetchingNextPage}
              onMenuScrollToBottom={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              noOptionsMessage={() =>
                isFetching ? "Loading…" : "No unassigned orders found."
              }
              placeholder="Select orders…"
              menuPortalTarget={selectMenuPortalTarget}
              classNamePrefix="react-select"
              styles={selectStyles()}
            />
          </div>
          <Button
            variant="outline-primary"
            className="d-inline-flex align-items-center gap-1 flex-shrink-0 px-2"
            onClick={() => setShowCreateModal(true)}
          >
            <IconifyIcon icon="ri:add-line" width={16} height={16} />
            {/*<span className="fw-semibold small">New Order</span>*/}
          </Button>
        </div>
        {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
      </Form.Group>

      <QuickCreateOrderModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={(order) => {
          queryClient.invalidateQueries({ queryKey: ["orders-picker"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          onChange([...value, order.id]);
          setShowCreateModal(false);
        }}
      />
    </>
  );
};

export default OrderMultiPicker;
