// src/app/(app)/shipments/[id]/components/AssignDrumsModal.tsx
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
import { getDrums, updateDrum } from "@/services/drum.service";
import {
  assignDrumsToShipment,
  getShipmentDrumIds,
} from "@/services/drum-tracer/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import Spinner from "@/components/Spinner";

interface AssignDrumsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: number;
}

export const AssignDrumsModal = ({
  show,
  onHide,
  shipmentId,
}: AssignDrumsModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // The real /api/drums/ endpoint has no "assignment" filter (that concept
  // doesn't exist server-side — Shipments are still local/mock). Instead:
  // fetch real drums (optionally search-filtered), exclude ones already
  // linked to *this* shipment locally, and treat any status other than
  // AVAILABLE as a heuristic for "probably already spoken for".
  const { data: linkedIds } = useQuery({
    queryKey: ["shipment-drum-ids", shipmentId],
    queryFn: () => getShipmentDrumIds(shipmentId),
    enabled: show,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["drums-for-assign", search],
    queryFn: () => getDrums({ search }),
    enabled: show,
  });

  const alreadyLinked = new Set(linkedIds?.results ?? []);
  const candidates = (data?.results ?? []).filter(
    (d) => !alreadyLinked.has(d.id) && d.status === "AVAILABLE",
  );

  const mutation = useMutation({
    mutationFn: async () => {
      await assignDrumsToShipment(shipmentId, selected);
      // Best-effort: reflect the link on the real drum too.
      await Promise.allSettled(
        selected.map((id) => updateDrum(id, { status: "IN_SHIPMENT" })),
      );
    },
    onSuccess: () => {
      showNotification({
        message: `${selected.length} drum(s) assigned`,
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["shipment-drum-ids", shipmentId],
      });
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
        ) : candidates.length === 0 ? (
          <p className="text-muted text-center py-4">
            No available drums to assign.
          </p>
        ) : (
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
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
