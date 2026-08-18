"use client";
import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, InputGroup } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders } from "@/services/drum-tracer/order.service";
import { assignOrdersToShipment } from "@/services/drum-tracer/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import Spinner from "@/components/Spinner";

interface AssignOrdersModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: number;
}

export const AssignOrdersModal = ({ show, onHide, shipmentId }: AssignOrdersModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["dt-orders-unassigned", search],
    queryFn: () => getOrders({ assignment: "unassigned", search, page_size: 100 }),
    enabled: show,
  });

  const mutation = useMutation({
    mutationFn: () => assignOrdersToShipment(shipmentId, selected),
    onSuccess: () => {
      showNotification({ message: `${selected.length} order(s) assigned`, variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["dt-shipment-orders", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["dt-orders-unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["dt-orders"] });
      setSelected([]);
      onHide();
    },
    onError: () => showNotification({ message: "Failed to assign orders", variant: "danger" }),
  });

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <ModalHeader closeButton>
        <h5 className="modal-title">Assign Orders to Shipment</h5>
      </ModalHeader>
      <ModalBody>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Search orders by number or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {isLoading ? (
          <Spinner />
        ) : !data || data.results.length === 0 ? (
          <p className="text-muted text-center py-4">No unassigned orders available.</p>
        ) : (
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {data.results.map((o) => (
              <Form.Check
                key={o.id}
                type="checkbox"
                id={`order-${o.id}`}
                className="border-bottom py-2"
                checked={selected.includes(o.id)}
                onChange={() => toggle(o.id)}
                label={
                  <span>
                    <b>{o.po_number}</b> <span className="text-muted small">· {o.client_name}</span>
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
          {mutation.isPending ? "Assigning..." : `Assign ${selected.length || ""} Order(s)`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssignOrdersModal;
