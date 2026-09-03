"use client";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormControl,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Spinner from "../Spinner";

interface RejectionModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

const RejectionModal = ({
  show,
  onHide,
  onSubmit,
  isLoading = false,
}: RejectionModalProps) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    onSubmit(reason);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton>
        <div className="d-flex align-items-center">
          <IconifyIcon
            icon="mdi:alert-circle-outline"
            className="me-2 fs-4 text-danger"
          />
          <h5 className="mb-0">Reject Restaurant</h5>
        </div>
      </ModalHeader>
      <ModalBody>
        <Form.Group>
          <Form.Label>Reason for rejection</Form.Label>

          <FormControl
            as={"textarea"}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide the reason for rejection..."
            className="border rounded"
            rows={5}
            id="message"
          />
        </Form.Group>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          disabled={isLoading || !reason.trim()}
          className="d-flex align-items-center gap-2"
        >
          <span>{isLoading ? "Submitting..." : "Submit Rejection"}</span>
          {isLoading && <Spinner size="sm" color="#FFFFFF" />}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RejectionModal;
