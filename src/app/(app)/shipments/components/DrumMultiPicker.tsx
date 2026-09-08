"use client";
import { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getDrums } from "@/services/drum.service";
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
  label: `${d.drum_number} · ${d.length_kms} km · ${d.net_weight_mt} MT`,
});

export const DrumMultiPicker = ({ value, onChange }: DrumMultiPickerProps) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["drums-picker"],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getDrums({ page: pageParam, page_size: 20, status: "AVAILABLE" }),
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

  const drums = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [data],
  );
  const options: Option[] = useMemo(() => drums.map(mapDrumToOption), [drums]);
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
