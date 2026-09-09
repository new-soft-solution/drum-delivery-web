"use client";
import { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getShipment, setShipmentOrders } from "@/services/shipment.service";
import { getOrder, updateOrder } from "@/services/order.service";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import AssignOrdersModal from "./AssignOrdersModal";
import { QuickCreateOrderModal } from "@/app/(app)/shipments/components/QuickCreateOrderModal";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ShipmentOrdersTab = ({ shipmentId }: { shipmentId: string }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showAssign, setShowAssign] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // The real Shipment object carries `orders` (an array of Order UUIDs)
  // directly — there's no separate link endpoint anymore.
  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
  });

  const orderIds = shipment?.orders ?? [];
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["shipment-orders-detail", shipmentId, orderIds],
    queryFn: () => Promise.all(orderIds.map((id) => getOrder(id))),
    enabled: orderIds.length > 0,
  });

  const isLoading = shipmentLoading || (orderIds.length > 0 && ordersLoading);

  const removeMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await setShipmentOrders(
        shipmentId,
        orderIds.filter((id) => id !== orderId),
      );
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
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // An order created from this tab is linked to this shipment right away
  // — that's the point of creating it from here rather than from the main
  // Orders page.
  const linkMutation = useMutation({
    mutationFn: (orderId: string) =>
      setShipmentOrders(shipmentId, [...orderIds, orderId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () =>
      showNotification({
        message:
          "Order created, but couldn't be linked to this shipment automatically — use Assign Orders.",
        variant: "danger",
      }),
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Orders in this Shipment</h5>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowAssign(true)}
          >
            + Assign Orders
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + New Order
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : orderIds.length === 0 ? (
        <EmptyState
          icon="ri:clipboard-line"
          title="No orders linked yet"
          description="Assign purchase orders to this shipment, or create a new one."
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
        currentOrderIds={orderIds}
      />

      <QuickCreateOrderModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={(order) => {
          setShowCreate(false);
          linkMutation.mutate(order.id);
        }}
      />
    </div>
  );
};

export default ShipmentOrdersTab;
