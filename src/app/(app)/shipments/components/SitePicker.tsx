"use client";
import { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Select from "react-select";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getSite, getSites } from "@/services/site.service";
import type { Site } from "@/types/site.type";
import { QuickCreateSiteModal } from "./QuickCreateSiteModal";

type Option = { value: string; label: string };

interface SitePickerProps {
  value: string;
  onChange: (siteId: string) => void;
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

const mapSiteToOption = (s: Site): Option => ({ value: s.id, label: s.name });

export const SitePicker = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
}: SitePickerProps) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(value);
  if (value && value !== lastSeenId) {
    setLastSeenId(value);
  }

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["sites-picker"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) => getSites({ page: pageParam, page_size: 20 }),
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
  // underlying list shifts between page fetches.
  const sites = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [data]);

  const isValueLoaded = !lastSeenId || sites.some((s) => s.id === lastSeenId);
  const { data: selectedSite } = useQuery({
    queryKey: ["site", lastSeenId],
    queryFn: () => getSite(lastSeenId),
    enabled: !!lastSeenId && !isValueLoaded,
    staleTime: 5 * 60 * 1000,
  });

  // Dedupe against the base list — a site that was fetched individually
  // (because it wasn't loaded yet) can later also show up in `sites` once
  // pagination reaches it; without this, it would render twice.
  const options: Option[] = useMemo(() => {
    const extra =
      selectedSite && !sites.some((s) => s.id === selectedSite.id)
        ? [selectedSite]
        : [];
    return [...sites, ...extra].map(mapSiteToOption);
  }, [sites, selectedSite]);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>
          Destination Site <span className="text-danger">*</span>
        </Form.Label>
        <div className="d-flex align-items-start gap-2">
          <div className="flex-grow-1">
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
                isFetching ? "Loading…" : "No sites found."
              }
              placeholder="Select site…"
              menuPortalTarget={selectMenuPortalTarget}
              classNamePrefix="react-select"
              styles={selectStyles(isInvalid)}
            />
          </div>
          <Button
            variant="outline-primary"
            className="d-inline-flex align-items-center gap-1 flex-shrink-0 px-2"
            onClick={() => setShowCreateModal(true)}
          >
            <IconifyIcon icon="ri:add-line" width={16} height={16} />
            {/*<span className="fw-semibold small">New Site</span>*/}
          </Button>
        </div>
        {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
        {isInvalid && errorMessage && (
          <div className="invalid-feedback d-block">{errorMessage}</div>
        )}
      </Form.Group>

      <QuickCreateSiteModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={(site) => {
          queryClient.invalidateQueries({ queryKey: ["sites-picker"] });
          queryClient.invalidateQueries({ queryKey: ["sites"] });
          onChange(site.id);
          setShowCreateModal(false);
        }}
      />
    </>
  );
};

export default SitePicker;
