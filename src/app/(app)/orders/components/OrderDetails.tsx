"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { Order } from "@/types/order.type";
import React from "react";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const OrderDetails: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Order Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="Order Number" value={order.order_number || "—"} icon="ri-file-list-3-line" />
            <DetailRow label="Client" value={order.client_details?.name || "—"} icon="ri-building-line" />
            <DetailRow
              label="Quantity"
              value={order.quantity != null ? `${order.quantity} ${order.unit ?? ""}`.trim() : "—"}
              icon="ri-stack-line"
            />
          </div>
          <div className="col-md-6">
            <DetailRow
              label="Status"
              value={<StatusBadge status={STATUS_LABELS[order.status] ?? order.status} />}
              icon="ri-radar-line"
            />
            <DetailRow
              label="Created"
              value={new Date(order.creation_date ?? order.created_at).toLocaleDateString()}
              icon="ri-calendar-line"
            />
            <DetailRow
              label="Order Status Flag"
              value={<StatusBadge status={order.is_active ? "Active" : "Inactive"} />}
              icon="ri-toggle-line"
            />
          </div>
        </div>
        <div className="mt-3">
          <h5>Description</h5>
          <p className="text-muted mb-0">{order.description || "No description"}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
