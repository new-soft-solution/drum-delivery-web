"use client";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "react-bootstrap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setShipmentSiteDrums } from "@/services/shipment.service";
import type { ShipmentSite } from "@/types/shipment.type";
import { useNotificationContext } from "@/context/useNotificationContext";
import { updateDrum } from "@/services/drum.service";
import { DrumPickerWithImport } from "@/app/(app)/shipments/components/Drumpickerwithimport";

interface AssignDrumsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: string;
  sites: ShipmentSite[];
  siteId: string;
}

export const AssignDrumsModal = ({
  show,
  onHide,
  shipmentId,
  sites,
  siteId,
}: AssignDrumsModalProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const siteName = sites.find((s) => s.site === siteId)?.site_name;
  const current = sites.find((s) => s.site === siteId)?.drums ?? [];
  const [selected, setSelected] = useState<string[]>(current);

  const handleHide = () => onHide();

  const mutation = useMutation({
    mutationFn: async () => {
      await setShipmentSiteDrums(shipmentId, sites, siteId, selected);
      // Best-effort: reflect the link on each real drum too.
      const removed = current.filter((id) => !selected.includes(id));
      const added = selected.filter((id) => !current.includes(id));
      await Promise.allSettled([
        ...added.map((id) => updateDrum(id, { status: "IN_SHIPMENT" })),
        ...removed.map((id) => updateDrum(id, { status: "AVAILABLE" })),
      ]);
    },
    onSuccess: () => {
      showNotification({
        message: "Drums updated",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
      handleHide();
    },
    onError: () =>
      showNotification({
        message: "Failed to assign drums",
        variant: "danger",
      }),
  });

  return (
    <Modal show={show} onHide={handleHide} size="lg" centered>
      <ModalHeader closeButton>
        <h5 className="modal-title">Assign Drums to {siteName}</h5>
      </ModalHeader>
      <ModalBody>
        <DrumPickerWithImport value={selected} onChange={setSelected} />
      </ModalBody>
      <ModalFooter>
        <Button variant="outline-secondary" onClick={handleHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Assigning..." : "Assign Drum(s)"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssignDrumsModal;
