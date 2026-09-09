"use client";
import { Form } from "react-bootstrap";
import { CountrySelect } from "@/components/ui/country-select/CountrySelect";
import { COUNTRY_LIST } from "@/assets/data/country-list";
import { SiteFilterType } from "@/types/site.type";

interface FilterProps {
  tempFilters: SiteFilterType;
  onTempFilterChange: (filters: SiteFilterType) => void;
}

// /api/sites/ (confirmed) supports city, country, and name as dedicated
// query filters (name is already covered by the table's search box).
const SiteFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  return (
    <div className="row g-3">
      <div className="col-md-6">
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
      <div className="col-md-6">
        <Form.Group>
          <Form.Label>City</Form.Label>
          <Form.Control
            value={tempFilters.city || ""}
            placeholder="e.g., Sande"
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

export default SiteFilter;
