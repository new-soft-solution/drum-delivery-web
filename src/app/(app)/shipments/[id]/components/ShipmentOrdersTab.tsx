"use client";
import { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getShipmentOrders, unassignOrderFromShipment } from "@/services/drum-tracer/shipment.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";
import { AssignOrdersModal } from "./AssignOrdersModal";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const ShipmentOrdersTab = ({ shipmentId }: { shipmentId: number }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showAssign, setShowAssign] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dt-shipment-orders", shipmentId],
    queryFn: () => getShipmentOrders(shipmentId),
  });

  const removeMutation = useMutation({
    mutationFn: (orderId: number) => unassignOrderFromShipment(shipmentId, orderId),
    onSuccess: () => {
      showNotification({ message: "Order removed from shipment", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["dt-shipment-orders", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["dt-orders"] });
    },
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Orders in this Shipment</h5>
        <Button size="sm" onClick={() => setShowAssign(true)}>
          + Assign Orders
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.results.length === 0 ? (
        <EmptyState
          icon="ri:clipboard-line"
          title="No orders linked yet"
          description="Assign purchase orders to this shipment to track what's being delivered."
          actionLabel="Assign Orders"
          onAction={() => setShowAssign(true)}
        />
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>P.O Number</th>
              <th>Client</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((o) => (
              <tr key={o!.id}>
                <td className="fw-bold">
                  <Link href={`/orders`}>{o!.po_number}</Link>
                </td>
                <td>{o!.client_name}</td>
                <td>
                  <StatusBadge status={o!.status} />
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(o!.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AssignOrdersModal show={showAssign} onHide={() => setShowAssign(false)} shipmentId={shipmentId} />
    </div>
  );
};

export default ShipmentOrdersTab;
