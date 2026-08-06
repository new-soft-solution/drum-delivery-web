"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import { DTSite } from "@/types/drum-tracer/site.type";
import React from "react";

export const SiteDetails: React.FC<{ site: DTSite }> = ({ site }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Site Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="Site Name" value={site.name || "—"} icon="ri-map-pin-line" />
            <DetailRow label="Address" value={site.address || "—"} icon="ri-road-map-line" />
            <DetailRow label="City" value={site.city || "—"} icon="ri-map-2-line" />
            <DetailRow label="Postal Code" value={site.postal_code || "—"} icon="ri-mail-send-line" />
          </div>
          <div className="col-md-6">
            <DetailRow label="Country" value={site.country || "—"} icon="ri-flag-line" />
            <DetailRow label="Contact Person" value={site.contact_person || "—"} icon="ri-user-line" />
            <DetailRow label="Contact Phone" value={site.contact_phone || "—"} icon="ri-phone-line" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;
