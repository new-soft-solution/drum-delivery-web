"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { DTShipment } from "@/types/drum-tracer/shipment.type";
import React from "react";

export const ShipmentDetails: React.FC<{ shipment: DTShipment }> = ({ shipment }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Shipment Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="Shipment Number" value={shipment.shipment_number || "—"} icon="ri-ship-line" />
            <DetailRow label="Destination" value={shipment.destination_site_name || "—"} icon="ri-map-pin-line" />
            <DetailRow label="Invoice Number" value={shipment.invoice_number || "—"} icon="ri-file-list-3-line" />
            <DetailRow label="BL Number" value={shipment.bl_number || "—"} icon="ri-file-text-line" />
          </div>
          <div className="col-md-6">
            <DetailRow label="Status" value={<StatusBadge status={shipment.status} />} icon="ri-radar-line" />
            <DetailRow
              label="Expected Arrival"
              value={new Date(shipment.expected_arrival).toLocaleDateString()}
              icon="ri-calendar-event-line"
            />
            <DetailRow label="Linked Orders" value={shipment.order_ids.length} icon="ri-clipboard-line" />
            <DetailRow label="Linked Drums" value={shipment.drum_ids.length} icon="ri-box-3-line" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
