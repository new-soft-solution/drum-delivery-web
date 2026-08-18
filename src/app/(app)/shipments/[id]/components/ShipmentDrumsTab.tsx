"use client";
import { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getShipmentDrums, unassignDrumFromShipment } from "@/services/drum-tracer/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";
import { AssignDrumsModal } from "./AssignDrumsModal";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const ShipmentDrumsTab = ({ shipmentId }: { shipmentId: number }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showAssign, setShowAssign] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dt-shipment-drums", shipmentId],
    queryFn: () => getShipmentDrums(shipmentId),
  });

  const removeMutation = useMutation({
    mutationFn: (drumId: number) => unassignDrumFromShipment(shipmentId, drumId),
    onSuccess: () => {
      showNotification({ message: "Drum removed from shipment", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["dt-shipment-drums", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["dt-drums"] });
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
      ) : !data || data.results.length === 0 ? (
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
            {data.results.map((d) => (
              <tr key={d.id}>
                <td className="fw-bold">{d.drum_number}</td>
                <td>{d.container_number}</td>
                <td>{d.length_km}</td>
                <td>{d.net_weight_mt}</td>
                <td>{d.gross_weight_mt}</td>
                <td>
                  <StatusBadge status={d.status} />
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

      <AssignDrumsModal show={showAssign} onHide={() => setShowAssign(false)} shipmentId={shipmentId} />
    </div>
  );
};

export default ShipmentDrumsTab;
