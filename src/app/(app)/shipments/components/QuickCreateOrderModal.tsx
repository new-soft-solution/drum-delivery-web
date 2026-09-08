"use client";
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createOrder } from "@/services/order.service";
import { orderFormSchema, OrderFormValues } from "@/types/schemas/order.schema";
import type { Order } from "@/types/order.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { ClientPicker } from "@/app/(app)/orders/components/ClientPicker";

interface QuickCreateOrderModalProps {
  show: boolean;
  onHide: () => void;
  onCreated: (order: Order) => void;
}

/**
 * Trimmed create-order form for the "no matching order, create one
 * inline" flow from OrderMultiPicker. Reuses the same ClientPicker as
 * the full OrderForm (client is the only required field on the real
 * Order schema) — quantity/unit/description can be filled in later from
 * the Orders page.
 */
export const QuickCreateOrderModal = ({
  show,
  onHide,
  onCreated,
}: QuickCreateOrderModalProps) => {
  const { showNotification } = useNotificationContext();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: "",
      description: "",
      quantity: undefined,
      unit: "",
    },
  });

  const clientValue = useWatch({ control: form.control, name: "client" });

  const mutation = useMutation<Order, NormalizedError, OrderFormValues>({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: (order) => {
      showNotification({
        message: `Order "${order.order_number}" created`,
        variant: "success",
      });
      form.reset({
        client: "",
        description: "",
        quantity: undefined,
        unit: "",
      });
      onCreated(order);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create order",
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
      contentClassName="border border-2 rounded-3"
    >
      <ModalHeader closeButton>
        <h5 className="modal-title">Create New Order</h5>
      </ModalHeader>
      <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <ModalBody>
          <ClientPicker
            value={clientValue}
            onChange={(clientId) =>
              form.setValue("client", clientId, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            isInvalid={!!form.formState.errors.client}
            errorMessage={form.formState.errors.client?.message}
          />
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  {...form.register("quantity")}
                  placeholder="e.g., 12"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  {...form.register("unit")}
                  placeholder="e.g., drums, meters, KMs"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-1">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              {...form.register("description")}
              placeholder="Optional"
            />
          </Form.Group>
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

export default QuickCreateOrderModal;
