"use client";
import { useState } from "react";
import {
  Button,
  Form,
  InputGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  // /api/orders/ (confirmed) supports a real `status` filter — CREATED is
  // the natural "not yet assigned to any shipment" state.
  const { data, isLoading } = useQuery({
    queryKey: ["orders-for-assign", search],
    queryFn: () => getOrders({ search, status: "CREATED" }),
    enabled: show,
  });

  const candidates = (data?.results ?? []).filter(
    (o) => !currentOrderIds.includes(o.id),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      await setShipmentOrders(shipmentId, [...currentOrderIds, ...selected]);
      // Best-effort: reflect the link on each real order too.
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
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Search orders by number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {isLoading ? (
          <Spinner />
        ) : candidates.length === 0 ? (
          <p className="text-muted text-center py-4">
            No unassigned orders to assign.
          </p>
        ) : (
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
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
