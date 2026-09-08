"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { SiteName } from "@/components/ui/SiteName/SiteName";
import { Shipment, SHIPMENT_STATUS_LABELS } from "@/types/shipment.type";
import React from "react";

export const ShipmentDetails: React.FC<{ shipment: Shipment }> = ({
  shipment,
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Shipment Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow
              label="Shipment Number"
              value={shipment.shipment_number || "—"}
              icon="ri-ship-line"
            />
            <DetailRow
              label="Destination"
              value={<SiteName siteId={shipment.destination_site} />}
              icon="ri-map-pin-line"
            />
            <DetailRow
              label="Invoice Number"
              value={shipment.invoice_no || "—"}
              icon="ri-file-list-3-line"
            />
            <DetailRow
              label="BL Number"
              value={shipment.bl_no || "—"}
              icon="ri-file-text-line"
            />
          </div>
          <div className="col-md-6">
            <DetailRow
              label="Status"
              value={
                <StatusBadge
                  status={
                    SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status
                  }
                />
              }
              icon="ri-radar-line"
            />
            <DetailRow
              label="Expected Arrival"
              value={
                shipment.expected_arrival_date
                  ? new Date(
                      shipment.expected_arrival_date,
                    ).toLocaleDateString()
                  : "—"
              }
              icon="ri-calendar-event-line"
            />
            <DetailRow
              label="Linked Orders"
              value={shipment.orders.length}
              icon="ri-clipboard-line"
            />
            <DetailRow
              label="Linked Drums"
              value={shipment.drums.length}
              icon="ri-box-3-line"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
