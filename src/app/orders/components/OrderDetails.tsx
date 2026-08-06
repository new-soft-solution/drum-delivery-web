"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { DTOrder } from "@/types/drum-tracer/order.type";
import React from "react";

export const OrderDetails: React.FC<{ order: DTOrder }> = ({ order }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Order Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="P.O Number" value={order.po_number || "—"} icon="ri-file-list-3-line" />
            <DetailRow label="Client" value={order.client_name || "—"} icon="ri-building-line" />
          </div>
          <div className="col-md-6">
            <DetailRow label="Status" value={<StatusBadge status={order.status} />} icon="ri-radar-line" />
            <DetailRow
              label="Created"
              value={new Date(order.created_at).toLocaleDateString()}
              icon="ri-calendar-line"
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
