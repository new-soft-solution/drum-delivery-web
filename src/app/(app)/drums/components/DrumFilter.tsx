"use client";
import { Form } from "react-bootstrap";
import { DrumFilterType } from "@/types/drum.type";

interface FilterProps {
  tempFilters: DrumFilterType;
  onTempFilterChange: (filters: DrumFilterType) => void;
}

const DrumFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
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
            <option value="Available">Available</option>
            <option value="In Transit">In Transit</option>
            <option value="Missing">Missing</option>
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default DrumFilter;
