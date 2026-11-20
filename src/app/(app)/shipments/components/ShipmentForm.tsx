"use client";
import { useState } from "react";
import { Button, Col, Form, Nav, Row } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import {
  Shipment,
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_OPTIONS,
} from "@/types/shipment.type";
import {
  shipmentFormSchema,
  ShipmentFormValues,
} from "@/types/schemas/shipment.schema";
import { createShipment, updateShipment } from "@/services/shipment.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { OrderMultiPicker } from "./OrderMultiPicker";
import { ShipmentSitesField } from "./ShipmentSitesField";
import { AttachmentManager } from "@/components/ui/AttachmentManager/AttachmentManager";

interface ShipmentFormProps {
  item?: Shipment;
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
  // After a create, the form switches to the Attachments tab for the new id.
  const [savedId, setSavedId] = useState<string | undefined>(shipment?.id);
  const [activeTab, setActiveTab] = useState<"details" | "attachments">(
    "details",
  );
  const { showNotification } = useNotificationContext();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      invoice_no: shipment?.invoice_no || "",
      bl_no: shipment?.bl_no || "",
      sites: shipment?.sites?.length
        ? shipment.sites.map((s) => ({ site: s.site, drums: s.drums ?? [] }))
        : [{ site: "", drums: [] }],
      expected_arrival_date:
        shipment?.expected_arrival_date?.slice(0, 10) || "",
      status: shipment?.status || "CREATED",
      orders: shipment?.orders || [],
    },
  });

  const mutation = useMutation<Shipment, NormalizedError, ShipmentFormValues>({
    mutationFn: (payload) =>
      savedId ? updateShipment(savedId, payload) : createShipment(payload),
    onSuccess: (saved) => {
      showNotification({
        message: savedId
          ? "Shipment updated successfully"
          : "Shipment created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      if (savedId) {
        onSuccess();
        return;
      }
      setSavedId(saved.id);
      setActiveTab("attachments");
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Something went wrong!",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  const ordersValue = useWatch({ control: form.control, name: "orders" }) ?? [];

  return (
    <>
      <Nav
        variant="tabs"
        className="mb-3"
        activeKey={activeTab}
        onSelect={(k) => k && setActiveTab(k as "details" | "attachments")}
      >
        <Nav.Item>
          <Nav.Link eventKey="details">Details</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="attachments" disabled={!savedId}>
            Attachments
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === "attachments" && savedId && (
        <div>
          <AttachmentManager owner={{ shipment: savedId }} />
          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" onClick={onSuccess}>
              Done
            </Button>
          </div>
        </div>
      )}

      <Form
        className={activeTab === "details" ? undefined : "d-none"}
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      >
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
          {isEdit && (
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select {...form.register("status")}>
                  {SHIPMENT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {SHIPMENT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}
        </Row>

        <ShipmentSitesField form={form} />

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
            ) : savedId ? (
              "Update Shipment"
            ) : (
              "Create Shipment"
            )}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default ShipmentForm;
