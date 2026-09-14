"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createTruckDelivery } from "@/services/truck-delivery.service";
import {
  truckDeliveryFormSchema,
  TruckDeliveryFormValues,
} from "@/types/schemas/truck-delivery.schema";
import type { TruckDelivery } from "@/types/truck-delivery.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import type { QuickOrderState } from "../page";
import RHFPhoneNumberInput from "@/components/ui/PhoneNumberInput/RHFPhoneNumberInput";

interface StepTruckDeliveryProps {
  state: QuickOrderState;
  onBack: () => void;
  onCreated: (truckDeliveryId: string, truckDeliveryLabel: string) => void;
}

export const QuickOrderStepTruckDelivery = ({
  state,
  onBack,
  onCreated,
}: StepTruckDeliveryProps) => {
  const { showNotification } = useNotificationContext();

  const form = useForm<TruckDeliveryFormValues>({
    resolver: zodResolver(truckDeliveryFormSchema),
    defaultValues: {
      truck_number: "",
      shipment: state.shipmentId || "",
      driver_name: "",
      driver_phone: "",
      license_plate: "",
      scheduled_date: "",
      notes: "",
    },
  });

  const mutation = useMutation<
    TruckDelivery,
    NormalizedError,
    TruckDeliveryFormValues
  >({
    mutationFn: (payload) =>
      createTruckDelivery({
        ...payload,
        shipment: state.shipmentId || payload.shipment,
      }),
    onSuccess: (delivery) => {
      showNotification({
        message: `Truck delivery ${delivery.truck_delivery_id} scheduled`,
        variant: "success",
      });
      onCreated(delivery.id, delivery.truck_delivery_id);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to schedule truck delivery",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  return (
    <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <h6 className="fw-bold mb-1">Step 4 — Schedule the Truck Delivery</h6>
      <p className="text-muted small mb-3">
        For shipment <strong>{state.shipmentNumber}</strong>.
      </p>
      <Row>
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
            <RHFPhoneNumberInput
              name="driver_phone"
              control={form.control}
              label="Driver Phone"
              placeholder="Enter driver phone number"
              defaultCountry="NL"
              size={"lg"}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Scheduled Date &amp; Time</Form.Label>
            <Form.Control
              type="datetime-local"
              {...form.register("scheduled_date")}
            />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              {...form.register("notes")}
              placeholder="Optional"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={onBack}
          disabled={mutation.isPending}
        >
          Back
        </Button>
        <Button variant="primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className="d-flex align-items-center justify-content-center gap-1">
              <span>Scheduling...</span>
              <Spinner color="white" size="sm" className="me-2" />
            </div>
          ) : (
            "Schedule Truck Delivery & Finish"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default QuickOrderStepTruckDelivery;
