"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { Site } from "@/types/site.type";
import { siteFormSchema, SiteFormValues } from "@/types/schemas/site.schema";
import { createSite, updateSite } from "@/services/site.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { CountrySelect } from "@/components/ui/country-select/CountrySelect";
import { COUNTRY_LIST } from "@/assets/data/country-list";
import RHFPhoneNumberInput from "@/components/ui/PhoneNumberInput/RHFPhoneNumberInput";

interface SiteFormProps {
  item?: Site;
  onCancel: () => void;
  onSuccess: () => void;
}

export const SiteForm = ({
  item: site,
  onCancel,
  onSuccess,
}: SiteFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!site;
  const { showNotification } = useNotificationContext();

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: site?.name || "",
      address: site?.address || "",
      city: site?.city || "",
      state: site?.state || "",
      country: site?.country || "",
      postal_code: site?.postal_code || "",
      contact_person: site?.contact_person || "",
      contact_phone: site?.contact_phone || "",
      is_active: site?.is_active ?? true,
    },
  });

  const mutation = useMutation<unknown, NormalizedError, SiteFormValues>({
    mutationFn: (payload) =>
      isEdit && site?.id ? updateSite(site.id, payload) : createSite(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "Site updated successfully"
          : "Site created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      onSuccess();
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Something went wrong!",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  return (
    <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <Row>
        <Col md={6}>
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
        <Col md={6}>
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
            <Form.Label>City</Form.Label>
            <Form.Control {...form.register("city")} placeholder="Enter city" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>State / Province</Form.Label>
            <Form.Control
              {...form.register("state")}
              placeholder="Enter state or province"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Controller
              name="country"
              control={form.control}
              defaultValue={form.getValues("country")}
              render={({ field }) => (
                <CountrySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select country"
                  countries={COUNTRY_LIST || []}
                />
              )}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              {...form.register("postal_code")}
              placeholder="Enter postal code"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control
              {...form.register("contact_person")}
              placeholder="Enter contact person's name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <RHFPhoneNumberInput
              name="contact_phone"
              control={form.control}
              label="Contact Phone"
              placeholder="Enter contact phone number"
              defaultCountry="NL"
              size={"lg"}
            />
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3 d-flex align-items-end pb-2">
              <Form.Check
                type="switch"
                id="site-is-active"
                label="Active"
                {...form.register("is_active")}
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
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
