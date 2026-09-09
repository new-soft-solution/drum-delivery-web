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
import { getDrum, getDrums } from "@/services/drum.service";
import type { Drum } from "@/types/drum.type";
import { QuickCreateDrumModal } from "./QuickCreateDrumModal";

type Option = { value: string; label: string };

interface DrumMultiPickerProps {
  value: string[];
  onChange: (drumIds: string[]) => void;
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

const mapDrumToOption = (d: Drum): Option => ({
  value: d.id,
  label: `${d.drum_number} · ${d.container_no || "—"}`,
});

export const DrumMultiPicker = ({ value, onChange }: DrumMultiPickerProps) => {
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
      queryKey: ["drums-picker"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getDrums({ page: pageParam, status: "AVAILABLE" }),
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
  // underlying list shifts between page fetches (e.g. a drum's status
  // changes and it drops out of the AVAILABLE filter mid-scroll).
  const drums = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  }, [data]);

  // Resolve every id ever seen in this form session directly, regardless
  // of whether it's AVAILABLE or already loaded on a fetched page.
  const missingIds = useMemo(
    () => seenIds.filter((id) => !drums.some((d) => d.id === id)),
    [seenIds, drums],
  );
  const selectedDrumQueries = useQueries({
    queries: missingIds.map((id) => ({
      queryKey: ["drum", id],
      queryFn: () => getDrum(id),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const resolvedSelectedDrums = selectedDrumQueries
    .map((q) => q.data)
    .filter((d): d is Drum => !!d);

  // Dedupe against the base list — a drum that was fetched individually
  // (because it wasn't loaded yet) can later also show up in `drums` once
  // pagination reaches it; without this, it would render twice.
  const options: Option[] = useMemo(() => {
    const extra = resolvedSelectedDrums.filter(
      (d) => !drums.some((base) => base.id === d.id),
    );
    return [...drums, ...extra].map(mapDrumToOption);
  }, [drums, resolvedSelectedDrums]);
  const selected = options.filter((o) => value.includes(o.value));

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Drums</Form.Label>
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
                isFetching ? "Loading…" : "No available drums found."
              }
              placeholder="Select drums…"
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
            {/*<span className="fw-semibold small">New Drum</span>*/}
          </Button>
        </div>
        {isFetchingNextPage && <Form.Text>Loading more…</Form.Text>}
      </Form.Group>

      <QuickCreateDrumModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={(drum) => {
          queryClient.invalidateQueries({ queryKey: ["drums-picker"] });
          queryClient.invalidateQueries({ queryKey: ["drums"] });
          onChange([...value, drum.id]);
          setShowCreateModal(false);
        }}
      />
    </>
  );
};

export default DrumMultiPicker;
