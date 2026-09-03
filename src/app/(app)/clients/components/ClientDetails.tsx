"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { Client } from "@/types/client.type";
import React from "react";

interface ClientDetailsProps {
  client: Client;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Client Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="Client Name" value={client.name || "—"} icon="ri-building-line" />
            <DetailRow label="Client ID" value={client.client_id || "—"} icon="ri-hashtag" />
            <DetailRow label="Contact Person" value={client.contact_person || "—"} icon="ri-user-line" />
            <DetailRow label="Email" value={client.email || "—"} icon="ri-mail-line" />
            <DetailRow label="Phone" value={client.phone || "—"} icon="ri-phone-line" />
          </div>
          <div className="col-md-6">
            <DetailRow label="Address" value={client.address || "—"} icon="ri-map-pin-line" />
            <DetailRow
              label="City / State"
              value={[client.city, client.state].filter(Boolean).join(", ") || "—"}
              icon="ri-map-2-line"
            />
            <DetailRow label="Postal Code" value={client.postal_code || "—"} icon="ri-mail-send-line" />
            <DetailRow label="Country" value={client.country || "—"} icon="ri-flag-line" />
            <DetailRow
              label="Status"
              value={<StatusBadge status={client.is_active ? "Active" : "Inactive"} />}
              icon="ri-radar-line"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
