"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { createShipment } from "@/services/shipment.service";
import {
  shipmentFormSchema,
  ShipmentFormValues,
} from "@/types/schemas/shipment.schema";
import type { Shipment } from "@/types/shipment.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { SitePicker } from "@/app/(app)/shipments/components/SitePicker";
import { DrumMultiPicker } from "@/app/(app)/shipments/components/DrumMultiPicker";
import { OrderMultiPicker } from "@/app/(app)/shipments/components/OrderMultiPicker";
import type { QuickOrderState } from "../page";

interface StepShipmentProps {
  state: QuickOrderState;
  onBack: () => void;
  onCreated: (shipmentId: string, shipmentNumber: string) => void;
}

interface MutateVars {
  values: ShipmentFormValues;
  exitAfterSave: boolean;
}

export const QuickOrderStepShipment = ({
  state,
  onBack,
  onCreated,
}: StepShipmentProps) => {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  // Same layout/fields as the real ShipmentForm — the drum(s) created in
  // Step 2 and the order created in Step 1 are pre-selected here (via
  // defaultValues) but stay fully editable before creating the shipment.
  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      invoice_no: "",
      bl_no: "",
      destination_site: "",
      expected_arrival_date: "",
      drums: state.drumIds,
      orders: state.orderId ? [state.orderId] : [],
    },
  });

  const destinationSiteValue = useWatch({
    control: form.control,
    name: "destination_site",
  });
  const drumsValue = useWatch({ control: form.control, name: "drums" }) ?? [];
  const ordersValue = useWatch({ control: form.control, name: "orders" }) ?? [];

  const mutation = useMutation<Shipment, NormalizedError, MutateVars>({
    mutationFn: ({ values }) => createShipment(values),
    onSuccess: (shipment, variables) => {
      showNotification({
        message: `Shipment ${shipment.shipment_number} created`,
        variant: "success",
      });
      if (variables.exitAfterSave) {
        router.push("/shipments");
        return;
      }
      onCreated(shipment.id, shipment.shipment_number);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create shipment",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  if (state.shipmentId) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-1">
          Shipment already created for this Quick Order:
        </p>
        <h5 className="fw-bold">{state.shipmentNumber}</h5>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onCreated(state.shipmentId!, state.shipmentNumber!)}
        >
          Continue to Truck Delivery
        </Button>
      </div>
    );
  }

  const submitAndContinue = form.handleSubmit((values) =>
    mutation.mutate({ values, exitAfterSave: false }),
  );
  const submitAndExit = form.handleSubmit((values) =>
    mutation.mutate({ values, exitAfterSave: true }),
  );

  const isSavingAndExiting =
    mutation.isPending && mutation.variables?.exitAfterSave;
  const isSavingAndContinuing =
    mutation.isPending && !mutation.variables?.exitAfterSave;

  return (
    <Form onSubmit={submitAndContinue}>
      <h6 className="fw-bold mb-3">Step 3 — Create the Shipment</h6>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Invoice Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("invoice_no")}
              isInvalid={!!form.formState.errors.invoice_no}
              placeholder="Enter invoice number"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.invoice_no?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              B/L No. <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("bl_no")}
              isInvalid={!!form.formState.errors.bl_no}
              placeholder="Enter B/L number"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.bl_no?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <SitePicker
            value={destinationSiteValue}
            onChange={(siteId) =>
              form.setValue("destination_site", siteId, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            isInvalid={!!form.formState.errors.destination_site}
            errorMessage={form.formState.errors.destination_site?.message}
          />
        </Col>
        <Col md={6}>
          <DrumMultiPicker
            value={drumsValue}
            onChange={(ids) =>
              form.setValue("drums", ids, { shouldDirty: true })
            }
          />
        </Col>
        <Col md={6}>
          <OrderMultiPicker
            value={ordersValue}
            onChange={(ids) =>
              form.setValue("orders", ids, { shouldDirty: true })
            }
          />
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Expected Arrival Date</Form.Label>
            <Form.Control
              type="date"
              {...form.register("expected_arrival_date")}
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
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            type="button"
            disabled={mutation.isPending}
            onClick={submitAndExit}
          >
            {isSavingAndExiting ? (
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Saving...</span>
                <Spinner size="sm" className="me-1" />
              </div>
            ) : (
              "Cancel & Save"
            )}
          </Button>
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {isSavingAndContinuing ? (
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Creating...</span>
                <Spinner color="white" size="sm" className="me-2" />
              </div>
            ) : (
              "Create Shipment & Continue"
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default QuickOrderStepShipment;
