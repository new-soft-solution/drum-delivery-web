"use client";
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createDrum } from "@/services/drum.service";
import { drumFormSchema, DrumFormValues } from "@/types/schemas/drum.schema";
import type { Drum } from "@/types/drum.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface QuickCreateDrumModalProps {
  show: boolean;
  onHide: () => void;
  onCreated: (drum: Drum) => void;
}

type QuickDrumFields = Pick<
  DrumFormValues,
  "drum_number" | "length_kms" | "net_weight_mt" | "gross_weight_mt"
>;

/**
 * Trimmed create-drum form for the "no matching drum, create one inline"
 * flow from DrumMultiPicker. Asks for exactly what the real backend
 * requires (drum_number, length_kms, net_weight_mt, gross_weight_mt) —
 * container/notes/status can be filled in later from the Drums page.
 */
export const QuickCreateDrumModal = ({
  show,
  onHide,
  onCreated,
}: QuickCreateDrumModalProps) => {
  const { showNotification } = useNotificationContext();

  const form = useForm<QuickDrumFields>({
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
      length_kms: "",
      net_weight_mt: "",
      gross_weight_mt: "",
    },
  });

  const mutation = useMutation<Drum, NormalizedError, QuickDrumFields>({
    mutationFn: (payload) => createDrum(payload),
    onSuccess: (drum) => {
      showNotification({
        message: `Drum "${drum.drum_number}" created`,
        variant: "success",
      });
      form.reset({
        drum_number: "",
        length_kms: "",
        net_weight_mt: "",
        gross_weight_mt: "",
      });
      onCreated(drum);
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
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="border border-2 rounded-3"
    >
      <ModalHeader closeButton>
        <h5 className="modal-title">Create New Drum</h5>
      </ModalHeader>
      <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <ModalBody>
          <Form.Group className="mb-3">
            <Form.Label>
              Drum Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("drum_number")}
              isInvalid={!!form.formState.errors.drum_number}
              placeholder="e.g., 199"
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.drum_number?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Row>
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
          </Row>
          <Form.Text>
            You can add container number, notes, and status later from the Drums
            page.
          </Form.Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Creating...</span>
                <Spinner color="white" size="sm" className="me-2" />
              </div>
            ) : (
              "Create & Select"
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default QuickCreateDrumModal;
