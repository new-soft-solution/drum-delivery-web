"use client";
import { Form } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { getSites } from "@/services/site.service";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_OPTIONS,
  ShipmentFilterType,
} from "@/types/shipment.type";

interface FilterProps {
  tempFilters: ShipmentFilterType;
  onTempFilterChange: (filters: ShipmentFilterType) => void;
}

// /api/shipments/ (confirmed) supports status, destination_site, and
// expected_arrival_date_after/before as dedicated query filters.
const ShipmentFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  const { data: sitesData } = useQuery({
    queryKey: ["sites-for-shipment-filter"],
    queryFn: () => getSites({}),
  });

  return (
    <div className="row g-3">
      <div className="col-12">
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={tempFilters.status || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                status: e.target.value || undefined,
              })
            }
          >
            <option value="">All Statuses</option>
            {SHIPMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SHIPMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-12">
        <Form.Group>
          <Form.Label>Destination Site</Form.Label>
          <Form.Select
            value={tempFilters.destination_site || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                destination_site: e.target.value || undefined,
              })
            }
          >
            <option value="">All Sites</option>
            {sitesData?.results.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-6">
        <Form.Group>
          <Form.Label>Arrival After</Form.Label>
          <Form.Control
            type="date"
            value={tempFilters.expected_arrival_date_after || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                expected_arrival_date_after: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
      <div className="col-6">
        <Form.Group>
          <Form.Label>Arrival Before</Form.Label>
          <Form.Control
            type="date"
            value={tempFilters.expected_arrival_date_before || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                expected_arrival_date_before: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default ShipmentFilter;
