"use client";
import React from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div className="d-flex align-items-center gap-3">
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "linear-gradient(135deg, #203975, #203975cc)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconifyIcon
            icon={icon}
            width={22}
            height={22}
            style={{ color: "#fff" }}
          />
        </div>
        <div>
          <h4 className="mb-0 fw-bold">{title}</h4>
          {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
        </div>
      </div>
      {children && (
        <div className="d-flex align-items-center gap-2">{children}</div>
      )}
    </div>
  );
};

export default PageHeader;
