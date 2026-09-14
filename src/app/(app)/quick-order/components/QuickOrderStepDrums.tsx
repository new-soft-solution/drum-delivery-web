"use client";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createDrum } from "@/services/drum.service";
import { drumFormSchema, DrumFormValues } from "@/types/schemas/drum.schema";
import type { Drum } from "@/types/drum.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import type { QuickOrderState } from "../page";

interface StepDrumsProps {
  state: QuickOrderState;
  onBack: () => void;
  onNext: (drumIds: string[]) => void;
}

type NewDrumFields = Pick<
  DrumFormValues,
  | "drum_number"
  | "container_no"
  | "length_kms"
  | "net_weight_mt"
  | "gross_weight_mt"
  | "notes"
>;

export const QuickOrderStepDrums = ({
  state,
  onBack,
  onNext,
}: StepDrumsProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const form = useForm<NewDrumFields>({
    resolver: zodResolver(
      drumFormSchema.pick({
        drum_number: true,
        length_kms: true,
        net_weight_mt: true,
        gross_weight_mt: true,
      }),
    ),
    defaultValues: {
      drum_number: "",
      container_no: "",
      length_kms: "",
      net_weight_mt: "",
      gross_weight_mt: "",
      notes: "",
    },
  });

  const mutation = useMutation<Drum, NormalizedError, NewDrumFields>({
    mutationFn: (payload) => createDrum(payload),
    onSuccess: (drum) => {
      showNotification({
        message: `Drum ${drum.drum_number} created`,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
      onNext([...state.drumIds, drum.id]);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create drum",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  return (
    <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <h6 className="fw-bold mb-3">Step 2 — Add a Drum</h6>
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
              <span>Creating...</span>
              <Spinner color="white" size="sm" className="me-2" />
            </div>
          ) : (
            "Create Drum & Continue"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default QuickOrderStepDrums;
