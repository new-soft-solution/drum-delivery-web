"use client";
import { Form } from "react-bootstrap";
import {
  DRUM_STATUS_LABELS,
  DRUM_STATUS_OPTIONS,
  DrumFilterType,
} from "@/types/drum.type";

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
            {DRUM_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {DRUM_STATUS_LABELS[s]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-12">
        <Form.Group>
          <Form.Label>Drum Number</Form.Label>
          <Form.Control
            value={tempFilters.drum_number || ""}
            placeholder="e.g., 168"
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                drum_number: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default DrumFilter;
