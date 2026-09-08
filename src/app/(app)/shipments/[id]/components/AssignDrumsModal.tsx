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

  // /api/drums/ (confirmed) supports a real `status` filter now — used
  // here server-side instead of fetching everything and filtering client-side.
  const { data, isLoading } = useQuery({
    queryKey: ["drums-for-assign", search],
    queryFn: () => getDrums({ search, status: "AVAILABLE" }),
    enabled: show,
  });

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

  const candidates = (data?.results ?? []).filter(
    (d) => !currentDrumIds.includes(d.id),
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
