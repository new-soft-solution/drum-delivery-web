"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { Order, ORDER_STATUS_OPTIONS } from "@/types/order.type";
import { orderFormSchema, OrderFormValues } from "@/types/schemas/order.schema";
import { createOrder, updateOrder } from "@/services/order.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { ClientPicker } from "./ClientPicker";

interface OrderFormProps {
  item?: Order;
  onCancel: () => void;
  onSuccess: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const OrderForm = ({
  item: order,
  onCancel,
  onSuccess,
}: OrderFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!order;
  const { showNotification } = useNotificationContext();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: order?.client || "",
      po_number: order?.po_number || "",
      description: order?.description || "",
      quantity: order?.quantity ?? undefined,
      unit: order?.unit || "",
      status: order?.status || "CREATED",
      is_active: order?.is_active ?? true,
    },
  });

  const mutation = useMutation<unknown, NormalizedError, OrderFormValues>({
    mutationFn: (payload) =>
      isEdit && order?.id
        ? updateOrder(order.id, payload)
        : createOrder(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "Order updated successfully"
          : "Order created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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

  const clientValue = useWatch({ control: form.control, name: "client" });

  return (
    <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <Row>
        <Col md={6}>
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
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>PO Number</Form.Label>
            <Form.Control
              {...form.register("po_number")}
              isInvalid={!!form.formState.errors.po_number}
              placeholder="Enter PO number"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.po_number?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
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
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...form.register("status")}>
                {ORDER_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...form.register("description")}
              placeholder="Enter order description (optional)"
            />
          </Form.Group>
        </Col>
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
            "Update Order"
          ) : (
            "Create Order"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default OrderForm;
