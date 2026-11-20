"use client";
import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { getShipment, getShipments } from "@/services/shipment.service";
import {
  TRUCK_DELIVERY_STATUS_LABELS,
  TRUCK_DELIVERY_STATUS_OPTIONS,
  TruckDeliveryFilterType,
} from "@/types/truck-delivery.type";

interface FilterProps {
  tempFilters: TruckDeliveryFilterType;
  onTempFilterChange: (filters: TruckDeliveryFilterType) => void;
}

type ShipmentOption = { value: string; label: string };

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

const TruckDeliveryFilter = ({
  tempFilters,
  onTempFilterChange,
}: FilterProps) => {
  const shipmentId = (tempFilters.shipment as string) || "";
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["shipments-for-truck-delivery-filter"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getShipments({ page: pageParam, page_size: 20 }),
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

  const shipments = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [data]);

  const isValueLoaded =
    !shipmentId || shipments.some((s) => s.id === shipmentId);
  const { data: selectedShipment } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
    enabled: !!shipmentId && !isValueLoaded,
    staleTime: 5 * 60 * 1000,
  });

  const shipmentOptions: ShipmentOption[] = useMemo(() => {
    const extra =
      selectedShipment && !shipments.some((s) => s.id === selectedShipment.id)
        ? [selectedShipment]
        : [];
    return [...shipments, ...extra].map((s) => ({
      value: s.id,
      label: s.shipment_number,
    }));
  }, [shipments, selectedShipment]);
  const selectedShipmentOption =
    shipmentOptions.find((o) => o.value === shipmentId) ?? null;

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
            {TRUCK_DELIVERY_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {TRUCK_DELIVERY_STATUS_LABELS[s]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Shipment</Form.Label>
          <Select<ShipmentOption>
            options={shipmentOptions}
            value={selectedShipmentOption}
            onChange={(option) =>
              onTempFilterChange({
                ...tempFilters,
                shipment: option?.value ?? undefined,
              })
            }
            isSearchable
            isClearable
            isLoading={isFetching && !isFetchingNextPage}
            onMenuScrollToBottom={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            noOptionsMessage={() =>
              isFetching ? "Loading…" : "No shipments found."
            }
            placeholder="All Shipments"
            menuPortalTarget={selectMenuPortalTarget}
            classNamePrefix="react-select"
            styles={selectStyles}
          />
          {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Scheduled After</Form.Label>
          <Form.Control
            type="date"
            value={tempFilters.scheduled_date__gte || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                scheduled_date__gte: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Scheduled Before</Form.Label>
          <Form.Control
            type="date"
            value={tempFilters.scheduled_date__lte || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                scheduled_date__lte: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default TruckDeliveryFilter;
