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
import { getClient, getClients } from "@/services/client.service";
import type { Client } from "@/types/client.type";
import { QuickCreateClientModal } from "./QuickCreateClientModal";

type Option = { value: string; label: string };

interface ClientPickerProps {
  value: string;
  onChange: (clientId: string) => void;
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

const mapClientToOption = (c: Client): Option => ({
  value: c.id,
  label: c.name,
});

export const ClientPicker = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
}: ClientPickerProps) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(value);
  if (value && value !== lastSeenId) {
    setLastSeenId(value);
  }

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["clients-picker"],
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
      // staleTime: 60 * 1000,
    });

  // De-duplicated by id up front — infinite-query pages can overlap if the
  // underlying list shifts between page fetches.
  const clients = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [data]);

  const isValueLoaded = !lastSeenId || clients.some((c) => c.id === lastSeenId);
  const { data: selectedClient } = useQuery({
    queryKey: ["client", lastSeenId],
    queryFn: () => getClient(lastSeenId),
    enabled: !!lastSeenId && !isValueLoaded,
    staleTime: 5 * 60 * 1000,
  });

  // Dedupe against the base list — a client that was fetched individually
  // (because it wasn't loaded yet) can later also show up in `clients`
  // once pagination reaches it; without this, it would render twice.
  const options: Option[] = useMemo(() => {
    const extra =
      selectedClient && !clients.some((c) => c.id === selectedClient.id)
        ? [selectedClient]
        : [];
    return [...clients, ...extra].map(mapClientToOption);
  }, [clients, selectedClient]);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>
          Client <span className="text-danger">*</span>
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
                isFetching ? "Loading…" : "No clients found."
              }
              placeholder="Select client…"
              menuPortalTarget={selectMenuPortalTarget}
              classNamePrefix="react-select"
              styles={selectStyles(isInvalid)}
            />
          </div>
          <Button
            variant="outline-primary"
            className=" d-inline-flex align-items-center gap-1 flex-shrink-0 px-2"
            onClick={() => setShowCreateModal(true)}
          >
            <IconifyIcon icon="ri:add-line" width={16} height={16} />
            {/*<span className="fw-semibold small">New Client</span>*/}
          </Button>
        </div>
        {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
        {isInvalid && errorMessage && (
          <div className="invalid-feedback d-block">{errorMessage}</div>
        )}
      </Form.Group>

      <QuickCreateClientModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={(client) => {
          queryClient.invalidateQueries({ queryKey: ["clients-picker"] });
          queryClient.invalidateQueries({ queryKey: ["clients"] });
          onChange(client.id);
          setShowCreateModal(false);
        }}
      />
    </>
  );
};

export default ClientPicker;
