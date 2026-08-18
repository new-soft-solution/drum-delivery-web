"use client";
import { Form } from "react-bootstrap";
import { DTShipmentFilterType } from "@/types/drum-tracer/shipment.type";

interface FilterProps {
  tempFilters: DTShipmentFilterType;
  onTempFilterChange: (filters: DTShipmentFilterType) => void;
}

const ShipmentFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  return (
    <div className="row g-3">
      <div className="col-12">
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={tempFilters.status || ""}
            onChange={(e) => onTempFilterChange({ ...tempFilters, status: e.target.value || undefined })}
          >
            <option value="">All Statuses</option>
            <option value="Created">Created</option>
            <option value="In Transit">In Transit</option>
            <option value="Arrived">Arrived</option>
            <option value="Delivered">Delivered</option>
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default ShipmentFilter;
