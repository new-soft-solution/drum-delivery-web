"use client";
import { Form } from "react-bootstrap";
import { DTTruckDeliveryFilterType } from "@/types/drum-tracer/truck-delivery.type";

interface FilterProps {
  tempFilters: DTTruckDeliveryFilterType;
  onTempFilterChange: (filters: DTTruckDeliveryFilterType) => void;
}

const TruckDeliveryFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
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
            <option value="Scheduled">Scheduled</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Overdue">Overdue</option>
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default TruckDeliveryFilter;
