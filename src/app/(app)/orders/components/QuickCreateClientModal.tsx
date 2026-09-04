"use client";
import { useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createClient } from "@/services/client.service";
import {
  clientFormSchema,
  ClientFormValues,
} from "@/types/schemas/client.schema";
import type { Client } from "@/types/client.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface QuickCreateClientModalProps {
  show: boolean;
  onHide: () => void;
  onCreated: (client: Client) => void;
}

export const QuickCreateClientModal = ({
  show,
  onHide,
  onCreated,
}: QuickCreateClientModalProps) => {
  const { showNotification } = useNotificationContext();

  const form = useForm<
    Pick<ClientFormValues, "name" | "contact_person" | "email">
  >({
    resolver: zodResolver(
      clientFormSchema.pick({ name: true, contact_person: true, email: true }),
    ),
    defaultValues: { name: "", contact_person: "", email: "" },
  });

  useEffect(() => {
    if (show) form.reset({ name: "", contact_person: "", email: "" });
  }, [show, form]);

  const mutation = useMutation<
    Client,
    NormalizedError,
    Pick<ClientFormValues, "name" | "contact_person" | "email">
  >({
    mutationFn: (payload) => createClient(payload),
    onSuccess: (client) => {
      showNotification({
        message: `Client "${client.name}" created`,
        variant: "success",
      });
      onCreated(client);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create client",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="shadow-sm border-0"
    >
      <ModalHeader closeButton>
        <h5 className="modal-title">Create New Client</h5>
      </ModalHeader>
      <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <ModalBody>
          <Form.Group className="mb-3">
            <Form.Label>
              Client Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("name")}
              isInvalid={!!form.formState.errors.name}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
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
          <Form.Group className="mb-1">
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
          <Form.Text>
            You can add phone, address, and other details later from the Clients
            page.
          </Form.Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Creating...</span>
                <Spinner color="white" size="sm" className="me-2" />
              </div>
            ) : (
              "Create & Select"
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default QuickCreateClientModal;
