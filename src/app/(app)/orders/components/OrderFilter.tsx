"use client";
import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { getClient, getClients } from "@/services/client.service";
import { ORDER_STATUS_OPTIONS, OrderFilterType } from "@/types/order.type";

interface FilterProps {
  tempFilters: OrderFilterType;
  onTempFilterChange: (filters: OrderFilterType) => void;
}

type ClientOption = { value: string; label: string };

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const selectMenuPortalTarget =
  typeof document !== "undefined" ? document.body : undefined;
const selectStyles = {
  menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }),
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    borderRadius: 8,
    borderColor: state.isFocused ? "#203975 !important" : "#dee2e6",
    minHeight: 40,
    "&:hover": { borderColor: "#203975 !important" },
  }),
};

const OrderFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  const clientId = (tempFilters.client as string) || "";
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["clients-for-order-filter"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getClients({ page: pageParam, page_size: 20 }),
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

  const clients = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [data]);

  const isValueLoaded = !clientId || clients.some((c) => c.id === clientId);
  const { data: selectedClient } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClient(clientId),
    enabled: !!clientId && !isValueLoaded,
    staleTime: 5 * 60 * 1000,
  });

  const clientOptions: ClientOption[] = useMemo(() => {
    const extra =
      selectedClient && !clients.some((c) => c.id === selectedClient.id)
        ? [selectedClient]
        : [];
    return [...clients, ...extra].map((c) => ({ value: c.id, label: c.name }));
  }, [clients, selectedClient]);
  const selectedClientOption =
    clientOptions.find((o) => o.value === clientId) ?? null;

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={tempFilters.status || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                status: e.target.value || undefined,
              })
            }
          >
            <option value="">All Statuses</option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Client</Form.Label>
          <Select<ClientOption>
            options={clientOptions}
            value={selectedClientOption}
            onChange={(option) =>
              onTempFilterChange({
                ...tempFilters,
                client: option?.value ?? undefined,
              })
            }
            isSearchable
            isClearable
            isLoading={isFetching && !isFetchingNextPage}
            onMenuScrollToBottom={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            noOptionsMessage={() =>
              isFetching ? "Loading…" : "No clients found."
            }
            placeholder="All Clients"
            menuPortalTarget={selectMenuPortalTarget}
            classNamePrefix="react-select"
            styles={selectStyles}
          />
          {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
        </Form.Group>
      </div>
    </div>
  );
};

export default OrderFilter;
