// src/app/(app)/drums/components/DrumForm.tsx
"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import {
  Drum,
  DRUM_STATUS_LABELS,
  DRUM_STATUS_OPTIONS,
} from "@/types/drum.type";
import { drumFormSchema, DrumFormValues } from "@/types/schemas/drum.schema";
import { createDrum, updateDrum } from "@/services/drum.service";
import { NormalizedError } from "@/types/error.type";
import { useNotificationContext } from "@/context/useNotificationContext";
import { applyServerErrors } from "@/utils/applyServerErrors";

interface DrumFormProps {
  item?: Drum;
  onCancel: () => void;
  onSuccess: () => void;
}

export const DrumForm = ({
  item: drum,
  onCancel,
  onSuccess,
}: DrumFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!drum;
  const { showNotification } = useNotificationContext();

  const form = useForm<DrumFormValues>({
    resolver: zodResolver(drumFormSchema),
    defaultValues: {
      drum_number: drum?.drum_number || "",
      length_kms: drum?.length_kms || "",
      net_weight_mt: drum?.net_weight_mt || "",
      gross_weight_mt: drum?.gross_weight_mt || "",
      status: drum?.status || "AVAILABLE",
      container_no: drum?.container_no || "",
      notes: drum?.notes || "",
      is_active: drum?.is_active ?? true,
    },
  });

  const mutation = useMutation<unknown, NormalizedError, DrumFormValues>({
    mutationFn: (payload) =>
      isEdit && drum?.id ? updateDrum(drum.id, payload) : createDrum(payload),
    onSuccess: () => {
      showNotification({
        message: isEdit
          ? "Drum updated successfully"
          : "Drum created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
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
            <Form.Label>Container Number</Form.Label>
            <Form.Control
              {...form.register("container_no")}
              isInvalid={!!form.formState.errors.container_no}
              placeholder="e.g., ACBD1234567"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.container_no?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Length (KMs) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("length_kms")}
              isInvalid={!!form.formState.errors.length_kms}
              placeholder="e.g., 2.661"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.length_kms?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Net Weight (MT) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("net_weight_mt")}
              isInvalid={!!form.formState.errors.net_weight_mt}
              placeholder="e.g., 5.765"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.net_weight_mt?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Gross Weight (MT) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("gross_weight_mt")}
              isInvalid={!!form.formState.errors.gross_weight_mt}
              placeholder="e.g., 6.487"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.gross_weight_mt?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        {isEdit && (
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...form.register("status")}>
                {DRUM_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {DRUM_STATUS_LABELS[s]}
                  </option>
                ))}
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
              placeholder="Additional notes about this drum..."
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
