"use client";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { DTSite } from "@/types/drum-tracer/site.type";
import { dtSiteFormSchema, DTSiteFormValues } from "@/types/schemas/dt-site.schema";
import { createSite, updateSite } from "@/services/drum-tracer/site.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

const COUNTRIES = ["Netherlands", "Germany", "Belgium", "Bahrain", "United Arab Emirates", "Saudi Arabia"];

interface SiteFormProps {
  item?: DTSite;
  onCancel: () => void;
  onSuccess: () => void;
}

export const SiteForm = ({ item: site, onCancel, onSuccess }: SiteFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!site;
  const { showNotification } = useNotificationContext();

  const form = useForm<DTSiteFormValues>({
    resolver: zodResolver(dtSiteFormSchema),
    defaultValues: {
      name: site?.name || "",
      address: site?.address || "",
      city: site?.city || "",
      postal_code: site?.postal_code || "",
      state: site?.state || "",
      country: site?.country || "Netherlands",
      contact_person: site?.contact_person || "",
      contact_phone: site?.contact_phone || "",
    },
  });

  const mutation = useMutation<unknown, NormalizedError, DTSiteFormValues>({
    mutationFn: (payload) =>
      isEdit && site?.id ? updateSite(site.id, payload) : createSite(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit ? "Site updated successfully" : "Site created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["dt-sites"] });
      onSuccess();
    },
    onError: (error) => {
      showNotification({ message: error.message || "Something went wrong!", variant: "danger" });
      applyServerErrors(error, form.setError);
    },
  });

  return (
    <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>
              Site Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("name")}
              isInvalid={!!form.formState.errors.name}
              placeholder="Enter site name"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>
              Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("address")}
              isInvalid={!!form.formState.errors.address}
              placeholder="Enter street address"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.address?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              City <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control {...form.register("city")} isInvalid={!!form.formState.errors.city} />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.city?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control {...form.register("postal_code")} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Country <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select {...form.register("country")}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control {...form.register("contact_person")} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Contact Phone</Form.Label>
            <Form.Control {...form.register("contact_phone")} />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={onCancel} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className="d-flex align-items-center justify-content-center gap-1">
              <span>Submitting...</span>
              <Spinner color="white" size="sm" className="me-2" />
            </div>
          ) : isEdit ? (
            "Update Site"
          ) : (
            "Create Site"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default SiteForm;
