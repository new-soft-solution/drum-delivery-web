"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { DTTruckDelivery } from "@/types/drum-tracer/truck-delivery.type";
import React from "react";

export const TruckDeliveryDetails: React.FC<{ delivery: DTTruckDelivery }> = ({ delivery }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Truck Delivery Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="Truck Number" value={delivery.truck_number || "—"} icon="ri-truck-line" />
            <DetailRow label="Shipment" value={delivery.shipment_number || "—"} icon="ri-ship-line" />
            <DetailRow label="License Plate" value={delivery.license_plate || "—"} icon="ri-car-line" />
          </div>
          <div className="col-md-6">
            <DetailRow label="Driver" value={delivery.driver_name || "—"} icon="ri-user-line" />
            <DetailRow label="Driver Phone" value={delivery.driver_phone || "—"} icon="ri-phone-line" />
            <DetailRow label="Status" value={<StatusBadge status={delivery.status} />} icon="ri-radar-line" />
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
