import { JSX } from "react";

export default function DetailRow({
  icon = "",
  label,
  value,
}: {
  icon?: string;
  label: string;
  value: JSX.Element | string | number;
}) {
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center">
        <i className={`${icon} text-muted me-2`}></i>
        <h6 className="mb-0 text-muted" style={{ minWidth: "100px" }}>
          {label}:
        </h6>
        <span className="text-body fw-medium ms-2">{value}</span>
      </div>
    </div>
  );
}
