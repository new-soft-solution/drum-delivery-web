"use client";

import { useQuery } from "@tanstack/react-query";
import { Table } from "react-bootstrap";
import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  TRUCK_DELIVERY_STATUS_LABELS,
  TruckDelivery,
} from "@/types/truck-delivery.type";
import { DRUM_STATUS_LABELS } from "@/types/drum.type";
import React from "react";
import { formatDateNLAMPMSS } from "@/utils/dateFormatter";
import { formatDrumNumber } from "@/utils/formatDrumNumber";
import { getShipment } from "@/services/shipment.service";
import { getDrums } from "@/services/drum.service";
import Spinner from "@/components/Spinner";

const TruckDeliveryTraceability: React.FC<{ shipmentId: string }> = ({
  shipmentId,
}) => {
  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
    enabled: !!shipmentId,
  });

  const drumIds = shipment?.drums ?? [];
  const { data: drumsData, isLoading: drumsLoading } = useQuery({
    queryKey: ["truck-delivery-traceability-drums", shipmentId, drumIds],
    queryFn: () =>
      getDrums({ ids: drumIds.join(","), page_size: drumIds.length }),
    enabled: drumIds.length > 0,
  });
  const drums = drumsData?.results ?? [];

  if (shipmentLoading) {
    return <Spinner />;
  }

  if (!shipment) {
    return (
      <p className="text-muted small mb-0">
        Linked shipment could not be loaded.
      </p>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-4 mb-3">
        <DetailRow
          label="Shipment Number"
          value={shipment.shipment_number || "—"}
          icon="ri-ship-line"
        />
        <DetailRow
          label="Invoice No."
          value={shipment.invoice_no || "—"}
          icon="ri-file-list-3-line"
        />
        <DetailRow
          label="B/L No."
          value={shipment.bl_no || "—"}
          icon="ri-file-text-line"
        />
      </div>

      {drumsLoading ? (
        <Spinner />
      ) : drums.length === 0 ? (
        <p className="text-muted small mb-0">
          No drums are linked to this shipment yet.
        </p>
      ) : (
        <Table responsive hover size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Drum Number</th>
              <th>Container</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drums.map((d) => (
              <tr key={d.id}>
                <td className="fw-bold">{formatDrumNumber(d.drum_number)}</td>
                <td>{d.container_no || "—"}</td>
                <td>
                  <StatusBadge
                    status={DRUM_STATUS_LABELS[d.status] ?? d.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

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
              value={delivery.shipment_number || "—"}
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
        <div className="mt-4">
          <h5 className="mb-3">Shipment &amp; Drums (Traceability)</h5>
          {delivery.shipment ? (
            <TruckDeliveryTraceability shipmentId={delivery.shipment} />
          ) : (
            <p className="text-muted small mb-0">
              This truck delivery isn&apos;t linked to a shipment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruckDeliveryDetails;
