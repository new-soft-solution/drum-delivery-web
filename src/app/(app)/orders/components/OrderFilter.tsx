"use client";
import { Form } from "react-bootstrap";
import { DTOrderFilterType } from "@/types/drum-tracer/order.type";

interface FilterProps {
  tempFilters: DTOrderFilterType;
  onTempFilterChange: (filters: DTOrderFilterType) => void;
}

const OrderFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
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
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default OrderFilter;
