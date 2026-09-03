"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

type ConfirmationOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: string;
  cancelVariant?: string;
  icon?: string;
};

type ConfirmationControl = {
  close: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
};

type ConfirmationContextType = (
  options: ConfirmationOptions
) => Promise<{ accepted: boolean; control: ConfirmationControl }>;

const ConfirmationContext = createContext<ConfirmationContextType>(() => {
  throw new Error("Confirmation context not initialized");
});

export const DeleteConfirmationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [modalOptions, setModalOptions] = useState<ConfirmationOptions | null>(
    null
  );
  const [resolveFn, setResolveFn] = useState<
    | ((result: { accepted: boolean; control: ConfirmationControl }) => void)
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm: ConfirmationContextType = useCallback((options) => {
    setModalOptions(options);
    setIsLoading(false);
    return new Promise((resolve) => {
      setResolveFn(() => resolve);
    });
  }, []);

  const close = () => {
    setModalOptions(null);
    setIsLoading(false);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleCancel = () => {
    close();
    resolveFn?.({ accepted: false, control: { close, setLoading, isLoading } });
  };

  const handleConfirm = () => {
    resolveFn?.({ accepted: true, control: { close, setLoading, isLoading } });
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmationModal
        show={!!modalOptions}
        onHide={handleCancel}
        onConfirm={handleConfirm}
        title={modalOptions?.title || "Are you sure?"}
        message={modalOptions?.message || ""}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        confirmVariant={modalOptions?.confirmVariant}
        cancelVariant={modalOptions?.cancelVariant}
        icon={modalOptions?.icon}
        isLoading={isLoading}
      />
    </ConfirmationContext.Provider>
  );
};

export const useDeleteConfirmationContext = () =>
  useContext(ConfirmationContext);
