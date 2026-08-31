"use client";

import DetailRow from "@/components/ui/DetailRow/DetailRow";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { DTDrum } from "@/types/drum-tracer/drum.type";
import React from "react";

export const DrumDetails: React.FC<{ drum: DTDrum }> = ({ drum }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Drum Information</h4>
        <div className="row">
          <div className="col-md-6">
            <DetailRow label="Drum Number" value={drum.drum_number || "—"} icon="ri-box-3-line" />
            <DetailRow label="Container" value={drum.container_number || "—"} icon="ri-archive-line" />
            <DetailRow label="Status" value={<StatusBadge status={drum.status} />} icon="ri-radar-line" />
          </div>
          <div className="col-md-6">
            <DetailRow label="Length" value={`${drum.length_km} KMs`} icon="ri-ruler-line" />
            <DetailRow label="Net Weight" value={`${drum.net_weight_mt} MT`} icon="ri-scales-3-line" />
            <DetailRow label="Gross Weight" value={`${drum.gross_weight_mt} MT`} icon="ri-scales-3-line" />
          </div>
        </div>
        <div className="mt-3">
          <h5>Notes</h5>
          <p className="text-muted mb-0">{drum.notes || "No notes"}</p>
        </div>
      </div>
    </div>
  );
};

export default DrumDetails;
