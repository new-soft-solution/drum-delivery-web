"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { getOrders, updateOrder } from "@/services/order.service";
import { setShipmentOrders } from "@/services/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import Spinner from "@/components/Spinner";

interface AssignOrdersModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: string;
  currentOrderIds: string[];
}

export const AssignOrdersModal = ({
  show,
  onHide,
  shipmentId,
  currentOrderIds,
}: AssignOrdersModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const effectiveSearch = search.trim().length >= 3 ? search.trim() : "";

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["orders-for-assign", effectiveSearch],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getOrders({
          search: effectiveSearch || undefined,
          status: "CREATED",
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

  const orders = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p?.results ?? []);
    const seen = new Set<string>();
    return all.filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [data]);

  const candidates = orders.filter((o) => !currentOrderIds.includes(o.id));

  useEffect(() => {
    const root = scrollContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, rootMargin: "80px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, candidates.length]);

  const mutation = useMutation({
    mutationFn: async () => {
      await setShipmentOrders(shipmentId, [...currentOrderIds, ...selected]);
      await Promise.allSettled(
        selected.map((id) =>
          updateOrder(id, { status: "ASSIGNED_TO_SHIPMENT" }),
        ),
      );
    },
    onSuccess: () => {
      showNotification({
        message: `${selected.length} order(s) assigned`,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["orders-for-assign"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelected([]);
      onHide();
    },
    onError: () =>
      showNotification({
        message: "Failed to assign orders",
        variant: "danger",
      }),
  });

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <ModalHeader closeButton>
        <h5 className="modal-title">Assign Orders to Shipment</h5>
      </ModalHeader>
      <ModalBody>
        <InputGroup className="mb-1">
          <Form.Control
            placeholder="Search orders by number..."
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
            No unassigned orders to assign.
          </p>
        ) : (
          <div
            ref={scrollContainerRef}
            style={{ maxHeight: 380, overflowY: "auto" }}
          >
            {candidates.map((o) => (
              <Form.Check
                key={o.id}
                type="checkbox"
                id={`order-${o.id}`}
                className="border-bottom py-2"
                checked={selected.includes(o.id)}
                onChange={() => toggle(o.id)}
                label={
                  <span>
                    <b>{o.order_number}</b>{" "}
                    <span className="text-muted small">
                      · {o.client_details?.name ?? "Unknown"}
                      {o.quantity != null
                        ? ` · ${o.quantity} ${o.unit ?? ""}`.trim()
                        : ""}
                    </span>
                  </span>
                }
              />
            ))}
            <div ref={sentinelRef} style={{ height: 1 }} />
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
            : `Assign ${selected.length || ""} Order(s)`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssignOrdersModal;
