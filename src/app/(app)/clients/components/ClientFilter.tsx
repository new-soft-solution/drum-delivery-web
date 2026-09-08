"use client";
import { Form } from "react-bootstrap";
import { CountrySelect } from "@/components/ui/country-select/CountrySelect";
import { COUNTRY_LIST } from "@/assets/data/country-list";
import { ClientFilterType } from "@/types/client.type";

interface FilterProps {
  tempFilters: ClientFilterType;
  onTempFilterChange: (filters: ClientFilterType) => void;
}
const ClientFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  return (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <Form.Group>
          <Form.Label>Country</Form.Label>
          <CountrySelect
            countries={COUNTRY_LIST}
            value={tempFilters.country || ""}
            placeholder="Select a country..."
            onValueChange={(value) =>
              onTempFilterChange({
                ...tempFilters,
                country: value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
      <div className="col-12 col-md-6">
        <Form.Group>
          <Form.Label>City</Form.Label>
          <Form.Control
            value={tempFilters.city || ""}
            placeholder="e.g., Amsterdam"
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                city: e.target.value || undefined,
              })
            }
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default ClientFilter;
