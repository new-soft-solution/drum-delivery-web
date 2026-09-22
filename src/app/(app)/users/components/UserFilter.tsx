"use client";
import { Form } from "react-bootstrap";
import { UserFilterType } from "@/types/user.type";

interface FilterProps {
  tempFilters: UserFilterType;
  onTempFilterChange: (filters: UserFilterType) => void;
}

// /api/users/ (confirmed) supports `role` as a dedicated query filter.
// There's no confirmed enum of valid roles, so this is a plain text
// filter rather than a fixed dropdown.
const UserFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  return (
    <div className="row g-3">
      <div className="col-6">
        <Form.Group>
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={tempFilters.role || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                role: e.target.value || undefined,
              })
            }
          >
            <option value="">All Role</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Operator">Operator</option>
            <option value="User">User</option>
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default UserFilter;
