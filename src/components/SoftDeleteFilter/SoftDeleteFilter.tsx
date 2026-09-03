"use client";
import { Form } from "react-bootstrap";
import { SoftDeleteFilterType } from "@/types/soft-delete.type";

interface FilterProps {
  tempFilters: SoftDeleteFilterType;
  onTempFilterChange: (filters: SoftDeleteFilterType) => void;
}

const SoftDeleteFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  const handleChange = (deleted: string) => {
    onTempFilterChange({
      ...tempFilters,
      deleted,
    });
  };
  return (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Deleted Status</Form.Label>
          <Form.Select
            value={tempFilters.deleted || ""}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Select One...</option>
            <option value="include">All</option>
            <option value="only">Only Deleted</option>
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default SoftDeleteFilter;
