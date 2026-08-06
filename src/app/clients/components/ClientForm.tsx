"use client";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { DTClient } from "@/types/drum-tracer/client.type";
import {
  dtClientFormSchema,
  DTClientFormValues,
} from "@/types/schemas/dt-client.schema";
import { createClient, updateClient } from "@/services/drum-tracer/client.service";
import { NormalizedError } from "@/types/error.type";
import { useNotificationContext } from "@/context/useNotificationContext";

const COUNTRIES = ["Netherlands", "Germany", "Belgium", "Bahrain", "United Arab Emirates", "Saudi Arabia"];

interface ClientFormProps {
  item?: DTClient;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ClientForm = ({ item: client, onCancel, onSuccess }: ClientFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!client;
  const { showNotification } = useNotificationContext();

  const form = useForm<DTClientFormValues>({
    resolver: zodResolver(dtClientFormSchema),
    defaultValues: {
      name: client?.name || "",
      contact_person: client?.contact_person || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      city: client?.city || "",
      postal_code: client?.postal_code || "",
      state: client?.state || "",
      country: client?.country || "Netherlands",
    },
  });

  const mutation = useMutation<unknown, NormalizedError, DTClientFormValues>({
    mutationFn: (payload) =>
      isEdit && client?.id ? updateClient(client.id, payload) : createClient(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit ? "Client updated successfully" : "Client created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["dt-clients"] });
      onSuccess();
    },
    onError: (error) => {
      showNotification({ message: error.message || "Something went wrong!", variant: "danger" });
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
            <Form.Label>Phone</Form.Label>
            <Form.Control {...form.register("phone")} placeholder="Enter phone number" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control {...form.register("address")} placeholder="Enter street address" />
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
            <Form.Label>Postal Code</Form.Label>
            <Form.Control {...form.register("postal_code")} placeholder="Enter postal code" />
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
