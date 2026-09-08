"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { DTTruckDelivery } from "@/types/drum-tracer/truck-delivery.type";
import {
  dtTruckDeliveryFormSchema,
  DTTruckDeliveryFormValues,
} from "@/types/schemas/dt-truck-delivery.schema";
import {
  createTruckDelivery,
  updateTruckDelivery,
} from "@/services/drum-tracer/truck-delivery.service";
import { getShipments } from "@/services/shipment.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface TruckDeliveryFormProps {
  item?: DTTruckDelivery;
  onCancel: () => void;
  onSuccess: () => void;
}

export const TruckDeliveryForm = ({
  item: delivery,
  onCancel,
  onSuccess,
}: TruckDeliveryFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!delivery;
  const { showNotification } = useNotificationContext();

  const { data: shipmentsData } = useQuery({
    queryKey: ["shipments-for-truck-delivery-form"],
    queryFn: () => getShipments({}),
  });

  const form = useForm<DTTruckDeliveryFormValues>({
    resolver: zodResolver(dtTruckDeliveryFormSchema),
    defaultValues: {
      shipment_id: delivery?.shipment_id || "",
      truck_number: delivery?.truck_number || "",
      license_plate: delivery?.license_plate || "",
      driver_name: delivery?.driver_name || "",
      driver_phone: delivery?.driver_phone || "",
      scheduled_at: delivery?.scheduled_at || "",
      status: delivery?.status || "Scheduled",
      notes: delivery?.notes || "",
    },
  });

  const mutation = useMutation<
    unknown,
    NormalizedError,
    DTTruckDeliveryFormValues
  >({
    mutationFn: (payload) =>
      isEdit && delivery?.id
        ? updateTruckDelivery(delivery.id, payload)
        : createTruckDelivery(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "Truck delivery updated successfully"
          : "Truck delivery scheduled successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["dt-truck-deliveries"] });
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
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>
              Shipment <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              {...form.register("shipment_id")}
              isInvalid={!!form.formState.errors.shipment_id}
            >
              <option value="">Select a shipment</option>
              {shipmentsData?.results.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shipment_number}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.shipment_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Truck Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("truck_number")}
              isInvalid={!!form.formState.errors.truck_number}
              placeholder="e.g., TR-001"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.truck_number?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>License Plate</Form.Label>
            <Form.Control
              {...form.register("license_plate")}
              placeholder="e.g., ABC-123"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Driver Name</Form.Label>
            <Form.Control
              {...form.register("driver_name")}
              placeholder="Enter driver name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Driver Phone</Form.Label>
            <Form.Control
              {...form.register("driver_phone")}
              placeholder="e.g., +31 6 12345678"
            />
          </Form.Group>
        </Col>
        <Col md={isEdit ? 6 : 12}>
          <Form.Group className="mb-3">
            <Form.Label>
              Scheduled Date &amp; Time <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              {...form.register("scheduled_at")}
              isInvalid={!!form.formState.errors.scheduled_at}
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.scheduled_at?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...form.register("status")}>
                <option value="Scheduled">Scheduled</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Overdue">Overdue</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...form.register("notes")}
              placeholder="Additional notes or special instructions..."
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
            "Update Delivery"
          ) : (
            "Schedule Truck Delivery"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default TruckDeliveryForm;
