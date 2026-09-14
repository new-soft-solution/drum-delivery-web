"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export const QUICK_ORDER_STEPS = [
  "Order",
  "Drums",
  "Shipment",
  "Truck Delivery",
] as const;

interface QuickOrderStepperProps {
  current: number;
  furthest: number;
  onStepClick: (index: number) => void;
}

export const QuickOrderStepper = ({
  current,
  furthest,
  onStepClick,
}: QuickOrderStepperProps) => {
  return (
    <div className="d-flex align-items-center">
      {QUICK_ORDER_STEPS.map((label, i) => {
        const isCompleted = i < furthest;
        const isCurrent = i === current;
        const isClickable = i <= furthest;

        return (
          <div
            key={label}
            className="d-flex align-items-center"
            style={{ flex: i < QUICK_ORDER_STEPS.length - 1 ? 1 : undefined }}
          >
            <button
              type="button"
              onClick={() => isClickable && onStepClick(i)}
              disabled={!isClickable}
              className="d-flex align-items-center gap-2 border-0 bg-transparent p-0"
              style={{ cursor: isClickable ? "pointer" : "default" }}
            >
              <span
                className="d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isCompleted
                    ? "#203975"
                    : isCurrent
                      ? "#eaf0ff"
                      : "#f1f2f5",
                  color: isCompleted
                    ? "#fff"
                    : isCurrent
                      ? "#203975"
                      : "#9aa0ac",
                  border: isCurrent ? "2px solid #203975" : "none",
                }}
              >
                {isCompleted ? (
                  <IconifyIcon icon="ri:check-line" width={16} height={16} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`small fw-semibold ${isCurrent ? "text-dark" : isCompleted ? "text-dark" : "text-muted"}`}
              >
                {label}
              </span>
            </button>
            {i < QUICK_ORDER_STEPS.length - 1 && (
              <div
                className="flex-grow-1 mx-2"
                style={{
                  height: 2,
                  background: i < furthest ? "#203975" : "#e5e7eb",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuickOrderStepper;
