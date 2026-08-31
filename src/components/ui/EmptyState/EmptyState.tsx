"use client";
import React from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "ri:inbox-line",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="text-center py-5 px-3">
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(0, 128, 113, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem",
        }}
      >
        <IconifyIcon icon={icon} width={28} height={28} style={{ color: "#008071" }} />
      </div>
      <h6 className="mb-1 fw-semibold">{title}</h6>
      {description && <p className="text-muted small mb-3">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
