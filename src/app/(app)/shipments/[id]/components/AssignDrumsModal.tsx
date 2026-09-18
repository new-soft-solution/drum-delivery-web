"use client";
import { useMemo, useState } from "react";
import {
  Button,
  Form,
  InputGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "react-bootstrap";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { setShipmentDrums } from "@/services/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import Spinner from "@/components/Spinner";
import { getDrums, updateDrum } from "@/services/drum.service";

interface AssignDrumsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: string;
  currentDrumIds: string[];
}

export const AssignDrumsModal = ({
  show,
  onHide,
  shipmentId,
  currentDrumIds,
}: AssignDrumsModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const effectiveSearch = search.trim().length >= 3 ? search.trim() : "";

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["drums-for-assign", effectiveSearch],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getDrums({
          search: effectiveSearch || undefined,
          status: "AVAILABLE",
          page: pageParam,
          page_size: 20,
        }),
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce(
          (n, p) => n + (p?.results?.length ?? 0),
          0,
        );
        const total = lastPage?.count ?? 0;
        return loaded < total ? allPages.length + 1 : undefined;
      },
      enabled: show,
    });
  const drums = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      await setShipmentDrums(shipmentId, [...currentDrumIds, ...selected]);
      // Best-effort: reflect the link on each real drum too.
      await Promise.allSettled(
        selected.map((id) => updateDrum(id, { status: "IN_SHIPMENT" })),
      );
    },
    onSuccess: () => {
      showNotification({
        message: `${selected.length} drum(s) assigned`,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["drums-for-assign"] });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
      setSelected([]);
      onHide();
    },
    onError: () =>
      showNotification({
        message: "Failed to assign drums",
        variant: "danger",
      }),
  });

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const candidates = drums.filter((d) => !currentDrumIds.includes(d.id));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const nearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 60;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <ModalHeader closeButton>
        <h5 className="modal-title">Assign Drums to Shipment</h5>
      </ModalHeader>
      <ModalBody>
        <InputGroup className="mb-1">
          <Form.Control
            placeholder="Search drums by number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Form.Text className="d-block mb-3 text-muted">
          {search.trim().length > 0 && search.trim().length < 3
            ? "Type at least 3 characters to search."
            : "\u00A0"}
        </Form.Text>

        {isLoading ? (
          <Spinner />
        ) : candidates.length === 0 ? (
          <p className="text-muted text-center py-4">
            No available drums to assign.
          </p>
        ) : (
          <div
            style={{ maxHeight: 380, overflowY: "auto" }}
            onScroll={handleScroll}
          >
            {candidates.map((d) => (
              <Form.Check
                key={d.id}
                type="checkbox"
                id={`drum-${d.id}`}
                className="border-bottom py-2"
                checked={selected.includes(d.id)}
                onChange={() => toggle(d.id)}
                label={
                  <span>
                    <b>{d.drum_number}</b>{" "}
                    <span className="text-muted small">
                      · {d.container_no || "—"} · {d.length_kms} KMs · Net{" "}
                      {d.net_weight_mt} MT
                    </span>
                  </span>
                }
              />
            ))}
            {isFetchingNextPage && (
              <div className="text-center py-2">
                <Spinner size="sm" />
                <span className="text-muted small ms-2">Loading more…</span>
              </div>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={selected.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending
            ? "Assigning..."
            : `Assign ${selected.length || ""} Drum(s)`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssignDrumsModal;
