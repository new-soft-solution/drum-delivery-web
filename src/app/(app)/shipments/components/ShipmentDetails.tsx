"use client";
import { Nav } from "react-bootstrap";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  getShipmentDrumIds,
  getShipmentSiteNames,
  Shipment,
  SHIPMENT_STATUS_LABELS,
} from "@/types/shipment.type";
import React, { useState } from "react";
import { formatDateNL } from "@/utils/dateFormatter";
import { AttachmentManager } from "@/components/ui/AttachmentManager/AttachmentManager";

export const ShipmentDetails: React.FC<{ shipment: Shipment }> = ({
  shipment,
}) => {
  const [tab, setTab] = useState<"details" | "attachments">("details");
  return (
    <>
      <Nav
        variant="tabs"
        className="mb-3"
        activeKey={tab}
        onSelect={(k) => k && setTab(k as "details" | "attachments")}
      >
        <Nav.Item>
          <Nav.Link eventKey="details">Details</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="attachments">Attachments</Nav.Link>
        </Nav.Item>
      </Nav>
      {tab === "details" ? (
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
                  value={getShipmentSiteNames(shipment).join(", ") || "—"}
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
                        SHIPMENT_STATUS_LABELS[shipment.status] ??
                        shipment.status
                      }
                    />
                  }
                  icon="ri-radar-line"
                />
                <DetailRow
                  label="Expected Arrival"
                  value={
                    shipment.expected_arrival_date
                      ? formatDateNL(shipment.expected_arrival_date)
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
                  value={getShipmentDrumIds(shipment).length}
                  icon="ri-box-3-line"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <AttachmentManager owner={{ shipment: shipment.id }} />
          </div>
        </div>
      )}
    </>
  );
};

export default ShipmentDetails;
