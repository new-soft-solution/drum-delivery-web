"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface ConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: string;
  cancelVariant?: string;
  icon?: string;
  isLoading?: boolean;
}

const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  cancelVariant = "secondary",
  icon = "mdi:alert-circle-outline",
  isLoading = false,
}: ConfirmationModalProps) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop={isLoading ? "static" : true}
    >
      <ModalHeader closeButton>
        <div className="d-flex align-items-center">
          {icon && (
            <IconifyIcon icon={icon} className="me-2 fs-4 text-danger" />
          )}
          <h5 className="mb-0 text-white">{title}</h5>
        </div>
      </ModalHeader>
      <ModalBody>
        <p>{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant={cancelVariant} onClick={onHide} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              {confirmText}
            </>
          ) : (
            confirmText
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
