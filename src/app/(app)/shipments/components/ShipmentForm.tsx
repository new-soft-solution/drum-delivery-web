"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { DTShipment } from "@/types/drum-tracer/shipment.type";
import {
  dtShipmentFormSchema,
  DTShipmentFormValues,
} from "@/types/schemas/dt-shipment.schema";
import {
  createShipment,
  updateShipment,
} from "@/services/drum-tracer/shipment.service";
import { getSites } from "@/services/site.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface ShipmentFormProps {
  item?: DTShipment;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ShipmentForm = ({
  item: shipment,
  onCancel,
  onSuccess,
}: ShipmentFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!shipment;
  const { showNotification } = useNotificationContext();

  const { data: sitesData } = useQuery({
    queryKey: ["sites-for-shipment-form"],
    queryFn: () => getSites({}),
  });

  const form = useForm<DTShipmentFormValues>({
    resolver: zodResolver(dtShipmentFormSchema),
    defaultValues: {
      shipment_number: shipment?.shipment_number || "",
      invoice_number: shipment?.invoice_number || "",
      bl_number: shipment?.bl_number || "",
      container_number: shipment?.container_number || "",
      destination_site_id: shipment?.destination_site_id || "",
      expected_arrival: shipment?.expected_arrival || "",
      status: shipment?.status || "Created",
    },
  });

  const mutation = useMutation<unknown, NormalizedError, DTShipmentFormValues>({
    mutationFn: (payload) =>
      isEdit && shipment?.id
        ? updateShipment(shipment.id, payload)
        : createShipment(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "Shipment updated successfully"
          : "Shipment created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["dt-shipments"] });
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
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Shipment Number</Form.Label>
            <Form.Control
              {...form.register("shipment_number")}
              placeholder="Auto-generated if left empty"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Invoice Number</Form.Label>
            <Form.Control
              {...form.register("invoice_number")}
              placeholder="Enter invoice number"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>B/L No.</Form.Label>
            <Form.Control
              {...form.register("bl_number")}
              placeholder="Enter B/L number"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Destination Site <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              {...form.register("destination_site_id")}
              isInvalid={!!form.formState.errors.destination_site_id}
            >
              <option value="">Select a site</option>
              {sitesData?.results.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.destination_site_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Expected Arrival Date <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              {...form.register("expected_arrival")}
              isInvalid={!!form.formState.errors.expected_arrival}
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.expected_arrival?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...form.register("status")}>
                <option value="Created">Created</option>
                <option value="In Transit">In Transit</option>
                <option value="Arrived">Arrived</option>
                <option value="Delivered">Delivered</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}
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
            "Update Shipment"
          ) : (
            "Create Shipment"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ShipmentForm;
