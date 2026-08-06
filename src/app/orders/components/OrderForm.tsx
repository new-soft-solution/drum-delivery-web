"use client";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { DTOrder } from "@/types/drum-tracer/order.type";
import { dtOrderFormSchema, DTOrderFormValues } from "@/types/schemas/dt-order.schema";
import { createOrder, updateOrder } from "@/services/drum-tracer/order.service";
import { getClients } from "@/services/drum-tracer/client.service";
import { NormalizedError } from "@/types/error.type";
import { useNotificationContext } from "@/context/useNotificationContext";

interface OrderFormProps {
  item?: DTOrder;
  onCancel: () => void;
  onSuccess: () => void;
}

export const OrderForm = ({ item: order, onCancel, onSuccess }: OrderFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!order;
  const { showNotification } = useNotificationContext();

  const { data: clientsData } = useQuery({
    queryKey: ["dt-clients-all"],
    queryFn: () => getClients({ page_size: 200 }),
  });

  const form = useForm<DTOrderFormValues>({
    resolver: zodResolver(dtOrderFormSchema),
    defaultValues: {
      po_number: order?.po_number || "",
      client_id: order?.client_id || 0,
      description: order?.description || "",
      status: order?.status || "Created",
    },
  });

  const mutation = useMutation<unknown, NormalizedError, DTOrderFormValues>({
    mutationFn: (payload) =>
      isEdit && order?.id ? updateOrder(order.id, payload) : createOrder(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit ? "Order updated successfully" : "Order created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["dt-orders"] });
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
              P.O Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("po_number")}
              isInvalid={!!form.formState.errors.po_number}
              placeholder="Enter P.O number"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.po_number?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Client <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              {...form.register("client_id")}
              isInvalid={!!form.formState.errors.client_id}
            >
              <option value={0}>Select a client</option>
              {clientsData?.results.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.client_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...form.register("status")}>
                <option value="Created">Created</option>
                <option value="Assigned">Assigned</option>
                <option value="Completed">Completed</option>
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
