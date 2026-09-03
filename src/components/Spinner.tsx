import React from "react";

type SpinnerProps = {
  tag?: React.ElementType;
  className?: string;
  wrapperClass?: string;
  size?: "lg" | "md" | "sm";
  type?: "bordered" | "grow";
  color?: string;
  children?: React.ReactNode;
  fullCentered?: boolean;
  title?: string;
};

const Spinner = ({
  tag = "div",
  type = "bordered",
  className,
  wrapperClass,
  color,
  size,
  children,
  fullCentered = false,
  title,
}: SpinnerProps) => {
  const Tag: React.ElementType = tag;

  const spinnerElement = (
    <Tag
      role="status"
      className={`${type === "bordered" ? "spinner-border" : type === "grow" ? "spinner-grow" : ""} ${
        color ? `text-${color}` : "text-primary"
      } ${size ? "thumb-" + size : ""} ${className ?? ""}`}
    >
      {children}
    </Tag>
  );

  // Inner content: spinner + optional title horizontally aligned
  const inlineContent = (
    <div className={`d-flex align-items-center`}>
      {spinnerElement}
      {title ? <span className="ms-2">{title}</span> : null}
    </div>
  );

  // Preserve original wrapperClass placement/behavior
  return fullCentered ? (
    <div
      className={`d-flex vh-100 justify-content-center align-items-center ${wrapperClass ?? ""}`}
    >
      {inlineContent}
    </div>
  ) : (
    <div
      className={`${wrapperClass ?? ""} ${title ? "d-inline-flex align-items-center" : ""}`}
    >
      {/* When not centered, still keep spinner and title inline */}
      {spinnerElement}
      {title ? <span className="ms-2">{title}</span> : null}
    </div>
  );
};

export default Spinner;
