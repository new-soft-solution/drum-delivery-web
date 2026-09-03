"use client";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { Order, ORDER_STATUS_OPTIONS } from "@/types/order.type";
import { orderFormSchema, OrderFormValues } from "@/types/schemas/order.schema";
import { createOrder, updateOrder } from "@/services/order.service";
import { getClients } from "@/services/client.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

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

export const OrderForm = ({ item: order, onCancel, onSuccess }: OrderFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!order;
  const { showNotification } = useNotificationContext();

  // The real /api/clients/ endpoint doesn't support a large page_size —
  // only `page` is documented — so this fetches page 1 as-is. For a
  // backend with more than one page of clients, this dropdown would need
  // its own searchable/paginated autocomplete instead of a plain <select>.
  const { data: clientsData } = useQuery({
    queryKey: ["clients-for-order-form"],
    queryFn: () => getClients({}),
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: order?.client || "",
      description: order?.description || "",
      quantity: order?.quantity ?? undefined,
      unit: order?.unit || "",
      status: order?.status || "CREATED",
      is_active: order?.is_active ?? true,
    },
  });

  const mutation = useMutation<unknown, NormalizedError, OrderFormValues>({
    mutationFn: (payload) =>
      isEdit && order?.id ? updateOrder(order.id, payload) : createOrder(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit ? "Order updated successfully" : "Order created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
              Client <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select {...form.register("client")} isInvalid={!!form.formState.errors.client}>
              <option value="">Select a client</option>
              {clientsData?.results.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.client?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control type="number" {...form.register("quantity")} placeholder="e.g., 12" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Unit</Form.Label>
            <Form.Control {...form.register("unit")} placeholder="e.g., drums, meters, KMs" />
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={12}>
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
