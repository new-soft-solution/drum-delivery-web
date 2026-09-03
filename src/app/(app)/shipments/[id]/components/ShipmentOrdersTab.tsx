"use client";
import { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getShipmentOrderIds, unassignOrderFromShipment } from "@/services/drum-tracer/shipment.service";
import { getOrder, updateOrder } from "@/services/order.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import AssignOrdersModal from "./AssignOrdersModal";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ShipmentOrdersTab = ({ shipmentId }: { shipmentId: number }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showAssign, setShowAssign] = useState(false);

  const { data: linkData, isLoading: idsLoading } = useQuery({
    queryKey: ["shipment-order-ids", shipmentId],
    queryFn: () => getShipmentOrderIds(shipmentId),
  });

  const orderIds = linkData?.results ?? [];
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["shipment-orders-detail", shipmentId, orderIds],
    queryFn: () => Promise.all(orderIds.map((id) => getOrder(id))),
    enabled: orderIds.length > 0,
  });

  const isLoading = idsLoading || (orderIds.length > 0 && ordersLoading);

  const removeMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await unassignOrderFromShipment(shipmentId, orderId);
      try {
        await updateOrder(orderId, { status: "CREATED" });
      } catch {
        // best-effort only
      }
    },
    onSuccess: () => {
      showNotification({
        message: "Order removed from shipment",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["shipment-order-ids", shipmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
      ) : orderIds.length === 0 ? (
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
              <th>Order Number</th>
              <th>Client</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td className="fw-bold">
                  <Link href="/orders">{o.order_number}</Link>
                </td>
                <td>{o.client_details?.name ?? "Unknown"}</td>
                <td>
                  <StatusBadge status={STATUS_LABELS[o.status] ?? o.status} />
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(o.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AssignOrdersModal
        show={showAssign}
        onHide={() => setShowAssign(false)}
        shipmentId={shipmentId}
      />
    </div>
  );
};

export default ShipmentOrdersTab;
