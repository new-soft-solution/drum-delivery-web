"use client";
import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createDrum, getDrums } from "@/services/drum.service";
import {
  drumFormBaseSchema,
  DrumFormValues,
  withGrossWeightCheck,
} from "@/types/schemas/drum.schema";
import type { Drum } from "@/types/drum.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";
import { DrumMultiPicker } from "@/app/(app)/shipments/components/DrumMultiPicker";
import { BulkImportDrumsModal } from "@/app/(app)/drums/components/BulkImportDrumsModal";
import type { QuickOrderState } from "../page";

interface StepDrumsProps {
  state: QuickOrderState;
  onBack: () => void;
  onNext: (drumIds: string[]) => void;
}

type NewDrumFields = Pick<
  DrumFormValues,
  "drum_number" | "length_kms" | "net_weight_mt" | "gross_weight_mt"
>;

async function fetchAllAvailableDrumIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  let page = 1;
  const MAX_PAGES = 25;
  while (page <= MAX_PAGES) {
    const res = await getDrums({ status: "AVAILABLE", page });
    res.results.forEach((d) => ids.add(d.id));
    if (!res.next) break;
    page += 1;
  }
  return ids;
}

export const QuickOrderStepDrums = ({
  state,
  onBack,
  onNext,
}: StepDrumsProps) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [drumIds, setDrumIds] = useState<string[]>(state.drumIds);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [preImportSnapshot, setPreImportSnapshot] =
    useState<Set<string> | null>(null);

  const form = useForm<NewDrumFields>({
    resolver: zodResolver(
      withGrossWeightCheck(
        drumFormBaseSchema.pick({
          drum_number: true,
          length_kms: true,
          net_weight_mt: true,
          gross_weight_mt: true,
        }),
      ),
    ),
    defaultValues: {
      drum_number: "",
      length_kms: "",
      net_weight_mt: "",
      gross_weight_mt: "",
    },
  });

  const mutation = useMutation<Drum, NormalizedError, NewDrumFields>({
    mutationFn: (payload) => createDrum(payload),
    onSuccess: (drum) => {
      showNotification({
        message: `Drum ${drum.drum_number} created`,
        variant: "success",
      });
      setDrumIds((prev) => [...prev, drum.id]);
      form.reset({
        drum_number: "",
        length_kms: "",
        net_weight_mt: "",
        gross_weight_mt: "",
      });
      queryClient.invalidateQueries({ queryKey: ["drums-picker"] });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create drum",
        variant: "danger",
      });
      applyServerErrors(error, form.setError);
    },
  });

  const openBulkImport = () => {
    setShowBulkImport(true);
    setPreImportSnapshot(null);
    fetchAllAvailableDrumIds().then(setPreImportSnapshot);
  };

  const handleImported = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["drums-picker"] }),
      queryClient.invalidateQueries({ queryKey: ["drums"] }),
    ]);

    if (!preImportSnapshot) {
      showNotification({ message: "Drums imported.", variant: "success" });
      return;
    }

    const after = await fetchAllAvailableDrumIds();
    const newlyImported = Array.from(after).filter(
      (id) => !preImportSnapshot.has(id),
    );

    if (newlyImported.length > 0) {
      setDrumIds((prev) => Array.from(new Set([...prev, ...newlyImported])));
      showNotification({
        message: `${newlyImported.length} imported drum(s) added and selected.`,
        variant: "success",
      });
    } else {
      showNotification({ message: "Drums imported.", variant: "success" });
    }
    setPreImportSnapshot(null);
  };

  return (
    <div>
      <h6 className="fw-bold mb-1">Step 2 — Add Drums</h6>
      <p className="text-muted small mb-3">
        Select from your available inventory, add one drum at a time below, or
        bulk-import a whole list.
      </p>

      <Form.Group className="mb-3">
        <Form.Label>Available drums</Form.Label>
        <DrumMultiPicker value={drumIds} onChange={setDrumIds} isAdd={false} />
      </Form.Group>

      <div className="border rounded-3 p-3 mb-3 bg-light-subtle">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold small mb-0">Or create a new drum</h6>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={openBulkImport}
          >
            Bulk Import (.xlsx)
          </Button>
        </div>
        <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  Drum Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  {...form.register("drum_number")}
                  isInvalid={!!form.formState.errors.drum_number}
                  placeholder="e.g., 199"
                />
                <Form.Control.Feedback type="invalid">
                  {form.formState.errors.drum_number?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  Length (KMs) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  {...form.register("length_kms")}
                  isInvalid={!!form.formState.errors.length_kms}
                  placeholder="e.g., 2.661"
                />
                <Form.Control.Feedback type="invalid">
                  {form.formState.errors.length_kms?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  Net Weight (MT) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  {...form.register("net_weight_mt")}
                  isInvalid={!!form.formState.errors.net_weight_mt}
                  placeholder="e.g., 5.765"
                />
                <Form.Control.Feedback type="invalid">
                  {form.formState.errors.net_weight_mt?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  Gross Weight (MT) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
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
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              size="sm"
              variant="outline-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <span>Adding...</span>
                  <Spinner size="sm" className="me-1" />
                </div>
              ) : (
                "+ Add Drum"
              )}
            </Button>
          </div>
        </Form>
      </div>

      {drumIds.length > 0 ? (
        <p className="text-muted small mb-3">
          {drumIds.length} drum(s) selected for this shipment.
        </p>
      ) : (
        <p className="text-muted small mb-3">
          Select or add at least one drum above to continue — a shipment needs
          at least one.
        </p>
      )}

      <div className="d-flex justify-content-between mt-3">
        <Button variant="outline-secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => onNext(drumIds)}
          disabled={drumIds.length === 0}
        >
          Continue to Shipment
        </Button>
      </div>

      <BulkImportDrumsModal
        show={showBulkImport}
        onHide={() => setShowBulkImport(false)}
        onImported={handleImported}
      />
    </div>
  );
};

export default QuickOrderStepDrums;
