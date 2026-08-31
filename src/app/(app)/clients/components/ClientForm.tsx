"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { Client } from "@/types/client.type";
import { clientFormSchema, ClientFormValues } from "@/types/schemas/client.schema";
import { createClient, updateClient } from "@/services/client.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import RHFPhoneNumberInput from "@/components/ui/PhoneNumberInput/RHFPhoneNumberInput";
import { CountrySelect } from "@/components/ui/country-select/CountrySelect";
import { COUNTRY_LIST } from "@/assets/data/country-list";

interface ClientFormProps {
  item?: Client;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ClientForm = ({
  item: client,
  onCancel,
  onSuccess,
}: ClientFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!client;
  const { showNotification } = useNotificationContext();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      contact_person: client?.contact_person || "",
      phone: client?.phone || "",
      address: client?.address || "",
      city: client?.city || "",
      state: client?.state || "",
      country: client?.country || "",
      postal_code: client?.postal_code || "",
      is_active: client?.is_active ?? true,
    },
  });

  const mutation = useMutation<unknown, NormalizedError, ClientFormValues>({
    mutationFn: (payload) =>
      isEdit && client?.id
        ? updateClient(client.id, payload)
        : createClient(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "Client updated successfully"
          : "Client created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
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
              Client Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("name")}
              isInvalid={!!form.formState.errors.name}
              placeholder="Enter client company name"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Contact Person <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("contact_person")}
              isInvalid={!!form.formState.errors.contact_person}
              placeholder="Enter contact person's name"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.contact_person?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("email")}
              isInvalid={!!form.formState.errors.email}
              placeholder="Enter contact email"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <RHFPhoneNumberInput
              name="phone"
              control={form.control}
              label="Phone"
              placeholder="Enter phone number"
              defaultCountry="NL"
              size={"lg"}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              {...form.register("address")}
              placeholder="Enter street address"
            />
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
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              {...form.register("postal_code")}
              placeholder="Enter postal code"
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
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3 d-flex align-items-end pb-2">
              <Form.Check
                type="switch"
                id="client-is-active"
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
            "Update Client"
          ) : (
            "Create Client"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ClientForm;
