"use client";
import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { getSite, getSites } from "@/services/site.service";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_OPTIONS,
  ShipmentFilterType,
} from "@/types/shipment.type";

interface FilterProps {
  tempFilters: ShipmentFilterType;
  onTempFilterChange: (filters: ShipmentFilterType) => void;
}

type SiteOption = { value: string; label: string };

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

const ShipmentFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  const destinationSite = (tempFilters.destination_site as string) || "";
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["sites-for-shipment-filter"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) => getSites({ page: pageParam }),
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

  const sites = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [data]);
  const isValueLoaded =
    !destinationSite || sites.some((s) => s.id === destinationSite);
  const { data: selectedSite } = useQuery({
    queryKey: ["site", destinationSite],
    queryFn: () => getSite(destinationSite),
    enabled: !!destinationSite && !isValueLoaded,
    staleTime: 5 * 60 * 1000,
  });

  const siteOptions: SiteOption[] = useMemo(() => {
    const extra =
      selectedSite && !sites.some((s) => s.id === selectedSite.id)
        ? [selectedSite]
        : [];
    return [...sites, ...extra].map((s) => ({ value: s.id, label: s.name }));
  }, [sites, selectedSite]);
  const selectedSiteOption =
    siteOptions.find((o) => o.value === destinationSite) ?? null;

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
            {SHIPMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SHIPMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Destination Site</Form.Label>
          <Select<SiteOption>
            options={siteOptions}
            value={selectedSiteOption}
            onChange={(option) =>
              onTempFilterChange({
                ...tempFilters,
                destination_site: option?.value ?? undefined,
              })
            }
            isSearchable
            isClearable
            isLoading={isFetching && !isFetchingNextPage}
            onMenuScrollToBottom={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            noOptionsMessage={() =>
              isFetching ? "Loading…" : "No sites found."
            }
            placeholder="All Sites"
            menuPortalTarget={selectMenuPortalTarget}
            classNamePrefix="react-select"
            styles={selectStyles}
          />
          {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Arrival After</Form.Label>
          <Form.Control
            type="date"
            value={tempFilters.expected_arrival_date_after || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                expected_arrival_date_after: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>Arrival Before</Form.Label>
          <Form.Control
            type="date"
            value={tempFilters.expected_arrival_date_before || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                expected_arrival_date_before: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default ShipmentFilter;
