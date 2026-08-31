"use client";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { SPINNER_DEFAULT_CLASS } from "@/constant/global.constant";
import type { CURDModalMode } from "@/types/crud.type";

interface DetailsModalProps<T> {
  show: boolean;
  onHide: () => void;
  item?: T;
  mode: CURDModalMode;
  isLoading?: boolean;
  error?: Error | null;
  onSuccess: () => void;
  viewComponent: React.ComponentType<{
    item: T;
  }>;
  formComponent: React.ComponentType<{
    item: T | undefined;
    onCancel: () => void;
    onSuccess: () => void;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formComponentProps?: Record<string, any>;
  entityName?: string;
  viewEditMode?: boolean;
  modalSize?: "sm" | "lg" | "xl";
  fullscreen?: string | true | undefined;
}

export const DetailsModal = <T extends object | number>({
  show,
  onHide,
  item,
  mode,
  isLoading,
  error,
  onSuccess,
  viewComponent: ViewComponent,
  formComponent: FormComponent,
  formComponentProps = {},
  entityName = "Item",
  viewEditMode = false,
  modalSize = "xl",
  fullscreen,
}: DetailsModalProps<T>) => {
  const [currentMode, setCurrentMode] = useState<CURDModalMode>(mode);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentMode(mode);
  }, [mode]);

  if (mode === "create") {
    return (
      <Modal
        show={show}
        onHide={onHide}
        size={modalSize}
        fullscreen={fullscreen}
        centered
      >
        <ModalHeader closeButton>
          <h5 className="modal-title">Create New {entityName}</h5>
        </ModalHeader>
        <ModalBody>
          <FormComponent
            {...formComponentProps}
            item={undefined}
            onCancel={onHide}
            onSuccess={() => {
              onSuccess();
              onHide();
            }}
          />
        </ModalBody>
      </Modal>
    );
  }

  if (error && show)
    return <ErrorMessage message={error.message || "Failed to load details"} />;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={modalSize}
      fullscreen={fullscreen}
      centered
      enforceFocus={false}
      restoreFocus={false}
    >
      <ModalHeader closeButton>
        <h5 className="modal-title">
          {currentMode === "edit"
            ? `Edit ${entityName}`
            : `${entityName} Details`}{" "}
          - {entityName}
        </h5>
      </ModalHeader>
      <ModalBody>
        {isLoading ? (
          <Spinner
            wrapperClass={`${SPINNER_DEFAULT_CLASS} h-100`}
            className="mt-8"
          />
        ) : (
          <>
            {currentMode === "view" && item ? (
              <ViewComponent item={item} />
            ) : (
              item && (
                <FormComponent
                  item={item}
                  onCancel={() =>
                    viewEditMode ? setCurrentMode("view") : onHide()
                  }
                  onSuccess={() => {
                    onSuccess();
                    if (viewEditMode) setCurrentMode("view");
                    else onHide();
                  }}
                  {...formComponentProps}
                />
              )
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};
