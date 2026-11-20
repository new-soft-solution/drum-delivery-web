"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { Site } from "@/types/site.type";
import React from "react";

export const SiteDetails: React.FC<{ site: Site }> = ({ site }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Site Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow
              label="Site Name"
              value={site.name || "—"}
              icon="ri-map-pin-line"
            />
            <DetailRow
              label="Site ID"
              value={site.site_id || "—"}
              icon="ri-hashtag"
            />
            <DetailRow
              label="Address"
              value={site.address || "—"}
              icon="ri-road-map-line"
            />
            <DetailRow
              label="City / State"
              value={[site.city, site.state].filter(Boolean).join(", ") || "—"}
              icon="ri-map-2-line"
            />
          </div>
          <div className="col-md-6">
            <DetailRow
              label="Postal Code"
              value={site.postal_code || "—"}
              icon="ri-mail-send-line"
            />
            <DetailRow
              label="Country"
              value={site.country || "—"}
              icon="ri-flag-line"
            />
            <DetailRow
              label="Contact Person"
              value={site.contact_person || "—"}
              icon="ri-user-line"
            />
            <DetailRow
              label="Contact Phone"
              value={site.contact_phone || "—"}
              icon="ri-phone-line"
            />
            <DetailRow
              label="Status"
              value={
                <StatusBadge status={site.is_active ? "Active" : "Inactive"} />
              }
              icon="ri-radar-line"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;
