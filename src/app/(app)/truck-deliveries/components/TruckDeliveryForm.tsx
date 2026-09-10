"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import {
  TRUCK_DELIVERY_STATUS_LABELS,
  TRUCK_DELIVERY_STATUS_OPTIONS,
  TruckDelivery,
} from "@/types/truck-delivery.type";
import {
  truckDeliveryFormSchema,
  TruckDeliveryFormValues,
} from "@/types/schemas/truck-delivery.schema";
import {
  createTruckDelivery,
  updateTruckDelivery,
} from "@/services/truck-delivery.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { ShipmentPicker } from "./ShipmentPicker";
import RHFPhoneNumberInput from "@/components/ui/PhoneNumberInput/RHFPhoneNumberInput";

interface TruckDeliveryFormProps {
  item?: TruckDelivery;
  onCancel: () => void;
  onSuccess: () => void;
}

// The API returns full datetimes; <input type="datetime-local"> wants
// "YYYY-MM-DDTHH:mm" with no timezone suffix.
const toLocalInput = (iso?: string | null) => (iso ? iso.slice(0, 16) : "");

export const TruckDeliveryForm = ({
  item: delivery,
  onCancel,
  onSuccess,
}: TruckDeliveryFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!delivery;
  const { showNotification } = useNotificationContext();

  const form = useForm<TruckDeliveryFormValues>({
    resolver: zodResolver(truckDeliveryFormSchema),
    defaultValues: {
      truck_number: delivery?.truck_number || "",
      shipment: delivery?.shipment || "",
      driver_name: delivery?.driver_name || "",
      driver_phone: delivery?.driver_phone || "",
      license_plate: delivery?.license_plate || "",
      scheduled_date: toLocalInput(delivery?.scheduled_date),
      actual_departure_date: toLocalInput(delivery?.actual_departure_date),
      actual_arrival_date: toLocalInput(delivery?.actual_arrival_date),
      status: delivery?.status || "SCHEDULED",
      notes: delivery?.notes || "",
    },
  });

  const shipmentValue = useWatch({ control: form.control, name: "shipment" });

  const mutation = useMutation<
    unknown,
    NormalizedError,
    TruckDeliveryFormValues
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
      queryClient.invalidateQueries({ queryKey: ["truck-deliveries"] });
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
          <ShipmentPicker
            value={shipmentValue}
            onChange={(id) =>
              form.setValue("shipment", id, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            isInvalid={!!form.formState.errors.shipment}
            errorMessage={form.formState.errors.shipment?.message}
          />
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
        {isEdit && (
          <>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Actual Departure</Form.Label>
                <Form.Control
                  type="datetime-local"
                  {...form.register("actual_departure_date")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Actual Arrival</Form.Label>
                <Form.Control
                  type="datetime-local"
                  {...form.register("actual_arrival_date")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select {...form.register("status")}>
                  {TRUCK_DELIVERY_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {TRUCK_DELIVERY_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </>
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
