import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ToastBody, ToastHeader } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";
import ToastContainer, { ToastPosition } from "react-bootstrap/ToastContainer";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { ChildrenType } from "@/types/component-props.type";
import type {
  NotificationContextType,
  ShowNotificationType,
  ToastrProps,
} from "@/types/context.type";
import type { BootstrapVariantType } from "@/types/component-props.type";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Long-enough default so users can actually READ the message,
// especially for backend validation errors (e.g. "Invalid status
// transition from X to Y. Allowed transitions: ..."). Hover pauses
// the timer entirely, so long-form errors stay put while inspected.
const DEFAULT_DELAY = 6000;
const MIN_DELAY = 5000;

interface ExtendedToastrProps extends ToastrProps {
  position?: ToastPosition;
}

// Map a Bootstrap variant to the icon and accent colour used for the
// visual affordance strip on the left of the toast. Falls back to a
// neutral info style when the variant isn't in the map.
const VARIANT_META: Record<
  string,
  { icon: string; accent: string; textOnBg: boolean }
> = {
  success: { icon: "mdi:check-circle", accent: "#16a34a", textOnBg: true },
  danger: { icon: "mdi:alert-circle", accent: "#dc2626", textOnBg: true },
  warning: { icon: "mdi:alert", accent: "#d97706", textOnBg: false },
  info: { icon: "mdi:information", accent: "#0ea5e9", textOnBg: true },
  primary: { icon: "mdi:information", accent: "#2563eb", textOnBg: true },
  dark: { icon: "mdi:information", accent: "#111827", textOnBg: true },
  light: { icon: "mdi:information", accent: "#6b7280", textOnBg: false },
};

function Toastr({
  show,
  title,
  message,
  onClose,
  variant = "light",
  delay = DEFAULT_DELAY,
  position = "top-end",
}: Readonly<ExtendedToastrProps>) {
  const effectiveDelay = Math.max(delay, MIN_DELAY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(effectiveDelay);
  const startRef = useRef<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = useCallback(
    (ms: number) => {
      clearTimer();
      startRef.current = Date.now();
      remainingRef.current = ms;
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, ms);
    },
    [onClose],
  );

  useEffect(() => {
    if (show) {
      setIsPaused(false);
      startTimer(effectiveDelay);
    } else {
      clearTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, effectiveDelay]);

  const pause = () => {
    if (!show || isPaused) return;
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    clearTimer();
    setIsPaused(true);
  };

  const resume = () => {
    if (!show || !isPaused) return;
    setIsPaused(false);
    startTimer(remainingRef.current || effectiveDelay);
  };

  const meta = VARIANT_META[variant] ?? VARIANT_META.light;
  const isColoredBody = ["dark", "danger", "success", "primary", "info"].includes(
    variant,
  );

  return (
    <ToastContainer position={position} className="p-3" style={{ zIndex: 1080 }}>
      <Toast
        show={show}
        onClose={onClose}
        autohide={false}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        className="shadow-lg border-0"
        style={{
          minWidth: 340,
          maxWidth: 420,
          borderLeft: `4px solid ${meta.accent}`,
          overflow: "hidden",
        }}
      >
        {title && (
          <ToastHeader
            closeButton
            className="border-0"
            style={{
              gap: 8,
              paddingTop: "0.6rem",
              paddingBottom: "0.4rem",
            }}
          >
            <IconifyIcon
              icon={meta.icon}
              style={{
                color: meta.accent,
                fontSize: "1.15rem",
                flexShrink: 0,
              }}
            />
            <strong className="me-auto" style={{ fontSize: "0.95rem" }}>
              {title}
            </strong>
          </ToastHeader>
        )}
        <ToastBody
          className={isColoredBody && !title ? "text-white" : ""}
          style={{
            backgroundColor: title ? undefined : meta.accent,
            paddingTop: title ? "0.35rem" : "0.75rem",
            paddingBottom: "0.75rem",
            fontSize: "0.9rem",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {message}
        </ToastBody>
      </Toast>
    </ToastContainer>
  );
}

export function useNotificationContext() {
  const context = use(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within an NotificationProvider",
    );
  }
  return context;
}

export function NotificationProvider({ children }: ChildrenType) {
  const defaultConfig: ExtendedToastrProps = {
    show: false,
    message: "",
    title: "",
    delay: DEFAULT_DELAY,
    position: "top-end",
  };

  const [config, setConfig] = useState<ExtendedToastrProps>(defaultConfig);

  const hideNotification = () => {
    setConfig((prev) => ({ ...prev, show: false }));
  };

  const showNotification = ({
    title,
    message,
    variant,
    delay = DEFAULT_DELAY,
    position = "top-end",
  }: ShowNotificationType & { position?: ToastPosition }) => {
    const effectiveDelay = Math.max(delay, MIN_DELAY);

    setConfig({
      show: true,
      title,
      message,
      variant: (variant ?? "light") as BootstrapVariantType,
      onClose: hideNotification,
      delay: effectiveDelay,
      position,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <Toastr {...config} />
      {children}
    </NotificationContext.Provider>
  );
}
