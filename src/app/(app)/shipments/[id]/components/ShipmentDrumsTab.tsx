"use client";
import { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getShipment, setShipmentDrums } from "@/services/shipment.service";
import { getDrum, updateDrum } from "@/services/drum.service";
import { DRUM_STATUS_LABELS } from "@/types/drum.type";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";
import { AssignDrumsModal } from "./AssignDrumsModal";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const ShipmentDrumsTab = ({ shipmentId }: { shipmentId: string }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showAssign, setShowAssign] = useState(false);

  // The real Shipment object carries `drums` (an array of Drum UUIDs)
  // directly — there's no separate link endpoint anymore.
  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
  });

  const drumIds = shipment?.drums ?? [];
  const { data: drums, isLoading: drumsLoading } = useQuery({
    queryKey: ["shipment-drums-detail", shipmentId, drumIds],
    queryFn: () => Promise.all(drumIds.map((id) => getDrum(id))),
    enabled: drumIds.length > 0,
  });

  const isLoading = shipmentLoading || (drumIds.length > 0 && drumsLoading);

  const removeMutation = useMutation({
    mutationFn: async (drumId: string) => {
      await setShipmentDrums(
        shipmentId,
        drumIds.filter((id) => id !== drumId),
      );
      try {
        await updateDrum(drumId, { status: "AVAILABLE" });
      } catch {
        // best-effort only
      }
    },
    onSuccess: () => {
      showNotification({
        message: "Drum removed from shipment",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
    },
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Drums in this Shipment</h5>
        <Button size="sm" onClick={() => setShowAssign(true)}>
          + Assign Drums
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : drumIds.length === 0 ? (
        <EmptyState
          icon="ri:box-3-line"
          title="No drums assigned yet"
          description="Assign drums from your available inventory to this shipment."
          actionLabel="Assign Drums"
          onAction={() => setShowAssign(true)}
        />
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Drum Number</th>
              <th>Container</th>
              <th>Length (KMs)</th>
              <th>Net (MT)</th>
              <th>Gross (MT)</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(drums ?? []).map((d) => (
              <tr key={d.id}>
                <td className="fw-bold">{d.drum_number}</td>
                <td>{d.container_no || "—"}</td>
                <td>{d.length_kms}</td>
                <td>{d.net_weight_mt}</td>
                <td>{d.gross_weight_mt}</td>
                <td>
                  <StatusBadge
                    status={DRUM_STATUS_LABELS[d.status] ?? d.status}
                  />
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(d.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AssignDrumsModal
        show={showAssign}
        onHide={() => setShowAssign(false)}
        shipmentId={shipmentId}
        currentDrumIds={drumIds}
      />
    </div>
  );
};

export default ShipmentDrumsTab;
