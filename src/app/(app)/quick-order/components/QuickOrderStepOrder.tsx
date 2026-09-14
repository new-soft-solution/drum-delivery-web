"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
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
import type { QuickOrderState } from "../page";

interface StepOrderProps {
  state: QuickOrderState;
  onCreated: (orderId: string, orderNumber: string) => void;
}

export const QuickOrderStepOrder = ({ state, onCreated }: StepOrderProps) => {
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
        message: `Order ${order.order_number} created`,
        variant: "success",
      });
      onCreated(order.id, order.order_number);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create order",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  if (state.orderId) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-1">
          Order already created for this Quick Order:
        </p>
        <h5 className="fw-bold">{state.orderNumber}</h5>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onCreated(state.orderId!, state.orderNumber!)}
        >
          Continue to Drums
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <h6 className="fw-bold mb-3">Step 1 — Create the Order</h6>
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
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          {...form.register("description")}
          placeholder="Optional"
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className="d-flex align-items-center justify-content-center gap-1">
              <span>Creating...</span>
              <Spinner color="white" size="sm" className="me-2" />
            </div>
          ) : (
            "Create Order & Continue"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default QuickOrderStepOrder;
