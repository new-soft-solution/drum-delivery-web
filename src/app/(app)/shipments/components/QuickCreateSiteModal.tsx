"use client";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { createSite } from "@/services/site.service";
import { siteFormSchema, SiteFormValues } from "@/types/schemas/site.schema";
import type { Site } from "@/types/site.type";
import type { NormalizedError } from "@/types/error.type";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { useNotificationContext } from "@/context/useNotificationContext";

interface QuickCreateSiteModalProps {
  show: boolean;
  onHide: () => void;
  onCreated: (site: Site) => void;
}

/**
 * Trimmed create-site form for the "no matching site, create one inline"
 * flow from SitePicker. Only asks for what the real backend actually
 * requires (name, address) — everything else can be filled in later from
 * the Sites page.
 */
export const QuickCreateSiteModal = ({
  show,
  onHide,
  onCreated,
}: QuickCreateSiteModalProps) => {
  const { showNotification } = useNotificationContext();

  const form = useForm<Pick<SiteFormValues, "name" | "address">>({
    resolver: zodResolver(siteFormSchema.pick({ name: true, address: true })),
    defaultValues: { name: "", address: "" },
  });

  const mutation = useMutation<
    Site,
    NormalizedError,
    Pick<SiteFormValues, "name" | "address">
  >({
    mutationFn: (payload) => createSite(payload),
    onSuccess: (site) => {
      showNotification({
        message: `Site "${site.name}" created`,
        variant: "success",
      });
      form.reset({ name: "", address: "" });
      onCreated(site);
    },
    onError: (error) => {
      showNotification({
        message: error.message || "Failed to create site",
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
        <h5 className="modal-title">Create New Site</h5>
      </ModalHeader>
      <Form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <ModalBody>
          <Form.Group className="mb-3">
            <Form.Label>
              Site Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("name")}
              isInvalid={!!form.formState.errors.name}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>
              Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...form.register("address")}
              isInvalid={!!form.formState.errors.address}
              placeholder="Enter street address"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.address?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Text>
            You can add city, country, and contact details later from the Sites
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

export default QuickCreateSiteModal;
