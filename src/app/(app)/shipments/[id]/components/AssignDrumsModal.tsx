"use client";
import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, InputGroup } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDrums } from "@/services/drum-tracer/drum.service";
import { assignDrumsToShipment } from "@/services/drum-tracer/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import Spinner from "@/components/Spinner";

interface AssignDrumsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: number;
}

export const AssignDrumsModal = ({ show, onHide, shipmentId }: AssignDrumsModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["dt-drums-unassigned", search],
    queryFn: () => getDrums({ assignment: "unassigned", search, page_size: 100 }),
    enabled: show,
  });

  const mutation = useMutation({
    mutationFn: () => assignDrumsToShipment(shipmentId, selected),
    onSuccess: () => {
      showNotification({ message: `${selected.length} drum(s) assigned`, variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["dt-shipment-drums", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["dt-drums-unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["dt-drums"] });
      setSelected([]);
      onHide();
    },
    onError: () => showNotification({ message: "Failed to assign drums", variant: "danger" }),
  });

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <ModalHeader closeButton>
        <h5 className="modal-title">Assign Drums to Shipment</h5>
      </ModalHeader>
      <ModalBody>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Search drums by number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {isLoading ? (
          <Spinner />
        ) : !data || data.results.length === 0 ? (
          <p className="text-muted text-center py-4">No available (unassigned) drums found.</p>
        ) : (
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {data.results.map((d) => (
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
                      · {d.container_number} · {d.length_km} KMs · Net {d.net_weight_mt} MT
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
          {mutation.isPending ? "Assigning..." : `Assign ${selected.length || ""} Drum(s)`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssignDrumsModal;
