"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { ShipmentNumber } from "@/components/ui/ShipmentNumber/ShipmentNumber";
import {
  TRUCK_DELIVERY_STATUS_LABELS,
  TruckDelivery,
} from "@/types/truck-delivery.type";
import React from "react";
import { formatDateNLAMPMSS } from "@/utils/dateFormatter";

const formatDateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString() : "—";

export const TruckDeliveryDetails: React.FC<{ delivery: TruckDelivery }> = ({
  delivery,
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Truck Delivery Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow
              label="Truck Number"
              value={delivery.truck_number || "—"}
              icon="ri-truck-line"
            />
            <DetailRow
              label="Shipment"
              value={<ShipmentNumber shipmentId={delivery.shipment} />}
              icon="ri-ship-line"
            />
            <DetailRow
              label="License Plate"
              value={delivery.license_plate || "—"}
              icon="ri-car-line"
            />
            <DetailRow
              label="Driver"
              value={delivery.driver_name || "—"}
              icon="ri-user-line"
            />
            <DetailRow
              label="Driver Phone"
              value={delivery.driver_phone || "—"}
              icon="ri-phone-line"
            />
          </div>
          <div className="col-md-6">
            <DetailRow
              label="Status"
              value={
                <StatusBadge
                  status={
                    TRUCK_DELIVERY_STATUS_LABELS[delivery.status] ??
                    delivery.status
                  }
                />
              }
              icon="ri-radar-line"
            />
            <DetailRow
              label="Scheduled"
              value={
                delivery.scheduled_date
                  ? formatDateNLAMPMSS(delivery.scheduled_date)
                  : "—"
              }
              icon="ri-calendar-line"
            />
            <DetailRow
              label="Actual Departure"
              value={
                delivery.actual_departure_date
                  ? formatDateNLAMPMSS(delivery.actual_departure_date)
                  : "—"
              }
              icon="ri-logout-box-line"
            />
            <DetailRow
              label="Actual Arrival"
              value={
                delivery.actual_arrival_date
                  ? formatDateNLAMPMSS(delivery.actual_arrival_date)
                  : "—"
              }
              icon="ri-login-box-line"
            />
          </div>
        </div>
        <div className="mt-3">
          <h5>Notes</h5>
          <p className="text-muted mb-0">{delivery.notes || "No notes"}</p>
        </div>
      </div>
    </div>
  );
};

export default TruckDeliveryDetails;
