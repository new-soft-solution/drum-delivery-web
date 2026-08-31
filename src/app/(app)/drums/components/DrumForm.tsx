"use client";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { DTDrum } from "@/types/drum-tracer/drum.type";
import { dtDrumFormSchema, DTDrumFormValues } from "@/types/schemas/dt-drum.schema";
import { createDrum, updateDrum } from "@/services/drum-tracer/drum.service";
import { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface DrumFormProps {
  item?: DTDrum;
  onCancel: () => void;
  onSuccess: () => void;
}

export const DrumForm = ({ item: drum, onCancel, onSuccess }: DrumFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!drum;
  const { showNotification } = useNotificationContext();

  const form = useForm<DTDrumFormValues>({
    resolver: zodResolver(dtDrumFormSchema),
    defaultValues: {
      drum_number: drum?.drum_number || "",
      container_number: drum?.container_number || "",
      length_km: drum?.length_km || 0,
      net_weight_mt: drum?.net_weight_mt || 0,
      gross_weight_mt: drum?.gross_weight_mt || 0,
      status: drum?.status || "Available",
      notes: drum?.notes || "",
    },
  });

  const mutation = useMutation<unknown, NormalizedError, DTDrumFormValues>({
    mutationFn: (payload) =>
      isEdit && drum?.id ? updateDrum(drum.id, payload) : createDrum(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit ? "Drum updated successfully" : "Drum created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["dt-drums"] });
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
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Drum Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("drum_number")}
              isInvalid={!!form.formState.errors.drum_number}
              placeholder="e.g., 199"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.drum_number?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Container Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("container_number")}
              isInvalid={!!form.formState.errors.container_number}
              placeholder="e.g., ACBD1234567"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.container_number?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Length (KMs) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              step="0.001"
              {...form.register("length_km")}
              isInvalid={!!form.formState.errors.length_km}
              placeholder="e.g., 2.661"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Net Weight (MT) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              step="0.001"
              {...form.register("net_weight_mt")}
              isInvalid={!!form.formState.errors.net_weight_mt}
              placeholder="e.g., 5.765"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Gross Weight (MT) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              step="0.001"
              {...form.register("gross_weight_mt")}
              isInvalid={!!form.formState.errors.gross_weight_mt}
              placeholder="e.g., 6.487"
            />
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...form.register("status")}>
                <option value="Available">Available</option>
                <option value="In Transit">In Transit</option>
                <option value="Missing">Missing</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={3} {...form.register("notes")} placeholder="Additional notes about this drum..." />
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
            "Update Drum"
          ) : (
            "Create Drum"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default DrumForm;
