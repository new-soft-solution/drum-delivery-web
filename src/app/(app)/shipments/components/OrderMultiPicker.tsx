"use client";
import { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
  useInfiniteQuery,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import Select from "react-select";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getOrder, getOrders } from "@/services/order.service";
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

export const OrderMultiPicker = ({
  value,
  onChange,
}: OrderMultiPickerProps) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>(value);
  const [prevValueKey, setPrevValueKey] = useState(value.join(","));
  const valueKey = value.join(",");
  if (valueKey !== prevValueKey) {
    setPrevValueKey(valueKey);
    setSeenIds((prev) => Array.from(new Set([...prev, ...value])));
  }

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["orders-picker"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getOrders({ page: pageParam, status: "CREATED" }),
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce(
          (n, p) => n + (p?.results?.length ?? 0),
          0,
        );
        const total = lastPage?.count ?? 0;
        return loaded < total ? allPages.length + 1 : undefined;
      },
      // staleTime: 60 * 1000,
    });

  // De-duplicated by id up front — infinite-query pages can overlap if the
  // underlying list shifts between page fetches (e.g. an order's status
  // changes and it drops out of the CREATED filter mid-scroll).
  const orders = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [data]);

  // Resolve every id ever seen in this form session directly, regardless
  // of whether it's CREATED or already loaded on a fetched page.
  const missingIds = useMemo(
    () => seenIds.filter((id) => !orders.some((o) => o.id === id)),
    [seenIds, orders],
  );
  const selectedOrderQueries = useQueries({
    queries: missingIds.map((id) => ({
      queryKey: ["order", id],
      queryFn: () => getOrder(id),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const resolvedSelectedOrders = selectedOrderQueries
    .map((q) => q.data)
    .filter((o): o is Order => !!o);

  // Dedupe against the base list — an order that was fetched individually
  // (because it wasn't loaded yet) can later also show up in `orders`
  // once pagination reaches it; without this, it would render twice.
  const options: Option[] = useMemo(() => {
    const extra = resolvedSelectedOrders.filter(
      (o) => !orders.some((base) => base.id === o.id),
    );
    return [...orders, ...extra].map(mapOrderToOption);
  }, [orders, resolvedSelectedOrders]);
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
