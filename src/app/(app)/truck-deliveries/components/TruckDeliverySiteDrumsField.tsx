"use client";
import { useMemo } from "react";
import { Col, Form } from "react-bootstrap";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { getSites } from "@/services/site.service";
import { getDrums } from "@/services/drum.service";
import { formatDrumNumber } from "@/utils/formatDrumNumber";

type Option = { value: string; label: string };

interface TruckDeliverySiteDrumsFieldProps {
  shipmentId: string;
  siteId: string;
  drumIds: string[];
  onSiteChange: (siteId: string) => void;
  onDrumsChange: (drumIds: string[]) => void;
  siteError?: string;
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

/**
 * Cascading pickers for the Truck Delivery form:
 * shipment -> its destination sites -> that site's drums.
 */
export const TruckDeliverySiteDrumsField = ({
  shipmentId,
  siteId,
  drumIds,
  onSiteChange,
  onDrumsChange,
  siteError,
}: TruckDeliverySiteDrumsFieldProps) => {
  const { data: sitesData, isFetching: sitesLoading } = useQuery({
    queryKey: ["truck-delivery-shipment-sites", shipmentId],
    queryFn: () => getSites({ shipment_id: shipmentId, page_size: 100 }),
    enabled: !!shipmentId,
    staleTime: 60 * 1000,
  });
  const siteOptions: Option[] = (sitesData?.results ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const selectedSite = siteOptions.find((o) => o.value === siteId) ?? null;

  const {
    data: drumsData,
    isFetching: drumsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["truck-delivery-site-drums", shipmentId, siteId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getDrums({
        shipment_id: shipmentId,
        site_id: siteId,
        page: pageParam,
        page_size: 20,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (n, p) => n + (p?.results?.length ?? 0),
        0,
      );
      return loaded < (lastPage?.count ?? 0) ? allPages.length + 1 : undefined;
    },
    enabled: !!shipmentId && !!siteId,
    staleTime: 60 * 1000,
  });

  const drums = useMemo(() => {
    const all = (drumsData?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  }, [drumsData]);

  // Selected drums not on a loaded page yet (e.g. edit mode) — resolve labels.
  const missingIds = useMemo(
    () => drumIds.filter((id) => !drums.some((d) => d.id === id)),
    [drumIds, drums],
  );
  const { data: missingData } = useQuery({
    queryKey: ["truck-delivery-drums-resolve", missingIds],
    queryFn: () =>
      getDrums({ ids: missingIds.join(","), page_size: missingIds.length }),
    enabled: missingIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const drumOptions: Option[] = [...drums, ...(missingData?.results ?? [])].map(
    (d) => ({ value: d.id, label: formatDrumNumber(d.drum_number) }),
  );
  const selectedDrums = drumOptions.filter((o) => drumIds.includes(o.value));

  return (
    <>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Site</Form.Label>
          <Select<Option>
            options={siteOptions}
            value={selectedSite}
            onChange={(option) => onSiteChange(option?.value ?? "")}
            isDisabled={!shipmentId}
            isSearchable
            isClearable
            isLoading={sitesLoading}
            noOptionsMessage={() => "No sites on this shipment."}
            placeholder={
              shipmentId ? "Select site…" : "Select a shipment first"
            }
            menuPortalTarget={selectMenuPortalTarget}
            classNamePrefix="react-select"
            styles={selectStyles(!!siteError)}
          />
          {siteError && (
            <div className="invalid-feedback d-block">{siteError}</div>
          )}
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Drums</Form.Label>
          <Select<Option, true>
            isMulti
            options={drumOptions}
            value={selectedDrums}
            onChange={(opts) => onDrumsChange(opts.map((o) => o.value))}
            isDisabled={!siteId}
            isSearchable
            closeMenuOnSelect={false}
            isLoading={drumsLoading && !isFetchingNextPage}
            onMenuScrollToBottom={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            noOptionsMessage={() => "No drums for this site."}
            placeholder={siteId ? "Select drums…" : "Select a site first"}
            menuPortalTarget={selectMenuPortalTarget}
            classNamePrefix="react-select"
            styles={selectStyles()}
          />
          {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
        </Form.Group>
      </Col>
    </>
  );
};

export default TruckDeliverySiteDrumsField;
