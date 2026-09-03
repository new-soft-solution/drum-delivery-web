"use client";
import { Button } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface ErrorMessageProps {
  message: string;
  retryFn?: () => void;
  className?: string;
}

const ErrorMessage = ({
  message,
  retryFn,
  className = "",
}: ErrorMessageProps) => {
  return (
    <div className={`text-center p-1 ${className}`}>
      <div>
        <IconifyIcon
          icon="material-symbols:error-outline"
          className="text-danger"
          width={24}
          height={24}
        />
      </div>
      <div className="text-muted mb-1">{message}</div>

      {retryFn && (
        <Button
          variant="outline-primary"
          onClick={retryFn}
          className="d-inline-flex align-items-center gap-2"
        >
          <IconifyIcon icon="material-symbols:refresh" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
