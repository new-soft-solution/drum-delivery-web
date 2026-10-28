"use client";
import { Button, Col, Row } from "react-bootstrap";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { ShipmentFormValues } from "@/types/schemas/shipment.schema";
import { SitePicker } from "./SitePicker";
import { DrumPickerWithImport } from "./Drumpickerwithimport";

interface ShipmentSitesFieldProps {
  form: UseFormReturn<ShipmentFormValues>;
}

/** Repeatable "destination site + its drums" rows for the Shipment form. */
export const ShipmentSitesField = ({ form }: ShipmentSitesFieldProps) => {
  const { control, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "sites" });
  const sitesError = formState.errors.sites;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Sites</h5>
        <Button
          type="button"
          variant="primary"
          onClick={() => append({ site: "", drums: [] })}
        >
          Add more
        </Button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="position-relative border rounded-4 p-3 mb-3"
          style={{ border: "1px solid #e2e7f1" }}
        >
          {fields.length > 1 && (
            <Button
              type="button"
              variant="danger"
              className="position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ top: -12, right: -12, width: 32, height: 32 }}
              aria-label={`Remove site ${index + 1}`}
              onClick={() => remove(index)}
            >
              <IconifyIcon icon="ri:close-line" width={18} height={18} />
            </Button>
          )}
          <Row>
            <Col md={6}>
              <Controller
                control={control}
                name={`sites.${index}.site`}
                render={({ field: f }) => (
                  <SitePicker
                    value={f.value}
                    onChange={(siteId) => {
                      f.onChange(siteId);
                      form.trigger("sites");
                    }}
                    isInvalid={!!sitesError?.[index]?.site}
                    errorMessage={sitesError?.[index]?.site?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name={`sites.${index}.drums`}
                render={({ field: f }) => (
                  <DrumPickerWithImport
                    value={f.value ?? []}
                    onChange={(ids) => {
                      f.onChange(ids);
                      form.trigger("sites");
                    }}
                  />
                )}
              />
              {sitesError?.[index]?.drums?.message && (
                <div className="invalid-feedback d-block mb-2">
                  {sitesError[index]?.drums?.message}
                </div>
              )}
            </Col>
          </Row>
        </div>
      ))}

      {(sitesError?.message || sitesError?.root?.message) && (
        <div className="invalid-feedback d-block">
          {sitesError?.message ?? sitesError?.root?.message}
        </div>
      )}
    </div>
  );
};

export default ShipmentSitesField;
