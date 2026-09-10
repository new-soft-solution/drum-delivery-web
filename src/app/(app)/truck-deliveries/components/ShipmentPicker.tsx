"use client";
import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { getShipment, getShipments } from "@/services/shipment.service";
import type { Shipment } from "@/types/shipment.type";

type Option = { value: string; label: string };

interface ShipmentPickerProps {
  value: string;
  onChange: (shipmentId: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

const selectMenuPortalTarget =
  typeof document !== "undefined" ? document.body : undefined;
const selectStyles = (isInvalid?: boolean) => ({
  menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }),
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    borderRadius: 8,
    borderColor: isInvalid
      ? "#dc3545 !important"
      : state.isFocused
        ? "#203975 !important"
        : "#dee2e6",
    minHeight: 40,
    "&:hover": {
      borderColor: isInvalid ? "#dc3545 !important" : "#203975 !important",
    },
  }),
});

const mapShipmentToOption = (s: Shipment): Option => ({
  value: s.id,
  label: s.shipment_number,
});

/**
 * Same react-select + infinite-scroll pattern as SitePicker/ClientPicker —
 * no "New Shipment" button here, though: creating a Shipment is its own
 * multi-tab flow (destination site, drums, orders...), not a one/two-field
 * quick-create like a Site or Drum.
 */
export const ShipmentPicker = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
}: ShipmentPickerProps) => {
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["shipments-picker"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) => getShipments({ page: pageParam }),
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

  // De-duplicated by id up front — infinite-query pages can overlap if the
  // underlying list shifts between page fetches.
  const shipments = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [data]);

  // If a shipment was set earlier (editing) and isn't on the first fetched
  // page, resolve it directly so it still shows a real number instead of
  // the raw id.
  const isValueLoaded = !value || shipments.some((s) => s.id === value);
  const { data: selectedShipment } = useQuery({
    queryKey: ["shipment", value],
    queryFn: () => getShipment(value),
    enabled: !!value && !isValueLoaded,
    staleTime: 5 * 60 * 1000,
  });

  // Dedupe against the base list — a shipment resolved individually can
  // later also show up in `shipments` once pagination reaches it.
  const options: Option[] = useMemo(() => {
    const extra =
      selectedShipment && !shipments.some((s) => s.id === selectedShipment.id)
        ? [selectedShipment]
        : [];
    return [...shipments, ...extra].map(mapShipmentToOption);
  }, [shipments, selectedShipment]);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        Shipment <span className="text-danger">*</span>
      </Form.Label>
      <Select<Option>
        options={options}
        value={selected}
        onChange={(option) => onChange(option?.value ?? "")}
        isSearchable
        isClearable
        isLoading={isFetching && !isFetchingNextPage}
        onMenuScrollToBottom={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        noOptionsMessage={() =>
          isFetching ? "Loading…" : "No shipments found."
        }
        placeholder="Select shipment…"
        menuPortalTarget={selectMenuPortalTarget}
        classNamePrefix="react-select"
        styles={selectStyles(isInvalid)}
      />
      {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
      {isInvalid && errorMessage && (
        <div className="invalid-feedback d-block">{errorMessage}</div>
      )}
    </Form.Group>
  );
};

export default ShipmentPicker;
